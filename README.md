# 🐾 Pet Food E-commerce Platform

โปรเจค E-commerce สำหรับขายอาหารสัตว์เลี้ยง สร้างด้วย React (Frontend), Golang (Backend), และ Supabase (Database)  
รองรับ Docker Deployment พร้อม Swagger API Documentation

---

## 🚀 Technology Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Frontend** | React 19 | UI Framework |
| | Vite 7 | Build Tool & Dev Server |
| | React Router 7 | Client-side Routing |
| | Zustand 5 | State Management |
| | Axios | HTTP Client |
| | Vanilla CSS | Design System & Styling |
| **Backend** | Golang | Programming Language |
| | Gin | Web Framework |
| | GORM | ORM |
| | Swagger (swaggo) | API Documentation |
| | JWT | Authentication |
| | bcrypt | Password Hashing |
| **Database** | PostgreSQL (Supabase) | Database as a Service |
| **DevOps** | Docker & Docker Compose | Containerization |
| | Nginx | Frontend Production Server |
| | GitHub Actions | CI/CD Pipeline |

---

## 📁 Project Structure

```
E-commerce-miniproject/
├── .github/
│   └── workflows/         # CI/CD pipeline (GitHub Actions)
│
├── backend/
│   ├── config/            # Database configuration
│   ├── controllers/       # API controllers (auth, cart, category, order, product)
│   ├── docs/              # Swagger API documentation (auto-generated)
│   ├── middleware/        # Authentication & Admin middleware
│   ├── models/            # Database models (user, product, category, cart, order)
│   ├── routes/            # API route definitions
│   ├── main.go            # Entry point
│   ├── Dockerfile         # Multi-stage Docker build
│   ├── seed.sql           # Database seed data
│   ├── seed_admin.go      # Admin user seeder
│   ├── go.mod             # Go dependencies
│   └── .env.example       # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Header        # Navigation bar
│   │   │   ├── Footer        # Site footer
│   │   │   ├── ProductCard   # Product display card
│   │   │   ├── AdminLayout   # Admin panel layout
│   │   │   ├── Modal         # Global modal system
│   │   │   ├── Toast         # Toast notification system
│   │   │   ├── ProtectedRoute        # Auth guard
│   │   │   └── AdminProtectedRoute   # Admin auth guard
│   │   ├── pages/
│   │   │   ├── Home          # Landing page
│   │   │   ├── Products      # Product listing with filters
│   │   │   ├── Cart          # Shopping cart
│   │   │   ├── Checkout      # Order checkout
│   │   │   ├── MyOrders      # Order history & tracking
│   │   │   ├── Login         # User login
│   │   │   ├── Register      # User registration
│   │   │   ├── ForgotPassword / ResetPassword  # Password recovery
│   │   │   └── admin/
│   │   │       ├── AdminDashboard   # Admin overview
│   │   │       ├── AdminProducts    # Product management
│   │   │       └── AdminOrders      # Order management
│   │   ├── services/      # API service layer (Axios)
│   │   ├── store/         # Zustand state stores
│   │   │   ├── useAuthStore     # Authentication state
│   │   │   ├── useCartStore     # Cart state
│   │   │   ├── useModalStore    # Modal state
│   │   │   └── useToastStore    # Toast notifications state
│   │   ├── App.jsx        # Main app with routing
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles & design system
│   ├── Dockerfile         # Multi-stage build (Node + Nginx)
│   ├── nginx.conf         # Nginx configuration
│   └── package.json       # Node dependencies
│
├── docker-compose.yml     # Docker orchestration
├── .dockerignore          # Docker ignore rules
└── .env                   # Root environment variables
```

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** v18+
- **Go** v1.21+
- **Supabase** Account (for PostgreSQL database)
- **Docker** & **Docker Compose** (optional, for containerized deployment)

---

### 🖥️ Local Development

#### Backend Setup

```bash
cd backend

# Copy environment variables
copy .env.example .env
```

Configure `.env` with your Supabase credentials:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
PORT=8080
```

```bash
# Install dependencies
go mod download

# Run the server
go run main.go
```

> Backend จะเริ่มทำงานที่ `http://localhost:8080`  
> Swagger Docs จะอยู่ที่ `http://localhost:8080/swagger/index.html`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Configure `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

```bash
# Run the development server
npm run dev
```

> Frontend จะเริ่มทำงานที่ `http://localhost:5173`

---

### 🐳 Docker Deployment

สำหรับการ Deploy แบบ Container ด้วย Docker Compose:

1. สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_KEY=your_supabase_key
```

2. Build และรันด้วย Docker Compose:

```bash
docker compose up -d --build
```

3. ตรวจสอบสถานะ:

```bash
docker compose ps
```

| Service | Port | Description |
|---------|------|-------------|
| `ecommerce-backend` | `8080` | Golang API Server |
| `ecommerce-frontend` | `80` | React App (Nginx) |

ทั้งสอง services มี **health check** ในตัว และ frontend จะรอจนกว่า backend จะพร้อมก่อนเริ่มทำงาน

---

## 📊 Database Schema

```mermaid
erDiagram
    users ||--o{ carts : has
    users ||--o{ orders : places
    categories ||--o{ products : contains
    products ||--o{ carts : "added to"
    products ||--o{ order_items : "included in"
    orders ||--|{ order_items : contains

    users {
        UUID id PK
        TEXT email UK
        TEXT password_hash
        TEXT name
        TEXT phone
        TEXT address
        TEXT role "customer | admin"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    categories {
        UUID id PK
        TEXT name
        TEXT description
        TEXT image_url
        TIMESTAMP created_at
    }

    products {
        UUID id PK
        TEXT name
        TEXT description
        DECIMAL price
        INTEGER stock
        UUID category_id FK
        TEXT image_url
        TEXT brand
        TEXT weight
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    carts {
        UUID id PK
        UUID user_id FK
        UUID product_id FK
        INTEGER quantity
        TIMESTAMP created_at
    }

    orders {
        UUID id PK
        UUID user_id FK
        DECIMAL total_amount
        TEXT status "pending | processing | shipped | delivered | cancelled"
        TEXT shipping_address
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    order_items {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        INTEGER quantity
        DECIMAL price
    }
```

---

## 🔌 API Endpoints

> 📖 API Documentation แบบ interactive อยู่ที่ `/swagger/index.html`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | สมัครสมาชิกใหม่ | ❌ |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| `POST` | `/api/auth/forgot-password` | ขอรีเซ็ตรหัสผ่าน | ❌ |
| `POST` | `/api/auth/reset-password` | รีเซ็ตรหัสผ่าน | ❌ |
| `GET` | `/api/profile` | ดูข้อมูลโปรไฟล์ | ✅ |
| `PUT` | `/api/profile` | แก้ไขข้อมูลโปรไฟล์ | ✅ |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | ดูสินค้าทั้งหมด (pagination & filters) | ❌ |
| `GET` | `/api/products/:id` | ดูรายละเอียดสินค้า | ❌ |
| `GET` | `/api/products/category/:categoryId` | ดูสินค้าตามหมวดหมู่ | ❌ |

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/categories` | ดูหมวดหมู่ทั้งหมด | ❌ |
| `GET` | `/api/categories/:id` | ดูรายละเอียดหมวดหมู่ | ❌ |

### Cart

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cart` | ดูตะกร้าสินค้า | ✅ |
| `POST` | `/api/cart` | เพิ่มสินค้าลงตะกร้า | ✅ |
| `PUT` | `/api/cart/:id` | อัปเดตจำนวนสินค้า | ✅ |
| `DELETE` | `/api/cart/:id` | ลบสินค้าออกจากตะกร้า | ✅ |
| `DELETE` | `/api/cart` | ล้างตะกร้าทั้งหมด | ✅ |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/orders` | สร้างคำสั่งซื้อจากตะกร้า | ✅ |
| `GET` | `/api/orders` | ดูประวัติคำสั่งซื้อ | ✅ |
| `GET` | `/api/orders/:id` | ดูรายละเอียดคำสั่งซื้อ | ✅ |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/admin/products` | เพิ่มสินค้า | 🔑 Admin |
| `PUT` | `/api/admin/products/:id` | แก้ไขสินค้า | 🔑 Admin |
| `DELETE` | `/api/admin/products/:id` | ลบสินค้า | 🔑 Admin |
| `POST` | `/api/admin/categories` | เพิ่มหมวดหมู่ | 🔑 Admin |
| `PUT` | `/api/admin/categories/:id` | แก้ไขหมวดหมู่ | 🔑 Admin |
| `DELETE` | `/api/admin/categories/:id` | ลบหมวดหมู่ | 🔑 Admin |
| `GET` | `/api/admin/orders` | ดูคำสั่งซื้อทั้งหมด | 🔑 Admin |
| `PUT` | `/api/admin/orders/:id/status` | อัปเดตสถานะคำสั่งซื้อ | 🔑 Admin |

---

## ✨ Features

### 👤 สำหรับลูกค้า (Customer)

- ✅ สมัครสมาชิกและเข้าสู่ระบบ (JWT Authentication)
- ✅ ลืมรหัสผ่าน / รีเซ็ตรหัสผ่าน
- ✅ เรียกดูสินค้าพร้อมค้นหาและกรองตามหมวดหมู่
- ✅ ระบบ Pagination สำหรับรายการสินค้า
- ✅ เพิ่มสินค้าลงตะกร้า & อัปเดตจำนวน
- ✅ Checkout และสั่งซื้อสินค้า
- ✅ ดูประวัติคำสั่งซื้อและสถานะการจัดส่ง (My Orders)
- ✅ Responsive Design รองรับทั้ง Mobile และ Desktop

### 🛡️ สำหรับผู้ดูแลระบบ (Admin)

- ✅ Admin Dashboard — ภาพรวมของระบบ
- ✅ จัดการสินค้า (เพิ่ม, แก้ไข, ลบ)
- ✅ จัดการหมวดหมู่ (เพิ่ม, แก้ไข, ลบ)
- ✅ จัดการคำสั่งซื้อ & อัปเดตสถานะ
- ✅ Protected Routes — เฉพาะ Admin เท่านั้น

### 🎨 Design & UX

- 🐾 Pet-themed vibrant color palette
- ⚡ Lazy Loading สำหรับหน้า Admin (Code Splitting)
- 🔔 Toast Notification System
- 📦 Global Modal System
- 📱 Fully Responsive Design
- 🎭 Smooth Animations & Transitions
- 🔒 Secure Authentication with JWT
- 💾 Persistent Cart with Zustand

---

## 🎨 Design System

โปรเจคใช้ Design System ที่ครอบคลุม:

- **CSS Variables** สำหรับ colors, typography, spacing
- **Pet-friendly color palette** (oranges, greens, blues)
- **Inter Font** จาก Google Fonts
- **Glassmorphism UI** สำหรับหน้า Admin
- **Smooth animations & transitions**
- **Responsive utilities**
- **Reusable component styles**

---

## 🔐 Authentication & Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT-based tokens |
| Password Hashing | bcrypt |
| Protected Routes | Frontend route guards + Backend middleware |
| Admin Authorization | Role-based middleware |
| Token Storage | localStorage |
| Token Expiry | Auto-redirect on expiration |
| Password Recovery | Forgot Password / Reset Password flow |
| CORS | Configured for cross-origin requests |
| Docker Security | Non-root user in containers |

---

## 📖 API Documentation (Swagger)

โปรเจคมี Swagger Documentation แบบ interactive:

```
http://localhost:8080/swagger/index.html
```

สร้างจาก annotations ใน Go source code โดยใช้ `swaggo/swag` — ครอบคลุม API ทั้งหมดพร้อม request/response schemas

---

## 🐳 Docker Architecture

```
┌──────────────────────────────────────────┐
│           docker-compose.yml             │
├──────────────────┬───────────────────────┤
│  ecommerce-      │  ecommerce-           │
│  frontend        │  backend              │
│  (Nginx:80)      │  (Gin:8080)           │
│                  │                       │
│  Node 22 Build   │  Go 1.25 Build        │
│  → Nginx Serve   │  → Alpine Runtime     │
├──────────────────┴───────────────────────┤
│           ecommerce-network (bridge)     │
└──────────────────────────────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Supabase        │
          │  (PostgreSQL)    │
          └──────────────────┘
```

- **Multi-stage builds** เพื่อลดขนาด image
- **Health checks** ทั้ง frontend และ backend
- **Non-root user** เพื่อความปลอดภัย
- **Bridge network** สำหรับการสื่อสารระหว่าง services

---

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Developer

Created as a practice project for learning full-stack development with React, Golang, and Supabase.
