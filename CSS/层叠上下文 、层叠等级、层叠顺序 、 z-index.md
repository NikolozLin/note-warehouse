## 引言
只有当`position`属性的值不为 static。，设置的`z-index`的值才有效。但是一个元素的堆叠顺序不只和`z-index`有关系 还和*层叠上下文* 、*层叠等级* 共同决定。

##  层叠上下文 stacking context
可以理解为，一个屏幕显示是画面是一个多图层合并的画，每个图层为一个层叠上下文。
## 层叠等级
含义：
1.  同一个层叠上下文中， 该层中元素在 *z轴*上的上下顺序
2. 其他普通元素，普通元素在*z轴*上的上下顺序
> 综上， 不同层叠上下文之间的元素没有可比性。

## 如何产生 层叠上下文
1. `HTML`中国呢的根元素`<html></html>` 本身具有层叠上下文，称为**根层上下文**
2. 普通元素的`position`属性不为`static`时，并设置了`z-index`具体 数值时
3. CSS3中新属性也可以产生上下文   [详细参考](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)


## 层叠顺序
![[stacking-level.png]]
1.   形成堆叠上下文环境的元素的背景与边框
    
2.   拥有负 `z-index` 的子堆叠上下文元素 （负的越高越堆叠层级越低）
    
3.   正常流式布局，非 `inline-block`，无 `position` 定位（static除外）的子元素
    
4.   无 `position` 定位（static除外）的 float 浮动元素
    
5.   正常流式布局， `inline-block`元素，无 `position` 定位（static除外）的子元素（包括 display:table 和 display:inline ）
    
6.   拥有 `z-index:0` 的子堆叠上下文元素
    
7.   拥有正 `z-index:` 的子堆叠上下文元素（正的越低越堆叠层级越低）