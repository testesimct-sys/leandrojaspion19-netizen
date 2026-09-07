import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Favorite } from '../types';

const FAVORITES_COLLECTION = 'favorites';

export const toggleFavorite = async (userId: string, propertyId: string) => {
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where('userId', '==', userId), 
    where('propertyId', '==', propertyId)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Remove if exists
    const favoriteDoc = querySnapshot.docs[0];
    await deleteDoc(doc(db, FAVORITES_COLLECTION, favoriteDoc.id));
    return false; // Removed
  } else {
    // Add if not exists
    await addDoc(collection(db, FAVORITES_COLLECTION), {
      userId,
      propertyId,
      createdAt: serverTimestamp(),
    });
    return true; // Added
  }
};

export const getUserFavorites = async (userId: string) => {
  const q = query(
    collection(db, FAVORITES_COLLECTION), 
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  
  const favorites: Favorite[] = [];
  querySnapshot.forEach((doc) => {
    favorites.push({ id: doc.id, ...doc.data() } as Favorite);
  });
  return favorites;
};
