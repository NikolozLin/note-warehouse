---
date created: 2022-06-16 15:42
date updated: 2022-06-16 15:43
---

## 101 基础概念

1. Rasterization（光栅化）：openGL、shader、
2. Curves and Meshes（ 曲线曲面）
3. Ray Tracing （光线追踪）
4. Animation/Simulation（动画/模拟仿真）

## Linear algebra

向量： $\vec a$
单位向量：$\hat{a}$
向量长度：$||\vec a||$

### 计算

1. 一、 Dot product（点积）
   ![[dot product.png]]
   结合律、交换律、分配律
   ![[点乘属性.png]]
   作用：

   1. 用来找到两个向量的夹角。
   2. 一个向量到另外一个向量投影，并且可以将向量拆封成两个相互垂直的两个向量

   ![[向量投影.png]]

   3. 判断方向 同方向的 点成正数同方向。

2. 二、 Cross Product（叉积）

> 这里使用右手螺旋定则 ，四个手指从x旋转到Y，大拇指方向为Z。

叉积是三维空间两个向量a、b叉乘后的结果，得到是一个垂直于ab平面的法线向量。

属性：
- axb=-bxa
- $||axb||=||a||||b||\sin \phi$
- $\vec a X \vec a=0$

作用：
1. 判断一个向量在另外一个向量的左侧还是右侧。
2. 判断一个点是否在三角形内还是外（求点与三条边叉积 来来判断。三个叉积是否同符号）（三角形光栅化）
