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

//A couple of welcome prompts to be chosen randomly at the start of the program
const welcomeOutput = [
    "Hello. Your trip advisor is here. I know a lot of information. You can start by saying let's plan a trip.",
    `Thank you for using <phoneme alphabet="ipa" ph="mæp.aʊt">Mapout</phoneme>. I am your own personal trip advisor. To begin simply say, let's plan a trip.`,
    `Hi. Welcome to <phoneme alphabet="ipa" ph="mæp.aʊt">Mapout</phoneme>. In just a few steps I can help you plan for your trip. To start, say, let's plan a trip.`,
  ]

//If a reprompt is required this will be said
const welcomeReprompt = "Let me know where you'd like to go or when you'd like to go on your trip";

//At the beginning of the final messsage one of these will be chosen randomly
const tripIntro = [
    "This sounds like a cool trip. ",
    "This will be fun. ",
    "Oh, I like this trip. "
];

//If during the skill the user decides to stop one of these responses will be
//emitted to gracefully end the skill.
const cancelResponse = [
  "Okay. I hope you will use us again soon.",
  "Goodbye. Let me know when you want to next plan a trip.",
  "Alright. I hope to help you plan a trip later."
]

//Variables that will be used to store the "current location" of the user
var starting_state = "NH";
var starting_city = "Durham";
var countryCode = "US";
var postalCode = "03824";
var addressLine1 = "UNH";
var addressLine2 = "";
var addressLine3 = "";
var districtOrCounty =  "";

// 2. Skill Code =======================================================================================================

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var myCoordinates = [] //The lat and long of the user will be stored here and used to get information
var postOnce = 0; //Check to see if the post has already been written and if it has don't post again
const handlers = {
    'LaunchRequest': function () {  //Welcomes the user and asks for them to prompt the PlanMyTrip intent
      var speechOutput = randomPhrase(welcomeOutput); //get a random welcome speech to begin the skill
      this.response.speak(speechOutput).listen(welcomeReprompt);
      this.emit(':responseReady');
    },
    'PlanMyTrip': function () {
        var getAddr = GetCurrentAddress.call( this, (addr_info) => { //get the starting location of the ALexa device
            starting_state = addr_info[0];
            starting_city = addr_info[1];
            countryCode = addr_info[2];
            postalCode = addr_info[3];
            addressLine1 = addr_info[4];
            addressLine2 = addr_info[5];
            addressLine3 = addr_info[6];
            districtOrCounty =  addr_info[7];
        });

        var start_addr = `${addressLine1} ${starting_city} ${starting_state}` //The starting location as a string to help ensure accuracy
        httpsGet_Geocode.call(this, start_addr, (start_geocode) => { //get the lat and long of the starting location
          myCoordinates = [start_geocode[1],start_geocode[2]]
        })

        var deviceId = this.event.context.System.device.deviceId; //gets the device ID to use as the users "key" to be posted
        deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1)); //Just makes it so the path is valid by eliminating the "."
        httpsPost_Cooridinates( deviceId, myCoordinates[0], myCoordinates[1] ) //post the cooridinates to be used later

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

        var to_addr = `${address} ${toCity} ${toState}` //The end location as a string to help ensure accuracy
        var state = convertToAbbr(toState); //gets the state they are going to as the state code to be used for the carTheft API
        speechOutput += `from ${starting_city}, ${starting_state} to ${to_addr}, ${toState} on ${travelDate}` //output for final message

        // Calling API
        httpsGet_Geocode.call(this, to_addr, (geocode) => { //Gets the lat and long of the end location
          var errors = []; //checks to see if an error occurs and what type so we can give the appropriate message back
          errors.push(geocode[0]); //The first variable in the callbacks defines if there is a error and if its fatal or not. This gets pushed to an array to be checked later
          var lat = geocode[1] // int
          var long = geocode[2] // int
          httpsGetmyGoogleplace(lat, long, "distance", "parking", (place) => { //gets the lat, long, rating, and name of the parking we recommend
            errors.push(place[0])
            var parking_lat = place[1]
            var parking_long = place[2]
            var parking_rating = place[3]
            var parking_name = place[4]
            httpsGet_Matrix(lat, long, (matrix) => { //gets the estimated time and distance of your trip
              errors.push(matrix[0])
              var distancevalue = matrix[1] // int
              var distancetext = matrix[2]
              var durationvalue = matrix[3] // int
              var durationtext = matrix[4]
              httpsGetStats(make, model, year, (stats) => { //gets the mpg of the user car
                errors.push(stats[0]);
                var mpg = Number(stats[1]);
                httpsGet_CarTheft("MA", (theft) => { //gets the most commonly stolen car in the state you are traveling to
                  errors.push(theft[0]);
                  var theftCarMake = theft[1];
                  var theftCarModel = theft[2];
                  var theftCar = `${theftCarMake} ${theftCarModel}` //made a string to be compared with the car you provided with the most commonly stolen car
                  var myCar = `${make} ${model}`
                  get_price(myCoordinates[0], myCoordinates[1], (price) => { //gets average gas price around the starting location of the user
                    var gasPrice = price[0];
                    var distance = getMiles(distancevalue);
                    var gasCost = Math.ceil((gasPrice * distance) / mpg) //gets estimated gas cost for the trip using the mpg, gas price, and distance
                    speechOutput += getFinalMessage(address, parking_name, parking_rating, durationtext, distancetext, gasCost, myCar, theftCar); //gets the randomized final message to be spoken
                    var checkForErrors = checkErrors( errors ); //checks to see if any errors occur
                    if(checkForErrors != 0 ) //if no errors just proceed normally
                    {
                      if( checkForErrors == 1) //if there is a one that means there is a non-fatal error that can use a default value and still function
                      {
                        speechOutput += " Just a heads up. There was a non fatal error that occured. A default value has been placed but should be close to accurate."
                      }
                      else if( checkForErrors == 2) //if there is a two there is a fatal error that will not allow for functionality of the skill. Fail gracefully with a message
                      {
                        speechOutput = " There was a fatal error occured. We're very sorry! Please try again."
                      }
                    }
                    this.response.speak(speechOutput);
                    this.emit(":responseReady")
                  })
                })
              })
            })
          })
        });
        postOnce = 0; //reset postOnce
    },
    'AMAZON.HelpIntent': function () { //If the user needs help to know what this skill is explain.
        speechOutput = "I am your own personal trip advisor. I can help plan a trip by giving you estimations about the cost, distance and time. You can start by saying, Let's plan a trip";
        reprompt = "Say let's plan a trip when you are ready to begin.";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () { //if canceled give a random cancel response
        var speechOutput = randomPhrase(cancelResponse);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () { //if stopped give a random cancel response
        var speechOutput = randomPhrase(cancelResponse);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () { //Thank them for using mapout at the end of the skill
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

function randomPhrase(array) { //picks a random phrase from an array
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
// Gets the final randomized message for the distance, duration, parking, gas, and possibly a theft warning
function getFinalMessage( address, parking_name, parking_rating, durationtext, distancetext, gasCost, myCar, theftCar){
  var distanceAndDuration_response = [
    `. We anticipate this trip will take you ${durationtext} to get there and be a total distance of ${distancetext}`,
    `. Based off of our estimations your trip will be about ${durationtext} long over ${distancetext}`,
    `. This trip will be approximately ${distancetext} over the course of ${durationtext}`
  ]

  var parking_response  = [
    `. . The closest parking we could find to ${address} is ${parking_name}. Their rating is a ${parking_rating}`,
    `. . We found some parking close to ${address} for you. ${parking_name}'s rating is ${parking_rating}`,
    `. . The closest place we could find parking for you will be ${parking_name} with a rating of ${parking_rating}`
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

//Gets Address of the device from Amazon
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
      this.response.speak('Please grant skill permissions to access your device address. Doing so will allow us to give you the most accurate estimations about your trip.');
      const permissions = ['read::alexa:device:all:address'];
      this.response.askForPermissionsConsentCard(permissions);
      console.log("Response: " + JSON.stringify(this.response));
      this.emit(':responseReady');
  }
}

//Gets distance in miles
function getMiles(i) {
    return i * 0.000621371192;
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
  };

  try{
    var req = https.request(options, res => {
      res.setEncoding('utf8');
      var returnData = "";

      res.on('data', chunk => {
        returnData = returnData + chunk;
      });

      res.on('end', () => {
        try{
          var pop = JSON.parse(returnData);
          var lat = Number(pop.results[0].geometry.location.lat);
          var lng = Number(pop.results[0].geometry.location.lng);
          callback([null, lat, lng]); //The first variable in the callbacks defines if there is a error and if its fatal or not. Here there is neither
        }
        catch(error) {
          console.error("There was a problem with the google API");
          callback([2, 0, 0]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
        }
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
  catch(error) {
    console.error("There was a problem with the request");
    callback([2, 0, 0]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
  }
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
  };

  try{
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            var data = JSON.parse(returnData);
            try{
              var distancevalue = data.rows[0].elements[0].distance.value;
              var distancetext = data.rows[0].elements[0].distance.text;
              var durationvalue = data.rows[0].elements[0].duration.value;
              var durationtext = data.rows[0].elements[0].duration.text;
              callback([null, distancevalue, distancetext, durationvalue, durationtext]);  //The first variable in the callbacks defines if there is a error and if its fatal or not. Here there is neither
            }
            catch(error) {
              console.error("There was a problem with the api call");
              callback([2, 0, "", 0, ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
            }
        });
    });

    req.on('error', function(err) {
      /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGet_Matrix');
        hold.emit(':responseReady');*/
    });

    req.end();
  }
  catch(error) {
    console.error("There was a problem with the request");
    callback([2, 0, "", 0, ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
  }
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

  try{
    var req = https.request(stats_options, function(res) {
      res.setEncoding('utf-8');

      var responseString = '';

      res.on('data', function(data) {
        responseString += data;
      });

      res.on('end', function() {
        try{
          var response = JSON.parse(responseString);
          var stats_car_mpg = response[0].City_Conventional_Fuel
          callback([null, stats_car_mpg]);  //The first variable in the callbacks defines if there is a error and if its fatal or not. Here there is neither
        }
        catch(error) {
          console.error("There was a problem getting the gas. Using 20 mpg");
          callback([1, 20]); //here is an example of a non-fatal error signaled with a "1". The other variable is a default value
        }
      })
    })

    req.on('error', function(err) {
      /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGetStats');
      hold.emit(':responseReady');*/
    });

    req.end();
  }
  catch(error){
    console.error("There was a problem with the request");
    callback([2, 0]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
  }
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
  };
  try{
    var req = https.request(options, res => {
      res.setEncoding('utf8');
      var returnData = "";
      res.on('data', chunk => {
        returnData = returnData + chunk;
      });

      res.on('end', () => {
        var data = JSON.parse(returnData);
        try{
          var make = data[0].Make
          var model = data[0].Model
          callback([null, make, model]);  //The first variable in the callbacks defines if there is a error and if its fatal or not. Here there is neither
        }
        catch(error) {
          console.error("There was a problem with the api call");
          callback([2, "", ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
        }
      });
    });

    req.on('error', function(err) {
      /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGet_Car');
      hold.emit(':responseReady');*/
    });

    req.end();
  }
  catch(error) {
    console.error("There was a problem with the request");
    callback([2, "", ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
  }
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
  try{
    var req = https.request(options, res => {
      res.setEncoding('utf8');
      var returnData = "";
      res.on('data', chunk => {
        returnData = returnData + chunk;
      });

      res.on('end', () => {
        var pop = JSON.parse(returnData);
        try{
          var name = pop.results[0].name;
          var lat = Number(pop.results[0].geometry.location.lat);
          var lng = Number(pop.results[0].geometry.location.lng);
          var rate = pop.results[0].rating||3;
          callback([null, lat, long, rate, name])  //The first variable in the callbacks defines if there is a error and if its fatal or not. Here there is neither
        }
        catch(error) {
          console.error("There was a problem with the api call");
          callback([2, 0, 0, "", ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
        }
      });
    });

   req.on('error', function(err) {
      /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGetmyGoogleplace');
      hold.emit(':responseReady');*/
    });

    req.end();
  }
  catch(error) {
    console.error("There was a problem with the request");
    callback([2, 0, 0, "", ""]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
  }
}

//Posts the Coordinates to a database
function httpsPost_Cooridinates(deviceId, lat, long) {
    post_data = {
      "lat" : lat,
      "long" : long
    }

    var post_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/Coordinates/${deviceId}/.json`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(post_data))
        }
    };

      var post_req = https.request(post_options, res => {
          res.setEncoding('utf8');
          var returnData = "";
          res.on('data', chunk =>  {
              returnData += chunk;
          });
          res.on('end', () => {
              // this particular API returns a JSON structure:
              // returnData: {"usstate":"New Jersey","population":9000000}
              console.log(returnData)
              var name = JSON.parse(returnData).name;
          });
      });

      //console.log("post_data: " + JSON.stringify(post_data))
      if( postOnce === 0)
      {
        post_req.write(JSON.stringify(post_data));
        postOnce = 1;
      }

      post_req.on('error', function(err) {
      });

      post_req.end();
}

//To go from full name in slot to abbreviated code for carTheft
function convertToAbbr(input) {
    var states = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['American Samoa', 'AS'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['Armed Forces Americas', 'AA'],
        ['Armed Forces Europe', 'AE'],
        ['Armed Forces Pacific', 'AP'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Marshall Islands', 'MH'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Northern Mariana Islands', 'NP'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Puerto Rico', 'PR'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['US Virgin Islands', 'VI'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    // So happy that Canada and the US have distinct abbreviations
    var provinces = [
        ['Alberta', 'AB'],
        ['British Columbia', 'BC'],
        ['Manitoba', 'MB'],
        ['New Brunswick', 'NB'],
        ['Newfoundland', 'NF'],
        ['Northwest Territory', 'NT'],
        ['Nova Scotia', 'NS'],
        ['Nunavut', 'NU'],
        ['Ontario', 'ON'],
        ['Prince Edward Island', 'PE'],
        ['Quebec', 'QC'],
        ['Saskatchewan', 'SK'],
        ['Yukon', 'YT'],
    ];

  var regions = states.concat(provinces);
  var state = String(input)
  for (var i = 0; i < regions.length; i++) {
    if (regions[i][0].toLowerCase() == state.toLowerCase()) {
      return (regions[i][1]);
    }
  }
}

//Checks for Errors and whether or not they were fatal or not
function checkErrors( arr ){
  var flag = 0;

  for( var i = 0; i < arr.length; i++ )
  {
    if( arr[i] == 1 )
    {
      flag = 1;
    }
    else if( arr[i] == 2 )
    {
      flag = 2;
      i = arr.length;
    }
  }

  return flag;
}
