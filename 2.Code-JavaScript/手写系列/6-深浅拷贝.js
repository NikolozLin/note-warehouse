// 浅拷贝
function shllowCopy(obj) {
    if (typeof obj !== 'object') return

    let newObj = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
        }
    }
    return newObj
}
// 深拷贝（只考虑普通对象属性）
function deepCopySimple(obj) {

    if (typeof obj !== 'object') return;
    let newObj = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] == 'object' ? deepCopySimple(obj[key]) : obj[key];
        }
    }
    return newObj

}
//===============================================================================================================================
// 深拷贝
// 考虑 循环引用问题内置对象Data、RegExp 等，
// 内置对象的处理
// 1. Boolean、 Number、String、Data、Error 直接用构造函数创建新的
// 2. Object、Map、Set 直接执行构造函数， 递归处理内部属性。
// 3. Array、Symbol、RegExp 进行特殊处理
const isObject = (target) => { target !== null && (typeof target === 'object' || typeof target === 'fucntion') }
function getObjectType(obj) {
    // Array Object Map Set RegExp Boolean String Number Symbol Date Error
    return Object.prototype.toString.call(obj).slice(8, -1)
}

/**
 * 兼容 正则的exec 结果，exec返回数组有index input属性
 * @param {*} arr 
 */
function cloneArray(arr) {
    const { length } = array;
    const result = new array.constructor(length);

    if (length && typeof array[0] === 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
    }
    return result;
}

function cloneSymbol(Symbol) {
    return Object(Symbol.prototype.valueOf.call(Symbol))
}

function cloneRegExp(regexp) {
    const reFlags = /\w*$/;//匹配 [A-Za-z0-9_]
    const result = new regexp.constructor(regexp.source, reFlags.exec(regexp)); // 返回当前匹配文本
    result.lastIndex = regexp.lastIndex; // 下次匹配的 起chu shi
    return result

}
//
function initCloneTargetByTag(target, tag) {
    //取构造函数
    const Ctor = target.constructor;
    switch (tag) {
        //不可遍历类型
        case 'Boolean':
        case 'Date':
        case 'Number':
        case 'String':
        case 'Error':
            return new Ctor(target);

        // 可遍历类型
        case 'Object':
        case 'Map':
        case 'Set':
            return new Ctor()
       
            //特殊处理类型
        case 'Array':
            return cloneArray(target);
        case 'Symbol':
            return cloneSymbol(target);
        case 'RegExp':
            return cloneRegExp(target);
    }

}
function deepCopy(target, cache = new WeakSet()) {
    // 基础类型 直接返回
    if (!isObject(target)) return target;
    //判断是否 clone 过
    if (cache.has(target)) return target;

    cache.add(target);

    const tag= Object.prototype.toString.call(target).slice(8, -1)
    // let cloneTarget = Array.isArray(target) ? [] : {};
    let cloneTarget = initCloneTargetByTag(target,tag);
    //处理内置对象 含有值
    if(tag==='Map'){
        target.forEach((value,key)=>{
            cloneTarget.set(key,deepCopy(value,cache))
        })

    }
    if(tag==='Set'){
        target.forEach((value)=>{
            cloneTarget.add(deepCopy(value,cache))
        })

    }

    //函数直接返回 内存地址即可
    if(tag==='Function'){
        return target
    }

    Object.keys(target).forEach(key => {
        cloneTarget[key] = deepCopy(target[key], cache)
    })

    return cloneTarget;

}