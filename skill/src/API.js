var https = require('https');
require('dotenv').load();
const Alexa = require('alexa-sdk');

// API KEYS
var matrix_key = process.env.MATRIX_KEY
var shine_key = process.env.SHINE_KEY
var googleplace_key = process.env.GOOGLEPLACE_KEY
var google_key = process.env.GOOGLE_KEY
var gas_key = process.env.GAS_KEY

//Gets Address of the device from Amazon
function GetCurrentAddress( deviceId, callback) {
    if(this.event.context.System.user.permissions) {
      const token = this.event.context.System.user.permissions.consentToken;
      const apiEndpoint = this.event.context.System.apiEndpoint;
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
function httpsGet_Matrix(start_lat, start_long, lat, long, callback) {
  // Update these options with the details of the web service you would like to call
  var hold = this
  var options = {
    host: 'maps.googleapis.com',
    port: 443,
    path: `/maps/api/distancematrix/json?units=imperial&origins=${start_lat},${start_long}&destinations=${lat}%2C${long}&key=` + matrix_key,
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

//Posts the Coordinates to a database
function httpsPut_Cooridinates(deviceId, lat, long, callback ) {
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
      console.log("Should have written")
      put_req.end();
      callback();
}

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

module.exports = { GetCurrentAddress, httpsGet_Geocode, httpsGet_Matrix, httpsGetStats, httpsGet_CarTheft, get_price, httpsGetmyGoogleplace, httpsPut_Cooridinates, httpsPut_UserInfo, httpsPut_CarInfo, httpsGet_UserName, httpsGet_CarInfo }
