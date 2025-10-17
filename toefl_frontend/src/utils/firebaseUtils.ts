import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Mandatory Global Variables from Canvas Environment ---
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig: any = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken: string = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
// --------------------------------------------------------

// 1. Initialize Firebase App and Services
let app: any;
let auth: any;
let storage: any;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);

    // 2. Mandatory Authentication Logic
    const initializeAuth = async () => {
        try {
            if (initialAuthToken) {
                // Sign in using the custom auth token provided by the Canvas environment
                await signInWithCustomToken(auth, initialAuthToken);
                console.log(`Firebase: Signed in successfully with provided token for user: ${auth.currentUser?.uid}`);
            } else {
                // Fallback to anonymous sign-in if no token is available
                await signInAnonymously(auth);
                console.log(`Firebase: Signed in anonymously for user: ${auth.currentUser?.uid}`);
            }
        } catch (error) {
            console.error("Firebase Auth initialization failed:", error);
        }
    };
    
    // Initialize Auth immediately
    initializeAuth();

} catch (error) {
    console.error("Firebase App initialization failed:", error);
}

/**
 * Uploads an audio Blob to Firebase Storage.
 * * @param audioBlob The Blob containing the recorded audio data.
 * @param userId The ID of the current user (used for pathing).
 * @returns A Promise that resolves to the public download URL of the uploaded file.
 */
export const uploadAudioToStorage = async (audioBlob: Blob, userId: string): Promise<string> => {
    if (!storage) {
        console.error("Firebase Storage is not initialized.");
        return Promise.reject("Storage initialization failed.");
    }
    
    // Create a unique file name and path
    const timestamp = Date.now();
    const fileName = `recording-${timestamp}.webm`;
    
    // Storage path structure: /artifacts/{appId}/users/{userId}/audio_recordings/{fileName}
    // Note: 'audio_recordings' is a custom collection name within the user's private data path.
    const storagePath = `artifacts/${appId}/users/${userId}/audio_recordings/${fileName}`;
    const storageRef = ref(storage, storagePath);

    try {
        // Upload the blob
        const snapshot = await uploadBytes(storageRef, audioBlob, {
            contentType: 'audio/webm' // Assuming webm format from MediaRecorder
        });

        // Get the public download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Audio uploaded successfully. URL:", downloadURL);
        return downloadURL;

    } catch (error) {
        console.error("Error uploading audio to Firebase Storage:", error);
        return Promise.reject(`Upload failed: ${error}`);
    }
};

// Export services (optional, but good practice if other components need them)
export { auth, storage };
