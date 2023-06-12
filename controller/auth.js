const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Url = require("../models/Url");
const VerifyAccTemp = require("../templates/VerifyAccount");
const PasswordRecovery = require("../templates/PasswordRecovery");
const Token = require("../models/Token");
const VerifyAccToken = require("../models/VerifyAccToken");
const {
	handleErrors,
	sendMail,
	capitilizeName,
} = require("../helpers/helpers");

// Login user
exports.login = async (req, res) => {
	const maxAge = process.env.JWT_AGE * 24 * 60 * 60;
	const createToken = (id, firstName, lastName, email) => {
		return jwt.sign(
			{
				id,
				firstName,
				lastName,
				email,
			},
			process.env.JWT_SECRETE,
			{
				expiresIn: maxAge,
			}
		);
	};

	const { email, password } = req.body;
	try {
		const user = await User.login(email, password);
		const token = createToken(
			user._id,
			user.firstName,
			user.lastName,
			user.email
		);

		res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
		res.json({
			error: false,
			message: "succesfully logged in",
			data: { token },
		});
	} catch (err) {
		const errors = await handleErrors(err);
		console.log(err);
		res.status(400).json({ errors });
	}
};

// Logout User
module.exports.logout = (req, res) => {
	res.cookie("jwt", "", { maxAge: 1 });
	res.json({ error: false, message: "successfully logged out" });
};

// Register user
module.exports.signup = async (req, res) => {
	const { email, password, firstName, lastName } = req.body;

	try {
		if (!email || !password || password.length < 6 || !firstName || !lastName) {
			res
				.status(400)
				.json({ error: true, message: "an error occured please try again" });
			return;
		}
		const isUser = await User.findOne({ email });
		if (!isUser) {
			const user = await User.create({
				email,
				password,
				firstName,
				lastName,
			});

			// Send Account Verification Email
			try {
				const { _id, firstName, email } = user;

				// Signing of JWT for password reset
				const verifyAccountToken = await jwt.sign(
					{ email, id: _id },
					process.env.JWT_SECRETE,
					{
						expiresIn: 365 * 24 * 60 * 60,
					}
				);

				// Check if token exists in db
				const tokenExists = await VerifyAccToken.findOne({ email });
				if (tokenExists) {
					const result = await VerifyAccToken.findByIdAndDelete(tokenExists._id);
					if (!result) {
						res
							.status(400)
							.json({ error: true, message: "an error occured please try again" });
					}
				}

				const salt = await bcrypt.genSalt();
				const hashedVerificationToken = await bcrypt.hash(verifyAccountToken, salt);

				//Creating a token in the db
				const response = await VerifyAccToken.create({
					email,
					token: hashedVerificationToken,
				});

				// console.log(response)
				if (!response) {
					res
						.status(400)
						.json({ error: true, message: "an error occured please try again" });
				}

				// Sending email
				const url = `https://6or.netlify.app/confirm-email/${response._id}/${verifyAccountToken}`;

				try {
					await sendMail(
						email,
						"Email Verification - Scissors",
						VerifyAccTemp(capitilizeName(firstName), url)
					);

					res.json({
						error: false,
						message: "You're in!",
					});
				} catch (error) {
					if (error) {
						console.log(error);
						res
							.status(400)
							.json({ error: true, message: "an error occured please try again" });
					}
				}
			} catch (error) {
				console.log(error);
				res.json({ error: true, message: "an error occured please try again" });
			}
		} else {
			res.json({ error: true, message: "User already exists" });
		}
	} catch (err) {
		const error = await handleErrors(err);
		console.log(err);
		res.status(400).json({ error });
	}
};

// Forgotten Password
module.exports.forgotten_password = async (req, res) => {
	const { email } = req.body;

	if (email === "" || email.length < 6 || email === undefined) {
		res
			.status(400)
			.json({ error: true, message: "email length can't be less than 6" });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) throw new Error("email address is not valid");

		const { _id, firstName } = user;

		// Signing of JWT for password reset
		const forgottenPswdToken = await jwt.sign(
			{ email, id: _id },
			process.env.JWT_SECRETE,
			{
				expiresIn: 10 * 60,
			}
		);

		// Check if token exists in db
		const tokenExists = await Token.findOne({ email });
		if (tokenExists) {
			const result = await Token.findByIdAndDelete(tokenExists._id);
			if (!result) {
				res
					.status(400)
					.json({ error: true, message: "an error occured please try again" });
			}
		}

		const salt = await bcrypt.genSalt();
		const hashedForgettonPswdToken = await bcrypt.hash(forgottenPswdToken, salt);

		//Creating a token in the db
		const response = await Token.create({
			email,
			token: hashedForgettonPswdToken,
		});

		if (!response) {
			res
				.status(400)
				.json({ error: true, message: "an error occured please try again" });
		}

		// Sending email
		const url = `https://6or.netlify.app/reset-password/${response._id}/${forgottenPswdToken}`;

		try {
			const mail = await sendMail(
				email,
				"Reset Password - Scissors",
				PasswordRecovery(capitilizeName(firstName), url)
			);

			res.json({
				error: false,
				message: "password recovery email has been sent to your email",
			});
		} catch (error) {
			if (error) {
				console.log(error);
				res
					.status(400)
					.json({ error: true, message: "an error occured please try again" });
			}
		}
	} catch (error) {
		console.log(error);
		res.json({ error: true, message: "email address is not valid" });
	}
};

// reset password
module.exports.request_new_password = async (req, res) => {
	const { id, token } = req.params;
	const { password } = req.body;

	if (password === "" || password.length < 6 || password === undefined) {
		res
			.status(400)
			.json({ error: true, message: "Password length can't be less than 6" });
	} else if (id === "" || id.length < 5 || id === undefined) {
		res.status(400).json({ error: true, message: "Please enter a valid token" });
	} else if (token === "" || token.length < 20 || token === undefined) {
		res.status(400).json({ error: true, message: "Please enter a valid token" });
	}
	try {
		// Checking if the token is in db
		const result = await Token.findOne({ _id: id });
		if (!result) {
			throw new Error("invalid token");
		}

		// Checking token authenticity
		const auth = await bcrypt.compare(token, result.token);
		// Verifying token
		if (auth) {
			try {
				jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
					if (err) {
						if (err.message.includes("jwt expired")) {
							res.status(400).json({
								error: true,
								message: "token has expired",
							});
						} else {
							res.status(400).json({
								error: true,
								message: "token is not valid",
							});
						}
					} else if (decodedToken) {
						const salt = await bcrypt.genSalt();
						const hashedPassword = await bcrypt.hash(password, salt);
						try {
							User.findByIdAndUpdate(
								decodedToken.id,
								{
									password: hashedPassword,
								},
								async (err, result) => {
									if (err) {
										throw new Error("an error occured, please try again");
									}

									// Deleting the token in the db
									try {
										const response = await Token.findByIdAndDelete(id);

										// Sending response
										res.json({
											error: false,
											message: "successfully updated your password",
										});
									} catch (error) {
										res.status(400).json({
											error: true,
											message: "an error occured please try again",
										});
									}
								}
							);
						} catch (error) {
							console.log(error);
							res
								.status(400)
								.json({ error: true, message: "an error occured please try again" });
						}
					}
				});
			} catch (error) {
				res
					.status(400)
					.json({ error: true, message: "an error occured please try again" });
			}
		} else {
			res.status(400).json({ error: true, message: "token is not valid" });
		}
	} catch (error) {
		res.status(400).json({
			error: true,
			message: "token is not valid",
		});
	}
};

// Verify Email
module.exports.verify_account = async (req, res) => {
	const { id, token } = req.params;
	if (
		id === undefined ||
		id === "" ||
		id === null ||
		token === "" ||
		token === undefined ||
		token === null
	) {
		res.status(400).json({ error: true, message: "invalid credientials" });
	}

	try {
		// Checking if the token is in db
		const result = await VerifyAccToken.findOne({ _id: id });
		if (!result) {
			throw new Error("invalid token");
		}

		// Checking token authenticity
		const auth = await bcrypt.compare(token, result.token);
		// Verifying token
		if (auth) {
			try {
				jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
					if (err) {
						if (err.message.includes("jwt expired")) {
							res.status(400).json({
								error: true,
								message: "token has expired",
							});
						} else {
							res.status(400).json({
								error: true,
								message: "token is not valid",
							});
						}
					} else if (decodedToken) {
						try {
							User.findByIdAndUpdate(
								decodedToken.id,
								{
									verified: true,
								},
								async (err, result) => {
									if (err) {
										throw new Error("an error occured, please try again");
									}

									// Deleting the token in the db
									try {
										const response = await VerifyAccToken.findByIdAndDelete(id);

										// Sending response
										res.json({
											error: false,
											message: "successfully verified your account",
										});
									} catch (error) {
										res.status(400).json({
											error: true,
											message: "an error occured please try again",
										});
									}
								}
							);
						} catch (error) {
							console.log(error);
							res
								.status(400)
								.json({ error: true, message: "an error occured please try again" });
						}
					}
				});
			} catch (error) {
				res
					.status(400)
					.json({ error: true, message: "an error occured please try again" });
			}
		} else {
			res.status(400).json({ error: true, message: "token is not valid" });
		}
	} catch (error) {
		res.status(400).json({
			error: true,
			message: "token is not valid",
		});
	}
};

// Get logged in user
exports.getAuthUser = async (req, res) => {
	const tokenHeader = req.headers["authorization"];
	const token = tokenHeader?.split(" ")[1];

	if (token) {
		jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
			if (err) {
				res.status(400).json(null);
			} else {
				const result = await User.findById(decodedToken.id, { password: 0 });
				const urls = await Url.find({ userId: decodedToken.id }).sort({
					createdAt: -1,
				});
				const { _id, firstName, lastName, email, createdAt } = result;
				res.json({
					error: false,
					message: "you are authenticated..",
					user: {
						_id,
						createdAt,
						firstName,
						lastName,
						email,
						urls,
					},
				});
			}
		});
	} else {
		res.status(400).json(null);
	}
};
