import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

function Home() {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriesRes, productsRes] = await Promise.all([
                api.get('/categories'),
                api.get('/products?page_size=8')
            ]);

            setCategories(categoriesRes.data.categories || []);
            setFeaturedProducts(productsRes.data.products || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            อาหารสัตว์เลี้ยงคุณภาพ<br />
                            <span className="highlight">สำหรับคนที่คุณรัก 🐾</span>
                        </h1>
                        <p className="hero-subtitle">
                            เลือกซื้ออาหารคุณภาพสูง ส่งตรงถึงบ้านคุณ
                            เพื่อสุขภาพที่ดีของเพื่อนตัวน้อยของคุณ
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                เลือกซื้อสินค้า 🛒
                            </Link>
                            <Link to="/about" className="btn btn-outline btn-lg">
                                เกี่ยวกับเรา
                            </Link>
                        </div>
                    </div>

                    <div className="hero-image slide-in-right">
                        <div className="floating-card">🐕</div>
                        <div className="floating-card delay-1">🐈</div>
                        <div className="floating-card delay-2">🐦</div>
                        <div className="floating-card delay-3">🐰</div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title text-center">หมวดหมู่สินค้า</h2>
                    <p className="section-subtitle text-center">
                        เลือกสินค้าตามประเภทสัตว์เลี้ยงของคุณ
                    </p>

                    {loading ? (
                        <div className="loading">กำลังโหลด...</div>
                    ) : (
                        <div className="categories-grid">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.id}`}
                                    className="category-card"
                                >
                                    <div className="category-icon">
                                        {category.image_url ? (
                                            <img src={category.image_url} alt={category.name} />
                                        ) : (
                                            <span className="default-icon">🐾</span>
                                        )}
                                    </div>
                                    <h3 className="category-name">{category.name}</h3>
                                    <p className="category-description">{category.description}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">สินค้าแนะนำ</h2>
                            <p className="section-subtitle">สินค้าคุณภาพที่ลูกค้าเลือกมากที่สุด</p>
                        </div>
                        <Link to="/products" className="btn btn-outline">
                            ดูทั้งหมด →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="loading">กำลังโหลด...</div>
                    ) : (
                        <div className="products-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3 className="feature-title">จัดส่งฟรี</h3>
                            <p className="feature-description">
                                สั่งซื้อครบ 1,000 บาท รับส่งฟรีทั่วประเทศ
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">✅</div>
                            <h3 className="feature-title">สินค้าคุณภาพ</h3>
                            <p className="feature-description">
                                สินค้าทุกชิ้นผ่านการตรวจสอบมาตรฐาน
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💯</div>
                            <h3 className="feature-title">รับประกันความพึงพอใจ</h3>
                            <p className="feature-description">
                                คืนสินค้าได้ภายใน 7 วัน หากไม่พอใจ
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3 className="feature-title">บริการลูกค้า 24/7</h3>
                            <p className="feature-description">
                                ทีมงานพร้อมให้บริการตลอด 24 ชั่วโมง
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
