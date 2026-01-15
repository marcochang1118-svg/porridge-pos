
import { db, storage } from './firebase';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    writeBatch,
    Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (file: File): Promise<string> => {
    // Create a unique filename: products/timestamp_filename
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const url = await getDownloadURL(storageRef);
    return url;
};

// Types (should match your localized types ideally, but keeping it simple for now)
export type Category = {
    id: string;
    name: string;
    nameEn?: string;
    sort_order: number;
};

export type Product = {
    id: string;
    category_id: string;
    name: string;
    nameEn?: string;
    price: number;
    type: string;
    image?: string;
    description?: string;
};

export type Modifier = {
    id: string;
    name: string;
    nameEn?: string;
    price: number;
    category: 'option' | 'addon';
};

// --- PRODUCTS ---

export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

// Real-time listener for products
export const subscribeToProducts = (callback: (products: Product[]) => void): Unsubscribe => {
    const q = query(collection(db, "products"));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        callback(products);
    });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    // Use setDoc with a custom ID if we want to control IDs, or addDoc for auto-ID
    // Here we use addDoc for auto-ID, OR we can generate one.
    // To keep consistent with our existing 'p1', 'p2' style, we might want to let the user specify ID or just use auto.
    // Let's use auto-ID for new products to avoid collisions.
    const docRef = await addDoc(collection(db, "products"), product);
    return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, updates);
};

export const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
};

// --- CATEGORIES ---

export const getCategories = async (): Promise<Category[]> => {
    const q = query(collection(db, "categories"), orderBy("sort_order"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

// Real-time listener for categories
export const subscribeToCategories = (callback: (categories: Category[]) => void): Unsubscribe => {
    const q = query(collection(db, "categories"), orderBy("sort_order"));
    return onSnapshot(q, (snapshot) => {
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        callback(categories);
    });
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
    const docRef = await addDoc(collection(db, "categories"), category);
    // Update the doc to include its own ID if needed, or just return it
    return docRef.id;
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, updates);
};

export const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
};

export const updateCategoryOrder = async (categories: Category[]) => {
    // Batch update for sorting to ensure atomicity and prevent intermediate snapshots
    const batch = writeBatch(db);
    categories.forEach((cat, index) => {
        const docRef = doc(db, "categories", cat.id);
        batch.update(docRef, { sort_order: index + 1 });
    });
    await batch.commit();
};


// --- MODIFIERS ---

export const getModifiers = async (): Promise<Modifier[]> => {
    const querySnapshot = await getDocs(collection(db, "modifiers"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Modifier));
};

export const subscribeToModifiers = (callback: (modifiers: Modifier[]) => void): Unsubscribe => {
    const q = query(collection(db, "modifiers"));
    return onSnapshot(q, (snapshot) => {
        const modifiers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Modifier));
        callback(modifiers);
    });
};

export const addModifier = async (modifier: Omit<Modifier, 'id'>) => {
    const docRef = await addDoc(collection(db, "modifiers"), modifier);
    return docRef.id;
};

export const updateModifier = async (id: string, updates: Partial<Modifier>) => {
    const docRef = doc(db, "modifiers", id);
    await updateDoc(docRef, updates);
};

export const deleteModifier = async (id: string) => {
    await deleteDoc(doc(db, "modifiers", id));
};

