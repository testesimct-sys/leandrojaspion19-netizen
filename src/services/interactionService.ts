import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Interaction } from '../types';

const INTERACTIONS_COLLECTION = 'interactions';

export const addInteraction = async (interactionData: Omit<Interaction, 'id' | 'createdAt'>) => {
  const data = {
    ...interactionData,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, INTERACTIONS_COLLECTION), data);
  return docRef.id;
};

export const getInteractionsByLead = async (leadId: string) => {
  const q = query(
    collection(db, INTERACTIONS_COLLECTION), 
    where('leadId', '==', leadId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Interaction));
};

export const getInteractions = async (filters: { clientId?: string; leadId?: string }) => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  
  if (filters.clientId) constraints.push(where('clientId', '==', filters.clientId));
  if (filters.leadId) constraints.push(where('leadId', '==', filters.leadId));
  
  const q = query(collection(db, INTERACTIONS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  
  const interactions: Interaction[] = [];
  querySnapshot.forEach((doc) => {
    interactions.push({ id: doc.id, ...doc.data() } as Interaction);
  });
  return interactions;
};
