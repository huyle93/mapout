'use-strict'
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

//const Alexa = require('alexa-sdk');
var https = require('https');
// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

let speechOutput = "";
var myCoordinates = [43.1389480, -70.9370250]
/*
let reprompt;
const welcomeOutput = "Hello. Your trip advisor is here. I know a lot of information. You can start by saying let's plan a trip.";
const welcomeReprompt = "Let me know where you'd like to go or when you'd like to go on your trip";
const tripIntro = [
    "This sounds like a cool trip. ",
    "This will be fun. ",
    "Oh, I like this trip. "
];



// 2. Skill Code =======================================================================================================


var myCoordinates = [43.1389480, -70.9370250]
const handlers = {
    'LaunchRequest': function () {
        this.response.speak(welcomeOutput).listen(welcomeReprompt);
        this.emit(':responseReady');
    },
    'PlanMyTrip': function () {
        //delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);

        //compose speechOutput that simply reads all the collected slot values
        var speechOutput = randomPhrase(tripIntro);

        //activity is optional so we'll add it to the output
        //only when we have a valid activity
        var travelMode = isSlotValid(this.event.request, "travelMode");
        if (travelMode) {
            speechOutput += travelMode;
        } else {
        */
            speechOutput += "You'll go ";
        /*
        }
        //Now let's recap the trip
        //Validate info
        var fromCity = this.event.request.intent.slots.fromCity.value;
        var toCity = this.event.request.intent.slots.toCity.value;
        var travelDate = this.event.request.intent.slots.travelDate.value;
        var address = this.event.request.intent.slots.places.value;
        var make = this.event.request.intent.slots.make.value;
        var model = this.event.request.intent.slots.model.value;
        var year = this.event.request.intent.slots.year.value;
*/

        var fromCity = "boston";
        var toCity = "durham";
        var travelDate = "today";
        var address = "fenway";
        var make = "honda";
        var model = "civic";
        var year = 2013;
        speechOutput += `from ${fromCity} to ${address} , ${toCity} on ${travelDate}.`

        // Calling API
        httpsGetgeocode(address, function geocode(geo_lat, geo_long) {
            var lat = geo_lat // int
            var long = geo_long // int
            httpsGet_Matrix(lat, long, function matrix(mat_dis_val, mat_dis_txt, mat_dur_val, mat_dur_txt) {
                var distancevalue = mat_dis_val // int
                var distancetext = mat_dis_txt
                var durationvalue = mat_dur_val // int
                var durationtext = mat_dur_txt
                httpsGetStats(make, model, year, function stats(year, mpg) {
                    var caryear= year // int
                    var hwympg = mpg // int
                    httpsGet_CarTheft('ma', function car( t_make, t_model ) {
                        var theftCarMake = t_make
                        var theftCarModel = t_model
                        var theftCar = `${t_make} ${t_model}`
                        //
                        var myCar = `${make} ${model}`
                        // gas price int
                        //var gasPrice = get_price(lat, long)
                        //var gasCost = Math.ceil((gasPrice * distancevalue) / hwympg)
                        if (myCar.toLowerCase() == theftCar.toLowerCase()) {
                            speechOutput += ` Based on the information that you've given, the total distance of will be ${distancetext}. and based on the traveling distance, the estimate time that you'll arrive to your destination is ${durationtext} `
                            //var activity = isSlotValid(this.event.request, "activity");
                            //if (activity) {
                                //speechOutput += " to go " + activity;
                            //}

                            //say the results
                            //this.response.speak(speechOutput);
                          //  this.emit(":responseReady");
                          console.log(speechOutput)
                        }
                        else {
                          speechOutput +=  `The total traveling distance is ${distancetext} , and based on the traveling distance, the estimate time that you'll arrive to your destination is ${durationtext} `;
                      }
                        //var activity = isSlotValid(this.event.request, "activity");
                        //if (activity) {
                        //    speechOutput += " to go " + activity;
                      //  }

                        //say the results
                      //  this.response.speak(speechOutput);
                      //  this.emit(":responseReady");
                      //console.log(speechOutput)
                    })
                })
            })
        });
    /*
    'AMAZON.HelpIntent': function () {
        speechOutput = "";
        reprompt = "";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = "";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        speechOutput = "";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        var speechOutput = "";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    */

/*
exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
        console.log("in Beginning");
        var updatedIntent = this.event.request.intent;
        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        // return a Dialog.Delegate directive with no updatedIntent property.
        this.emit(":delegate");
    } else {
        console.log("in completed");
        console.log("returning: " + JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent;
    }
}

function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return (array[i]);
}

function isSlotValid(request, slotName) {
    var slot = request.intent.slots[slotName];
    //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
    var slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        //we didn't get a value in the slot.
        return false;
    }
}
*/

// ======================== Custom functions ======================= //
//API KEY
var geocode_key = "AIzaSyCtl6MSQyU4kCsb5VfTLk-UK_B72oVYlwM";
var matrix_key = "AIzaSyBtVpXAuWlnuC7hicRdzFBzBifYR1evqIY";
var shine_key = "UKxbxhZYNEiP4spThYCy61bwEhRQXlPb";
var googleplace_key = "AIzaSyBtVpXAuWlnuC7hicRdzFBzBifYR1evqIY";

// Geocode
//httpsGetgeocode(address, (myResult) => {
    //Uncomment this line to test
    //console.log("sent     : " + address);
  //  console.log("received : " + myResult);
//});

function httpsGetgeocode(myData, callback) {
    // Update these options with the details of the web service you would like to call
    var google_key = "AIzaSyD-8QBhZNxZLnmX2AxBEOB2sSHzg4L2tZs"
    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: `/maps/api/geocode/json?address=${encodeURIComponent(myData)}&key=` + google_key,
        method: 'GET',
        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            var pop = JSON.parse(returnData);
            var lat = Number(pop.results[0].geometry.location.lat)
            var lng = Number(pop.results[0].geometry.location.lng)
            callback(lat, lng);
            // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();
}

// Matrix
function getMiles(i) {
    return i * 0.000621371192;
}

function httpsGet_Matrix(lat, long, callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: `/maps/api/distancematrix/json?units=imperial&origins=${myCoordinates[0]},${myCoordinates[1]}&destinations=${lat}%2C${long}&key=` + matrix_key,
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            var data = JSON.parse(returnData);
            var distancevalue = data.rows[0].elements[0].distance.value;
            var distancetext = data.rows[0].elements[0].distance.text;
            var durationvalue = data.rows[0].elements[0].duration.value;
            var durationtext = data.rows[0].elements[0].duration.text;
            callback(distancevalue, distancetext, durationvalue, durationtext);
            // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();
}

// Shine Car Stats
function httpsGetStats(make, model, year, callback){
  var stats_options = {
    host: 'apis.solarialabs.com',
    path: '/shine/v1/vehicle-stats/specs?make=' + make + '&model=' + model + '&year=' + year + '&full-data=true&apikey=' + shine_key,
    method: 'GET'
  }

  var req = https.request(stats_options, function(res) {
  res.setEncoding('utf-8');

  var returnData = '';

  res.on('data', chunk => {
      returnData = returnData + chunk;
  });

 //console.log(returnData)

  res.on('end', function() {
      var response = JSON.parse(returnData);
      var stats_make = response[0].Make
      var stats_model = response[0].Model
      var stats_car_year = response[0].Model_Year
      var stats_car_mpg = response[0].City_Conventional_Fuel

      //console.log( "Model Year of the " + stats_make + " " + stats_model + " is: " + stats_car_year + ". The combined highway and city MPG is " + stats_car_mpg + ".");
      callback(stats_car_year, stats_car_mpg);
  });
  });
  req.end();
}

// Shine Car Theft
function httpsGet_CarTheft(state, callback) {
    // Update these options with the details of the web service you would like to call
    // this will return top 3rd that got stolen
    var options = {
        host: 'apis.solarialabs.com',
        port: 443,
        path: `/shine/v1/vehicle-thefts?state=${state}&rank=1&apikey=` + shine_key,
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            var data = JSON.parse(returnData);
            //carArray.push(data[0].Make)
            var make = data[0].Make
            var model = data[0].Model
            // this will execute whatever function the caller defined, with one argument
            callback(make, model);
        });
    });
    req.end();

}
// MyGasFeed
function get_price(lat, lng) {
    let request = require('request')
    let options = {
        "url": `http://devapi.mygasfeed.com/stations/radius/${lat}/${lng}/5/reg/price/rfej9napna.json`,
        "method": "GET",
        "qs": {
            //"address": "2+old+english+village+apt+110",
            //"apikey": apiKey
        }
    }
    request(options, (err, resp, body) => {
        //go through the address components and geometry components.
        var data = JSON.parse(body);

        var result = data.stations[0].reg_price;
        return result;
    })

}

// GooglePlace
function httpsGetmyGoogleplace(lat, lng, rankby, types, rating, callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        //path: `/maps/api/geocode/json?address=${encodeURIComponent(myData)}&key=AIzaSyD-8QBhZNxZLnmX2AxBEOB2sSHzg4L2tZs`,
        path: `/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=${rankby}&types=${types}&rating=${rating}&key=` + googleplace_key,
        method: 'GET',

        // if x509 certs are required:
        // key: fs.readFileSync('certs/my-key.pem'),
        // cert: fs.readFileSync('certs/my-cert.pem')
    };


    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed
            var returnObj = []
            var pop = JSON.parse(returnData);
            var lat = Number(pop.results[0].geometry.location.lat);
            var lng = Number(pop.results[0].geometry.location.lng);
            var types = pop.results[0].types;
            var rate = pop.results[0].rating;
            returnObj.push(lat, lng, types, rate)
            callback(returnObj);
            //var long = Number(pop.results[0].geometry.location.lng)
            //var type = pop.results[0].rating;
            //callback(long);
            //callback(type);
            // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();
}