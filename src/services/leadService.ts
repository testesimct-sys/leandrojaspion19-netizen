import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Lead } from '../types';

const LEADS_COLLECTION = 'leads';

export const createLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const data = {
    ...leadData,
    status: 'NEW',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, LEADS_COLLECTION), data);
  return docRef.id;
};

export const getLeads = async (assignedTo?: string) => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (assignedTo) {
    constraints.push(where('assignedTo', '==', assignedTo));
  }
  
  const q = query(collection(db, LEADS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  
  const leads: Lead[] = [];
  querySnapshot.forEach((doc) => {
    leads.push({ id: doc.id, ...doc.data() } as Lead);
  });
  return leads;
};

export const updateLeadStatus = async (id: string, status: Lead['status']) => {
  const docRef = doc(db, LEADS_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};
