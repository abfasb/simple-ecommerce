const EController = require('../controllers/EController');
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const AdminController = require('../controllers/AdminController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', 
     UserController.signup);
router.post('/signIn',
     UserController.login);
router.post('/admin-add-product', AdminController.addProduct);
router.post('/add-to-cart', isAuthenticated, UserController.addToCart);
router.post('/add-to-favorite',  UserController.addToFavorites);
router.post('/remove-from-cart', UserController.removeFromCart)
router.post('/checkout', isAuthenticated, UserController.saveOrder);
router.patch('/admin/orders/update', AdminController.updateOrder);


router.get('/', isAuthenticated, EController.getHome);
router.get('/about', EController.getPayment);
router.get('/contact-us', EController.getContactUs);
router.get('/sign-up', EController.signUp);
router.get('/sign-in', EController.signIn);
router.get('/meet-the-team', EController.getTheTeam);
router.get('/favorites', isAuthenticated, EController.getFavorites);
router.get('/order-success', isAuthenticated, EController.getSuccess);


router.get('/user/cart/', isAuthenticated, EController.getCartUser);
router.get('/user/view-product/:id', isAuthenticated, EController.getProductView);
router.get('/user/get-order/:id', isAuthenticated, EController.getOrderUser);
router.get('/user/history/order', isAuthenticated, EController.checkHistoryUser);

router.get('/admin-panel', isAuthenticated, isAdmin, EController.adminUser);
router.get('/admin-panel/add-product', isAuthenticated, isAdmin, EController.addOrderAdmin);

router.patch('/admin/orders/:id/status', isAuthenticated, UserController.updateStatus);

module.exports = router;
