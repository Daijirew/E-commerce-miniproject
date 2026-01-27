import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import api from '../../services/api';
import './Admin.css';

// Currency formatter - created once outside component
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
});

// Date formatter
const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

// Status configuration
const STATUS_CONFIG = {
    pending: { label: 'รอดำเนินการ', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    processing: { label: 'กำลังดำเนินการ', color: '#3b82f6', bg: '#dbeafe', icon: '🔄' },
    shipped: { label: 'จัดส่งแล้ว', color: '#8b5cf6', bg: '#ede9fe', icon: '🚚' },
    delivered: { label: 'ส่งมอบแล้ว', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    cancelled: { label: 'ยกเลิก', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);

// Memoized Status Badge Component
const StatusBadge = memo(({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span
            className="status-badge-enhanced"
            style={{
                color: config.color,
                backgroundColor: config.bg,
            }}
        >
            <span className="status-icon">{config.icon}</span>
            {config.label}
        </span>
    );
});

// Memoized Status Select Component
const StatusSelect = memo(({ orderId, status, onChange }) => (
    <select
        className={`status-select status-${status}`}
        value={status}
        onChange={(e) => onChange(orderId, e.target.value)}
        onClick={(e) => e.stopPropagation()}
    >
        {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
        ))}
    </select>
));

// Memoized Order Row Component
const OrderRow = memo(({ order, onStatusChange, onViewDetail }) => (
    <tr className="order-row">
        <td className="order-id">{order.id.substring(0, 8)}...</td>
        <td>
            <div className="customer-info">
                <span className="customer-name">{order.user?.name || 'N/A'}</span>
                <span className="customer-email">{order.user?.email || ''}</span>
            </div>
        </td>
        <td>
            <span className="order-items-badge">
                {order.order_items?.length || 0} รายการ
            </span>
        </td>
        <td className="amount">{currencyFormatter.format(order.total_amount)}</td>
        <td>
            <StatusSelect
                orderId={order.id}
                status={order.status}
                onChange={onStatusChange}
            />
        </td>
        <td className="date-cell">{dateFormatter.format(new Date(order.created_at))}</td>
        <td>
            <button
                className="btn-view-detail"
                onClick={() => onViewDetail(order)}
                title="ดูรายละเอียด"
            >
                👁️ ดู
            </button>
        </td>
    </tr>
));

// Memoized Order Item Component for Modal
const OrderItemRow = memo(({ item }) => (
    <div className="order-detail-item">
        <div className="order-detail-item-image">
            <img
                src={item.product?.image_url || 'https://via.placeholder.com/60'}
                alt={item.product?.name}
                loading="lazy"
            />
        </div>
        <div className="order-detail-item-info">
            <span className="order-detail-item-name">{item.product?.name || 'Unknown Product'}</span>
            <span className="order-detail-item-meta">
                {currencyFormatter.format(item.price)} × {item.quantity}
            </span>
        </div>
        <div className="order-detail-item-total">
            {currencyFormatter.format(item.quantity * item.price)}
        </div>
    </div>
));

// Order Detail Modal Component
const OrderDetailModal = memo(({ order, onClose }) => {
    if (!order) return null;

    const itemsTotal = order.order_items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-detail-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="order-detail-header">
                    <div className="order-detail-header-content">
                        <span className="order-detail-icon">📋</span>
                        <div>
                            <h3>รายละเอียดคำสั่งซื้อ</h3>
                            <span className="order-id-badge">#{order.id.substring(0, 8)}</span>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <span>✕</span>
                    </button>
                </div>

                {/* Body */}
                <div className="order-detail-body">
                    {/* Status & Summary Card */}
                    <div className="order-summary-card">
                        <div className="order-summary-row">
                            <span className="order-summary-label">สถานะ</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <div className="order-summary-row">
                            <span className="order-summary-label">ยอดรวม</span>
                            <span className="order-summary-total">{currencyFormatter.format(order.total_amount)}</span>
                        </div>
                        <div className="order-summary-row">
                            <span className="order-summary-label">วันที่สั่งซื้อ</span>
                            <span className="order-summary-value">{dateFormatter.format(new Date(order.created_at))}</span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="order-info-section">
                        <h4 className="order-info-title">
                            <span>👤</span> ข้อมูลลูกค้า
                        </h4>
                        <div className="order-info-grid">
                            <div className="order-info-item">
                                <span className="order-info-label">ชื่อ</span>
                                <span className="order-info-value">{order.user?.name || 'N/A'}</span>
                            </div>
                            <div className="order-info-item">
                                <span className="order-info-label">อีเมล</span>
                                <span className="order-info-value">{order.user?.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="order-info-section">
                        <h4 className="order-info-title">
                            <span>📍</span> ที่อยู่จัดส่ง
                        </h4>
                        <p className="shipping-address-text">{order.shipping_address || '-'}</p>
                    </div>

                    {/* Order Items */}
                    <div className="order-info-section">
                        <h4 className="order-info-title">
                            <span>🛒</span> รายการสินค้า
                            <span className="items-count-badge">{order.order_items?.length || 0}</span>
                        </h4>
                        <div className="order-detail-items-list">
                            {order.order_items?.map((item, index) => (
                                <OrderItemRow key={index} item={item} />
                            ))}
                        </div>
                        <div className="order-items-total">
                            <span>รวม</span>
                            <span>{currencyFormatter.format(itemsTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="order-detail-footer">
                    <button className="btn-close-modal" onClick={onClose}>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
});

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadOrders = async () => {
            try {
                const response = await api.get('/admin/orders');
                if (mounted) {
                    setOrders(response.data.orders || []);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadOrders();
        return () => { mounted = false; };
    }, []);

    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    }, []);

    const openDetailModal = useCallback((order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    }, []);

    const closeDetailModal = useCallback(() => {
        setShowDetailModal(false);
    }, []);

    // Memoized filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => !statusFilter || order.status === statusFilter);
    }, [orders, statusFilter]);

    // Memoized status options for filter dropdown
    const statusFilterOptions = useMemo(() =>
        STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
        )), []);

    if (loading) {
        return <div className="loading">กำลังโหลด...</div>;
    }

    return (
        <div className="admin-orders">
            <div className="page-header">
                <h2>🛒 จัดการคำสั่งซื้อ</h2>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">สถานะทั้งหมด</option>
                    {statusFilterOptions}
                </select>
                <span className="orders-count">
                    แสดง {filteredOrders.length} จาก {orders.length} รายการ
                </span>
            </div>

            {/* Orders Table */}
            <div className="section">
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>ลูกค้า</th>
                                <th>รายการ</th>
                                <th>ยอดรวม</th>
                                <th>สถานะ</th>
                                <th>วันที่</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    onStatusChange={handleStatusChange}
                                    onViewDetail={openDetailModal}
                                />
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="empty-state">ไม่พบคำสั่งซื้อ</div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {showDetailModal && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={closeDetailModal}
                />
            )}
        </div>
    );
};

export default AdminOrders;
