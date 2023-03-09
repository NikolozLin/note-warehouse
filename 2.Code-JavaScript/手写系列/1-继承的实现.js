// 继承本质上是让 子 能拥有父的属性和方法

// 1 。盗用构造函数 ------ 
// 共享了父亲属性方法， 但是无法使用父类原型方法
function Father(name) {
    this.name = name;
}

function Son(name) {
    Father.call(this, name)
}


// 2。组合继承 --- 解决盗用构造函数的问题

function Father2(name) {
    this.name = name;
}

function Son2(name) {
    Father2.call(this, name);
}
Son2.prototype = new Father2();

//3  原型式继承-- 创建临时构造函数，并将指定的原型对象赋予临时构造函数
// ES5 规范为Object.create()
function newObject(o) {
    function F() {

    }
    F.prototype = o;
    return new F()

}

// 4 寄生式继承 -- 某种方式强化

function createAnother(original) {

    const clone = Object.create(original);
    clone.someFn = function () { console.log('do something'); };
    return clone
}

//5 寄生组合继承 -- 解决组合继承 子类实例化时候，执行两次构造函数
// 替代原来的 Son.prototype= new Father()  ,减少构造函数执行又能继承原型方法
function extend5(Son,Father){
    const prototype =Object.create(Father.prototype);
    prototype.constructor=Son;
    Son.prototype=prototype;
}

