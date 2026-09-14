require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment");
const statusRoutes= require("./routes/status")

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => console.log(err));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sees30unilag.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/statuses", statusRoutes);

app.get("/", (req, res) => {
  res.send("api ruuning");
});

app.listen(5000, () => {
  console.log("server running");
});
