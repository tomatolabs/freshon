module.exports = {
    id: 'fo',
    name: 'freshon',
    creator: '番茄实验室',
    secretKey: 'quick',
    mongo:{
        db: 'favor',
        host: 'localhost',
        port: 27017
    },
    redis:{
        host: 'localhost',
        port: 6379
    },
    session: {
        storeType: 'redis',
        expires: 60 // minutes
    },
    logging: {
        reloadSecs: 0, //INFO: set 0 could let nodeunit tests which use log4js exit properly
        level: 'DEBUG'
    },
    resources: {
        appName: 'freshon',
        appTitle: 'freshon -- fresh info on it',
        appCreator: '番茄实验室',
        errorUnknown: 'unknown error'
    }
}
;
