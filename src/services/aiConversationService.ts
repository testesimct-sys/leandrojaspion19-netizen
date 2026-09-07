import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AIConversation, AIMessage } from '../types';

export const createAIConversation = async (conversation: Omit<AIConversation, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Clean undefined values (like userId if not logged in)
  const data = JSON.parse(JSON.stringify(conversation));
  
  const docRef = await addDoc(collection(db, 'aiConversations'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getAIConversation = async (id: string) => {
  const docRef = doc(db, 'aiConversations', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as AIConversation;
  }
  return null;
};

export const addAIMessage = async (message: Omit<AIMessage, 'id' | 'createdAt'>) => {
  // Clean undefined values
  const data = JSON.parse(JSON.stringify(message));

  const docRef = await addDoc(collection(db, 'aiMessages'), {
    ...data,
    createdAt: serverTimestamp()
  });
  
  // Update last message in conversation
  const convRef = doc(db, 'aiConversations', message.conversationId);
  await updateDoc(convRef, {
    lastMessage: typeof message.content === 'string' ? message.content.substring(0, 100) : 'Mensagem do sistema',
    updatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const getAIConversationMessages = async (conversationId: string) => {
  const q = query(
    collection(db, 'aiMessages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIMessage));
};

export const updateAIConversationStatus = async (id: string, status: AIConversation['status'], summary?: string) => {
  const docRef = doc(db, 'aiConversations', id);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp()
  };
  if (summary) updateData.summary = summary;
  await updateDoc(docRef, updateData);
};
