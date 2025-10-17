// toefl_frontend/src/firebase.ts

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // 导入 Firestore 备用

// 注意：在 Vite 中，环境变量是通过 import.meta.env 读取的，且必须以 VITE_ 开头。
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // 确保所有必需的配置项都在这里
};

// 1. 初始化 Firebase 应用
const firebaseApp = initializeApp(firebaseConfig);

// 2. 导出需要的服务实例
// uploadAudioToStorage 函数需要用到这个 storage 实例
export const storage = getStorage(firebaseApp); 
export const db = getFirestore(firebaseApp); 

// 如果您没有用到认证，不需要导出
// export const auth = getAuth(firebaseApp);