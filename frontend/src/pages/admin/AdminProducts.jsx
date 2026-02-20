import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import api from '../../services/api';
import './Admin.css';

// Currency formatter - created once
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

// Memoized Product Card Component
const ProductCard = memo(({ product, onEdit, onDelete }) => {
    const formattedPrice = currencyFormatter.format(product.price);

    return (
        <div className="product-card-admin">
            <img
                src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="product-image"
                loading="lazy"
                decoding="async"
            />
            <div className="product-content">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-category">{product.category?.name || 'ไม่มีหมวดหมู่'}</p>
                <div className="product-meta">
                    <span className="product-price">{formattedPrice}</span>
                    <span className={`product-stock ${product.stock < 10 ? 'low' : ''}`}>
                        Stock: {product.stock}
                    </span>
                </div>
                <div className="product-actions">
                    <button
                        className="btn-icon edit"
                        onClick={() => onEdit(product)}
                        title="แก้ไข"
                    >
                        ✏️
                    </button>
                    <button
                        className="btn-icon delete"
                        onClick={() => onDelete(product)}
                        title="ลบ"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
});

// Memoized Products Grid
const ProductsGrid = memo(({ products, onEdit, onDelete }) => {
    if (products.length === 0) {
        return <div className="empty-state">ไม่พบสินค้า</div>;
    }

    return (
        <div className="products-grid">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
});

// Image Preview Component
const ImagePreview = memo(({ url }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setError(false);
        setLoading(true);
    }, [url]);

    if (!url) {
        return (
            <div className="image-preview-placeholder">
                <span className="preview-icon">🖼️</span>
                <span>ไม่มีรูปภาพ</span>
            </div>
        );
    }

    return (
        <div className="image-preview-container">
            {loading && <div className="image-loading">กำลังโหลด...</div>}
            {error ? (
                <div className="image-preview-error">
                    <span className="preview-icon">⚠️</span>
                    <span>ไม่สามารถโหลดรูปภาพ</span>
                </div>
            ) : (
                <img
                    src={url}
                    alt="Preview"
                    className="image-preview"
                    onLoad={() => setLoading(false)}
                    onError={() => { setError(true); setLoading(false); }}
                    style={{ display: loading ? 'none' : 'block' }}
                />
            )}
        </div>
    );
});

// Form Input Component - memoized for better performance
const FormInput = memo(({ label, required, children }) => (
    <div className="form-group-enhanced">
        <label className="form-label-enhanced">
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        {children}
    </div>
));

// Initial form state
const INITIAL_FORM_STATE = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    brand: '',
    weight: '',
    image_url: '',
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 12;

    // Debounce search using ref
    const searchTimeoutRef = useRef(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products', { params: { page_size: 100 } }),
                    api.get('/categories')
                ]);

                if (mounted) {
                    setProducts(productsRes.data.products || []);
                    setCategories(categoriesRes.data.categories || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await api.get('/products', { params: { page_size: 100 } });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const openCreateModal = useCallback(() => {
        setSelectedProduct(null);
        setFormData(INITIAL_FORM_STATE);
        setShowModal(true);
    }, []);

    const openEditModal = useCallback((product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stock: String(product.stock),
            category_id: product.category_id,
            brand: product.brand || '',
            weight: product.weight || '',
            image_url: product.image_url || '',
        });
        setShowModal(true);
    }, []);

    const openDeleteConfirm = useCallback((product) => {
        setSelectedProduct(product);
        setShowDeleteConfirm(true);
    }, []);

    const closeModal = useCallback(() => setShowModal(false), []);
    const closeDeleteConfirm = useCallback(() => setShowDeleteConfirm(false), []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSaving(true);

        const productData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10),
            category_id: formData.category_id,
            brand: formData.brand,
            weight: formData.weight,
            image_url: formData.image_url,
        };

        try {
            if (selectedProduct) {
                await api.put(`/admin/products/${selectedProduct.id}`, productData);
            } else {
                await api.post('/admin/products', productData);
            }
            setShowModal(false);
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกสินค้า');
        } finally {
            setSaving(false);
        }
    }, [formData, selectedProduct, fetchProducts]);

    const handleDelete = useCallback(async () => {
        if (!selectedProduct) return;

        try {
            await api.delete(`/admin/products/${selectedProduct.id}`);
            setShowDeleteConfirm(false);
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('เกิดข้อผิดพลาดในการลบสินค้า');
        }
    }, [selectedProduct, fetchProducts]);

    // Memoized filtered products
    const filteredProducts = useMemo(() => {
        const searchLower = debouncedSearch.toLowerCase();
        return products.filter(product => {
            if (categoryFilter && product.category_id !== categoryFilter) return false;
            if (searchLower && !product.name.toLowerCase().includes(searchLower)) return false;
            return true;
        });
    }, [products, debouncedSearch, categoryFilter]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, categoryFilter]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, currentPage]);

    // Memoized category options
    const categoryOptions = useMemo(() =>
        categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
        )), [categories]);

    if (loading) {
        return <div className="loading">กำลังโหลด...</div>;
    }

    return (
        <div className="admin-products">
            <div className="page-header">
                <h2>📦 จัดการสินค้า</h2>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    ➕ เพิ่มสินค้า
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">หมวดหมู่ทั้งหมด</option>
                    {categoryOptions}
                </select>
                <span className="products-count">
                    {paginatedProducts.length} / {filteredProducts.length} รายการ (หน้า {currentPage}/{totalPages})
                </span>
            </div>

            {/* Products Grid */}
            <ProductsGrid
                products={paginatedProducts}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        ◀ ก่อนหน้า
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] < p - 1 && (
                                    <span style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>...</span>
                                )}
                                <button
                                    className={currentPage === p ? 'active' : ''}
                                    onClick={() => setCurrentPage(p)}
                                    style={currentPage === p ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' } : {}}
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))
                    }
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        ถัดไป ▶
                    </button>
                </div>
            )}

            {/* Enhanced Product Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content modal-enhanced" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-enhanced">
                            <div className="modal-title-group">
                                <span className="modal-icon">{selectedProduct ? '✏️' : '➕'}</span>
                                <h3>{selectedProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
                            </div>
                            <button className="modal-close-enhanced" onClick={closeModal}>
                                <span>✕</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-enhanced">
                                <div className="form-layout">
                                    {/* Left Column - Main Info */}
                                    <div className="form-column">
                                        <FormInput label="ชื่อสินค้า" required>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-input-enhanced"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="กรอกชื่อสินค้า"
                                                required
                                            />
                                        </FormInput>

                                        <FormInput label="รายละเอียด">
                                            <textarea
                                                name="description"
                                                className="form-textarea-enhanced"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows={3}
                                                placeholder="รายละเอียดสินค้า..."
                                            />
                                        </FormInput>

                                        <div className="form-row-enhanced">
                                            <FormInput label="ราคา (฿)" required>
                                                <div className="input-with-icon">
                                                    <span className="input-prefix">฿</span>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        className="form-input-enhanced with-prefix"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </FormInput>

                                            <FormInput label="จำนวนในสต็อก" required>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    className="form-input-enhanced"
                                                    value={formData.stock}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    placeholder="0"
                                                    required
                                                />
                                            </FormInput>
                                        </div>

                                        <FormInput label="หมวดหมู่" required>
                                            <select
                                                name="category_id"
                                                className="form-select-enhanced"
                                                value={formData.category_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">เลือกหมวดหมู่</option>
                                                {categoryOptions}
                                            </select>
                                        </FormInput>

                                        <div className="form-row-enhanced">
                                            <FormInput label="แบรนด์">
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    className="form-input-enhanced"
                                                    value={formData.brand}
                                                    onChange={handleInputChange}
                                                    placeholder="ชื่อแบรนด์"
                                                />
                                            </FormInput>

                                            <FormInput label="น้ำหนัก">
                                                <input
                                                    type="text"
                                                    name="weight"
                                                    className="form-input-enhanced"
                                                    value={formData.weight}
                                                    onChange={handleInputChange}
                                                    placeholder="เช่น 1kg"
                                                />
                                            </FormInput>
                                        </div>
                                    </div>

                                    {/* Right Column - Image */}
                                    <div className="form-column form-column-image">
                                        <FormInput label="รูปภาพสินค้า">
                                            <ImagePreview url={formData.image_url} />
                                            <input
                                                type="url"
                                                name="image_url"
                                                className="form-input-enhanced"
                                                value={formData.image_url}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </FormInput>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer-enhanced">
                                <button type="button" className="btn-enhanced btn-cancel-enhanced" onClick={closeModal}>
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn-enhanced btn-primary-enhanced" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner"></span>
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        <>
                                            <span>{selectedProduct ? '💾' : '✨'}</span>
                                            {selectedProduct ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างสินค้าใหม่'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={closeDeleteConfirm}>
                    <div className="modal-content modal-delete-confirm" onClick={e => e.stopPropagation()}>
                        <div className="delete-confirm-content">
                            <div className="delete-icon-wrapper">
                                <span>🗑️</span>
                            </div>
                            <h3>ยืนยันการลบสินค้า</h3>
                            <p>คุณต้องการลบ <strong>"{selectedProduct?.name}"</strong> หรือไม่?</p>
                            <p className="delete-warning">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>

                            <div className="delete-confirm-actions">
                                <button className="btn-enhanced btn-cancel-enhanced" onClick={closeDeleteConfirm}>
                                    ยกเลิก
                                </button>
                                <button className="btn-enhanced btn-danger-enhanced" onClick={handleDelete}>
                                    <span>🗑️</span>
                                    ลบสินค้า
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
