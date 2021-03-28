const express = require("express");
const router = express.Router();

// Import Controller
const { requireSignin, adminMiddleware } = require("../controllers/auth");
const { read, update } = require("../controllers/user");

router.get("/user/:id", requireSignin, read);
router.put("/user/update/", requireSignin, adminMiddleware, update);

module.exports = router;
