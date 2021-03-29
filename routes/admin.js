const express = require("express");
const router = express.Router();

// Import Controller
const { requireSignin, adminMiddleware } = require("../controllers/auth");
const { read, adminUpdate } = require("../controllers/admin");

router.put("/admin/update/", requireSignin, adminMiddleware, adminUpdate);

module.exports = router;
