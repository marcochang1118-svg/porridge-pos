
import { db } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { CATEGORIES, PRODUCTS, MODIFIERS } from './mockData';

export const seedDatabase = async () => {
    try {
        console.log("Starting database seed...");
        const batch = writeBatch(db);

        // 1. Seed Categories
        CATEGORIES.forEach(cat => {
            const ref = doc(db, 'categories', cat.id);
            batch.set(ref, cat);
        });
        console.log(`Prepared ${CATEGORIES.length} categories.`);

        // 2. Seed Products
        PRODUCTS.forEach(prod => {
            const ref = doc(db, 'products', prod.id);
            batch.set(ref, prod);
        });
        console.log(`Prepared ${PRODUCTS.length} products.`);

        // 3. Seed Modifiers
        MODIFIERS.forEach(mod => {
            const ref = doc(db, 'modifiers', mod.id);
            batch.set(ref, mod);
        });
        console.log(`Prepared ${MODIFIERS.length} modifiers.`);

        await batch.commit();
        console.log("Database seeded successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding database:", error);
        return false;
    }
};
