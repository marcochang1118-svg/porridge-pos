export const CATEGORIES = [
    { id: 'cat_porridge', name: '粥品', nameEn: 'Porridge', sort_order: 1 },
    { id: 'cat_sides', name: '小菜/加料', nameEn: 'Sides/Extras', sort_order: 2 },
];

export const PRODUCTS = [
    { id: 'p1', category_id: 'cat_porridge', name: '皮蛋瘦肉粥', nameEn: 'Century Egg & Pork Porridge', price: 90, type: 'meat' },
    { id: 'p2', category_id: 'cat_porridge', name: '鮮瘦玉米粥', nameEn: 'Corn & Lean Pork Porridge', price: 90, type: 'meat' },
    { id: 'p3', category_id: 'cat_porridge', name: '雞茸玉米粥', nameEn: 'Corn & Chicken Porridge', price: 90, type: 'meat' },
    { id: 'p4', category_id: 'cat_porridge', name: '香菇雞肉粥', nameEn: 'Mushroom & Chicken Porridge', price: 100, type: 'meat' },
    { id: 'p5', category_id: 'cat_porridge', name: '滑蛋牛肉粥', nameEn: 'Beef & Egg Porridge', price: 100, type: 'meat' },
    { id: 'p6', category_id: 'cat_porridge', name: '海苔銀魚粥', nameEn: 'Seaweed & Silverfish Porridge', price: 100, type: 'seafood' },
    { id: 'p7', category_id: 'cat_porridge', name: '潮鯛魚片粥', nameEn: 'Snapper Fish Porridge', price: 100, type: 'seafood' },
    { id: 'p8', category_id: 'cat_porridge', name: '起司皮瘦粥', nameEn: 'Cheese, Century Egg & Pork', price: 105, type: 'cheese' },
    { id: 'p9', category_id: 'cat_porridge', name: '起司玉米粥', nameEn: 'Cheese & Corn Porridge', price: 105, type: 'cheese' },
    { id: 'p10', category_id: 'cat_porridge', name: '起司鮮肉粥', nameEn: 'Cheese & Pork Porridge', price: 105, type: 'cheese' },
    { id: 'p11', category_id: 'cat_porridge', name: '廣東海產粥', nameEn: 'Cantonese Seafood Porridge', price: 110, type: 'seafood' },
    { id: 'p12', category_id: 'cat_porridge', name: '鮮肉鮑魚粥', nameEn: 'Abalone & Pork Porridge', price: 120, type: 'seafood' },
    { id: 'p13', category_id: 'cat_porridge', name: '綜合粥', nameEn: 'House Special Porridge', price: 140, type: 'special' },
    { id: 's1', category_id: 'cat_sides', name: '肉鬆', nameEn: 'Meat Floss', price: 50, type: 'side' },
    { id: 's3', category_id: 'cat_sides', name: '油條肉鬆', nameEn: 'Fried Dough & Meat Floss', price: 15, type: 'side' },
];

export const MODIFIERS = [
    { id: 'm1', name: '加起司', nameEn: 'Add Cheese', price: 15 },
    { id: 'm2', name: '加皮蛋', nameEn: 'Add Century Egg', price: 20 },
    { id: 'm3', name: '加雞蛋', nameEn: 'Add Egg', price: 15 },
    { id: 'm4', name: '加玉米', nameEn: 'Add Corn', price: 20 },
    { id: 'm6', name: '加肉類', nameEn: 'Add Meat', price: 40 },
    { id: 'm5', name: '不加芹菜', nameEn: 'No Celery', price: 0 },
    { id: 'm7', name: '加大碗', nameEn: 'Large Size', price: 25 },
];
