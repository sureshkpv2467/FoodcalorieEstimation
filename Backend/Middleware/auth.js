const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    console.log('Auth middleware hit');
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
        console.log('No authorization header');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // The token might already include 'Bearer ' or not
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    console.log('Token extracted:', token ? 'Present' : 'Missing');

    try {
        // Verify token using the same secret as auth routes
        console.log('Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        console.log('Token verified successfully');
        console.log('Decoded token:', decoded);
        req.user = decoded.user; // Make sure we're setting decoded.user
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 