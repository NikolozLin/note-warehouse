 ---
date created: 2022-04-28 14:20
date updated: 2022-04-28 15:04
---

CSS 中 所有的元素可以看作被一个个的盒子（box）所包围。

## 盒模型分为两类：

1. 块级盒子（Block box）
   1. box会在 inline方向上拓展，并占据父容器在改方向上所有可用空间，大多情况下与父同宽。
   2. 每个盒子都会换行
   3. `width` `height` 都会生效
   4. padding、margin、border会将其他的元素从当前盒子周围 “推开”
2. 内联盒子（Inline box）
   1. 不换行
   2. `width` `height` 不起作用
   3. 垂直方向 padding、margin、border 会被应用，但**不会**吧其他 inline的元素推开
   4. 水平方向 padding、margin、border 会被应用，但**会**吧其他 inline的元素推开

## 什么是盒模型

完整的CSS盒模型应用于  BlockBox，InlineBox只能使用部分定义。
盒子从外向内分别为 margin、border、padding、content。合并在一起就是一个完整地盒模型
![[Box-model.png]]
盒子各个组成部分：

- margin box：最外层地区域，是盒子与其他元素之间地空白区域，通过`margin`属性控制
- border box：边框盒包裹内容盒内边距，通过`border`属性控制
- padding box：包围在content box区域外地空白区域
- content box： 该区域用来显示内容，大小可以通过`width` `height` 控制

### 标准盒模型 (默认)

`box-sizing: content-box`
一般`width` `height` 属性影响了盒模型的大小，默认情况下是控制content box的大小。

### 代替(IE)盒模型

`box-sizing: border-box`
此时`width` `height` 属性大小指的是 border的大小。

## margin合并 （发生在Block Level）
>  如果设置 float 或 position 为absolute 不会发生合并

如果存在两个margin相接的元素，他们的margin会和合并在一起，值为两者最大值。
什么情况会发生合并：

1. 同一层级相邻元素
![[margin -merge1.png]]
2. 元素是父子关系，
	1. 上边界塌陷
		- 父子之间没有设定padding、border，行内内容。
		-  没有创建BFC
		-  没有clear-fix清除浮动
	2. 下边界塌陷
		- 没有border、padding、行内内容、高度`height`?、最小高度`min-height`?、最大高度`max-height`?，来分开一个块级元素的下边界`margin-bottom`与其内的一个或多个后代后代块元素的下边界`margin-bottom`
![[margin -merge2.png]]
3. 一个空元素，没有边框和填充
	![[margin -merge3.1.png]]
	上面的情况下，遇到另外元素的外边框。
	![[margin -merge3.2.png]]

### margin合并解决方法
第一个现象 解决办法：
1. 两个相邻元素只设定一个margin
2. 给两个元素添加父元素然后触发BFC （不推荐 会改变原有的结构）

第二个现象：
1. 给父元素设置 border 或padding （不建议，会改变盒子大小）
2. 父元素触发BFC [[BFC 和IFC]]



## 盒子模型与InlineBox 
属于 Inline box 的常见元素 a 、 span、br 、i、 label等标签。
元素上的 width、height、margin-top 、margin-bottom是无效的。
margin-left、margin-right、border、padding 是生效的

**display：inline-block**
让内连元素可以设定 width、height等，同时还能与其它元素 在同一行