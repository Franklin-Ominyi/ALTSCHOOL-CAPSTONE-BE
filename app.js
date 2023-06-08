const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const router = require("./routes/Routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((result) => {
		app.listen(process.env.PORT || 5000, () => {
			console.log(
				`Server running in ${process.env.NODE_ENV} on port ${
					process.env.PORT || 5000
				}`
			);
		});
		console.log("Db connected...");
	})
	.catch((err) => {
		console.log(err);
	});

app.use("/api/v1", router);
