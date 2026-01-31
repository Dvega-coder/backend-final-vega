
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: [1, "La cantidad mínima es 1"],
        validate: Number.isInteger,
      },
    },
  ],
}, { timestamps: true });


cartSchema.pre(["find", "findOne"], function () {
  this.populate("products.product");
});

export const CartModel = mongoose.model("Cart", cartSchema);



