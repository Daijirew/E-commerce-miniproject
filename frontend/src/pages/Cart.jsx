import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import useModalStore from '../store/useModalStore';
import api from '../services/api';
import './Cart.css';

function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { cartItems, fetchCart, updateCartItem, removeFromCart, getCartTotal, isLoading } = useCartStore();
    const { addToast } = useToastStore();
    const { confirm: showConfirm } = useModalStore();
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const handleQuantityChange = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(cartId, newQuantity);
        } catch (error) {
            addToast({
                type: 'error',
                message: 'ไม่สามารถอัพเดทจำนวนได้',
            });
        }
    };

    const handleRemove = async (cartId) => {
        const confirmed = await showConfirm(
            'ต้องการลบสินค้านี้ออกจากตะกร้า?',
            'ยืนยันการลบ'
        );

        if (confirmed) {
            try {
                await removeFromCart(cartId);
                addToast({
                    type: 'success',
                    message: 'ลบสินค้าออกจากตะกร้าแล้ว',
                });
            } catch (error) {
                addToast({
                    type: 'error',
                    message: 'ไม่สามารถลบสินค้าได้',
                });
            }
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            addToast({
                type: 'warning',
                message: 'ตะกร้าสินค้าว่างเปล่า',
            });
            return;
        }
        navigate('/checkout');
    };

    const total = getCartTotal();

    if (isLoading) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="loading">กำลังโหลด...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="page-title">ตะกร้าสินค้า 🛒</h1>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-icon">🛒</div>
                        <h2>ตะกร้าสินค้าว่างเปล่า</h2>
                        <p>ยังไม่มีสินค้าในตะกร้า เริ่มช้อปปิ้งเลย!</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="btn btn-primary btn-lg"
                        >
                            เลือกซื้อสินค้า
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item fade-in">
                                    <img
                                        src={item.product?.image_url || 'https://via.placeholder.com/150'}
                                        alt={item.product?.name}
                                        className="cart-item-image"
                                    />

                                    <div className="cart-item-details">
                                        <h3 className="cart-item-name">{item.product?.name}</h3>
                                        {item.product?.brand && (
                                            <p className="cart-item-brand">{item.product.brand}</p>
                                        )}
                                        {item.product?.weight && (
                                            <p className="cart-item-weight">{item.product.weight}</p>
                                        )}
                                    </div>

                                    <div className="cart-item-price">
                                        ฿{item.product?.price.toLocaleString()}
                                    </div>

                                    <div className="cart-item-quantity">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            disabled={isLoading}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={isLoading}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item-total">
                                        ฿{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                    </div>

                                    <button
                                        className="cart-item-remove"
                                        onClick={() => handleRemove(item.id)}
                                        disabled={isLoading}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2 className="summary-title">สรุปคำสั่งซื้อ</h2>

                            <div className="summary-row">
                                <span>ราคารวม ({cartItems.length} รายการ)</span>
                                <span className="summary-value">฿{total.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>ค่าจัดส่ง</span>
                                <span className="summary-value">
                                    {total >= 1000 ? (
                                        <span className="free-shipping">ฟรี! 🎉</span>
                                    ) : total >= 500 ? (
                                        '฿25'
                                    ) : (
                                        '฿50'
                                    )}
                                </span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row summary-total">
                                <span>ยอดรวมทั้งสิ้น</span>
                                <span className="total-amount">
                                    ฿{(total >= 1000 ? total : total + 50).toLocaleString()}
                                </span>
                            </div>

                            {total < 1000 && (
                                <p className="shipping-notice">
                                    ซื้อเพิ่มอีก ฿{(1000 - total).toLocaleString()} รับส่งฟรี!
                                </p>
                            )}

                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleCheckout}
                                disabled={checkingOut}
                            >
                                {checkingOut ? 'กำลังดำเนินการ...' : 'ดำเนินการชำระเงิน →'}
                            </button>

                            <button
                                className="btn btn-outline btn-block"
                                onClick={() => navigate('/products')}
                            >
                                ← เลือกซื้อสินค้าต่อ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;
