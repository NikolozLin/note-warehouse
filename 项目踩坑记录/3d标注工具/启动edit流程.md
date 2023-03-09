---
date created: 2022-11-15 17:01
date updated: 2022-11-16 17:37
---

包含顶部Toolbar、侧边 labelClassToolBar、 底部selectObjectBar 、中间渲染区域、侧边图形控制 右侧quickToolBar

## 主区域初始化 （）

结构：

```html
<div className="absoluteTopLeftZeroW100H100">
	<canvas id="canvas3d" className="absoluteTopLeftZeroW100H100">
	</canvas>
	<canvas id="canvasSelection" className="absoluteTopLeftZeroW100H100"></canvas>
	<canvas id="canvasMouse" className="absoluteTopLeftZeroW100H100"></canvas>
</div>
```

三层重叠的canvas ：

- canvas3d：渲染图形数据
- canvasSelection： 渲染鼠标选择判定的后的包围图形，监听轨道控制器、鼠标移动。
- canvasMouse：渲染鼠标绘制轨迹

### 运行流程

1. 前置准备：
   1. 继承修改的 PCDLoader 加载到 THREE上
   2. 加载OrbitControls 到 THREE
   3. 封装Postal.js 的方法并添加到 editor实例上
2. init
   1. 获取三个 canvas 的 DOMElement、获取 Selection、Mouse的 2d 上下文并存到this中
   2. 初始化 scene `new THREE.Scene();`
   3. 初始化 camera `new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);`
   4. 相机添加到场景中 `scene.add(camera)`
   5. 实例化WebGLRenderer  并绑定到DOMElement上 `  new THREE.WebGLRenderer({antialias: true,canvas: this.canvas3d,powerPreference : "high-performance"};); `
   6. 修改renderer 像素比防止模糊输出画布 `renderer.setPixelRatio(window.devicePixelRatio);`
   7. 关闭全局右键菜单（给套索工具占用了） `$("body").on('contextmenu', () => {return false;});`
   8. 添加坐标系 `this.scene.add(new THREE.AxesHelper(2));`
   9. 设定相机朝向 `this.camera.up.set(0, -1, 0);` 。
   10. 添加轨道控制器 `new THREE.OrbitControls(this, this.camera, this.canvasContainer, this);`
   11. 修改轨道控制器属性，允许 按键 和绘制,修改对应逻辑的按键
       ```js
       this.orbiter.enablePan = true;
       this.orbiter.enableKeys = true;
       this.orbiter.mouseButtons = {ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: null};
       ```
   12. 添加轨道控制的监听
   ```js
    this.orbiter.addEventListener("start",this.orbiterStart.bind(this), false);
    this.orbiter.addEventListener("change",this.orbiterChange.bind(this), false);
    this.orbiter.addEventListener("end", this.orbiterEnd.bind(this), false);
   ```
   13. 添加 frustum `  new THREE.Frustum(); `
3. 渲染editor 订阅 顶部tooBar、侧边labelClassToolBar 、右侧quickToolBar、底部底部selectObjectBar 的消息。
4. 等待侧边栏 labelClassToolBar 加载并渲染标签，加载完后 携带 active-soc （当前选中类别）发送消息给 editor ,指定订阅回调方法。
   1. 存储 类别 到 activeSoc 变量
   2. 判断**实例**有无meta数据（缓存旋转参数、socName 当前类别名、 加载PCD header）
      1. 无数据：
         1. 执行 `start()` 加载数据
         2. 生成缓存 `this.generateColorCache();`
      2. 有数据：（配置的标签切换了 才会触发这里）
         1. 存储 当前选中的标签到meta `this.meta.socName = this.activeSoc.name;`
         2. 修改 colorIsDirty，下次渲染前修改相关 模型颜色 `this.colorIsDirty = true;`
         3. 执行 displayAll（），更新点对应的颜色，关联colorArray ()
         4. 保存 meta 数据
         5. 生成缓存 `this.generateColorCache();`
5. 启动 start（）方法
   1. props 获取文件URL，并判断数据库有无 meta数据
   2. 根据URL 加载PCD 文件
      1. 解析PCD 文件并返回数据，`arg={position, label, header: PCDheader, rgb};` 。 header是对象，其他的是数组
      2. 执行 display()  [[#^99b490]]
   3. 加载标记对象数据
      1. 加载标记数据的 label 数据并更新到 labelArray
      2. 加载对象数据并传给display方法，后续发布消息 将对象穿给底部的objectToolBar
   4. 执行initdone()
6. 启动`initDone()`
	1. 执行`setupTools`
		1. 初始化套索工具并添加鼠标事件监听中
		2. 添加按键监听
		3. 设定默认选择的选择工具
	2. 执行`setupLight`
		1. 添加添加四个方向点光源
	3. 执行循环渲染方法`animate()`
	4. 启动轨道控制器。`this.orbiter.active()`
	5. 宏任务 重新计算渲染区域的大小。`setTimeout(this.resizeCanvas.bind(this), 100);`
	6. 关闭等待界面。

## 其他方法

1. display（objectArray, positionArray, labelArray, rgbArray） ^99b490
   > objectArray: 标记的对象`{id: Random.id(), classIndex: this.activeClassIndex, points: Array.from(points)};`
   > positionArray: 全部点的xyz 坐标
   > labelArray： 每个点的标签index 数组
   > rgbArray： 每个点的 rgb 值数组
   1. 除以场景中的所有点对象`  this.scene.remove(this.cloudObject) `,cloudObject 存放 Point
   2. 生成新的 BufferGeomety 来存出全部点数据，
   3. 解析positionArray，new Object 厨房点的xyz值，并写入`cloudData`中
   4. 根据`displayRgb` 确定使用 rgbArray的颜色还是 labelArray 对应的标签颜色，并分别吧每个的点RGB 通道值存入`colorArray` 中.
      1. 如果是使用labelArray，回将index存入cloudData中
   5. 给`BufferGeomerty` 赋予 顶点和颜色，
      ```js
      geometry.setAttribute('position',new Three.Float32BufferAttribute(positonArray,3));
      geometry.setAttribute('color',new Three.Float32BufferAttribute(colorArray,3));
      ```
      6. 更新几何形状的外边界球形。`geometry.computeBoundingShere()`
   6. 创建点材质 `new THREE.PointsMaterial({size: 2, vertexColors: THREE.VertexColors});`
   7. 创建点物体 并存入cloudObject变量。`new THREE.Points(geometry, material)`
   8. 针对每个点创建 索引并存入 `this.visibleIndices`
   9. 根据`cloudData` 中的 labelIndex，分类存入`cloudData.byClassIndex` 属性中。
   10. geometry 存入`cloudGeomerty`变量 方便后续获取属性
   11. 场景添加点对象。`this.scene.add（this.cloudObject）`

2. animate()  渲染循环方法
	1. 设定自循环，每次重绘时调用。`requestAnimationFrame(this.animate.bind(this));`
	2. 计算滚轮延迟时间（防抖）。`const justZoom = time - this.lastWheelTime < postponingInterval;`
	3. 通过Tween 库来计算相机移动位置
		1. 计算新的相机位置并更新
		2. 更新OrbitContrls 控制器
	4. 如果轨道移动flag 为true，滚动延迟超过300ms
		1. 清空Selection 的绘制 与鼠标轨迹绘制
		2. 设置 Object 与屏幕坐标映射的请求时间，在下次不移动相机时候进行重新计算。`this.pixelProjectionRequestTime=time`
	5. 无轨道移动且 `pixelProjectionRequestTime`不为空
		1. 重新计算Object 与屏幕坐标映射关系
		2. 修改CanvasSelection、 CanvaMouse的标志 dirty=true，重新渲染
	6. 无轨道移动且 无`pixelProjectionRequestTime`
		1. 绘制CanvasSelection CanvaMouse内容
		2. 判断鼠标位置是否在点Object 上，是的话高亮
	7.  判断 colorIsDirty
		1. 是 根据rgbArray 修改存在变量 cloudObject的 buffGeometry的颜色并修改标志位,`this.cloudObject.geometry.attributes.color.needsUpdate = true;`
	8. 渲染器渲染更新。`this.renderer.render(this.scene,this.camera)` 
		
