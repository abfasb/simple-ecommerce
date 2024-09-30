const db = require('../config/db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('image_url');

exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to upload image.' });
        }

        const { name, price, description } = req.body;

        const image_url = req.file ? req.file.filename : null;

        const sql = 'INSERT INTO products (name, price, description, image_url) VALUES (?, ?, ?, ?)';
        const values = [name, price, description, image_url];

        try {
            await db.query(sql, values);
            res.status(201).json({ message: 'Product added successfully!' });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product.' });
        }
    });
};


exports.updateOrder = (req, res) => {
    const { orderId, status } = req.body;

    if (isNaN(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const query = `UPDATE orders SET status = ? WHERE id = ?`;
    db.query(query, [status, orderId], (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ success: false, message: 'Error updating status' });
        }
        res.json({ success: true, message: 'Order status updated successfully' });
    });
};
