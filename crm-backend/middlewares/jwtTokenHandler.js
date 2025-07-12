const { verifyToken } = require('../utilis/jwtHelper');
const { getUserRolesByUserId } = require('../repositories/users');

const verifyTokenHandler = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = await verifyToken(token);
    req.userid = decoded.userid;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const verifyRoles = (roles) => async (req, res, next) => {
  const userId = req.userid;
  const userRoles = await getUserRolesByUserId(userId);
  const userRoleNames = userRoles.map((r) => r.name);
  const hasRole = roles.some((role) => userRoleNames.includes(role));

  if (!hasRole) {
    return res.status(403).json({ message: 'You do not have permission' });
  }
  next();
};

module.exports = {
  verifyTokenHandler,
  verifyRoles,
};