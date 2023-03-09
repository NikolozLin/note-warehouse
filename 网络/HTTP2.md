---
date created: 2022-09-05 15:28
---

[http2 协议 RFC7540](https://httpwg.org/specs/rfc7540.html#StreamIdentifiers)
[介绍文章](https://juejin.cn/post/6844903667569541133#heading-18)

## HTTP1.1  现存问题

1. TCP链接数限制
   同一个域名，浏览器同时支持6~8个TCP连接。
   **域名分片**技术突破这个限制，将资源放在不同域名下面(如二级子域名)，但是TCP连接本身进过DNS查询、三步握手、慢启动等，同时还会占用服务器的cup、内存，连接多了容易造成网络拥挤、阻塞。
2. 线头阻塞(Head of Line Blocking)
   一个TCP连接同时只能处理一个请求-响应，按照FIFO原则处理请求。如果上一个响应没返回，后续的请求都会受到阻塞。虽然出现了**管线化-pipelining**，但还纯在许多问题，且客户端-代理-服务器都要支持管线化。
3. Header 内容多，且每次请求Header 不会变化太多，没有相应的压缩传输优化方案。
4. 尽可减少请求数，需要合并文件、雪碧图、资源缓存等优化工作，但是使得单个请求内容变大延迟变高，且内嵌的资源不能有效的使用缓存机制

## HTTP2.0 的优势

1. 帧是数据传输的最小单位，以二进制传输代替原来得明文传输。原本的报文被分为更小的数据帧。
   ![[http2-二进制分帧层.png]]
2. 多路复用 MultiPlexing
   一个tcp连接上可以不停的发送帧，每个帧都有 stream identifier 标识帧属于那个流。接收方会将多个帧拼接成数据块。把原本 HTTP1 的每个请求当成一个流，多个请求就时多个流，不同流的帧交错的发送给对方，这就是多路复用。
3. 服务端推送
   相较于HTTP1.1 资源内联优势
   - 客户端可以缓存推送的资源
   - 客户端可以拒收推送过来的资源
   - 推送资源可以由不同页面共享
   - 服务器可以按照优先级推送资源
4. Header 压缩 （HPACK）
5. 应用层的重置连接
   可用通过 HTTP2 的 RST_STREAM 类型的帧，可以再不断开TCP连接的情况下，取消某个请求的 stream。
6. 给不同请求的流设置优先级
7. 流量控制
   每个 http2 流都拥有自己的公示的流量窗口，它可以限制另一端发送数据。对于每个流来说，两端都必须告诉对方自己还有足够的空间来处理新的数据，而在该窗口被扩大前，另一端只被允许发送这么多数据。
8. HTTP1的一些优化方案可以放弃
   合并文件、内联资源、雪碧图、域名分片

## HTTP 2 帧结构

### 帧结构

所有的帧都是固定的 9字节头部 + 制定长度的 **payload**

```
+-----------------------------------------------+
|                 Length (24)                   |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+-------------------------------+
|R|                 Stream Identifier (31)                      |
+=+=============================================================+
|                   Frame Payload (0...)                      ...
+---------------------------------------------------------------+
```

- **Length** :
  代表真个frame的长度 ，使用24bit无符号整数表示。 如果接收端设置了`SETTINGS_MAX_FRAME_SIZE` 那么Lenght可以设置更大的值。
- **Type**
  定义frame的类型，决定了帧主体的格式合语义，如果type位unkown则应该忽略
- **Flags**
  为帧类型预留的布尔标识。对不同的帧类型赋予了不同的语义。如果对某个类型没有定义任何语义，那么必须被忽略且应该赋值 `0x0`
- **R**
  保留位，且必须设置为`0x0`，接收时忽略。
- **Stream Identifier**
  用作流控制，用 31 位无符号整数表示。客户端建立的 sid 必须为奇数，服务端建立的 sid 必须为偶数，值 (0x0) 保留给与整个连接相关联的帧 (连接控制消息)，而不是单个流
- **Frame payload**
  主体内容， 由帧类型决定。

#### 帧类型

1. **HEADERS**  ： 报头帧  type=0x1 ，用来打开一个流或者携带一个部首块片段
2. **DATA** ： 数据帧  type=0x0  ， 装填主体信息，可以用多个 DATA 帧来返回一个请求的响应主体
3. **PRIORITY** ：优先级帧 type=0x2， 指定发送者建议的流优先级， 可以在任何流状态下发送_PRIORITY_帧， 包括空闲(idle) 和关闭(clossed)的流
4. **RST_STREAM**: 流终止帧 (type=0x3)，用来请求取消一个流，或者表示发生了一个错误，payload 带有一个 32 位无符号整数的错误码 ([Error Codes](https://link.juejin.cn?target=https%3A%2F%2Fhttpwg.org%2Fspecs%2Frfc7540.html%23ErrorCodes "https://httpwg.org/specs/rfc7540.html#ErrorCodes"))，不能在处于空闲 (idle) 状态的流上发送 RST_STREAM 帧
5. **SETTINGS**: 设置帧 (type=0x4)，设置此 `连接` 的参数，作用于整个连接
6. **PUSH_PROMISE**: 推送帧 (type=0x5)，服务端推送，客户端可以返回一个 RST_STREAM 帧来选择拒绝推送的流
7. **PING**: PING 帧 (type=0x6)，判断一个空闲的连接是否仍然可用，也可以测量最小往返时间 (RTT)
8. **GOAWAY**: GOWAY 帧 (type=0x7)，用于发起关闭连接的请求，或者警示严重错误。GOAWAY 会停止接收新流，并且关闭连接前会处理完先前建立的流
9. **WINDOW_UPDATE**: 窗口更新帧 (type=0x8)，用于执行流量控制功能，可以作用在单独某个流上 (指定具体 Stream Identifier) 也可以作用整个连接 (Stream Identifier 为 0x0)，只有 DATA 帧受流量控制影响。初始化流量窗口后，发送多少负载，流量窗口就减少多少，如果流量窗口不足就无法发送，WINDOW_UPDATE 帧可以增加流量窗口大小
10. **CONTINUATION**: 延续帧 (type=0x9)，用于继续传送首部块片段序列，见 [首部的压缩与解压缩]

### DATA帧格式 (playload部分)

```
 +---------------+
 |Pad Length? (8)|
 +---------------+-----------------------------------------------+
 |                            Data (*)                         ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
```

- `Pad Length`: ? 表示此字段的出现时有条件的，需要设置相应标识 (set flag)，指定 Padding 长度，存在则代表 PADDING flag 被设置
- `Data`: 传递的数据，其长度上限等于帧的 payload 长度减去其他出现的字段长度
- `Padding`: 填充字节，没有具体语义，发送时必须设为 0，作用是混淆报文长度，与 TLS 中 CBC 块加密类似，详见 [httpwg.org/specs/rfc75…](https://link.juejin.cn?target=https%3A%2F%2Fhttpwg.org%2Fspecs%2Frfc7540.html%23padding "https://httpwg.org/specs/rfc7540.html#padding")

DATA 帧有如下标识 (flags):

- END_STREAM: bit 0 设为 1 代表当前流的最后一帧
- PADDED: 第三位bit  设为 1 代表存在 Padding。（大端 0开始）

### HEADERS 帧格式 (playload部分)

```
 +---------------+
 |Pad Length? (8)|
 +-+-------------+-----------------------------------------------+
 |E|                 Stream Dependency? (31)                     |
 +-+-------------+-----------------------------------------------+
 |  Weight? (8)  |
 +-+-------------+-----------------------------------------------+
 |                   Header Block Fragment (*)                 ...
 +---------------------------------------------------------------+
 |                           Padding (*)                       ...
 +---------------------------------------------------------------+
```

- `Pad Length`: 指定 Padding 长度，存在则代表 PADDING flag 被设置
- `E`: 一个比特位声明流的依赖性是否是排他的，存在则代表 PRIORITY flag 被设置
- `Stream Dependency`: 指定一个 stream identifier，代表当前流所依赖的流的 id，存在则代表 PRIORITY flag 被设置
- `Weight`: 一个无符号 8 为整数，代表当前流的优先级权重值 (1~256)，存在则代表 PRIORITY flag 被设置
- `Header Block Fragment`: header 块片段
- `Padding`: 填充字节，没有具体语义，作用与 DATA 的 Padding 一样，存在则代表 PADDING flag 被设置

HEADERS 帧有以下标识 (flags):

- END_STREAM: bit 0 设为 1 代表当前 header 块是发送的最后一块，但是带有 END_STREAM 标识的 HEADERS 帧后面还可以跟 CONTINUATION 帧 (这里可以把 CONTINUATION 看作 HEADERS 的一部分)
- END_HEADERS: bit 2 设为 1 代表 header 块结束
- PADDED: bit 3 设为 1 代表 Pad 被设置，存在 Pad Length 和 Padding
- PRIORITY: bit 5 设为 1 表示存在 Exclusive Flag (E), Stream Dependency, 和 Weight

### 部首压缩与解压缩

HTTP2 的部首一个键对应一个或多个值，这些部首用于HTTP请求和响应消息，也用于服务端推送操作。
部首列表(Header List) 是零个或者多个部首字段（Header Field）的集合。当通过连接传送时，部首列表通过压缩算法_HPACK_序列化成部首块（Header Block）。 然后，序列化的部首块又被划分成一个或多个 部首块片段_Header Block Fragment_ 的字节序列，并通过 HEADERS、PUSH_PROMISE 、CONTINUATION 帧进行有效负载传送。

> Cookie 部首字段 需要 HTTP 映射特殊对待，见 [8.1.2.5. Compressing the Cookie Header Field](https://link.juejin.cn/?target=https%3A%2F%2Fhttpwg.org%2Fspecs%2Frfc7540.html%23CompressCookie "https://httpwg.org/specs/rfc7540.html#CompressCookie")

例： 一个完整部首有两种可能；

- 一个_HEADERS_ 帧 或者 _PUSH_PROMISE_ 帧加上设置 _END_HEADERS_ flag
- 一个未设置_END_HEADERS_ falg 的 _HEADERS_帧或 _PUSH_PROMISE_帧，加上多个_CONTINUATION_ 帧，其中最后一个_CONTINUATION_ 帧设置 _END_HEADERS_ flag

必须将首部块作为连续的帧序列传送，不能插入任何其他类型或其他流的帧。尾帧设置 END_HEADERS 标识代表首部块结束，这让首部块在逻辑上等价于一个单独的帧。接收端连接片段重组首部块，然后解压首部块重建首部列表。

### SETTINGS 帧格式

一个 SETTINGS 帧的 payload 由零个或多个参数组成，每个参数的形式如下:

```
 +-------------------------------+
 |       Identifier (16)         |
 +-------------------------------+-------------------------------+
 |                        Value (32)                             |
 +---------------------------------------------------------------+
```

- `Identifier`: 代表参数类型，比如 SETTINGS_HEADER_TABLE_SIZE 是 0x1
- `Value`: 相应参数的值

建立连接时：

- 双方发送 _SETTING_帧以表明自己期许对方应当做的配置
- 对方接受并接受配置参数后，发送带有ACK 标识的 _SETTING_空帧表示确认，而且连接后任意一方都可以再发送_SETTING_帧进行调整。

> SETTING 作用于整个连接，而不是某个流，且 SETTING 帧的 `stream identifier`必须是 0x0，否则接收方会认为错误

SETTINGS 帧包含以下参数:

- SETTINGS_HEADER_TABLE_SIZE (0x1): 用于解析 Header block 的 Header 压缩表的大小，初始值是 4096 字节
- SETTINGS_ENABLE_PUSH (0x2): 可以关闭 Server Push，该值初始为 1，表示允许服务端推送功能
- SETTINGS_MAX_CONCURRENT_STREAMS (0x3): 代表发送端允许接收端创建的最大流数目
- SETTINGS_INITIAL_WINDOW_SIZE (0x4): 指明发送端所有流的流量控制窗口的初始大小，会影响所有流，该初始值是 2^16 - 1(65535) 字节，最大值是 2^31 - 1，如果超出最大值则会返回 FLOW_CONTROL_ERROR
- SETTINGS_MAX_FRAME_SIZE (0x5): 指明发送端允许接收的最大帧负载的字节数，初始值是 2^14(16384) 字节，如果该值不在初始值 (2^14) 和最大值 (2^24 - 1) 之间，返回 PROTOCOL_ERROR
- SETTINGS_MAX_HEADER_LIST_SIZE (0x6): 通知对端，发送端准备接收的首部列表大小的最大字节数。该值是基于未压缩的首部域大小，包括名称和值的字节长度，外加每个首部域的 32 字节的开销

SETTINGS 帧有以下标识 (flags):

- ACK: bit 0 设为 1 代表已接收到对方的 SETTINGS 请求并同意设置，设置此标志的 SETTINGS 帧 payload 必须为空

### HTTP2 连接流程

1. 在 HTTP/2 中，要求两端都要发送一个连接前言，作为对所使用协议的最终确认，并确定 HTTP/2 连接的初始设置，客户端和服务端各自发送不同的连接前言。
   1. 客户端 ：前言内容 包含一个内容为 `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n` 的序列加上一个可以为空的 SETTINGS 帧，在收到 101(Switching Protocols) 响应 (代表 upgrade 成功) 后发送，或者作为 TLS 连接的第一个传输的应用数据。如果在预先知道服务端支持 HTTP/2 的情况下启用 HTTP/2 连接，客户端连接前言在连接建立时发送。
   2. 服务端：前言 包含一个可以为空的 SETTINGS 帧，在建立 HTTP/2 连接后作为第一帧发送。详见 [HTTP/2 Connection Preface](https://link.juejin.cn/?target=https%3A%2F%2Fhttpwg.org%2Fspecs%2Frfc7540.html%23ConnectionHeader "https://httpwg.org/specs/rfc7540.html#ConnectionHeader")
2. 发送完前言后双方都得向对方发送带有 ACK 标识的 SETTINGS 帧表示确认，对应上图中编号 29 和 31 的帧。
3. 请求站点的全部帧序列，帧后面的数字代表所属流的 id，最后以 GOAWAY 帧关闭连接:
   GOAWAY 帧带有最大的那个流标识符 (比如图中第 29 帧是最大流)，对于发送方来说会继续处理完不大于此数字的流，然后再真正关闭连接

## 流 Stream

流只是一个逻辑上的概念，代表 HTTP/2 连接中在客户端和服务器之间交换的独立双向帧序列，每个帧的 Stream Identifier 字段指明了它属于哪个流。
流有以下特性:

- 单个 h2 连接可以包含多个并发的流，两端之间可以交叉发送不同流的帧
- 流可以由客户端或服务器来单方面地建立和使用，或者共享
- 流可以由任一方关闭
- 帧在流上发送的顺序非常重要，最后接收方会把相同 Stream Identifier (同一个流) 的帧重新组装成完整消息报文

![[http2-流状态.png]]

### idle

所有stream 以’空闲‘状态开始，这种状态无任何帧的交换
其状态转换：

- 发送或者接收一个 HEADERS 帧会使空闲 `idle` 流变成打开 `open` 状态，其中 HEADERS 帧的 Stream Identifier 字段指明了流 id。同样的 HEADERS 帧(带有 END_STREAM )也可以使一个流立即进入 half-closed 状态。
- 服务端必须在一个打开 `open` 或者半关闭 (远端) `half-closed(remote)` 状态的流 (由客户端发起的) 上发送 PUSH_PROMISE 帧，其中 PUSH_PROMISE 帧的 Promised Stream ID 字段指定了一个预示的新流 (由服务端发起)，
  - 在服务端该新流会由空闲 `idle` 状态进入被保留的 (本地) `reserved(local)` 状态
  - 在客户端该新流会由空闲 `idle` 状态进入被保留的 (远端) `reserved(remote)` 状态

> 此状态下接收到 HEADERS 和 PRIORITY 以外的帧被视为 PROTOCOL_ERROR

状态图中 `send PP` 和 `recv PP` 是指连接的双方端点发送或接收了 PUSH_PROMISE，不是指某个空闲流发送或接收了 PUSH_PROMISE，是 PUSH_PROMISE 的出现促使一个预示的流从 `idle` 状态转为 `reserved`

### reserved (local) / reserved (remote)

PUSH_PROMISE 预示的流由 `idle` 状态进入此状态，代表准备进行 Server push.
其状态转换:

- PUSH_PROMISE 帧预示的流的响应以 HEADERS 帧开始，这会立即将该流在服务端置于半关闭 (远端) `half-closed(remote)` 状态，在客户端置于半关闭 (本地) `half-closed(local)` 状态，最后以携带 END_STREAM 的帧结束，这会将流置于关闭 `closed` 状态
- 任一端点都可以发送 RST_STREAM 帧来终止这个流，其状态由 `reserved` 转为 `closed`

`reserved(local)` 状态下的流不能发送 HEADERS、RST_STREAM、PRIORITY 以外的帧，接收到 RST_STREAM、PRIORITY、WINDOW_UPDATE 以外的帧被视为 PROTOCOL_ERROR

`reserved(remote)` 状态下的流不能发送 RST_STREAM、WINDOW_UPDATE、PRIORITY 以外的帧，接收到 HEADERS、RST_STREAM、PRIORITY 以外的帧被视为 PROTOCOL_ERROR

### open

处于 `open` 状态的流可以被两个对端用来发送任何类型的帧

其状态转换:

-   任一端都可以发送带有 END_STREAM 标识的帧，发送方会转入 `half-closed(local)` 状态；接收方会转入 `half-closed(remote)` 状态
-   任一端都可以发送 RST_STREAM 帧，这会使流立即进入 `closed` 状态

  
### half-closed (local)

流是双向的，半关闭表示这个流单向关闭了，local 代表本端到对端的方向关闭了，remote 代表对端到本端的方向关闭了

此状态下的流不能发送 WINDOW_UPDATE、PRIORITY、RST_STREAM 以外的帧

当此状态下的流收到带有 END_STREAM 标识的帧或者任一方发送 RST_STREAM 帧，会转为 `closed` 状态

此状态下的流收到的 PRIORITY 帧用以调整流的依赖关系顺序，可以看下文的流优先级

  
### half-closed (remote)

此状态下的流不会被对端用于发送帧，执行流量控制的端点不再有义务维护接收方的流控制窗口。

一个端点在此状态的流上接收到 WINDOW_UPDATE、PRIORITY、RST_STREAM 以外的帧，应该响应一个 STREAM_CLOSED 流错误

此状态下的流可以被端点用于发送任意类型的帧，且此状态下该端点仍会观察流级别的流控制的限制

当此状态下的流发送带有 END_STREAM 标识的帧或者任一方发送 RST_STREAM 帧，会转为 `closed` 状态

### closed

代表流已关闭

此状态下的流不能发送 PRIORITY 以外的帧，发送 PRIORITY 帧是调整那些依赖这个已关闭的流的流优先级，端点都应该处理 PRIORITY 帧，尽管如果该流从依赖关系树中移除了也可以忽略优先级帧

此状态下在收到带有 END_STREAM 标识的 DATA 或 HEADERS 帧后的一小段时间内 (period) 仍可能接收到 WINDOW_UPDATE 或 RST_STREAM 帧，因为在远程对端接收并处理 RST_STREAM 或带有 END_STREAM 标志的帧之前，它可能会发送这些类型的帧。但是端点必须忽略接收到的 WINDOW_UPDATE 或 RST_STREAM

如果一个流发送了 RST_STREAM 帧后转入此状态，而对端接收到 RST_STREAM 帧时可能已经发送了或者处在发送队列中，这些帧是不可撤销的，发送 RST_STREAM 帧的端点必须忽略这些帧。

一个端点可以限制 period 的长短，在 period 内接受的帧会忽略，超出 period 的帧被视为错误。

一个端点发送了 RST_STREAM 帧后接收到流控制帧(比如 DATA)，仍会计入流量窗口，即使这些帧会被忽略，因为对端肯定是在接收到 RST_STREAM 帧前发送的流控制帧，对端会认为流控制已生效

一个端点可能会在发送了 RST_STREAM 帧后收到 PUSH_PROMISE 帧，即便预示的流已经被重置 (reset)，PUSH_PROMISE 帧也能使预示流变成 `reserved` 状态。因此，需要 RST_STREAM 来关闭一个不想要的预示流。



### 流的状态改变
### 流的标识符
### 流的优先级
## Server-push
## 流量控制
## HTTP2 的协议协商机制
## HPACK算法
	
  
