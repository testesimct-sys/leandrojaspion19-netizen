import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../types';

export const registerUser = async (name: string, email: string, password: string, role?: UserRole) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'leandrojaspion19@gmail.com';
    const assignedRole: UserRole = role || (isAdminEmail ? 'ADMIN' : 'CLIENTE');

    const userProfile: UserProfile = {
      id: user.uid,
      name,
      email,
      role: assignedRole,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return { user, profile: userProfile };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (signInErr: any) {
      // If user doesn't exist yet, automatically try to register for seamless onboarding
      if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
        const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'leandrojaspion19@gmail.com';
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          const userProfile: UserProfile = {
            id: user.uid,
            name: isAdminEmail ? 'Administrador Teste' : email.split('@')[0],
            email,
            role: isAdminEmail ? 'ADMIN' : 'CLIENTE',
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), userProfile);
          return { user, profile: userProfile };
        } catch (createErr) {
          throw signInErr;
        }
      }
      throw signInErr;
    }

    const user = userCredential.user;
    let profile = await getUserProfile(user.uid);
    
    // Auto-create or ensure admin role if profile is missing or is an admin email
    const isAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase() === 'leandrojaspion19@gmail.com';
    if (!profile) {
      const newProfile: UserProfile = {
        id: user.uid,
        name: isAdminEmail ? 'Administrador Teste' : (user.displayName || email.split('@')[0]),
        email: user.email || email,
        role: isAdminEmail ? 'ADMIN' : 'CLIENTE',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      profile = newProfile;
    } else if (isAdminEmail && profile.role !== 'ADMIN') {
      await setDoc(doc(db, 'users', user.uid), { role: 'ADMIN', updatedAt: serverTimestamp() }, { merge: true });
      profile.role = 'ADMIN';
    }

    return { user, profile };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    let profile = await getUserProfile(user.uid);

    const isAdminEmail = user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'leandrojaspion19@gmail.com';

    if (!profile) {
      const newProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'Usuário Google',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        role: isAdminEmail ? 'ADMIN' : 'CLIENTE',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      profile = newProfile;
    } else if (isAdminEmail && profile.role !== 'ADMIN') {
      await setDoc(doc(db, 'users', user.uid), { role: 'ADMIN', updatedAt: serverTimestamp() }, { merge: true });
      profile.role = 'ADMIN';
    }

    return { user, profile };
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  localStorage.removeItem('elite_test_admin');
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Firestore:', err);
  }
  return null;
};
