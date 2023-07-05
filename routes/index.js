const express = require("express");
const router = express.Router();


const ai = require("../controllers/ai/index.js");


router.use("/ai", ai);

module.exports = router;
