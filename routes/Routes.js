const { Router } = require("express");
const auth = require("./Auth");
const url = require("./Url");
let router = Router();

router.use(auth);
router.use(url);

module.exports = router;
