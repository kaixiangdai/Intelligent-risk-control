<!-- 参数配置 -->
<template>
  <div style="margin: 0 auto; width: 80%">
    <ParCofigVue ref="req" :which-one="0" />
    <br />
    <!-- 请求body -->
    <ParCofigVue v-if="isBody" ref="reqBody" :which-one="1" />
    <br />
    <!-- 返回参数 -->
    <ParCofigVue ref="resp" :which-one="2" />
    <!-- 测试按钮 -->
    <div>
      <a-button style="margin: 5rem 0; border: #26a65b; background-color: #26a65b" type="primary" @click="aqtest">测试 </a-button>
    </div>
    <!-- 测试接口模态框 -->
    <InterfaceTest :isshow="testBtn" :data="testobj" @isshowchange="testBtn = false" />
  </div>
</template>
<script lang="ts" setup>
  import { cloneDeep } from 'lodash-es';
  import ParCofigVue from './components/ParCofig.vue';
  import InterfaceTest from './components/InterfaceTest.vue';
  import { nextTick } from 'vue';
  const props = defineProps({
    bascinfoCofig: {
      type: Object,
      required: true,
    },
    msgConfig: {
      type: Object,
      default: undefined,
    },
  });
  const bascinfoCofig = ref({ ...props.bascinfoCofig });
  const isBody = ref<boolean>(true);
  watch(
    () => props.bascinfoCofig,
    nval => {
      if (nval.imRequest == 'GET') isBody.value = false;
      bascinfoCofig.value = { ...props.bascinfoCofig };
    },
    {
      immediate: true,
    },
  );
  // 通过ref 拿到 输入参数、请求body、返回参数的值
  const req = ref();
  const reqBody = ref();
  const resp = ref();
  watch(
    //监听编辑需要展示的数据
    () => props.msgConfig,
    async nval => {
      if (nval) {
        await nextTick(); //等待子组件渲染
        let _temporary_data = cloneDeep(nval);
        _temporary_data = JSON.parse(JSON.stringify(_temporary_data).replace(/icId/g, 'key'));
        console.log('接收到的值', _temporary_data);
        delchildren(_temporary_data);
        _temporary_data.forEach((item: any) => {
          switch (item.icStatus) {
            case 0:
              req.value.dataSource.push(item);
              break;
            case 1:
              if (reqBody.value) reqBody.value.dataSource.push(item);
              break;
            case 2:
              resp.value.dataSource.push(item);
              break;
          }
        });
      }
    },
    {
      immediate: true,
    },
  );

  interface TESTOBJ {
    name: {
      url: string;
      way: string;
    };
    input: [];
    body: [];
    resp: [];
  }

  // aqtest测试板块

  const testBtn = ref<boolean>(false);
  const testobj = ref<TESTOBJ>();
  const aqtest = () => {
    console.log('这里', bascinfoCofig);

    testobj.value = {
      name: {
        url: `${bascinfoCofig.value.imAgreement}://${bascinfoCofig.value.imPort}/${bascinfoCofig.value.imPath}`,
        way: bascinfoCofig.value.imRequest,
      },
      // updateTime
      input: addkey(cloneDeep(req.value).dataSource),
      body: isBody.value ? addkey(cloneDeep(reqBody.value).dataSource) : [],
      resp: cloneDeep(resp.value).dataSource,
    };
    testBtn.value = true;
    // console.log(bascinfoCofig);

    console.log(testobj.value);
  };
  function addkey<T>(data: object): T {
    return JSON.parse(JSON.stringify(data).replace(/icId/g, 'key'));
  }
  function delchildren(arr: any) {
    arr.forEach((item: any) => {
      item.isSave = 1; //添加保存过的状态
      if (![3, 4].includes(item.icType)) delete item.children;
      if (item.children && item.children.length > 0) delchildren(item.children);
    });
  }
  defineExpose({
    req,
    reqBody,
    resp,
  });
</script>
<style lang="less" scoped></style>
