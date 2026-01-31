import { Router } from "express";
import mongoose from "mongoose";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// ===============================
// Helpers
// ===============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ===============================
// 🟢 CREAR CARRITO (API)
// ===============================
router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.status(201).json({ status: "success", payload: newCart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ===============================
// 🟣 OBTENER CARRITO POR ID (API)
// ===============================
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    if (!isValidId(cid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ===============================
// 🟢 AGREGAR PRODUCTO (CORREGIDO - USA CARTID DE URL) ✅
// ===============================
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidId(cid) || !isValidId(pid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const product = await ProductModel.findById(pid);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });

    const item = cart.products.find((p) => p.product.equals(pid));

    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();

    res.json({
      status: "success",
      message: "Producto agregado al carrito",
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ===============================
// 🔴 ELIMINAR PRODUCTO (API)
// ===============================
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidId(cid) || !isValidId(pid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const prevLen = cart.products.length;
    cart.products = cart.products.filter((p) => !p.product.equals(pid));

    if (cart.products.length === prevLen)
      return res.status(404).json({
        status: "error",
        error: "El producto no está en el carrito",
      });

    await cart.save();
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ===============================
// 🟠 ACTUALIZAR CANTIDAD (API)
// ===============================
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidId(cid) || !isValidId(pid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1)
      return res.status(400).json({
        status: "error",
        error: "quantity debe ser entero >= 1",
      });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const item = cart.products.find((p) => p.product.equals(pid));
    if (!item)
      return res.status(404).json({
        status: "error",
        error: "El producto no está en el carrito",
      });

    item.quantity = qty;
    await cart.save();

    res.json({ status: "success", message: "Cantidad actualizada" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// ===============================
// ⚫ VACIAR CARRITO (API)
// ===============================
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidId(cid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ status: "success", message: "Carrito vaciado" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;




