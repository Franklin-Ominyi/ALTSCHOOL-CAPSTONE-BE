const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
	{
		longUrl: {
			type: String,
			required: [true, "URL is required"],
		},
		shortUrl: {
			type: String,
			unique: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		visits: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = Token = mongoose.model("url", urlSchema);
