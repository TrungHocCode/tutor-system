const authorize = (allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'Authorization required.' });
    }
    const userRole = req.user.role;
    
    if (allowedRoles.includes(userRole)) {
        next(); 
    } else {
        return res.status(403).json({ error: 'Access denied. You do not have the required role.' });
    }
};

module.exports = authorize;