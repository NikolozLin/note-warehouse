Vue3 响应原理

相关变量

targetMap： weakMap集合 ，存储多个对象对应的depsMap

depsMap：Map集合，用于存储单个对象的每个属性一一对应的dep集合，

dep：Set集合，用于存储属性关联的effect方法

相关函数

- effect函数：data中数据改变后 调用effect函数 会更新关联的值

- track函数： 会将effect函数添加到 dep的Set中（依赖追踪的set集合）

- trigger函数：出发全部dep 中的effect函数

