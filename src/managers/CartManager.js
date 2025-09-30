const fs = require("fs").promises;
const path = require("path");

class CartManager {
  constructor(filename = "carts.json") {
    this.path = path.resolve(__dirname, "../../data", filename);
  }

  async _readFile() {
    try {
      const content = await fs.readFile(this.path, "utf8");
      return JSON.parse(content || "[]");
    } catch (err) {
      if (err.code === "ENOENT") {
        await this._writeFile([]);
        return [];
      }
      throw err;
    }
  }

  async _writeFile(data) {
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), "utf8");
  }

  _generateId() {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async createCart() {
    const carts = await this._readFile();
    const newCart = { id: this._generateId(), products: [] };
    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._readFile();
    const cart = carts.find(c => String(c.id) === String(cartId));
    if (!cart) return null;

    const existing = cart.products.find(p => String(p.product) === String(productId));
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this._writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;
