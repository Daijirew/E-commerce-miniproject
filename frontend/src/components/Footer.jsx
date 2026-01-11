import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">🐾 Pet Food Shop</h3>
                        <p className="footer-text">
                            ร้านขายอาหารสัตว์เลี้ยงออนไลน์ คุณภาพดี ราคาถูก
                            เพื่อสุขภาพที่ดีของสัตว์เลี้ยงคุณ
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">เมนู</h4>
                        <ul className="footer-links">
                            <li><a href="/">หน้าหลัก</a></li>
                            <li><a href="/products">สินค้า</a></li>
                            <li><a href="/about">เกี่ยวกับเรา</a></li>
                            <li><a href="/contact">ติดต่อเรา</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">ช่วยเหลือ</h4>
                        <ul className="footer-links">
                            <li><a href="/shipping">การจัดส่ง</a></li>
                            <li><a href="/returns">การคืนสินค้า</a></li>
                            <li><a href="/faq">คำถามที่พบบ่อย</a></li>
                            <li><a href="/terms">ข้อกำหนดและเงื่อนไข</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-subtitle">ติดตามเรา</h4>
                        <div className="social-links">
                            <a href="#" className="social-link">📘 Facebook</a>
                            <a href="#" className="social-link">📷 Instagram</a>
                            <a href="#" className="social-link">🐦 Twitter</a>
                            <a href="#" className="social-link">📧 Email</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Pet Food Shop. สงวนลิขสิทธิ์.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
