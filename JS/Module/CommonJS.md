### CommonJS特征
1. 每个文件均为一个模块
2. 每个模块均为”单例“
3.  不使用全局变量，模块说明符作为全局ID
4. 每个文件(模块)本质上是一段执行的代码，
	1. 本地范围：代码在“模块范围”内执行，所有的变量、函数、类都是内部的
	2. 导出：需要导出的任何声明的实体，都需要明确说明
	3. Import： 每个模块都可通过Import 导入其他模块导出的实体。