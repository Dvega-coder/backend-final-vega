// src/routes/carts.routes.js
import { Router } from "express";
import mongoose from "mongoose";
import { CartModel } from "../models/cart.model.js";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// Helper para validar ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 🟢 Crear carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.status(201).json({ status: "success", payload: newCart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// 🟣 Obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    if (!isValidId(cid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart)
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// 🔴 Eliminar producto puntual
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidId(cid) || !isValidId(pid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

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

// 🟠 Reemplazar productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!isValidId(cid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    if (!Array.isArray(products))
      return res.status(400).json({
        status: "error",
        error: "Se espera un arreglo de productos",
      });

    // Validar que todos existan
    const ids = products.map((p) => p.product);
    const found = await ProductModel.find({ _id: { $in: ids } }, { _id: 1 });

    if (found.length !== ids.length)
      return res.status(400).json({
        status: "error",
        error: "Uno o más productId no existen en la BD",
      });

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      {
        products: products.map((p) => ({
          product: p.product,
          quantity: Math.max(1, parseInt(p.quantity) || 1),
        })),
      },
      { new: true }
    ).lean();

    if (!cart)
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// 🔵 Actualizar la cantidad
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
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

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

// ⚫ Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidId(cid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ status: "success", message: "Carrito vaciado" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// 🟢 Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidId(cid) || !isValidId(pid))
      return res.status(400).json({ status: "error", error: "ID inválido" });

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    const product = await ProductModel.findById(pid);
    if (!product)
      return res.status(404).json({ status: "error", error: "Producto no encontrado" });

    const existingItem = cart.products.find((p) => p.product.equals(pid));

    if (existingItem) existingItem.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();

    res.json({
      status: "success",
      message: "Producto agregado correctamente",
      payload: cart,
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;



