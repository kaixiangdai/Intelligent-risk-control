import { defineStore } from 'pinia';
import { getstopwatch } from '@/api/aq/index';
export const dataStandarStore = defineStore('dataStandarMgmt', {
  state: () => {
    //state 用来存储全局状态
    return {};
  },
  getters: {
    //getters 就是用来封装计算属性，它有缓存的功能
  },
  actions: {
    //actions 就是用来封装业务逻辑，修改 state
    //请求枚举类型
    // async aqgetMeun(){
    //   return getstopwatch()
    // },
    // async aqadddirectory(){
    //   return
    // }
  },
});
