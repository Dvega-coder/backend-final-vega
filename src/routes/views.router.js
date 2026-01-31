import { Router } from "express";
import { ProductModel } from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";
import { onlyPublic, onlyPrivate } from "../middlewares/authViews.js";

const router = Router();

// -----------------------------------------
// ROOT inteligente
// -----------------------------------------
router.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/home");
  }
  return res.redirect("/login");
});

// -----------------------------------------
// LOGIN (solo NO logueados)
// -----------------------------------------
router.get("/login", onlyPublic, (req, res) => {
  res.render("login", {
    error: req.query.error
  });
});

// -----------------------------------------
// LOGOUT
// -----------------------------------------
router.get("/logout", (req, res) => {
  // JWT es stateless, solo redirigimos
  res.redirect("/login");
});

// -----------------------------------------
// HOME (solo logueados)
// -----------------------------------------
router.get("/home", onlyPrivate, async (req, res) => {
  try {
    const products = await ProductModel.find().limit(4).lean();

    res.render("home", {
      title: "Inicio",
      products,
      user: req.user
    });
  } catch (err) {
    res.status(500).send("Error al cargar home");
  }
});

// -----------------------------------------
// 👤 CURRENT (solo logueados)
// -----------------------------------------
router.get("/current", onlyPrivate, (req, res) => {
  res.render("current", {
    user: {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// -----------------------------------------
// 🟣 LISTADO DE PRODUCTOS (pública)
// -----------------------------------------
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg = Math.max(parseInt(page) || 1, 1);
    const skip = (pg - 1) * lim;

    let filter = {};
    if (query) {
      const [key, value] = String(query).split(":");
      if (key === "status") filter.status = value === "true";
      if (key === "category") filter.category = value;
    }

    let sortOpt = {};
    if (sort === "asc") sortOpt.price = 1;
    if (sort === "desc") sortOpt.price = -1;

    const products = await ProductModel.find(filter)
      .sort(sortOpt)
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await ProductModel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);

    res.render("products", {
      products,
      page: pg,
      totalPages,
      hasPrevPage: pg > 1,
      hasNextPage: pg < totalPages,
      prevPage: pg > 1 ? pg - 1 : null,
      nextPage: pg < totalPages ? pg + 1 : null,
      query,
      sort,
      limit: lim,
      user: req.user
    });

  } catch (err) {
    console.error("❌ Error productos:", err);
    res.status(500).send("Error al cargar productos");
  }
});

// -----------------------------------------
// 🟡 DETALLE DE PRODUCTO (pública)
// -----------------------------------------
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");

    res.render("productDetail", {
      product,
      user: req.user
    });

  } catch (err) {
    res.status(500).send("Error al cargar producto");
  }
});

// -----------------------------------------
// 🔵 CARRITO  
// -----------------------------------------
router.get("/cart", async (req, res) => {
  try {
    // 👉 Leer cartId 
    const cartId = req.query.cartId;

    if (!cartId) {
      return res.render("cart", {
        cart: { products: [] },
        user: req.user,
        cartId: null
      });
    }

    const cart = await CartModel.findById(cartId)
      .populate("products.product")
      .lean();

    res.render("cart", {
      cart: cart || { products: [] },
      user: req.user,
      cartId: cartId
    });

  } catch (err) {
    console.error("❌ Error carrito:", err);
    res.status(500).send("Error al obtener carrito");
  }
});

// -----------------------------------------
// 🔴 REALTIME PRODUCTS (pública)
// -----------------------------------------
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();

    res.render("realtimeproducts", {
      products,
      user: req.user
    });

  } catch (err) {
    res.status(500).send("Error al cargar realtime products");
  }
});

export default router;




