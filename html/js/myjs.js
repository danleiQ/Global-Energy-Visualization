/**
 * Created by pc on 2019/12/7.
 */
$(function () {
    $('.top-area').click(function () {
        $('html,body').animate({scrollTop: '0px'}, 800);
    });
    $(window).scroll(function () {
        var topp = $(document).scrollTop();
        if (topp <= 100) {
            $('.top-area').hide()
        } else {
            $('.top-area').show()

        }
    })
})