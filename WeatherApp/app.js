//Colin Evans
//1/17/19
//CSE 270E
//Module 10: NodeJS Routing

//All the required modules for the assignment
var path = require("path");
var express = require("express");
var zipdb = require("zippity-do-dah");
var ForecastIo = require("forecastio");

//Creates the express app
var app = express();
var weather = new ForecastIo("a204cfa71cb60bd7c52f2f279731b2ac");

//says where to look for css and js
app.use(express.static(path.resolve(__dirname, "public")));

//says where to look for the different views
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

//renders the index page
app.get("/", function(req, res) {
  res.render("index");
});

//renders the summary page
app.get("/summary", function(req, res) {
    res.render("summary");
});

//gets the information from forecastIo and turns it into json for the required fields 
app.get(/^\/(\d{5})$/, function(req, res, next) {
  var zipcode = req.params[0];
  var location = zipdb.zipcode(zipcode);
  if (!location.zipcode) {
    next();
    return;
  }

  var latitude = location.latitude;
  var longitude = location.longitude;

  weather.forecast(latitude, longitude, function(err, data) {
    if (err) {
      next();
      return;
    }

    res.json({
      zipcode: zipcode,
      temperature: data.currently.temperature,
      summary: data.daily.summary
    });
  });
});

//renders the 404 page if something is searched for that isn't known
app.use(function(req, res) {
  res.status(404).render("404");
});
app.listen(3010);
