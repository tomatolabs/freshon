var sockjs = require('sockjs');
var redis = require('./redis');
var logger = require('./logging').logger;

var stringifyEvent = function(e){
    var str = '';
    try{
        str = JSON.stringify(e);
    }
    catch(error){
        logger.error('Fail to stringify event: ' + error);
    }
    return str;
};
var parseEvent = function(eventStr){
    var e = null;
    try{
        e = JSON.parse(eventStr);
    }
    catch(error){
        logger.error('Fail to parse event: ' + eventStr + '\r\n' + error);
    }
    return e;
};

var IMServer = function(server, options){
    this.connectionRegistry = {};
    this.openHandlers = [];
    this.closeHandlers = [];
    this.dataHandlers = {};
    this.connectionUsers = {};

    this.sockServer = sockjs.createServer();
    this.sockServer.installHandlers(server, {prefix: options.prefix});
    this.initialize();
    return this;
};
IMServer.prototype = {
    connectionRegistry: null,
    openHandlers: null,
    closeHandlers: null,
    dataHandlers: null,
    sockServer: null,

    mapConnectedUser: null,

    initialize: function(){
        this.enableDebugging();
        this.enableMessaging();
    },
    enableDebugging: function(){
        this.sockServer.on('connection', function(conn) {
            logger.debug( conn.id + ' is connected to IM server');
            conn.on('close', function() {
                logger.debug( conn.id + ' is disconnected to IM server');
            });
            conn.on('data', function(event) {
                logger.debug( conn.id + ' is sending message: ' + event);
            });
        });
    },
    enableMessaging: function(){
        var im = this;
        //Register all openHandlers
//        this.openHandlers.push(this.sayHello);

        //Register all closeHandlers
        this.closeHandlers.push(this.offline);

        //Register all dataHandlers: key is event type, value is handler
        this.dataHandlers['online'] = this.online;

        //Setup main socketjs event handler
        this.sockServer.on('connection', function(conn) {
            conn.on('data', function(message) {
                var event = parseEvent(message);

                //Check parsing
                if(!event) {
                    logger.error('Omit a message by failing to parse it');
                    return;
                }

                //Checking format
                if(!event.type || !event.content){
                    logger.error('Omit a message by its wrong format');
                    return;
                }

                //Check event and handler existence
                var handler = im.dataHandlers[event.type];
                if(!handler) {
                    logger.error('Omit an event by failing to handle it: ' + message);
                    return;
                }

                //Call handler
                try{
                    handler.call(im, conn, event);
                }
                catch(error){
                    logger.error('Fail to handle an event: ' + message + '\r\n' + error);
                }
            });
            conn.on('close', function() {
                //Call all close handlers in turn
                for(var i=0; i< im.closeHandlers.length; i++){
                    var closeHandler = im.closeHandlers[i];
                    if(!closeHandler){
                        continue;
                    }
                    //Call open handler
                    try{
                        closeHandler.call(im, conn);
                    }
                    catch(error){
                        logger.error('Fail to call open handler: ' + error);
                    }
                }
                im.unregisterConnection(conn);
            });
            im.registerConnection(conn);

            //Call all open handlers in turn
            for(var i=0; i< im.openHandlers.length; i++){
                var openHandler = im.openHandlers[i];
                if(!openHandler){
                    continue;
                }
                //Call open handler
                try{
                    openHandler.call(im, conn);
                }
                catch(error){
                    logger.error('Fail to call open handler: ' + error);
                }
            }
        });
    },
    registerConnection: function(conn){
        this.connectionRegistry[conn.id] = conn;
    },
    unregisterConnection: function(conn){
        if(conn && this.connectionRegistry[conn.id]){
            delete this.connectionRegistry[conn.id];
        }
    },
    broadcast: function(message, conn){
        var cnnMap = this.connectionRegistry;
        var exclude = conn ? true : false;
        for(var id in cnnMap){
            if(exclude && id == conn.id) {
                continue;
            }
            if(!cnnMap[id]){
                logger.warn( 'Socket connection ' + id + ' is deleted!' );
                continue;
            }
            cnnMap[id].write(message);
        }
    },
    online: function(conn, event){
        var uid = event.content;

        //Broadcast that the user go online
        var userOnline = {
            type: 'user-online',
            content: uid
        };
        this.broadcast(stringifyEvent(userOnline), conn);

        this.mapConnectedUser(conn, uid);
        //Store the current user who just went online
        redis.sadd("im-online-users", uid, function (err, reply) {
            if(err){
                logger.error(err);
                return; //TODO: Need specific error handling code
            }
            if(reply==0){
                logger.warn('User ' + uid + ' go online again with different user agent');
            }
            else{
                logger.debug('User ' + uid + ' go online successfully');
            }
        });

        //Load online users and send then back
        redis.smembers("im-online-users", function (err, value) {
            if(err){
                logger.error(err);
                return;//TODO: Need specific error handling code
            }
            logger.debug('online users: '+value);
            var e = {
                type: "im-online-users",
                content: value
            }
            conn.write( stringifyEvent(e) );
        });
    },
    mapConnectedUser: function(conn, uid){
        this.connectionUsers[conn.id] = uid;
    },
    unmapConnectedUser: function(conn){
        delete this.connectionUsers[conn.id];
    },
    getConnectedUser: function(conn){
        return this.connectionUsers[conn.id];
    },
    sayHello: function(conn){
        logger.info('say Hello world!');
    },
    offline: function(conn){
        var uid = this.getConnectedUser(conn);

        //Store the current user who just went online
        redis.srem("im-online-users", uid, function (err, reply) {
            if(err){
                logger.error(err);
                return; //TODO: Need specific error handling code
            }
            if(reply==0){
                logger.warn('User ' + uid + ' go offline again with different user agent');
            }
            else{
                logger.debug('User ' + uid + ' go offline successfully');
            }
        });

        //Broadcast that a user who just disconnected go offline
        var userOffline = {
            type: 'user-offline',
            content: uid
        };
        this.broadcast(stringifyEvent(userOffline), conn);
        this.unmapConnectedUser(conn);
    }
};

module.exports = IMServer;