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
                    case "getGeocode":
                        var address = event.request.intent.slots.places.value;
                        var make = 'honda'
                        var model = 'civic'
                        var year = '2010'
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
                                                    buildSpeechletResponse(`you are fucked`, true)
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
                    case "getCryptoPrice":
                        var symbol = event.request.intent.slots.assetName.value;
                        var endpointGeocode = `https://api.coinmarketcap.com/v1/ticker/${symbol}/`;
                        var body = "";
                        https.get(endpointGeocode, (response) => {
                            response.on('data', (chunk) => {
                                body += chunk;
                            });
                            response.on('end', () => {
                                var data = JSON.parse(body);
                                var cryptoPrice = Math.ceil(data[0].price_usd);
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(`Current price of ${symbol} is ${cryptoPrice} dollar. ${re_Prompt}`, false), {}
                                    )
                                );
                            });
                        });
                        break;
                    case "getAdvice":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>We have budgeting advice and retirement advice, which one do you want to know? </speak>`, false), {}
                            )
                        );
                        break;
                    case "getBudgetingAdvice":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>Sure. We make this is your confidential information, we will not share this information with anyone else. I need to know your yearly income. Please tell me what is your yearly income? </speak>`, false), {}
                            )
                        );
                        break;
                    case "getAdviceFromIncome":
                        var incomeReturn = event.request.intent.slots.income.value
                        var income = ""
                        var failedMessage = "Hmm, i could not hear it clear. Can you repeat your income again?"
                        if (incomeReturn === null) {
                            context.succeed(
                                generateResponse(
                                    buildSpeechletResponse(failedMessage, false)
                                )
                            );
                        }
                        if (incomeReturn === undefined) {
                            context.succeed(
                                generateResponse(
                                    buildSpeechletResponse(failedMessage, false)
                                )
                            );
                        } else {
                            if (isNaN(incomeReturn)) {
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(failedMessage, false)
                                    )
                                );
                            } else {
                                income = incomeReturn;
                                /* Math */
                                var expense_50 = Math.ceil(income * 50 / 100);
                                var retirement_saving_15 = Math.ceil(income * 15 / 100);
                                var short_term_saving_5 = Math.ceil(income * 5 / 100);
                                var sum = Math.ceil(expense_50 + retirement_saving_15 + short_term_saving_5);
                                var leftover = Math.ceil(income - sum);
                                // output speech
                                var incomeAdviceOutput = `Great. Base on your income of ${income} dollars. We suggest you should spend around or less than ${expense_50} dollars for essential expenses. Put around ${retirement_saving_15} to your retirement account. If you dont have one, open one now. Around ${short_term_saving_5} dollars from your income can go toward a short term saving account. The leftover money of around ${leftover} dollars, you can spend for anything you want like foods, or hobbies. ${re_Prompt}`;
                                // output to app
                                var incomeAdvice_CardOutput = `Base on your income of $${income} dollars. You should spend: \r\n + Around or less than $${expense_50} dollars for essential expenses. \n + Put around $${retirement_saving_15} to your retirement account. Open one now if you dont have. \n + Around $${short_term_saving_5} dollars from your income can go toward a short-term saving account. \n + The leftover money of around $${leftover} dollars can be for anything you want like hobbies. \n => To Open a Retirement or Saving account, visit Fidelity.com/open-account `;
                                /* Output */
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponseWithCard('Fidelity Budgeting Advice', incomeAdvice_CardOutput, incomeAdviceOutput, false), {}
                                    )
                                );
                            }
                        }
                        break;
                        // \\\\\\\\\\\\\\\\\\\\\\\\ CARD RESPONSE /////////////////////////
                    case "openAccount":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseWithCard(`Open Retirement Account`, `Here the link to open a retirement account with Fidelity: Fidelity.com/open-account/retirement`, ` check your amazon alexa app, we just send you the link to open an account. `, true), {}
                            )
                        );
                        break;
                    case "getAdviceRetirement":
                        var income_retirement = event.request.intent.slots.myincome.value;
                        var myAge_retirement = event.request.intent.slots.myage.value;
                        var contribution_retirement = event.request.intent.slots.contribution.value;
                        failedMessage = "Hmm, i could not hear it clear. Can you repeat your age, income and contribution again?";
                        if (income_retirement && myAge_retirement && contribution_retirement === null) {
                            context.succeed(
                                generateResponse(
                                    buildSpeechletResponse(failedMessage, false)
                                )
                            );
                        }
                        if (income_retirement && myAge_retirement && contribution_retirement === undefined) {
                            context.succeed(
                                generateResponse(
                                    buildSpeechletResponse(failedMessage, false)
                                )
                            );
                        } else {
                            if (isNaN(income_retirement && myAge_retirement && contribution_retirement)) {
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(failedMessage, false)
                                    )
                                );
                            } else {
                                var num_income_retirement = income_retirement;
                                var num_myAge_retirement = myAge_retirement;
                                var num_contribution_retirement = contribution_retirement;
                                var annualRate = 5 / 100;
                                var monthlyRate = annualRate / 12 / 100;
                                /* MATH */
                                var investment = Math.ceil(num_income_retirement * num_contribution_retirement) / 100;
                                var months = Math.ceil((65 - num_myAge_retirement) * 12);
                                var futureValue = Math.ceil(investment * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
                                /* Output Speech */
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(futureValue, false)
                                    )
                                );
                            }
                        }
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