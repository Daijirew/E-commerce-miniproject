import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import './Cart.css';

function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { cartItems, getCartTotal, clearCart } = useCartStore();
    const [shippingAddress, setShippingAddress] = useState(user?.address || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const total = getCartTotal();
    const shippingFee = total >= 1000 ? 0 : 50;
    const grandTotal = total + shippingFee;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shippingAddress.trim()) {
            setError('กรุณากรอกที่อยู่จัดส่ง');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/orders', {
                shipping_address: shippingAddress,
            });

            alert('สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ 🎉');
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">ชำระเงิน 💳</h1>

                {error && (
                    <div className="error-message" style={{ maxWidth: '800px', margin: '0 auto var(--space-lg)' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="checkout-content">
                        <div className="checkout-section">
                            <h2 className="section-title">ข้อมูลการจัดส่ง</h2>

                            <div className="form-group">
                                <label className="form-label">ชื่อผู้รับ</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={user?.name || ''}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">อีเมล</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={user?.email || ''}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">เบอร์โทรศัพท์</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={user?.phone || ''}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">ที่อยู่จัดส่ง *</label>
                                <textarea
                                    className="form-textarea"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    required
                                    rows="4"
                                    placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า"
                                />
                            </div>
                        </div>

                        <div className="checkout-summary">
                            <h2 className="section-title">สรุปคำสั่งซื้อ</h2>

                            <div className="order-items">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="order-item">
                                        <img
                                            src={item.product?.image_url || 'https://via.placeholder.com/60'}
                                            alt={item.product?.name}
                                            className="order-item-image"
                                        />
                                        <div className="order-item-info">
                                            <div className="order-item-name">{item.product?.name}</div>
                                            <div className="order-item-quantity">x {item.quantity}</div>
                                        </div>
                                        <div className="order-item-price">
                                            ฿{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row">
                                <span>ราคารวม</span>
                                <span>฿{total.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>ค่าจัดส่ง</span>
                                <span>{shippingFee === 0 ? <span className="free-shipping">ฟรี! 🎉</span> : `฿${shippingFee}`}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row summary-total">
                                <span>ยอดรวมทั้งสิ้น</span>
                                <span className="total-amount">฿{grandTotal.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'กำลังดำเนินการ...' : `ยืนยันการสั่งซื้อ (฿${grandTotal.toLocaleString()})`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
