import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

const router = Router();

// ===============================
// LOGIN VISTAS (HANDLEBARS)
// ===============================
router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/current",
    failureRedirect: "/login?error=true",
  })
);

// ===============================
//  LOGIN API (JWT) 
// ===============================
router.post("/api-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", error: "Datos incompletos" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", error: "Usuario no existe" });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ status: "error", error: "Password incorrecta" });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      message: "Login exitoso",
      token,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// ===============================
// CURRENT (VALIDAR JWT) 
// ===============================
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      status: "success",
      payload: {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

// ===============================
//  LOGOUT
// ===============================
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

export default router;


