import { 
  collection, 
  doc, 
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
import { Appointment } from '../types';
import { MOCK_APPOINTMENTS } from '../data';

const APPOINTMENTS_COLLECTION = 'appointments';

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const data = {
    ...appointmentData,
    status: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), data);
  return docRef.id;
};

export const getAppointments = async (filters: { userId?: string; propertyId?: string } = {}) => {
  try {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (filters.userId) constraints.push(where('userId', '==', filters.userId));
    if (filters.propertyId) constraints.push(where('propertyId', '==', filters.propertyId));
    
    const q = query(collection(db, APPOINTMENTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment);
    });

    if (appointments.length > 0) {
      return appointments;
    }
  } catch (error) {
    console.warn('Aviso: Não foi possível obter agendamentos do Firestore (usando demonstração local):', error);
  }

  let fallback = [...MOCK_APPOINTMENTS];
  if (filters.userId) fallback = fallback.filter(a => a.userId === filters.userId);
  if (filters.propertyId) fallback = fallback.filter(a => a.propertyId === filters.propertyId);
  return fallback;
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Aviso: Atualização de status de visita em modo local:', error);
  }
};
