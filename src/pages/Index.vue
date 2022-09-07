<template>
  <a-layout class="boxc">
    <a-layout-header class="header headerc">
      <div class="img-box"><img src="../assets/images/u480.png" /></div>
      <h1>数据工厂</h1>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <sider />
      </a-layout-sider>
      <a-layout class="contentc">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>数据工厂</a-breadcrumb-item>
          <template #separator>
            <img style="margin-top: -2px" src="@/assets/images/右箭头.png" alt="" />
          </template>
          <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
            {{ item.meta.title }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
          <router-view></router-view>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
  import Sider from '../layout/Sider.vue';
  import { useRoute } from 'vue-router';
  export default {
    components: {
      Sider,
    },
    setup() {
      const route = useRoute();
      //面包屑
      const breadcrumbList = computed(() => {
        return route.matched;
      });
      return {
        breadcrumbList,
      };
    },
  };
</script>
<style scoped lang="less">
  * {
    box-sizing: border-box;
    overflow: hidden;
  }

  .boxc {
    width: 100%;
    height: 100vh;
  }

  .headerc {
    display: flex;
    align-items: center;
    padding: 0;
    height: 50px;
    background-color: rgb(49, 61, 80);
  }

  .headerc h1 {
    margin-top: 10px;
    margin-left: 140px;
    padding: 0 30px;
    font-weight: 700;
    color: white;
    background-color: rgb(41, 72, 132);
    letter-spacing: 2px;
  }

  .img-box {
    margin-left: 20px;
    width: 40px;
  }

  .img-box > img {
    margin-top: -4px;
    width: 100%;
  }

  .contentc {
    padding: 0 24px 0 24px;
  }
</style>
