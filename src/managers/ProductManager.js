const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor(filename = 'products.json') {
    this.path = path.resolve(__dirname, '../../data', filename);
  }

  async _readFile() {
    try {
      const content = await fs.readFile(this.path, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await this._writeFile([]);
        return [];
      }
      throw err;
    }
  }

  async _writeFile(data) {
    await fs.mkdir(path.dirname(this.path), { recursive: true });
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf8');
  }

  _generateId() {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => String(p.id) === String(id)) || null;
  }

  async addProduct(product) {
    const required = ['title','description','code','price','status','stock','category','thumbnails'];
    for (const key of required) {
      if (product[key] === undefined) {
        throw new Error(`Falta campo requerido: ${key}`);
      }
    }

    const products = await this._readFile();
    if (products.some(p => p.code === product.code)) {
      throw new Error('Ya existe un producto con ese code');
    }

    const newProduct = {
      id: this._generateId(),
      title: product.title,
      description: product.description,
      code: product.code,
      price: Number(product.price),
      status: Boolean(product.status),
      stock: Number(product.stock),
      category: product.category,
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : []
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this._readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;

    if (updates.id !== undefined) delete updates.id;

    const updated = { ...products[idx], ...updates };
    if (updated.price !== undefined) updated.price = Number(updated.price);
    if (updated.stock !== undefined) updated.stock = Number(updated.stock);
    if (updated.status !== undefined) updated.status = Boolean(updated.status);
    if (updates.thumbnails !== undefined) updated.thumbnails = Array.isArray(updates.thumbnails) ? updates.thumbnails : updated.thumbnails;

    products[idx] = updated;
    await this._writeFile(products);
    return updated;
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return false;
    products.splice(idx, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductManager;
