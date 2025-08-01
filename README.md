# Foodly

Foodly is a full-stack food ordering and restaurant management platform. It allows customers to browse restaurants, place orders, chat with support, and leave reviews. Restaurant owners can manage their menu, track orders, chat with customers, and view feedback. The project is built with a modern JavaScript/Java stack and is designed for extensibility and real-world deployment.

---

## Features

### Customer
- Browse restaurants and menus
- See real-time availability status of menu items
- View quantity available for items (when enabled by restaurant)
- Add items to cart and place orders
- Track order status in real time
- Chat with restaurant support
- Rate and review delivered orders and menu items
- View order and review history
- Manage favorites and wishlist

### Restaurant
- Manage restaurant profile and menu
- Control menu item availability (in stock/out of stock)
- Set and display quantity available for menu items
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
- `/api/restaurants/{id}/menu` — Menu management (GET, POST)
- `/api/restaurants/{restaurantId}/menu/{menuItemId}` — Menu item operations (DELETE)
- `/api/restaurants/{restaurantId}/menu/{menuItemId}/availability` — Update menu item availability
- `/api/restaurants/{restaurantId}/menu/{menuItemId}/can-delete` — Check if menu item can be deleted
- `/api/orders` — Order management
- `/api/support/messages` — Real-time chat
- `/api/reviews` — Ratings and reviews
- `/api/cart` — Cart management with availability validation

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

## Troubleshooting

### Menu Item Deletion Issues
If you encounter "Failed to delete menu items" errors:

1. **Check for References**: Menu items cannot be deleted if they are referenced by:
   - Existing orders (order_items table)
   - Customer reviews (reviews table)
   - Wishlist items (wishlist table)
   - Cart items (cart table)

2. **Visual Indicators**: In the restaurant dashboard, menu items that cannot be deleted will show as "Locked" instead of a delete button.

3. **Error Messages**: The system now provides detailed error messages explaining why deletion failed.

4. **Data Integrity**: This behavior ensures data integrity and prevents issues with customer orders and reviews.

### Common Solutions
- Wait for orders to be completed and archived
- Remove items from customer carts
- Consider archiving instead of deleting for historical data

### Menu Item Availability Issues
If customers cannot add items to cart:

1. **Check Availability**: Ensure the menu item is marked as available in the restaurant dashboard
2. **Quantity Management**: If quantity tracking is enabled, verify sufficient quantity is available
3. **Real-time Updates**: Quantity is automatically decremented when items are added to cart
4. **Customer View**: Customers see availability status and quantity information in real-time

### Best Practices
- Regularly update availability status for menu items
- Use quantity tracking for limited items or daily specials
- Monitor inventory levels through the restaurant dashboard

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

