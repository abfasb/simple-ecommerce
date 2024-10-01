const express = require('express');
const app = express();
const db = require('../config/db');

const users = [];

const queryAsync = (query, values) => {
    return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

const getOrders = async () => {
    try {
        const query = `
            SELECT 
                orders.id AS order_id,
                orders.user_id,
                orders.total_amount,
                orders.status,
                users.name AS user_name
            FROM 
                orders
            INNER JOIN 
                users ON orders.user_id = users.id
            ORDER BY 
                orders.created_at DESC;`;

        const [rows] = await db.execute(query);
        return rows;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

const EController = {
    saveRegisterUser: (req, res) => {
        const { name, email, password } = req.body;
        users.push({ name, email, password, isAdmin: false });
        req.session.user = { name, email, isAdmin: false };
        res.redirect('/');
    },

    verifyUser: (req, res) => {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.status(401).render('sign-in', { error: 'Invalid credentials' });
        }
    },

    getHome: (req, res) => {
        const userId = req.session.userId;
        const query = 'SELECT id, name, price, image_url FROM products';
        
        db.query(query, (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }
    
            res.render('pages/users/home', {
                products: results,
                userId: userId 
            });
        });
    },

    getPayment: (req, res) => {
        res.render('pages/users/order');
    },

    getContactUs: (req, res) => {
        res.render('pages/users/contact-us');
    },

    signUp: (req, res) => {
        res.render('pages/users/sign-up');
    },

    signIn: (req, res) => {
        res.render('pages/users/sign-in');
    },
    getSuccess:  (req, res) => {
        res.render('pages/users/order-success');
    },

    getCartUser: (req, res) => {
        const userId = req.session.userId;
    
        if (!userId) {
            return res.status(400).send('User ID is required');
        }
    
        const query = `
            SELECT ci.product_id, p.name, p.price, ci.quantity, p.image_url
            FROM cart c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = ?`;
    
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Database error while fetching cart items:', err);
                return res.status(500).send('Database error while fetching cart items');
            }
    
            res.render('pages/users/cart', {
                cartItems: results,
                userId: userId
            });
        });
    },
    

    getOrderUser: (req, res) => {
        // Dummy logic for getting user's order
        res.render('order', { user: req.session.user, orderDetails: {} });
    },

    checkHistoryUser: async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).send('Unauthorized: No user session found');
        }
    
        const userId = req.session.userId;
    
        try {
            const orders = await queryAsync(
                `SELECT o.id AS order_id, o.total_amount, o.status, o.created_at,
                        GROUP_CONCAT(CONCAT(oi.quantity, ' x ', p.name) SEPARATOR ', ') AS products
                 FROM orders o
                 JOIN order_items oi ON o.id = oi.order_id
                 JOIN products p ON oi.product_id = p.id
                 WHERE o.user_id = ?
                 GROUP BY o.id`,
                [userId]
            );
    
            console.log('Orders:', orders);
    
            if (!Array.isArray(orders)) {
                return res.status(500).send('Internal Server Error: Expected array from database');
            }
    
            res.render('pages/users/order-history', { user: req.session.userId, orders });
        } catch (error) {
            console.error('Error fetching order history:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    
    adminUser: async (req, res) => {

        const query = `
        SELECT o.id, u.name as user, o.total_amount, o.status 
        FROM orders o
        JOIN users u ON o.user_id = u.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).send('Server Error');
        }
        res.render('pages/admin/admin-panel', { orders: results });
    });
    },

    addOrderAdmin: (req, res) => {
        res.render('pages/admin/admin-add-product'
        );
    },

    getTheTeam: (req, res) => {
        res.render('pages/users/meet-the-team');
    },
    getFavorites: (req, res) => {

        const userId = req.session.userId; // Get the user ID from session

        const query = `
            SELECT f.product_id, p.name, p.price, p.image_url 
            FROM favorites f 
            JOIN products p ON f.product_id = p.id 
            WHERE f.user_id = ?`;
    
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Database error while fetching favorite items:', err);
                return res.status(500).send('Database error while fetching favorite items');
            }
            console.log('Favorite Items:', results);
    
            res.render('pages/users/favorites', {
                favoriteItems: results
            });
        });
        
    },
    getProductView: (req, res) => {
        const productId = req.params.id;
        const userId = req.session.userId;
    
        const query = 'SELECT * FROM products WHERE id = ?';
    
        db.query(query, [productId], (error, results) => {
            if (error) {
                console.error('Error fetching product:', error);
                return res.status(500).render('error', { message: 'Server error' });
            }
    
            if (results.length === 0) {
                return res.status(404).render('error', { message: 'Product not found' });
            }
    
            const product = results[0];
    
            return res.render('pages/users/view-product', { product, userId: userId });
        });
    }
};

module.exports = EController;
