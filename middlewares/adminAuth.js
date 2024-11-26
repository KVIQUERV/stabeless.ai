function adminAuth(req, res, next) {
    if (req.session.user) {
        if (req.session.user.isAdmin) {
            next();
        } else {
            res.redirect("/admin/login");
        }
    } else {
        res.redirect("/admin/login");
    }
}

module.exports = adminAuth;
