## Buffer
Buffer对象类似数组，元素为16进制的二位数，即0-255的数值。 Buffer的大小在创建的时候已经确定，无法调整。
```
<Buffer e5 a7 c9.....>
```
二进制是计算机底层的数据结构，字符串、数字、音频、程序、网络包等。在最底层都是用而精致进程存储。高级格式和二进制可以通过固定编码进行转换。

**node中为什么会出现Buffer模块**
JS原来运行在浏览器端，可以很好的处理Unicode编码的字符串数据。但是无法处理`二进制`以及`非Unicode`编码的数据。 但是在Server端操作`TCP/HTTP` `文件I/O`的处理是必须的，所以Node.js 提供了`Buffer`类处理二进制的数据。

### Buffer的内存分配机制

**buffer对应于 V8 堆内存之外的一块原始内存**

`Buffer`是一个典型的`javascript`与`C++`结合的模块，与性能有关的用C++来实现，`javascript` 负责衔接和提供接口。`Buffer`所占的内存不是`V8`堆内存，是独立于`V8`堆内存之外的内存，通过`C++`层面实现内存申请（可以说真正的内存是`C++`层面提供的）、`javascript` 分配内存（可以说`JavaScript`层面只是使用它）。`Buffer`在分配内存最终是使用`ArrayBuffer`对象作为载体。  
简单点而言， 就是`Buffer`模块使用`v8::ArrayBuffer`分配一片内存，通过`TypedArray`中的`v8::Uint8Array`来去写数据。
