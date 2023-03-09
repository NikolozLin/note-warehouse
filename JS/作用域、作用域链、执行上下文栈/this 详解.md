---
date created: 2022-08-30 09:50
date updated: 2022-08-30 11:11
---

## 前置概念

**Types**
ECMAScript的类型分为 语言类型 、规范类型

- 语言类型：开发者能直接使用的类型，null、undefined、Number、String、Boolean、Bigint、Symbol
- 规范类型：用来表述ECMAScript语言结构及语言类型。 包括 Reference, List, Completion, Property Descriptor, Property Identifier, Lexical Environment, 和 Environment Record。

**Reference**
Reference是规范类型的一种，用来解释如 delete、typeof以及赋值等操作行为。
Reference包含三个部分

- Reference
  - base value ：
    - 表示属性存在的对象或者 Environment Record，它的值只能是Undefined、an Object、a Boolean、a String、 a Number、Environment Record 其中一种。
  - referenced name ：
  - strict reference

Reference相关方法：

- GetBase( ) ： 返回 reference 的 base value
- IsPropertyReference( ): 如果base value 是一个对象就返回 true
- **GetValue( )**: 从 Reference 类型获取对应值 ，返回**真正的值**，而不是reference

## 如何判定this的值

> 详细可看规范11.2.3 Function Calls。 下面只关注函数调用是this的取值。

### 流程：

1. 计算 MemberExpression的结果 赋值给ref
2. 判断 ref 是不是一个 Reference类型
   1. 如果ref 是Reference，且 isPropertyReference(ref) 结果为 true ，那么this 的值为 GetBase(ref)
   2. 如果ref是Reference， 且 base value 值是 Environment Record ， 那么this的值为ImplicitThisValue(ref)
	   >ImplicitThisValue 方法的介绍：该函数始终返回 undefined。
   3. 如果 ref 不是Reference， 那么this 的值为undefined。

### 详细流程：
##### 1. 计算`MemberExpression`结果

> 详解参看规范 11.2  Left-Hand-Side Expressions

MemberExpression：

- PrimaryExpression // 原始表达式
- FunctionExpression // 函数表达式
- MenberExpression [ Expression] // 属性访问表达式
- MemberExpression .IdentifierName //属性访问表达式
- new MemberExpression Arguments // 对象创建表达式

> 简单理解 MemberExpression 其实就是()左边的部分。

##### 2. 判断 ref 是不是一个Renference类型 
关键在于 规范如果处理各种 MenberExpression， 返回结果是不是一个Renference类型。
示例
```js
var value =1;
var foo ={
	value:2,
	bar:fucntion(){
		return this.value;
	}
}
//示例1
console.log(foo.bar());
//示例2
console.log((foo.bar)());
//示例3
console.log((foo.bar = foo.bar)());
//示例4
console.log((false || foo.bar)());
//示例5
console.log((foo.bar, foo.bar)());
```
---
1.  **foo.bar()**
	按照规则，MenberExpression计算结果为 foo.bar , 该值是一个Reference，
	```js
	var Reference = {
	  base: foo,
	  name: 'bar',
	  strict: false
	};
	```
	且isProPertyReference(ref) 的值为true ，所以 this 值为 GetBase(ref) 的值，即 foo 
2. **(foo.bar)()**
	虽然 用括号包裹起来，当没有对 MemberExpression 进行计算，所以this 指向与上相同
3. **(foo.bar = foo.bar)()**
	> 参看262规范  13.15.1 
	
	存在赋值，使用了GetValue() 所以返回的不是Reference 类型 ，所以 this 指向undefined, 非严格模式下隐式转换为全局对象
4. **(false || foo.bar)()**
	因为使用了 GetValue，所以返回的不是 Reference 类型，this 为 undefined
5. **(foo.bar, foo.bar)()**
	因为使用了 GetValue，所以返回的不是 Reference 类型，this 为 undefined