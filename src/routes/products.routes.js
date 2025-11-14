// src/routes/products.routes.js
import { Router } from "express";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";

const productsRouterFactory = (io) => {
  const router = Router();

  // 🟢 GET /api/products → paginación, filtros y orden
  router.get("/", async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;

      // ---------------------------
      // FILTRO
      // ---------------------------
      const filter = {};
      if (query) {
        const [key, rawVal] = String(query).split(":");
        if (key === "status") filter.status = rawVal === "true";
        else if (key === "category") filter.category = rawVal;
        else if (key === "available") filter.stock = { $gt: 0 }; // extra opcional
      }

      // ---------------------------
      // ORDENAMIENTO
      // ---------------------------
      const sortOpt =
        sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

      // ---------------------------
      // PAGINACIÓN
      // ---------------------------
      const lim = Math.max(parseInt(limit, 10) || 10, 1);
      const pg = Math.max(parseInt(page, 10) || 1, 1);
      const skip = (pg - 1) * lim;

      const [items, totalDocs] = await Promise.all([
        ProductModel.find(filter).sort(sortOpt).skip(skip).limit(lim).lean(),
        ProductModel.countDocuments(filter),
      ]);

      const totalPages = Math.max(Math.ceil(totalDocs / lim), 1);

      const prevPage = pg > 1 ? pg - 1 : null;
      const nextPage = pg < totalPages ? pg + 1 : null;

      // ---------------------------
      // RESPUESTA FINAL (Consigna exacta)
      // ---------------------------
      return res.json({
        status: "success",
        payload: items,
        totalPages,
        page: pg,
        prevPage,
        nextPage,
        hasPrevPage: prevPage !== null,
        hasNextPage: nextPage !== null,
        prevLink: prevPage
          ? `/api/products?limit=${lim}&page=${prevPage}&sort=${sort || ""}&query=${query || ""}`
          : null,
        nextLink: nextPage
          ? `/api/products?limit=${lim}&page=${nextPage}&sort=${sort || ""}&query=${query || ""}`
          : null,
      });
    } catch (err) {
      console.error("GET /api/products error:", err);
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // 🟣 GET /api/products/:pid → detalle de producto por ID
  router.get("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({
          status: "error",
          error: "ID de producto inválido",
        });
      }

      const product = await ProductModel.findById(pid).lean();
      if (!product) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }

      return res.json({ status: "success", payload: product });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // 🟢 POST /api/products → crear nuevo producto
  router.post("/", async (req, res) => {
    try {
      const { title, price, category, description, stock } = req.body;

      if (!title || !price || !category) {
        return res.status(400).json({
          status: "error",
          error: "Faltan campos obligatorios: title, price y category",
        });
      }

      const newProduct = await ProductModel.create({
        title,
        price,
        category,
        description: description || "",
        stock: stock ?? 0,
        status: true,
      });

      // Emitir lista actualizada
      const updatedList = await ProductModel.find().lean();
      io.emit("products", updatedList);

      return res.status(201).json({
        status: "success",
        message: "Producto creado correctamente",
        payload: newProduct,
      });
    } catch (err) {
      console.error("POST /api/products error:", err);
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // 🔵 PUT /api/products/:pid → actualizar producto
  router.put("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({
          status: "error",
          error: "ID de producto inválido",
        });
      }

      const updateData = req.body;

      const updated = await ProductModel.findByIdAndUpdate(pid, updateData, {
        new: true,
      }).lean();

      if (!updated) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }

      const updatedList = await ProductModel.find().lean();
      io.emit("products", updatedList);

      return res.json({
        status: "success",
        message: "Producto actualizado correctamente",
        payload: updated,
      });
    } catch (err) {
      console.error("PUT /api/products/:pid error:", err);
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // 🔴 DELETE /api/products/:pid → eliminar producto
  router.delete("/:pid", async (req, res) => {
    try {
      const { pid } = req.params;

      if (!mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({
          status: "error",
          error: "ID de producto inválido",
        });
      }

      const deleted = await ProductModel.findByIdAndDelete(pid);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }

      const updatedList = await ProductModel.find().lean();
      io.emit("products", updatedList);

      return res.json({
        status: "success",
        message: "Producto eliminado correctamente",
      });
    } catch (err) {
      console.error("DELETE /api/products/:pid error:", err);
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  return router;
};

export default productsRouterFactory;



