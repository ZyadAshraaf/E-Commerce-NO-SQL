checkIfLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login")
    }
    next()
}

checkIfNotLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/")
    }
    next()
}

module.exports = {
    checkIfLoggedIn : checkIfLoggedIn,
    checkIfNotLoggedIn : checkIfNotLoggedIn
}