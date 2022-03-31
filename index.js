//Requiring Express and Morgan

const morgan = require("morgan");
const uuid = require("uuid");
const bodyParser = require("body-parser");
const express = require("express");
const { check, validationResult } = require("express-validator");

// Requiring Mongoose and Models

const mongoose = require("mongoose");
const Models = require("./models.js");

/* mongoose.connect('mongodb://localhost:27017/driveInDB', {
  useNewUrlParser: true, useUnifiedTopology: true
}); */

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS

const cors = require("cors");

/* let allowedOrigins = [
  "http://localhost:2000/",
  "http://localhost:1234",
  "http://localhost:4200",
];
*/
app.use(cors());

const passport = require("passport");
require("./passport");
app.use(morgan("common"));
let auth = require("./auth")(app);

// GET requests

app.get("/", (req, res) => {
  res.send("Glad to see you in the best Drive-In!");
});

app.get("/documentation", (req, res) => {
  res.sendfile("/public/documentation.html", { root: __dirname });
}),
  app.get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find()
        .then((movies) => {
          res.status(201).json(movies);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error" + err);
        });
    }
  );

//GET data about a single movie

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error" + err);
      });
  }
);

// GET data about a Genre

app.get(
  "/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.genre })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error" + err);
      });
  }
);

// Find by Director name

app.get(
  "/director/:directorName",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Get all users

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error" + error);
      });
  }
);

app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Allow users to update info by username

app.put(
  "/users/:username",
  [
    check(
      "username",
      "Please fill your Username field with Alphanumeric values only."
    ).isAlphanumeric(),
    check("password", "Password field is required").not().isEmpty(),
    check("email", "Email failed to validate").isEmail(),
  ],
  (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// App POST/ Adds a user / Checks for data security

app.post(
  "/users",
  [
    check("username", "Username is required").isLength({ min: 5 }),
    check(
      "username",
      "Please fill your Username field with Alphanumeric values only."
    ).isAlphanumeric(),
    check("password", "Password field is required").not().isEmpty(),
    check("email", "Email failed to validate").isEmail(),
  ],
  (req, res) => {
    // Check for any sort of error happening during validation

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Hash Password Implementation

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          if (user.username === req.body.username) {
            return res.status(400).send(req.body.Username + " already exists");
          }
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.post(
  "/users/:username/movies/:movieid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.movieid },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

//Delete a movie from the Favorites List

app.delete(
  "/users/:username/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { FavoriteMovies: req.params.title },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error" + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Delete a user by username

app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + " was not found");
        } else {
          res.status(200).send(req.params.username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Using Express Static to serve my documentation.html

app.use(express.static("public"));

//Using Error handling middleware

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//Server is running in this port
const port = process.env.PORT || 2000;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
