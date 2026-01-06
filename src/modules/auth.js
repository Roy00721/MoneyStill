// 認證業務邏輯模組
import { firebaseAuth } from '../../firebase/index.js';

// 認證狀態管理
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.isInitialized = false;
    }

    // 初始化認證監聽器
    Initialize = () => {
        if (this.isInitialized) {
            return;
        }

        const { auth, OnAuthStateChanged } = firebaseAuth;
        
        OnAuthStateChanged(auth, (user) => {
            console.log('認證狀態變更:', user ? `已登入 (${user.displayName})` : '未登入');
            this.currentUser = user;
            this.notifyListeners(user);
        });

        this.isInitialized = true;
        console.log('認證管理器已初始化');
    }

    // 註冊認證狀態監聽器
    OnAuthStateChange = (callback) => {
        this.authStateListeners.push(callback);
        // 立即執行一次，傳遞當前用戶狀態
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    // 通知所有監聽器
    notifyListeners = (user) => {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('認證狀態監聽器執行失敗:', error);
            }
        });
    }

    // Google 登入
    SignIn = async () => {
        try {
            const { auth, CreateGoogleProvider, SignInWithGoogle } = firebaseAuth;
            const provider = CreateGoogleProvider();
            const user = await SignInWithGoogle(auth, provider);
            console.log('登入成功:', user.displayName);
            return user;
        } catch (error) {
            console.error('登入失敗:', error);
            
            // 根據錯誤類型提供友善的錯誤訊息
            let errorMessage = '登入失敗';
            if (error.code === 'auth/popup-blocked') {
                errorMessage = '彈窗被瀏覽器阻止，請允許彈窗後重試';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = '登入已取消';
            } else if (error.code === 'auth/invalid-api-key') {
                errorMessage = 'Firebase API 金鑰無效，請檢查配置';
            } else {
                errorMessage = `登入失敗: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }

    // 登出
    SignOut = async () => {
        try {
            const { auth, SignOut: FirebaseSignOut } = firebaseAuth;
            await FirebaseSignOut(auth);
            console.log('已登出');
        } catch (error) {
            console.error('登出失敗:', error);
            throw error;
        }
    }

    // 取得當前用戶
    GetCurrentUser = () => {
        return this.currentUser;
    }

    // 檢查是否已登入
    IsAuthenticated = () => {
        return this.currentUser !== null;
    }
}

// 創建單例
const authManager = new AuthManager();

// 初始化
authManager.Initialize();

export default authManager;

