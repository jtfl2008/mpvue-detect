# 家图网小程序（内测，未上线）

> 使用 mpvue 技术开发的小程序

## 运行流程

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## 使用到的技术栈和插件

1.  技术栈：小程序， mpvue，es6
2.  依赖插件
    1.  [mpvue-entry](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2FF-loat%2Fmpvue-entry)：vue-router 兼容的路由写法
    2.  [mpvue-router-patch](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2FF-loat%2Fmpvue-entry)：集中式页面配置，自动生成各页面的入口文件，优化目录结构，支持新增页面热更新
    3.  scss：预处理器
    4.  vuex: 进行状态管理
    5.  [flyio](https://link.juejin.im/?target=https%3A%2F%2Fgithub.com%2Fwendux%2Ffly): 数据交互

## 目录结构

```md
─ src
├── api #接口封装
├── assets #图片等静态资源
├── components #组件
├── config #全局变量配置
├── pages #页面
├── router #路由配置
│ ├── index.js
├── store #状态状态管理
│ ├── modules #拆分模块
│ ├── index.js
├── utils #工具方法
│ ├── index.js
├── App.vue
├── app.json
├── main.js
```

---

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
