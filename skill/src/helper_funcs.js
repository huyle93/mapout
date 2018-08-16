var api = require('./API.js');

/**
 * To go from full name in slot to abbreviated code for carTheft
 * put two list together, compare and convert them to Abbreviate UpperCase
 * @param list   => to list out all the state and province, including Canada
 * @param input
 */
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
/**
 * Checks for Errors and whether or not they were fatal or not
 * Set the flag, to check error
 * @param {*} arr 
 */
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
/**
 * Formula to get the miles
 * @param {*} i 
 */
function getMiles(i) {
    return i * 0.000621371192;
}

/**
 * picks a random phrase from an array
 *  the argument is an array [] of words or phrases
 * @param {*} array 
 */
function randomPhrase(array) { 
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return (array[i]);
}

/**
 * List of all phrase that alexa will speak
 * Phoneme Alphabet to get the correct speech and improve alexa conversation
 * @param {*} deviceId 
 * @param {*} callback 
 */
function getWelcomeMessage( deviceId, callback ){
  const welcomeOutput = [
      "Hello. Your trip advisor is here. I know a lot of information. ",
      `Thank you for using <phoneme alphabet="ipa" ph="mæp.aʊt">Mapout</phoneme>. I am your own personal trip advisor. `,
      `Hi. Welcome to <phoneme alphabet="ipa" ph="mæp.aʊt">Mapout</phoneme>. In just a few steps I can help you plan for your trip. `,
  ]

  const needCarInfoPrompt = [
    `It appears you don't have any car data stored with us. If you would like to provide us with this to better estimate your trip say, 'Add Car Info', or if you want to just use a default value `,
    `It appears we don't have any information about your car. Having this information can help us better estimate your trip, say 'Add Car Info' to provide us with information, or if you would rather use a default value `
  ]

  const endOptions = [
    "you can start by saying let's plan a trip.",
    "to begin simply say, let's plan a trip.",
    "to start, say, let's plan a trip."
  ]


  /**
   * Invoke function to check whether user input their car information
   * to the database.
   */
  checkCarInfo( deviceId, (cb) => {
    var speechOutput = ""
    speechOutput += randomPhrase(welcomeOutput);
    if( cb[0] === 0 ){
      speechOutput += randomPhrase(needCarInfoPrompt)
    }
    speechOutput += randomPhrase(endOptions);
    callback([speechOutput])
  })
}

/**
 * Gets the final randomized message for the distance, duration, parking, gas, and possibly a theft warning
 * List out all the phrase that alexa will said to get the user wanted information
 * This will improve alexa conversationa, it would compare pull the information from API to get the 
 * accurate information for user.
 * @param {*} address 
 * @param {*} parking_name 
 * @param {*} parking_rating 
 * @param {*} durationtext 
 * @param {*} distancetext 
 * @param {*} gasCost 
 * @param {*} myCar 
 * @param {*} theftCar 
 */
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
/**
 * To check the car information to see whether it is empty or not
 * @param {*} deviceId => The deviceId for Alexa device
 * @param {*} cb => Call back?
 */
function checkCarInfo(deviceId, cb){
  console.log("In CarInfo")
  var make, model, year;
  api.httpsGet_CarInfo(deviceId, (car) => {
    if( car[0] === 0)
    {
      console.log("Should be here")
      cb([0]);
    }
    else {
      console.log("Should be here in");
      make = car[0];
      model = car[1];
      year = car[2];
      console.log( "Make: " + make + " Model: " + model + " Year: " + year)
      if( make == undefined || model == undefined || year == undefined )
      {
        cb([0]);
      }
      else {
        cb([1]);
      }
    }
  })
}

module.exports = { convertToAbbr, checkErrors, getMiles, randomPhrase, getFinalMessage, checkCarInfo, getWelcomeMessage }
