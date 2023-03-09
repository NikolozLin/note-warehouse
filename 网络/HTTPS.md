---
date created: 2022-10-22 22:08
date updated: 2022-10-24 16:18
---

[文章](https://juejin.cn/post/6895624327896432654#heading-8)
HTTPS=HTTP+TLS

> RSA、TLS1.2 、TLS1.3 三个版本的握手方式
> 总体过程 先用非对称加密交互密钥，后续的信息交流使用对称加密 进行数据加密。

## 基础概念

1. **对称加密** ：DES、AES
2. **非对称加密** ：
   - RSA加密：
   - ECC加密： 基于"椭圆曲线离散对数"的数学难题，用特定曲线方程和基点生成公钥和私钥，子算法ECDHE用于密钥交换，ECDSA用于数字签名。
3. **混合加密**： TLS使用的加密方式，通信开始阶段使用非对称加密，解决密钥交换问题。后续使用对称加密进行通信。
4. **加密套件**： 客户端发送，供服务器选择。用openssl 查看
   ```scss
   ➜ openssl ciphers -v
    ECDHE-RSA-AES256-GCM-SHA384     TLSv1.2 Kx=ECDH Au=RSA Enc=AESGCM(256) Mac=AEAD
    ECDHE-ECDSA-AES256-GCM-SHA384   TLSv1.2 Kx=ECDH Au=ECDSA Enc=AESGCM(256) Mac=AEAD 
    AES256-SHA256                   TLSv1.2 Kx=RSA Au=RSA Enc=AES(256) Mac=SHA256 
      ... 
      ... Cipher Suites(17 suites)
   ```
   ![[HTTPS 加密套件.png]]
   含义：
   - TLS 握手过程中 使用 ECDHE 算法生成 pre_random
   - 身份验证（签名） 使用RSA算法
   - 对称加密使用 128位的 AES 算法， 对称加密过程中使用 GCM 分组模式，可以让算法使用固定长度的密钥加密任意长度的明文。
   - 最后是用于数据完整性校验的哈希摘要算法，SHA256 算法。
   - 数字证书
5. **数字证书**
   作用：
   1. 服务器向浏览器证明自己身份
   2. 将公钥传给浏览器
      数字证书由权威、受信任的证书颁发机构( CA ) 授予的。

## RSA 握手 加密过程

> 传统的加密方式

![[https ras.png]]
详细流程：

1. 浏览器向服务器发送随机数 client_random 、TLS 版本和供筛选的加密套件列表。
2. 服务器收到，立刻返回 server_random，确定好双方都支持的加密套件、以及数字证书（其中附带了公钥）
3. 浏览器接收，先验证数字证书。如通过，使用加密套件的密钥协商算法 RSA 算法生成随机数 pre_random，并用证书的公钥加密，发送给服务端。
4. 服务端接收后，用私钥解密出 pre_random 。
5. 后续的数据传递，使用 Session key 进行对称加密。

> Session key 由 client_random、 server_random 、pre_random 三个随机数，通过协商的加密算法生成。

## DH 握手

![[https DH.png]]
详细流程和RSA对比

1. 浏览器向服务器发送随机数 client_random 、TLS 版本和供筛选的加密套件列表。
2. 服务端 有两次操作：
   1. 服务器收到，立刻返回 server_random，确定好双方都支持的加密套件、以及数字证书（其中附带了公钥）
   2. 同时，服务器利用公钥将 client_random、server_random、 server_params 签名，然后将签名 和 server_params 发送给客户端（DH 算法需要 server_params 参数）
3. 浏览器接收， 先验证证书和 签名（公钥验证）。如果如果通过将 client_params（ DH 所需） 发送给服务器，
4. 浏览器与服务器 都有了client_params 、server_params 两个参数，ECDHE （基于“椭圆曲线离散对数”  需要两参数）通过两个参数计算出 pre_random
5. 后续通过 client_random 、 server_random、pre_random 生成用于对称加密的 Session_key

> 客户端生成 Session_key 后会发送一个收尾消息，告诉服务端后续使用对称加密来通信，服务端也一样

> DH 解决了 服务器private_key 泄漏的时，中间生成的Session_key 会泄漏的安全问题
> 因为 DH算法是两端各自生成 pre_random ，不会通过网络传输这个 可以 。并且每个链接的key 都会不一样。

## TLS1.2 加密过程

TLS1.2 加密过程类似DH算法。如果加密方式 根据选择的加密套件而定

## TLS1.3 加密过程

1.3 相对于1.2 再 安全、性能方便做改进。1.3中加密算法 ECDHE 彻底取代了 RSA

> ECDHE 具有向前安全性（一次破解不影响历史消息的安全性）

### 安全

1.3废除许多加密算法，最后保留5个

- TLS_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256
- TLS_AES_128_GCM_8_SHA256

> 废弃RSA 原因
>
> 1. RSA 算法 被发现了 FREAK攻击 ，破解成为了可能
> 2. 如果私钥泄漏了，那么历史传输过的数据都会被破解。

### 性能提升

一、 流程优化：
![[https TLS 1.3.png]]
相比1.2 少了一个 RTT（来回通信延迟）

1. 浏览器向服务器发送随机数 client_random 、client_parms（不同）、TLS 版本和供筛选的加密套件列表。
2. 服务器返回 server_random、server_params（不同）、TLS 版本、确定的加密套件方法以及证书。
3. 浏览器接收，先验证数字证书和签名。 现在双方都有 client_params、server_params，可以根据 ECDHE 计算出 pre_random 了。 后续双方根据计算出来 secret 进行对称加密。

二、 会话复用
有 Session ID 与 Session Ticket
- Session ID ：
	- 早期每次连接逗保留secret， 下次连接就复用原来的密钥。但是客户端连接多后服务器都顶不住了。
- Session Ticket ：
	- 第一次连接成功后，服务端加密通信，将 Session Ticket发送给客户端。让客户端保存。
	- 下次连接时，对发送来的 Session Ticket 进行解密， 验证没过期就直接回复会话状态。（因为secret 没有变 如果被破解历史消息也给破解，记得定时更换）

三、 psk 
可以优化道 0-RTT 的状态，但是存在风险