
// 原型式继承的标准实现
Object.create2 = function (proto, propertiesObject = undefined) {

    if (typeof proto !== 'object' || typeof proto !== 'fucntion') {
        throw new TypeError('Object prototype may only be an object or Null.')
    }
    if (prototype == null) {
        throw new TypeError('Cannot convert undefined or null to object')
    }
    
    function F() { }
    F.prototype = proto;
    const obj = new F();

    if (propertiesObject !== undefined) {
        Object.defineProperties(obj, propertiesObject)
    }
    if (proto === null) {
        obj.__proto__ = null
    }
    return obj
}