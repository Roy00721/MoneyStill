// 資料存取層
import { firebaseFirestore } from '../firebase/index.js';

// 儲存一筆資料（新增或修改）
const Save = async (userId, entryId, entryData) => {
    try {
        const { db, GetCollection, GetDoc, AddDoc, UpdateDoc } = firebaseFirestore;
        
        if (!userId) {
            throw new Error('用戶 ID 不能為空');
        }

        const entriesPath = `users/${userId}/entries`;
        
        if (entryId) {
            // 更新現有文檔
            const entryRef = GetDoc(db, 'users', userId, 'entries', entryId);
            await UpdateDoc(entryRef, {
                ...entryData,
                updatedAt: new Date()
            });
            return entryId;
        } else {
            // 新增文檔
            const entriesRef = GetCollection(db, 'users', userId, 'entries');
            const newEntryData = {
                ...entryData,
                createdAt: new Date()
            };
            const docId = await AddDoc(entriesRef, newEntryData);
            return docId;
        }
    } catch (error) {
        console.error('儲存資料失敗:', error);
        throw error;
    }
};

// 刪除一筆資料
const Delete = async (userId, entryId) => {
    try {
        const { db, GetDoc, DeleteDoc } = firebaseFirestore;
        
        if (!userId || !entryId) {
            throw new Error('用戶 ID 和項目 ID 不能為空');
        }

        const entryRef = GetDoc(db, 'users', userId, 'entries', entryId);
        await DeleteDoc(entryRef);
        return true;
    } catch (error) {
        console.error('刪除資料失敗:', error);
        throw error;
    }
};

// 取得所有記帳項目
const GetAllEntries = async (userId) => {
    try {
        const { db, GetCollection, CreateQuery, CreateOrderBy, GetDocs } = firebaseFirestore;
        
        if (!userId) {
            throw new Error('用戶 ID 不能為空');
        }

        const entriesRef = GetCollection(db, 'users', userId, 'entries');
        const q = CreateQuery(entriesRef, CreateOrderBy('createdAt', 'desc'));
        const querySnapshot = await GetDocs(q);
        
        const entries = [];
        querySnapshot.forEach((doc) => {
            entries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return entries;
    } catch (error) {
        console.error('取得記帳項目失敗:', error);
        throw error;
    }
};

// 監聽記帳項目變更
const OnEntriesChanged = (userId, callback) => {
    try {
        const { db, GetCollection, CreateQuery, CreateOrderBy, OnSnapshot } = firebaseFirestore;
        
        if (!userId) {
            throw new Error('用戶 ID 不能為空');
        }

        const entriesRef = GetCollection(db, 'users', userId, 'entries');
        const q = CreateQuery(entriesRef, CreateOrderBy('createdAt', 'desc'));
        
        return OnSnapshot(q, (snapshot) => {
            const entries = [];
            snapshot.forEach((doc) => {
                entries.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(entries);
        });
    } catch (error) {
        console.error('監聽記帳項目失敗:', error);
        throw error;
    }
};

export {
    Save,
    Delete,
    GetAllEntries,
    OnEntriesChanged
};
