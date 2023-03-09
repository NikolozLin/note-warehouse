---
date created: 2022-08-30 15:23
---

## Function.prototype.call()

**call()**  方法使用一个指定的 `this` 值和单独给出的一个或多个参数来调用一个函数。
```js
Function.prototype.call2 = function (context, ...args) {

const context = context || window; // 如果传入null ｜ undefined 需要编程全局对象

const fn = Symbol;

context[fn] = this;

const result =context[fn](...args);

delete context[fn]

return result

};
```
## Function.prototype.apply()
**apply()** 方法调用一个具有给定 `this` 值的函数，以及以一个数组（或一个[类数组对象]）的形式提供的参数。
```js
Function.prototype.apply2 = function (context, args) {

const context = context || window; // 如果传入null ｜ undefined 需要编程全局对象

const fn = Symbol;

context[fn] = this;

  let result;
    if (!arr) {
        result = context.fn();
    } else {
        result = context.fn(...arr);
    }

delete context[fn]

return result

};
```

## Function.prototype.bind()
**bind()** 方法创建一个新的函数，在 `bind()` 被调用时，这个新函数的 `this` 被指定为 `bind()` 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。
> 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。
```js
Function.prototype.bind2 = function (context, ...args) {

const self = this;

const BoundFn = function () {

const bindArgs = args;

// 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
// 以上面的是 demo 为例，如果改成 `this instanceof fBound ? null : context`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
// 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 context

return self.apply(this instanceof BoundFn ? this : context, ...[bindArgs, ...arguments]);

};

BoundFn.prototype = self.prototype;

return BoundFn;

};
```
优化：
```js
Function.prototype.bind2 = function (context) {

  

if (typeof this !== "function") {

throw new Error("Function.prototype.bind - what is trying to be bound is not callable");

}

const self = this;

const args = Array.prototype.slice.call(arguments, 1);

  

const fNOP = function () {};

  

const fBound = function () {

const bindArgs = Array.prototype.slice.call(arguments);

//如果是当构造函数 new 一个实例 那么指定的this就会失效

return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));

};

  

fNOP.prototype = this.prototype; //为了防止修改返回新函数的prototype 时候同时修改原来函数的prototype

fBound.prototype = new fNOP(); //等效于 fBound.prototyp= Object.create(this.prototype)

return fBound;

};
```
