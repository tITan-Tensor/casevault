const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. Get the token from the request header
  const token = req.header('auth-token');

  // 2. If there is no token, kick them out
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No VIP badge provided' });
  }

  try {
    // 3. Verify the token using our secret master key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the user's ID to the request so the next function knows who they are
    req.user = decoded.user;
    
    // 5. Tell the Bouncer to step aside and let the request proceed to the route
    next(); 
  } catch (error) {
    res.status(401).json({ error: 'Access Denied: Invalid badge' });
  }
};

module.exports = auth;
