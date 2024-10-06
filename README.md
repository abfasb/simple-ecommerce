This is an eCommerce application designed for Sioti Sportswear, allowing users to browse, add products to their cart, manage their orders, and much more. The application is built using Express.js and incorporates authentication and role-based access control for users and admins.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Contributing](#contributing)
- [License](#license)

## Features

- User Registration and Authentication
- Admin Dashboard for product management
- Add products to cart and favorites
- Checkout process
- Order history tracking
- View product details
- User and Admin routes for easy management

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
Navigate to the project directory:
bash
Copy code
cd your-repo-name
Install the dependencies:
bash
Copy code
npm install
Set up your environment variables in a .env file.
Usage
Start the server:
bash
Copy code
npm start
Open your browser and navigate to http://localhost:3000 to view the application.
API Endpoints
User Routes
POST /register: Register a new user
POST /signIn: Log in an existing user
POST /add-to-cart: Add a product to the user's cart (requires authentication)
POST /add-to-favorite: Add a product to the user's favorites
POST /remove-from-cart: Remove a product from the cart
POST /checkout: Save the user's order (requires authentication)
GET /user/cart/: View the user's cart (requires authentication)
GET /user/view-product/:id: View product details (requires authentication)
GET /user/get-order/:id: View specific order details (requires authentication)
GET /user/history/order: View order history (requires authentication)
Admin Routes
POST /admin-add-product: Add a new product (requires admin authentication)
GET /admin-panel: View the admin panel (requires admin authentication)
GET /admin-panel/add-product: Admin panel to add products (requires admin authentication)
PATCH /admin/orders/update: Update order status (requires admin authentication)
General Routes
GET /: View home page (requires authentication)
GET /about: View about page
GET /contact-us: View contact page
GET /sign-up: View sign-up page
GET /sign-in: View sign-in page
GET /meet-the-team: View team page
GET /favorites: View user's favorite products (requires authentication)
GET /order-success: View order success page (requires authentication)
Middleware
isAuthenticated: Middleware to check if the user is authenticated.
isAdmin: Middleware to check if the user is an admin.
Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

License
This project is licensed under the MIT License - see the LICENSE file for details.

vbnet
Copy code

Just update the placeholders `yourusername` and `your-repo-name` with your actual Gi
