export const CATEGORIES = [
    { id: 'cat_porridge', name: '粥品', nameEn: 'Porridge', sort_order: 1 },
    { id: 'cat_sides', name: '小菜/加購', nameEn: 'Sides/Add-ons', sort_order: 2 },
    { id: 'cat_drinks', name: '飲品', nameEn: 'Drinks', sort_order: 3 },
];

export const PRODUCTS = [
    {
        id: 'p1', category_id: 'cat_porridge', name: '皮蛋瘦肉粥', nameEn: 'Century Egg & Pork Porridge',
        price: 90,
        type: 'meat',
        image: '/images/century-egg-porridge.png'
    },
    {
        id: 'p2',
        category_id: 'cat_porridge',
        name: '鮮瘦玉米粥',
        nameEn: 'Corn & Lean Pork Porridge',
        price: 90,
        type: 'meat',
        image: '/images/pork-corn-porridge.jpg'
    },
    {
        id: 'p3',
        category_id: 'cat_porridge',
        name: '雞茸玉米粥',
        nameEn: 'Corn & Chicken Porridge',
        price: 90,
        type: 'meat',
        image: '/images/corn-chicken-porridge.png'
    },
    {
        id: 'p4',
        category_id: 'cat_porridge',
        name: '香菇雞肉粥',
        nameEn: 'Mushroom & Chicken Porridge',
        price: 100,
        type: 'meat',
        image: '/images/mushroom-chicken-porridge.png'
    },
    {
        id: 'p5',
        category_id: 'cat_porridge',
        name: '滑蛋牛肉粥',
        nameEn: 'Beef & Egg Porridge',
        price: 100,
        type: 'meat',
        image: '/images/beef-egg-porridge.png'
    },
    {
        id: 'p6',
        category_id: 'cat_porridge',
        name: '海苔銀魚粥',
        nameEn: 'Seaweed & Silverfish Porridge',
        price: 100,
        type: 'seafood',
        image: '/images/seaweed-silverfish-porridge.png'
    },
    {
        id: 'p7',
        category_id: 'cat_porridge',
        name: '潮鯛魚片粥',
        nameEn: 'Snapper Fish Porridge',
        price: 100,
        type: 'seafood',
        image: '/images/snapper-fish-porridge.png'
    },
    {
        id: 'p8',
        category_id: 'cat_porridge',
        name: '起司皮瘦粥',
        nameEn: 'Cheese, Century Egg & Pork',
        price: 105,
        type: 'cheese',
        image: '/images/cheese-century-egg-pork-porridge.jpg'
    },
    {
        id: 'p9',
        category_id: 'cat_porridge',
        name: '起司玉米粥',
        nameEn: 'Cheese & Corn Porridge',
        price: 105,
        type: 'cheese',
        image: '/images/cheese-corn-porridge.jpg'
    },
    {
        id: 'p10',
        category_id: 'cat_porridge',
        name: '起司鮮肉粥',
        nameEn: 'Cheese & Pork Porridge',
        price: 105,
        type: 'cheese',
        image: '/images/cheese-pork-porridge.jpg'
    },
    {
        id: 'p11',
        category_id: 'cat_porridge',
        name: '廣東海產粥',
        nameEn: 'Cantonese Seafood Porridge',
        price: 110,
        type: 'seafood',
        image: '/images/cantonese-seafood-porridge-new.jpg'
    },
    {
        id: 'p12',
        category_id: 'cat_porridge',
        name: '鮮肉鮑魚粥',
        nameEn: 'Abalone & Pork Porridge',
        price: 120,
        type: 'seafood',
        image: '/images/abalone-pork-porridge.png'
    },
    { id: 'p13', category_id: 'cat_porridge', name: '綜合粥', nameEn: 'House Special Porridge', price: 140, type: 'special' },
    { id: 's1', category_id: 'cat_sides', name: '肉鬆', nameEn: 'Meat Floss', price: 50, type: 'side' },
    { id: 's2', category_id: 'cat_sides', name: '牛蒡絲', nameEn: 'Burdock Root', price: 30, type: 'addon' },
    { id: 's3', category_id: 'cat_sides', name: '油條肉鬆', nameEn: 'Fried Dough & Meat Floss', price: 15, type: 'side' },
    { id: 's4', category_id: 'cat_sides', name: '皮蛋豆腐', nameEn: 'Century Egg Tofu', price: 45, type: 'addon' },
    { id: 'd1', category_id: 'cat_drinks', name: '冬瓜茶 (500cc)', nameEn: 'Winter Melon Tea (500cc)', price: 25, type: 'drink' },
    { id: 'd2', category_id: 'cat_drinks', name: '冷泡綠茶 (500cc)', nameEn: 'Cold Brew Green Tea (500cc)', price: 25, type: 'drink' },
];

export const MODIFIERS = [
    { id: 'm1', name: '加起司', nameEn: 'Add Cheese', price: 15, category: 'option' },
    { id: 'm2', name: '加皮蛋', nameEn: 'Add Century Egg', price: 20, category: 'option' },
    { id: 'm3', name: '加雞蛋', nameEn: 'Add Egg', price: 15, category: 'option' },
    { id: 'm4', name: '加玉米', nameEn: 'Add Corn', price: 20, category: 'option' },
    { id: 'm6', name: '加肉類', nameEn: 'Add Meat', price: 40, category: 'option' },
    { id: 'm5', name: '不加芹菜', nameEn: 'No Celery', price: 0, category: 'option' },
    { id: 'm7', name: '加大碗', nameEn: 'Large Size', price: 25, category: 'option' },
    { id: 'm8', name: '牛蒡絲(加購)', nameEn: 'Burdock (Add-on)', price: 25, category: 'addon' },
    { id: 'm9', name: '皮蛋豆腐(加購)', nameEn: 'Tofu (Add-on)', price: 40, category: 'addon' },
    { id: 'm10', name: '冬瓜茶(加購)', nameEn: 'Winter Melon (500cc)', price: 20, category: 'addon' },
    { id: 'm11', name: '冷泡綠茶(加購)', nameEn: 'Green Tea (500cc)', price: 20, category: 'addon' },
];

export const currentInventoryList = [
    // 肉類與海鮮
    "豬肉 一包", "牛肉 一包", "雞肉 一包", "銀魚 一包", "鮑魚 一包", "香菇 一包", "鯛魚 一份",
    // 蛋類與配料
    "皮蛋 一籃", "雞蛋 一籃", "油條 一箱", "起司 一條", "玉米 一箱", "肉鬆 一包", "海苔 一包",
    // 基底與週邊
    "米 一包", "雞骨 一袋", "高湯A粉 一包", "白粥B粉 一包", "洋蔥 一袋", "薑 一份"
].sort((a, b) => a.localeCompare(b, 'zh-TW'));

export const currentInventoryListEn = [
    // Meat & Seafood
    "Pork (Pack)", "Beef (Pack)", "Chicken (Pack)", "Silverfish (Pack)", "Abalone (Pack)", "Shiitake Mushroom (Pack)", "Snapper (Portion)",
    // Eggs & Toppings
    "Preserved Egg (Basket)", "Egg (Basket)", "Fried Dough Stick (Box)", "Cheese (Strip)", "Corn (Box)", "Pork Floss (Pack)", "Seaweed (Pack)",
    // Base & Sides
    "Rice (Pack)", "Chicken Bone (Bag)", "Broth Powder A (Pack)", "White Porridge Powder B (Pack)", "Onion (Bag)", "Ginger (Portion)"
].sort();

export const EXPENSE_ITEMS = [
    "店面租金(含水費200)", "電費", "瓦斯費", "員工薪資"
];

export const EXPENSE_ITEMS_EN = [
    "Store Rent (incl. Water)", "Electricity Bill", "Gas Bill", "Staff Salary"
];
