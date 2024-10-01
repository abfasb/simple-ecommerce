const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.signup = async (req, res) => {
    const { name, email, password, address, terms_accepted } = req.body;

    if (terms_accepted !== '1') {
        return res.status(400).send('You must accept the terms and conditions.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, address], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Email already exists.');
                }
                return res.status(500).send('Server error.');
            }
            res.redirect('/sign-in');
        });
    } catch (error) {
        return res.status(500).send('Server error.');
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).send('Server error.');
        if (results.length === 0) return res.status(400).send('Invalid email or password.');

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password.');
        }
        
        req.session.userId = user.id;
        req.session.role = user.role;

        if (user.role === 'admin') {
            res.redirect('/admin-panel');
        } else {
            res.redirect('/');
        }
    });
};



exports.addToFavorites = (req, res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;

    const checkFavoriteQuery = 'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?';
    db.query(checkFavoriteQuery, [userId, productId], (err, results) => {
        if (err) {
            console.error('Error checking favorites:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            return res.status(400).send('Product is already in favorites.');
        }

        const addFavoriteQuery = 'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)';
        db.query(addFavoriteQuery, [userId, productId], (err) => {
            if (err) {
                console.error('Error adding to favorites:', err);
                return res.status(500).send('Database error');
            }
            res.redirect('/'); 
        });
    });
};

exports.addToCart = async (req, res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    console.log("User ID:", userId);
    console.log("Product ID:", productId); 
    console.log("Quantity:", quantity);

    db.query('SELECT id FROM cart WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            console.error('Error checking favorites:', err.message);
            return res.status(500).send('Database error: ' + err.message);
        }

        let cartId;
        if (results.length > 0) {
            cartId = results[0].id; 
        } else {
            db.query('INSERT INTO cart (user_id) VALUES (?)', [userId], (err, results) => {
                if (err) {
                    console.error('Error creating cart:', err);
                    return res.status(500).send('Database error');
                }
                cartId = results.insertId; 
                addItemToCart(cartId, productId, quantity, res);
            });
            return;
        }

        addItemToCart(cartId, productId, quantity, res);
    });
};

const addItemToCart = (cartId, productId, quantity, res) => {
    db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', 
    [cartId, productId, quantity], 
    (err) => {
        if (err) {
            console.error('Error adding item to cart:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/');
    });
};


exports.getFavorites = (req, res) => {
    const userId = req.session.userId;

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
}

exports.removeFromCart = (req, res) => {
    const userId = req.body.userId;
    const productId = req.body.productId;

    const query = `
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM cart WHERE user_id = ?) AND product_id = ?`;

    db.query(query, [userId, productId], (err, results) => {
        if (err) {
            console.error('Database error while removing item from cart:', err);
            return res.status(500).send('Database error while removing item from cart');
        }

        res.redirect('/user/cart'); 
    });
}


exports.saveOrder = (req, res) => {
    
    const userId = req.body.userId;
    const subtotal = parseFloat(req.body.subtotal);

    const orderQuery = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';

    db.query(orderQuery, [userId, subtotal], (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).send('Error creating order');
        }

        const orderId = result.insertId; 

        const cartQuery = `
            SELECT ci.product_id, ci.quantity, p.price
            FROM cart c
            JOIN cart_items ci ON c.id = ci.cart_id
            JOIN products p ON ci.product_id = p.id
            WHERE c.user_id = ?`;

        db.query(cartQuery, [userId], (err, cartItems) => {
            if (err) {
                console.error('Error fetching cart items:', err);
                return res.status(500).send('Error fetching cart items');
            }

            const orderItems = cartItems.map(item => [
                orderId,
                item.product_id,
                item.quantity,
                item.price
            ]);

            const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';

            db.query(orderItemsQuery, [orderItems], (err) => {
                if (err) {
                    console.error('Error inserting order items:', err);
                    return res.status(500).send('Error inserting order items');
                }

                const clearCartQuery = 'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM cart WHERE user_id = ?)';
                db.query(clearCartQuery, [userId], (err) => {
                    if (err) {
                        console.error('Error clearing cart:', err);
                    }
                });

                res.redirect('/order-success'); 
            });
        });
    });
}

exports.updateStatus = async(req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
}

