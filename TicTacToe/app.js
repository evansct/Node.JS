//Colin Evans
//CSE 270E
//Winter 2019
//Final Project

var express = require("express");
var gamejs = require("./model/game.js");
var bodyParser = require("body-parser");
var xss = require("xss");
var path = require("path");


var app = express();

//says where to look for html and js
app.use(express.static(path.resolve(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

//renders the index.html page
app.get("/", function(req, res) {
  res.render("index");
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
GetGames - returns all the games (gameId field is empty string)
    url: /api/v1/games
    method: get
    json_in: N/A
    json_out:
        {games:[game1,game2…]|
*/
app.get("/api/v1/games", function(req, res){
    res.setHeader("Content-Type", "application/json");
    gamejs.getGames()
    .then((games) => {
        res.json({ games: games });
    });
});
/*
play - this method is invoked to start a game
    url: /api/v1/play/:gameId/:playerName
    method: get
    json_in: {playerName: String, gameID: String}
    json_out: {status: OK or FAIL, msg=String, game: gameSchema for existing game
*/
app.get("/api/v1/play/:gameId/:playerName", function(req, res){
    res.setHeader("Content-Type", "application/json");
    var gameId = xss(req.params.gameId);
    var playerName = xss(req.params.playerName);
    console.log(gameId);
    console.log(playerName);
    
    gamejs.newGame(playerName, gameId)
    .then((game) => {
        console.log(game);
        res.json({ status: "OK", game: game });
    })
    .catch((err) => {
        console.log(err);
        res.json({ status: "FAIL" });
    });
});


/*
move - this method is invoked to make a move
    url: /api/v1/move/:gameID/:playerName/:movePosition
    method: get
    json_in: none
    json_out: {status: OK or FAIL, msg=String, game: gameSchema for existing game
*/
app.get("/api/v1/move/:gameID/:playerName/:movePosition", function(req, res){
    var gameId = xss(req.params.gameID);
    var playerName = xss(req.params.playerName);
    var move = xss(req.params.movePosition);
    res.setHeader("Content-Type", "application/json");

    gamejs.move(gameId, playerName, move)
    .then((gameSchema) => {
        res.json({ status: "OK", game: gameSchema });
    })
    .catch((err) => {
        console.log(err);
        res.json({ status: "FAIL" });
    });
});

app.get("/api/v1/game/:gameId", function(req, res){
    res.setHeader("Content-Type", "application/json");
    var gameId = xss(req.params.gameId);
    gamejs.getGame(gameId)
    .then((game) => {
        res.json({ game: game });
    });
});

app.get("/statistics", function(req, res){
	console.log("in stats call");
	gamejs.getStats()
	.then((stats) => {
		res.render("statistics", { stats: stats });
	});
});

app.get("/manage", function(req, res) {
	res.render("manage");
});

app.get("/orphans", function(req, res) {	
	gamejs.getGames()
	.then((games) => {
		games.forEach(function (game){
			game.gameId = "";
		});
		
		res.render("orphans", { games: games });
	});
});

app.get("/clear", function(req, res) {
        res.render("clear");
});

app.get("/allGames", function(req, res){
	 gamejs.getGames()
        .then((games) => {
                games.forEach(function (game){
                        game.gameId = "";
                });
                res.render("allGames", { games: games });
        });

});

app.get("/inProgress", function(req, res) {
        
	gamejs.getGames()
	.then((games) => {
		games.forEach(function (game){
			game.gameId = "";
		});
		res.render("inProgress", { games: games });
	});
});

const PASSWORD = "CLEAR";

app.post("/api/v1/clear", function(req, res) {
	var pass = xss(req.body.password);
	var date = xss(req.body.date);
	
	if(!date || !pass){
		res.status(400).send("Must have a password and choose a date");
		return;
	}
	if(pass !== PASSWORD){
		res.status(401).send("Incorrect password");
		return;
	}
	
	gamejs.clearDate(date).then(function() {
		res.render("index");
	});

});


module.exports = app.listen(3016, function() {
    console.log("App started on port 3016");
});































