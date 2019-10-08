$(document).ready(function () {

    //Firebase link
    var config = {
        apiKey: "AIzaSyApjuJw1wZGDH4xieCGHIXv6zYMjkSC4T4",
        authDomain: "train-app-project.firebaseapp.com",
        databaseURL: "https://train-app-project.firebaseio.com",
        projectId: "train-app-project",
        storageBucket: "train-app-project.appspot.com",
        messagingSenderId: "591366646591",
        appId: "1:591366646591:web:fbbed1afdc603f8e1c418a"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    //collect input from the submit button and store it in specific variables
    $(".submitInput").on("click", function (event) {
        // console.log("this works");
        event.preventDefault();
        var nameInput = $("#nameInput").val().trim();

        var numberInput = $("#numberInput").val().trim();

        var destinationInput = $("#destInput").val().trim();

        var timeInput = $("#timeInput").val().trim();

        var frequencyInput = $("#freqInput").val().trim();

        //input validation
        if (nameInput != "" &&
            numberInput != "" &&
            destinationInput != "" &&
            timeInput.length === 4 &&
            frequencyInput != "") {

            //use the collected input (above) and port it to firebase db
            database.ref().push({
                name: nameInput,
                number: numberInput,
                destination: destinationInput,
                time: timeInput,
                frequency: frequencyInput,
            });

        } else {
            alert("Please enter valid train data");
            $("input").val("");
            return false;
        }

        //console.log(database);

        $("input").val("");
    });

    database.ref().on("child_added", function (childSnapshot) {

        var name = childSnapshot.val().name;
        var number = childSnapshot.val().number;
        var destination = childSnapshot.val().destination;
        var time = childSnapshot.val().time;
        var frequencyOrig = childSnapshot.val().frequency;

        // console.log(name, number, destination, time, frequency);

        //time formatting
        //this required a LOT of googling to figure out
        var frequency = parseInt(frequencyOrig);
        var currentTime = moment();

        //console.log("Current time: " + moment().format("HHmm"));

        //originally used mil format of HHMM but that failed with a null value
        //looked up potential faults and it turns out that moment.js must use
        //HH:mm for mil/euro time format
        var dateConvert = moment(childSnapshot.val().time, "HHmm").subtract(1, "years");

        //console.log("DATE CONVERTED: " + dateConvert);

        var trainTime = moment(dateConvert).format("HHmm");

        //console.log("Train time : " + trainTime);

        //difference bw the times
        var timeConvert = moment(trainTime, "HHmm").subtract(1, "years");
        var timeDifference = moment().diff(moment(timeConvert), "minutes");

        //console.log("Difference in time: " + timeDifference);

        //remainder
        var timeRemaining = timeDifference % frequency;

        //console.log("Time remaining: " + timeRemaining);

        //time until next train
        var timeAway = frequency - timeRemaining;

        //console.log("Minutes until next train: " + timeAway);

        //next train arrival
        var nextArrival = moment().add(timeAway, "minutes");

        //figured out that adding "A" at the end of HH:mm will add AM or PM
        //given that this is mil/euro format, the AM/PM is not necessary
        //console.log("Arrival time: " + moment(nextArrival).format("HHmm"));

        var arrivalDisplay = moment(nextArrival).format("HHmm");

        //append data to table
        $("#boardText").append(
            "<tr><td id='nameDisplay'>" + name +
            "<td id='numberDisplay'>" + number +
            "<td id='destinationDisplay'>" + destination +
            "<td id='frequencyDisplay'>" + frequency +
            "<td id='arrivalDisplay'>" + arrivalDisplay +
            "<td id='awayDisplay'>" + timeAway + " minutes until arrival" + "</td></tr>");

        // console.log(arrivalDisplay);
        // console.log(timeAway);
    });

    //reset functionality
    $(".resetInput").on("click", function (event) {
        location.reload();
    });

    //auto refresh per 1 minute passed
    //updates the train data upon refresh
    setInterval("window.location.reload()", 60000);

});