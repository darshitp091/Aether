import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that the page is scrolled to the top
 * whenever the route changes. This provides a better user experience
 * when navigating between different pages.
 */
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // requestAnimationFrame ensures we scroll after the next paint,
        // which helps if the page is still rendering or the browser is 
        // trying to restore scroll position.
        const resetScroll = () => {
            window.scrollTo(0, 0);
            // Double tap for stubborn browsers/animations
            setTimeout(() => window.scrollTo(0, 0), 0);
        };

        requestAnimationFrame(resetScroll);
    }, [pathname]);

    return null;
}
