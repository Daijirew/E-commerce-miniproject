import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import './ProductCard.css';

function ProductCard({ product }) {
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { addToast } = useToastStore();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        setIsAdding(true);
        try {
            await addToCart(product.id, 1);
            addToast({
                type: 'success',
                title: 'สำเร็จ!',
                message: `เพิ่ม ${product.name} ลงตะกร้าแล้ว`,
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'เกิดข้อผิดพลาด!',
                message: error.response?.data?.error || 'ไม่สามารถเพิ่มสินค้าได้',
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-image-wrapper">
                <img
                    src={product.image_url || 'https://via.placeholder.com/300x300?text=Pet+Food'}
                    alt={product.name}
                    className="product-image"
                />
                {product.stock <= 0 && (
                    <div className="out-of-stock-badge">สินค้าหมด</div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.brand && <p className="product-brand">{product.brand}</p>}
                {product.weight && <p className="product-weight">{product.weight}</p>}

                <div className="product-footer">
                    <div className="product-price">
                        <span className="price-amount">฿{product.price.toLocaleString()}</span>
                        {product.stock > 0 && product.stock <= 10 && (
                            <span className="stock-warning">เหลือ {product.stock} ชิ้น</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0 || isAdding}
                        className="add-to-cart-btn"
                    >
                        {isAdding ? '🔄' : '🛒'} {isAdding ? 'กำลังเพิ่ม...' : 'ใส่ตะกร้า'}
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
