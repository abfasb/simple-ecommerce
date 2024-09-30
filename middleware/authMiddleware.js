function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) { 
        return next();
    } else {
        return res.redirect('/sign-in'); 
    }
}

function isAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    } else {
        return res.redirect('/sign-in');
    }
}

module.exports = {
    isAuthenticated,
    isAdmin
};
