import jwt from 'jsonwebtoken';

// throw an error if the JWT_SECRET is missing to prevent insecure defaults in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

export const authenticateToken = (req, res, next) => {
  // retrieve the token from the Authorization header
  const authHeader = req.get('Authorization');

  // ensure the header exists and explicitly starts with 'Bearer '
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // extract the token by removing the 'Bearer ' prefix and trimming any whitespace
  const token = authHeader.slice(7).trim();

  // if the token is empty after trimming, treat it as missing
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // verify the token using the JWT_SECRET and specify the expected algorithm
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (error, user) => {
    if (error) {
      // differentiate between expired and invalid tokens
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired.' }); // often 401 triggers a client refresh
      }
      // for other verification errors, return a 403 to indicate the token is invalid
      return res.status(403).json({ error: 'Invalid token.' });
    }

    // attach the decoded user information to the request object
    req.user = { id: user.id, email: user.email };
    // proceed to the next middleware or route handler
    next();
  });
};
