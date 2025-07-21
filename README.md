# Foodly

Foodly is a full-stack food ordering and restaurant management platform. It allows customers to browse restaurants, place orders, chat with support, and leave reviews. Restaurant owners can manage their menu, track orders, chat with customers, and view feedback. The project is built with a modern JavaScript/Java stack and is designed for extensibility and real-world deployment.

---

## Features

### Customer
- Browse restaurants and menus
- Add items to cart and place orders
- Track order status in real time
- Chat with restaurant support
- Rate and review delivered orders and menu items
- View order and review history
- Manage favorites and wishlist

### Restaurant
- Manage restaurant profile and menu
- Receive and manage orders in real time
- Update order status (New, Preparing, Out for Delivery, Delivered, Cancelled)
- Chat with customers for support
- View customer reviews and ratings
- Dashboard with daily stats and top dishes

### Admin (future-ready)
- User and restaurant management (planned)
- Platform analytics (planned)

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, React Router
- **Backend:** Java, Spring Boot, Spring Security (JWT), JPA/Hibernate
- **Database:** PostgreSQL (or H2 for development)
- **API:** RESTful endpoints
- **Authentication:** JWT-based, role-based access control

---

## Project Structure

```
Foodly/
  backend/         # Spring Boot backend (Java)
    src/
      main/java/com/example/demo/   # Source code
      main/resources/               # application.properties, schema.sql
    pom.xml                        # Maven config
  frontend/        # React frontend (JavaScript)
    src/           # React components, pages, styles
    public/        # Static assets
    package.json   # NPM config
```

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL (or use H2 for dev)

### Backend Setup
1. `cd backend`
2. Configure `src/main/resources/application.properties` for your DB
3. Run migrations: `mvn spring-boot:run` (auto-creates schema from `schema.sql`)
4. Server runs on `http://localhost:8080`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm start`
4. App runs on `http://localhost:3000`

---

## Usage

- **Customer:** Sign up, browse, order, chat, review
- **Restaurant:** Sign up, manage menu, process orders, chat, view reviews
- **Admin:** (Planned) Platform management

---

## Key Endpoints

- `/auth/login`, `/auth/signup` — Authentication
- `/api/restaurants` — Restaurant info, menus
- `/api/orders` — Order management
- `/api/support/messages` — Real-time chat
- `/api/reviews` — Ratings and reviews

---

## Security
- JWT authentication for all API endpoints
- Role-based access (Customer, Restaurant, Admin)
- CORS enabled for frontend-backend communication

---

## Customization & Extensibility
- Add new roles or features by extending the backend services and frontend routes
- Easily swap database (PostgreSQL, H2, MySQL)
- Add new endpoints for analytics, admin, etc.

---

## Contributing

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

- Project Lead: Ayush Agarwal
- Email: ayushagarwal@example.com
- GitHub: [your-github-username]

