const express= require("express");
const protect = require("../middleware/authMiddleware");
const router=express.Router();

const {register, me, login}= require("../controllers/userController");
router.post("/register", register);
router.post("/login", login);
router.get("/me",protect, me)
module.exports= router;