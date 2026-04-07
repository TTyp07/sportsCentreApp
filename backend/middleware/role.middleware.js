const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied for role: ${req.user.role}` });
      }
      next();
    };
  };
  
  const isMemberActive = (req, res, next) => {
    if (req.user.role === 'member' && !req.user.membershipActive) {
      return res.status(403).json({ message: 'Your membership is inactive' });
    }
    next();
  };
  
  const isStaffApproved = (req, res, next) => {
    if (req.user.role === 'staff' && (!req.user.isApproved || req.user.isSuspended)) {
      return res.status(403).json({ message: 'Your staff account is not approved or is suspended' });
    }
    next();
  };
  
  module.exports = { authorizeRoles, isMemberActive, isStaffApproved };