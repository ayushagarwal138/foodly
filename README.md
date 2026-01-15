# 🍕 Foodly - Full Stack Food Delivery Platform

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> A production-ready food ordering system connecting customers with restaurants via a **real-time dashboard** and **smart inventory management**.

## 📖 Overview
Foodly is a comprehensive full-stack solution designed to simulate a real-world food delivery ecosystem. It features role-based access for **Customers, Restaurant Owners, and Admins**, handling complex workflows like **concurrent order processing**, **real-time status updates**, and **live inventory tracking**.

The architecture ensures data consistency using **ACID-compliant transactions** in Spring Boot and delivers a seamless UX with **React 18's concurrent features**.

---

## 📸 Application Previews
| Admin Dashboard | Restaurant Dashboard |
|:---:|:---:|
| <img src="https://drive.google.com/uc?id=1QYj-Au2320jvtfMimyWpQbmuZyqnTBKx" alt="Customer View" width="400"/> | <img src="https://drive.google.com/uc?id=1NKMaEqjgeSpb_CBvG4laRpzxUo8NsXM9" alt="Restaurant Dashboard" width="400"/> |

| Real-time Order Monitoring | User Orders |
|:---:|:---:|
| <img src="https://drive.google.com/uc?id=13kkn0IksU7J1f5pUMmA5oIF6V0tUvo5Z" alt="Tracking" width="400"/> | <img src="https://drive.google.com/uc?id=18BlqIdAahM52l2CW1qiMB9FHPBgP50xF" alt="Mobile View" width="400"/> |

---

## 🏗️ Architecture & Tech Stack

### Backend (Robust & Scalable)
* **Framework:** Spring Boot 3.5 (Java 21)
* **Database:** PostgreSQL (Production) / H2 (Test)
* **Security:** Spring Security with **JWT** (Stateless Auth)
* **ORM:** Hibernate/JPA for complex relationships
* **Deployment:** Render (Dockerized Container)

### Frontend (Interactive & Fast)
* **Library:** React 18 (Hooks & Context API)
* **Styling:** Tailwind CSS for rapid UI development
* **Routing:** React Router v6
* **State Management:** Context API + Custom Hooks

---

## 🚀 Key Features

### 👥 For Customers
* **Smart Cart Logic:** Prevents adding items from multiple restaurants or out-of-stock items.
* **Live Order Tracking:** Polling/Socket-based updates for "Preparing," "Out for Delivery," etc.
* **Interactive Chat:** Direct support line to the restaurant owner.

### 🏪 For Restaurant Owners
* **Menu Engineering:** Toggle item availability instantly to manage kitchen load.
* **Order Command Center:** Accept/Reject orders with a single click.
* **Analytics Dashboard:** Track daily sales and customer ratings.

---

## ⚡ Quick Start

### Prerequisites
* Java 21+ & Maven
* Node.js 18+
* PostgreSQL (Optional: Defaults to H2)

### 1. Backend Setup
```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
# Server starts at http://localhost:8080
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
# App starts at http://localhost:3000
```
---
## 📂 Project Structure
```bash
  Foodly/
├── backend/                # Spring Boot Microservice
│   ├── src/main/java/      # Domain Logic (Controllers, Services)
│   ├── Dockerfile          # Production container config
│   └── render.yaml         # CI/CD Pipeline for Render
├── frontend/               # React SPA
│   ├── src/components/     # Reusable UI Atoms
│   ├── src/pages/          # Route Views
│   └── netlify.toml        # CI/CD Pipeline for Netlify
└── docker-compose.yml      # Local Dev Orchestration
```
---
## 🔒 Security & Performance
* Input Validation: Strict DTO validation to prevent XSS/SQL Injection.

* Role-Based Access Control (RBAC): Middleware checks to ensure Customers cannot access Restaurant APIs.

* Optimization: Lazy loading for React routes and indexed SQL queries for faster search.
---
## 👨‍💻 Author

### Ayush Agarwal Java Full Stack Developer.
[LinkedIn](https://www.linkedin.com/in/ayush-agarwal-50668927b/) | [Portfolio](https://portfolio-alpha-puce-1o6qxo19x8.vercel.app/)
