/*
Colin Evans
CSE 270E
FinalProject
Winter 2019
*/

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/TicTacToe")

var gameSchema = new mongoose.Schema({
    gameId: String,
    player1Name: String,
    player2Name: String,
    moveCnt: Number,
    lastMoveTime: Number,
    board: [Number],
    state: String
});

var dbModel = mongoose.model("Game", gameSchema);


async function createId(){
    var id = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";
    
    for(i = 0; i < 6; i++){
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    //checking to see if it already exists within the database
    var instance = await dbModel.countDocuments({ gameId: id });
    
    //if it is, then reroll for it.
    while(instance > 0){
        console.log("ID is already within the database");
        
        id = "";
        for(i = 0; i < 6; i++){
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        
        instance = await dbModel.countDocuments({ gameId: id });
    }
    
    return id;
}

//should return the game that goes along with the given gameId
function getGame(gameId){
    return new Promise((resolv, reject) => {
        
        dbModel.findOne({ gameId: gameId }, function(err, data){
            if(err) reject(err);
            
            resolv(data);
        });
    });
}

function newGame(playerName, gameId){
    return new Promise((resolv, reject) => {
        
        if(playerName === ""){
            reject("Please enter a player name");
        }
        
        var newId = gameId;
        var player1;
        var player2;
        //if it's a new new game
        if(gameId == 0){
            createId().then(function(id){
                    player1 = playerName;
		    
		    var createTime = new Date().getTime();

                    //creates the new instance to add to the db
                    var instance = new dbModel({
                        gameId: id,
                        player1Name: player1,
                        player2Name: null,
                        moveCnt: 0,
                        lastMoveTime: createTime,
                        board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        state: "waiting"
                    });
                    instance.save(function(err, game){
                        if(err) reject(err);
                        console.log(game);
                        resolv(game);
                    });
            });
        } else {
            player2 = playerName;
            var changes = { player2Name: player2, state: "player1Turn" };
            var query = { gameId: gameId };
            dbModel.findOneAndUpdate(query, changes, { new: true }, function(err, game){
                if(err) reject(err);
                resolv(game);
            });
        }
    });
}

/*
Params:
    gameId -> id of valid game
    playerName -> string name of player
    move - 0-8 indicating which square player moves to
Return:
    returns a promise to make a move:
    if ok: returns the gameModel
    if error calls reject with an error message. 

*/
function move(gameId, playerName, move){
    return new Promise((resolv, reject) => {
        
        //game id is assumed to be valid
        getGame(gameId).then((game) => {
           var state = game.state;
           
           //The correct player is moving
           if(state === "player1Turn" && playerName === game.player2Name){
               reject("It is not your turn");
           }
           else if(state === "player2Turn" && playerName === game.player1Name){
               reject("It is not your turn");
           }
           
           //The game is not in a state where you can't make a move
           else if(state === "waiting") {
               reject("Need 2 players to make a move");
           }
           else if(state === "player1Win" || state === "player2Win" || state === "stalemate") {
               reject("Game is already over!");
           }
           
           //The move space is already occupied
           else if(game.board[move] != 0){
               reject("Someone has already moved in that spot");
           } else {
               console.log("valid input");
                //input is valid
                //gets the time of this move
                var time = new Date().getTime();

                //player 1 turn
                if(playerName === game.player1Name){
                    console.log("p1's turn");
                    game.board[move] = 1;
                    
                    //checks if it's in a win state
                    gameCheckState(game, 1)
                    
                    .then((newState) => {
                        console.log("after checkState");
                        var changes = { moveCnt: game.moveCnt + 1, lastMoveTime: time,
                        board: game.board, state: newState };
                        var query = { gameId: gameId };
                        dbModel.findOneAndUpdate(query, changes, { new: true }, 
                        function(err, doc){
                            if(err) reject(err);
                            console.log("after update");
                            resolv(doc);
                        });
                    });
                    
                } else {
                    console.log("p2's turn");
                    game.board[move] = 2;
                    
                    //checks if it's in a win state
                    gameCheckState(game, 2)
                    
                    .then((newState) => {
                        console.log("after checkState");
                        var changes = { moveCnt: game.moveCnt + 1, lastMoveTime: time,
                        board: game.board, state: newState };
                        var query = { gameId: gameId };
                        dbModel.findOneAndUpdate(query, changes, { new: true }, 
                        function(err, doc){
                            if(err) reject(err);
                            console.log("after update");
                            resolv(doc);
                        });
                    });
                }
           }
        });
    });
}

function gameCheckState(game, player){
    console.log("in checkState");
    var board = game.board;
    var whoWon = "player1Win";
    if(player === 2) whoWon = "player2Win";

    return new Promise((resolv, reject) => {
            //checks the rows
            for(var i = 0; i < 9; i += 3){
                if(board[i] === player && board[1 + i] === player && board[2 + i] === player){
                    resolv(whoWon);
                }
            }
            
            //checks the columns
            for(var i = 0; i < 3; i++){
                if(board[i] === player && board[3 + i] === player && board[6 + i] === player){
                    resolv(whoWon);
                }
            }
            
            //checks diagonals
            for(var i = 0; i < 3; i += 2){
                if(board[i] === player && board[4] === player && board[8 - i] === player){
                    resolv(whoWon);
                }
            }
        
        if(game.moveCnt >= 8){
            resolv("stalemate");
        }
        
        else if(player === 2){
            resolv("player1Turn");
        } else {
            console.log("end of checkState")
            resolv("player2Turn");
        }
    });
}


function getGames(){
    return new Promise((resolv, reject) => {
        gameList = [];
        
        
        dbModel.find({}, function(err, games) {
            if(err) reject(err);
            
            for(let i = 0; i < games.length; i++){
                games[i].gameId = "";
                gameList.push(games[i]);
            }
            resolv(gameList);
        });
    });
} 

async function clear(){
    dbModel.games.drop();
}

function testAdd(gameSchemaInstance){
    return new Promise((resolv, reject) => {
        var newEntry = new dbModel(gameSchemaInstance);
        newEntry.save(function (err, game) {
            if(err) reject(err);
            resolv(game);
        });
    });
}

var players= [];
function getIndex(name) {
	for (i=0;i<players.length;i++) {
		if (players[i].name == name)
			return i;
	}
	return -1;
}


function getStats() {
	players =  [];
	return new Promise(function(resolv,reject) {
		dbModel.find(function(error,record) {
			for (var i=0;i<record.length;i++) {
				var num1  = getIndex(record[i].player1Name);
				console.log(record[i].player1Name,num1);
				if (num1==-1) {
					var newP={name:record[i].player1Name,won:0,lost:0,stalemate:0};
					players.push(newP);
					num1 = getIndex(record[i].player1Name);
				}
				var num2  = getIndex(record[i].player2Name);
				console.log(record[i].player2Name,num2);
				if (num2==-1) {
					var newP2={name:record[i].player2Name,won:0,lost:0,stalemate:0};
					players.push(newP2);
					num2  = getIndex(record[i].player2Name);
				}


				if (record[i].state=="player1Win")
				{
					players[num1].won++;
					players[num2].lost++;
				}
				else if (record[i].state=="player2Win")
				{
					players[num1].lost++;
					players[num2].won++;
				}
				else if (record[i].state == "stalemate")
				{
					players[num1].stalemate++;
					players[num2].stalemate++;
				}
			}
			resolv(players);
		});
	});
}

function clearDate(date){
	date = date.toTime();

	try {
		db.games.deleteMany( { "lastMoveTime": { $lt : date } } );
	} catch(e) {
		console.log(e);
	}
}


exports.createId = createId;
exports.getGame = getGame;
exports.newGame = newGame;
exports.move = move;
exports.getGames = getGames;
exports.clear = clear;
exports.testAdd = testAdd;
exports.getStats = getStats;
exports.clearDate = clearDate;
