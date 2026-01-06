// Firebase 統一匯出模組
import { firebaseConfig } from '../src/app/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import * as AuthModule from './authentication.js';
import * as FirestoreModule from './firestore.js';

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 設置認證持久化
import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js').then(({ setPersistence, browserLocalPersistence }) => {
    return setPersistence(auth, browserLocalPersistence);
}).then(() => {
    console.log('Firebase Auth 持久化已設置');
}).catch(error => {
    console.error('設置 Auth 持久化失敗:', error);
});

// 匯出認證和 Firestore 模組
export const firebaseAuth = {
    auth,
    ...AuthModule
};

export const firebaseFirestore = {
    db,
    ...FirestoreModule
};

export { app, auth, db };
