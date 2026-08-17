const dotenv = require("dotenv");
dotenv.config();

console.log("SESSION_SECRET exists:", !!process.env.SESSION_SECRET);

const express = require("express");
const app = express();

const session = require("express-session");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const { MongoStore } = require("connect-mongo");
const path = require("path");
// Controllers
const authCtrl = require("./controllers/authCtrl");
const applicationsController = require("./controllers/applications.js");

// Middleware
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

// Set the port
const port = process.env.PORT ? process.env.PORT : "3000";

// MongoDB
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(passUserToView);

// EJS
app.set("view engine", "ejs");

// Public app

app.use(express.static(path.join(__dirname, "public")));

// Auth Routes
app.get("/auth/sign-up", authCtrl.signup);
app.post("/auth/sign-up", authCtrl.register);

app.get("/auth/sign-in", authCtrl.signin);
app.post("/auth/sign-in", authCtrl.login);

app.post("/auth/sign-out", authCtrl.signout);

// Home
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect(`/users/${req.session.user._id}/applications`);
  }

  res.render("index.ejs");
});

// Protect application routes
app.use(isSignedIn);

// Applications
app.use("/users/:userId/applications", applicationsController);

// Start server
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});