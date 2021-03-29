const express = require("express");
const { auth } = require("google-auth-library");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// connect to db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Database is connected"))
  .catch((err) => console.log("Error"));

// Import Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

// app middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: `http://localhost:3000` }));
}

//Middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`API is running on  the port ${port}`);
});
