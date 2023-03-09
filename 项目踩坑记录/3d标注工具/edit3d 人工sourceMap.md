

### 初始化
1. react  componentDidMount  生命周期 触发init（） 并传递下面的信息 
2. editor组件 436 emit---- editor-ready 消息
3.  classChooser组件 59   active-soc 消息  参数() classesSets[0]
4.  classChooser组件 64 displayAll()  在state删除 mute solo 相关状态
5.  editor 组件408  
	1.  没有meta(pcd文件头信息） 执行 this.start()
	2. 有meta信息
6.   editor组件 2075  emit----currentSample
7. editor组件 2078。加载pcd文件。
	1. display 
		1. cameraPreset
			1. moveCamera
	2.  then（）
		1. 使用SseDataManager（使用lzw算法进行压缩与解压）分别加载 label 文件 和 分类object文件
8.  editor initdone()  
	1. 初始化 selector tools、添加4个方向点光源、 启动轨道监听、 开始执行animate()、emit---show-rgb-toggle

### 选择
initDone 监听 mouseDown、mouseMove、mouseUp事件
1. mouseDown 鼠标按键判断 btnx
	- event.button == 1 (中键) or control  `changeTarget()`
	-  event.button = 2 （右键 ） \ 0 (左) 
		-  停止补间动画计算 
		- 记录当前鼠标位置、按键信息
		- 修改 mouse 标志位，下个animate 重新绘制
3. 

### 数据处理
