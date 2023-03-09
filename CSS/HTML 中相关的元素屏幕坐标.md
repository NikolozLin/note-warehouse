[文章链接](https://javascript.info/size-and-scroll#sample-element)
```html
<div id="example"> ...Text... </div> 
<style> 
#example { 
width: 300px; 
height: 200px; 
border: 25px solid #E8C48F; 
padding: 20px; 
overflow: auto; } 
</style>
```

## offsetLeft、offsetTop
相对于最近祖先的偏移（坐上角度为0，0）
一下元素可以为祖先
1. CSS定位为 positon： `absolute 、relative、fixed、sticky`
2. `<td> <th> <table>`
3. `<body>`

## offsetWidth 、offsetHeight
元素本身 **可见区域** 的  content + padding + 滚动条 +border

## clientWidth、clientHeight
元素可见区域 content+padding
## clientLeft、clientTop
元素的 margin有边界到 padding左边界的距离，如果存在滚动条 需要加上滚动条距离
## scrollWidth、scrollHeight
元素本身 content+padding  包括不可见部分
## scrollTop
元素 不可见区域 padding 上边缘到 borderTop 下边缘距离
![[scrollTop.png]]

# 鼠标事件中的坐标
![[mouseEvent coordinate.png]]