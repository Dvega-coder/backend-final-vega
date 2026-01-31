import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model.js";

const router = Router();

// 🔹 GET todos los usuarios
router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find().populate("cart").lean();
    res.json({ status: "success", payload: users });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// 🔹 GET usuario por ID
router.get("/:uid", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.uid).populate("cart");
    if (!user) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", payload: user });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// 🔹 POST crear usuario (registro)
router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: "error", error: "Datos incompletos" });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ status: "error", error: "El usuario ya existe" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword
    });

    res.status(201).json({ status: "success", payload: newUser });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// 🔹 PUT actualizar usuario
router.put("/:uid", async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.uid,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }

    res.json({ status: "success", payload: updatedUser });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// 🔹 DELETE usuario
router.delete("/:uid", async (req, res) => {
  try {
    const deleted = await UserModel.findByIdAndDelete(req.params.uid);
    if (!deleted) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }
    res.json({ status: "success", message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
