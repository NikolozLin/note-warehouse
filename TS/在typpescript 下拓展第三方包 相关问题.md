# 在typescript 下拓展第三方包

如果使用了xxx的第三方库，并且该库没有自定义声明文件的话。一般情况是会导入@types里对应的包。

例如`npm install @types/xxx`.

## TypeScript 如何查找定义的

- 包类型定义的查找

  1. TypeScript编译器优先在当前编译的上下文栈查找 xxx包的定义
  2. 如果找不到，会去`node_modules`下的`@types`（默认情况，目录可以修改）目录下寻找对应包的模块声明文件。

- 变量类型定义的查找

  ```typescript
  const user:User ={name:hoho}
  ```

  1. TypeScript 优先在本模块查找User的定义

  2. 如果找不到，则会到全局作用域找，全局默认指的是`@types` 下的所有的定义类型。

     > 也就是说`@types`下的定义是全局的。 同时可以导入`@types`下的定义 到你的模块中，改变 定义的作用域。 

## typeRoots 与 types

```json
{
  "compilerOptions":{
    "typeRoots":["./typings"]，
    "types":["jquery"]
  }
}
```
tsconfig.json 中有两个配置项与类型映入有关。

1. `typeRoots`： 用于指定默认类型声明文件查找路径。 默认为 node_modules/@types ， 指定位置后TypeScript编译器会从指定的路径去搜索声明。

2. `types`：  TypeScirpt编译器会默认引入typeRoots下所有的声明文件，types属性可以指定引入的模块。设置types的值后，编译器只会引入 设置的声明文件。