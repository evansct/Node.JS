/*
 * Colin Evans
 * Winter 2019
 * CSE 270E
 * Assignment-13
 */

//required modules and connection to db
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/StudentPerformanceData");

var active=0;

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


//adds a new student to the database
function addStudent(student){
	console.log(student);
	return new Promise((resolv, reject) => {
		var newData = new dbModel(student);
		newData.save(function(err, v) {
			if(err) {
				reject(err);
			} else {
				console.log("saved");
				resolv();
			}
		});
	});
}

//closes the connection with the database
function close(){
	mongoose.disconnect();
}

//empties the database out
function clear(){
	dbModel.collection.drop();
}

//gets all the stats of the students to fill in the values on the index.ejs
async function getStats(mathVal, writingVal, readingVal, cb){
	
	//Parent's education
	var masters = await dbModel.countDocuments({ parentEducation: "master\'s degree", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var bachelors = await dbModel.countDocuments({ parentEducation: "bachelor\'s degree", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var associates = await dbModel.countDocuments({ parentEducation: "associate\'s degree", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var someCollege = await dbModel.countDocuments({ parentEducation: "some college", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var highSchool = await dbModel.countDocuments({ parentEducation: "high school", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var someHS = await dbModel.countDocuments({ parentEducation: "some high school", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });

	//Lunch
	var freeLunch = await dbModel.countDocuments({ lunch: "free\/reduced", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var standardLunch = await dbModel.countDocuments({ lunch: "standard", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });

	//Test Prep
	var noTestPrep = await dbModel.countDocuments({ testPrep: "none", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });
	var completedTestPrep = await dbModel.countDocuments({ testPrep: "completed", math: {$gt: mathVal}, writing: {$gt: writingVal}, reading: {$gt: readingVal} });

    //the promise to return
	return new Promise((resolv, reject) => {
		var data = { parentEducation: { masters: masters, bachelors: bachelors, associates: associates, someCollege: someCollege, highSchool: highSchool, someHighSchool: someHS }, lunch: { standard:standardLunch, free: freeLunch }, testPrep: { none: noTestPrep, completed: completedTestPrep } };
		resolv(data);
	});
}


//exporting modules
exports.addStudent = addStudent;
exports.close = close;
exports.clear = clear;
exports.getStats = getStats;
