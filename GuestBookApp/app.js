//Colin Evans
//CSE 270E
//Module 8, Chapter 3 Foundations

//All the required modules
var http = require("http");
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");

//Makes the express app
var app = express();

//creates global array to store all entries
var entries = [];
//makes the entries array available in all views
app.locals.entries = entries;

//Uses Morgan to log every request
app.use(logger("dev"));

//Tells express that the views are in the views folder
app.set("views", path.resolve(__dirname, "views"));
//says the views will use the EJS engine
app.set("view engine", "ejs");

//Populates a variable called req.body if the user is submitting a form.. Extended is required (hence the false)
app.use(bodyParser.urlencoded({ extended: false}));

//when visiting the site root, renders the homepage
app.get("/", function(request, response) {
    response.render("index");
});

//renders the new entry page
app.get("/new-entry", function(request, response) {
    response.render("new-entry");
});

//Adds the new entries to the entries list
//If not all the fields are filled in when you go to submit the form
app.post("/new-entry", function(request, response) {
    if(!request.body.title || !request.body.body || !request.body.name) {
        response.status(400).send("Entries must have a title, body, and name.");
        return;
    }
    //adds a new entry to the list of entries
    entries.push({
        title: request.body.title,
        body: request.body.body,
        published: new Date(),
        name: request.body.name
    });
    response.redirect("/");
});

//renders the about page
app.get("/about", function(request, response) {
    response.render("about");
});

//clears the entries
app.get("/clear", function(request, response) {
    entries = [];
    app.locals.entries = entries;
    response.redirect("/");
})

//renders a 404 page because you're requesting a page that doesn't exist
app.use(function(request, response) {
    response.status(404).render("404");
});

//starts the server on 3008
http.createServer(app).listen(3008, function() {
    console.log("Guestbook app started on port 3008");
});