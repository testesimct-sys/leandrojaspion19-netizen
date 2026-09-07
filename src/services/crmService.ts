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
import { MOCK_LEADS } from '../data';

export const getOpportunities = async () => {
  try {
    const q = query(
      collection(db, 'leads'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    if (leads.length > 0) {
      return leads;
    }
  } catch (error) {
    console.warn('Aviso: Não foi possível obter oportunidades do CRM no Firestore (usando dados locais):', error);
  }
  return [...MOCK_LEADS];
};

export const updateOpportunityStatus = async (
  leadId: string, 
  status: LeadStatus, 
  userId: string, 
  userName: string
) => {
  try {
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
  } catch (error) {
    console.warn('Aviso ao atualizar etapa de oportunidade:', error);
  }
};

export const updateOpportunityPriority = async (
  leadId: string, 
  priority: OpportunityPriority,
  userId: string,
  userName: string
) => {
  try {
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
  } catch (error) {
    console.warn('Aviso ao atualizar prioridade de oportunidade:', error);
  }
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
