
// call
// 指定this 与若干个参数的前提下 ，调用函数或方法。

Function.prototype.call2 = function (ctx, ...args) {
    var context = ctx == undefined ? window : Object(ctx);

    var fn = Symbol()
    context[fn] = this;

    const result = context[fn](...args)
    delete context[fn];
    return result
}
// apply
// 指定this 与参数数组 ，执行目标函数或方法
Function.prototype.apply2 = function (ctx, arr = []) {
    var context = ctx == undefined ? window : Object(ctx);

    var fn = Symbol()
    context[fn] = this;

    const result = context[fn](...arr)

    delete context[fn];

    return result
}


//bind
// 指定this不仔执行 返回新的函数
// 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略（此时的this 是new中的obj），同时调用时的参数被提供给模拟函数。

Function.prototype.bind2 = function (ctx, ...args) {

    const self = this;
    function BF(...rest) {
        return self.appl(this instanceof BF ? this : ctx, [...args, ...rest])
    }
    BF.prototype = Object.create(self.prototype)
    return BF;
}