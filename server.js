const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

//bring all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");
const passport = require("passport");

const app = express();

//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


//mongoDB configuration
const db = require("./setup/myurl").mongoURL;

//Attempt to connect to database
mongoose
  .connect(db,{useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

//Passport Middleware
app.use(passport.initialize());

//config for jwt strategy
require("./strategies/jsonwtStrategy")(passport);

//just for testing  -> route
app.get("/", (req, res) => {
  res.send("Hey there Big stack");
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is running at ${port}`));
