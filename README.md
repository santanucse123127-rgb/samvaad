# Samvaad 💬  
### A Real-Time MERN Chat Application

**Samvaad** is a full-stack real-time chat application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It enables seamless, instant communication with a modern UI, secure authentication, and real-time features powered by WebSockets.

---

## 🔥 Key Features

- 🔐 Secure user authentication using JWT
- 💬 Real-time one-to-one and group messaging
- ⚡ Instant message delivery with Socket.IO
- 🟢 Online / Offline user status
- ✍️ Typing indicators
- 🔔 Real-time notifications
- 📱 Fully responsive UI
- 🧾 Scalable backend architecture

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Socket.IO Client
- Axios
- Tailwind CSS / CSS (as used)

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT Authentication
- bcrypt.js

### Database
- MongoDB
- Mongoose

---

## 📁 Project Structure

samvaad/
│
├── backend/
│ ├── config/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── socket/
│ ├── middleware/
│ └── server.js
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── package.json
│
├── .env.example
└── README.md


---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
🚫 Do NOT commit your .env file to GitHub

🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/santanu-atta03/samvaad.git
cd samvaad
2️⃣ Backend Setup
cd backend
npm install
npm run dev


Server will start at:

http://localhost:5000

3️⃣ Frontend Setup
cd frontend
npm install
npm start


Frontend will run at:

http://localhost:3000

🔌 Real-Time Functionality

Samvaad uses Socket.IO to support:

Live message delivery

Typing indicators

User presence detection

Real-time notifications

🔐 Security Features

Password hashing using bcrypt

JWT-based authentication & authorization

Protected API routes

Environment variable protection

🌱 Future Improvements

📞 Voice & video calling

👀 Read receipts

😀 Message reactions

🔐 End-to-end encryption

📲 Push notifications

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a new branch

Commit your changes

Open a pull request

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Santanu Atta
GitHub: @santanu-atta03

Samvaad means conversation — built to keep conversations real-time, secure, and seamless.


---

### ✅ How to add it to GitHub
```powershell
New-Item README.md
# paste the content
git add README.md
git commit -m "Add project README"
git push
