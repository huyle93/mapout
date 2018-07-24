'use-strict'
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
const Alexa = require('alexa-sdk');
var https = require('https');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
require('dotenv').load();


// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

let speechOutput;
let reprompt;
const welcomeOutput = [
    "Hello. Your trip advisor is here. I know a lot of information. You can start by saying let's plan a trip.",
    "Thank you for using Mapout. I am your own personal trip advisor. To begin simply say, let's plan a trip.",
    "Hi. Welcome to Mapout. In just a few steps I can help you plan a trip. To start, say, let's plan a trip.",
  ]

const welcomeReprompt = "Let me know where you'd like to go or when you'd like to go on your trip";

const tripIntro = [
    "This sounds like a cool trip. ",
    "This will be fun. ",
    "Oh, I like this trip. "
];

const cancelResponse = [
  "Okay. I hope you will use us again soon.",
  "Goodbye. Let me know when you want to next plan a trip.",
  "Alright. I hope to help you plan a trip later."
]

var starting_state = "NH";
var starting_city = "Durham";
var countryCode = "03824";
var postalCode = 0;
var addressLine1 = "UNH";
var addressLine2 = "";
var addressLine3 = "";
var districtOrCounty =  "";


// 2. Skill Code =======================================================================================================

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var myCoordinates = []
const handlers = {
    'LaunchRequest': function () {
        var speechOutput = randomPhrase(welcomeOutput);
        this.response.speak(speechOutput).listen(welcomeReprompt);
        this.emit(':responseReady');
    },
    'PlanMyTrip': function () {
        //get current addressLine1
        var getAddr = GetCurrentAddress.call( this, (addr_info) => {
            starting_state = addr_info[0];
            starting_city = addr_info[1];
            countryCode = addr_info[2];
            postalCode = addr_info[3];
            addressLine1 = addr_info[4];
            addressLine2 = addr_info[5];
            addressLine3 = addr_info[6];
            districtOrCounty =  addr_info[7];
        });

        var start_addr = `${addressLine1} ${starting_city} ${starting_state}`

        httpsGet_Geocode.call(this, start_addr, (start_geocode) => {
          myCoordinates = [start_geocode[0],start_geocode[1]]
        })

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
            speechOutput += "You'll go ";
        }

        //Now let's recap the trip
        //Validate info
        var toState = this.event.request.intent.slots.toState.value;
        var toCity = this.event.request.intent.slots.toCity.value;
        var travelDate = this.event.request.intent.slots.travelDate.value;
        var address = this.event.request.intent.slots.places.value;
        var make = "toyota"
        var model = "camry"
        var year = 2013

        var to_addr = `${address} ${toCity}`
        speechOutput += `from ${starting_city}, ${starting_state} to ${to_addr}, ${toState} on ${travelDate}`

        // Calling API
        httpsGet_Geocode.call(this, to_addr, (geocode) => {
          var lat = geocode[0] // int
          var long = geocode[1] // int
          httpsGetmyGoogleplace(lat, long, "distance", "parking", (place) => {
            var parking_lat = place[0]
            var parking_long = place[1]
            var parking_rating = place[2]
            var parking_name = place[3]
            httpsGet_Matrix(lat, long, (matrix) => {
              var distancevalue = matrix[0] // int
              var distancetext = matrix[1]
              var durationvalue = matrix[2] // int
              var durationtext = matrix[3]
              httpsGetStats(make, model, year, (stats) => {
                var mpg = stats[0]
                httpsGet_CarTheft("ma", (theft) => {
                  var theftCarMake = theft[0];
                  var theftCarModel = theft[1];
                  var theftCar = `${theftCarMake} ${theftCarModel}`
                  var myCar = `${make} ${model}`
                  get_price(myCoordinates[0], myCoordinates[1], (price) => {
                    var gasPrice = price[0];
                    var distance = getMiles(distancevalue);
                    var gasCost = Math.ceil((gasPrice * distance) / mpg)
                    speechOutput += getFinalMessage(address, parking_name, parking_rating, durationtext, distancetext, gasCost, myCar, theftCar);
                    this.response.speak(speechOutput);
                    this.emit(":responseReady")
                  })
                })
              })
            })
          })
        });
    },
    'AMAZON.HelpIntent': function () {
        speechOutput = "I am your own personal trip advisor. I can help plan a trip by giving you estimations about the cost, distance and time. You can start by saying, Let's plan a trip";
        reprompt = "Say let's plan a trip when you are ready to begin.";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        var speechOutput = randomPhrase(cancelResponse);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        var speechOutput = randomPhrase(cancelResponse);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        var speechOutput = "Thank you for using Mapout.";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
};

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

// ======================== Custom functions ======================= //
// Gets the final randomized message
function getFinalMessage( address, parking_name, parking_rating, durationtext, distancetext, gasCost, myCar, theftCar){
  var distanceAndDuration_response = [
    `. We anticipate this trip will take you ${durationtext} to get there and be a total distance of ${distancetext}`,
    `. Based off of our estimations your trip will be about ${durationtext} long over ${distancetext}`,
    `. This trip will be approximately ${distancetext} over the course of ${durationtext}`
  ]

  var parking_response  = [
    `. The closest parking we could find to ${address} is ${parking_name}. Their rating is a ${parking_rating}`,
    `. We found some parking close to ${address} for you. ${parking_name}'s rating is ${parking_rating}`,
    `. The closest place we could find parking for you will be ${parking_name} with a rating of ${parking_rating}`
  ]

  var gas_response  = [
    `. We estimate the cost of gas on this trip will be approximately $${gasCost} one way or $${(gasCost*2)} for the roundtrip`,
    `. Based on the distance and fuel efficiency of your car your cost for gas for this trip will be about $${gasCost} one way or $${(gasCost*2)} roundtrip`,
    `. This trip will cost around $${gasCost} one way or $${(gasCost*2)} roundtrip based on the fuel efficiency of your car and distance of the trip`,
  ]

  var theft_response = [
    `. Be careful! Your car ${theftCar}, is on top of the most commonly stolen car list in this state based on Liberty Mutual Insurance's data. Because of this we would recommend finding a garage to park.`,
    `. Warning! The car you provided us, ${theftCar}, is among the most commonly stolen cars in this state based on data from Liberty Mutual Insurance. We would recommend finding a garage to park.`,
    `. Heads up! ${theftCar}s are on top of Liberty Mutual Insurance's most commonly stolen car list in this state. It is recommended that you find a garage to park.`
  ]

  var speechOutput = ""
  speechOutput += randomPhrase(distanceAndDuration_response);
  speechOutput += randomPhrase(parking_response);
  speechOutput += randomPhrase(gas_response);

  if (myCar.toLowerCase() == theftCar.toLowerCase()) {
      speechOutput += randomPhrase(theft_response);
  }
  else {
    speechOutput += "."
  }

  return speechOutput;
}

// API KEYS
var matrix_key = process.env.MATRIX_KEY
var shine_key = process.env.SHINE_KEY
var googleplace_key = process.env.GOOGLEPLACE_KEY
var google_key = process.env.GOOGLE_KEY
var gas_key = process.env.GAS_KEY

//Gets Address from Amazon
function GetCurrentAddress(callback) {
    if(this.event.context.System.user.permissions) {
      const token = this.event.context.System.user.permissions.consentToken;
      const apiEndpoint = this.event.context.System.apiEndpoint;
      const deviceId = this.event.context.System.device.deviceId;
      const das = new Alexa.services.DeviceAddressService();

      das.getFullAddress(deviceId, apiEndpoint, token)
      .then((data) => {
        var starting_state = data.stateOrRegion;
        var city = data.city;
        var countryCode = data.countryCode;
        var postalCode = data.postalCode;
        var addressLine1 = data.addressLine1;;
        var addressLine2 = data.addressLine2;
        var addressLine3 = data.addressLine3;
        var districtOrCounty =  data.districtOrCounty;
        callback([starting_state, city, countryCode, postalCode, addressLine1, addressLine2, addressLine3, districtOrCounty])
      })
      .catch((error) => {
          this.response.speak('I\'m sorry. Something went wrong.');
          this.emit(':responseReady');
          console.log(error.message);
      });
  } else {
      this.response.speak('Please grant skill permissions to access your device address.');
      const permissions = ['read::alexa:device:all:address'];
      this.response.askForPermissionsConsentCard(permissions);
      console.log("Response: " + JSON.stringify(this.response));
      this.emit(':responseReady');
  }
}

// Geocode
function httpsGet_Geocode(myData, callback) {
    // Update these options with the details of the web service you would like to call
    var hold = this;

    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: `/maps/api/geocode/json?address=${encodeURIComponent(myData)}&key=` + google_key,
        method: 'GET',
        timeout: 100000
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
            var lat = Number(pop.results[0].geometry.location.lat);
            var lng = Number(pop.results[0].geometry.location.lng);
            callback([lat, lng]);
            // this will execute whatever function the caller defined, with one argument
        });
    });

    req.on('error', function(err) {
        /*
        hold.response.speak('I\'m sorry. Something went wrong. In httpsGet_Geocode');
        hold.emit(':responseReady');
        */
    });

    req.end();
}

//Gets distance in miles
function getMiles(i) {
    return i * 0.000621371192;
}

//Matrix
function httpsGet_Matrix(lat, long, callback) {
    // Update these options with the details of the web service you would like to call
    var hold = this
    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: `/maps/api/distancematrix/json?units=imperial&origins=${myCoordinates[0]},${myCoordinates[1]}&destinations=${lat}%2C${long}&key=` + matrix_key,
        method: 'GET',
        timeout: 100000
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
            callback([distancevalue, distancetext, durationvalue, durationtext]);
            // this will execute whatever function the caller defined, with one argument
        });
    });

    req.on('error', function(err) {
      /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGet_Matrix');
        hold.emit(':responseReady');*/
    });

    req.end();
}

// Shine Car Stats
function httpsGetStats(make, model, year, callback){
  var hold = this

  var stats_options = {
    host: 'apis.solarialabs.com',
    path: '/shine/v1/vehicle-stats/specs?make=' + make + '&model=' + model + '&year=' + year + '&full-data=true&apikey=' + shine_key,
    method: 'GET',
    timeout: 100000
  }

  var req = https.request(stats_options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function(data) {
          responseString += data;
      });

      res.on('end', function() {
          var response = JSON.parse(responseString);
          var stats_car_mpg = response[0].City_Conventional_Fuel
          callback([stats_car_mpg]);
      })
    })

      req.on('error', function(err) {
          /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGetStats');
          hold.emit(':responseReady');*/
      });

      req.end();
  }

// Shine Car Theft
function httpsGet_CarTheft(state, callback) {
    // Update these options with the details of the web service you would like to call
    // this will return top 3rd that got stolen
    var hold = this

    var options = {
        host: 'apis.solarialabs.com',
        port: 443,
        path: `/shine/v1/vehicle-thefts?state=${state}&rank=1&apikey=` + shine_key,
        method: 'GET',
        timeout: 100000
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
            callback([make, model]);
        });
    });

    req.on('error', function(err) {
        /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGet_Car');
        hold.emit(':responseReady');*/
    });

    req.end();

}

// MyGasFeed gets average price of gas around the starting location
function get_price(lat, long, callback) {
    let request = require('request')
    let options = {
        "url": `http://api.mygasfeed.com/stations/radius/${lat}/${long}/5/reg/price/${gas_key}.json`,
        "method": "GET",
        "qs": {
            //"address": "2+old+english+village+apt+110",
            //"apikey": apiKey
        }
    }
    request(options, (err, resp, body) => {
        //go through the address components and geometry components.
        var data = JSON.parse(body);
        //console.log(data)
        var sum_price = 0;

        for(var i = 0; i < data.stations.length; i++)
        {
            var listprice = data.stations[i].reg_price
            if (listprice != "N\/A"){

          sum_price += Number(listprice)
            }
        }
        var avg_price = (sum_price/data.stations.length)
        callback([avg_price]);
    })
}

// GooglePlace
function httpsGetmyGoogleplace(lat, long, rankby, types, callback) {
    var hold = this

    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: '/maps/api/place/nearbysearch/json?location=' + lat + ',' + long + '&rankby=' + rankby + '&type=' + types + '&key=' + googleplace_key,
        method: 'GET',
        timeout: 100000
    };
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var pop = JSON.parse(returnData);
            var name = pop.results[0].name;
            var lat = Number(pop.results[0].geometry.location.lat);
            var lng = Number(pop.results[0].geometry.location.lng);
            var rate = pop.results[0].rating||3;
            callback([lat, long, rate, name])
        });
    });

    req.on('error', function(err) {
        /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGetmyGoogleplace');
        hold.emit(':responseReady');*/
    });

    req.end();
}
