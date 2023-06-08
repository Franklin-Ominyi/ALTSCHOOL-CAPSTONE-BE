const { Router } = require("express");
let auth = Router();
const { getAuthUser } = require("../controller/auth");

const {
	login,
	signup,
	logout,
	request_new_password,
	forgotten_password,
	verify_account,
} = require("../controller/auth");

auth.post("/forgotten-password", forgotten_password);
auth.put("/request-new-password/:id/:token", request_new_password);
auth.get("/account-verification/:id/:token", verify_account);
auth.post("/login", login);
auth.post("/register", signup);
auth.get("/logout", logout);
auth.get("/auth", getAuthUser);

module.exports = auth;
