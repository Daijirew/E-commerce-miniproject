import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import api from '../../services/api';
import './Admin.css';

// Memoized Status Select Component
const StatusSelect = memo(({ orderId, status, options, onChange, getStatusColor }) => (
    <select
        className={`status-select ${getStatusColor(status)}`}
        value={status}
        onChange={(e) => onChange(orderId, e.target.value)}
        onClick={(e) => e.stopPropagation()}
    >
        {options.map(s => (
            <option key={s} value={s}>{s}</option>
        ))}
    </select>
));

// Memoized Order Row Component
const OrderRow = memo(({
    order,
    formatCurrency,
    formatDate,
    getStatusColor,
    statusOptions,
    onStatusChange,
    onViewDetail
}) => (
    <tr className="order-row">
        <td className="order-id">{order.id.substring(0, 8)}...</td>
        <td>
            <div>
                <strong>{order.user?.name || 'N/A'}</strong>
                <br />
                <small style={{ color: 'var(--text-secondary)' }}>
                    {order.user?.email || ''}
                </small>
            </div>
        </td>
        <td>
            <span className="order-items-preview">
                {order.order_items?.length || 0} รายการ
            </span>
        </td>
        <td className="amount">{formatCurrency(order.total_amount)}</td>
        <td>
            <StatusSelect
                orderId={order.id}
                status={order.status}
                options={statusOptions}
                onChange={onStatusChange}
                getStatusColor={getStatusColor}
            />
        </td>
        <td>{formatDate(order.created_at)}</td>
        <td>
            <button
                className="btn-icon"
                onClick={() => onViewDetail(order)}
                title="ดูรายละเอียด"
            >
                👁️
            </button>
        </td>
    </tr>
));

// Memoized Order Item Component
const OrderItem = memo(({ item, formatCurrency }) => (
    <div className="order-item">
        <div className="item-info">
            <span className="item-name">{item.product?.name || 'Unknown Product'}</span>
            <span className="item-qty">x{item.quantity} @ {formatCurrency(item.price)}</span>
        </div>
        <span className="item-price">
            {formatCurrency(item.quantity * item.price)}
        </span>
    </div>
));

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleStatusChange = useCallback(async (orderId, newStatus) => {
        setUpdatingStatus(orderId);
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
        } finally {
            setUpdatingStatus(null);
        }
    }, []);

    const openDetailModal = useCallback((order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    }, []);

    const closeDetailModal = useCallback(() => {
        setShowDetailModal(false);
    }, []);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(amount);
    }, []);

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const getStatusColor = useCallback((status) => {
        const colors = {
            pending: 'status-pending',
            processing: 'status-processing',
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled',
        };
        return colors[status] || '';
    }, []);

    // Memoized filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => !statusFilter || order.status === statusFilter);
    }, [orders, statusFilter]);

    // Memoized status options for filter dropdown
    const statusFilterOptions = useMemo(() =>
        STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status}</option>
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
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                    getStatusColor={getStatusColor}
                                    statusOptions={STATUS_OPTIONS}
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
            {showDetailModal && selectedOrder && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📋 รายละเอียดคำสั่งซื้อ</h3>
                            <button className="modal-close" onClick={closeDetailModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail">
                                <div className="order-info">
                                    <div className="info-item">
                                        <span className="info-label">Order ID</span>
                                        <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                                            {selectedOrder.id}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">สถานะ</span>
                                        <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">ลูกค้า</span>
                                        <span className="info-value">{selectedOrder.user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">อีเมล</span>
                                        <span className="info-value">{selectedOrder.user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">วันที่สั่งซื้อ</span>
                                        <span className="info-value">{formatDate(selectedOrder.created_at)}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">ยอดรวม</span>
                                        <span className="info-value" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                                            {formatCurrency(selectedOrder.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item" style={{ marginBottom: 'var(--space-lg)' }}>
                                    <span className="info-label">ที่อยู่จัดส่ง</span>
                                    <span className="info-value">{selectedOrder.shipping_address}</span>
                                </div>

                                <div className="order-items-list">
                                    <h4>🛍️ รายการสินค้า ({selectedOrder.order_items?.length || 0} รายการ)</h4>
                                    {selectedOrder.order_items?.map((item, index) => (
                                        <OrderItem
                                            key={index}
                                            item={item}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={closeDetailModal}>
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
