module.exports = {
    // Check authentication for user (in order to access dashboard)
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            res.render('errorPage');
        }
    },

    // Check authentication for admin
    ensureAuthenticatedAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.role > 1) {
            return next();
        }
        else {
            res.render('errorPageAdmin');
        }
    }
}