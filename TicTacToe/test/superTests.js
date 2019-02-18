/*
 *Colin Evans
 CSE 270E
 Winter 2019
 Final Project
 * */
var app = require("../app.js");
var game = require("../model/game.js");
var supertest = require("supertest");
var mongoose = require("mongoose");

var newGame;
describe("testing app.js", function() {
    before(function(done) {
        mongoose.connect("mongodb://localhost:27017/TicTacToe");
        const db = mongoose.connection;
        
        newGame = {
            gameId: "aaaaaa",
            player1Name: "p1",
            player2Name: "p2",
            moveCnt: 0,
            lastMoveTime: 0,
            board: [0,0,0,0,0,0,0,0,0],
            state: "player1Turn"
        };
        
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function() {
            console.log("We are connected to the test database!");
            done()
        });
    });

    
    describe("testing GetGames", function() {
        var request;
        beforeEach(function() {
            request = supertest(app)
            .get("/api/v1/games")
            .set("Accept", "application/json");
        });
        it("Returns json response", function(done) {
            request
                .expect("Content-Type", /json/)
                .end(done);
        });
        it("Returns an array of the games", async function() {
            await game.testAdd(newGame);
            
            request
            .expect(function(res) {
                res.body.games[0].player1Name, "p1";
                res.body.games[0].player2Name, "p2";
                res.body.games[0].state, "player1Turn";
            });
        });
    });
    
    
    describe("testing Move", function() {
        var request;
        beforeEach(function() {
            request = supertest(app)
            .get("/api/v1/move/aaaaaa/p1/8")
            .set("Accept", "application/json");
        });
        it("Returns move in right spot", function(done) {
            request
            .expect(function(res) {
                res.body.gameId, "aaaaaa";
                res.body.player1Name, "p1";
                res.body.player2Name, "p2";
                res.body.moveCnt, 1;
                res.body.board, [0,0,0,0,0,0,0,0,1];
                res.body.state, "player2Turn";
            })
            .end(done);
        });
        it("Returns json response", async function(done) {
            request
                .expect("Content-Type", /json/)
                .end(done);
        });
    });
    
    describe("testing getGame", function() {
        var request;
        beforeEach(function() {
            request = supertest(app)
            .get("/api/v1/game/aaaaaa")
            .set("Accept", "application/json");
        });
        
        it("Returns a json response", async function(done) {
            request
            .expect("Content-Type", /json/)
            .end(done);
        });
        it("Returns returns a game", function(done) {
            request
            .expect(function(res){
                res.body.gameId, "aaaaaa";
                res.body.player1Name, "p1";
                res.body.player2Name, "p2";
                res.body.state, "player1Turn";
                res.body.moveCnt, 0;
            })
            .end(done);
        });
    });
    
    describe("testing Play", function() {
        
        var request;
        beforeEach(function() {
            request = supertest(app)
            .get("/api/v1/play/0/Colin")
            .set("Accept", "application/json");
        });
        it("Returns new game state", function(done) {
            request
            .expect(function(res){
                console.log(res.body);
                res.body.game.player1Name, "Colin";
                res.body.game.state, "waiting";
                res.body.game.moveCnt, 0;
            })
            .end(done);
        });
        it("Returns json response", function(done) {
            request
                .expect("Content-Type", /json/)
                .end(done);
        });
    });
    
    
    after(function(done) {
	//closes connection and drops the data
        mongoose.connection.db.dropDatabase(function(){
            mongoose.connection.close(done);
        });
    });
});
