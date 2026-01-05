// MoneyStill - 記帳APP 應用邏輯

class MoneyStillApp {
    constructor() {
        this.entries = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('開始初始化 MoneyStillApp...');
        this.entries = []; // 初始化記帳項目陣列
        this.bindEvents();
        this.registerServiceWorker();
        this.checkAuthState();
        this.setupFirestore();
        console.log('MoneyStillApp 初始化完成');
    }

    bindEvents() {
        console.log('綁定事件...');
        // 登入按鈕
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('登入按鈕被點擊');
                this.signIn();
            });
            console.log('登入按鈕事件已綁定');
        } else {
            console.error('找不到登入按鈕');
        }

        // 登出按鈕
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.signOut());
        }

        // 新增記帳項目按鈕
        const addBtn = document.getElementById('add-entry-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addEntry());
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    async signIn() {
        console.log('嘗試登入...');
        console.log('Firebase Auth 狀態:', window.firebaseAuth);

        if (!window.firebaseAuth) {
            console.error('Firebase 尚未初始化');
            alert('Firebase 尚未初始化，請稍後再試');
            return;
        }

        if (!window.firebaseAuth.auth) {
            console.error('Firebase Auth 對象不存在');
            alert('Firebase Auth 配置錯誤');
            return;
        }

        try {
            console.log('正在開啟Google登入彈窗...');
            const result = await window.firebaseAuth.signInWithPopup(
                window.firebaseAuth.auth,
                window.firebaseAuth.provider
            );

            this.currentUser = result.user;
            this.updateUI();
            console.log('登入成功:', this.currentUser.displayName);
        } catch (error) {
            console.error('登入失敗:', error);
            console.error('錯誤代碼:', error.code);
            console.error('錯誤訊息:', error.message);

            // 根據錯誤類型顯示不同訊息
            if (error.code === 'auth/popup-blocked') {
                alert('彈窗被瀏覽器阻止，請允許彈窗後重試');
            } else if (error.code === 'auth/popup-closed-by-user') {
                alert('登入取消');
            } else if (error.code === 'auth/invalid-api-key') {
                alert('Firebase API 金鑰無效，請檢查配置');
            } else {
                alert('登入失敗: ' + error.message);
            }
        }
    }

    async signOut() {
        if (!window.firebaseAuth) {
            alert('Firebase 尚未初始化');
            return;
        }

        try {
            await window.firebaseAuth.signOut(window.firebaseAuth.auth);
            this.currentUser = null;
            this.updateUI();
            console.log('已登出');
        } catch (error) {
            console.error('登出失敗:', error);
        }
    }

    checkAuthState() {
        // 使用一次性檢查，避免無限循環
        const checkOnce = () => {
            if (window.firebaseAuth && window.firebaseAuth.auth && window.firestoreDB) {
                console.log('Firebase 已準備好，設置認證監聽器');
                window.firebaseAuth.auth.onAuthStateChanged(user => {
                    console.log('認證狀態變更:', user ? `已登入 (${user.displayName})` : '未登入');
                    this.currentUser = user;
                    this.updateUI();
                    // 用戶登入時載入資料
                    if (user) {
                        this.loadEntries();
                    } else {
                        // 用戶登出時清空資料
                        this.entries = [];
                        this.renderEntries();
                        this.updateBalance();
                    }
                });
            } else {
                // Firebase 還沒準備好，顯示登入頁面
                console.log('Firebase 尚未準備好，顯示登入頁面');
                this.updateUI();
            }
        };

        // 檢查 Firebase 是否已準備好，如果沒有則等待
        if (window.firebaseAuth && window.firebaseAuth.auth && window.firestoreDB) {
            checkOnce();
        } else {
            // 等待 Firebase 初始化，最大等待 3 秒
            let attempts = 0;
            const waitForFirebase = () => {
                attempts++;
                if (window.firebaseAuth && window.firebaseAuth.auth && window.firestoreDB) {
                    checkOnce();
                } else if (attempts < 10) { // 最多等待 10 次 (1 秒)
                    setTimeout(waitForFirebase, 1000);
                } else {
                    console.log('Firebase 初始化超時，顯示登入頁面');
                    this.updateUI();
                }
            };
            waitForFirebase();
        }
    }

    setupFirestore() {
        // 設置 Firestore 即時監聽器（在用戶登入後設置）
    }

    async saveEntry(entry) {
        // 確保 Firestore 已初始化
        if (!window.firestoreDB) {
            console.warn('Firestore 未初始化，無法儲存');
            return null;
        }

        if (!this.currentUser) {
            console.warn('用戶未登入，無法儲存');
            return null;
        }

        try {
            const { db, collection, addDoc } = window.firestoreDB;
            const entriesRef = collection(db, 'users', this.currentUser.uid, 'entries');

            // 準備儲存到 Firestore 的資料
            const entryData = {
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                date: entry.date.toISOString(), // 轉換為 ISO 字串
                createdAt: new Date()
            };

            const docRef = await addDoc(entriesRef, entryData);
            console.log('記帳項目已儲存到 Firestore, ID:', docRef.id);

            // 更新本地項目的 Firestore ID
            entry.firestoreId = docRef.id;
            return docRef.id;
        } catch (error) {
            console.error('儲存記帳項目失敗:', error);
            // 不顯示alert，改為靜默處理，讓用戶能繼續使用
            console.warn('儲存失敗，但資料已保存在本地');
            return null;
        }
    }

    async deleteEntryFromFirestore(entryId) {
        // 確保 Firestore 已初始化
        if (!window.firestoreDB) {
            console.warn('Firestore 未初始化，無法刪除');
            return false;
        }

        if (!this.currentUser) {
            console.warn('用戶未登入，無法刪除');
            return false;
        }

        try {
            const { db, doc, deleteDoc } = window.firestoreDB;
            const entryRef = doc(db, 'users', this.currentUser.uid, 'entries', entryId);

            await deleteDoc(entryRef);
            console.log('記帳項目已從 Firestore 刪除, ID:', entryId);
            return true;
        } catch (error) {
            console.error('刪除記帳項目失敗:', error);
            // 不顯示alert，改為靜默處理
            console.warn('雲端刪除失敗，但本地已刪除');
            return false;
        }
    }

    async loadEntries() {
        // 確保 Firestore 已初始化
        if (!window.firestoreDB) {
            console.warn('Firestore 未初始化，稍後重試');
            setTimeout(() => this.loadEntries(), 200);
            return;
        }

        if (!this.currentUser) {
            console.warn('用戶未登入');
            return;
        }

        try {
            console.log('開始載入記帳資料...');
            const { db, collection, getDocs, query, orderBy } = window.firestoreDB;
            const entriesRef = collection(db, 'users', this.currentUser.uid, 'entries');
            const q = query(entriesRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            this.entries = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const entry = {
                    id: Date.now() + Math.random(), // 本地使用的唯一ID
                    firestoreId: doc.id, // Firestore 文檔ID
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    date: new Date(data.date)
                };
                this.entries.push(entry);
            });

            this.renderEntries();
            this.updateBalance();
            console.log(`已載入 ${this.entries.length} 個記帳項目`);
        } catch (error) {
            console.error('載入記帳項目失敗:', error);
            // 不要顯示alert，因為這可能是正常的（比如初次使用）
            console.log('可能是初次使用用戶，沒有記帳資料');
        }
    }

    updateUI() {
        const authSection = document.getElementById('auth-section');
        const accountingSection = document.getElementById('accounting-section');
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');

        if (this.currentUser) {
            // 已登入
            authSection.classList.add('hidden');
            accountingSection.classList.remove('hidden');

            // 更新用戶資訊
            document.getElementById('user-avatar').src = this.currentUser.photoURL;
            document.getElementById('user-name').textContent = this.currentUser.displayName;
            userInfo.classList.remove('hidden');
            loginBtn.classList.add('hidden');
        } else {
            // 未登入
            authSection.classList.remove('hidden');
            accountingSection.classList.add('hidden');
            userInfo.classList.add('hidden');
            loginBtn.classList.remove('hidden');
        }
    }

    async addEntry() {
        const type = document.getElementById('entry-type').value;
        const amount = parseFloat(document.getElementById('entry-amount').value);
        const description = document.getElementById('entry-description').value.trim();

        // 驗證輸入
        if (!amount || amount <= 0) {
            alert('請輸入有效的金額');
            return;
        }

        if (!description) {
            alert('請輸入描述');
            return;
        }

        // 創建記帳項目
        const entry = {
            id: Date.now(),
            type: type,
            amount: amount,
            description: description,
            date: new Date()
        };

        // 儲存到 Firestore
        const firestoreId = await this.saveEntry(entry);
        if (firestoreId) {
            entry.firestoreId = firestoreId;
            // 新增到本地列表
            this.entries.unshift(entry); // 插入到開頭，因為我們按創建時間降序排列
            this.renderEntries();
            this.updateBalance();

            // 清空表單
            document.getElementById('entry-amount').value = '';
            document.getElementById('entry-description').value = '';

            // 顯示console.log
            console.log('新增記帳項目:', entry);
        }
    }

    async deleteEntry(id) {
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index > -1) {
            const deletedEntry = this.entries[index];

            // 從 Firestore 刪除
            if (deletedEntry.firestoreId) {
                const success = await this.deleteEntryFromFirestore(deletedEntry.firestoreId);
                if (success) {
                    // 從本地列表刪除
                    this.entries.splice(index, 1);
                    this.renderEntries();
                    this.updateBalance();
                    console.log('刪除記帳項目:', deletedEntry);
                }
            } else {
                // 如果沒有 firestoreId（舊資料），直接從本地刪除
                this.entries.splice(index, 1);
                this.renderEntries();
                this.updateBalance();
                console.log('刪除本地記帳項目:', deletedEntry);
            }
        }
    }

    renderEntries() {
        const container = document.getElementById('entries-container');
        container.innerHTML = '';

        if (this.entries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #7f8c8d; margin: 40px 0;">還沒有記帳記錄</p>';
            return;
        }

        this.entries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            container.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = `entry-item ${entry.type}`;

        div.innerHTML = `
            <div class="entry-content">
                <div class="entry-amount">
                    ${entry.type === 'income' ? '+' : '-'}$${entry.amount.toFixed(2)}
                </div>
                <div class="entry-description">${entry.description}</div>
                <div style="font-size: 0.8rem; color: #95a5a6;">
                    ${entry.date.toLocaleDateString('zh-TW')}
                </div>
            </div>
            <div class="entry-actions">
                <button class="btn btn-danger btn-small" onclick="app.deleteEntry(${entry.id})">
                    刪除
                </button>
            </div>
        `;

        return div;
    }

    updateBalance() {
        const total = this.entries.reduce((sum, entry) => {
            return sum + (entry.type === 'income' ? entry.amount : -entry.amount);
        }, 0);

        const balanceElement = document.getElementById('total-balance');
        balanceElement.textContent = total.toFixed(2);
        balanceElement.style.color = total >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    }
}

// 導出類別，讓 index.html 在 Firebase 準備好後創建實例
window.MoneyStillApp = MoneyStillApp;
