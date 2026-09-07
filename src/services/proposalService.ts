import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Proposal, ProposalStatus } from '../types';

export const getProposals = async (leadId?: string) => {
  let q = query(collection(db, 'proposals'), orderBy('createdAt', 'desc'));
  
  if (leadId) {
    q = query(
      collection(db, 'proposals'), 
      where('leadId', '==', leadId),
      orderBy('createdAt', 'desc')
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
};

export const createProposal = async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'proposals'), {
    ...proposal,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Also update lead status if needed
  const leadRef = doc(db, 'leads', proposal.leadId);
  await updateDoc(leadRef, {
    status: 'PROPOSAL',
    updatedAt: serverTimestamp()
  });

  return docRef.id;
};

export const updateProposalStatus = async (proposalId: string, status: ProposalStatus) => {
  const proposalRef = doc(db, 'proposals', proposalId);
  await updateDoc(proposalRef, {
    status,
    updatedAt: serverTimestamp()
  });
};
