//
// 让嵌套的函数 改写成 非嵌套的形式

// fn3(fn2(fn1(fn0(x))))   =>  compose(fn3,fn2,fn1,fn0)(x)
function compose() {
    const args = arguments;
    const start = args.length - 1;

    return function () {
        let i = start;
        let result = args[start].apply(this, arguments);
        while (i--) result = args[i].call(this, result)

        return result;
    }
}