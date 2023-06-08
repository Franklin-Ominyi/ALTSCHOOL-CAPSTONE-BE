const sgMail = require("@sendgrid/mail");

exports.handleErrors = (err) => {
	let errors = { error: true, message: "Server error" };
	if (err.message === "Invalid credentials") {
		errors.message = "Incorrect email or password";
	} else if (err.message === "email address has not been verified") {
		errors.message = "email address has not been verified";
	}
	return errors;
};

exports.capitilizeName = (firstName) => {
	return firstName.slice(0, 1).toUpperCase() + firstName.slice(1).toLowerCase();
};

exports.sendMail = async (email, subject, template) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	const msg = {
		to: email,
		from: "chitechgroupng@gmail.com",
		subject,
		html: template,
	};

	try {
		const sent = await sgMail.send(msg);
		return sent;
	} catch (error) {
		throw new Error("an error occured, please try again");
	}
};
