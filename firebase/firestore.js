// Firebase Firestore 封裝
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc,
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// 取得集合參考
const GetCollection = (db, ...pathSegments) => {
    return collection(db, ...pathSegments);
};

// 取得文檔參考
const GetDoc = (db, ...pathSegments) => {
    return doc(db, ...pathSegments);
};

// 新增文檔
const AddDoc = async (collectionRef, data) => {
    try {
        const docRef = await addDoc(collectionRef, data);
        return docRef.id;
    } catch (error) {
        console.error('新增文檔失敗:', error);
        throw error;
    }
};

// 更新文檔
const UpdateDoc = async (docRef, data) => {
    try {
        await updateDoc(docRef, data);
        return true;
    } catch (error) {
        console.error('更新文檔失敗:', error);
        throw error;
    }
};

// 取得所有文檔
const GetDocs = async (queryRef) => {
    try {
        if (!queryRef) {
            throw new Error('查詢參考不能為空');
        }
        const snapshot = await getDocs(queryRef);
        return snapshot;
    } catch (error) {
        console.error('取得文檔失敗:', error);
        throw error;
    }
};

// 刪除文檔
const DeleteDoc = async (docRef) => {
    try {
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error('刪除文檔失敗:', error);
        throw error;
    }
};

// 建立查詢
const CreateQuery = (collectionRef, ...queryConstraints) => {
    return query(collectionRef, ...queryConstraints);
};

// 建立 where 條件
const CreateWhere = (fieldPath, opStr, value) => {
    return where(fieldPath, opStr, value);
};

// 建立排序
const CreateOrderBy = (fieldPath, directionStr) => {
    return orderBy(fieldPath, directionStr);
};

// 監聽集合變更
const OnSnapshot = (queryRef, callback) => {
    return onSnapshot(queryRef, callback);
};

export {
    GetCollection,
    GetDoc,
    AddDoc,
    UpdateDoc,
    GetDocs,
    DeleteDoc,
    CreateQuery,
    CreateWhere,
    CreateOrderBy,
    OnSnapshot
};
