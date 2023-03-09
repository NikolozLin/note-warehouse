# fixed 属性失效问题
 **原因：** 当元素祖先的 `transform`, `perspective` 或 `filter` 属性非 `none` 时，容器由视口改为该祖先。（原本根据viewport 定位。）

1. 当上面的属性不为`none` 时， 都会创建一个层叠上下文和包含块。
2. 那么子元素position：fixed 属性 的固定位置就改变了，基于这个祖先，不再基于viewport。
