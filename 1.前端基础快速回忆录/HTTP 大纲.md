---
date created: 2022-10-20 16:08
date updated: 2022-10-21 16:01
---

[神三元   http 灵魂拷问](https://juejin.cn/post/6844904100035821575#heading-39)

## http基础

### 1. http 的报文结构

### 2. http 请求类型

### 3. 常见请求类型 post get 区别

### 4. 如何理解 URI

1. URI= URN+URL

### 5. 如何理解http 状态码

### 6. 概括 http 特点和缺点

### 7. accept 字段了解多少 （数据格式 、压缩方案、支持语言、 字符集）

### 8. http 对于定长 与不定长数据处理

1. 定长 ： 设置 ` header : "Content-Length"  `
2. 不定长： 头部设置`Transfer-Encoding:chunked`

### 9. HTTP 处理大文件方式；

```
HTTP/1.1 206 Partial Content 
Content-Type: multipart/byteranges; boundary=00000010101 
Content-Length: 189 
Connection: keep-alive 
Accept-Ranges: bytes 
--00000010101 
Content-Type: text/plain 
Content-Range: bytes 0-9/96 
i am xxxxx 
--00000010101    // 分割
Content-Type: text/plain 
Content-Range: bytes 20-29/96 
eex jspy e 
--00000010101--  //分割结束
```

### 10. HTTP 如何处理表单数据

他们区别在于Content-Type的不同；

1. application/x-www-form-urlencoded
   1. 数据会被编码成 以 & 分割的键值对
   2. 字符以URL编码方式 编码（只允许数字 字符 和几个符号 ）
   `{a:1,b:2} ===> 'a=1&b=2'  ===>   'a%3D1%26b%3D2'`
2. multipart/form-data
   1. 请求头 Content-Type 设置`Content-Type: multipart/form-data;boundary=----WebkitFormBoundaryRRJKeWfHPGrS4LKe`
   2. 数据分割成多个部分，每个部分用Content-Type 中设定的分隔符进行分隔。、

> 实际场景中图片等文件使用 multipart/form-data ，避免进行URL的编码

### 11. HTTP1.1 解决 队头阻塞问题

1. 并发连接（chrome 一个域名 限制了6个并发数）
2. 域名分片 （ 设置多个子域名）

### 12. 对Cookie了解多少

1. HTTP 是无状态的协议，每次请求后都没有保留任何信息，如果需要保留信息就需要用到Cookie。
2. Cookie 本质上是存储在浏览器的一个小文件（以键值对）(同源限制)
3. Cookie 属性
   - 生存周期： 通过 Expires 、 Max-Age 控制，超时就会删除
     - Expires：过期时间
     - Max-Age： 间隔时间，从浏览器收到报文开始计算
   - 作用域 ： 通过 Domain 、 Path 控制
     - Domain： 指定可以接受的主机，不指定默认`origin` 不包含子域名，指定就包含子名。
     - Path： 指定哪些路径可以接受Cookie
   - 安全相关：
     - Source： 设定后 只能通过HTTPS 传输Cookie
     - HttpOnly ： 设定后 只能http协议传输，不能用js 访问 （预防xss攻击重要手段）
     - SameSite： 预防CSRF攻击
       - Strict 模式： 浏览器 完全禁止第三方请求 携带Cookie；
       - Lax 模式：  可以在get 方法提交表单 或 a 标签发送get 请求可以携带Cookie，其他情况不行；
       - None模式 ： 请求自动携带Cookie
   - Cookie缺点
     - 容量上限 4kB
     - 性能缺陷 ： Cookie与域名绑定，不管要不要都会带上Cookie。影响性能
     - 安全缺陷： 以纯文本形式发给服务器，回给截获篡改。

### 13. 如何理解HTTP 代理

1. 充当一个中间角色 可进行 负债均衡 、服务器健康检测、缓存代理。
2. 相关头部字段：
   1. Via ： 记录j经过通过的代理有哪些 ` Via: proxy_server1,proxy_server2  `
   2. X-Forwarded-For ： 记录请求方的 IP 地址 （不一定是最初的IP）
   3. X-Real-IP ： 记录最初请求的 IP
   4. X-Forwarded-Host  X-Forwarded-Proto： 记录 **客户端** 的域名和协议名。
3. X-Forwarded-For带来的问题

   1. 每次转发都回解析 HTTP 请求头并修改，降低转发数据性能。
   2. HTTPS通信加密过程中，原始报文不允许修改。

   为了解决上面的问题，产生了 **代理协议**

```yml
// PROXY + TCP4/TCP6 + 请求方地址 + 接收方地址 + 请求端口 + 接收端口
PROXY TCP4 0.0.0.1 0.0.0.2 1111 2222
GET / HTTP/1.1       
```

### 14. 如何理解HTTP缓存和缓存代理

1. **源服务器** 控制浏览器数据请求有4个字段：
   - 强缓存：（Expires 、Cache-Control）
   1. Expires (Http1.0)： 过期时间，如果在时间内，浏览器直接读取缓存，
   2. Cache-Control (Http1.1)：（常用属性如下）
      1. max-age ： 设置资源可以被缓存多久，秒为单位。
      2. s-maxage： 类似 max-age，但它针对的是代理服务器。
      3. public： 指示响应可以被任何缓存区缓存。
      4. private：只能针对个人用户，而不能被代理服务器缓存。
      5. no-cache： 强制客户段只能向服务器发送请求， 如果返回304 就使用之前的缓存（实际上是缓存的，但每次使用都要向服务器询问）
      6. no-store： 禁止一切缓存。
   - 协商缓存：Last-Modified 、Etag
   1. Last-Modifed / If-Modified-Since (1.0) （单位：秒）:
      1. Last-Modified:  浏览器向 服务器发送资源最后修改时间；
      2. If-Modifed_Since：  请求时 字段携带资源最后修改时间，服务器对比 没法变返回304，继续使用资源。
   2. Etag / If-None-Match (1.1):
      1. Etag ：默认是 文件的索引节(INode)、 大小（Size）、最后修改时间（MTime）进行 Hash 后的值， 用于服务端控制Web端的缓存验证。
      2. If-None-Match： 请求时填充缓存的Etag值给服务器，判断是否修改。没有修改返回304，客户端继续使用缓存
2. **代理服务器** 的缓存字段
   1. private 、public ： 在Cache-Control字段 如果是public，允许代理服务器缓存，private则不允许。
   2. proxy-revalidate :  表示代理服务器资源过期就去服务器获取。同理 在客户端must-revalidate 表示客户端缓存过期就去服务器获取。
   3. s-maxage： 等同于 max-age，表示缓存在代理服务器中存放多久
3. **客户端** 的缓存控制
   1. max-stale ： 对代理服务器缓存进行宽容。 `max-stale:5` 表示缓存过期5秒内都没关系
   2. min-fresh ： 对代理服务器缓存进行宽容。`max-fresh:5` 表示缓存到期前5秒内才能拿到
   3. only-if-cached： 表示客户端只回接受代理缓存，不会接受源服务器的响应。若代理无效，直接返回 `504 Gateway Timeout`

### 15. 什么是跨域？ 浏览器如何拦截响应？ 解决办法？

- 跨域： 浏览器发送请求，若当前URL 与目标URL不同源，则产生跨域请求。
- 同源概念： scheme (协议) 、 host (主机) 、port (端口) 三者相同就为同源。
- 非同源的限制：
  - 不能读取和修改对方的DOM。
  - 不能访问对方的Cookie、IndexDB、LocalStorage
  - 限制 XMLHttpRequest 请求。

**跨域拦截原理**

> 浏览器渲染页面过程请看[[浏览器输入URL到渲染过程-浏览器原理]]
> 每一个站点都用一个 render Process 进行渲染，防止黑客通过脚本获取系统资源浏览器会把render Process 装到沙箱中（每个一级域名一个沙箱）。
> 如果沙箱的渲染进程需要发送请求，需要通过 IPC 通信发给浏览器主进程。
> 浏览器进程收到数据发送请求并响应返回，如果这时检测到跨域，且没有 CORS 响应头，浏览器进程会把响应体全部丢掉，不会发给渲染进程。从而形成响应。

#### 跨域解决办法

1. CORS ( 跨域资源共享 )  ：
   1. 前置概念：
   2. 简单请求：
      1. 请求方法为 GET 、POST、 HEAD
      2. 请求头的取值范围： Accept、Accept-Language、Content- Language、Content-Type（只限于 application/x-www-form-urlencoded、 multipart/form-data、text/plain）
   3. 简单请求发送前，浏览器会进行什么操作
      1. 请求头添加 Origin 字段，服务器收到请求返回时添加 `Access-Control-Allow-Origin`字段，如果浏览器判断 Origin不在其中就会进行按揭
      2. Access-Control-Allow-Credentials ：布尔值 ，表示能否发送Cookie，对于跨域请求默认 false 。如果需要 Cookie 需要在前端设置 `  withCredentials = true `
      3. Access-Control-Expose-Headers : 列出哪些部首可作为响应暴露给外界。默认有（Cache-Control、Content-Language、Content-Length、Content-Type 、Expires、Last-Modified、Pragma）
   4. 非简单请求： 简单请求外的请求。
      1. 区别于简单请求，有 预检请求 （OPTIONS 请求）和 相关响应字段。
      2. 如果不满足 OPTIONS当前请求中的要求，则出发 XMLHttpRequest 的error方法
2. JSONP 方式

```js
const jsonp = ({ url, params, callback }) => {

const genUrl = () => {

let dataStr = '';

for (let key in params) {

dataStr += `${key}=${params[key]}&`;

}

  

dataStr += `callback=${callback}`;

  

return `${url}?${dataStr}`;

};

  

return new Promise((resolve, rejects) => {

//初始化 回调名称

const cbName = callback ?? Math.random().toString().replace(',', '');

let scriptElement = document.createElement('script');

scriptElement.src = genUrl(url, params, cbName);

  

document.body.appendChild(scriptElement);

  

// 添加回调 触发, 用于jsonp文件请求完后触发

window[cbName] = (data) => {

resolve(data);

document.body.removeChild(scriptElement);

};

});

};

// 前台调用跨域

jsonp({

url: 'http://localhost:3000',

params: {

a: 1,

b: 2,

},

}).then((data) => {

console.log(data); //数据

});

  

// 服务器放回的js 文件. 返回带参数的函数调用

// callbackName(data)
```

3. Nginx 方向代理

### 16 . TLS 1.2 的握手过程时怎么样的？

### 17.  HTTP2.0



