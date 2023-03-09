---
date created: 2022-04-16 15:50
date updated: 2022-04-16 17:37
---

# web中的数据类型

## url上的编码

Url采用**ASCII** 编码格式，所有的非ASCII字符需要进行编码。

因为[RFC 3986](https://datatracker.ietf.org/doc/html/rfc3986)规定.

> 只有字母和数字[0-9a-zA-Z]、一些特殊符号"$-_.+!*'(),"[不包括双引号]、以及某些保留字，才可以不经过编码直接用于URL。

那么，如果url中包含中文就必须进行编码后才能使用。但是标准没有规定具体编码规范，由各个浏览器厂商自己决定。

- 如何进行编码
  url编码通常为百分号编码，就是%+两个字符（代表一个字节（8bit）的十六进制）。 例如，a在ASCII上对应的是0x61，那么对应的url编码是%61.
  对于遇到Unicode字符（一个字符对应一个数字，但更具utf-8、16、32 可能的值会不一样），RFC推荐使用utf-8进行编码。

例如，”中“ 对应的Unicode字符集编码为`20013`（十进制），UTF-8编码结果为`E4B8AD`(十六进制)，转变为百分号编码就为`%E4%B8%AD`

## Blob 关联的数据类型

### Blob

Blob对象表示一个不可变的、原始数据的类文件对象。它的数据可以按文本 或 二进制格式进行读取，也可以转成`ReadableStream`来用于数据操作。

`Blob` 使用方法：

1. 文件下载： 通过`URL.createObjectURL()` 生成Blob URL，赋予给`<a>`的download属性
2. 图片显示：通过`URL.createObjectURL()` 生成Blob URL，赋予`<img>`的src属性
3. 资源分段上传： 通过`Blob.slice()`可以分割二进制数据为子Blob进行上传。
4. 读取本地文件： `FileReader`的API可以将Blob或File 转化为本本、ArrayBuffer、DataURL等类型。

### Blob 衍生的 File

`File`，它继承了Blob的属性，并将其拓展支持用户系统上的文件。通过`File`可以获取文件相关信息，并在网页中的JS访问其中的内容。

`File`对象的来源：

1. `<input>`标签选择文件后返回的`FileList`对象。
2. 自由拖拽操作生成的`DataTransfer`对象。
3. `HTMLCanvasElement`上的 `mozzGetAsFile()`API

`File` 对象是特殊类型的 `Blob`，且可以用在任意的 Blob 类型的 context 中。比如说， `FileReader`, `URL.createObjectURL()`, `createImageBitmap()` , 及 `XMLHttpRequest.send()` 都能处理 `Blob` 和 `File`。

## ArrayBuffer

Blob或者File对象都可以获取文件具体内容，并在JS中操作。但存在有局限，无法对二进制数据进行细粒度的操作。 需进行细粒度的操作就需要用到`ArrayBuffer`。

`ArrayBuffer`对象表示的是 固定长度的原始二进制数据的缓冲区。 但只是分配空间不会指定保存什么类型的数据。要写入数据 需要通过TypeArray（Int
32Array 、Uint8Array、Int16Array）或 DataView

`ArrayBuffer`大概功能：

1. 读取：通过FileReader将文件转化为ArrayBuffer数据
   ```js
    document.getElementById('inputFile')
   	.addEventListener('change', function (e) {
         const file = this.files[0];
         const fileReader = new FileReader();
         fileReader.onload = function () {
           const result = fileReader.result;
           console.log(result)
         }
         fileReader.readAsArrayBuffer(file);
   	}, false);

   ```
2. 写入：
   - 通过TypeArray对象进行操作
     ```js
     const typeArr1= new Int8Array(8);
     typeArr1[0]=32;
     const typeArr2= new Int8Array(typeArr1);
     typeArr2[1]=32;

      console.log(typeArr1) //   Int8Array [32, 0, 0, 0, 0, 0, 0, 0]
      console.log(typeArr2) //   Int8Array [32, 42, 0, 0, 0, 0, 0, 0]
     ```
   - 通过DataView对象进行操作
     ```js
     const buffer= new ArrayBuffer(16);
     cosnt view= new DataView(buffer)
     view.setInt8(2, 42);
     console.log(view.getInt8(2));
      // 输出: 42
     ```

**ArrayBuffer与Array的区别**
区别：

1. ArrayBuffer初始化后大小固定，数组可以自由增减
2. ArrayBuffer存放在栈中，数组放在堆中
3. ArrayBuffer没有push、pop这样的数组方法
4. ArrayBuffer只能读取不写入， 写入需要借助TypeArray、DataView

## BinaryString

[`JavaScript strings`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String) 是 UTF-16 编码的字符串。它的一个子集是ASCII 字符集(i.e., 字符的码点不会超过 `127`)。比如,  `"Hello world!"`这个字符串属于 ASCII 子集, 而 `"ÀÈÌÒÙ"` 不属于ASCII。binary string 是JS字符集的另外一个子集，它类似于 ASCII 字符集，但是字符的码点(charCode)不再限制到 `127`， 它包含了`255` 以内的字符。 binary string设计的目的不是用于代表字符， 而是代表二进制数据。由 binary string 代表的二进制数据大小是原始数据的两倍，然而这对于最终用户是不可见的， 因为JavaScript strings 的长度是以2字节为单位进行计算的。

Binary strings 不是JavaScript 语言的设计。 然而至少有一个native 函数以它作为输入 ，比如[`btoa()`](https://developer.mozilla.org/zh-CN/docs/Web/API/btoa "btoa()"): 给这个函数传入charcode 大于`255` 的字符串会抛出一个 `Character Out Of Range` 的错误。

引入Binary strings来代表`uint8` 数字的原因是由于 web 应用变得越来越强大(比如操作音频和视频， 使用WebSockets获取二进制数据， 等等)很明显，有一种可以让JavaScript可以简单而快速地操作二进制数据的api 将会提供很大的帮助。

在以前， 操作二进制数据必须通过对字符串的操作来模拟。使用 [`charCodeAt()`](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt "JavaScript/Reference/Global Objects/String/charCodeAt") 方法从Binary strings读取数据. 然而这么做又慢又容易出错， 因为需要多次转换(尤其是当数据不是真正的 byte-format data，而是 32-bit 整数或者浮点数)。

[JavaScript typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays "/en-US/docs/Web/JavaScript/Typed_arrays") 提供了一个操作 二进制数据更加高效的方法。[`StringView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays/StringView "/en-US/docs/Web/JavaScript/Typed_arrays/StringView") 这个非 native的构造函数是构建在 typed arrays 上的为字符串提供了一个 [C](http://en.wikipedia.org/wiki/C_%28programming_language%29)-like的接口。
