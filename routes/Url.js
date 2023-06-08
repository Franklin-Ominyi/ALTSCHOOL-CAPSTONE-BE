const { Router } = require("express");
let url = Router();
const { getAuthUser } = require("../controller/auth");

const {
	create_url,
	getUrl,
	getAllUrl,
	deleteUrl,
} = require("../controller/url");
const {
	requireAuth,
	requireAuthorization,
} = require("../middleware/authMiddleware");

url.post("/url", requireAuthorization, create_url);
url.get("/url", requireAuthorization, getAllUrl);
url.get("/url/:id", getUrl);
url.delete("/url/:id", requireAuthorization, deleteUrl);

module.exports = url;
