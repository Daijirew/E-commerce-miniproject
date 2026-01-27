import React, { useState, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import api from '../services/api';
import './Cart.css';

// Currency formatter
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
});

// Memoized Order Item Component
const OrderItemCard = memo(({ item }) => {
    const price = item.product?.price || 0;
    const total = price * item.quantity;

    return (
        <div className="checkout-order-item">
            <div className="checkout-item-image-wrapper">
                <img
                    src={item.product?.image_url || 'https://via.placeholder.com/80'}
                    alt={item.product?.name}
                    className="checkout-item-image"
                    loading="lazy"
                />
                <span className="checkout-item-qty-badge">{item.quantity}</span>
            </div>
            <div className="checkout-item-details">
                <h4 className="checkout-item-name">{item.product?.name}</h4>
                {item.product?.brand && (
                    <span className="checkout-item-brand">{item.product.brand}</span>
                )}
                <div className="checkout-item-pricing">
                    <span className="checkout-item-unit-price">
                        {currencyFormatter.format(price)} × {item.quantity}
                    </span>
                </div>
            </div>
            <div className="checkout-item-total">
                {currencyFormatter.format(total)}
            </div>
        </div>
    );
});

// Price Summary Row
const SummaryRow = memo(({ label, value, isTotal, isFree }) => (
    <div className={`checkout-summary-row ${isTotal ? 'is-total' : ''}`}>
        <span className="summary-label">{label}</span>
        <span className={`summary-value ${isFree ? 'free' : ''}`}>
            {typeof value === 'string' ? value : currencyFormatter.format(value)}
        </span>
    </div>
));

// Success Modal Component
const SuccessModal = memo(({ isOpen, onClose, orderDetails }) => {
    if (!isOpen) return null;

    return (
        <div className="success-modal-overlay" onClick={onClose}>
            <div className="success-modal-content" onClick={e => e.stopPropagation()}>
                {/* Confetti Animation */}
                <div className="success-confetti">
                    <span>🎊</span>
                    <span>✨</span>
                    <span>🎉</span>
                </div>

                {/* Success Icon */}
                <div className="success-icon-wrapper">
                    <div className="success-icon-circle">
                        <span className="success-checkmark">✓</span>
                    </div>
                </div>

                {/* Message */}
                <h2 className="success-title">สั่งซื้อสำเร็จ!</h2>
                <p className="success-message">
                    ขอบคุณที่ใช้บริการ Pet Shop ของเรา
                </p>

                {/* Order Details */}
                <div className="success-order-info">
                    <div className="success-order-row">
                        <span>ยอดรวม</span>
                        <span className="success-total">{currencyFormatter.format(orderDetails?.total || 0)}</span>
                    </div>
                    <div className="success-order-row">
                        <span>สินค้า</span>
                        <span>{orderDetails?.itemCount || 0} รายการ</span>
                    </div>
                </div>

                {/* Message Badge */}
                <div className="success-badge">
                    <span>📦</span>
                    <span>เราจะจัดส่งสินค้าให้เร็วที่สุด!</span>
                </div>

                {/* Action Button */}
                <button className="success-btn" onClick={onClose}>
                    <span>📋</span>
                    <span>ดูคำสั่งซื้อของฉัน</span>
                </button>
            </div>
        </div>
    );
});

function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { cartItems, getCartTotal, clearCart } = useCartStore();
    const { addToast } = useToastStore();
    const [shippingAddress, setShippingAddress] = useState(user?.address || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Memoized calculations
    const { total, shippingFee, grandTotal, itemCount } = useMemo(() => {
        const total = getCartTotal();
        const shippingFee = total >= 1000 ? 0 : 50;
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        return {
            total,
            shippingFee,
            grandTotal: total + shippingFee,
            itemCount
        };
    }, [cartItems, getCartTotal]);

    const handleSuccessClose = useCallback(() => {
        setShowSuccess(false);
        clearCart();
        navigate('/orders');
    }, [clearCart, navigate]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!shippingAddress.trim()) {
            setError('กรุณากรอกที่อยู่จัดส่ง');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/orders', {
                shipping_address: shippingAddress,
            });

            // Store order details for success modal
            setOrderDetails({
                total: grandTotal,
                itemCount: itemCount
            });

            // Show success modal
            setShowSuccess(true);

            // Also show toast
            addToast({
                type: 'success',
                title: 'สั่งซื้อสำเร็จ! 🎉',
                message: 'ขอบคุณที่ใช้บริการ เราจะจัดส่งสินค้าให้เร็วที่สุด',
                duration: 5000
            });

        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
            addToast({
                type: 'error',
                title: 'เกิดข้อผิดพลาด',
                message: err.response?.data?.error || 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่',
                duration: 4000
            });
        } finally {
            setLoading(false);
        }
    }, [shippingAddress, grandTotal, itemCount, addToast]);

    const handleAddressChange = useCallback((e) => {
        setShippingAddress(e.target.value);
    }, []);

    if (cartItems.length === 0 && !showSuccess) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">ชำระเงิน 💳</h1>

                {error && (
                    <div className="checkout-error">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="checkout-content">
                        {/* Shipping Info Section */}
                        <div className="checkout-section checkout-shipping">
                            <div className="section-header">
                                <span className="section-icon">📦</span>
                                <h2>ข้อมูลการจัดส่ง</h2>
                            </div>

                            <div className="checkout-form-grid">
                                <div className="form-group">
                                    <label className="form-label">ชื่อผู้รับ</label>
                                    <input
                                        type="text"
                                        className="form-input checkout-input disabled"
                                        value={user?.name || ''}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">อีเมล</label>
                                    <input
                                        type="email"
                                        className="form-input checkout-input disabled"
                                        value={user?.email || ''}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        className="form-input checkout-input disabled"
                                        value={user?.phone || '-'}
                                        disabled
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        ที่อยู่จัดส่ง <span className="required">*</span>
                                    </label>
                                    <textarea
                                        className="form-textarea checkout-textarea"
                                        value={shippingAddress}
                                        onChange={handleAddressChange}
                                        required
                                        rows="3"
                                        placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="checkout-summary-section">
                            <div className="section-header">
                                <span className="section-icon">🛒</span>
                                <h2>สรุปคำสั่งซื้อ</h2>
                                <span className="item-count-badge">{itemCount} ชิ้น</span>
                            </div>

                            {/* Order Items List */}
                            <div className="checkout-order-items">
                                {cartItems.map((item) => (
                                    <OrderItemCard key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Price Summary */}
                            <div className="checkout-price-summary">
                                <SummaryRow label="ราคาสินค้า" value={total} />
                                <SummaryRow
                                    label="ค่าจัดส่ง"
                                    value={shippingFee === 0 ? 'ฟรี! 🎉' : shippingFee}
                                    isFree={shippingFee === 0}
                                />

                                {shippingFee > 0 && (
                                    <div className="shipping-promo-notice">
                                        <span>💡</span>
                                        <span>สั่งครบ ฿1,000 ส่งฟรี! เหลืออีก {currencyFormatter.format(1000 - total)}</span>
                                    </div>
                                )}

                                <div className="price-divider"></div>

                                <SummaryRow
                                    label="ยอดรวมทั้งสิ้น"
                                    value={grandTotal}
                                    isTotal
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="checkout-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        <span>กำลังดำเนินการ...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🛍️</span>
                                        <span>ยืนยันการสั่งซื้อ</span>
                                        <span className="btn-price">{currencyFormatter.format(grandTotal)}</span>
                                    </>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="checkout-trust-badges">
                                <div className="trust-badge">
                                    <span>🔒</span>
                                    <span>ปลอดภัย</span>
                                </div>
                                <div className="trust-badge">
                                    <span>✅</span>
                                    <span>รับประกันคุณภาพ</span>
                                </div>
                                <div className="trust-badge">
                                    <span>🚚</span>
                                    <span>จัดส่งเร็ว</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccess}
                onClose={handleSuccessClose}
                orderDetails={orderDetails}
            />
        </div>
    );
}

export default Checkout;
