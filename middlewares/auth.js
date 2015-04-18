var auth = {};

auth.authorize = function (req, res, next) {
    if (!req.session.uid) {
        return res.redirect('/login');
    } else {
        db.users.findById(req.session.uid)
            .exec()
            .then(function (user) {
                res.locals.currentUser = user;
                if (res.locals.currentUser.city)
                    res.locals.isMaster = false;
                else
                    res.locals.isMaster = true;
                return next();
            }, next);
    }
};

auth.master = function (req, res, next) {
    if (res.locals.currentUser.city)
        res.status(404);
    next();
};

module.exports = auth;