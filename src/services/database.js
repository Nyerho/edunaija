import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  // deleteDoc, // Remove unused import
  query, 
  orderBy, 
  where,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvQJKOHRiXkjmhgGGkGGkGGkGGkGGkGGk",
  authDomain: "edunaija-12345.firebaseapp.com",
  projectId: "edunaija-12345",
  storageBucket: "edunaija-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Database Operations
export const addResource = async (resourceData) => {
  try {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
      downloads: 0,
      views: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding resource:', error);
    throw error;
  }
};

export const getResources = async () => {
  try {
    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting resources:', error);
    throw error;
  }
};

export const searchResources = async (searchTerm, category = null) => {
  try {
    let q = collection(db, 'resources');
    
    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }
    
    const querySnapshot = await getDocs(q);
    const resources = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Client-side search filtering
    if (searchTerm) {
      return resources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return resources;
  } catch (error) {
    console.error('Error searching resources:', error);
    throw error;
  }
};

export const updateResourceStats = async (resourceId, statType) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceRef, {
      [statType]: increment(1)
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
};

// Helper function to save user data to Firestore
const saveUserToFirestore = async (user, additionalData = {}) => {
  try {
    // Check if user already exists
    const usersQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
    const existingUsers = await getDocs(usersQuery);
    
    if (existingUsers.empty) {
      // User doesn't exist, create new record
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        ...additionalData,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
};

// Authentication Functions
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add user data to Firestore
    await saveUserToFirestore(user, userData);
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save user data to Firestore (will only create if doesn't exist)
    await saveUserToFirestore(user, {
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      authProvider: 'google'
    });
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};