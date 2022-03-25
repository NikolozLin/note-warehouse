---
date created: 2022-03-22 16:41
date updated: 2022-03-23 09:32
---

## 一、Chorme基本架构

![[chrome-v8-architecture.jpg]]

| 进程       | 作用                                                                          |
| -------- | --------------------------------------------------------------------------- |
| Browser  | 浏览器进程，控制应用程序的“chrome”部分，包括地址栏、书签、后退和前进按钮。 还处理 Web 浏览器的不可见的特权部分，例如网络请求和文件访问。 |
| Renderer | 渲染器进程，控制显示网站的选项卡内的任何内容。                                                     |
| Plugin   | 插件进程，控制网站使用的任何插件，例如 flash。                                                  |
| GPU      | 图形处理进程，独立于其他进程处理 GPU 任务。它被分成不同的进程，因为 GPU 处理来自多个应用程序的请求并将它们绘制在同一个表面上。        |

## 二、路由导航

### 输入导航
1. 处理输入
	- 地址栏输入内容，*UI thread* 判断输入是URL或搜索关键字。
		- 关键字：发送到搜索引擎。URL：发送到请求站点。
2. 开始寻找
	-  按下回车，*UI thread*发起通知*network thread*获取站点内容（同时控制选项卡上出现loading Spinner）。
	- *network thread*通过合适的协议，进行DNS解析、为请求建立TLS连接。
	- 如果*network thread* 收到重定向的响应头，此时线程会通知*UI thread* 当前请求的服务器要求重定向，之后，另外一个URL请求被触发。
3. 读取响应
	- 请求响应后，*network thread*根据响应头中的`Conte-Type`和`MIME Type`判断响应的内容。
	- 如果内容格式是html，下一步这些数据会传递给*render process*。如果是zip或其他文件，相关数据会传递给下下载管理器
	- *Safe Browsing（chrome的一个机制）* 检查会在这个时候触发，对域名和请求内容与已知的恶意站点匹配。同时，CORB检测也会触发确保敏感数据不会传递给渲染进程。
4. 查找渲染进程
	- 完成上面所有检查，*network thread*确定浏览器可以导航到所请求的网页。*network thread*会通知*UI thread*数据准备好了，*UI thread*会找到一个*render Process*进行页面渲染
	> 由于网络请求响应需要时间，这个会进行一个流程加速。*UI thread*发送请求给*network thread*时，浏览器已经知道将要导航到那个站点了。*UI thread* 会预先查找和启动一个*render Process*。如果全部正常，*network thread*收到数据，渲染进程也准备好了。但如果遇到重定向，就只能重新准备一个新的渲染进程。
5. 确认导航
	- 数据和渲染进程准备好后，*Browser Process*
### 路由跳转

## 三、渲染




---
参考
1. https://zhuanlan.zhihu.com/p/47407398
2. https://juejin.cn/post/7039036362653171742#heading-6
3. https://mp.weixin.qq.com/s/0lz4vX3R7DcxuSdLJKEc8Q
