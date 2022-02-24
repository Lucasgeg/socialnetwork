const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://" +
      process.env.DB_USER_PASS +
      "@cluster0.izse5.mongodb.net/socialnetwork",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to mongoDb"))
  .catch((err) => console.log("Failed to connect to mongoDB : " + err));
