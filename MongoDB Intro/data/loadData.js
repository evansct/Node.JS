//Colin Evans
//Winter 2019
//Assignment-13: Mongo
//CSE 270E
//
//
//Can't figure out how to close connection after stuff is added to the db



//Required modules for this program
var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('csv');

mongoose.connect("mongodb://localhost:27017/StudentPerformanceData");


//async function main() {
//	
//	console.log("in the main");
//	console.log("calling the stuff");
//	await doTheStuff();
//
//	console.log("the stuff is done");
//
//	mongoose.disconnect();
//	console.log("db is disconnected");
//}


//function doTheStuff(){


//creating the schema
var studentDataSchema = new mongoose.Schema({
        gender: String,
        race: String,
        parentEducation: String,
        lunch: String,
        testPrep: String,
        math: String,
        reading: String,
        writing: String
});

//creating the model
var dbModel = mongoose.model('StudentData', studentDataSchema);


//parses throught the data to create the database entries
var parser = csv.parse({delimiter: ','}, function(err, data){
    	if(err) return err;
	//so that we can skip over the first line since it is just information about
	//the entry
        var isFirst = true;
	data.forEach(function(entry) {
        	if(isFirst) {
                         isFirst = false;
                       	 console.log("skip the first");
	        } else {
        		console.log("adding");
                	var dbInstance = new dbModel({
				gender: entry[0],
                                race: entry[1],
                                parentEducation: entry[2],
                                lunch: entry[3],
                                testPrep: entry[4],
                                math: entry[5],
                                reading: entry[6],
                                writing: entry[7]
			});
			console.log("saving");
			dbInstance.save(function (err) {
				if(err) return err;
				console.log("saved");
			});
			
			
			/*dbModel.create({
                        	gender: entry[0],
                                race: entry[1],
	                        parentEducation: entry[2],
        	                lunch: entry[3],
                	        testPrep: entry[4],
                        	math: entry[5],
                                reading: entry[6],
	                        writing: entry[7]
        	      	}, function(err, dbInstance) {
                		if(err) return err;
                        	console.log("saved");
	                });*/
      		}	
	});        
});

//uses the parser on the file
fs.createReadStream(__dirname + '/StudentsPerformance.csv').pipe(parser);

//}


//main();







