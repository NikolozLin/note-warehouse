## WebSocket数据帧格式

- 数据帧格式 32比特，

```
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
```

- 数据帧详解

  1. `FIN` : 1比特

     1表示消息(message)的最后一个分片(fragment).0表示不是最后一个分片。

  2. `RSV1，RSV2，RSV3 `： 各占一个比特

     - 一般情况下全0。当客户端、服务端、协商采用WebSocket拓展时，这三个标志位可以非0 ，值含义可以自定义拓展。如果不是使用WebSocket协议，且三个标识为非0，连接出错。

  3. `Opcode`: 4 bit

     - 操作代码，Opcode的值决定如何解析后续的数据载荷（data payload）。如果操作代码不认识的，呢么接收端应该断开链接。可选操作码如下。
       - %x0 ：表示一个延续帧。当Opcode 为0时，表示数据传输采用了数据分片，当前收到的数据帧是其中的一部分。
       - %x1 ：表示这是一个文本帧
       - %x2 ：表示这是一个二进制帧
       - %x3-7 ：保留操作代码，用于后续定义的非控制帧
       - %x8 ：表示链接断开。
       - %x9 ： 表示这是一个ping操作
       - %xA ：表示这是一个pong操作
       - %xB-F ：保留的的操作代码，用于后续饿定义的控制帧

  4. `Mask`: 1 bit 

     - 表示是否要对数据载荷进行掩码操作。

     - 客户端向服务端发送数据需要进行掩码操作；服务端向客户端发送数据不需要进行掩码；

     - 如果服务端收到的数据没有进行掩吗操作，服务端需要断开连接。

     - 当`Mask`标志位位1时，`Masking-key`中会定义一个掩码键，并用它对数据载荷进行反掩码。

  5. `Payload length` : 数据载荷长度，单位字节。 7位，或7+16位， 或1+64位。

     - 如果 `Payload length` 7个bit 可以表示 0～127 ，如果`Payload length`的值为x，那么
       - x 为 0～125 ： 数据的长度为 x 字节
       - x = 126 ： 数据长度 = 后续 2个字节所表示的16位的无符号整数的值
       - x = 127 ：数据长度 = 后续 8个字节所表示的64位的无符号整数（最高有效必须位0）
     - 如果`Payload length` 占用了多个字节，payload length 的二进制采用 `Big endian（低地址端 存放 高位字节）`

  6. `Masking-key` : 0 或4字节

     - 所有客户端传送的服务端的数据帧，数据载荷都进行掩码操作，Mask标识为1，就有 Masking-key 。如果标志位为0，则没有Masking-keys.

  7. `Payload data` : (x+y) 字节

     - 载荷数据：包含 拓展数据 x 、 应用数据 y。
       - 拓展数据：如果没有协商使用拓展的话，拓展数据为0字节。所有的拓展都必须声名拓展数据的长度，或可以如何计算出拓展数据的长度。此外，拓展数据长度必须在握手阶段就协商好。如果数据存在，那么载荷数据的长度 必须将拓展数据的长度也包含在内。
       - 应用数据：任意应用数据，载拓展数据(如果有)之后，占据数据帧剩余位置。

## 掩码算法

掩码键（Masking-key）是由客户端挑选出来的32位的随机数， 掩码操作不会影响数据载荷的长度。 掩码、反掩码算法如下，

设定，

- original-octet-i ：为原始数据的第 i 个字节
- transformed-octet-i ： 为转换后数据的第 i 个字节
- j ：`i mod 4` 的结果
- masking-key-octet-j： 为mask key第 j 字节

算法表述为： original-octet-i  与 masking-key-octet-j 异或后，得到 transformed-octet-i 



解码算法 ：同上 将加密的数据重新进行异或（XOR）运算

```js
var DECODED = "";
for (var i = 0; i < ENCODED.length; i++) {
    DECODED[i] = ENCODED[i] ^ MASK[i % 4];
}
```



## 数据传递

WebSocket客户端、服务端建立连接后，后续操作都是基于数据帧传递。数据帧中的`opcode`用于区分操作类型。

1. 数据分片

   WebSocket的每条数据给切分成多个数据帧，当WebSocket接收到一个数据帧时，会根据`FIN`标志位的值来判断是否为消息的最后一个数据帧。

2. 数据分片例子

   [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers) 详细内容 参见MDN

   ```
   Client: FIN=1, opcode=0x1, msg="hello"
   Server: (process complete message immediately) Hi.
   Client: FIN=0, opcode=0x1, msg="and a"
   Server: (listening, new message containing text started)
   Client: FIN=0, opcode=0x0, msg="happy new"
   Server: (listening, payload concatenated to previous message)
   Client: FIN=1, opcode=0x0, msg="year!"
   Server: (process complete message) Happy new year to you too!
   ```

   上面的信息包含两条消息，

    - 第一条：单帧发送完成。

      ​	FIN = 1 表示当前消息是最后一帧，opcode = 0x1 表示发送的是文本消息

    - 第二条：分3个帧发送完成。

      1. FIN=0 表示当前消息还未传输完成，opcode=0x1 表示发送的是消息文本
      2. FIN=0 表示消息未发送完，opcode= 0x0 表示这是一个延续帧，当前数据帧接在上一个数据帧
      3. FIN=1  表示消息发送完成没有后续帧，opcode=0x0 表示延续帧，需要接在上一帧后。 服务端可以将上三帧组装成完成消息

      

      

## WebSocket 连接持活 + 心跳

​      ping。pong

    ## Sec-WebSocket-Key/Accept 作用（来源：小卡）

 主要用于提供基础防护、减少恶意连接、意外连接。

1. 避免服务端收到非法的websocket连接（比如http客户端不小心请求连接websocket服务，此时服务端可以直接拒绝连接）
2. 确保服务端理解websocket连接。因为ws握手阶段采用的是http协议，因此可能ws连接是被一个http服务器处理并返回的，此时客户端可以通过Sec-WebSocket-Key来确保服务端认识ws协议。（并非百分百保险，比如总是存在那么些无聊的http服务器，光处理Sec-WebSocket-Key，但并没有实现ws协议。。。）
3. 用浏览器里发起ajax请求，设置header时，Sec-WebSocket-Key以及其他相关的header是被禁止的。这样可以避免客户端发送ajax请求时，意外请求协议升级（websocket upgrade）
4. 可以防止反向代理（不理解ws协议）返回错误的数据。比如反向代理前后收到两次ws连接的升级请求，反向代理把第一次请求的返回给cache住，然后第二次请求到来时直接把cache住的请求给返回（无意义的返回）。
5. Sec-WebSocket-Key主要目的并不是确保数据的安全性，因为Sec-WebSocket-Key、Sec-WebSocket-Accept的转换计算公式是公开的，而且非常简单，最主要的作用是预防一些常见的意外情况（非故意的）。

