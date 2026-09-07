import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Lead, LeadStatus, OpportunityPriority } from '../types';
import { createAuditLog } from './auditService';

export const getOpportunities = async () => {
  const q = query(
    collection(db, 'leads'),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
};

export const updateOpportunityStatus = async (
  leadId: string, 
  status: LeadStatus, 
  userId: string, 
  userName: string
) => {
  const leadRef = doc(db, 'leads', leadId);
  
  await updateDoc(leadRef, {
    status,
    updatedAt: serverTimestamp()
  });

  await createAuditLog({
    userId,
    userName,
    action: 'MUDANÇA_DE_ETAPA',
    entity: 'LEAD',
    entityId: leadId,
    details: `Etapa alterada para ${status}`
  });
};

export const updateOpportunityPriority = async (
  leadId: string, 
  priority: OpportunityPriority,
  userId: string,
  userName: string
) => {
  const leadRef = doc(db, 'leads', leadId);
  await updateDoc(leadRef, {
    priority,
    updatedAt: serverTimestamp()
  });

  await createAuditLog({
    userId,
    userName,
    action: 'ALTERAÇÃO_PRIORIDADE',
    entity: 'LEAD',
    entityId: leadId,
    details: `Prioridade alterada para ${priority}`
  });
};

export const getCRMStats = async () => {
  const leads = await getOpportunities();
  
  const stats = {
    newLeads: leads.filter(l => l.status === 'NEW').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
    open: leads.filter(l => l.status !== 'WON' && l.status !== 'LOST').length,
    won: leads.filter(l => l.status === 'WON').length,
    lost: leads.filter(l => l.status === 'LOST').length,
    totalPotentialValue: leads
      .filter(l => l.status !== 'WON' && l.status !== 'LOST')
      .reduce((acc, curr) => acc + (curr.potentialValue || 0), 0)
  };
  
  return stats;
};
