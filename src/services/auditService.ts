import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuditLog } from '../types';

const AUDIT_COLLECTION = 'auditLogs';

export const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
  try {
    const data = {
      ...logData,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, AUDIT_COLLECTION), data);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

export const getAuditLogs = async (limitCount = 50) => {
  const q = query(
    collection(db, AUDIT_COLLECTION), 
    orderBy('timestamp', 'desc'), 
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  const logs: AuditLog[] = [];
  querySnapshot.forEach((doc) => {
    logs.push({ id: doc.id, ...doc.data() } as AuditLog);
  });
  return logs;
};
