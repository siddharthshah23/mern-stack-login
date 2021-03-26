const express = require("express");
const router = express.Router();

// Importing Controller

const { signup, accountActivation } = require("../controllers/auth");

// Import validators

const { userSignupValidator } = require("../validator/auth");
const { runValidation } = require("../validator/index");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);

module.exports = router;
