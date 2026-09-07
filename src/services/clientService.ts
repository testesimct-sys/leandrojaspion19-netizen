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
import { Client } from '../types';

const CLIENTS_COLLECTION = 'clients';

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
  const data = {
    ...clientData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), data);
  return docRef.id;
};

export const getClients = async (assignedTo?: string) => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (assignedTo) {
    constraints.push(where('assignedTo', '==', assignedTo));
  }
  
  const q = query(collection(db, CLIENTS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  
  const clients: Client[] = [];
  querySnapshot.forEach((doc) => {
    clients.push({ id: doc.id, ...doc.data() } as Client);
  });
  return clients;
};

export const getClientById = async (id: string): Promise<Client | null> => {
  const docRef = doc(db, CLIENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Client;
  }
  return null;
};
