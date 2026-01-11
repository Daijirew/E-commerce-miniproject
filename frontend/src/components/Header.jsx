import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import './Header.css';

function Header() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { getCartCount } = useCartStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const cartCount = getCartCount();

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">🐾</span>
                        <span className="logo-text">Pet Food Shop</span>
                    </Link>

                    <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
                        <Link to="/" className="nav-link">หน้าหลัก</Link>
                        <Link to="/products" className="nav-link">สินค้า</Link>
                        <Link to="/about" className="nav-link">เกี่ยวกับเรา</Link>
                        <Link to="/contact" className="nav-link">ติดต่อเรา</Link>
                    </nav>

                    <div className="header-actions">
                        {isAuthenticated ? (
                            <>
                                <Link to="/cart" className="cart-button">
                                    <span className="cart-icon">🛒</span>
                                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                </Link>
                                <div className="user-menu">
                                    <span className="user-name">สวัสดี, {user?.name}</span>
                                    <div className="user-dropdown">
                                        <Link to="/profile" className="dropdown-item">โปรไฟล์</Link>
                                        <Link to="/orders" className="dropdown-item">คำสั่งซื้อ</Link>
                                        <button onClick={handleLogout} className="dropdown-item">ออกจากระบบ</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline btn-sm">เข้าสู่ระบบ</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">สมัครสมาชิก</Link>
                            </>
                        )}

                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="hamburger"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
