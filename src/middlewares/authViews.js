

// 👉 Solo usuarios NO logueados
// Si ya está logueado, lo mandamos a /current
export const onlyPublic = (req, res, next) => {
    if (req.user) {
      return res.redirect("/current");
    }
    next();
  };
  
  // 👉 Solo usuarios logueados
  // Si NO está logueado, lo mandamos a /login
  export const onlyPrivate = (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }
    next();
  };
  