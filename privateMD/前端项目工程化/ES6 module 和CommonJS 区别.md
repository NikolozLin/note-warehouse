# ES6 module 和CommonJS 区别

js代码执行前，会进行编译。其中会对变量进行变量提升。

- ES6 module

  当代码编译时，发现有import语句，此时会先加载（执行）import 进来的js。然后在继续执行后续代码。

- CommonJS

  当代码编译时，发现有require语句，此时不会优先加载 require 进来的js。只会进行变量提升。

---

- ES6 module

  ES6 模块输出的值引用，意味着如果输出的是一个object 那么输出的值引用就是内存地址。当这个object的A属性值给修改时，在其他地方获取这个object的A属性值会得到最新的值。

  基本变量也一样。

- CommonJS

  第一次 require 执行模块后，内存中会生成一块像下面一样的空间

  ```
  {
    id: '...', // 模块名
    exports: { ... }, // 输出值
    loaded: true, // 模块是否执行完毕
    ...
  }
  ```

  里面的exports 时模块变量的拷贝值。 当你用到这个模块就会到exports属性上取值。如果有多次require 该模块也不会执行，而在内存中的对象直接取值。 即，require后 模块内部的变化对输出值没有影响。

  

