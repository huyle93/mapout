'use-strict'
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
const Alexa = require('alexa-sdk');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var api = require('./API.js');
var helper = require('./helper_funcs.js')

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
const handlers = {
    'LaunchRequest': function () {  //Welcomes the user and asks for them to prompt the PlanMyTrip intent
      var speechOutput = helper.randomPhrase(welcomeOutput);
      this.response.speak(speechOutput).listen(welcomeReprompt);
      this.emit(':responseReady');
    },
    'PlanMyTrip': function () {

        postData.call(this);

        //delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);

        //compose speechOutput that simply reads all the collected slot values
        var speechOutput = helper.randomPhrase(tripIntro);

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
        var state = helper.convertToAbbr(toState); //gets the state they are going to as the state code to be used for the carTheft API
        speechOutput += `from ${starting_city}, ${starting_state} to ${to_addr}, ${toState} on ${travelDate}` //output for final message

        // Calling API
        api.httpsGet_Geocode.call(this, to_addr, (geocode) => { //Gets the lat and long of the end location
          var errors = []; //checks to see if an error occurs and what type so we can give the appropriate message back
          errors.push(geocode[0]); //The first variable in the callbacks defines if there is a error and if its fatal or not. This gets pushed to an array to be checked later
          var lat = geocode[1] // int
          var long = geocode[2] // int
          api.httpsGetmyGoogleplace(lat, long, "distance", "parking", (place) => { //gets the lat, long, rating, and name of the parking we recommend
            errors.push(place[0])
            var parking_lat = place[1]
            var parking_long = place[2]
            var parking_rating = place[3]
            var parking_name = place[4]
            api.httpsGet_Matrix(myCoordinates[0], myCoordinates[1], lat, long, (matrix) => { //gets the estimated time and distance of your trip
              errors.push(matrix[0])
              var distancevalue = matrix[1] // int
              var distancetext = matrix[2]
              var durationvalue = matrix[3] // int
              var durationtext = matrix[4]
              api.httpsGetStats(make, model, year, (stats) => { //gets the mpg of the user car
                errors.push(stats[0]);
                var mpg = Number(stats[1]);
                api.httpsGet_CarTheft("MA", (theft) => { //gets the most commonly stolen car in the state you are traveling to
                  errors.push(theft[0]);
                  var theftCarMake = theft[1];
                  var theftCarModel = theft[2];
                  var theftCar = `${theftCarMake} ${theftCarModel}` //made a string to be compared with the car you provided with the most commonly stolen car
                  var myCar = `${make} ${model}`
                  api.get_price(myCoordinates[0], myCoordinates[1], (price) => { //gets average gas price around the starting location of the user
                    var gasPrice = price[0];
                    var distance = helper.getMiles(distancevalue);
                    var gasCost = Math.ceil((gasPrice * distance) / mpg) //gets estimated gas cost for the trip using the mpg, gas price, and distance
                    speechOutput += helper.getFinalMessage(address, parking_name, parking_rating, durationtext, distancetext, gasCost, myCar, theftCar); //gets the randomized final message to be spoken
                    var checkForErrors = helper.checkErrors( errors ); //checks to see if any errors occur
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
    },
    'AMAZON.HelpIntent': function () { //If the user needs help to know what this skill is explain.
        speechOutput = "I am your own personal trip advisor. I can help plan a trip by giving you estimations about the cost, distance and time. You can start by saying, Let's plan a trip";
        reprompt = "Say let's plan a trip when you are ready to begin.";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () { //if canceled give a random cancel response
        var speechOutput = helper.randomPhrase(cancelResponse);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () { //if stopped give a random cancel response
        var speechOutput = helper.randomPhrase(cancelResponse);
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
function postData(){
  var getAddr = api.GetCurrentAddress.call( this, (addr_info) => { //get the starting location of the ALexa device
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
  api.httpsGet_Geocode.call(this, start_addr, (start_geocode) => { //get the lat and long of the starting location
    myCoordinates = [start_geocode[1],start_geocode[2]]
  })

  var deviceId = this.event.context.System.device.deviceId; //gets the device ID to use as the users "key" to be posted
  deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1), 30); //Just makes it so the path is valid by eliminating the "."
  api.httpsPut_Cooridinates( deviceId, myCoordinates[0], myCoordinates[1] )//post the cooridinates to be used later
}
