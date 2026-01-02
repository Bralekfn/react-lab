import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, Timestamp } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { type File } from '../data/templates';
import { compressFiles, decompressFiles } from '../utils/url-compression';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

interface SharedSnippet {
  code: string; // Compressed code
  createdAt: Timestamp;
  userId?: string;
}

// Generate a random 6-character alphanumeric ID
function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function saveSnippet(files: Record<string, File>): Promise<string> {
  try {
    const compressed = compressFiles(files);
    
    // We'll use a custom ID generation strategy or let Firestore generate one and map it?
    // Requirement says "Generate a unique short ID".
    // Firestore auto-IDs are long. We want short ones.
    // Strategy: Generate short ID, check uniqueness, create document.
    // For simplicity in this demo, we'll try once, if collision (rare with 6 chars for small scale), we could retry.
    // Ideally we would set the document ID to the short ID.
    
    let shortId = generateShortId();
    let retries = 3;
    
    while (retries > 0) {
      const docRef = doc(db, 'sharedSnippets', shortId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await import('firebase/firestore').then(({ setDoc }) => {
            return setDoc(docRef, {
                code: compressed,
                createdAt: Timestamp.now()
            });
        });
        return shortId;
      }
      
      shortId = generateShortId();
      retries--;
    }
    
    throw new Error('Failed to generate unique ID');
  } catch (error) {
    console.error('Error saving snippet:', error);
    throw error;
  }
}

export async function getSnippet(id: string): Promise<Record<string, File> | null> {
  try {
    const docRef = doc(db, 'sharedSnippets', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SharedSnippet;
      return decompressFiles(data.code);
    }
    return null;
  } catch (error) {
    console.error('Error fetching snippet:', error);
    return null;
  }
}
