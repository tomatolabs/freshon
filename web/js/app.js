define( ['Bootstrap', 'jQuery'], function (Bootstrap, $) {
    $('ul li.message a').mouseup(function(){
        var p = $(this).parent();
        if(p.hasClass('active')){
            p.removeClass('active');
        }
        else{
            p.addClass('active');
        }
    });
});