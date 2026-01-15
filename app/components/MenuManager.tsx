'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Image as ImageIcon, Save, X, List, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
// import { PRODUCTS, CATEGORIES } from '@/lib/mockData'; // No longer needed
import { subscribeToProducts, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, updateCategoryOrder, Product, Category, uploadImage, Modifier, subscribeToModifiers, addModifier, updateModifier, deleteModifier } from '@/lib/services';
import { clsx } from 'clsx';
import { Reorder } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Types are imported from services now, removing local definitions to avoid collision/redundancy
// But if we want to keep props simple we can alias or use them directly.
// We'll use the imported types.

export default function MenuManager({
    lang,
    categories,
    onUpdateCategories
}: {
    lang: 'zh' | 'en';
    categories: Category[];
    onUpdateCategories: (cats: Category[]) => void;
}) {

    // Local state to simulate database -> Now Real Data
    const [products, setProducts] = useState<Product[]>([]);

    // Subscribe to products
    useEffect(() => {
        const unsubscribe = subscribeToProducts((newProducts) => {
            setProducts(newProducts);
        });
        return () => unsubscribe();
    }, []);

    // Use uplifted categories via props
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Local state for smooth drag-and-drop
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);
    const [isDragging, setIsDragging] = useState(false);
    // Use ref to access latest state in event handlers without dependency
    // (though onDragEnd usually works with state, closure staleness can happen if re-render is skipped)
    // Actually, simple state access inside onDragEnd is usually fine if the component re-renders.
    // Framer Motion re-renders on every drag move? No, onReorder triggers setLocalCategories which triggers re-render.
    // So `localCategories` in render scope is fresh.

    useEffect(() => {
        if (!isDragging) {
            setLocalCategories(categories);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    // ... rest of lines

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form States
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [catForm, setCatForm] = useState<{ name: string, nameEn: string }>({ name: '', nameEn: '' });
    const [isUploading, setIsUploading] = useState(false);

    // Modifier State
    const [activeTab, setActiveTab] = useState<'products' | 'modifiers'>('products');
    const [modifiers, setModifiers] = useState<Modifier[]>([]);
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);
    const [modifierForm, setModifierForm] = useState<Partial<Modifier>>({});

    // Subscribe to modifiers
    useEffect(() => {
        const unsubscribe = subscribeToModifiers((data) => {
            setModifiers(data);
        });
        return () => unsubscribe();
    }, []);

    // Modifier Handlers
    const handleCreateModifier = () => {
        setEditingModifier(null);
        setModifierForm({ name: '', price: 0, category: 'addon' });
        setIsModifierModalOpen(true);
    };

    const handleEditModifier = (modifier: Modifier) => {
        setEditingModifier(modifier);
        setModifierForm({ ...modifier });
        setIsModifierModalOpen(true);
    };

    const handleSaveModifier = async () => {
        if (!modifierForm.name || modifierForm.price === undefined) {
            alert(lang === 'en' ? 'Name and Price are required' : '名稱與價格為必填');
            return;
        }

        try {
            if (editingModifier) {
                await updateModifier(editingModifier.id, {
                    name: modifierForm.name,
                    nameEn: modifierForm.nameEn,
                    price: modifierForm.price,
                    category: modifierForm.category
                });
            } else {
                await addModifier({
                    name: modifierForm.name,
                    nameEn: modifierForm.nameEn,
                    price: modifierForm.price,
                    category: modifierForm.category || 'addon'
                });
            }
            setIsModifierModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Error saving modifier");
        }
    };

    const handleDeleteModifier = async (id: string) => {
        if (confirm(lang === 'en' ? 'Delete this modifier?' : '確定要刪除此配料嗎？')) {
            await deleteModifier(id);
        }
    };

    // Filtering & Sorting Logic
    const sortedProducts = [...products].sort((a, b) => {
        // Find index of category for product a and b in the current localCategories list
        const indexA = localCategories.findIndex(c => c.id === a.category_id);
        const indexB = localCategories.findIndex(c => c.id === b.category_id);

        // Handle cases where category might not exist (push to end)
        const validIndexA = indexA === -1 ? 9999 : indexA;
        const validIndexB = indexB === -1 ? 9999 : indexB;

        return validIndexA - validIndexB;
    });

    const filteredProducts = selectedCategory === 'all'
        ? sortedProducts
        : sortedProducts.filter(p => p.category_id === selectedCategory);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setFormData({
            category_id: categories.length > 0 ? categories[0].id : '',
            price: 0,
            name: '',
            image: ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.category_id) {
            alert("Name and Category are required");
            return;
        }

        try {
            if (editingProduct) {
                // Update existing
                await updateProduct(editingProduct.id, {
                    name: formData.name,
                    nameEn: formData.nameEn,
                    price: formData.price,
                    category_id: formData.category_id,
                    image: formData.image
                });
            } else {
                // Create new
                await addProduct({
                    name: formData.name!,
                    nameEn: formData.nameEn,
                    price: formData.price || 0,
                    category_id: formData.category_id,
                    image: formData.image,
                    type: 'product' // default
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(lang === 'en' ? 'Are you sure to delete this product?' : '確定要刪除此商品嗎？')) {
            await deleteProduct(id);
        }
    };

    // --- Category Handlers ---
    const handleSaveCategory = async () => {
        if (!catForm.name) return;

        try {
            if (editingCategory) {
                // Edit
                await updateCategory(editingCategory.id, {
                    name: catForm.name,
                    nameEn: catForm.nameEn
                });
            } else {
                // Create
                await addCategory({
                    name: catForm.name,
                    nameEn: catForm.nameEn,
                    sort_order: categories.length + 1
                });
            }
            // onUpdateCategories is not needed if parent also subscribes, but parent might be controlling logic
            setEditingCategory(null);
            setCatForm({ name: '', nameEn: '' });
        } catch (error) {
            console.error("Failed to save category:", error);
            alert("Failed to save category");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm(lang === 'en' ? 'Delete this category? Products in it might be hidden.' : '確定要刪除此分類嗎？其中的商品可能會無法顯示。')) {
            await deleteCategory(id);
            if (selectedCategory === id) setSelectedCategory('all');
        }
    };

    // Use Reorder.onReorder prop which only updates local state in framer motion
    // We need to trigger DB update
    const handleReorderCategories = (newOrder: Category[]) => {
        // Optimistically update local parent state (if passed down)
        // onUpdateCategories(newOrder); // Optional, maybe skip for performance during drag
        setLocalCategories(newOrder);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        updateCategoryOrder(localCategories);
    };


    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 min-h-[600px]">
            {/* Header / Tabs */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={clsx(
                            "text-2xl font-bold transition-colors",
                            activeTab === 'products' ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
                        )}
                    >
                        {lang === 'en' ? 'Menu Management' : '菜單管理'}
                    </button>
                    <span className="text-2xl font-bold text-gray-300">|</span>
                    <button
                        onClick={() => setActiveTab('modifiers')}
                        className={clsx(
                            "text-2xl font-bold transition-colors",
                            activeTab === 'modifiers' ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
                        )}
                    >
                        {lang === 'en' ? 'Modifiers' : '配料管理'}
                    </button>
                </div>

                <div className="flex gap-2">
                    {activeTab === 'products' ? (
                        <>
                            <button
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <List size={20} />
                                {lang === 'en' ? 'Categories' : '管理分類'}
                            </button>
                            <button
                                onClick={handleCreate}
                                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Plus size={20} />
                                {lang === 'en' ? 'New Product' : '新增商品'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCreateModifier}
                            className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                        >
                            <Plus size={20} />
                            {lang === 'en' ? 'New Modifier' : '新增配料'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Switch */}
            {activeTab === 'products' ? (
                // --- Existing Product View ---
                <div className="flex flex-col gap-6">
                    {/* Category Filters (Reorderable) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={clsx(
                                "px-4 py-1.5 rounded-full text-sm font-bold transition-all border shrink-0",
                                selectedCategory === 'all'
                                    ? "bg-gray-800 dark:bg-white text-white dark:text-black border-gray-800 dark:border-white"
                                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                            )}
                        >
                            {lang === 'en' ? 'All Items' : '全部商品'}
                        </button>

                        <Reorder.Group
                            axis="x"
                            values={categories}
                            onReorder={handleReorderCategories}
                            className="flex gap-2"
                        >
                            {categories.map((cat) => (
                                <Reorder.Item
                                    key={cat.id}
                                    value={cat}
                                    whileDrag={{ scale: 1.1 }}
                                    className="shrink-0"
                                >
                                    <button
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap cursor-grab active:cursor-grabbing",
                                            selectedCategory === cat.id
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        {lang === 'en' ? cat.nameEn : cat.name}
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>

                    {/* Product Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 text-sm">
                                    <th className="py-3 px-4 font-medium">{lang === 'en' ? 'Image' : '圖片'}</th>
                                    <th className="py-3 px-4 font-medium w-1/3">{lang === 'en' ? 'Product Name' : '商品名稱'}</th>
                                    <th className="py-3 px-4 font-medium">{lang === 'en' ? 'Price' : '價格'}</th>
                                    <th className="py-3 px-4 font-medium">{lang === 'en' ? 'Actions' : '操作'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="py-3 px-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden border border-gray-200 dark:border-zinc-700 relative">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-gray-800 dark:text-gray-100">{product.name}</div>
                                            <div className="text-xs text-gray-400">{product.nameEn}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-gray-600 dark:text-gray-300">${product.price}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                {lang === 'en' ? 'No products found.' : '此分類尚無商品'}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // --- Modifier View ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modifiers.map(mod => (
                        <div key={mod.id} className="border dark:border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-shadow bg-gray-50 dark:bg-zinc-800/50">
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{mod.name} <span className="text-sm font-normal text-gray-500">({mod.nameEn})</span></h4>
                                <p className="text-blue-600 font-bold">${mod.price}</p>
                                <span className="text-xs bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{mod.category === 'addon' ? (lang === 'en' ? 'Add-on' : '加購') : (lang === 'en' ? 'Option' : '選項')}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditModifier(mod)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteModifier(mod.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {modifiers.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            {lang === 'en' ? 'No modifiers yet.' : '尚無配料資料'}
                        </div>
                    )}
                </div>
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{lang === 'en' ? 'Manage Categories' : '管理分類'}</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 h-[400px] overflow-y-auto">
                            {/* Create Category Form */}
                            <div className="flex flex-col gap-2 mb-6 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <span className="text-sm font-bold text-gray-500">{lang === 'en' ? 'New Category' : '新增分類'}</span>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={lang === 'en' ? "Name (ZH)" : "名稱 (中文)"}
                                        value={catForm.name}
                                        onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                                        className="flex-1 border dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder={lang === 'en' ? "Name (EN)" : "名稱 (英文)"}
                                        value={catForm.nameEn}
                                        onChange={e => setCatForm({ ...catForm, nameEn: e.target.value })}
                                        className="flex-1 border dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveCategory}
                                    className="bg-gray-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-black transition-colors"
                                >
                                    {lang === 'en' ? 'Add Category' : '新增分類'}
                                </button>
                            </div>

                            {/* List (Reorderable not implemented here yet, showing list) */}
                            {/* Actually we can allow reorder here too if needed, but existing code had edit/delete */}
                            {/* Reorderable List */}
                            <Reorder.Group axis="y" values={localCategories} onReorder={handleReorderCategories} layoutScroll>
                                {localCategories.map(cat => (
                                    <Reorder.Item
                                        key={cat.id}
                                        value={cat}
                                        onDragStart={() => setIsDragging(true)}
                                        onDragEnd={handleDragEnd}
                                        dragMomentum={false}
                                        whileDrag={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)", zIndex: 10 }}
                                    >
                                        <div className="flex items-center justify-between p-3 border dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 mb-2 select-none">
                                            {editingCategory?.id === cat.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        value={editingCategory.name}
                                                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                        className="border dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-2 py-1 w-24 dark:text-white"
                                                    />
                                                    <input
                                                        value={editingCategory.nameEn || ''}
                                                        onChange={e => setEditingCategory({ ...editingCategory, nameEn: e.target.value })}
                                                        className="border dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-2 py-1 w-24 dark:text-white"
                                                    />
                                                    <button onClick={handleSaveCategory} className="text-green-600"><Save size={18} /></button>
                                                    <button onClick={() => setEditingCategory(null)} className="text-gray-400"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <div className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800 dark:text-gray-200">{cat.name}</div>
                                                            <div className="text-xs text-gray-400">{cat.nameEn}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setEditingCategory(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Pencil size={16} /></button>
                                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    </div>
                </div>
            )}


            {/* Create/Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{editingProduct ? (lang === 'en' ? 'Edit Product' : '編輯商品') : (lang === 'en' ? 'New Product' : '新增商品')}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row h-[500px]">
                            {/* Image Upload Section */}
                            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-zinc-800/30 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800">
                                <div className="relative w-40 h-40 bg-white dark:bg-zinc-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-colors group cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsUploading(true);
                                            try {
                                                const url = await uploadImage(file);
                                                setFormData({ ...formData, image: url });
                                            } catch (err) {
                                                console.error(err);
                                                alert(lang === 'en' ? 'Upload failed' : '上傳失敗');
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                    />
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            {isUploading ? (
                                                <Loader2 className="mx-auto mb-1 animate-spin" />
                                            ) : (
                                                <ImageIcon className="mx-auto mb-1" />
                                            )}
                                            <span className="text-xs">{isUploading ? 'Uploading...' : 'Upload'}</span>
                                        </div>
                                    )}
                                </div>
                                {formData.image && (
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        className="mt-4 text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 size={12} />
                                        {lang === 'en' ? 'Remove Image' : '移除圖片'}
                                    </button>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Product Name (ZH)' : '商品名稱 (中文)'}</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Product Name (EN)' : '商品名稱 (英文)'}</label>
                                    <input
                                        type="text"
                                        value={formData.nameEn || ''}
                                        onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Category' : '分類'}</label>
                                        <select
                                            value={formData.category_id || ''}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:text-white"
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Price' : '價格'}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                value={formData.price || 0}
                                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg pl-6 pr-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Type' : '類型 (顏色)'}</label>
                                        <select
                                            value={formData.type || 'meat'}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:text-white"
                                        >
                                            <option value="meat">{lang === 'en' ? 'Meat (Red)' : '肉類 (紅)'}</option>
                                            <option value="seafood">{lang === 'en' ? 'Seafood (Blue)' : '海鮮 (藍)'}</option>
                                            <option value="cheese">{lang === 'en' ? 'Cheese (Yellow)' : '起司 (黃)'}</option>
                                            <option value="special">{lang === 'en' ? 'Special (Purple)' : '特色 (紫)'}</option>
                                            <option value="side">{lang === 'en' ? 'Side Dish (Gray)' : '小菜 (灰)'}</option>
                                            <option value="addon">{lang === 'en' ? 'Addon (Green)' : '加購 (綠)'}</option>
                                            <option value="drink">{lang === 'en' ? 'Drink (Gray)' : '飲品 (灰)'}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 flex gap-3 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                {lang === 'en' ? 'Cancel' : '取消'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isUploading}
                                className={clsx(
                                    "flex-1 py-3 font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2",
                                    isUploading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                                )}
                            >
                                <Save size={18} />
                                {isUploading
                                    ? (lang === 'en' ? 'Uploading...' : '圖片上傳中...')
                                    : (lang === 'en' ? 'Save Changes' : '儲存變更')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModifierModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{editingModifier ? (lang === 'en' ? 'Edit Modifier' : '編輯配料') : (lang === 'en' ? 'New Modifier' : '新增配料')}</h3>
                            <button onClick={() => setIsModifierModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Name (ZH)' : '名稱 (中文)'}</label>
                                <input
                                    type="text"
                                    value={modifierForm.name || ''}
                                    onChange={e => setModifierForm({ ...modifierForm, name: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                    placeholder="例如：皮蛋"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Name (EN)' : '名稱 (英文)'}</label>
                                <input
                                    type="text"
                                    value={modifierForm.nameEn || ''}
                                    onChange={e => setModifierForm({ ...modifierForm, nameEn: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                    placeholder="e.g. Century Egg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Price' : '價格'}</label>
                                <input
                                    type="number"
                                    value={modifierForm.price}
                                    onChange={e => setModifierForm({ ...modifierForm, price: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{lang === 'en' ? 'Type' : '類型'}</label>
                                    <select
                                        value={modifierForm.category || 'addon'}
                                        onChange={e => setModifierForm({ ...modifierForm, category: e.target.value as any })}
                                        className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                    >
                                        <option value="addon">{lang === 'en' ? 'Add-on' : '加購配料'}</option>
                                        <option value="option">{lang === 'en' ? 'Option (Sugar/Ice)' : '選項 (甜度/客製)'}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex gap-3">
                            <button
                                onClick={() => setIsModifierModalOpen(false)}
                                className="flex-1 py-3 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                {lang === 'en' ? 'Cancel' : '取消'}
                            </button>
                            <button
                                onClick={handleSaveModifier}
                                className="flex-1 py-3 bg-purple-600 text-white font-bold hover:bg-purple-700 rounded-xl transition-colors shadow-lg shadow-purple-600/20"
                            >
                                {lang === 'en' ? 'Save' : '儲存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
