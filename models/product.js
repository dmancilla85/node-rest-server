const { Schema, model } = require("mongoose");

const ProductSchema = Schema({
  name: {
    type: String,
    required: [true, "The product name is required"],
    unique: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  description: { type: String },
  available: { type: Boolean, default: true }
});

ProductSchema.methods.toJSON = function () {
  const { __v, active, ...data } = this.toObject();
  return data;
};

module.exports = model("Product", ProductSchema);
