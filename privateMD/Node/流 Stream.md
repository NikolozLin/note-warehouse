# Node.js  Stream

## 流的概念

stream 是数据集合，类似于数组、字符串，一般用于高效的读写文件、网络通信、端到端信息交换。

使用stream 传输时，不一次性访问所有数据，而是一点点的传输(chunk编码)，所以不用占用太多内存，适合大数据传输的场景。

## 流的类型

- Readable
  可读流是对源的抽象，可以从中消费数据，如`fs.createReadStream`
- Writable
  可写流是对可写入数据目标的抽象， 如`fs.createWriteStream`
- Duplex(双工)
  双工流既可读又可写，如`TCP socket`
- Transform(转换)
  转换流本质是上双工流，用于写入和读取数据时对其进行修改或转换，如`zlib.createGzip`用gzip压缩数据

## 管道

使用管道传输数据`src.pipe(res)`,要求与源可读，写入目标可写。如果是`Duplex`类型流进行管道传输，可以像`Linux`的管道一样链式调用。

```js
  readableSrc
    .pipe(transformStream1)
    .pipe(transformStream2)
  	.pipe(finalWritableDest)
```

`Pipe()`方法会返回目标流。所以上下等价

```text
// 等价于
a.pipe(b)
b.pipe(c)
c.pipe(d)
# Linux下，等价于
$ a | b | c | d
```

## 流于事件

