# Vite + Vue 3 + Typescript + Tailwind Starter

## 项目基本操作

1. 安装依赖 `pnpm install`
2. 运行项目 `pnpm run dev`
3. 打包测试环境 `pnpm run build:test`
4. 打包正式环境 `pnpm run build`

## todo list

- 在`src/api`中集中管理项目 api
- 在`src/utils/axios`中新建 axios 拦截器代码
- 在`src/layout`中新建项目外部模板（顶栏和右边菜单栏）
- 在`vite.config.ts`中新增 proxy，便于前后端联调
- 新增 antd ui 框架并实现懒加载（需在 vite.config.ts 中添加插件实现）

## 项目分组

### leader 职责

1. 代码合并到对应组分支时，进行代码审查，没有问题才允许合并
2. 每日统计组员进度，有风险及时汇报

## 开发方式：

1. 每个人新建一个自己的分支，命名规则为 姓名首字母\_开始时间 ，比如 `xlc_202200704`
2. 当功能开发完成后将代码从自己的分支合并到对应组的分支上
3. 组员合并代码时，需要提交 merge 请求，组长审核后合并
4. master 分支受保护，不能提交代码到 master 分支

## 开发相关

1. 在 `src/router/modules`中新增文件，即可默认将页面添加到路由中，具体实现代码可以查看`src/router/index.ts`
2. 在`src/pages`中新增自己要开发的页面，建议一个页面以一个文件夹形式存在
3. 在代码中尽可能拆分组件，并且使用`setup`语法糖，简单的例子参考`src/pages/test.vue`
4. 使用 less 作为 css 预处理器，所有的 css 请用 less 来编写
5. 项目中尽可能给每一个方法、变量都写上 type 或者是 interface

IM    接口管理
DAC  数据资产目录
DSC   数据标准目录
DM    数据库管理
TM    码表管理
