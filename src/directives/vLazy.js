let lazyImages = [];
const iObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            iObserver.unobserve(img);
        }
    });
},{
    root: null,
    threshold: 0.5,
    rootMargin: '0px'
});

export default {
    mounted(el, binding) {
        const imgDoms = el.querySelectorAll('img.lazy');
        if (imgDoms.length === 0) return;
        lazyImages = [...imgDoms];
        lazyImages.forEach((img) => {
            iObserver.observe(img);
        });
    },
    updated(el, binding) {
        const imgDoms = el.querySelectorAll('img.lazy');
        if (imgDoms.length === 0) return;
        lazyImages = [...imgDoms];
        lazyImages.forEach((img) => {
            iObserver.observe(img);
        });
    },
    unMounted(el, binding) {
        iObserver.disconnect();
        if (lazyImages.length === 0) return;
        lazyImages.forEach((img) => {
            iObserver.unobserve(img);
        });        
    }
}