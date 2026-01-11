import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useToastStore from '../store/useToastStore';
import './Login.css';

function Register() {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (formData.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
            });

            addToast({
                type: 'success',
                title: 'สำเร็จ!',
                message: 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ',
                duration: 2000,
            });
            setTimeout(() => navigate('/login'), 500);
        } catch (err) {
            setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card fade-in">
                    <div className="auth-header">
                        <h1 className="auth-title">สมัครสมาชิก</h1>
                        <p className="auth-subtitle">สร้างบัญชีใหม่ 🎉</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">ชื่อ-นามสกุล *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="ชื่อ นามสกุล"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">อีเมล *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">เบอร์โทรศัพท์</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="08X-XXX-XXXX"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ที่อยู่</label>
                            <textarea
                                className="form-textarea"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="ที่อยู่สำหรับจัดส่ง"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">รหัสผ่าน *</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">ยืนยันรหัสผ่าน *</label>
                            <input
                                type="password"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                placeholder="กรอกรหัสผ่านอีกครั้ง"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>มีบัญชีอยู่แล้ว? <Link to="/login" className="auth-link">เข้าสู่ระบบ</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
