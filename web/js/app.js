define( ['Bootstrap', 'jQuery', 'Sockjs'], function (Bootstrap, $, SockJS) {
    $('ul li.message a').mouseup(function(){
        var p = $(this).parent();
        if(p.hasClass('active')){
            p.removeClass('active');
        }
        else{
            p.addClass('active');
        }
    });

    var sock = new SockJS('http://localhost:3030/im');
    var im = {ready:false};
    sock.onopen = function() {
        console.log('open');
        im.ready = true;
        sock.send('hello world');
    };
    sock.onmessage = function(e) {
        console.log('message: ', e.data);
        console.log('message: ', e);
    };
    sock.onclose = function() {
        console.log('close');
    };
    return null;
});