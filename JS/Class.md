Class是原型、构造函数的语法糖用来支持正式的面相对象编程。

- class 与函数表达式类型类似，但是函数会进行声明提升，但是类不会。
-  函数受函数作用域限制，类受块作用域限制。
```js
{
function FunctionDeclaration() {}
class ClassDeclaration {}
}
console.log(FunctionDeclaration); // FunctionDeclaration() {}
console.log(ClassDeclaration); // ReferenceError: ClassDeclaration is not defined
```