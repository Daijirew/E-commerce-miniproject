import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './Products.css';

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0 });

    const selectedCategory = searchParams.get('category') || '';
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, searchQuery, pagination.page]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                page_size: pagination.pageSize,
            };

            if (selectedCategory) params.category_id = selectedCategory;
            if (searchQuery) params.search = searchQuery;

            const response = await api.get('/products', { params });
            setProducts(response.data.products || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        const params = new URLSearchParams(searchParams);
        if (categoryId) {
            params.set('category', categoryId);
        } else {
            params.delete('category');
        }
        params.set('page', '1');
        setSearchParams(params);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const search = formData.get('search');

        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        setSearchParams(params);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <div className="products-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">สินค้าทั้งหมด</h1>
                    <p className="page-subtitle">เลือกซื้ออาหารสัตว์เลี้ยงคุณภาพสูง</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        name="search"
                        placeholder="ค้นหาสินค้า..."
                        defaultValue={searchQuery}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        🔍 ค้นหา
                    </button>
                </form>

                {/* Category Filter */}
                <div className="category-filter">
                    <button
                        className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('')}
                    >
                        ทั้งหมด
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="loading">กำลังโหลดสินค้า...</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>ไม่พบสินค้า</h3>
                        <p>ลองค้นหาด้วยคำค้นอื่น หรือเลือกหมวดหมู่อื่น</p>
                    </div>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    ← ก่อนหน้า
                                </button>

                                <span className="pagination-info">
                                    หน้า {pagination.page} จาก {totalPages}
                                </span>

                                <button
                                    className="pagination-btn"
                                    disabled={pagination.page >= totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    ถัดไป →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Products;
