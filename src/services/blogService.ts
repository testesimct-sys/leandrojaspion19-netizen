import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BlogPost, BlogPostStatus } from '../types';

const BLOG_COLLECTION = 'blog';

export const getBlogPosts = async (status?: BlogPostStatus) => {
  try {
    let q = query(collection(db, BLOG_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(collection(db, BLOG_COLLECTION), where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const posts: BlogPost[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as BlogPost);
    });
    return posts;
  } catch (error) {
    console.warn('Erro ao buscar posts do blog:', error);
    return [];
  }
};

export const getPostById = async (id: string) => {
  try {
    const docRef = doc(db, BLOG_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    return null;
  } catch (error) {
    console.warn('Erro ao buscar post por ID:', error);
    return null;
  }
};

export const getPostBySlug = async (slug: string) => {
  try {
    const q = query(collection(db, BLOG_COLLECTION), where('slug', '==', slug), where('status', '==', 'PUBLISHED'));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BlogPost;
    }
    return null;
  } catch (error) {
    console.warn('Erro ao buscar post por slug:', error);
    return null;
  }
};

export const createPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
  const data = {
    ...postData,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, BLOG_COLLECTION), data);
  return docRef.id;
};

export const updatePost = async (id: string, postData: Partial<BlogPost>) => {
  const docRef = doc(db, BLOG_COLLECTION, id);
  await updateDoc(docRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  });
};

export const deletePost = async (id: string) => {
  const docRef = doc(db, BLOG_COLLECTION, id);
  await deleteDoc(docRef);
};
