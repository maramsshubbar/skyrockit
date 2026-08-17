const User = require("../models/user");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  res.render("auth/sign-up.ejs");
};

const signin = async (req, res) => {
  res.render("auth/sign-in.ejs");
};

const SALT_ROUNDS = 10;

const register = async (req, res) => {
  try {
    const userInDatabase = await User.findOne({
      username: req.body.username,
    });

    if (userInDatabase) {
      return res.send("Invalid Input");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Invalid");
    }

    const hashPassword = bcrypt.hashSync(
      req.body.password,
      SALT_ROUNDS
    );

    req.body.password = hashPassword;

    const user = await User.create(req.body);

    req.session.user = {
      username: user.username,
      _id: user._id,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
};

const login = async (req, res) => {
  try {
    const userInDatabase = await User.findOne({
      username: req.body.username,
    });

    if (!userInDatabase) {
      return res.send("Invalid Input");
    }

    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );

    if (!validPassword) {
      return res.send("Invalid Input");
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
};

const signout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

module.exports = {
  signup,
  signin,
  register,
  login,
  signout,
};