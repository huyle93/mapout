'use-strict'
/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
const Alexa = require('alexa-sdk');
var api = require('./API.js');
var helper = require('./helper_funcs.js')

// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function
let speechOutput;
let reprompt;

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
var starting_state = "NH"; //default value to make api accept it
var starting_city = "Durham"; //default value to make api accept it
var countryCode = "US"; //default value to make api accept it
var postalCode = "03824"; //default value to make api accept it
var addressLine1 = "UNH"; //default value to make api accept it
var addressLine2 = "";
var addressLine3 = "";
var districtOrCounty =  "";

// 2. Skill Code =======================================================================================================

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).
var myCoordinates = [] //The lat and long of the user will be stored here and used to get information
const handlers = {
    'LaunchRequest': function () {  //Welcomes the user and asks for them to prompt the PlanMyTrip intent
      var deviceId = this.event.context.System.device.deviceId; //gets the device ID to use as the users "key" to be posted
      var short_deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1), 40); //Just makes it so the path is valid by eliminating the "."
      var speechOutput = helper.getWelcomeMessage( short_deviceId, (cb) => {
        this.response.speak(cb[0]).listen(welcomeReprompt);
        this.emit(':responseReady');
      })
    },
    'PlanMyTrip': function () {
        var deviceId = this.event.context.System.device.deviceId; //gets the device ID to use as the users "key" to be posted
        var short_deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1), 40); //Just makes it so the path is valid by eliminating the "."
        postData.call(this, deviceId);

        //delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);

        //activity is optional so we'll add it to the output
        //only when we have a valid activity
        var travelMode = isSlotValid(this.event.request, "travelMode");
        //Now let's recap the trip
        //Validate info
        var toState = this.event.request.intent.slots.toState.value;
        var toCity = this.event.request.intent.slots.toCity.value;
        var travelDate = this.event.request.intent.slots.travelDate.value;
        var address = this.event.request.intent.slots.places.value;

        api.httpsPut_ToState( short_deviceId, toState )
        var to_addr = `${address} ${toCity} ${toState}` //The end location as a string to help ensure accuracy

        var speechOutput = helper.randomPhrase(tripIntro);
        if (travelMode) {
            speechOutput += travelMode;
        } else {
            speechOutput += ` . You'll go `;
            speechOutput += `from ${starting_city}, ${starting_state} to ${toCity}, ${toState} on ${travelDate}` //output for final message
        }

        /**
         * Logic to check the car information, if user proceed
         * The skill will use the default info
         * If not, the alexa will pull the info from the DB
         * @param make
         * @param model
         * @param year
         */
        helper.checkCarInfo( short_deviceId, (car) =>
        {
          var make = ""
          var model = ""
          var year = 0
          if( car[0] === 0 ){
            make = "toyota"
            model = "camry"
            year = 2013
          } else{
            api.httpsGet_CarInfo( short_deviceId, (info) =>{
              make = info[0]
              model = info[1]
              year = info[2]
            })
          }
          /**
           * Calling each API from an external javascript file
           * @param api
           */
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
                  var state;
                  api.httpsGet_ToState( short_deviceId, (cb) => {
                    state = helper.convertToAbbr(cb[0]);
                    api.httpsGet_CarTheft(state, (theft) => { //gets the most commonly stolen car in the state you are traveling to
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
            })
          })
        })
    },
    'AddCarInfo': function () {
        var deviceId = this.event.context.System.device.deviceId; //gets the device ID to use as the users "key" to be posted
        var short_deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1), 40); //Just makes it so the path is valid by eliminating the "."

        //fill the slots
        var filledSlots = delegateSlotCollection.call(this);

        var make = this.event.request.intent.slots.make.value;
        var model = this.event.request.intent.slots.model.value;
        var year = this.event.request.intent.slots.year.value;

        //Put the info we have just gotton onto the database
        api.httpsPut_CarInfo( short_deviceId, make, model, year)

        var speechOutput = "Awesome! This information will be saved for your future use of our skill. If you ever want to update the information just say update car info. Now, say lets plan a trip and we can get started."
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady")
    },
    'AMAZON.HelpIntent': function () { //If the user needs help to know what this skill is explain.
        speechOutput = "I am your own personal trip advisor. I can help plan a trip by giving you estimations about the cost, distance and time. If you would like to update your car info say, Update Car Info or you can start by saying, Let's plan a trip";
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
/**
 * Get the Device Id of user, get user starting address then put it into a variable
 * Then call an function from an external javascript file to get the coordinate.
 * The put the information up to the database using the put method.
 *
 * @param {string} devideId  get the deviceId from the external function
 *
*/
function postData( deviceId ){
  var getAddr = api.GetCurrentAddress.call( this, deviceId, (addr_info) => { //get the starting location of the ALexa device
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

   var short_deviceId = deviceId.slice((deviceId.lastIndexOf(".") + 1), 40); //Just makes it so the path is valid by eliminating the "."
  api.httpsPut_Cooridinates( short_deviceId, myCoordinates[0], myCoordinates[1], (cb) => { //post the cooridinates to be used later
    api.httpsPut_UserInfo( short_deviceId, postalCode, starting_city, starting_state);
  })
}
