export default function useDeepClone() {
    return function deepClone(obj) {
        // 处理基本数据类型和 null
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
    
        // 处理数组
        if (Array.isArray(obj)) {
            const arrCopy = [];
            for (let item of obj) {
                arrCopy.push(deepClone(item));
            }
            return arrCopy;
        }
    
        // 处理对象
        const objCopy = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = deepClone(obj[key]);
            }
        }
        return objCopy;
    }
}