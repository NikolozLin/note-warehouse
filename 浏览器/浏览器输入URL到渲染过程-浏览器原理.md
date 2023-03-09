---
date created: 2022-03-22 16:41
date updated: 2023-03-04 10:46
---

## 一、Chorme基本架构

[浏览器架构](https://developer.chrome.com/blog/inside-browser-part1/)
![[chrome-v8-architecture.png]]

| 进程       | 作用                                                                          |
| -------- | --------------------------------------------------------------------------- |
| Browser  | 浏览器进程，控制应用程序的“chrome”部分，包括地址栏、书签、后退和前进按钮。 还处理 Web 浏览器的不可见的特权部分，例如网络请求和文件访问。 |
| Renderer | 渲染器进程，控制显示网站的选项卡内的任何内容。                                                     |
| Plugin   | 插件进程，控制网站使用的任何插件，例如 flash。                                                  |
| GPU      | 图形处理进程，独立于其他进程处理 GPU 任务。它被分成不同的进程，因为 GPU 处理来自多个应用程序的请求并将它们绘制在同一个表面上。        |

## 二、路由导航

### 输入导航

1. 处理输入
   - 地址栏输入内容，_UI thread_ 判断输入是URL或搜索关键字。
     - 关键字：发送到搜索引擎。URL：发送到请求站点。
2. 开始寻找
   - 按下回车，_UI thread_发起通知_network thread_获取站点内容（同时控制选项卡上出现loading Spinner）。
   - _network thread_通过合适的协议，进行DNS解析、为请求建立TLS连接。
   - 如果_network thread_ 收到重定向的响应头，此时线程会通知_UI thread_ 当前请求的服务器要求重定向，之后，另外一个URL请求被触发。
3. 读取响应
   - 请求响应后，_network thread_根据响应头中的`Conte-Type`和`MIME Type`判断响应的内容。
   - 如果内容格式是html，下一步这些数据会传递给_render process_。如果是zip或其他文件，相关数据会传递给下下载管理器
   - _Safe Browsing（chrome的一个机制）_ 检查会在这个时候触发，对域名和请求内容与已知的恶意站点匹配。同时，CORB检测也会触发确保敏感数据不会传递给渲染进程。
4. 查找渲染进程
   - 完成上面所有检查，_network thread_确定浏览器可以导航到所请求的网页。_network thread_会通知_UI thread_数据准备好了，_UI thread_会找到一个_render Process_进行页面渲染
   > 由于网络请求响应需要时间，这个会进行一个流程加速。_UI thread_发送请求给_network thread_时，浏览器已经知道将要导航到那个站点了。_UI thread_ 会预先查找和启动一个_render Process_。如果全部正常，_network thread_收到数据，渲染进程也准备好了。但如果遇到重定向，就只能重新准备一个新的渲染进程。
5. 确认导航
   - 当上述的检查都完成后，数据和渲染进程都准备好了。_Browser Process_ 会给_Render Process_发送IPC消息来确认导航。一旦_Browser Process_收到来自_Render Process_的渲染确认消息，导航过程结束，页面加载过程开始。
   - 与此同时，地址栏会更新，展示出新页面的网页信息。History Tab会更新，可以通过返回键返回导航来的页面。为了让关闭的发tab或者窗口便于回复，这些页面信息会存放在硬盘中。
6. 额外的步骤
   - 一旦导航确认，_render Process_会使用相关的资源渲染页面。渲染结束（页面内的所有页面，包括iframe都触发了onload），会发送IPC信号到_Browser Process_，_UI Thread_会停止显示tab页中spinner。

其他：

- 所有的JS代码都是由_render Process_控制的，所以浏览网页的内容的大部分过程不会涉及到其他进程。有些是例外，
  - 如`beforeunload`事件，这个事件就会涉及_Browser Process_和_render Process_的互交。当页面关闭时（关闭tab、刷新等），_Browser Process_需要通知_render Process_进行相关检查，对相关事情进行处理。
  - 如果导航由_render Process_触发(用户点击链接、js执行`windwo.location="http://www.google.com"`),_render Process_会先检查是否有`beforeunload`事件处理器，导航请求会由于_render Process_ 发送到_Browser_。如果导航的新网站，就会启动新的_render Process_来处理新的页面渲染。老的进程留下来出来类似`unload`等事件
- 如果页面存在_service worker_（service worker是运行在渲染进程中的JS代码），上面的处理流程还会不一样。
  - 当_service worker_注册后，它的作用域会被保存。当_network thread_会在注册过_service worker_的作用域中检查相关的域名，如果存在对应的_serviceworker_，_UI thread_会找到一个_render Process_来处理相关代码，此时的_service worker_可能会从cache中加载数据，从而终止对网络的请求，也可能从网上请求新的数据。

## 三、渲染

---

渲染进程几乎复制tab页内所有事情，核心在于转换HTML、CSS、JS为用户可以互交的web页面。
渲染进程`render Process`包含下面的线程：

1. 主线程 Main Thread
   处理绝大多数你发送给用户的代码

2. 工作线程 Work Thread

3. 合成线程 Compositor Thread

4. 光栅线程 Raster Thread
   与compositor Thread 合作进行页面高效渲染

### 步骤

1. 渲染进程接受HTML数据，主线程会解析文本字符串为DOM。
2. 加载次级资源
   例如图片、css样式以及js脚本等资源会从缓存中或者网络上获取。主线程在构建DOM树的时候，遇到的每个资源都会顺序发器网络请求。 同时为了浏览器会运行 _预加载扫描(prelaod scanner)_ 如果HTML有类型 img link的标签，scanner会吧这些请求传递给_Browser Process_中的_network Thread_进行下载。
3. JS的下载与执行
   遇到`<script>`标签的时候，渲染器停止解析HTML，而去加载、解析、执行JS代码。这是因为JS代码可能会改变DOM结构。
   如果不行让JS代码阻塞HTML解析，可以在标签添加defer、async 属性。
4. 样式计算- sytle calculation
   主线程根据CSS样式选择器计算出每一个DOM的样式。如果没有提供CSS，就浏览器对每一个元素都有一个默认的样式。
5. 布局-layout
   根据上面的解析，`HTML`解析成`DOM Tree`,`  CSS `解析成 `CSSOM Tree`。 之后，主线程遍历`DOM Tree`上的每个节点，并根据 `CSSOM Tree` 计算出一个布局树（layout tree）。
   `layout tree`哟欧美个节点在界面上的X、Y坐标和盒子大小信息。
   如果一个节点设置了 _display：none_ 那么该节点是不会出现在`layout tree`上的
6. 绘制-paint
   主线程根据`layout tree` 生成一系列的绘制记录(paint records). 绘制记录是对绘制过程的注释，对各个元素绘制顺序的记录。
7. 合成
   现代浏览器使用合成（compositing）的做法来显示信息到屏幕上。

   > 浏览器将得到`DOM Tree`、`CSSOM Tree`、`layout tree`、`paint records`后，将这些信息转化为显示器上面的像素的过程叫做光栅化（rasterizing）。

   **合成**：将页面分成若干层，然后分别对它们进行光栅化，最后再在单独的合成线程（`compositor Thread`）合并成一个页面帧。当页面滚动或者动画效果，都是将各个层重新合成一个帧然后渲染。

   > 通过Dev Tools 中的Layers Panel 可以查看站点是如何分层的。

   - 页面分层
     主线程遍历渲染树来创建一颗层次树（Layer Tree），来确认各个元素应该放置在那一层。
     > 如果某些元素应该单独放置一层的但是没有的话，可以添加`will-change`的CSS属性来告诉浏览器进行分层。
     > 当页面层数超过一定数量后，层合成操作会比在每个帧中光栅化一小部分还慢。所以一些让元素独立一层的方法也不能滥用。
   - 主线程外的光栅化和合成页面
     1. 当页面的`layout tree`和元素的绘制顺序确定后，主线程会向合成线程（compositor thread）提交这些信息。
     2. 合成线程光栅化页面的每一层。因为页面的每一层有可能有整个页面那么大，所以`compositor thread`需要将他们分割成一块块的小图块（tiles），然后将图块发送给一系列光栅线程`rester thread`。光栅线程会吧每个图块存储在GPU的内存中。
        > 合成线程可以给予不同的光栅线程赋予不同的优先级，让`viewport`附近的页面可以先给光栅化。同时为了响应用户对页面的放大缩小，页面的图层（layer）会为不同的清晰度配备不同的图块。
     3. 当所有图块都被光栅化后，合成线程会收集图块上面叫_绘画四边形（draw quads）_ 的信息来构建一个_合成帧(compositor frame)_ .
        - 绘画四边形：包含图块的_内存位置_以及图层合成后 图块在页面的位置等信息
        - 合成帧：代表页面一个帧的内容的绘制四边形集合。
     4. 上面步骤完成后，合成线程通过IPC向`browser process`提交（commit）一个渲染帧。此时有可能会有另外一个合成帧被`browser process`的 `UI thread`提交以改变浏览器UI。这些合成帧会发送到GPU从而显示在屏幕上。

   合成的好处在于没有涉及到主线程，所以合成线程不需要等待样式的计算和JS完成运行。

## 到达 合成线程的输入

渲染完毕后，用户在界面上操作时浏览器做了什么。

- **浏览器处理输入事件**
  当用户点击、输入、移动鼠标、触碰屏幕等操作后，浏览器进程`Browser process`会将这些事件的类型和坐标发送给渲染进程`render process`。渲染进程会找到目标`target`对象，然后运行这个事件绑定的监听函数`listener`。
- **合成线程处理输入事件**
  合成线程独立于啊主线程外通过合成栅格化层平滑的滚动。如果页面中没有绑定相关事件，合成线程独立于主线程创建合成帧。如果绑定了事件就需要主线程参与了。
  > 概念：  非快速滚动区域 （non-fast scrollable region）
  > 页面的JS代码在主线程中运行，当一个页面被合成时，合成线程回将页面组册了时间监听器的区域标记为‘非快速滚动区域’。如果用户输入在这些区域，那么_合成线程_会把输入事件发送给_主线程_处理。如果不是 那么合成线程就无须主线程参与直接合成新的帧。
- **编写监听器注意点**
  web常见的有事件委托且事件会冒泡。如果在顶层元素绑定了一个监听器，那它的所有子元素会冒泡到顶层处理。\
  假设在body绑定了监听器，那么整个页面都会是非快速滚动区域欧`non-fast scrollable region`,页面上的事件都需要主线程参与处理，这中情况下合成线程就失去提供流畅用户体验的能力了。\
  为了处理这样的场景，可以在监听器传递`passive：true`选项。这样告诉浏览器在主线程监听事件，但合成线程可以继续合成新的帧。
  ```js
  document.body.addEventListener('touchstart', event => {
      if (event.target === area) {
          event.preventDefault()
  	    }
   }, {passive: true});
  ```
- 查找事件的目标对象
  合成线程向主线程发送输入事件时，主线程会进行`hit test`.
  > 命中测试`hit test` :
  > 遍历渲染流水中的绘制记录`paint records`来找到输入事件的X、Y做坐标轴对应绘制的对象时那个。
- 事件优化
  屏幕刷新频率一般为60次， 我们可以让JS代码执行的频率和屏幕刷行频率报次一致，以此实现页面的平滑动画效果。  有些操作的触发量远大于整个值，那么chrome会合并这些连续的事件（如 wheel, mousewheel, mousemove, pointermove, touchmove），并将调度延迟到下一个`requestAnimationFrame`之前。\
  想不频繁触发的事件，如`keydown`，`keyup`，`mouseup`，`mousedown`，`touchstart`和`touchend`等会立马派送给主线程。
- 使用`getCoalesecedEvents`来获取帧内的事件
  合并事件虽然能提高性能，但如果需要用到`touchmove`坐标来绘图的话。上面的事件合并已经无法满足需求了。这是就可以使用`getCoalesecedEvents`来获取被合成事件的详细信息。
  ```js
  	window.addEventListener('pointermove', event => {
  	    const events = event.getCoalescedEvents();
  	    for (let event of events) {
  	        const x = event.pageX;
  	        const y = event.pageY;
  	        // draw a line using x and y coordinates.
  	    }
  	});
  ```

---

## 四、渲染后每一帧渲染流程


![[V8-RenderThread-oneFream.png]]



---

参考

1. <https://zhuanlan.zhihu.com/p/47407398>
2. <https://juejin.cn/post/7039036362653171742#heading-6>
3. <https://mp.weixin.qq.com/s/0lz4vX3R7DcxuSdLJKEc8Q>
4. 页面渲染帧  <https://aerotwist.com/blog/the-anatomy-of-a-frame/>
5. chrome architecture <https://developer.chrome.com/blog/inside-browser-part1/>
