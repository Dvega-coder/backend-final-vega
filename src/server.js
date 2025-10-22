



import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import ProductManager from "./managers/ProductManager.js";
import CartManager from "./managers/CartManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8080;

// ----------------- CONFIGURACIÓN -----------------
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ----------------- INSTANCIAS -----------------
const productManager = new ProductManager("./data/products.json");
const cartManager = new CartManager("./data/carts.json", productManager);

// ----------------- VISTAS HANDLEBARS -----------------
app.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { products });
});

app.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", { products });
});

// ----------------- SOCKET.IO -----------------
io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado");

  // Enviar lista inicial
  socket.emit("products", await productManager.getProducts());

  // Agregar producto
  socket.on("addProduct", async (data) => {
    await productManager.addProduct(data);
    io.emit("products", await productManager.getProducts());
  });

  // Eliminar producto
  socket.on("deleteProduct", async (id) => {
    console.log("🗑️ Solicitud de eliminar producto con id:", id);

    const deleted = await productManager.deleteProduct(id);
    if (!deleted) {
      console.warn(`⚠️ No se encontró producto con id ${id}`);
      return;
    }

    console.log(`✅ Producto ${id} eliminado correctamente`);
    io.emit("products", await productManager.getProducts());
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

// ----------------- API REST -----------------
app.get("/api/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    io.emit("products", await productManager.getProducts());
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid; 
    const deleted = await productManager.deleteProduct(pid);
    if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });

    io.emit("products", await productManager.getProducts());
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- INICIO DEL SERVIDOR -----------------
server.listen(PORT, () => console.log(`🚀 Servidor iniciado en puerto ${PORT}`));
