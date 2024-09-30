const { check, validationResult } = require('express-validator');

const validateRegister = [
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('name').notEmpty().withMessage('Name is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('sign-up', { errors: errors.array() });
        }
        next();
    }
];


const validateSignIn = [
    check('email').isEmail().withMessage('Please enter a valid email'),
    check('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('sign-in', { errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateRegister, validateSignIn };
