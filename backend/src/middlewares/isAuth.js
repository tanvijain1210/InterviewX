import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
  try {
    // 1. Correct property is req.cookies (plural)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user ID to request object (camelCase recommended: req.userId)
    req.userId = decoded.userId;

    next();
  } catch (err) {
    // 4. Handle expired or invalid tokens cleanly
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default isAuth;