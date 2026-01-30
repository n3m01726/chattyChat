# ⚡ chattyChat (temporary name)

![Status](https://img.shields.io/badge/status-active%20development-orange)
![Realtime](https://img.shields.io/badge/realtime-websockets-blue)
![Frontend](https://img.shields.io/badge/frontend-React%20%2F%20Vite-61dafb)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2F%20Express-3c873a)
![Database](https://img.shields.io/badge/database-SQLite-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)
![Open Source](https://img.shields.io/badge/open--source-yes-brightgreen)

---

**chattyChat** (temporary name) is a modern real-time communication platform built for communities, teams, and social spaces.
It focuses on fast interactions, persistent conversations, rich user profiles, and a scalable architecture designed to grow into a full-featured social communication platform.

## ✨ Features

### 🚀 Core

* Real-time messaging using WebSockets
* Persistent message history
* Multi-room navigation
* User presence (online / away / busy / offline)

### 💬 Rich Messaging

* Markdown support
* GIF integration
* Image & video sharing (with expiration support)
* Typing indicators
* Message deletion (author-only)

### 👤 User Profiles

* Avatar & banner
* Bio, pronouns, timezone
* Custom accent color
* Persistent preferences

### 🌗 Interface & UX

* Clean, responsive UI
* Dark mode with persistence
* Fast sidebars (users & rooms)
* Low-latency, distraction-free experience

### 🗂️ Community-Oriented

* Multiple chat rooms
* Architecture ready for categories & threads
* Designed for growing communities

### 🔔 Engagement (in progress)

* Mentions & notifications
* Direct messages
* Message reactions & custom emojis

### 🔐 Moderation & Security (planned)

* Role-based permissions
* Kick / ban / timeout
* Anti-spam basics
* Two-factor authentication

## 🧱 Tech Stack

**Frontend**
* React (Vite)
* Socket.io-client
* SCSS

**Backend**
* Node.js
* Express
* Socket.io

**Database**
* SQLite (better-sqlite3)

## 🗺️ Roadmap

The full roadmap is available here:
➡️ **[ROADMAP.md](./ROADMAP.md)**

## 📦 Project Structure

```txt
pulse-chat/
├── backend/
│   ├── database/
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── services/
│   └── uploads/
│
├── frontend/
│   ├── README.md
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   └── profile/
│   │   ├── hooks/
│   │   ├── main.jsx
│   │   ├── styles/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── globals/
│   │   │   ├── index.scss
│   │   │   ├── layout/
│   │   │   ├── themes/
│   │   │   └── utils/
│   │   └── utils/
```

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install dependencies** in both `frontend/` and `backend/`
4. **Create a new branch** for your feature or bugfix
5. **Submit a pull request** with a clear description of your changes

Please follow the existing **code style** and respect the **project architecture**.
For major changes, feel free to open an **issue** first to discuss the approach.
