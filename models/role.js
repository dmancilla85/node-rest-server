const { Schema, model } = require("mongoose");

const RoleSchema = Schema({
  role: {
    type: String,
    required: [true, "The role name is required"],
    unique: true
  }
});

module.exports = model("Role", RoleSchema);
