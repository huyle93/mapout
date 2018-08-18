var lambda = require('./debug');
var context = require('./context.js');
var mockEvent = require('./ask.json');

var mockContext = new context();

function callback(error, data) {
  if(error) {
      console.log('error: ' + error);
  } else {
      console.log(data);
  }
}

lambda.handler(mockEvent, mockContext, callback);