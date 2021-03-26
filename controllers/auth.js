const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendEmailWithNodemailer } = require("../helpers/email");

// exports.signup = (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     //Find if user exist
//     User.findOne({ email }).exec((err, user) => {
//       if (user) {
//         return res.status(400).json({ error: "Email already taken" });
//       }
//       // Creating  a new User
//       let newUser = new User({ name, email, password });
//       newUser.save((err, success) => {
//         if (err) {
//           console.log(err);
//           return res.status(400).json({ error: err });
//         }
//         return res.json({ message: "Sign up success", user: newUser });
//         // Send the New User back
//         //user: newUser
//       });
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

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
    sendEmailWithNodemailer(req, res, emailData).then(() => {
      console.log("Email sent");
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
