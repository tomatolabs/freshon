var redis = require('./redis');
var imServer = require('sockjs').createServer();
var logger = require('./logging').logger;
var IM = function(server){
    imServer.on('connection', function(conn) {
        console.debug('someone is connected to IM server');
        conn.on('data', function(event) {
            var e = JSON.parse(event);
            console.debug('someone write message: ' + e);
            console.debug( e.content + ' shake hand');

            if( e || e.event=='shakehand' ){
                var uid = e.content;
                redis.sadd("im-online-users", uid, function (err, reply) {
                    if(err){
                        logger.error(err);
                    }
                    logger.debug(reply);
                });
            }
            redis.smembers("im-online-users", function (err, value) {
                if(err){
                    logger.error(err);
                }
                logger.debug('online users: '+value);
                conn.write(value);
            });
            conn.write(e);
        });
        conn.on('close', function() {
            console.debug('someone is disconnected to IM server');
        });
    });
    imServer.installHandlers(server, {prefix:'/im'});
};
module.exports = IM;