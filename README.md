# MeroGadget — E-Commerce Platform

A full-stack e-commerce web application for premium electronics, built with the MERN stack.

## ✨ Features

### Customer Side
- Browse products with search & category filters
- Product detail pages with image galleries
- Shopping cart with quantity management
- Secure checkout with **Khalti payment** integration
- Cash on Delivery option
- Order history & tracking
- User registration with **OTP email verification**
- Forgot password with OTP reset flow
- User profile management

### Admin Side
- Dashboard with live stats (products, orders, users, revenue)
- Product management (create, edit, delete)
- Category management with icons
- Order management with status updates
- User management with role switching
- Contact message inbox
- Password change & profile settings

### Design
- Warm, modern UI theme (cream + brown + orange)
- Fully responsive (mobile, tablet, desktop)
- Toast notifications
- Loading states & skeletons
- Clean, minimal aesthetic

## 🛠️ Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS
- React Router v6
- Axios
- Lucide icons
- React Hot Toast

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Nodemailer (Gmail SMTP)
- Khalti Payment Gateway

## 📁 Project Structure

```
Project/
├── Backend/
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── services/        # Email service
│   └── server.js        # Entry point
│
└── Frontend/
    ├── src/
    │   ├── components/  # Reusable UI
    │   ├── pages/       # Route pages
    │   ├── context/     # Auth, Cart, Toast
    │   ├── services/    # API layer
    │   └── App.jsx
    └── index.html
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with App Password enabled

### 1. Clone the repo
```bash
git clone https://github.com/Prashamsa321/Merogadget-ecommerce.git
cd Merogadget-ecommerce
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_BASE_URL=https://dev.khalti.com/api/v2
NODE_ENV=development
```

Run:
```bash
npm start
```

### 3. Frontend setup
```bash
cd ../Frontend
npm install
npm run dev
```

Open **http://localhost:3000**

## 📝 License

MIT

## 👤 Author

**Prashamsa Lamsal**
- GitHub: [@Prashamsa321](https://github.com/Prashamsa321)
