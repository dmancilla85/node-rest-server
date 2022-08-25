const isAdminRole = (req, next, res = response) => {
  if (!req.authUser) {
    return res.status(500).json({
      msg: 'The user is not authorized',
    });
  }
  const { role, name } = req.authUser;

  if (role !== 'ADMIN_ROLE') {
    return res.status(401).json({
      msg: `${name} is not an administrator`,
    });
  }
  next();
};

// middleware con argumentos
const hasRoles = (...roles) => (req, next, res = response) => {
  if (!req.authUser) {
    return res.status(500).json({
      msg: 'The user is not autorized',
    });
  }

  if (!roles.includes(req.authUser.role)) {
    return res.status(401).json({
      msg: `The service requires one of the following roles: ${roles}`,
    });
  }

  return next();
};

module.exports = { isAdminRole, hasRoles };
