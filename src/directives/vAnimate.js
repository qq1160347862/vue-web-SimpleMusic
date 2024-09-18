export default {
    mounted(el, binding) {             
        const { value } = binding;   
        if (!value) return;
        if (value.animateClass){
            el.classList.add(value.animateClass);
        }
        if (value.name) {
            el.style.animationName = value.name;
        }
        if (value.duration) {
            el.style.animationDuration = value.duration +'s';
        }
        if (value.timingFunction) {
            el.style.animationTimingFunction = value.timingFunction;
        }
        if (value.delay) {
            el.style.animationDelay = value.delay +'s';
        }
        if (value.iterationCount) {
            el.style.animationIterationCount = value.iterationCount;
        }
        if (value.direction) {
            el.style.animationDirection = value.direction;
        }
        if (value.fillMode) {
            el.style.animationFillMode = value.fillMode;
        }
    },
    updated(el, binding) {
        const { value } = binding;
        if (!value) return;
        if (value.animateClass){
            el.classList.add(value.animateClass);
        }
        if (value.name) {
            el.style.animationName = value.name;
        }
        if (value.duration) {
            el.style.animationDuration = value.duration +'s';
        }
        if (value.timingFunction) {
            el.style.animationTimingFunction = value.timingFunction;
        }
        if (value.delay) {
            el.style.animationDelay = value.delay +'s';
        }
        if (value.iterationCount) {
            el.style.animationIterationCount = value.iterationCount;
        }
        if (value.direction) {
            el.style.animationDirection = value.direction;
        }
        if (value.fillMode) {
            el.style.animationFillMode = value.fillMode;
        }
    },
    beforeUnmount(el) {
        el.style.animation = 'none';
    }
};