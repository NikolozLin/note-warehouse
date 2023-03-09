# position 定位
作用：决定元素在文档中的定位方式， 
属性值 ：
1. static （正常定位）
2. relative （相对定位）
3. absolute（绝对定位）
4. fixed      （固定定位）
5. sticky    （粘性定位）


## static 
position值为 static ，元素的top、right、bottom、left、z-index 等属性都不生效。

## relative
position值为 relative ，元素不设置top、right、bottom、left属性时，所在位置与static 一样。
当元素设置 top、right、left、bottom这些值，元素会相对于 属性为static时位置进行移动

## absolute 
position值为 absolute ，元素脱离了文档流，元素会离自身最近的非static 定位祖先元素的位置进行偏移。，absolute元素的margin不会和别的边距合并。

## fixed 
position值为 fixed ，元素脱离了文档流，元素会相对于 *屏幕视口 （viewport）* 的位置来指定元素位置。 SO，元素不会随着屏幕滚动而滚动。 fixed 属性会创建新的 层叠上下文。
当元素祖先的 transform、perspective 或 filter属性不为 `none` 时，容器视口改为祖先。
> 视口改变：[[positon ：fixed  定位视界口改变问题]]

## sticky
元素根据正常文档流进行定位，然后相对它的*最近滚动祖先（nearest scrolling ancestor）* 和 *containing block最近块级祖先* ，包括table-related元素，
基于`top`, `right`, `bottom`, 和 `left`的值进行偏移。偏移值不会影响任何其他元素的位置(偏移量的定位是最近滚动祖先)
>有点类似 relative和 fixed 的组合，元素根据正常的文档流进行定位。
>当元素位置超过设定的top, right, bottom 或 left 之一 ,就会显示出与fixed 一样的特性。
>如果没有设定 上面的值，那么他的特性依旧和realative 一样。

该值总是创建一个新的[层叠上下文（stacking context](https://developer.mozilla.org/en/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)）。注意，一个sticky元素会“固定”在离它最近的一个拥有“滚动机制”的祖先上（当该祖先的`overflow` 是 `hidden`, `scroll`, `auto`, 或 `overlay`时），即便这个祖先不是最近的真实可滚动祖先。这有效地抑制了任何“sticky”行为

