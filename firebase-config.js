// Firebase 配置
// 請前往 https://console.firebase.google.com/ 創建專案並獲取配置信息

const firebaseConfig = {
    apiKey: "AIzaSyC9ijV22yvjVrECJzyAq3WZSkwIf3fVQeo",
    authDomain: "moneystill-fa898.firebaseapp.com",
    projectId: "moneystill-fa898",
    storageBucket: "moneystill-fa898.firebasestorage.app",
    messagingSenderId: "112417421348",
    appId: "1:112417421348:web:7b6c9495b30447866940b1"
};

// 檢查配置是否已設置
function validateFirebaseConfig() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field =>
        !firebaseConfig[field] || firebaseConfig[field].includes('your-')
    );

    if (missingFields.length > 0) {
        console.warn('Firebase 配置未完成，請在 firebase-config.js 中設置正確的配置值');
        console.warn('缺失的字段:', missingFields.join(', '));
        return false;
    }
    return true;
}

// 檢查 Firebase 控制台設置
function checkFirebaseSetup() {
    console.log('🔍 Firebase 設置檢查:');
    console.log('1. 請確認以下設置是否正確：');
    console.log('   - Authentication > Sign-in method > Google 已啟用');
    console.log('   - Authentication > Settings > Authorized domains 包含:');
    console.log('     * localhost (用於本地開發)');
    console.log('     * 你的域名 (用於生產環境)');
    console.log('');
    console.log('2. 如果是本地開發，請確認:');
    console.log('   - 使用 http://localhost:8000 或 http://127.0.0.1:8000');
    console.log('   - 不要使用 file:// 協議');
    console.log('');
    console.log('3. 常見問題:');
    console.log('   - 彈窗被瀏覽器阻止');
    console.log('   - API 金鑰無效');
    console.log('   - 未授權的域名');
}

// 檢查 Firebase Console 設置
function diagnoseFirebaseSetup() {
    console.log('🔍 Firebase 設置診斷:');

    const issues = [];

    // 檢查域名
    const hostname = window.location.hostname;
    const port = window.location.port;
    const fullDomain = port ? `${hostname}:${port}` : hostname;

    console.log(`📍 當前域名: ${fullDomain}`);

    if (hostname === 'localhost') {
        if (!port || port !== '8000') {
            issues.push(`❌ 建議使用 http://localhost:8000 而不是 http://${fullDomain}`);
        }
    }

    // 檢查配置
    if (!firebaseConfig.authDomain.includes('firebaseapp.com')) {
        issues.push('❌ authDomain 可能不正確');
    }

    if (issues.length > 0) {
        console.log('🚨 發現問題:');
        issues.forEach(issue => console.log(issue));
    } else {
        console.log('✅ 基本設置看起來正確');
    }

    console.log('');
    console.log('🔧 Firebase Console 檢查清單:');
    console.log('1. Authentication → Settings → Authorized domains 包含:');
    console.log(`   - ${hostname} (如果沒有端口)`);
    console.log(`   - ${fullDomain} (如果有端口)`);
    console.log('2. Authentication → Sign-in method → Google 已啟用');
    console.log('3. Firestore Database 已建立');

    return issues.length === 0;
}

// 導出配置
export { firebaseConfig, validateFirebaseConfig, checkFirebaseSetup, diagnoseFirebaseSetup };
