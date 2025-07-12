const jwt = require('jsonwebtoken');
const SECRET = 'Faz03032002';

function createJwt(userid) {
  return jwt.sign({ userid }, SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    // Remove "Bearer " prefix if it exists
    const formattedToken = token.replace(/^Bearer\s+/, '');
    jwt.verify(formattedToken, SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err.message);
        return reject({ valid: false, error: err });
      }
      resolve({ valid: true, userid: decoded.userid });
    });
  });
}

module.exports = {
  createJwt,
  verifyToken,
};