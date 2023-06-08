const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
 {
  email: {
   type: String,
   required: true,
   unique: true,
  },
  token: {
   type: String,
   required: true,
   unique: true,
  },
 },
 { timestamps: true }
);

module.exports = Token = mongoose.model("token", tokenSchema);
