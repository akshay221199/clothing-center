import jwt from 'jsonwebtoken';

const JWT_SECRET = "you are a user";

const userMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        
        if (!data.user) {
            return res.status(401).json({ error: "Invalid token. No user data found." });
        }

        req.user = data.user; // Attach the user data to the request object
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ error: "Invalid token." });
    }
}

export default userMiddleware;
