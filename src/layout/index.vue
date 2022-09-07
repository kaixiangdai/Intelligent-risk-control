<template>
  <div>
    <!-- ant布局 -->
    <a-layout class="boxc">
      <!-- 头部栏 -->
      <a-layout-header class="headerc">
        <div class="logo-box">
          <img src="../assets/images/u480.png" />
        </div>
        <h1 class="logo-word">数据工厂</h1>
      </a-layout-header>
      <!-- 侧边栏、内容板块 -->
      <a-layout>
        <!-- 侧边栏 -->
        <a-layout-sider width="200" style="background: #fff">
          <a-menu v-model:selectedKeys="selectedKeys1" v-model:openKeys="openKeys" mode="inline" :style="{ height: '100%', borderRight: 0 }">
            <!-- 数据源管理 -->
            <a-sub-menu key="sub1">
              <template #title>
                <span> 数据源管理 </span>
              </template>
              <a-menu-item key="1"> 接口管理 </a-menu-item>
              <a-menu-item key="2">数据库管理</a-menu-item>
            </a-sub-menu>
            <!-- 数据标准管理 -->
            <a-sub-menu key="sub2">
              <template #title>
                <span> 数据标准管理 </span>
              </template>
              <a-menu-item key="5">数据标准目录</a-menu-item>
              <a-menu-item key="6" @click="test"> 码表管理 </a-menu-item>
            </a-sub-menu>
            <!-- 数据资产管理 -->
            <a-sub-menu key="sub3">
              <template #title>
                <span> 数据资产管理 </span>
              </template>
              <a-menu-item key="9">option9</a-menu-item>
              <a-menu-item key="10">option10</a-menu-item>
              <a-menu-item key="11">option11</a-menu-item>
              <a-menu-item key="12">option12</a-menu-item>
            </a-sub-menu>
            <!-- 脚本管理 -->
            <a-sub-menu key="sub4">
              <template #title>
                <span> 脚本管理 </span>
              </template>
              <a-menu-item key="13">option9</a-menu-item>
              <a-menu-item key="14">option10</a-menu-item>
              <a-menu-item key="15">option11</a-menu-item>
              <a-menu-item key="16">option12</a-menu-item>
            </a-sub-menu>
            <!-- 任务管理 -->
            <a-sub-menu key="sub5">
              <template #title>
                <span> 任务管理 </span>
              </template>
              <a-menu-item key="17">option9</a-menu-item>
              <a-menu-item key="18">option10</a-menu-item>
              <a-menu-item key="19">option11</a-menu-item>
              <a-menu-item key="20">option12</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <!-- 内容板块 -->
        <a-layout style="padding: 0 24px">
          <!-- 面包屑 -->
          <a-breadcrumb style="margin: 16px 0">
            <a-breadcrumb-item>数据工厂</a-breadcrumb-item>
          </a-breadcrumb>
          <!-- 正文 -->
          <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }" class="contentc">
            <router-view></router-view>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<script lang="ts">
  import { useRouter } from 'vue-router';
  export default {
    setup() {
      const openKeys = ref<string[]>([]);
      const selectedKeys1 = ref<string[]>([]);
      const collapsed = ref<boolean>(false);
      const router = useRouter();
      const test = () => {
        router.push('tablemgmt');
      };
      return {
        selectedKeys1,
        collapsed,
        openKeys,
        test,
      };
    },
  };
</script>
<style scoped lang="less">
  .boxc {
    width: 100%;
    height: 100vh;
  }

  .headerc {
    display: flex;
    align-items: center;
    padding: 0;
    padding-left: 20px;
    height: 50px;
    background-color: rgb(49, 61, 80);
  }

  .logo-box {
    margin-top: -17px;
    width: 40px;
    height: 50px;
  }

  .logo-word {
    margin-top: 7px;
    margin-left: 140px;
    padding: 0 30px;
    font-weight: 700;
    text-align: center;
    color: white;
    background-color: rgb(41, 72, 132);
    line-height: 50px;
  }

  .contentc {
    overflow: auto;
  }
</style>
