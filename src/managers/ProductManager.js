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
    return products.find(p => String(p.id) === String(id));
  }

  async addProduct(productData) {
    const products = await this._readFile();
    const newProduct = { id: this._generateId(products), ...productData };
    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this._readFile();
    const index = products.findIndex(p => String(p.id) === String(id));
    if (index === -1) return null;

    products[index] = { ...products[index], ...updateData };
    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const filtered = products.filter(p => String(p.id) !== String(id));
    await this._writeFile(filtered);
    const deleted = products.length !== filtered.length;
    console.log(deleted ? `✅ Producto ${id} eliminado` : `⚠️ No se encontró producto ${id}`);
    return deleted;
  }
}



