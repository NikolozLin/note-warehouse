---
date created: 2022-10-26 11:17
date updated: 2022-11-04 17:21
---

## HTML

### 1 . 如何理解HTML 语义化？

1. 用正确涵义的标签创建对应结构 （header nav main article section aside footer）
2. 语义化后没有CSS情况下，页面结构也会呈现很好的结构效果。
3. 结构清晰，利于开发与维护。
4. 有利于搜索引擎优化（SEO）

### 2.  script 标签的  defer 、async  属性

一般情况下， script 标签会阻塞 HTML 的解析。并进行js的下载执行。

1. defer:  不阻塞 HTML 解析，全部HTML 解析完后按顺序下载执行。
2. async：不阻塞 HTML 解析，脚本异步下载，下载完成立刻执行（可能中断HTML解析），因为是异步所以执行顺序不可控。

### 3. link 标签中的 preload 、prefetch、dns-prefetch 属性

1. link标签是用来引用css的，无法加载js 的。 如果添加 preload、prefetch属性就能加载js了。
2. 两者都只是下载资源不执行（缓存到 disk cache）。
3. 两者都不影响window.onload 事件。

#### preload

` <link rel="preload" as="script" href="./2.js" crossorigin="anonymous" onload="handleOnload()" onerror="handlepreloadError()">  `
含义：

- rel ：属性值 preload；
- as ：规定资源类型，浏览器据此设置请求头的 Accept 字段，以正常的策略去请求对应资源。如果忽略 as ，或者是错误的 as 值，会使得preload 等同与 XHR请求，浏览器不知道加载什么，会给他赋予非常低的优先级。
  > as的值属性可以是 script、style、image、font、fetch、document、audio、video等
- href ： 超链接，资源链接。
- crossorigin ： 用于请求跨域资源，不加可能会导致资源的二次加载。
- onload 、onerror： 加载成功、失败的回调函数。

优点：
preload 可以强行修改资源加载顺序。

```xml
  <link href="./3.css" rel="stylesheet" />
  <link href="./1.css" rel="preload" as="style" />
  <link href="./2.js" rel="preload" as="script" />
  <link href="./1.css" rel="prefetch" as="style" />
  <link href="./2.js" rel="prefetch" as="script" />
<!----------------->
<div id="app"></div>
<script src="/js/chunk-vendors.c161a506.js"></script>
<script src="/js/app.c5cc92e4.js"></script>
```

加载顺序结果为：

1. 2.html
2. 1.css
3. 2.js
4. 3.css
5. 2.js
6. 1.css

在上面，为了比 3.css先加载而使用了preload。 如果使用的话还需正确引用一次资源。

> preload后 直接加载CSS 办法。 提前加载完毕后修改rel 属性 将自己变成真正的外链CSS
> `<link href="./1.css" rel="preload" as="style" onload="this.rel=stylesheet">`

#### prefetch

prefetch用于加载“未来需要的资源”，且只有5分钟的生命周期。与preload 相比较都将数据预加载到 disk cache中，但是prefetch 优先级非常低。

#### dns-prefetch

提前解析站点的DNS，加快DNS解析域名的速度。

### 4.从浏览器数据URL 后发生了什么

[[浏览器输入URL到渲染过程-网络请求部分]]
[[浏览器输入URL到渲染过程-浏览器原理]]

## CSS

### 1. 盒模型介绍

CSS盒模型本质上是一个一层层的盒子，从外到内 margin 、border、padding、content 组成。
盒模型有两种，区别在于宽高 的包含范围，通过 box-sizing属性可以修改

- 标准盒模型 ：width= content box 宽度。
- IE盒模型： width = content box + padding box +border box 的宽度。

### 2.  选择器与优先级

选择器：

- id（`#id`）
- 类（`.classname` ）
- 属性选择器（`a[rel='external']`）
- 伪类（`:hover`）
- 伪元素（`::first-letter`）
- 标签选择器 （`div  h1 p`）
- 相邻选择器 （`  h1+p `）
- 子选择器 （`ul>li`）
- 后代选择器（` li a  `）
- 通配符选择器（`*`）

优先级 ： !important > 内联样式 > ID选择器 > 类、属性、伪类选择器 > 元素、伪元素选择器 > 关系、通配选择器

### 3.position 属性值

[[position属性]]

1. 默认定位 Static ： 正常文档流的位置（ top、botom、left、right、z-index 属性不生效）
2. 相对定位 relative ： 不设置 top、bottom、left、right值与static 一样，设置了则相对static 位置移动
3. 绝对定位 absolute：脱离文档流，远素会离自身最近的非static 定位祖先元素的位置进行偏移，absolute的margin 不会和别的margin合并
4. 固定定位  fixed ： 脱离文档流，相对 viewport 定位， 不会随着屏幕滚动而滚动，
5. 粘性定位 sticky ：根据正常文档流定位，然后根据 "最近滚动祖先"  和 "最近块级祖先" 基于 `top`，`right`,`bottom`,`left`的值进行偏移。 偏移不会影响其他元素的位置。

### 4. BFC 和 IFC

[[BFC 和IFC]]
FC： 规范中 来用规定页面一个渲染区域的渲染规则，规则决定其子元素如何定位，以及 和其他元素的关系和相互作用。

### 5. 垂直、水平居中方案

#### 水平居中

- 行内元素：父元素设置 `text-align:center`
- 块级元素：
  - 已知宽度：
    1. 设置子元素  `margin：0 auto`
    2. 子元素含有float
       ```css
       .parent{
           width:fit-content;
           margin:0 auto
       }

       .son{
           float:left;
       }
       ```
  - 未知宽度：
    1. flex盒子
       ```css
       .parent{
        display:flex;
        justify-content:center;
        }
       ```

    2. 绝对定位

       1. transform

       ```css
       .son{
           position:absolute;
           left:50%;
           tarnsform:tarnslate(-50%,0);
       }
       ```

       2. left：50%

       ```css
       .son{
           position:absolute;
           width:某宽度;
           left：50%；
           margin-left: -0.5*宽度；
       }
       ```

       3. left/right：0
    ```css
    	.son{
    		position:absolute;
    		width:宽度;
    		left:0;
    		right:0;
    		margin: 0 auto;
    		}
    ```

#### 垂直居中

- 行内元素

```css
  .parent{
	  height: 高度;
  }
  
  .son{
	  line-height:高度;
  }
```

- 块级元素
  - table
  ```css
  .parent{
    display:table;
  }

  .son{
    display:table-cell;
    vertical-align:center;
  }
  ```
  - flex
  ```css
  .parent{
    display:table;
  }

  .son{
    display:table-cell;
    vertical-align:center;
  }
  ```
  - 绝对定位
  ```css
  .parent{
    display:table;
  }

  .son{
    display:table-cell;
    vertical-align:center;
  }
  ```

### 6.隐藏页面某个元素的方法（引申到reflow、repaint）

1. `opacity：0`  隐藏元素，但是不会改变布局。且点击事件依然生效。
2. `visibility：hidden` 隐藏元素，不会改变布局，但是点击事件无效（repaint）
3. `display：none` 隐藏元素，同时改变布局（reflow+repaint）
> 回流、重绘浏览器会进行一个优化，浏览器维护一个队列，所有会引起 reflow 和 repaint 的操作放到队列中，当队列任务数到达某个值或时间间隔达到阀值，就清空队列 一起处理。把多次 reflow、repaint 变成一次。

[reflow 、repaint文章](https://juejin.cn/post/6844903569087266823#heading-4)

### 7. 常见的页面布局

1. Flex布局
   1.
2. Rem布局 （原理 等比例缩放）
   1. 根据html 根元素的 `font-size` 确定 1rem 是多少
   2. 依据设计搞用插件将 px 单位 转换为对应比例的 rem 单位
   > 确定ie不支持、响应布局需要js动态调整 font-size
3. 百分比布局
4. 浮动布局
