// instanceof 判断构造函数的 prototype 属性 是否出现在某个实例子对象的原型链上
// A instanceof B ， 取A得原型链，取构造函数B的原型，如果原型在原型链上返回true。
/**
 *  判断B 的原型是否在A的原型链上
 * @param {*} A 必须是对象 
 * @param {*} B 必须是一个函数
 * @returns 
 */
function myInstacne(A, B) {
    let leftPrototype = A.__proto__;
    let rightPrototype = B.prototype;

    while (true) {
        if (leftPrototype === null) {
            return false
        }
        if (rightPrototype === leftPrototype) {
            return true
        }
        leftPrototype = leftPrototype.__proto__;
    }
}