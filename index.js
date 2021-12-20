//Requiring Express and Morgan
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('common'));

//My top 10 movie list

let movies = {
  title: "Harry Potter and the Philosopher\’s Stone",
  year: "2001"
},

{
  title: "Fight Club",
  year: "1999"
},

{
  title: "Parasite",
  year: "2019"
},

{
  title: "Joker",
  year: "2019"
},

{
  title: "The Lord of the Rings: The Fellowship of the Ring",
  year: "2001"
},

{
  title: "Interstellar",
  year: "2014"
},

{
  title: "The Shawshank Redemption",
  year: "1994"
},

{
  title: "Pulp Fiction",
  year: "1994"
},

{
  title: "Schindler\'s List",
  year: "1993"
},

{
  title: "Matrix",
  year: "1999"
}

// GET requests
app.get("/movies", (req, res) => {
    res.json(movies);
});

app.get('/', (req, res) => {
    res.send('Glad to see you in the best Drive-In!');
});

//Using Express Static to serve my documentation.html

app.use(express.static("public"));

//Using Error handling middleware

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!"");
});

//Server is running in this port

app.listen(8080, () =>{
  console.log("This app is listening on port 8080.");
});
