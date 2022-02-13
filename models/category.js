const { Schema, model } = require("mongoose");

const CategorySchema = Schema({
  name: {
    type: String,
    required: [true, "The name is required"],
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
  }
});

CategorySchema.methods.toJSON = function () {
  const { __v, _id, active, ...category } = this.toObject();
  category.uid = _id;
  return category;
};

module.exports = model("Category", CategorySchema);
