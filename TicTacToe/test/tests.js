//Colin Evans
//CSE 270E
//Winter 2019
//Final Project

var chai = require("chai");
var expect = chai.expect;
var mongoose = require("mongoose");
var game = require("../model/game.js");

var newGame;
var newGame2;

describe("Testing game.js", function() {
    before(function(done) {
        mongoose.connect("mongodb://localhost:27017/TicTacToe");
        const db = mongoose.connection;
        
        newGame = {
            gameId: "aaaaaa",
            player1Name: "p1",
            player2Name: "",
            moveCnt: 0,
            lastMoveTime: 0,
            board: [0,0,0,0,0,0,0,0,0],
            state: "waiting"
        };
        
        newGame2 = {
            gameId: "cccccc",
            player1Name: "p1",
            player2Name: "p2",
            moveCnt: 6,
            lastMoveTime: 0,
            board: [1,2,1,
                    0,2,0,
                    2,0,1],
            state: "player1Turn"
        };
        
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function() {
            console.log("We are connected to the test database!");
            done()
        });
    });
    describe("testing createId", function() {
        it("Should be 6 chars long", async () => {
            var id = await game.createId();
            expect(id).to.have.lengthOf(6);
        });
        it("Should have all lowercase letters", async () => {
            var id = await game.createId();
            for(i = 0; i < id.length; i++){
                expect(id.substring(i, i+1)).to.match(/[a-z]/i);
            }
        });
        it("Should be a random id", async () => {
            var id1 = await game.createId();
            var id2 = await game.createId();
            expect(id1).to.not.equal(id2);
        });
    });
    
    describe("testing get game", function() {
        it("should return an object", async () => {
            
        });
        it("inside object should be fields filled in", async() => {
            
        });
    });
    
    describe("testing newGame", function() {
        
        it("should not work if there is no player passed in", async () => {
            var g = game.newGame("", 0).then(() => { assert.fail("Should not succeed")});
        });
        var storedGameId;
        it("should create a new gameID and player1 name should be Colin. State" 
         + "should be waiting", async () => {
            var newGame = await game.newGame("Colin", 0);
            expect(newGame.gameId).to.not.be.null;
            expect(newGame.player1Name).to.equal("Colin");
            expect(newGame.state).to.equal("waiting");
            storedGameId = newGame.gameId;
        });
        it("Should add new player to the game and game state should be in player1Turn", async () => {
            var gameAdd = await game.newGame("Death", storedGameId);
            expect(gameAdd.player1Name).to.equal("Colin");
            expect(gameAdd.player2Name).to.equal("Death");
            expect(gameAdd.state).to.equal("player1Turn");
        });
    });
    
    
    describe("testing move", function() {
        it("should not be able to make a move when there isn't another player", async () => {
            
            await game.testAdd(newGame);
            var g = game.move("aaaaaa", "p1", 3).then(() => { assert.fail("Should not succeed")});
        });
        it("should add the move, state should be player2Turn, moveCnt == 1, board should have a 1 in 0th index" +
        "move time should not be 0", async() =>{
            var result = await game.newGame("p2", "aaaaaa");//
            
            var newMove = await game.move("aaaaaa", "p1", 0);
            expect(newMove.state).to.equal("player2Turn");
            expect(newMove.moveCnt).to.equal(1);
            expect(newMove.board[0]).to.equal(1);
            expect(newMove.lastMoveTime).to.not.equal(0);
        });
        it("should throw error if you try to make a move when it isn't your turn", 
         async () => {
            var g = game.move("aaaaaa", "p1", 2).then(() => { assert.fail("Should not succeed")});
        });
        it("should throw an error when gameId passed in is invalid", async () => {
            var g = game.move("bbbbbb", "p2", 4).then(() => { assert.fail("Should not succeed")});
        });
        it("should throw and error for a move that is invalid", async () => {
            var g = game.move("aaaaaa", "p2", 0).then(() => {assert.fail("should not succeed")});
        });
        it("Should return a win state when there is one", async () =>{
            await game.testAdd(newGame2);
            var newMove = await game.move("cccccc", "p1", 5);
            expect(newMove.state).to.equal("player1Win");
        });
        it("should not be able to move when game is over", async () => {
            var g = game.move("cccccc", "p2", 3).then(() => { assert.fail("Should not succeed")});
        });
    });
    
    describe("testing getGames", function(){
        it("Should return a list of the games with the game having the following values" + 
        "player1Name == Colin, player2Name == Death, state == player1Turn", async () => {
            var res = await game.getGames();
            expect(res[0].player1Name).to.equal("Colin");
            expect(res[0].player2Name).to.equal("Death");
            expect(res[0].state).to.equal("player1Turn");
        });
        
        it("Should not be returning a gameId", async () => {
            var res = await game.getGames();
            
            expect(res[0].gameId).to.equal("");
        });
    });
    after(function(done) {
        //closes connection and drops the data
        mongoose.connection.db.dropDatabase(function(){
            mongoose.connection.close(done);
        });
    });
});
