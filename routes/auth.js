const express = require("express");
const router = express.Router();

// Importing Controller

const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

// Import validators

const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validator/auth");
const { runValidation } = require("../validator/index");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSigninValidator, runValidation, signin);

//Forgot and Reset Password
router.put(
  "/forget-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);
module.exports = router;
