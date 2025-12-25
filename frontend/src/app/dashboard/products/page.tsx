'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

const CATEGORIES = ['Refrigerator', 'Television', 'Phone', 'Washing Machine', 'Air Conditioner', 'Other'];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    purchase_price: '',
    stock_quantity: '',
    sku: '',
    brand: '',
    color: '',
    size: '',
    branch_id: '',
    image_url: '',
  });

  useEffect(() => {
    loadProducts();
    loadBranches();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const { branchesAPI } = await import('@/lib/api');
      const response = await branchesAPI.getActive();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        branch_id: formData.branch_id || null,
      };
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
      } else {
        await productsAPI.create(data);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      purchase_price: '',
      stock_quantity: '',
      sku: '',
      brand: '',
      color: '',
      size: '',
      branch_id: '',
      image_url: '',
    });
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      price: product.price.toString(),
      purchase_price: product.purchase_price ? product.purchase_price.toString() : '',
      stock_quantity: product.stock_quantity.toString(),
    });
    setShowModal(true);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => router.push('/dashboard/products/add')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter Produit</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            {/* Product Image */}
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="text-purple-600" size={24} />
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
            <div className="space-y-1 mb-2">
              {product.code && <p className="text-sm font-mono text-gray-700">Code: {product.code}</p>}
              {product.famille && <p className="text-sm text-gray-600">Famille: {product.famille}</p>}
              {product.brand && <p className="text-sm text-gray-600">Marque: {product.brand}</p>}
              {product.color && <p className="text-sm text-gray-600">Couleur: {product.color}</p>}
              {product.size && <p className="text-sm text-gray-600">Taille: {product.size}</p>}
              <p className="text-sm font-medium">
                {product.branch_name ? (
                  <span className="text-primary">?? {product.branch_name}</span>
                ) : (
                  <span className="text-green-600">?? Toutes les branches (Global)</span>
                )}
              </p>
            </div>
            
            {/* Installment Pricing Display */}
            {product.purchase_price && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Prix d'achat:</span>
                    <p className="font-semibold text-gray-700">{product.purchase_price} DZD</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vente comptant:</span>
                    <p className="font-semibold text-green-600">{product.cash_sale_price} DZD</p>
                  </div>
                </div>
                {(product.installment_6_months || product.installment_15_months || product.installment_24_months || product.installment_36_months) && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Plans à tempérament:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {product.installment_6_months && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          6m: {product.installment_6_months} DZD
                        </span>
                      )}
                      {product.installment_15_months && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          15m: {product.installment_15_months} DZD
                        </span>
                      )}
                      {product.installment_24_months && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          24m: {product.installment_24_months} DZD
                        </span>
                      )}
                      {product.installment_36_months && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          36m: {product.installment_36_months} DZD
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description || 'Aucune description'}</p>
            <div className="flex justify-between items-center">
              {product.cash_sale_price ? (
                <span className="text-xl font-bold text-green-600">{product.cash_sale_price} DZD</span>
              ) : (
                <span className="text-xl font-bold text-primary">{product.price || 0} DZD</span>
              )}
              <span className="text-sm text-gray-600">Stock: {product.stock_quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Product Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Prix d'Achat (DZD)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    step="0.01"
                    placeholder="Prix d'achat du produit"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prix de Vente (DZD) *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">SKU</label>
                <input
                  type="text"
                  className="input"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              {/* New Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Brand</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Samsung, LG, Condor"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Black, Silver"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Size</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., 55 inch, 10 kg"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Branch</label>
                  <select
                    className="input"
                    value={formData.branch_id}
                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  >
                    <option value="">?? Toutes les branches (Global)</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        ?? {branch.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Si aucune branche n'est sélectionnée, le produit sera disponible pour toutes les branches
                  </p>
                </div>
              </div>
              
              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Paste the direct link to the product image</p>
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="btn-danger flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

