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

//Gets distance in miles
function getMiles(i) {
    return i * 0.000621371192;
}

function randomPhrase(array) { //picks a random phrase from an array
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return (array[i]);
}

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

module.exports = { convertToAbbr, checkErrors, getMiles, randomPhrase, getFinalMessage }
