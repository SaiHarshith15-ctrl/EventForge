const ApiError = require('../utils/ApiError');

// Usage: authorize('organizer', 'admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized');
  }
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, `Role '${req.user.role}' is not permitted to access this resource`);
  }
  next();
};

module.exports = authorize;
