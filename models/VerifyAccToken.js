const mongoose = require("mongoose");

const verifyAccTokenSchema = new mongoose.Schema(
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

module.exports = VerifyAccToken = mongoose.model(
 "VerifyAccToken",
 verifyAccTokenSchema
);
