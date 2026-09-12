require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/auth");
const commentRoutes = require("./routes/auth");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("api/posts", postRoutes);
app.use("api/comments", commentRoutes);
app.get("/", (req, res) => {
  res.send("api ruuning");
});

app.listen(5000, () => {
  console.log("server running");
});
