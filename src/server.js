// ===============================
// ENV
// ===============================
import dotenv from "dotenv";
dotenv.config();

// ===============================
// DB
// ===============================
import connectDB from "./config/db.js";
await connectDB();

// ===============================
// CORE
// ===============================
import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// ===============================
// PASSPORT CONFIG
// ===============================
import initializePassport from "./config/passport.config.js";

// ===============================
// HANDLEBARS
// ===============================
import { engine } from "express-handlebars";

// ===============================
// MODELS
// ===============================
import { ProductModel } from "./models/product.model.js";
import { CartModel } from "./models/cart.model.js";

// ===============================
// ROUTERS
// ===============================
import productsRouterFactory from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.router.js";
import usersRouter from "./routes/users.routes.js";
import sessionsRouter from "./routes/sessions.routes.js";

// ===============================
// PATHS
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// APP + SERVER
// ===============================
const app = express();
const server = createServer(app);
const io = new Server(server);

// ===============================
// SESSION 
// ===============================
app.use(
  session({
    secret: "coderSecret123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // localhost
      sameSite: "lax",
    },
  })
);

// ===============================
// BASE MIDDLEWARES
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// ===============================
// PASSPORT
// ===============================
initializePassport();
app.use(passport.initialize());
app.use(passport.session()); 

// 👉 user disponible en vistas
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ===============================
// CARRITO AUTOMÁTICO POR SESIÓN
// ===============================
app.use(async (req, res, next) => {
  if (!req.session.cartId) {
    const newCart = await CartModel.create({ products: [] });
    req.session.cartId = newCart._id;
  }
  next();
});

// 👉 cartId disponible en vistas
app.use((req, res, next) => {
  res.locals.cartId = req.session.cartId;
  next();
});

// ===============================
// HANDLEBARS
// ===============================
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "..", "views", "layouts"),
    helpers: {
      eq: (a, b) => a === b,
      ne: (a, b) => a !== b,
      multiply: (a, b) => a * b,
      total: (products = []) =>
        products.reduce((acc, p) => {
          if (!p?.product?.price) return acc;
          return acc + p.product.price * p.quantity;
        }, 0),
      year: () => new Date().getFullYear(),
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "..", "views"));

// ===============================
// ROUTES
// ===============================
app.use("/", viewsRouter);
app.use("/api/products", productsRouterFactory(io));
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);

// ===============================
// SOCKET.IO
// ===============================
io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  const products = await ProductModel.find().lean();
  socket.emit("products", products);

  socket.on("refreshProducts", async () => {
    const updated = await ProductModel.find().lean();
    io.emit("products", updated);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en http://localhost:" + PORT);
});










