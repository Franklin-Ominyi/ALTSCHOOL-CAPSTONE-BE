const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			lowercase: true,
			trim: true,
			required: [true, "Please enter firstname"],
		},
		lastName: {
			type: String,
			lowercase: true,
			trim: true,
			required: [true, "Please enter lastname"],
		},
		email: {
			type: String,
			lowercase: true,
			trim: true,
			required: [true, "Please enter an email"],
			unique: true,
		},
		password: {
			type: String,
			required: [true, "Please enter a password"],
			minlength: [6, "Minimum password length is 6 characters"],
		},

		verified: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

//pre save mongoose hook
userSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

//static method
userSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			if (user.verified) {
				return user;
			}
			throw new Error("email address has not been verified");
		} else {
			throw Error("Invalid credentials");
		}
	}
	throw Error("Invalid credentials");
};

const User = mongoose.model("User", userSchema);
module.exports = User;
