import FileManager from "./FileManager.js";

export default class CartManager extends FileManager {
  constructor(path, productManager) {
    super(path);
    this.productManager = productManager;
  }

  async getCarts() {
    return await this._readFile();
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find(c => c.id === id);
  }

  async createCart() {
    const carts = await this._readFile();
    const newCart = { id: this._generateId(carts), products: [] };
    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._readFile();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    //  Verificar si el producto existe antes de agregarlo
    const product = await this.productManager.getProductById(productId);
    if (!product) throw new Error("Producto no encontrado");

    const existing = cart.products.find(p => p.product === productId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this._writeFile(carts);
    return cart;
  }
}

