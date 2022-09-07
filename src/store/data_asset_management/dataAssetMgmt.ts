import { defineStore } from 'pinia';
import { aqtreeData } from '@/api/aq/model';
export const dataAssetMgmtStore = defineStore('dataAssetMgmt', {
  state: () => {
    return {
      treeData: <aqtreeData[]>[],
    };
  },
  getters: {
    //getters 就是用来封装计算属性，它有缓存的功能
  },
  actions: {},
});
