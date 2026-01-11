# Pet Food E-commerce Platform

โปรเจค E-commerce สำหรับขายอาหารสัตว์เลี้ยง สร้างด้วย React (Frontend), Golang (Backend), และ Supabase (Database)

## 🚀 Technology Stack

### Frontend
- **React** - UI Framework
- **Vite** - Build Tool & Dev Server
- **React Router** - Routing
- **Zustand** - State Management
- **Axios** - HTTP Client
- **CSS** - Styling (Design System)

### Backend
- **Golang** - Programming Language
- **Gin** - Web Framework
- **GORM** - ORM
- **PostgreSQL** (Supabase) - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### Database
- **Supabase** - PostgreSQL Database as a Service

## 📁 Project Structure

```
E-commerce Practice Project/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # API controllers
│   ├── middleware/     # Authentication middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── main.go         # Entry point
│   ├── go.mod          # Dependencies
│   └── .env.example    # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   ├── store/          # Zustand stores
    │   ├── App.jsx         # Main app component
    │   ├── main.jsx        # Entry point
    │   └── index.css       # Global styles & design system
    ├── public/
    ├── index.html
    ├── package.json
    └── .env                # Environment variables

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Go (v1.21+)
- Supabase Account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Configure `.env` file with your Supabase credentials:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
PORT=8080
```

4. Install dependencies:
```bash
go mod download
```

5. Run the server:
```bash
go run main.go
```

Backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure `.env` file (should already exist):
```env
VITE_API_URL=http://localhost:8080/api
```

4. Run the development server:
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 📊 Database Schema

### Tables

**users**
- id (UUID, primary key)
- email (TEXT, unique)
- password_hash (TEXT)
- name (TEXT)
- phone (TEXT)
- address (TEXT)
- role (TEXT) - 'customer' or 'admin'
- created_at, updated_at (TIMESTAMP)

**categories**
- id (UUID, primary key)
- name (TEXT)
- description (TEXT)
- image_url (TEXT)
- created_at (TIMESTAMP)

**products**
- id (UUID, primary key)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- stock (INTEGER)
- category_id (UUID, FK)
- image_url (TEXT)
- brand (TEXT)
- weight (TEXT)
- created_at, updated_at (TIMESTAMP)

**carts**
- id (UUID, primary key)
- user_id (UUID, FK)
- product_id (UUID, FK)
- quantity (INTEGER)
- created_at (TIMESTAMP)

**orders**
- id (UUID, primary key)
- user_id (UUID, FK)
- total_amount (DECIMAL)
- status (TEXT) - 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
- shipping_address (TEXT)
- created_at, updated_at (TIMESTAMP)

**order_items**
- id (UUID, primary key)
- order_id (UUID, FK)
- product_id (UUID, FK)
- quantity (INTEGER)
- price (DECIMAL)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)

### Products
- `GET /api/products` - Get all products (with pagination & filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/admin/categories` - Create category (admin)
- `PUT /api/admin/categories/:id` - Update category (admin)
- `DELETE /api/admin/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart` - Add item to cart (protected)
- `PUT /api/cart/:id` - Update cart item quantity (protected)
- `DELETE /api/cart/:id` - Remove item from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create order from cart (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status (admin)

## ✨ Features

### For Customers
- ✅ User registration and authentication
- ✅ Browse products with search and category filtering
- ✅ Product pagination
- ✅ Add products to cart
- ✅ Update cart quantities
- ✅ Checkout and order placement
- ✅ View order history
- ✅ Responsive design for mobile and desktop

### For Admins
- ✅ Product management (CRUD)
- ✅ Category management (CRUD)
- ✅ Order management and status updates
- ✅ View all orders

### Design Features
- 🎨 Pet-themed vibrant color palette
- 🐾 Custom animations and transitions
- 📱 Fully responsive design
- ⚡ Fast and smooth user experience
- 🔒 Secure authentication with JWT
- 💾 Persistent cart with Zustand

## 🎨 Design System

The project uses a comprehensive design system with:
- Custom CSS variables for colors, typography, spacing
- Vibrant pet-friendly color palette (oranges, greens, blues)
- Inter font from Google Fonts
- Smooth animations and transitions
- Responsive utilities
- Reusable component styles

## 🔐 Authentication

- JWT-based authentication
- bcrypt password hashing
- Protected routes and API endpoints
- Token stored in localStorage
- Auto-redirect on token expiration

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Developer

Created as a practice project for learning full-stack development with React, Golang, and Supabase.
