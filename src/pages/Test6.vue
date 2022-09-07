<template>
  <a-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" :tree-data="treeData">
    <template #title="{ key: treeKey, title }">
      <a-dropdown :trigger="['contextmenu']">
        <span>{{ title }}</span>
        <template #overlay>
          <a-menu @click="({ key: menuKey }) => menuClick(treeKey, menuKey)">
            <a-menu-item key="0">新建文件夹</a-menu-item>
            <a-menu-item key="1">新建文件</a-menu-item>
            <a-menu-item key="2">重命名</a-menu-item>
            <a-menu-item key="3">删除</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </a-tree>
</template>

<script lang="ts" setup>
  //数据
  const treeData = ref([
    {
      title: '重庆市',
      key: '0',
      children: [
        {
          title: '巴南区',
          key: '01',
        },
        {
          title: '渝中区',
          key: '02',
        },
      ],
    },
    {
      title: '上海市',
      key: '1',
    },
  ]);
  //默认展开的节点
  const expandedKeys = ref(['01']);
  //选中的节点 高亮
  const selectedKeys = ref(['01']);

  //右键
  const menuClick = (treeKey: string, menuKey: string | number) => {
    // console.log(treeKey);
    // console.log(menuKey);
  };
</script>

<style scoped lang="less"></style>
