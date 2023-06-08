const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
	const tokenHeader = req.headers["authorization"];
	const token = tokenHeader?.split(" ")[1];

	if (token) {
		jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
			if (err) {
				res.status(403).json(null);
			} else {
				const result = await User.findById(decodedToken.id, { password: 0 });
				if (result) {
					req.user = result;
					next();
				} else {
					res
						.status(403)
						.json({ error: true, message: "user is not authenticated" });
				}
			}
		});
	} else {
		res.status(403).json(null);
	}
};

const requireAuthorization = async (req, res, next) => {
	const tokenHeader = req.headers["authorization"];
	const token = tokenHeader?.split(" ")[1];

	if (token) {
		jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
			if (err) {
				res.status(403).json(null);
			} else {
				const result = await User.findById(decodedToken.id, { password: 0 });
				if (result) {
					req.user = result;
					next();
				} else {
					res
						.status(403)
						.json({ error: true, message: "user is not authenticated" });
				}
			}
		});
	} else {
		res.status(403).json({ error: true, message: "user is not authenticated" });
	}
};

const checkIsAdmin = (req, res, next) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, process.env.JWT_SECRETE, async (err, decodedToken) => {
			if (err) {
				//  console.log(err)
				res.status(400).json(null);
			} else if (decodedToken) {
				const { id } = decodedToken;
				const user = await User.findById(id);
				if (user) {
					const { role } = user;
					if (role !== "admin") {
						res.status(403).json({
							error: true,
							message: "Unauthorised",
						});
					} else {
						next();
					}
				} else {
					res.status(403).json({ error: true, message: "Unauthorised" });
				}
			}
		});
	} else {
		res.status(403).json({ error: true, message: "Unauthorised" });
	}
};

module.exports = { requireAuth, requireAuthorization, checkIsAdmin };
