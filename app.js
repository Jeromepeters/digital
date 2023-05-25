//--------COMMON ASSIGNMENT----------//
const PORT = process.env.PORT || 3000;

//--------REQUIRING MODULES----------//
// var md5 = require("md5"); //md5 is a hashing algorithm with available hash for common word so we use Bcrypt
// const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
let ejs = require("ejs");
const app = express();
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");

//-----------setting view engine to ejs-------------//
app.set("view engine", "ejs");
//------------------ALLOWING EXPRESS WORK WITH MIDDLEWARE-----------//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.use(
  session({
    secret: "jerome",
  })
);
//----------CONNECTING WITH THE MONGODB SERVER--------------//
mongoose.connect("mongodb://127.0.0.1:27017/UserProfileDB", {
  useNewUrlParser: true,
});
//----------PROFILE SCHEMA--------------//
const personSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//--------HANDLING GET REQUEST FROM DIFFERENT ROUTE----------//
const Person = mongoose.model("Person", personSchema);
//--------HANDLING GET REQUEST FROM DIFFERENT ROUTE----------//
app.get("/", (req, res) => {
  res.render("index");
});

//--------HANDLING GET and POST REQUEST FROM THE REGISTER ROUTE----------//
app
  .route("/Register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const userEmail = req.body.username;
    const UserPassword = req.body.password;
    bcrypt.hash(UserPassword, saltRounds, function (err, hashPassword) {
      // Store hash in your password DB.
      const newUser = new Person({
        email: userEmail,
        password: hashPassword,
      });
      newUser.save();
      res.render("secrets");
    });
  });

//--------HANDLING GET and POST REQUEST FROM THE LOGIN ROUTE----------//
app
  .route("/Login")
  .get((req, res) => {
    res.render("login", { errorMessage: "" });
  })
  .post((req, res) => {
    const userEmail = req.body.username;
    // console.log(req.body.username);
    const UserPassword = req.body.password;

    Person.findOne({ email: userEmail })
      .then((foundUser) => {
        // console.log(foundUser.password);

        bcrypt.compare(
          UserPassword,
          foundUser.password,
          function (err, result) {
            if (result === false) {
              // console.log(hash);
              res.render("login", { errorMessage: "incorrect password" });
            } else {
              res.render("secrets");
            }
          }
        );

        // if (foundUser.password === UserPassword) {
        //   res.render("secrets");
        // } else {
        //   console.log("Incorrect Password");
        //   res.redirect("/Login");
        // }
      })
      .catch((error) => {
        res.render("login", { errorMessage: "User Not found" });
      });
    // Person.insertMany([newUser]);
  });

//--------HANDLING POST REQUEST FROM HOME ROUTE----------//
app.post("/", (req, res) => {
  const searchedBook = req.body.search;
  Book.find({ name: searchedBook }, (err, book) => {
    if (err) {
      console.log(err);
    } else {
      res.send(book);
    }
  });
});

//--------HANDLING  POST REQUEST FROM THE SECRETS ROUTE----------//
// app.post("/secrets", (req, res) => {});

//--------LISTENING AT PORT----------//
app.listen(PORT, (req, res) => {
  console.log(`Listening to PORT ${PORT} ......`);
});
