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
// Controllers
const authCtrl = require("./controllers/authCtrl");
const isSignedIn = require("./middleware/is-signed-in.js");
// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
const passUserToView = require("./middleware/pass-user-to-view.js");
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
app.use(express.static("public"));

// Auth Routes
app.get("/auth/sign-up", authCtrl.signup);
app.post("/auth/sign-up", authCtrl.register);

app.get("/auth/sign-in", authCtrl.signin);
app.post("/auth/sign-in", authCtrl.login);

app.post("/auth/sign-out", authCtrl.signout);

// Home
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});



app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});