const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendEmailWithNodemailer } = require("../helpers/email");
const expressJwt = require("express-jwt");
const user = require("../models/user");
const _ = require("lodash");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      console.log("Email already taken");
      return res.status(400).json({
        error: "Email is already taken",
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "5m" }
    );

    const emailData = {
      from: process.EMAIL_FROM, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: process.env.EMAIL_TO, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE YOUR GMAIL
      subject: `Account Activation Link`,
      // text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
      html: `
        <h1> Please use the following link to activate account for ${name}</h1>
        <p> ${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr/>
        <p>This email may contain senstive infornmation</p>
        <p> ${process.env.CLIENT_URL}</p>
      `,
    };
    // sendEmailWithNodemailer(req, res, emailData).then(() => {
    //   console.log("Email sent");
    // });
    // console.log("Success");

    sendEmailWithNodemailer(req, res, emailData)
      .then((sent) => {
        // console.log("Email sent", sent);
        res.json({
          message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
        });
      })
      .catch((err) => {
        return res.json({
          message: err.message,
        });
      });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Signup again",
          });
        }

        const { name, email, password } = jwt.decode(token);

        const user = new User({ name, email, password });

        user.save((err, user) => {
          if (err) {
            console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
            return res.status(401).json({
              error: "Error saving user in database. Try signup again",
            });
          }
          return res.json({
            // user : user to send back the user details
            message: "Signup success. Please signin.",
          });
        });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  // check if user exist
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup",
      });
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    const { _id, name, email, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied.",
      });
    }
    req.profile = user;
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "User with that email does not exist" });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m",
      }
    );

    const emailData = {
      from: process.EMAIL_FROM, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE YOUR GMAIL
      subject: ` Password reset Link`,
      // text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
      html: `
      <h1> Please use the following link to reset password</h1>
      <p> ${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
      <hr/>
      <p>This email may contain senstive infornmation</p>
      <p> ${process.env.CLIENT_URL}</p>
    `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log("RESET PASSWORD LINK ERROR", err);

        return res.status(400).json({
          error: "DATABASE CONNECTION ERROR OR USER FORGOT PASSWORD ERROR",
        });
      } else {
        sendEmailWithNodemailer(req, res, emailData)
          .then((sent) => {
            console.log("Reset Password Email has been sent", sent);
            res.json({
              message: `Email has been sent to ${email}. Follow the instructions to reset your account Password`,
            });
          })
          .catch((err) => {
            return res.json({
              message: err.message,
            });
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: "Expired link. Try again",
          });
        }

        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong. Try later",
            });
          }

          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);

          // res.json({
          //   message: user,
          // });

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Error resetting user password",
              });
            }
            res.json({
              message: `Great! Now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};
