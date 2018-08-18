var https = require('https');
require('dotenv').load();
const Alexa = require('alexa-sdk');

////////////////////////////////////////////////////////////////////////////////
//    All the API call functions are stored here.
//    -GetCurrentAddress: Gets Address of the device from Amazon
//    -httpsGet_Geocode: Gets the latitude and longitude given a place
//    -httpsGet_Matrix: Gets the estimated time and distance of your trip
//    -httpsGetStats: Gets the mpg of the user car
//    -httpsGet_CarTheft: Gets the most commonly stolen car in the state you are traveling to
//    -get_price: Gets average gas price around the starting location of the user
//    -httpsGetmyGoogleplace: Gets the lat, long, rating, and name of the closest parking to a location
//    -httpsPut_Cooridinates: Posts the Coordinates to our database
//    -httpsPut_UserInfo: Posts info such as first name of user to personalize their experience to our database
//    -httpsPut_CarInfo: Posts the make, model, and year of the users car to use to get the mpg to our database
//    -httpsGet_UserName: Gets the name of the user to personalize their welcome message from our database
//    -httpsGet_CarInfo: Gets the make, model and year from our database
////////////////////////////////////////////////////////////////////////////////


// API KEYS hidden by env file
var matrix_key = process.env.MATRIX_KEY
var shine_key = process.env.SHINE_KEY
var googleplace_key = process.env.GOOGLEPLACE_KEY
var google_key = process.env.GOOGLE_KEY
var gas_key = process.env.GAS_KEY

/**
 * Gets Address of the device from Amazon
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {function} callback => callback to return the data we got from the api
 */
function GetCurrentAddress( deviceId, callback) {
    //Checks to see if we have location permissions and if not requests them from the user.
    if(this.event.context.System.user.permissions) {
      const token = this.event.context.System.user.permissions.consentToken; //the actual token to say we may have permission
      const apiEndpoint = this.event.context.System.apiEndpoint; //Unique endpoint of the API
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

/**
 * Gets the latitude and longitude given a place
 * @param {string} address => The adress or place we will find the geocode for
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGet_Geocode(address, callback) {
  var hold = this;

  var options = {
    host: 'maps.googleapis.com',
    port: 443,
    path: `/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=` + google_key,
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

/**
 * Gets the estimated time and distance of your trip
 * @param {long} start_lat => The latitude that the trip starts at
 * @param {long} start_long => The longitude that the trip starts at
 * @param {long} end_lat => The latitude that the trip ends at
 * @param {long} end_long => The longitude that the trip ends at
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGet_Matrix(start_lat, start_long, end_lat, end_long, callback) {
  var hold = this
  var options = {
    host: 'maps.googleapis.com',
    port: 443,
    path: `/maps/api/distancematrix/json?units=imperial&origins=${start_lat},${start_long}&destinations=${end_lat}%2C${end_long}&key=` + matrix_key,
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
              console.error("There was a problem with the api call Matrix");
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

/**
 * Gets the mpg of the user car
 * @param {string} make => The make of the users car
 * @param {string} model => The model of the users car
 * @param {int} year => The model year of the users car
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGetStats(make, model, year, callback){
  var hold = this

  var year_over_2010 = year //Shine API only has data for 2010 and above
  if(year < 2010 ) //If the model year is less than 2010 set it to be 2010 to get most accurate data available
  {
    year_over_2010 = 2010
  }

  var stats_options = {
    host: 'apis.solarialabs.com',
    path: '/shine/v1/vehicle-stats/specs?make=' + make + '&model=' + model + '&year=' + year_over_2010 + '&full-data=true&apikey=' + shine_key,
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

/**
 * Gets the most commonly stolen car in the state you are traveling to
 * @param {string} state => The state that will be traveled to
 * @param {function} callback => callback to return the data we got from the api
 */
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
          console.error("There was a non fatal error. Using a default value");
          callback([1, "", ""]); //here is an example of a non-fatal error signaled with a "1". The other variables are just to fill the callback
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

/**
 * MyGasFeed gets average price of gas around the starting location
 * @param {long} lat => The latitude the trip will start at
 * @param {long} long => The longitude the trip will start at
 * @param {function} callback => callback to return the data we got from the api
 */
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

/**
 * Gets the lat, long, rating, and name of the closest parking to a location
 * @param {long} lat => The latitude the trip will end at
 * @param {long} long => The longitude the trip will end at
 * @param {string} rankby => Tells what order to display the results in (distance or prominence)
 * @param {string} types => The api can find many different types of places. For our skill this will find parking
 * @param {function} callback => callback to return the data we got from the api
 */
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
          console.error("There was a problem with the api call googlePlace");
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

/**
 * Posts the Coordinates to our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {long} lat => The latitude the trip will start at. This will be posted to our database
 * @param {long} long => The longitude the trip will start at. This will be posted to our database
 */
function httpsPut_Cooridinates(deviceId, lat, long ) {
    put_data = {
      "lat" : lat,
      "long" : long
    }

    var put_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/Coordinates/.json`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(put_data))
        }
    };

      var put_req = https.request(put_options, res => {
      });

      put_req.on('error', function(err) {
      });

      put_req.write(JSON.stringify(put_data));
      put_req.end();
      callback();
}

/**
 * Posts info such as first name of user to personalize their experience to our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {int} code => the postal code of the user. This will be posted to our database
 * @param {string} state => the starting state of the user. This will be posted to our database
 * @param {string} city => the starting city of the user. This will be posted to our database
 */
function httpsPut_UserInfo(deviceId, code, state, city ) {
    put_data = {
      "Address" : {
        "Code" : code,
        "State" : state,
        "City" : city
      }
    }

    var put_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/UserInfo/.json`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(put_data))
        }
    };

      var put_req = https.request(put_options, res => {
      });

      put_req.on('error', function(err) {
      });

      put_req.write(JSON.stringify(put_data));
      console.log("Should have written")
      put_req.end();
}

/**
 * Posts the make, model, and year of the users car to use to get the mpg to our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {string} make => the make of the users car. This will be posted to our database
 * @param {string} model => the model of the users car. This will be posted to our database
 * @param {int} year => the model year of the users car. This will be posted to our database
 */
function httpsPut_CarInfo(deviceId, make, model, year) {
    put_data = {
      "Make" : make,
      "Model" : model,
      "Year" : year
    }

    var put_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/CarInfo/.json`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(put_data))
        }
    };

      var put_req = https.request(put_options, res => {
      });

      put_req.on('error', function(err) {
      });

      put_req.write(JSON.stringify(put_data));
      put_req.end();
}

/**
 * Posts the make, model, and year of the users car to use to get the mpg to our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {string} state => the state the user is traveling to today. This will be posted to our database
 */
function httpsPut_ToState(deviceId, state) {
    put_data = {
      "State" : state,
    }

    var put_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/ToState/.json`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(put_data))
        }
    };

      var put_req = https.request(put_options, res => {
      });

      put_req.on('error', function(err) {
      });

      put_req.write(JSON.stringify(put_data));
      put_req.end();
}

/**
 * Gets the name of the user to personalize their welcome message from our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGet_UserName(deviceId, callback) {
    var get_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/UserInfo/.json`,
        method: 'GET'
    };

    var get_req = https.request(get_options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk =>  {
            returnData += chunk;
        });
        res.on('end', () => {
            // this particular API returns a JSON structure:
            // returnData: {"usstate":"New Jersey","population":9000000}
            //console.log( returnData )
            var name = JSON.parse(returnData).Name
            console.log(name);
            callback([name]);
        });
    });

    get_req.end();
}

/**
 * Gets the make, model and year from our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGet_CarInfo(deviceId, callback) {
    var get_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/CarInfo/.json`,
        method: 'GET'
    };

    var get_req = https.request(get_options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk =>  {
            returnData += chunk;
        });
        res.on('end', () => {
          try{
            var make = JSON.parse(returnData).Make
            var model = JSON.parse(returnData).Model
            var year = JSON.parse(returnData).Year
            callback([make, model, year]);
          }
          catch(error) {
            console.error("No info exists yet");
            callback([0]);
          }
        });
    });

    get_req.end();
}

/**
 * Gets the name of the user to personalize their welcome message from our database
 * @param {string} deviceId => The deviceId for Alexa device
 * @param {function} callback => callback to return the data we got from the api
 */
function httpsGet_ToState(deviceId, callback) {
    var get_options = {
        host:  'mapout-mockdb-4ead8.firebaseio.com',
        port: '443',
        path: `/${deviceId}/ToState/.json`,
        method: 'GET'
    };

    var get_req = https.request(get_options, res => {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', chunk =>  {
            returnData += chunk;
        });
        res.on('end', () => {
            try{
              var state = JSON.parse(returnData).State
              callback([state]);
            }
            catch(error) {
              console.error("There was a problem with the api call googlePlace");
              callback(["ERROR"]); //here is an example of a fatal error signaled with a "2". The other variables are just to fill the callback
            }
        });
    });

    get_req.on('error', function(err) {
       /*hold.response.speak('I\'m sorry. Something went wrong. In httpsGetmyGoogleplace');
       hold.emit(':responseReady');*/
    });

    get_req.end();
}

module.exports = { GetCurrentAddress, httpsGet_Geocode, httpsGet_Matrix, httpsGetStats, httpsGet_CarTheft, get_price, httpsGetmyGoogleplace, httpsPut_Cooridinates, httpsPut_UserInfo, httpsPut_CarInfo, httpsPut_ToState, httpsGet_UserName, httpsGet_CarInfo, httpsGet_ToState }
