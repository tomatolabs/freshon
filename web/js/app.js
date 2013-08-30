define( ['Bootstrap', 'Backbone', 'jQuery', 'Sockjs'], function (Bootstrap, Backbone, $, SockJS) {
    $('ul li.message a').mouseup(function(){
        var p = $(this).parent();
        if(p.hasClass('active')){
            p.removeClass('active');
        }
        else{
            p.addClass('active');
        }
    });

    var im = new Backbone.Router({
        routes: {
            "im": "message"
        },
        message: function(){
            alert('asdfa');
            //$('ul li.message a').click();
        }
    });
    var appRoot = "/";
    $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") }; // Get the absolute anchor href.
        var root = location.protocol + "//" + location.host + appRoot; // Get the absolute root.

        // Ensure the root is part of the anchor href, meaning it's relative.
        if (href.prop.slice(0, root.length) === root) {
            evt.preventDefault();

            /* `Backbone.history.navigate` is sufficient for all Routers and will
             * trigger the correct events. The Router's internal `navigate` method
             * calls this anyways.  The fragment is sliced from the root.
             */
            Backbone.history.navigate(href.attr, true);
        }
    });
    im.navigate();
    Backbone.history.start({pushState: true, hashChange: true});

    var sock = new SockJS('http://localhost:3030/on');
    sock.onopen = function() {
        console.log('open');
        var uid = $('#userid').val();
        var onlineEvent = {type: 'online', content: uid};
        sock.send( JSON.stringify(onlineEvent) );
    };
    sock.onmessage = function(e) {
        console.log('message: ', e.data);
    };
    sock.onclose = function() {
        console.log('close');
    };
    return im;
});