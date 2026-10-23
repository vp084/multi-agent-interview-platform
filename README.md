# Multi-Agent AI Interview & Career Platform 🚀

A modern, production-ready platform designed for engineering career growth. The platform combines multi-agent AI systems to deliver real-time technical interviews, ATS resume analysis, personalized learning roadmaps, and coin-based monetization.

Built with **React 19**, **Vite**, **Express**, **LangChain / LangGraph**, **Groq**, **Redis**, **MongoDB**, and **Docker**.

---

## ✨ Key Features

- **Multi-Agent Mock Interviews**: Adaptive technical, behavioral, and resume-based interviews with real-time feedback, speech synthesis, and code execution evaluation.
- **ATS Resume Scoring & Optimization**: Resume parsing, keyword gap identification, and GitHub repository analysis to boost ATS scores.
- **Autonomous Learning Roadmaps**: Week-by-week curriculum planning based on target roles, experience levels, and skill gaps, enriched with curated learning resources.
- **Credit-Based Monetization**: Pay-as-you-go coin packages integrated with payment gateway support, transaction history, and live wallet balances.
- **Microservices Architecture**: Modular services decoupled behind an API Gateway with centralized authentication and Redis-backed session management.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Motion, Redux Toolkit, Monaco Code Editor |
| **API Gateway** | Express.js, Reverse Proxy, Cookie-Parser, CORS |
| **Microservices** | Node.js (ES Modules), Express.js, Mongoose, Axios |
| **AI & Multi-Agent** | LangChain Core, LangGraph (State Graphs), Groq Cloud API |
| **Database & Cache** | MongoDB Atlas, Redis |
| **Authentication & Payments** | Firebase Auth (Google OAuth), Razorpay Gateway |

---

## 🏗️ Architecture Overview

The platform uses a decoupled microservices pattern orchestrated through a unified API Gateway:

- **Frontend Client** (`Port 5173`)
- **API Gateway** (`Port 8000`)
- **Auth Service** (`Port 8001`)
- **Resume Service** (`Port 8002`)
- **Interview Service** (`Port 8003`)
- **Roadmap Service** (`Port 8004`)
- **Billing Service** (`Port 8005`)
- **Redis Cache & Session Store** (`Port 6379`)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/vp084/multi-agent-interview-platform.git
cd multi-agent-interview-platform
```

### 2. Configure Environment Variables
Copy each service's `.env.example` file to `.env` and fill in your credentials:
- `backend/gateway/.env.example` $\rightarrow$ `backend/gateway/.env`
- `backend/services/auth/.env.example` $\rightarrow$ `backend/services/auth/.env`
- `backend/services/billing/.env.example` $\rightarrow$ `backend/services/billing/.env`
- `backend/services/interview/.env.example` $\rightarrow$ `backend/services/interview/.env`
- `backend/services/resume/.env.example` $\rightarrow$ `backend/services/resume/.env`
- `backend/services/roadmap/.env.example` $\rightarrow$ `backend/services/roadmap/.env`
- `frontend/.env.example` $\rightarrow$ `frontend/.env`

### 3. Install Dependencies & Run
Start Redis:
```bash
cd backend
docker compose up -d
```

Install dependencies and start each microservice:
```bash
# In each backend service directory (gateway, auth, billing, interview, resume, roadmap):
npm install
npm run dev
```

Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License.
