const isFunction = obj => typeof obj === 'function';
const isObject = obj => obj && typeof obj === 'object';
const isThenable = obj => (isFunction(obj) || isObject(obj)) && 'then' in obj;
const isPromise = promise => promise instanceof MyPromise;

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 模拟微任务
// node.js 环境使用 process.nextTick
// 浏览器环境 使用 MutationObserver
function nextTick(callback) {
    if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
        process.nextTick(callback)
    } else {
        const observer = new MutationObserver();
        const textNode = document.createTextNode('1');
        observer.observe(textNode, { characterData: true });
        textNode.data = '2';
    }
}


function MyPromise(f) {
    this.result = null
    this.state = PENDING
    this.callbacks = []

    // 改变自身状态
    let onFulfilled = value => transition(this, FULFILLED, value);
    let onRejected = reason => transition(this, REJECTED, reason);

    let ignore = false;
    let resolve = value => {
        if (ignore) return
        ignore = true;
        resolvePromise(this, value, onFulfilled, onRejected)
    }

    let reject = reason => {
        if (ignore) return
        ignore = true;
        onRejected(reason)
    }

    try {
        f(resolve, reject)
    } catch (e) {
        reject(e)
    }
}
MyPromise.prototype.then = function (onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => { // 2.2.7  必须返回一个新的 promise
        let callback = { onFulfilled, onRejected, resolve, reject };//  前promise 的回调、 新promise 改变自己状态的钩子

        if (this.state === PENDING) {
            this.callbacks.push(callback)
        } else {
            nextTick(() => handleCallback(callback, this.state, this.result))
        }

    })

}

/**
 *  处理 then 、catch函数，添加的会调，前一个promise 改变状态后 执行callback 内容
 * @param {*} callback 
 * @param {*} state 
 * @param {*} result 
 */
const handleCallback = (callback, state, result) => {
    let { onFulfilled, onRejected, resolve, reject } = callback;
    try {
        if (state === FULFILLED) {
            isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result)

        } else if (state === REJECTED) {
            isFunction(onRejected) ? resolve(onRejected(result)) : reject(result) //? 如果没有处理错误 把错误传递下去
        }

    } catch (error) {
        reject(error)
    }
}

const handleCallbacks = (callbacks, state, result) => {
    while (callbacks.length) handleCallback(callbacks.shift(), state, result)

}

const transition = (promise, state, result) => {
    if (promise.state !== PENDING) return
    promise.state = state
    promise.result = result
    nextTick(() => handleCallbacks(promise.callbacks, state, result))
}


const resolvePromise = (promise, result, resolve, reject) => {
    if (result === promise) {
        let reason = new TypeError('Can not fufill promise with itself')
        return reject(reason)
    }
    if (isPromise(result)) {
        return result.then(resolve, reject)
    }
    if (isThenable(result)) {
        try {
            let then = result.then;
            if (isFunction(then)) {
                return new MyPromise(then.bind(result)).then(resolve, reject);//?
            }
        } catch (e) {
            return reject(e)
        }
    }

    resolve(result)
}

MyPromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
};

MyPromise.prototype.finally = function (callback) {
    return this.then(
        value => MyPromise.resolve(callback()).then(() => value),
        reason => MyPromise.resolve(callback()).then(() => { throw reason }), //不影响下个 then的调用
    )
};

MyPromise.resolve = function (v) {

    return new MyPromise(function (resolve) {
        resolve(v)
    })
};

MyPromise.reject = function (v) {

    return new MyPromise(function (resolve, reject) {
        reject(v)
    })
};



MyPromise.all = fucntion(iterable){
    if (iterable == null || typeof iterable[Symbol.iterator] !== 'function') {
        throw TypeError(iterable + ' is not iterable ')
    }

    let resolvedCount = 0;
    let result = [];

    return new MyPromise(function (resolve, reject) {

        function handleResolve(value, index) {
            result[index] = value;
            resolvedCount++;
            if (resolvedCount == iterable.length) {
                resolve(result);
            }
        }

        for (let i = 0; i < iterable.length; i++) {
            const element = iterable[i];

            if (element && typeof element.then === 'function') {
                element.then((value) => handleResolve(value, i), (reason) => reject(reason))
            } else {
                handleResolve(element, i);
            }

        }
    })
};

MyPromise.race = fucntion(iterable) {
    if (iterable == null || typeof iterable[Symbol.iterator] !== 'function') {
        throw TypeError(iterable + ' is not iterable ')
    }

    return new MyPromise(function (resolve, reject) {
        for (let i = 0; i < iterable.length; i++) {
            const element = iterable[i];

            if (element && typeof element.then === 'function') {
                element.then(resolve, reject)
            } else {
                resolve(element);
            }

        }
    })

}

MyPromise.allSettled = function (iterable) {
    if (iterable == null || typeof iterable[Symbol.iterator] !== 'function') {
        throw TypeError(iterable + ' is not iterable ')
    }

    let settledCount = 0;
    let result = [];

    return new MyPromise(function (resolve, reject) {

        for (let i = 0; i < iterable.length; i++) {
            const element = iterable[i];

            if (element && typeof element.then === 'function') {

                element.then(
                    (value) => {

                        result[i] = { status: 'fulfilled', value };
                        settledCount++;
                        if (settledCount == iterable.length) resolve(result);
                    },
                    (reason) => {
                        result[i] = { status: 'rejected', reason };
                        settledCount++;
                        if (settledCount == iterable.length) resolve(result);
                    }
                )
            } else {
                result[i] = { status: 'fulfilled', value: element };
                settledCount++;
                if (settledCount == iterable.length) resolve(result);
            }

        }
    })
}

// MyPromise.any 类似 all

// promises-tests adapter
MyPromise.deferred = MyPromise.defer = function () {
    var dfd = {}
    dfd.promise = new MyPromise(function (resolve, reject) {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

module.exports = MyPromise
