'use strict'
/*
Author: Huy Le
Sample custom interactive skill
huyle.finance@gmail.com
-------------- // --------------
1. Speeches (strings)
*/
const Alexa = require('alexa-sdk');
var https = require('https');
/* -------------------------- Speeches ------------------------ */
// welcome prompt
const welcome_Prompt = "Hello. Your trip advisor is here.";
// help prompt
const help_Prompt = "You can ask me for estimate gas expenses. Say bye to exit.";
// ending prompt
const endingPersonalFinance_Prompt = 'For more helpful tips on personal finance, visit Fidelity.com slash MyMoney';
const endingInvesting_Prompt = 'For more helpful tips on investing, visit Fidelity.com slash MyMoney';
// feedback prompt
const feedback_Prompt = 'Also. Dont forget to give me feedback so I can improve';
// anything else prompt
const re_Prompt = 'is there anything else I can help you?';
// follow up prompt
const personalFinance_01_FollowUp = '';
const personalFinance_02_FollowUp = '';
const personalFinance_03_FollowUp = '';
const invest_01_FollowUp = '';
const invest_02_FollowUp = 'Mutual funds are investments that pool your money together with other investors to purchase shares of a collection of stocks, bonds, or other securities, referred to as a portfolio, that might be difficult to recreate on your own. Mutual funds are typically overseen by a portfolio manager.';
const invest_03_FollowUp = 'Your risk capacity is a measure of how much of a loss you can handle without severely jeopardizing your financial goals and well-being. ';
// fidelity follow up
const fid_prod_invest_FollowUp = 'Did you know, Fidelity Investment is there to help you choosing the right investment, so let us take the risk for you.';
//open account
const open_account_Fid_Go_SSML = ' <emphasis level="strong">Introducing Fidelity Go.</emphasis> An Affordable money management product where you should start your investment account.  <break time="0.5s"/>  Visit Fidelity.com/Go, to start now.';
//fun
const secret_SSML = ' I want to tell you a secret. <amazon:effect name="whispered">I know a place to help you start invest and manage money better. </amazon:effect>';
//
const explain_Prompt_SSML = ' Let me know if you dont understand something? You can say: I am good. To exit. ';
// Personal Data
const recommenderArray = [
    // tip 1
    'I think you should',
    // tip 2
    'Maybe you can try to',
    // tip 3
    'You should'
];
var myCoordinates = [43.1389480, -70.9370250]
const REQUIRED_SLOTS = [
    'places'
];
const defaultData = [
    {
        "name": "make",
        "value": "make_type",
        "ERCode": "ER_SUCCESS_MATCH",
        "ERValues": [
            { "value": "toyota" }
        ]
    },
    {
        "name": "model",
        "value": "model_type",
        "ERCode": "ER_SUCCESS_MATCH",
        "ERValues": [
            { "value": "camry" },
        ]
    }
];
//functions
exports.handler = (event, context) => {
    try {
        if (event.session.new) {
            // New Session
            console.log("NEW SESSION")
        }
        switch (event.request.type) {

            case "LaunchRequest":
                // Launch Request
                console.log(`LAUNCH REQUEST`)
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse(welcome_Prompt, false), {}
                    )
                );
                break;

            case "IntentRequest":
                // Intent Request
                console.log(`INTENT REQUEST`)

                switch (event.request.intent.name) {
                    // \\\\\\\\\\\\\\\\\\\\\\\\ AMAZON /////////////////////////
                    case "AMAZON.HelpIntent":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(help_Prompt, false), {}
                            )
                        );
                        break;

                    case "AMAZON.StopIntent":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Alright. See you again soon. ${feedback_Prompt}`, true), {}
                            )
                        );
                        break;

                    case "AMAZON.CancelIntent":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Alright. See you again soon. ${feedback_Prompt}`, true), {}
                            )
                        );
                        break;

                    case "AMAZON.PauseIntent":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Ok. I am waiting.`, false), {}
                            )
                        );
                        break;

                    case "AMAZON.ResumeIntent":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`How can I help you? `, false), {}
                            )
                        );
                        break;
                        // \\\\\\\\\\\\\\\\\\\\\\\\ CUSTOM /////////////////////////
                        // ======================== INTENT =========================
                        // Handling Error while users provide bad input
                    case "didNotUnderstand":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Woo, I did not hear it clear. ${help_Prompt} Can you say it again? `, false), {}
                            )
                        );
                        break;
                        // ======================== INTENT =========================
                        // Quick Ask for user that is familiar
                    case "getQuickAsk":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`what would you like to know?`, false), {}
                            )
                        );
                        break;
                        // \\\\\\\\\\\\\\\\\\\\\\\\ ADVANCE /////////////////////////
                        // ======================== INTENT =========================
                        // Simple approach to budgetting
                    case "getTripInfo":
                        var address = event.request.intent.slots.places.value;
                        /* var make = event.request.intent.slots.make.value;
                        var model = event.request.intent.slots.model.value;
                        var year = event.request.intent.slots.year.value; */
                        var make = 'honda'
                        var model = 'civic'
                        var year = '2010'
                        // delegate to Alexa to collect all the required slots
                        let isTestingWithSimulator = true; //autofill slots when using simulator, dialog management is only supported with a device
                        let filledSlots = delegateSlotCollection.call(this, isTestingWithSimulator);

                        // console.log("filled slots: " + JSON.stringify(filledSlots));
                        // at this point, we know that all required slots are filled.
                        let slotValues = getSlotValues(filledSlots);
                        /* // temporary fall back
                        if (model == null || model == undefined || model == NaN) {
                            model == 'civic'
                        }
                        if (make == null || make == undefined || make == NaN) {
                            make == 'honda'
                        }
                        if (year == null || year == undefined || year == NaN) {
                            year == '2010'
                        } */
                        httpsGet_Geocode(address, (geocode) => {
                            var lat = geocode[0]
                            var long = geocode[1]
                            httpsGet_Matrix(lat, long, (matrix) => {
                                var distancevalue = matrix[0]
                                var distancetext = matrix[1]
                                var durationvalue = matrix[2]
                                var durationtext = matrix[3]
                                httpsGet_CarStats(make, model, year, (stats) => {
                                    var ctympg = stats[0]
                                    var hwympg = stats[1]
                                    httpsGet_CarTheft('ma', (car) => {
                                        var theftCarMake = car[0]
                                        var theftCarModel = car[1]
                                        var theftCar = `${car[0]} ${car[1]}`
                                        var myCar = `${make} ${model}`
                                        if (myCar.toLowerCase() == theftCar.toLowerCase()) {
                                            context.succeed(
                                                generateResponse(
                                                    buildSpeechletResponse(`your car will got stolen for sure`, true)
                                                )
                                            );
                                        }
                                        context.succeed(
                                            generateResponse(
                                                buildSpeechletResponse(`distance is ${distancetext}, take ${durationtext}. Your car has ${stats[0]} city mpg, ${stats[1]} hwy mpg`, true)
                                            )
                                        );
                                    })
                                })
                            })
                        });
                        break;
                    case "getAdvice":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>We have budgeting advice and retirement advice, which one do you want to know? </speak>`, false), {}
                            )
                        );
                        break;
                        // \\\\\\\\\\\\\\\\\\\\\\\\ CARD RESPONSE /////////////////////////
                    case "openAccount":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseWithCard(`Open Retirement Account`, `Here the link to open a retirement account with Fidelity: Fidelity.com/open-account/retirement`, ` check your amazon alexa app, we just send you the link to open an account. `, true), {}
                            )
                        );
                        break;
                        // HIDDEN INTENTS
                    case "getSecret":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>${secret_SSML}</speak>`, true), {}
                            )
                        );
                        break;

                    default:
                        throw "Invalid intent";
                }

                break;

            case "SessionEndedRequest":
                // Session Ended Request
                console.log(`SESSION ENDED REQUEST`);
                break;

            default:
                context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);

        }

    } catch (error) {
        context.fail(`Exception: ${error}`);
    }
    const alexa = Alexa.handler(event, context);
    //alexa.execute();
};

// Helpers
var buildSpeechletResponse = (outputText, shouldEndSession) => {

    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    };
};

var buildSpeechletResponseWithCard = (cardTitle, cardBody, outputText, shouldEndSession) => {

    return {
        card: {
            type: "Standard",
            title: cardTitle,
            text: cardBody,
            image: {
                smallImageUrl: "https://s3.amazonaws.com/huyle-fidelity-test-alexa-flashbriefing-files/card_small.png",
                largeImageUrl: "https://s3.amazonaws.com/huyle-fidelity-test-alexa-flashbriefing-files/card_large.png"
            }
        },
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    };
};

var buildSpeechletResponseSSML = (outputSSML, shouldEndSession) => {

    return {
        outputSpeech: {
            type: "SSML",
            ssml: outputSSML
        },
        shouldEndSession: shouldEndSession
    };
};

var generateResponse = (speechletResponse, sessionAttributes) => {

    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
};

// ======================== Custom functions ======================= //
// Geocode
function httpsGet_Geocode(myData, callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'maps.googleapis.com',
        port: 443,
        path: `/maps/api/geocode/json?address=${encodeURIComponent(myData)}&key=AIzaSyD-8QBhZNxZLnmX2AxBEOB2sSHzg4L2tZs`,
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
            callback([lat, lng]);
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
        path: `/maps/api/distancematrix/json?units=imperial&origins=${myCoordinates[0]},${myCoordinates[1]}&destinations=${lat}%2C${long}&key=AIzaSyBtVpXAuWlnuC7hicRdzFBzBifYR1evqIY`,
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
            callback([distancevalue, distancetext, durationvalue, durationtext]);
            // this will execute whatever function the caller defined, with one argument
        });
    });
    req.end();

}
// Shine Car Stats
function httpsGet_CarStats(make, model, year, callback) {
    // Update these options with the details of the web service you would like to call
    var options = {
        host: 'apis.solarialabs.com',
        port: 443,
        path: `/shine/v1/vehicle-stats/specs?make=${make}&model=${model}&year=${year}&full-data=true&apikey=UKxbxhZYNEiP4spThYCy61bwEhRQXlPb`,
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
            var citygas = data[0].City_Conventional_Fuel
            var hwygas = data[0].Hwy_Conventional_Fuel
            callback([citygas, citygas]);
            // this will execute whatever function the caller defined, with one argument
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
        path: `/shine/v1/vehicle-thefts?state=${state}&rank=1&apikey=UKxbxhZYNEiP4spThYCy61bwEhRQXlPb`,
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
            callback([make, model]);
        });
    });
    req.end();

}
// MyGasFeed

// GooglePlace

///////////////////////////////////////////////////////////////////////////////
// ***********************************
// ** Dialog Management
// ***********************************

function getSlotValues(filledSlots) {
    //given event.request.intent.slots, a slots values object so you have
    //what synonym the person said - .synonym
    //what that resolved to - .resolved
    //and if it's a word that is in your slot values - .isValidated
    let slotValues = {};

    console.log('The filled slots: ' + JSON.stringify(filledSlots));
    Object.keys(filledSlots).forEach(function (item) {
        //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
        var name = filledSlots[item].name;
        //console.log("name: "+name);
        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case "ER_SUCCESS_MATCH":
                    slotValues[name] = {
                        "synonym": filledSlots[item].value,
                        "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        "isValidated": true
                    };
                    break;
                case "ER_SUCCESS_NO_MATCH":
                    slotValues[name] = {
                        "synonym": filledSlots[item].value,
                        "resolved": filledSlots[item].value,
                        "isValidated": false
                    };
                    break;
            }
        } else {
            slotValues[name] = {
                "synonym": filledSlots[item].value,
                "resolved": filledSlots[item].value,
                "isValidated": false
            };
        }
    }, this);
    //console.log("slot values: "+JSON.stringify(slotValues));
    return slotValues;
}

// This function delegates multi-turn dialogs to Alexa.
// For more information about dialog directives see the link below.
// https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
function delegateSlotCollection(shouldFillSlotsWithTestData) {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    // This will fill any empty slots with canned data provided in defaultData
    // and mark dialogState COMPLETED.
    // USE ONLY FOR TESTING IN THE SIMULATOR.
    if (shouldFillSlotsWithTestData) {
        let filledSlots = fillSlotsWithTestData.call(this, defaultData);
        this.event.request.dialogState = "COMPLETED";
    };

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        var updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values 
        // for which you have defaults, then return Dialog.Delegate with this 
        // updated intent in the updatedIntent property

        disambiguateSlot.call(this);
        console.log("disambiguated: " + JSON.stringify(this.event));
        return this.emit(":delegate", updatedIntent);
        console.log('shouldnt see this.');
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        //console.log(JSON.stringify(this.event));

        disambiguateSlot.call(this);
        return this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
}


// this function will keep any slot values currently in the request
// and will fill other slots with data from testData
function fillSlotsWithTestData(testData) {
    console.log("in fillSlotsWithTestData");

    //console.log("testData: "+JSON.stringify(testData));
    //loop through each item in testData
    testData.forEach(function (item, index, arr) {
        //check to see if the slot exists
        //console.log("item: "+JSON.stringify(item));
        if (!this.event.request.intent.slots[item.name].value) {
            //fill with test data
            //construct the element
            let newSlot = {
                "name": item.name,
                "value": item.value,
                "resolutions": {
                    "resolutionsPerAuthority": [{
                        "authority": "",
                        "status": {
                            "code": item.ERCode,
                        },
                    }]
                },
                "confirmationStatus": "CONFIRMED"
            };

            //add Entity resolution values
            if (item.ERCode == "ER_SUCCESS_MATCH") {
                let ERValuesArr = [];
                item.ERValues.forEach(function (ERItem) {
                    let value = {
                        "value": {
                            "name": ERItem.value,
                            "id": ""
                        }
                    };
                    ERValuesArr.push(value);
                })
                newSlot.resolutions.resolutionsPerAuthority[0].values = ERValuesArr;
            }

            //add the new element to the response
            this.event.request.intent.slots[item.name] = newSlot;
        }
    }, this);

    //console.log("leaving fillSlotsWithTestData");
    return this.event.request.intent.slots;
}

// If the user said a synonym that maps to more than one value, we need to ask 
// the user for clarification. Disambiguate slot will loop through all slots and
// elicit confirmation for the first slot it sees that resolves to more than 
// one value.
function disambiguateSlot() {
    let currentIntent = this.event.request.intent;

    Object.keys(this.event.request.intent.slots).forEach(function (slotName) {
        let currentSlot = this.event.request.intent.slots[slotName];
        let slotValue = slotHasValue(this.event.request, currentSlot.name);
        if (currentSlot.confirmationStatus !== 'CONFIRMED' &&
            currentSlot.resolutions &&
            currentSlot.resolutions.resolutionsPerAuthority[0]) {

            if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH') {
                // if there's more than one value that means we have a synonym that 
                // mapped to more than one value. So we need to ask the user for 
                // clarification. For example if the user said "mini dog", and 
                // "mini" is a synonym for both "small" and "tiny" then ask "Did you
                // want a small or tiny dog?" to get the user to tell you 
                // specifically what type mini dog (small mini or tiny mini).
                if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                    let prompt = 'Which would you like';
                    let size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                    currentSlot.resolutions.resolutionsPerAuthority[0].values.forEach(function (element, index, arr) {
                        prompt += ` ${(index == size -1) ? ' or' : ' '} ${element.value.name}`;
                    });

                    prompt += '?';
                    let reprompt = prompt;
                    // In this case we need to disambiguate the value that they 
                    // provided to us because it resolved to more than one thing so 
                    // we build up our prompts and then emit elicitSlot.
                    this.emit(':elicitSlot', currentSlot.name, prompt, reprompt);
                }
            } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH') {
                // Here is where you'll want to add instrumentation to your code
                // so you can capture synonyms that you haven't defined.
                console.log("NO MATCH FOR: ", currentSlot.name, " value: ", currentSlot.value);

                if (REQUIRED_SLOTS.indexOf(currentSlot.name) > -1) {
                    let prompt = "What " + currentSlot.name + " are you looking for";
                    this.emit(':elicitSlot', currentSlot.name, prompt, prompt);
                }
            }
        }
    }, this);
}

// Given the request an slot name, slotHasValue returns the slot value if one
// was given for `slotName`. Otherwise returns false.
function slotHasValue(request, slotName) {

    let slot = request.intent.slots[slotName];

    //uncomment if you want to see the request
    //console.log("request = "+JSON.stringify(request)); 
    let slotValue;

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