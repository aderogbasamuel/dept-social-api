const User = require("../models/User");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne(email);

    if (existingUser) {
      return res.status(409).json({
        message: "User Already Exixts",
      });
    }

    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      hashedPassword,
    });
    res.status(201).json({
      message: "User Created Succesfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Server Error",
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = awaitUser.findOne(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password, password wrong",
      });
    }
    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }
    res.status(200).json({
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error, could not login",
    });
  }
};

const me = async (req, res) => {
    try{
        const user= await User.findById(req.user).select("-password");
        if(!user){
            return res.status(401).json({
                message: "User not Found"
            });
        }
        res.status(200).json(user);
    }
    catch(error){
        res.status(500).json({
            message: `Server error, could not get user, ${error}`,
        })
    }
};

module.exports = {
  register,
  login,
  me,
};
