import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import './MyOrders.css';

// Currency formatter
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
});

// Date formatter
const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'รอดำเนินการ', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    processing: { label: 'กำลังดำเนินการ', color: '#3b82f6', bg: '#dbeafe', icon: '🔄' },
    shipped: { label: 'จัดส่งแล้ว', color: '#8b5cf6', bg: '#ede9fe', icon: '🚚' },
    delivered: { label: 'ได้รับสินค้าแล้ว', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    cancelled: { label: 'ยกเลิก', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

// Status Badge Component
const StatusBadge = memo(({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span
            className="order-status-badge"
            style={{
                color: config.color,
                backgroundColor: config.bg,
            }}
        >
            <span className="status-icon">{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
});

// Order Item Row in Modal
const OrderItemRow = memo(({ item }) => (
    <div className="order-modal-item">
        <div className="order-modal-item-image">
            <img
                src={item.product?.image_url || 'https://via.placeholder.com/60'}
                alt={item.product?.name || 'Product'}
            />
        </div>
        <div className="order-modal-item-details">
            <h4>{item.product?.name || 'สินค้า'}</h4>
            <span className="item-price">
                {currencyFormatter.format(item.price)} × {item.quantity}
            </span>
        </div>
        <div className="order-modal-item-total">
            {currencyFormatter.format(item.quantity * item.price)}
        </div>
    </div>
));

// Order Detail Modal
const OrderDetailModal = memo(({ order, onClose }) => {
    if (!order) return null;

    const itemsTotal = order.order_items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

    return (
        <div className="order-modal-overlay" onClick={onClose}>
            <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="order-modal-header">
                    <div className="order-modal-header-info">
                        <h2>รายละเอียดคำสั่งซื้อ</h2>
                        <span className="order-id-badge">#{order.id.substring(0, 8)}</span>
                    </div>
                    <button className="order-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="order-modal-body">
                    {/* Status & Summary */}
                    <div className="order-summary-card">
                        <div className="order-summary-row">
                            <span className="label">สถานะ</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <div className="order-summary-row">
                            <span className="label">วันที่สั่งซื้อ</span>
                            <span className="value">{dateFormatter.format(new Date(order.created_at))}</span>
                        </div>
                        <div className="order-summary-row">
                            <span className="label">ยอดรวม</span>
                            <span className="value total-amount">{currencyFormatter.format(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="order-info-section">
                        <h3><span>📍</span> ที่อยู่จัดส่ง</h3>
                        <p className="shipping-address">{order.shipping_address || '-'}</p>
                    </div>

                    {/* Order Items */}
                    <div className="order-info-section">
                        <h3><span>🛒</span> รายการสินค้า ({order.order_items?.length || 0} รายการ)</h3>
                        <div className="order-modal-items">
                            {order.order_items?.map(item => (
                                <OrderItemRow key={item.id} item={item} />
                            ))}
                        </div>
                        <div className="order-items-total">
                            <span>รวมทั้งหมด</span>
                            <span>{currencyFormatter.format(itemsTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="order-modal-footer">
                    <button className="btn-close-modal" onClick={onClose}>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
});

// Order Card Component
const OrderCard = memo(({ order, onViewDetail }) => {
    const itemCount = order.order_items?.length || 0;
    const firstItems = order.order_items?.slice(0, 3) || [];

    return (
        <div className="order-card" onClick={() => onViewDetail(order)}>
            <div className="order-card-header">
                <div className="order-card-id">
                    <span className="order-id">คำสั่งซื้อ #{order.id.substring(0, 8)}</span>
                    <span className="order-date">{dateFormatter.format(new Date(order.created_at))}</span>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="order-card-items">
                <div className="order-items-preview">
                    {firstItems.map(item => (
                        <div key={item.id} className="order-item-preview">
                            <img
                                src={item.product?.image_url || 'https://via.placeholder.com/50'}
                                alt={item.product?.name || 'Product'}
                            />
                        </div>
                    ))}
                    {itemCount > 3 && (
                        <div className="order-item-more">
                            +{itemCount - 3}
                        </div>
                    )}
                </div>
                <div className="order-items-info">
                    <span className="items-count">{itemCount} รายการ</span>
                </div>
            </div>

            <div className="order-card-footer">
                <div className="order-total">
                    <span className="total-label">ยอดรวม</span>
                    <span className="total-amount">{currencyFormatter.format(order.total_amount)}</span>
                </div>
                <button className="btn-view-detail" onClick={(e) => { e.stopPropagation(); onViewDetail(order); }}>
                    ดูรายละเอียด
                </button>
            </div>
        </div>
    );
});

// Empty Orders State
const EmptyOrders = memo(() => (
    <div className="empty-orders">
        <div className="empty-icon">📦</div>
        <h2>ยังไม่มีคำสั่งซื้อ</h2>
        <p>คุณยังไม่มีประวัติการสั่งซื้อ เริ่มช้อปปิ้งเลย!</p>
        <Link to="/products" className="btn btn-primary">
            เลือกซื้อสินค้า
        </Link>
    </div>
));

// Main Component
function MyOrders() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/orders');
                setOrders(response.data.orders || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated]);

    const handleViewDetail = useCallback((order) => {
        setSelectedOrder(order);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedOrder(null);
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">
                        <span className="title-icon">📋</span>
                        คำสั่งซื้อของฉัน
                    </h1>
                    <p className="page-subtitle">ดูประวัติและสถานะคำสั่งซื้อทั้งหมดของคุณ</p>
                </div>

                {loading ? (
                    <div className="orders-loading">
                        <div className="loading-spinner"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="orders-error">
                        <span className="error-icon">⚠️</span>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            ลองใหม่
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <EmptyOrders />
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onViewDetail={handleViewDetail}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

export default MyOrders;
