const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const openid = req.headers['x-openid'];

    if (!openid) {
      return res.status(401).json({ error: 'Unauthorized: missing openid' });
    }

    const user = await User.findOne({ openid });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }

    req.user = user;
    req.openid = openid;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Auth middleware error' });
  }
};

module.exports = authMiddleware;