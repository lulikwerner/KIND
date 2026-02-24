const express = require("express");
const router = express.Router();


const registerRouter = require("./register");
const downloadRouter = require("./download");
const loginRouter = require("./login");

router.use("/register", registerRouter);
router.use("/download", downloadRouter);
router.use("/login", loginRouter);


module.exports = router;
