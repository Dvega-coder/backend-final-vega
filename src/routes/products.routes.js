import { Router } from "express";
import mongoose from "mongoose";
import passport from "passport";
import { ProductModel } from "../models/product.model.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const productsRouterFactory = (io) => {
  const router = Router();

  // =========================
  // 🟢 GET /api/products (PÚBLICO)
  // =========================
  router.get("/", async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;

      const filter = {};
      if (query) {
        const [key, value] = query.split(":");
        if (key === "category") filter.category = value;
        if (key === "status") filter.status = value === "true";
      }

      const sortOpt =
        sort === "asc" ? { price: 1 } :
        sort === "desc" ? { price: -1 } :
        {};

      const lim = parseInt(limit);
      const pg = parseInt(page);
      const skip = (pg - 1) * lim;

      const products = await ProductModel.find(filter)
        .sort(sortOpt)
        .skip(skip)
        .limit(lim)
        .lean();

      const totalDocs = await ProductModel.countDocuments(filter);
      const totalPages = Math.ceil(totalDocs / lim);

      res.json({
        status: "success",
        payload: products,
        totalPages,
        page: pg,
        hasPrevPage: pg > 1,
        hasNextPage: pg < totalPages,
        prevPage: pg > 1 ? pg - 1 : null,
        nextPage: pg < totalPages ? pg + 1 : null
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error.message
      });
    }
  });

  // =========================
  // 🟢 GET /api/products/:pid (PÚBLICO)
  // =========================
  router.get("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({
          status: "error",
          error: "ID inválido"
        });
      }

      const product = await ProductModel.findById(pid).lean();

      if (!product) {
        return res.status(404).json({
          status: "error",
          error: "Producto no encontrado"
        });
      }

      res.json({
        status: "success",
        payload: product
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: error.message
      });
    }
  });

  // =========================
  // 🔐 POST /api/products (SOLO ADMIN)
  // =========================
  router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
      try {
        const { title, price, category, description, stock } = req.body;

        if (!title || !price || !category) {
          return res.status(400).json({
            status: "error",
            error: "Faltan campos obligatorios"
          });
        }

        const newProduct = await ProductModel.create({
          title,
          price,
          category,
          description: description || "",
          stock: stock ?? 0,
          status: true
        });

        const updatedProducts = await ProductModel.find().lean();
        io.emit("products", updatedProducts);

        res.status(201).json({
          status: "success",
          payload: newProduct
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          error: error.message
        });
      }
    }
  );

  // =========================
  // PUT /api/products/:pid (SOLO ADMIN)
  // =========================
  router.put(
    "/:pid",
    passport.authenticate("jwt", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
      try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
          return res.status(400).json({
            status: "error",
            error: "ID inválido"
          });
        }

        const updated = await ProductModel.findByIdAndUpdate(
          pid,
          req.body,
          { new: true }
        ).lean();

        if (!updated) {
          return res.status(404).json({
            status: "error",
            error: "Producto no encontrado"
          });
        }

        const updatedProducts = await ProductModel.find().lean();
        io.emit("products", updatedProducts);

        res.json({
          status: "success",
          payload: updated
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          error: error.message
        });
      }
    }
  );

  // =========================
  // 🔐 DELETE /api/products/:pid (SOLO ADMIN)
  // =========================
  router.delete(
    "/:pid",
    passport.authenticate("jwt", { session: false }),
    authorizeRoles("admin"),
    async (req, res) => {
      try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
          return res.status(400).json({
            status: "error",
            error: "ID inválido"
          });
        }

        const deleted = await ProductModel.findByIdAndDelete(pid);

        if (!deleted) {
          return res.status(404).json({
            status: "error",
            error: "Producto no encontrado"
          });
        }

        const updatedProducts = await ProductModel.find().lean();
        io.emit("products", updatedProducts);

        res.json({
          status: "success",
          message: "Producto eliminado"
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          error: error.message
        });
      }
    }
  );

  return router;
};

export default productsRouterFactory;





