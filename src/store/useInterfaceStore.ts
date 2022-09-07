import { defineStore } from 'pinia';
export const useMainStore = defineStore('main', {
  state: () => ({
    //码表引用或新增的sId
    sidCodeValue: { key: '', sId: 0 },
  }),
  getters: {},
  actions: {
    setSidKey(obj: any) {
      this.sidCodeValue.sId = obj.sId;
      this.sidCodeValue.key = obj.key;
      console.log(this.sidCodeValue);
    },
  },
});
