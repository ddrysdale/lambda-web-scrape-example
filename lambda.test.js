var lambda = require('./lambda');

lambda.handler({}, {}, function (err, result) {
    if (err) {
        return console.error(JSON.stringify(err));
    }
    console.log(result);
});