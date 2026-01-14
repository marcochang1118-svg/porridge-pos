'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Image as ImageIcon, Save, X, List, ChevronUp, ChevronDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/mockData';
import { clsx } from 'clsx';

import { Reorder } from 'framer-motion';

// Mock Product Type (copy from lib/mockData or define locally for proto)
type Product = {
    id: string;
    category_id: string; // Changed from category to match mockData
    category?: string; // Optional overlap
    name: string;
    nameEn?: string;
    price: number;
    image?: string;
    type?: string;
};

// Category Type (if not already imported, define it to match mockData)
type Category = {
    id: string;
    name: string;
    nameEn: string;
    sort_order: number;
};

export default function MenuManager({
    lang,
    categories,
    onUpdateCategories
}: {
    lang: 'zh' | 'en';
    categories: Category[];
    onUpdateCategories: (cats: Category[]) => void;
}) {
    // Local state to simulate database
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    // Use uplifted categories via props
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<{ id: string, name: string, nameEn: string } | null>(null);

    // Form States
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [catForm, setCatForm] = useState<{ name: string, nameEn: string }>({ name: '', nameEn: '' });

    // Filtering Logic
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category_id === selectedCategory || p.category === selectedCategory);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setFormData({
            category_id: categories[0].id,
            price: 0,
            name: '',
            image: ''
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingProduct) {
            // Update existing
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } as Product : p));
        } else {
            // Create new
            const newProduct = {
                ...formData,
                id: `p${Date.now()}`,
                type: 'product' // default
            } as Product;
            setProducts([newProduct, ...products]);
        }
        setIsModalOpen(false);
        alert(lang === 'en' ? 'Simulated: Data Saved!' : '模擬提示：資料已儲存！(這只是預覽)');
    };

    const handleDelete = (id: string) => {
        if (confirm(lang === 'en' ? 'Are you sure?' : '確定要刪除嗎？')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    // --- Category Handlers ---
    const handleSaveCategory = () => {
        if (editingCategory) {
            // Edit
            onUpdateCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...catForm } : c));
        } else {
            // Create
            const newCat = {
                id: `cat_${Date.now()}`,
                ...catForm,
                sort_order: categories.length + 1
            };
            onUpdateCategories([...categories, newCat]);
        }
        setEditingCategory(null);
        setCatForm({ name: '', nameEn: '' });
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm(lang === 'en' ? 'Delete this category?' : '確定要刪除此分類嗎？')) {
            onUpdateCategories(categories.filter(c => c.id !== id));
            if (selectedCategory === id) setSelectedCategory('all');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {lang === 'en' ? 'Menu Management' : '菜單管理'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {lang === 'en' ? 'Manage products, prices and images' : '管理商品、價格與圖片'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                        >
                            <List size={20} />
                            {lang === 'en' ? 'Categories' : '管理分類'}
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg"
                        >
                            <Plus size={20} />
                            {lang === 'en' ? 'Add Product' : '新增商品'}
                        </button>
                    </div>
                </div>

                {/* Category Filters (Reorderable) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-sm font-bold transition-all border shrink-0",
                            selectedCategory === 'all'
                                ? "bg-gray-800 text-white border-gray-800"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {lang === 'en' ? 'All Items' : '全部商品'}
                    </button>

                    <Reorder.Group
                        axis="x"
                        values={categories}
                        onReorder={onUpdateCategories}
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
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    {lang === 'en' ? cat.nameEn : cat.name}
                                </button>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="p-4 pl-6 w-20">Image</th>
                            <th className="p-4">{lang === 'en' ? 'Product Name' : '商品名稱'}</th>
                            <th className="p-4">{lang === 'en' ? 'Category' : '分類'}</th>
                            <th className="p-4">{lang === 'en' ? 'Price' : '價格'}</th>
                            <th className="p-4 text-right pr-6">{lang === 'en' ? 'Actions' : '操作'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="p-4 pl-6">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-gray-300" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{product.name}</div>
                                    <div className="text-xs text-gray-400">{product.nameEn}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        {categories.find(c => c.id === product.category_id || c.id === product.category)?.name || product.category_id}
                                    </span>
                                </td>
                                <td className="p-4 font-mono font-medium text-gray-700">
                                    ${product.price}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Category Manager Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {lang === 'en' ? 'Manage Categories' : '管理分類'}
                            </h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Add/Edit Form */}
                            <div className="bg-blue-50 p-4 rounded-xl mb-6">
                                <h4 className="text-sm font-bold text-blue-800 mb-3">
                                    {editingCategory ? (lang === 'en' ? 'Edit Category' : '編輯分類') : (lang === 'en' ? 'Add New Category' : '新增分類')}
                                </h4>
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            placeholder={lang === 'en' ? 'Name (ZH)' : '分類名稱 (中文)'}
                                            value={catForm.name}
                                            onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                                            className="px-3 py-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <input
                                            placeholder={lang === 'en' ? 'Name (EN)' : '英文名稱'}
                                            value={catForm.nameEn}
                                            onChange={e => setCatForm({ ...catForm, nameEn: e.target.value })}
                                            className="px-3 py-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    {editingCategory ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveCategory}
                                                disabled={!catForm.name}
                                                className="flex-1 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Save size={18} /> {lang === 'en' ? 'Save Changes' : '儲存變更'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingCategory(null); setCatForm({ name: '', nameEn: '' }); }}
                                                className="px-4 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                                            >
                                                {lang === 'en' ? 'Cancel' : '取消'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSaveCategory}
                                            disabled={!catForm.name}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus size={18} />
                                            {lang === 'en' ? 'Add New Category' : '新增分類'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-bold text-gray-800">{cat.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{cat.nameEn}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-50 group-hover:opacity-100">
                                            <button
                                                onClick={() => { setEditingCategory(cat); setCatForm({ name: cat.name, nameEn: cat.nameEn || '' }); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal (Product) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingProduct ? (lang === 'en' ? 'Edit Product' : '編輯商品') : (lang === 'en' ? 'New Product' : '新增商品')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Image Preview */}
                            <div className="flex justify-center mb-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="mx-auto mb-1" />
                                            <span className="text-xs">Upload</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm">
                                        Change Image
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Product Name (ZH)' : '商品名稱 (中文)'}</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Category' : '分類'}</label>
                                    <select
                                        value={formData.category || formData.category_id || ''}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Price' : '價格'}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={formData.price || 0}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg pl-6 pr-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                {lang === 'en' ? 'Cancel' : '取消'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {lang === 'en' ? 'Save Changes' : '儲存變更'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
