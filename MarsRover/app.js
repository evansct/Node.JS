//Colin Evans
//CSE 270E
//Winter 2019
//Assignment 12: Views
var express = require("express");
var static = require("static");
var path = require("path");
var rest = require("./api.js");

var app = express();


//sets up the views directory to be used
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

//renders the index page
app.get("/", function(req, res) {
    //makes the function call to getRovers to collect the list of the rovers and send it to index.ejs
    rest.getRovers(function(data){
        res.render("index", data);
    });
    
    
});

app.get("/mars/:rover", function(req, res) {
    
    var rover = req.params.rover;
    var maxSol = 0;
    //Gets the data to be sent into the mars page to display the images
    rest.getRovers(function(data){
        for(var i = 0; i < data.rovers.length; i++){
            if(data.rovers[i].name.toLowerCase() == rover){
                maxSol = data.rovers[i].max_sol;
            }
        }
        //gets the actual images
        rest.getMarsPhotos(rover, maxSol, function(data1) {
            res.render("mars", {photos: data1.photos, roverName: rover, date: maxSol, lastDate: maxSol});
        });
    });
});

app.get("/mars/:rover/:date", function(req, res) {
    var maxSol = 0;
    var rover = req.params.rover;

    //gets all necessary data to display the images
    rest.getRovers(function(data){
        for(var i = 0; i < data.rovers.length; i++){
            if(data.rovers[i].name.toLowerCase() == rover){
                maxSol = data.rovers[i].max_sol;
            }
        }
        //gets the images to display
        rest.getMarsPhotos(req.params.rover.toLowerCase(), req.params.date, function(data){
            res.render("mars", {photos: data.photos, roverName: req.params.rover, date: req.params.date, lastDate: maxSol });
        });
    });
});

app.listen(3012, function() {
    console.log("App started on port 3012");
});