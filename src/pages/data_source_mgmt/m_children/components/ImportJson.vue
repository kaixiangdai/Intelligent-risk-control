<template>
  <!-- json导入模态框 -->
  <a-modal :visible="jsonVisible" @ok="handleOk" @cancel="close">
    <template #title>
      <a-row style="justify-content: center"><span>Json数据导入</span> </a-row>
    </template>
    <p><span class="xin">*</span>Json数据:</p>
    <div class="jsonbody">
      <a-textarea v-model:value="jsondata" :rows="13" placeholder="请录入json数据..." />
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { message } from 'ant-design-vue';
  import { isJSON } from '@/utils/op';
  const props = defineProps({
    jsonVisible: {
      type: Boolean,
      default: false,
    },
    jsontype: {
      type: Number,
      default: 1,
    },
  });
  const emits = defineEmits(['jsonvisible', 'jsondata']);
  const close = () => {
    //关闭
    emits('jsonvisible');
  };
  const handleOk = () => {
    //确认按钮回调
    //请求body(1)返回参数(2)
    try {
      if (!isJSON(jsondata.value)) {
        message.error('JSON格式错误！！！');
        return;
      }
      let str = JSON.parse(jsondata.value);
      console.log(props.jsontype);
      if (bodyjson(str.data)) {
        message.success('ok');
        emits('jsondata', JSON.parse(jsondata.value));
      } else {
        message.error('参数信息错误');
      }
    } catch (error) {
      message.error('参数信息异常');
    }
  };

  //JSON数据导入
  const jsondata = ref<string>(`{
"data":[
  {
    "name":"你好",
    "type":"Object",
    "isNull":"",
    "default":"",
    "note":"",
    "children":[
      {
        "name":"他好",
        "type":"String",
        "isNull":"是",
        "default":"",
        "note":""
      }
    ]
   }
]
}`);

  function bodyjson(objarr: []): boolean {
    //传入对象数组
    let istrue = true;
    let typearr = ['Object', 'String', 'Int', 'Float', 'Array'];
    interface bodyform {
      name: string; //参数名称
      type: string; //数据类型
      isnull?: string;
      default?: string;
      note?: string;
      children?: [];
    }
    let stack: bodyform[] = []; //栈

    if (objarr.length == 0) return false; //如果为空数组则返回

    if (!objarr.every((item: bodyform) => item.hasOwnProperty('name') && item.hasOwnProperty('type') && typearr.includes(item.type))) {
      // message.error('请确认包含属性:name,type且type属性正确');
      return false;
    }

    objarr.forEach((item: bodyform) => {
      //将具有children的属性且数据不为空的数据添加入栈中
      if (item.children && item.children.length > 0) stack.push(item);
    });
    while (stack.length) {
      let _shift: any;
      _shift = stack.shift();
      if (_shift.hasOwnProperty('name') && _shift.hasOwnProperty('type') && typearr.includes(_shift.type)) {
        if (_shift.children && _shift.children.length > 0) stack.push(..._shift.children); //有满足条件的子类再添加进栈中
        istrue = true;
      } else {
        // message.error('请确认包含属性:name,type且type属性正确');
        istrue = false;
        break;
      }
    }
    return istrue;
  }
</script>
