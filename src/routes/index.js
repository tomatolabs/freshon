var logger = require('../../lib/logging').logger;
var util = require('../../lib/util');

module.exports = function(app) {
    app.get('/', function(req, res) {
        var input = {};
        util.apply(input, req.asset || {});
        res.render('index', input);
    });
};