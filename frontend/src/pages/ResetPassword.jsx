import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน กรุณาขอลิงก์ใหม่');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await api.post('/auth/reset-password', {
                token,
                password
            });
            setStatus('success');
            setMessage('รีเซ็ตรหัสผ่านสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
        }
    };

    if (!token) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="error-message">⚠️ {message}</div>
                        <button onClick={() => navigate('/forgot-password')} className="btn btn-primary btn-block mt-4">
                            ขอลิงก์รีเซ็ตรหัสผ่านใหม่
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card fade-in">
                    <div className="auth-header">
                        <h1 className="auth-title">ตั้งค่ารหัสผ่านใหม่</h1>
                        <p className="auth-subtitle">ใส่รหัสผ่านใหม่ของคุณ 🔑</p>
                    </div>

                    {status === 'success' ? (
                        <div className="success-message">
                            ✅ {message}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="auth-form">
                            {status === 'error' && (
                                <div className="error-message">
                                    ⚠️ {message}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">รหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
