const express = require("express");
const router = express.Router();

// Importing Controller

const { signup, accountActivation, signin } = require("../controllers/auth");

// Import validators

const {
  userSignupValidator,
  userSigninValidator,
} = require("../validator/auth");
const { runValidation } = require("../validator/index");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSigninValidator, runValidation, signin);

module.exports = router;
