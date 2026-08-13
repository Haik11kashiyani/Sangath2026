export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    if (req.user.role === 'Super Admin') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden. Insufficient role.' });
    }
    next();
  };
};

export const requirePermission = (...requiredPerms) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    
    // Convert to array if it is a string (e.g., from DB JSON string)
    let userPerms = req.user.permissions || [];
    if (typeof userPerms === 'string') {
      try {
        userPerms = JSON.parse(userPerms);
      } catch (e) {
        userPerms = [];
      }
    }

    if (req.user.role === 'Super Admin' || userPerms.includes('all')) {
      return next();
    }

    const hasPermission = requiredPerms.some(perm => userPerms.includes(perm));
    if (!hasPermission) {
      return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
};

/* 
Role mapping reference:
- Super Admin: permissions = ['all']
- Content Manager: permissions = ['cms', 'categories', 'images']
- Product Manager: permissions = ['products', 'categories', 'images']
- Sales Rep: permissions = ['inquiries']
*/
