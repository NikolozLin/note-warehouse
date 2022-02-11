# electron自动升级

## 一 项目背景

项目技术栈 Vue3 + Electron + Nest.js 

其中使用了 [Vue Cli Plugin Electron Builder](https://nklayman.github.io/vue-cli-plugin-electron-builder/) 插件引入electron，并用其 打包、签名。

## 二 更新方案

- 更新方式
  - 全量更新：检测 new version后自动下载安装包，并安装覆盖
  - 增量更新：
    1. 每次release 生成 与所有历史版本diff文件，Client请求update时候将这些文件打包 发给Client
    2. 给予release包 打包经常变动的文件作为增量更新包（例如 app.asar ），但如果更新其他文件，就需要进行全量更新
    3. 对比 安装包中的单文件的差异，然后更新时只下载有差异的block

​		结论：在项目前期 还是使用全量更新 更具有性价比

- 发布方式

- 失败预案

  - 当用户更新失败，需要捕获异常，并通知服务端

  - 失败后 回滚原来版本

## 三  构建&发布

1. 主流打包工具

   - [electron-forge](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Felectron-userland%2Felectron-forge)
   - [electron-builder](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Felectron-userland%2Felectron-builder)
   - [electron-packager](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Felectron%2Felectron-packager)

   根据生态 和易用性 选择 electron- builder，vue项目可以使用背景提到的插件

2. 自动更新工具 Electron-updater

3. Release Server

   - [Bintray](https://links.jianshu.com/go?to=https%3A%2F%2Fwww.electron.build%2Fconfiguration%2Fpublish%23bintrayoptions)

   - Generic Server, any HTTP(S) server, such as [electron-release-server](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2FArekSredzki%2Felectron-release-server)

   - GitHub

   - S3, AWS Object Storage Server

   - Spaces or Snap Store, the app store for Linux

## 四 具体方案

最终选择Electron-builder + Electron-updater +现有nest.js搭建服务。

- 在现有的nest.js服务器，配置静态服务，存放安装包资源。
- electron-updater 添加服务配置
- 打包项目 发到服务器中

---

更新大概步骤
1. 启动程序
2. 检查更新 （与远程服务版本相同，就无须更新）
3. 下载安装包
4. 询问用户
5. 安装更新，重启
6. 结束

---

### 流程

1. 添加打包配置

     使用 Vue Cli Plugin Electron Builder 插件的话，原先在package.json 中的bulid 改到 vue.config.js文件中，如下

     ```js
      const vueConfig={
         pluginOption:{
           	electronBuilder:{
                builderOptions: {
               //..... 这里添加原来在package.json文件中bulid字段的内容。
                }
             }
         }
         }
     ```

     tips：(对于下面等情况可以编写nsh文件 拓展更多安装时的功能)

     -  允许用户自定义目录，用户选择根目录，导致所有文件添加到根目录。需要自己 编写nsh脚本，并添加到nsis配置的include字段属性上。
     - 原来存在安装文件，在同一个目录下安装

2. 服务器添加安装包的静态服务
   1. 

- 

- 更新版本

  修改 package.json 中 version 字段，打包

  

