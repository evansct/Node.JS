/*
 * Scott Campbell
 * model for assignment 12
 * cse270e
 * */

const axios = require('axios');

const host = "http://campbest.cec.miamioh.edu:3000/api/v1";

function getRovers(cb) {
    var url = host + '/rovers';

    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(err);
   	 });
}
function getMarsPhotos(rover,soldate,cb) {
    var url = host + '/photos/' + rover + "/" + soldate;

    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(error);
   	 });
}

function getUsers(cb) {
    var url = host = '/users';

    axios.get(url)
   	 .then(response => {
   		 cb(response.data);
   	 })
   	 .catch(error => {
   		 console.log(error);
   		 cb(error);
   	 });

}

module.exports.getUsers = getUsers;
module.exports.getMarsPhotos = getMarsPhotos;
module.exports.getRovers = getRovers;
