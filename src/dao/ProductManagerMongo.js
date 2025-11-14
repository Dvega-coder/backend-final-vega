import Product from ".Product.model.js";

export default class ProductManagerMongo {
  async getProducts() {
    return await Product.find().lean();
  }

  async getProductById(id) {
    return await Product.findById(id).lean();
  }

  async addProduct(data) {
    const newProduct = new Product(data);
    return await newProduct.save();
  }

  async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}
