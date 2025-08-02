# 🍕 Foodly - Food Delivery Platform

Foodly is a full-stack food ordering and restaurant management platform. It allows customers to browse restaurants, place orders, chat with support, and leave reviews. Restaurant owners can manage their menu, track orders, chat with customers, and view feedback. The project is built with a modern JavaScript/Java stack and is designed for extensibility and real-world deployment.

## 🚀 Quick Start

### Prerequisites
- **Java 21+**
- **Node.js 18+**
- **PostgreSQL** (or use H2 for development)
- **Docker & Docker Compose** (optional, for containerized development)

### Local Development

#### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd foodly

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

#### Option 2: Manual Setup

**Backend Setup:**
```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
# Server runs on http://localhost:8080
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18, Tailwind CSS, React Router
- **Backend:** Java 21, Spring Boot 3.5, Spring Security (JWT), JPA/Hibernate
- **Database:** PostgreSQL (production) / H2 (development)
- **API:** RESTful endpoints with JWT authentication
- **Deployment:** Render (backend), Netlify (frontend), Neon (database)

### Project Structure
```
Foodly/
├── backend/                 # Spring Boot backend (Java)
│   ├── src/
│   │   ├── main/java/      # Source code
│   │   └── main/resources/ # Configuration files
│   ├── pom.xml             # Maven configuration
│   ├── Dockerfile          # Backend container
│   └── render.yaml         # Render deployment config
├── frontend/               # React frontend (JavaScript)
│   ├── src/                # React components, pages, styles
│   ├── public/             # Static assets
│   ├── package.json        # NPM configuration
│   ├── Dockerfile          # Frontend container
│   └── netlify.toml        # Netlify deployment config
├── database/               # Database setup scripts
├── docker-compose.yml      # Local development orchestration
└── README.md               # This file
```

## ✨ Features

### 👥 Customer Features
- **Restaurant Browsing:** Browse restaurants and menus with real-time availability
- **Smart Ordering:** Add items to cart with availability validation
- **Real-time Tracking:** Track order status in real-time
- **Support Chat:** Chat with restaurant support
- **Reviews & Ratings:** Rate and review delivered orders
- **Order History:** View past orders and reviews
- **Favorites:** Manage favorites and wishlist

### 🏪 Restaurant Features
- **Menu Management:** Manage restaurant profile and menu items
- **Availability Control:** Control item availability (in stock/out of stock)
- **Quantity Tracking:** Set and display quantity available for items
- **Order Management:** Receive and manage orders in real-time
- **Status Updates:** Update order status (New, Preparing, Out for Delivery, Delivered, Cancelled)
- **Customer Support:** Chat with customers for support
- **Analytics:** View customer reviews, ratings, and daily stats

### 🔧 Admin Features (Future-ready)
- User and restaurant management
- Platform analytics and insights

## 🔑 Key API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### Restaurants & Menus
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/{id}/menu` - Get restaurant menu
- `POST /api/restaurants/{id}/menu` - Add menu item
- `DELETE /api/restaurants/{restaurantId}/menu/{menuItemId}` - Delete menu item
- `PUT /api/restaurants/{restaurantId}/menu/{menuItemId}/availability` - Update availability

### Orders & Cart
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Place new order
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart

### Support & Reviews
- `GET /api/support/messages` - Get chat messages
- `POST /api/support/messages` - Send message
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Add review

## 🚀 Deployment

### Production Deployment

Your Foodly application is configured for deployment on:
- **Backend:** Render (Java Web Service)
- **Frontend:** Netlify (Static Site)
- **Database:** Neon (PostgreSQL)

#### Deployment Files
- `backend/render.yaml` - Render deployment configuration
- `frontend/netlify.toml` - Netlify deployment configuration
- `database/neon-setup.sql` - Database initialization script

#### Quick Deployment Steps
1. **Database Setup:** Create Neon PostgreSQL database
2. **Backend Deployment:** Connect GitHub repo to Render
3. **Frontend Deployment:** Connect GitHub repo to Netlify
4. **Environment Configuration:** Set up environment variables

For detailed deployment instructions, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `PRODUCTION_ENVIRONMENT_VALUES.md` - Environment variables reference

### Environment Variables

#### Backend (Render)
```bash
SPRING_APPLICATION_NAME=foodly-backend
SPRING_DATASOURCE_URL=postgresql://username:password@host:port/foodly_db
SPRING_DATASOURCE_USERNAME=your-neon-username
SPRING_DATASOURCE_PASSWORD=your-neon-password
JWT_SECRET=your-secure-jwt-secret
CORS_ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
```

#### Frontend (Netlify)
```bash
REACT_APP_API_BASE_URL=https://your-render-app.onrender.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## 🛠️ Development Scripts

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (one-way)
```

### Backend Scripts
```bash
./mvnw clean package    # Build JAR file
./mvnw spring-boot:run  # Run development server
./mvnw test            # Run tests
```

## 🔒 Security

- **JWT Authentication:** All API endpoints require JWT tokens
- **Role-based Access:** Customer, Restaurant, and Admin roles
- **CORS Configuration:** Secure cross-origin requests
- **Environment Variables:** Sensitive data externalized
- **Input Validation:** Server-side validation for all inputs

## 🐛 Troubleshooting

### Common Issues

#### Menu Item Deletion
- **Problem:** "Failed to delete menu items" error
- **Solution:** Check for references in orders, reviews, wishlist, or cart
- **Prevention:** Use "Locked" indicators in restaurant dashboard

#### Availability Issues
- **Problem:** Customers cannot add items to cart
- **Solution:** Verify item availability and quantity in restaurant dashboard
- **Prevention:** Regular availability updates and quantity monitoring

#### Build Issues
- **Problem:** Frontend build fails
- **Solution:** Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- **Problem:** Backend build fails
- **Solution:** Clear Maven cache: `./mvnw clean`

### Development Tips
- Use Docker Compose for consistent development environment
- Check logs with `docker-compose logs -f [service-name]`
- Monitor database connections and JWT token expiration
- Test API endpoints with tools like Postman or curl

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `DEPLOYMENT_CHECKLIST.md` - Production deployment checklist
- `PRODUCTION_ENVIRONMENT_VALUES.md` - Environment variables reference
- `FOODLY_BRANDING_UPDATE.md` - Branding and UI updates
- `CLEANUP_SUMMARY.md` - Project cleanup and optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Test both frontend and backend thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Contact

- **Project Lead:** Ayush Agarwal
- **Email:** ayushagarwal@example.com
- **GitHub:** [your-github-username]

## 🙏 Acknowledgments

- Built with React and Spring Boot
- Styled with Tailwind CSS
- Deployed on Render, Netlify, and Neon
- Icons and assets from various open-source libraries

---

**🍕 Foodly - Your favorite food delivery platform is ready for deployment!**

