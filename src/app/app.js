// MoneyStill - 記帳APP 應用邏輯
import authManager from '../modules/auth.js';
import * as repos from '../../repository/index.js';

class MoneyStillApp {
    constructor() {
        this.entries = [];
        this.currentUser = null;
        this.unsubscribeEntries = null;
        this.init();
    }

    init = () => {
        console.log('開始初始化 MoneyStillApp...');
        this.entries = [];
        this.bindEvents();
        this.registerServiceWorker();
        this.setupAuth();
        console.log('MoneyStillApp 初始化完成');
    }

    bindEvents = () => {
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

    registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);

                    // 檢查是否有新版本
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // 有新版本可用 - 暴力法：直接重新載入
                                    console.log('新版本 Service Worker 已安裝，正在重新載入...');
                                    setTimeout(() => window.location.reload(), 1000); // 延遲1秒
                                }
                            });
                        }
                    });
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    setupAuth = () => {
        // 監聽認證狀態變更
        authManager.OnAuthStateChange((user) => {
            this.currentUser = user;
            this.updateUI();
            
            if (user) {
                // 用戶登入時載入資料並設置即時監聽
                this.loadEntries();
                this.setupEntriesListener();
            } else {
                // 用戶登出時清空資料
                this.entries = [];
                this.renderEntries();
                this.updateBalance();
                // 取消監聽
                if (this.unsubscribeEntries) {
                    this.unsubscribeEntries();
                    this.unsubscribeEntries = null;
                }
            }
        });
    }

    setupEntriesListener = () => {
        if (!this.currentUser) {
            return;
        }

        // 取消舊的監聽
        if (this.unsubscribeEntries) {
            this.unsubscribeEntries();
        }

        // 設置新的即時監聽
        try {
            this.unsubscribeEntries = repos.OnEntriesChanged(this.currentUser.uid, (entries) => {
                // 轉換資料格式
                this.entries = entries.map(entry => ({
                    id: entry.id,
                    firestoreId: entry.id,
                    type: entry.type,
                    amount: entry.amount,
                    description: entry.description,
                    date: entry.date ? new Date(entry.date) : new Date(entry.createdAt)
                }));
                
                this.renderEntries();
                this.updateBalance();
                console.log(`已同步 ${this.entries.length} 個記帳項目`);
            });
        } catch (error) {
            console.error('設置記帳項目監聽失敗:', error);
        }
    }

    signIn = async () => {
        console.log('嘗試登入...');
        
        try {
            await authManager.SignIn();
            // 認證狀態變更會透過 setupAuth 中的監聽器處理
        } catch (error) {
            alert(error.message);
        }
    }

    signOut = async () => {
        try {
            await authManager.SignOut();
            // 認證狀態變更會透過 setupAuth 中的監聽器處理
        } catch (error) {
            console.error('登出失敗:', error);
            alert('登出失敗，請稍後再試');
        }
    }

    async saveEntry(entry) {
        if (!this.currentUser) {
            console.warn('用戶未登入，無法儲存');
            return null;
        }

        try {
            const entryData = {
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                date: entry.date.toISOString()
            };

            const entryId = await repos.Save(this.currentUser.uid, entry.firestoreId || null, entryData);
            console.log('記帳項目已儲存, ID:', entryId);
            return entryId;
        } catch (error) {
            console.error('儲存記帳項目失敗:', error);
            console.warn('儲存失敗，但資料已保存在本地');
            return null;
        }
    }

    async deleteEntryFromRepository(entryId) {
        if (!this.currentUser) {
            console.warn('用戶未登入，無法刪除');
            return false;
        }

        try {
            await repos.Delete(this.currentUser.uid, entryId);
            console.log('記帳項目已刪除, ID:', entryId);
            return true;
        } catch (error) {
            console.error('刪除記帳項目失敗:', error);
            console.warn('雲端刪除失敗，但本地已刪除');
            return false;
        }
    }

    async loadEntries() {
        if (!this.currentUser) {
            console.warn('用戶未登入');
            return;
        }

        try {
            console.log('開始載入記帳資料...');
            const entries = await repos.GetAllEntries(this.currentUser.uid);
            
            // 轉換資料格式
            this.entries = entries.map(entry => ({
                id: entry.id,
                firestoreId: entry.id,
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                date: entry.date ? new Date(entry.date) : new Date(entry.createdAt)
            }));

            this.renderEntries();
            this.updateBalance();
            console.log(`已載入 ${this.entries.length} 個記帳項目`);
        } catch (error) {
            console.error('載入記帳項目失敗:', error);
            console.log('可能是初次使用用戶，沒有記帳資料');
        }
    }

    updateUI = () => {
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

    addEntry = async () => {
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

        // 儲存到 Repository
        const firestoreId = await this.saveEntry(entry);
        if (firestoreId) {
            entry.firestoreId = firestoreId;
            // 即時監聽器會自動更新列表，但為了更好的 UX，我們也立即更新本地
            // 如果即時監聽器正常工作，這行會被覆蓋
            const existingIndex = this.entries.findIndex(e => e.firestoreId === firestoreId);
            if (existingIndex === -1) {
                this.entries.unshift(entry);
                this.renderEntries();
                this.updateBalance();
            }

            // 清空表單
            document.getElementById('entry-amount').value = '';
            document.getElementById('entry-description').value = '';

            console.log('新增記帳項目:', entry);
        } else {
            alert('儲存失敗，請稍後再試');
        }
    }

    deleteEntry = async (id) => {
        const index = this.entries.findIndex(entry => entry.id === id || entry.firestoreId === id);
        if (index > -1) {
            const deletedEntry = this.entries[index];
            const entryId = deletedEntry.firestoreId || deletedEntry.id;

            // 從 Repository 刪除
            const success = await this.deleteEntryFromRepository(entryId);
            if (success) {
                // 即時監聽器會自動更新列表
                console.log('刪除記帳項目:', deletedEntry);
            } else {
                // 如果刪除失敗，從本地移除（保持 UI 一致性）
                this.entries.splice(index, 1);
                this.renderEntries();
                this.updateBalance();
                alert('刪除失敗，但已從本地移除');
            }
        }
    }

    renderEntries = () => {
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

    createEntryElement = (entry) => {
        const div = document.createElement('div');
        div.className = `entry-item ${entry.type}`;

        const entryId = entry.firestoreId || entry.id;

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
                <button class="btn btn-danger btn-small" onclick="app.deleteEntry('${entryId}')">
                    刪除
                </button>
            </div>
        `;

        return div;
    }

    updateBalance = () => {
        const total = this.entries.reduce((sum, entry) => {
            return sum + (entry.type === 'income' ? entry.amount : -entry.amount);
        }, 0);

        const balanceElement = document.getElementById('total-balance');
        balanceElement.textContent = total.toFixed(2);
        balanceElement.style.color = total >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    }
}

// 創建應用實例
const app = new MoneyStillApp();

// 將實例掛載到 window，方便 HTML 中的 onclick 使用
window.app = app;

export default MoneyStillApp;
