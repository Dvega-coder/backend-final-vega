import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  age: {
    type: Number
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts"
  },
  role: {
    type: String,
    default: "user"
  }
}, {
  timestamps: true
});

// OCULTAR PASSWORD EN RESPUESTAS JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export const UserModel = mongoose.model("users", userSchema);
