module.exports = function() {
    return {
        succeed: function(result) {
            console.log(JSON.stringify(result, null,'\t') );
        },
        fail: function(err) {
            console.log(JSON.stringify(err, null,'\t') );
        },
        done: function(err, result) {
            //console.log("CONTEXT DONE:", err, result);
        },
        functionName: 'local_functionName',
        awsRequestId: 'local_awsRequestId',
        logGroupName: 'local_logGroupName',
        logStreamName: 'local_logStreamName',
        clientContext: 'local_clientContext',
        identity: {
            cognitoIdentityId: 'local_cognitoIdentityId'
        }
    };
};