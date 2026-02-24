const express = require("express");
const router = express.Router();


const registerRouter = require("./register");
const downloadRouter = require("./download");
const loginRouter = require("./login");

router.use("/", registerRouter);
router.use("/", downloadRouter);
router.use("/", loginRouter);



module.exports = router;
