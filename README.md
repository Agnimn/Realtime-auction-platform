# 🚀 Real-Time Auction Platform

<div align="center">

![MERN](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge\&logo=socket.io)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?style=for-the-badge\&logo=tailwindcss)

### 🔥 A Full Stack MERN Real-Time Auction Platform

### ⚡ Built with React, Node.js, MongoDB & Socket.IO

</div>

---

# 📌 Features

✨ User Authentication & Authorization
✨ Real-Time Bidding using Socket.IO
✨ Create & Manage Auctions
✨ Live Bid Updates
✨ Bid History Tracking
✨ Cloudinary Image Uploads
✨ Secure JWT Authentication
✨ Admin Dashboard
✨ Responsive UI with Tailwind CSS
✨ Protected Routes & Middleware
✨ RESTful API Architecture
✨ MongoDB Atlas Integration
✨ Deployed using Vercel & Render

---

# 🛠️ Tech Stack

## 🎨 Frontend

* ⚛️ React.js
* ⚡ Vite
* 🎨 Tailwind CSS
* 🔄 Context API
* 🌐 Axios
* 🧭 React Router DOM

## ⚙️ Backend

* 🟢 Node.js
* 🚂 Express.js
* 🔐 JWT Authentication
* 🔒 bcryptjs
* 📡 Socket.IO
* ☁️ Cloudinary
* 🛡️ Middleware Security

## 🗄️ Database

* 🍃 MongoDB Atlas
* 📚 Mongoose ODM

---

# 📂 Project Structure

```bash
MAD MINI PROJECT/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚡ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Agnimn/Realtime-auction-platform.git
```

```bash
cd Realtime-auction-platform
```

---

# 🔧 Backend Setup

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

## Run Backend

```bash
npm run dev
```

✅ Backend running on:

```bash
http://localhost:5000
```

---

# 🎨 Frontend Setup

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

## Run Frontend

```bash
npm run dev
```

✅ Frontend running on:

```bash
http://localhost:5173
```

---

# 📡 API Endpoints

## 🔐 Authentication

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Register User |
| POST   | `/api/auth/login`    | Login User    |

---

## 🏷️ Auctions

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/auction`        | Get All Auctions    |
| GET    | `/api/auction/:id`    | Get Auction Details |
| POST   | `/api/auction/create` | Create Auction      |
| DELETE | `/api/auction/:id`    | Delete Auction      |

---

## 💰 Bidding

| Method | Endpoint               | Description |
| ------ | ---------------------- | ----------- |
| POST   | `/api/bid/place/:id`   | Place Bid   |
| GET    | `/api/bid/history/:id` | Bid History |

---

# 🔥 Real-Time Features

⚡ Instant Bid Updates
⚡ Live Auction Synchronization
⚡ Real-Time Notifications
⚡ Socket.IO Room-Based Communication

---

# ☁️ Deployment

## 🌐 Frontend

Deployed on:

* [Vercel](https://vercel.com?utm_source=chatgpt.com)

## ⚙️ Backend

Deployed on:

* [Render](https://render.com?utm_source=chatgpt.com)

## 🗄️ Database

Hosted on:

* [MongoDB Atlas](https://www.mongodb.com/atlas/database?utm_source=chatgpt.com)



# 🔒 Security Features

✅ JWT Authentication
✅ Password Hashing using bcryptjs
✅ Protected API Routes
✅ Role-Based Access Control
✅ Secure Environment Variables
✅ Middleware Authentication

---

# 🚀 Future Enhancements

✨ Payment Gateway Integration
✨ AI-Based Price Prediction
✨ Email Notifications
✨ Push Notifications
✨ Mobile App Version
✨ Auction Recommendation System
✨ Multi-Vendor Support
✨ Advanced Analytics Dashboard

---

# 👨‍💻 Author

## 🚀 Agni M N


🔥 MERN Stack Enthusiast


---

# ⭐ Support

If you like this project:

🌟 Star the repository
🍴 Fork the project
🐛 Report issues
🚀 Contribute improvements



<div align="center">

### 💙 Made with MERN Stack & Lots of Coffee ☕

</div>
