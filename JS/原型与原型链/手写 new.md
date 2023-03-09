1. 内存中创建一个新的对象
2. 新对象内部的`[[Prototype]]` 赋值了 构造函数的`prototype`属性
3. 构造函数内部的this 指向了新对象
4. 执行构造函数内部代码
5. 如果构造函数返回非空对象，则返回非空对象。否则返回1 中创建的新对象。

###  手写 new

```js
function newFactory() {
	const obj = new Object();
	const constructor = [].shift.call(arguments);
	obj.__proto__ = constructor.prototype;
	const ret = constructor.apply(obj, arguments);
	 return typeof ret === 'object' ? ret : obj;

}


function Per(name) {

this.name = name;

}

  

const a = newFactory(Per, '111');

const b = new Per('222');

  

a instanceof Per

```