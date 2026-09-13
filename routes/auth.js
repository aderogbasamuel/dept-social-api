const express= require("express");
const protect = require("../middleware/authMiddleware");
const router=express.Router();

const {register, me, login, logout}= require("../controllers/userController");
router.post("/signup", register);
router.post("/login", login);
router.get("/me",protect, me)
router.post("/logout", logout)
module.exports= router;