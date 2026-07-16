export const checkPermission = (requiredPermissions = []) => {
  return (req, res, next) => {
    const { role } = req.admin;

    const permissions = {
      super_admin: ['*'],
      editor: ['create_content', 'edit_content', 'delete_content', 'view_audit'],
      viewer: ['view_content', 'view_audit']
    };

    const rolePermissions = permissions[role] || [];

    if (rolePermissions.includes('*') || requiredPermissions.length === 0 || requiredPermissions.some(p => rolePermissions.includes(p))) {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
