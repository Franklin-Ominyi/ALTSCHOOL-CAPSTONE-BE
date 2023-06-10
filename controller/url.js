const VerifyAccToken = require("../models/VerifyAccToken");
const {
	handleErrors,
	sendMail,
	capitilizeName,
} = require("../helpers/helpers");

const Url = require("../models/Url");
const shortid = require("shortid");

exports.create_url = async (req, res) => {
	const { url, customUrl } = req.body;
	const user = req.user;

	if (!url) res.status(400).json({ error: true, message: "Please enter a URL" });
	if (!user)
		res.status(400).json({ error: true, message: "User is not authenticated" });

	const shortUrl = shortid.generate();

	try {
		let response = await Url.create({
			longUrl: url,
			shortUrl: customUrl || shortUrl,
			userId: user._id,
		});
		res.json({
			error: false,
			message: "URL shortened successfully",
			data: { ...response },
		});
	} catch (error) {
		console.log({ error });
		if (error.code == 11000) {
			res.status(400).json({ error: true, message: "Short URL already exists" });
		} else {
			res
				.status(400)
				.json({ error: true, message: "an error occured, please try again" });
		}
	}
};

exports.getUrl = async (req, res) => {
	const { id } = req.params;
	console.log({ id });
	if (!id) res.status(400).json({ error: true, message: "URL is not valid" });

	try {
		let response = await Url.findOneAndUpdate(
			{ shortUrl: id },
			{ $inc: { visits: 1 } }
		);

		if (!response)
			res.status(404).json({ error: true, message: "URL not found" });

		if (response) res.json({ error: false, data: response.longUrl });
	} catch (error) {
		res
			.status(400)
			.json({ error: true, message: "an error occured please try again" });
	}
};

exports.getAllUrl = async (req, res) => {
	const user = req.user;

	try {
		let response = await Url.find({ userId: user._id }).sort({ createdAt: -1 });
		res.json({ error: false, data: response });
	} catch (error) {
		res
			.status(400)
			.json({ error: true, message: "an error occured please try again" });
	}
};

exports.deleteUrl = async (req, res) => {
	const user = req.user;
	const { id } = req.params;

	try {
		let response = await Url.findOneAndDelete({ userId: user._id, shortUrl: id });
		if (!response)
			res.status(404).json({ error: true, message: "URL not found" });
		else {
			res.json({ error: false, data: "delete was successful" });
		}
	} catch (error) {
		res
			.status(400)
			.json({ error: true, message: "an error occured, please try again" });
	}
};
