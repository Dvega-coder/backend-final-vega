import Cart from "..Cart.model.js";
import Product from ".Product.model.js";

export default class CartManagerMongo {
  async createCart() {
    return await Cart.create({ products: [] });
  }

  async getCartById(id) {
    return await Cart.findById(id).populate("products.product").lean();
  }

  async addProductToCart(cid, pid) {
    const cart = await Cart.findById(cid);
    const product = await Product.findById(pid);
    if (!cart || !product) throw new Error("Carrito o producto no encontrado");

    const existing = cart.products.find(p => p.product.equals(pid));
    if (existing) existing.quantity++;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    return cart;
  }
}
