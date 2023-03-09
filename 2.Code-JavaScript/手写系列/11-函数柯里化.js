//函数柯里化
// 一个函数转化为 每次只传一个参数的函数，参数够了执行, 并且支持占位符

// function carry(func, ...args) {
//     const len = func.length;

//     let allArgs = args || []

//     return function (...args) {

//         allArgs = [...allArgs, ...args];

//         if (allArgs.length < len) {

//             return carry.call(this, func, ...allArgs)

//         } else {
//             return func.apply(this, allArgs);
//         }

//     }
// }
////////////////////////////////////////////// 高颜值柯里化
var curry = fn =>
    judge = (...args) =>
        args.length === fn.length
            ? fn(...args)
            : (arg) => judge(...args, arg)



function curry(fn) {
    let judge = (...args) => {
        if (args.length == fn.length) return fn(...args)
        return (...arg) => judge(...args, ...arg)
    }
    return judge
}



////////////////////////////////////////////// 柯里化 +偏函数 +占位符 
/**
 * 带占位符的 curry 函数
 * @param {*} fn 
 * @param {*} args 
 * @param {*} holes 占位符在arg中的 index
 * @returns 
 */
function curry(fn, args, holes) {
    length = fn.length;

    args = args || [];

    holes = holes || [];

    return function () {

        var _args = args.slice(0),
            _holes = holes.slice(0),
            argsLen = args.length,
            holesLen = holes.length,
            arg, i, index = 0;

        for (i = 0; i < arguments.length; i++) {
            arg = arguments[i];
            // 处理类似 fn(1, _, _, 4)(_, 3) 这种情况，index 需要指向 holes 正确的下标
            if (arg === _ && holesLen) {
                index++
                if (index > holesLen) {
                    _args.push(arg);
                    _holes.push(argsLen - 1 + index - holesLen)
                }
            }
            // 处理类似 fn(1)(_) 这种情况
            else if (arg === _) {
                _args.push(arg);
                _holes.push(argsLen + i);
            }
            // 处理类似 fn(_, 2)(1) 这种情况
            else if (holesLen) {
                // fn(_, 2)(_, 3)
                if (index >= holesLen) {
                    _args.push(arg);
                }
                // fn(_, 2)(1) 用参数 1 替换占位符
                else {
                    _args.splice(_holes[index], 1, arg);
                    _holes.splice(index, 1)
                }
            }
            else {
                _args.push(arg);
            }

        }
        if (_holes.length || _args.length < length) {
            return curry.call(this, fn, _args, _holes);
        }
        else {
            return fn.apply(this, _args);
        }
    }
}

var _ = {};

var fn = curry(function (a, b, c, d, e) {
    console.log([a, b, c, d, e]);
});

// 验证 输出全部都是 [1, 2, 3, 4, 5]
fn(1, 2, 3, 4, 5);
fn(_, 2, 3, 4, 5)(1);
fn(1, _, 3, 4, 5)(2);
fn(1, _, 3)(_, 4)(2)(5);
fn(1, _, _, 4)(_, 3)(2)(5);
fn(_, 2)(_, _, 4)(1)(3)(5)