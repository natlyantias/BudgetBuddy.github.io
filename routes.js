/*
----------routes.js
----------handle web page navigation
----------CREDIT: https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express
----------CREDIT: https://www.hacksparrow.com/webdev/express/handling-processing-forms.html
----------CREDIT: https://codeforgeek.com/manage-session-using-node-js-express-4/
----------CREDIT: https://codeshack.io/basic-login-system-nodejs-express-mysql/
----------CREDIT: https://www.youtube.com/watch?v=-RCnNyD0L-s
*/


//import other scripts in the same directory
const db = require("./db");
const sessionMiddleware = require("./session");

//packages
const path = require("path");
const express = require("express");
const bcrypt = require("bcrypt");

//middleware
const router = express.Router();

// document root for web pages
const page_dir = path.join(__dirname, "views");


// ---------- handle POSTs

router.post("/login_request", async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body);

  db.query(
    "SELECT password_hash FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (results.length > 0) {
        const user = results[0];

        console.log(user);

        const hashed_password = user.password_hash;

        bcrypt.compare(password, hashed_password, (err, result) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            res.status(500).send("Internal server error");
            return;
          }

          if (result) {
            console.log("Passwords match!");

            console.log(req.session);

            req.session.userId = username;

            console.log(req.session.userId);

            res.redirect("/settingsindex");
          } else {
            console.log("Passwords do not match!");
            res.status(500).send("error: non-matching password");
          }
        });

      } else {
        res.status(500).send("Internal server error");
      }

    }

  );

});

router.post("/register_account", async (req, res) => {
  const { username, password, email } = req.body;

  const hashed_password = await bcrypt.hash(password, 10);

  console.log(hashed_password);

  // Check if the username is already taken
  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("MySQL query error:", checkErr);
      res.status(500).send("Internal Server Error");
    } else if (checkResults.length > 0) {
      // Username is already taken
      res.status(400).send("Username is already taken");
    } else {
      // Create a new user
      const insertQuery =
        "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";
      db.query(
        insertQuery,
        [username, hashed_password, email],
        (insertErr, insertResults) => {
          if (insertErr) {
            console.error("MySQL query error:", insertErr);
            res.status(500).send("Internal Server Error");
          } else {
            // User registration successful, redirect to login page (replace '/login' with your desired route)
            res.redirect("/loginindex");
          }

        }

      );

    }

  });

});


// ---------- handle GETs

router.get("/", function (req, res) {
  res.render("index.ejs", { root: page_dir });
});

router.get("/index", function (req, res) {
  res.render("index.ejs", { root: page_dir });
});

router.get("/aboutusindex", (req, res) => {
  res.render("aboutusindex.ejs", { root: page_dir });
});

router.get("/budgetsindex", (req, res) => {
  res.render("budgetsindex.ejs", { root: page_dir });
});

router.get("/createaccountindex", (req, res) => {
  res.render("createaccountindex.ejs", { root: page_dir });
});

router.get("/loginindex", (req, res) => {
  res.render("loginindex.ejs", { root: page_dir });
});

router.get("/reportindex", (req, res) => {
  res.render("reportindex.ejs", { root: page_dir });
});

router.get("/settingsindex", (req, res) => {
  // pull data from session to display in response render
  session_id = req.session.userId;

  // placeholder for plaid connectivity check
  const plaidConn = false;
  
  res.render("settingsindex.ejs", { plaidConn, session_id, root: page_dir });
});

router.get("/transactionindex", (req, res) => {
  res.render("transactionindex.ejs", { root: page_dir });
});

// export all routes after they have been defined for use in app.js
module.exports = router;
