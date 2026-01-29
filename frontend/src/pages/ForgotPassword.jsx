import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css'; // Reusing Login styles for consistency

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            // For this demo, we might show the token or just a success message
            // In a real app, we'd say "Check your email"
            // Since we're simulating, let's look at the response
            if (response.data.token) {
                console.log("Reset Token:", response.data.token);
                setMessage(`อีเมลถูกส่งเรียบร้อยแล้ว (Simulated: Check console for token)`);
            } else {
                setMessage('อีเมลถูกส่งเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card fade-in">
                    <div className="auth-header">
                        <h1 className="auth-title">ลืมรหัสผ่าน?</h1>
                        <p className="auth-subtitle">กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน 🔒</p>
                    </div>

                    {status === 'success' ? (
                        <div className="success-message-container">
                            <div className="success-icon">✉️</div>
                            <h3>ตรวจสอบอีเมลของคุณ</h3>
                            <p>{message}</p>
                            <p className="small-text">เราได้ส่งขั้นตอนการรีเซ็ตรหัสผ่านไปที่ {email} แล้ว</p>
                            <Link to="/login" className="btn btn-primary btn-block mt-4">
                                กลับไปหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            {status === 'error' && (
                                <div className="error-message">
                                    ⚠️ {message}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">อีเมลที่ลงทะเบียน</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="your@email.com"
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                            </button>

                            <div className="auth-footer">
                                <Link to="/login" className="auth-link">กลับไปหน้าเข้าสู่ระบบ</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
