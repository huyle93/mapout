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
const welcome_Prompt = "Welcome to Fidelity MyMoney, what do you want to know today? You can ask for personal finance, investing tips or advice from Fidelity.";
// help prompt
const help_Prompt = "You can ask me for personal finance or investing tips. Say bye to exit.";
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
// Personal Finance Data
const personalFinanceArray = [
    // tip 1
    'You should try the simple 50, 15, 5 rule! Use 50% of your monthly take-home-pay towards basic necessities, like rent and groceries, 15% towards retirement savings, and 5% towards an emergency fund for unexpected costs. Then you can use the remaining 30% towards anything you would like!',
    // tip 2
    'If you’re new to personal finance, you should know that your budget may change each month. For instance, your budget might change if you’re a freelancer, self-employed or if you work on commissions. Your budget could also change as your utility bills vary from different seasons. So keep in mind that creating a budget is never a one-time event but it is necessary to ensure your financial security in the long run. ',
    // tip 3
    'There are few signs your budget needs an overhaul: 1. You survive paycheck to paycheck. 2. Credit cards are your savior. 3. Your salary has changed. 4. You keep using your savings. last but not least. You are unprepared for emergency financial needs. Whatever the expense, your budget should include an emergency category to accommodate for the unknown.'
];
// Investing Data
const investArray = [
    // tip 1
    'Did you know? One of the easiest ways to begin investing is to start saving for retirement. Time and compounding are the keys. You may need a lot of money to live in retirement. If you save a little bit of money over a long period of time, compounding returns could do a lot of the heavy lifting for you. As your savings earn a return, the returns are added to the original amount. As those returns earn returns of their own, your savings could snowball. It takes time for compounding to work so starting early is important.',
    // tip 2
    'Did you know that domestic stocks don’t always outperform international equities?  Stocks of companies based in the U.S. Have been on a tear in recent years—but that is not always the case. Historical performance over the past four decades shows that domestic and international stocks have moved in a cycle of alternating outperformance. So, next time, when you’re choosing what to invest next, don’t forget to check out some foreign equities. ',
    // tip 3
    'Risk is one of the most misunderstood areas of finance. so. lets take a moment to review what you should know : Financial risk and investing go hand in hand. First, you need to know what your risk tolerance is? . If you are risk-averse, you may be the type of person that keeps all your money in a savings account. If you are a riskier investor, you may take on too much risk by investing aggressively in stocks or other types of investments that have the potential for large returns. The danger with riskier investments too close to retirement is that you could compromise your financial stability by not having enough time to recoup your losses. Also, Know what your risk capacity is. Last but not least, Know what to do with risk. The truth is, risk is always present when it comes to your finances. There is no such thing as a risk-free investment. In fact, some risk must be present in order to receive a return, but you want to take smart, calculated risks that make the most sense in your situation.'
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
                    // AMAZON Built-In Intents
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
                        // Custom Intent
                    case "didNotUnderstand":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Woo, I did not hear it clear. ${help_Prompt} Can you say it again? `, false), {}
                            )
                        );
                        break;
                    case "getPersonalFinanceIntent":
                        var ranPersonalFinanceData = personalFinanceArray[Math.floor(Math.random() * personalFinanceArray.length)]
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Here is your personal finance tip: .${ranPersonalFinanceData}, ${endingPersonalFinance_Prompt}`, true), {}
                            )
                        );
                        break;

                    case "getInvestingIntent":
                        var ranInvestData = investArray[Math.floor(Math.random() * investArray.length)]
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`Here is your investing tip: . ${ranInvestData}, ${endingInvesting_Prompt}`, true), {}
                            )
                        );
                        break;

                        // Defination
                    case "getDef_error":
                        const errorInput = event.request.intent.slots.errorPhrase.value
                        var errorResponse = "";
                        if (errorInput === null) {
                            errorResponse = "it";
                        }
                        if (errorInput === undefined) {
                            errorResponse = "it";
                        } else {
                            errorResponse = errorInput;
                        }
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>Hmm, i heard about ${errorInput}. But the developer has not taught me the answer for this. Maybe check it next time and leave me a feedback so i can be smarter. ${re_Prompt} </speak>`, false), {}
                            )
                        );
                        break;
                    case "getDef_RiskCapacity":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>${invest_03_FollowUp}${secret_SSML}${open_account_Fid_Go_SSML}</speak>`, true), {}
                            )
                        );
                        break;

                    case "getDef_MutualFunds":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponseSSML(`<speak>${invest_02_FollowUp} </speak>`, true), {}
                            )
                        );
                        break;

                    case "getQuickAsk":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse(`what would you like to know?`, false), {}
                            )
                        );
                        break;

                        // Advance Feature
                        // Simple approach to budgetting
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
                    case "getCryptoPrice":
                        var symbol = event.request.intent.slots.assetName.value;
                        var endpoint = `https://api.coinmarketcap.com/v1/ticker/${symbol}/`;
                        var body = "";
                        https.get(endpoint, (response) => {
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