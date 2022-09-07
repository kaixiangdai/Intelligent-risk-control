import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import './assets/index.postcss';
// import Antd from 'ant-design-vue';
// import 'ant-design-vue/dist/antd.css';
import * as Icons from '@ant-design/icons-vue';
//是message
import 'ant-design-vue/lib/message/style/index.css';

const head = createHead();
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(head);
// app.use(Antd);

app.mount('#app');
//这里循环全部图标注册一下组件即可
const icons: any = Icons;
for (const i in icons) {
  app.component(i, icons[i]);
}
