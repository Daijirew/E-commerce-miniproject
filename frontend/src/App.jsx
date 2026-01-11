import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';
import Modal from './components/Modal';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import './index.css';

function App() {
    return (
        <BrowserRouter>
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
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
