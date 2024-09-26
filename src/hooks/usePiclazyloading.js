export default function usePiclazyloading(root = null, rootMargin = '0px', threshold = 0) {
    if (typeof IntersectionObserver === 'undefined') {
        return () => {};
    }
    const observedElements = new Set();
    const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            io.unobserve(img);
        }
    });
    }, {
        root,
        rootMargin,
        threshold,
    });

    const lazyload = (el) => {        
        observedElements.add(el);
        io.observe(el);
    };

    const unlazyloadAll = () => {
        if (observedElements.size === 0) {
            return;
        }
        observedElements.forEach((el) => {
            io.unobserve(el);
        });
        observedElements.clear();
    };

    return {
        lazyload,
        unlazyloadAll,
    }
}