import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ToastContainer from './components/Toast';
import Modal from './components/Modal';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import './index.css';

// Lazy load admin pages for better performance
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

// Loading fallback for admin pages
const AdminLoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '2rem',
        color: 'var(--text-secondary)'
    }}>
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>กำลังโหลด...</div>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Admin Routes - No Header/Footer */}
                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={
                            <Suspense fallback={<AdminLoadingFallback />}>
                                <AdminDashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="products"
                        element={
                            <Suspense fallback={<AdminLoadingFallback />}>
                                <AdminProducts />
                            </Suspense>
                        }
                    />
                    <Route
                        path="orders"
                        element={
                            <Suspense fallback={<AdminLoadingFallback />}>
                                <AdminOrders />
                            </Suspense>
                        }
                    />
                </Route>

                {/* Main Site Routes */}
                <Route
                    path="/*"
                    element={
                        <div className="app">
                            <ToastContainer />
                            <Modal />
                            <Header />
                            <main>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        path="/products"
                                        element={
                                            <ProtectedRoute>
                                                <Products />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route
                                        path="/orders"
                                        element={
                                            <ProtectedRoute>
                                                <MyOrders />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </main>
                            <Footer />
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;


