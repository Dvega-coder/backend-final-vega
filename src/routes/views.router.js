// src/routes/views.router.js
import { Router } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

const router = Router();

// -----------------------------------------
// 🟢 HOME
// -----------------------------------------
router.get("/", async (req, res) => {
  const products = await ProductModel.find().limit(4).lean();
  res.render("home", { title: "Inicio", products });
});

// -----------------------------------------
// 🟣 LISTADO DE PRODUCTOS (Paginación + Filtros + Sort)
// -----------------------------------------
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const lim = Math.max(parseInt(limit, 10) || 10, 1);
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (pg - 1) * lim;

    // -----------------------------
    // 🔍 FILTRO
    // -----------------------------
    let filter = {};

    if (query) {
      const [key, rawVal] = String(query).split(":");

      if (key === "status" && (rawVal === "true" || rawVal === "false")) {
        filter.status = rawVal === "true";
      }

      if (key === "category" && rawVal.trim() !== "") {
        filter.category = rawVal.trim();
      }
    }

    // -----------------------------
    // 🔽 SORT
    // -----------------------------
    let sortOpt = undefined;
    if (sort === "asc") sortOpt = { price: 1 };
    if (sort === "desc") sortOpt = { price: -1 };

    // -----------------------------
    // 📦 CONSULTA
    // -----------------------------
    const items = await ProductModel.find(filter)
      .sort(sortOpt)
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await ProductModel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);

    // -----------------------------
    // 🔗 PAGINACIÓN CORRECTA
    // -----------------------------
    const prevPage = pg > 1 ? pg - 1 : null;
    const nextPage = pg < totalPages ? pg + 1 : null;

    res.render("products", {
      products: items,
      page: pg,
      totalPages,
      hasPrevPage: prevPage !== null,
      hasNextPage: nextPage !== null,
      prevPage,
      nextPage,
      query,
      sort,
      limit: lim,
    });

  } catch (e) {
    console.error("❌ Error al cargar productos:", e);
    res.status(500).send("Error al cargar productos");
  }
});

// -----------------------------------------
// 🟡 DETALLE DE PRODUCTO
// -----------------------------------------
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    res.render("productDetail", { product });

  } catch (err) {
    res.status(500).send("Error al obtener producto");
  }
});

// -----------------------------------------
// 🔵 VISTA DE CARRITO
// -----------------------------------------
router.get("/carts/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cid)) {
    return res.status(400).send("ID de carrito inválido");
  }

  try {
    const cart = await CartModel.findById(cid).lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");

    res.render("cart", { cart });

  } catch (err) {
    res.status(500).send("Error al obtener carrito");
  }
});

// -----------------------------------------
// 🔴 REAL TIME PRODUCTS
// -----------------------------------------
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("realtimeproducts", { products });

  } catch (err) {
    res.status(500).send("Error al cargar productos en tiempo real");
  }
});

export default router;
