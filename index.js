//Requiring Express and Morgan
const morgan = require("morgan");
const uuid = require("uuid");
const bodyParser = require('body-parser');
const express = require("express");
// Requiring Mongoose and Models
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;




const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"));

mongoose.connect('mongodb://localhost:27017/driveInDB', { useNewUrlParser: true, useUnifiedTopology: true });


  // GET requests

    app.get("/", (req, res) => {
      res.send("Glad to see you in the best Drive-In!");
    });

    app.get('/documentation', (req, res) => {
      res.sendfile('/public/documentation.html', {root: __dirname})
    }),

    app.get("/movies", (req, res) => {
    Movies.find()
   .then((movies)=>{
       res.status(201).json(movies);
   })
   .catch((err)=>{
       console.error(err);
       res.status(500).send('Error' + err);
   });
 });


 //GET data about a single movie
 app.get("/movies/:title", (req, res) => {
   Movies.findOne({Title: req.params.title})
   .then((movie)=>{
     res.json(movie);
   })
   .catch((err)=>{
     console.error(err);
     res.status(500).send('Error' + err);
   });
 });

 // GET data about a Genre
 app.get('/driveInDB/genre/:genre', (req, res) => {
   driveInDB.findOne({'Genre.Name': req.params.genre})
   .then((movie)=>{
     res.json(movie.Genre)
   })
   .catch((err)=>{
     console.error(err);
     res.status(500).send('Error' + err);
   });
 });

// Find by Director name
app.get('/driveInDB/director/:directorName', (req, res) => {
  driveInDB.findOne({ 'Director.Name': req.params.directorName })
   .then((movie) => {
     res.json(movie.Director);
   })
   .catch((err) => {
     console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Get all users
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error' + error);
  });
});

app.get('/users/:name', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Allow user to update info by username
 app.put('/users/:name', (req,res) => {
   Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
     {
       Username: req.body.Username,
       Password: req.body.Password,
       Email: req.body.Email,
       Birthday: req.body.Birthday
     }
   },
   { new: true }, //this line ensures the updated document is returned to the user
   (err, updatedUser) => {
     if(err) {
       console.error(err);
       res.status(500).send('Error' + err);
     } else {
       res.json(updatedUser);
     }
   });
 });


    //App post

    //Add a user
    /*
  {
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
  }
  */

  app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });


    app.post("/users/:username/movies/:movieID", (req, res) => {
      res.send("Movie was added to the favorite list");
    });

    //App Delete

    app.delete("/users/:username/movies/:movieID", (req, res) => {
      res.send("Movie was deleted");
    });

    // Delete a user by username
  app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
    //Using Express Static to serve my documentation.html

    app.use(express.static("public"));

    //Using Error handling middleware

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something went wrong!");
    });

    //Server is running in this port

    app.listen(2000, () =>{
      console.log("This app is listening on port 2000.");
    });
