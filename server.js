const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const app = express();

//bodyParser permet de prendre la req et la mettre au bon format
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

//routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
//server (en dernier)
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
