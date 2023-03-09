---
date created: 2022-05-01 10:11
date updated: 2022-05-01 11:15
---

## FC（Formatting Context）

它是W3C CSS2.1规范中的一个概念，定义的是页面中的一块渲染区域，并且有一套渲染规则，它**决定了其子元素将如何定位**，以及**和其他元素的关系和相互作用**。

## IFC

行内元素(inline element)会形成`IFC` , display属性为：`inline` `inline-block` `inline-table`

### IFC布局规则

1. IFC 中的每一个盒子(box) ,一个接一个水平排列，
2. 水平方向的 `margin` `border` `padding` 属性会进行保留。
3. 垂直方向上可以以不同的方式对齐：（vertical-align）
4. 能把在一行上的框都完全包含进去的一个矩形区域，被称为该行的行框（line box）。行框的宽度是由包含块（containing box）和与其中的浮动来决定
5. “line box”一般左右边贴紧其包含块，但 float 元素会优先排列
6. “line box”高度由 CSS 行高计算规则来确定，同个IFC下的多个 line box 高度可能会不同
7. 当 inline-level boxes 的总宽度少于包含它们的 line box 时，其水平渲染规则由 text-align属性值来决定
8. 当一个“inline box”超过父元素的宽度时，它会被分割成多个 boxes，这些 boxes 分布在多个“line box”中。如果子元素未设置强制换行的情况下，“inline box”将不可被分割，将会溢出父元素

## BFC

块级元素(block-level element)会形成`BFC` , display属性为：`inline` `inline-block` `inline-table`
BFC： Block Formatting Context ，块级格式化上下文，BFC决定元素对其内容的定位，以及当前元素与其他元素之间的相互作用。 它会形成一个独立的空间，这个空间内的元素不会影响到空间外的布局。

### BFC布局规则

1. 内部的box 在垂直方向，一个一个的排列

2. box垂直方向元素距离由`margin` 决定，属于同一个BFC 两个相邻的`margin`会发生合并。

3. 内部每个元素的margin box的左边， 与触发了BFC的元素的包含块border box的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。

4. BFC的区域不会与float box重叠。

5. BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。

6. 计算BFC的高度时，内部的浮动元素也参与计算

触发BFC的条件：（简称OFDP）根元素 默认的BFC

1. 子元素或父元素的float 不为 none
2. 子元素或父元素的 position 不为 relative 或static
3. 父元素的overflow 为 auto、 scroll、 hidden
4. 父元素的display 为 table-cell 、inline-block

BFC 使用场景：
1. 去除边距重叠
2. 清除浮动
3. 避免某元素被浮动元素覆盖。
4. 避免多列布局因宽度计算四舍五入而自动换行