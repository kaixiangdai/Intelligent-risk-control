<template>
  <div>
    <a-layout-sider width="200" style="background: #fff">
      <a-menu v-model:selectedKeys="selectedKeys1" v-model:openKeys="openKeys" mode="inline" :style="{ height: '100%', borderRight: 0 }">
        <a-sub-menu key="one">
          <template #title>
            <span> 数据资源管理 </span>
          </template>
          <a-menu-item key="test1">
            <router-link to="/one/test1">接口管理</router-link>
          </a-menu-item>
          <a-menu-item key="test2">
            <router-link to="/one/test2">数据库管理</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="two">
          <template #title>
            <span> 数据标准管理 </span>
          </template>
          <a-menu-item key="test3">
            <router-link to="/two/test3">数据标准目录</router-link>
          </a-menu-item>
          <a-menu-item key="test4">
            <router-link to="/two/test4">码表管理</router-link>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="test5">
          <router-link to="/three/test5">数据资产管理</router-link>
        </a-menu-item>
        <a-menu-item key="test6">
          <router-link to="/four/test6">脚本管理</router-link>
        </a-menu-item>
        <a-menu-item key="test7">
          <router-link to="/five/test7">任务管理</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script lang="ts">
  import { useRoute } from 'vue-router';
  export default {
    name: '',
    setup() {
      const route = useRoute();
      return {
        selectedKeys1: ref<string[]>([route.path.split('/')[2]]),
        openKeys: ref<string[]>([route.path.split('/')[1]]),
        collapsed: ref<boolean>(false),

        route,
      };
    },
  };
</script>
<style scoped lang="less"></style>
