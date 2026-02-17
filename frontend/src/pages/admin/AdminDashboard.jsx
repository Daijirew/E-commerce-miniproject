import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import api from '../../services/api';
import './Admin.css';

// Currency & Date formatters - created once outside component
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

// Memoized Stat Card Component
const StatCard = memo(({ icon, value, label, variant }) => (
    <div className={`stat-card ${variant}`}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    </div>
));

// Memoized Status Badge Component
const StatusBadge = memo(({ status }) => {
    const getStatusColor = (status) => {
        const colors = {
            pending: 'status-pending',
            processing: 'status-processing',
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled',
        };
        return colors[status] || '';
    };

    return (
        <span className={`status-badge ${getStatusColor(status)}`}>
            {status}
        </span>
    );
});

// Memoized Order Row Component
const OrderRow = memo(({ order }) => (
    <tr>
        <td className="order-id">{order.id.substring(0, 8)}...</td>
        <td>{order.user?.name || order.user?.email || 'N/A'}</td>
        <td className="amount">{currencyFormatter.format(order.total_amount)}</td>
        <td><StatusBadge status={order.status} /></td>
        <td>{dateFormatter.format(new Date(order.created_at))}</td>
    </tr>
));

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/admin/orders');
            const ordersData = response.data.orders || [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoized stats calculation
    const stats = useMemo(() => ({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        processingOrders: orders.filter(o => o.status === 'processing').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    }), [orders]);

    // Memoized recent orders (top 10)
    const recentOrders = useMemo(() => orders.slice(0, 10), [orders]);

    // Memoized status items
    const statusItems = useMemo(() => [
        { key: 'pending', label: 'Pending', count: stats.pendingOrders },
        { key: 'processing', label: 'Processing', count: stats.processingOrders },
        { key: 'shipped', label: 'Shipped', count: stats.shippedOrders },
        { key: 'delivered', label: 'Delivered', count: stats.deliveredOrders },
        { key: 'cancelled', label: 'Cancelled', count: stats.cancelledOrders },
    ], [stats]);

    if (loading) {
        return <div className="loading">กำลังโหลด...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>📊 Dashboard</h2>
                <p className="subtitle">สรุปภาพรวมร้านค้าของคุณ</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard
                    icon="📦"
                    value={stats.totalOrders}
                    label="คำสั่งซื้อทั้งหมด"
                    variant="primary"
                />
                <StatCard
                    icon="💰"
                    value={currencyFormatter.format(stats.totalRevenue)}
                    label="รายได้รวม"
                    variant="success"
                />
                <StatCard
                    icon="⏳"
                    value={stats.pendingOrders}
                    label="รอดำเนินการ"
                    variant="warning"
                />
                <StatCard
                    icon="🚚"
                    value={stats.shippedOrders}
                    label="กำลังจัดส่ง"
                    variant="info"
                />
            </div>

            {/* Status Summary */}
            <div className="section">
                <h3>📈 สถานะคำสั่งซื้อ</h3>
                <div className="status-summary">
                    {statusItems.map(item => (
                        <div key={item.key} className="status-item">
                            <StatusBadge status={item.key} />
                            <span className="status-count">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="section">
                <h3>🕐 คำสั่งซื้อล่าสุด</h3>
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>ลูกค้า</th>
                                <th>ยอดรวม</th>
                                <th>สถานะ</th>
                                <th>วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                />
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="empty-state">ยังไม่มีคำสั่งซื้อ</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
