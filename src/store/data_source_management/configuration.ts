import { defineStore } from 'pinia';
export const confuguration = defineStore('confuguration', {
  state: () => {
    //state 用来存储全局状态
    return {
      columns: [
        [
          {
            title: '参数名称',
            dataIndex: 'icName',
            width: '12%',
            align: 'center',
          },
          {
            title: '参数位置',
            dataIndex: 'icPosition',
            width: '12%',
            align: 'center',
          },
          {
            title: '数据类型',
            dataIndex: 'icType',
            width: '12%',
            align: 'center',
          },
          {
            title: '是否必填',
            dataIndex: 'icFill',
            width: '12%',
            align: 'center',
          },
          {
            title: '默认值',
            dataIndex: 'icDefault',
            width: '12%',
            align: 'center',
          },
          {
            title: '参数描述',
            dataIndex: 'icComment',
            width: '24%',
            align: 'center',
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '16%',
            align: 'center',
          },
        ],
        [
          {
            title: '参数名称',
            dataIndex: 'icName',
            width: '24%',
            align: 'left',
          },
          {
            title: '数据类型',
            dataIndex: 'icType',
            width: '12%',
            align: 'center',
          },
          {
            title: '是否必填',
            dataIndex: 'icFill',
            width: '12%',
            align: 'center',
          },
          {
            title: '默认值',
            dataIndex: 'icDefault',
            width: '12%',
            align: 'center',
          },
          {
            title: '参数描述',
            dataIndex: 'icComment',
            width: '24%',
            align: 'center',
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '16%',
            align: 'center',
          },
        ],
        [
          {
            title: '参数名称',
            dataIndex: 'icName',
            width: '36%',
            align: 'left',
          },
          {
            title: '数据类型',
            dataIndex: 'icType',
            width: '12%',
            align: 'center',
          },
          {
            title: '参数描述',
            dataIndex: 'icComment',
            width: '36%',
            align: 'center',
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '16%',
            align: 'center',
          },
        ],
      ],
    };
  },
  getters: {
    //getters 就是用来封装计算属性，它有缓存的功能
  },
  actions: {
    //actions 就是用来封装业务逻辑，修改 state
  },
});
