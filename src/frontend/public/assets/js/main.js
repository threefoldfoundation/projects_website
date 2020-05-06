/*
	Future Imperfect by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

    var $window = $(window),
        $body = $('body'),
        $menu = $('#menu'),
        $sidebar = $('#sidebar'),
        $main = $('#main');

    // Breakpoints.
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: [null, '480px']
    });

    // Play initial animations on page load.
    $window.on('load', function() {
        window.setTimeout(function() {
            $body.removeClass('is-preload');
        }, 100);
    });

    // Menu.
    $menu
        .appendTo($body)
        .panel({
            delay: 500,
            hideOnClick: true,
            hideOnSwipe: true,
            resetScroll: true,
            resetForms: true,
            side: 'right',
            target: $body,
            visibleClass: 'is-menu-visible'
        });

    // Search (header).
    $body
        .on('click', '[href="#search"]', function(event) {
            var $search_input = $('#search_input');

            event.preventDefault();

            // Not visible?
            if (!$search_input.hasClass('visible')) {

                // Reset form.
                // $search_input[0].reset();

                // Show.
                $search_input.addClass('visible');

                // Focus input.
                $search_input.focus();

            }
        });

    $body
        .on('keydown', '#search_input', function(event) {
            if (event.keyCode == 27) {
                $(this).blur();
            } else if (event.keyCode == 13) {
                $(this).blur();
                window.location.href = '#/search/' + $(this).val()
                $(this).val('');
            }

        })
        .on('blur', function() {
            var $search_input = $('#search_input');
            window.setTimeout(function() {
                $search_input.removeClass('visible');
            }, 100);
        });

    // Intro.
    var $intro = $('#intro');

    // Move to main on <=large, back to sidebar on >large.
    breakpoints.on('<=large', function() {
        $intro.prependTo($main);
    });

    breakpoints.on('>large', function() {
        $intro.prependTo($sidebar);
    });

})(jQuery);