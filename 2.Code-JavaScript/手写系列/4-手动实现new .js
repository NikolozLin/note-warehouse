//  用来创建用户自定义对象类型实例、具有构造函数的内置对象创建实例

function objectFactory() {
    var obj = new Object();
    var constructor = [].shift.call(arguments);
    obj.__proto__ = constructor.prototype;// 指定原型链
    //执行构造函数
    var ret = constructor.apply(obj, arguments);

    return typeof ret == 'object' ? ret : obj;
}