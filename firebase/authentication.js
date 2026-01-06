// Firebase Authentication 封裝
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// 創建 Google 認證提供者
const CreateGoogleProvider = () => {
    return new GoogleAuthProvider();
};

// Google 登入
const SignInWithGoogle = async (auth, provider) => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Google 登入失敗:', error);
        throw error;
    }
};

// 登出
const SignOut = async (auth) => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('登出失敗:', error);
        throw error;
    }
};

// 監聽認證狀態變更
const OnAuthStateChanged = (auth, callback) => {
    return onAuthStateChanged(auth, callback);
};

export {
    CreateGoogleProvider,
    SignInWithGoogle,
    SignOut,
    OnAuthStateChanged
};
