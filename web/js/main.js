require.config({
    baseUrl: './web/js',
    shim: {
        'jQuery': {
            exports: '$'
        },
        'Underscore': {
            exports: '_'
        },
        'Backbone': {
            deps: ['Underscore', 'jQuery'],
            exports: 'Backbone'
        },
        'Bootstrap': {
            deps: ['jQuery']
        },
        'Sockjs': {
            exports: 'SockJS'
        },
        'Util': {
            deps: ['jQuery']
        }
    },
    paths: {
        requireLib : '../../public/components/requirejs/require',
        jQuery: '../../public/components/jquery/jquery',
        Underscore: '../../public/components/underscore/underscore',
        Backbone: '../../public/components/backbone/backbone',
        Bootstrap: '../../public/components/bootstrap-tl/tl/js/bootstrap',
        Sockjs: '../../public/components/sockjs/sockjs',
        Util: 'util',
        App: 'app'
    },
    deps: ['App', 'Util'],
    callback: function(){
    },
    preserveLicenseComments: false
});