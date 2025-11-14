// ✅ src/server.js
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
await connectDB();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// --- Modelos (para socket.io) ---
import { ProductModel } from "./models/product.model.js";

// --- Routers ---
import productsRouterFactory from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.router.js";

// --- Configuración de paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuración base ---
const app = express();
const server = createServer(app);
const io = new Server(server);

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// --- Configuración de Handlebars ---
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "..", "views", "layouts"),
    helpers: {
      // Operadores lógicos y de comparación
      eq: (a, b) => a === b,
      ne: (a, b) => a !== b,
      lt: (a, b) => a < b,
      gt: (a, b) => a > b,
      lte: (a, b) => a <= b,
      gte: (a, b) => a >= b,
      and: (a, b) => a && b,
      or: (a, b) => a || b,

      // Helpers matemáticos para carrito
      multiply: (a, b) => a * b,
      total: (products) =>
        products.reduce((acc, p) => acc + p.product.price * p.quantity, 0),

      // Año dinámico para footer
      year: () => new Date().getFullYear(),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "..", "views"));

// --- Rutas principales ---
app.use("/", viewsRouter);
app.use("/api/products", productsRouterFactory(io));
app.use("/api/carts", cartsRouter);

// --- WebSockets: productos en tiempo real ---
io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // Enviar lista inicial de productos
  const products = await ProductModel.find().lean();
  socket.emit("products", products);

  // Actualizar productos cuando cambie algo
  socket.on("refreshProducts", async () => {
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// --- Iniciar servidor ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("✅ Conectado a MongoDB");
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});





