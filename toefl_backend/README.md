# 🎤 TOEFL Backend Prototype

A minimal Express backend for an **AI-powered TOEFL speaking practice demo**.  
This server accepts audio recordings from the frontend and returns a mock score result. Future versions will integrate real scoring APIs and ElevenLabs TTS.

---

## ✨ Features
- Accepts audio file uploads via `multer`
- Returns mock scores and feedback (randomly generated, range 18–30)
- CORS enabled for frontend integration
- Planned features:
  - Real-time speech scoring API
  - ElevenLabs TTS sample generation
  - User data storage (practice history)

---

## 🛠 Tech Stack
- Node.js
- Express
- Multer (file upload)
- CORS (cross-origin requests)

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install

## 📂 Project Structure

toefl-backend/
├── server.js         # Backend entry file
├── package.json      # Dependencies and scripts
├── node_modules/     # Auto-generated (ignored in Git)
└── .gitignore        # Ignores node_modules / .env


## 📌 TODO

 Integrate real speech scoring API

 Add ElevenLabs TTS (AI sample generation)

 Store user scores in database

 Deploy to Vercel / Render / Railway