var auth = {};

auth.authorize = function (req, res, next) {
    if (!req.session.uid) {
        return res.redirect('/login');
    } else {
        return next();
    }
};

module.exports = auth;