//    防抖（回泉水时间）     //////////////////////////////////////////////////////////////////////////////////////////////////
//  可以无限触发 但是在的一定延迟后菜生效， 已最新出发的事件为准
// 例如 window 的 resize scroll 

// 函数要求 第一次可立即执行 ， 可取消
function debounce(fn, time, immediate) {

    let timeout, result;
    function debounced() {
        const context = this;
        const args = arguments;
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(function () {
                timeout = null
            }, wait)
            if (callNow) result = fn.apply(this, arguments);

        } else {
            timeout = setTimeout(() => {
                fn.apply(this, arguments);
            }, time)
        }

        return result;
    }
    debounced.cancle = function () {
        clearTimeout(timeout);
        timeout = null;
    }

    return debounced;
}




//    节流（cd时间）        //////////////////////////////////////////////////////////////////////////////////////////////////
// 定时器 时间没到不给执行
// 要求； 能立马出发 停止出发执行多一次
/**
 * 
 * @param {*} fn 
 * @param {*} wait 
 * @param {*} option  {leading: 控制进去出发，trailing：控制结束触发} 两者不能同时设置false.
 */
function throttle(fn, wait, options = {}) {

    let timeout, context, args, result;
    let previous = 0;


    const later = function () {
        previous = option.leading === false ? 0 : new Date().getTime() //设置 0 在下面throttled 才会记录 now 才不会立即执行
        timeout = null;
        fn.apply(constext, args);
        if (!timeout) context = args = null;
    }

    function throttled() {

        const now = new Date().getTime();
        if (!previous && option.leading === false) previous = now; // 第一次进来 并且不需要执行第一次方法 ， 设定时间 开始定时
        let remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) { // 距离上一次调用时间  不用等待
            if (timeout) {
                clearTimeout(timeout)
                timeout = null;
            }
            previous = now;
            fn.apply(context, args);
            if (!timeout) constext = args = null;

        } else if (!timeout && options.trailing !== false) { //每次调用当成最后一次调用， 并设定剩余时间的定时器
            timeout = setTimeout(later, remaining);
        }

    }
    throttled.cancel = function () {
        clearTimeout(timeout);
        previous = 0;
        timeout = null;
    }
    return throttled;
}