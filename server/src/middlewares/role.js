const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};

