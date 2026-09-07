import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CRMTask, TaskStatus } from '../types';

export const getTasks = async (userId: string, isAdmin: boolean = false) => {
  let q;
  if (isAdmin) {
    q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'));
  } else {
    q = query(
      collection(db, 'tasks'), 
      where('assignedTo', '==', userId),
      orderBy('dueDate', 'asc')
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    return Object.assign({ id: doc.id }, doc.data()) as CRMTask;
  });
};

export const createTask = async (task: Omit<CRMTask, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'tasks'), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'tasks', taskId));
};
