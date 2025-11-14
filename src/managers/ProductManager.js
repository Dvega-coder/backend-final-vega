import FileManager from "./FileManager.js";

export default class ProductManager extends FileManager {
  constructor(path) {
    super(path);
  }

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => p.id == id);
  }

  async addProduct(productData) {
    const { title, price } = productData;
    if (!title || !price) throw new Error("Faltan campos obligatorios");

    const products = await this._readFile();
    const newProduct = { id: Date.now().toString(), ...productData };
    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this._readFile();
    const index = products.findIndex(p => p.id == id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updateData };
    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const filtered = products.filter(p => p.id != id);
    await this._writeFile(filtered);
    return products.length !== filtered.length;
  }
}




