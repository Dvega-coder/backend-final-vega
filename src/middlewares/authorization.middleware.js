export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
  
      // No autenticado (falló passport o no vino token)
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          error: "No autenticado"
        });
      }
  
      // Rol no permitido
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          error: "No tenés permisos para esta acción"
        });
      }
  
      // Autorizado
      next();
    };
  };
  
  