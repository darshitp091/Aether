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
        // We use a slight delay or requestAnimationFrame to ensure the scroll happens
        // after the new page content has at least started rendering, though simple
        // scrollTo(0,0) usually works fine with React Router.
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
