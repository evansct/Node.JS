//Colin Evans
//1/17/19
//CSE 270E
//Module 10: NodeJS routing
$(function() {
  var $h1 = $("h1");
  var $zip = $("input[name='zip']");
  $("#indexForm").on("submit", function(event) {
    event.preventDefault();
    var zipCode = $.trim($zip.val());
    $h1.text("Loading...");
    var request = $.ajax({
      url: "/" + zipCode,
      dataType: "json"
    });
    request.done(function(data) {
      var temperature = data.temperature;
      $h1.text("It is " + temperature + "º in " + zipCode + ".");
    });
    request.fail(function() {
      $h1.text("Error!");
    });
  });
  $("#summaryForm").on("submit", function(event) {
    event.preventDefault();
    var zipCode = $.trim($zip.val());
    $h1.text("Loading...");
    var request = $.ajax({
      url: "/" + zipCode,
      dataType: "json"
    });
    request.done(function(data) {
      var dailySummary = data.summary;
      $h1.text("Today's summary for " + zipCode + ": " + dailySummary);
    });
    request.fail(function() {
      $h1.text("Error!");
    });
  });
});
