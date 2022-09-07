<!-- ManualRegistration -->
<template>
  <div>
    <a-row style="justify-content: center">
      <a-col :span="8">
        <a-steps :current="current">
          <a-step v-for="item in steps" :key="item.title" :title="item.title" />
        </a-steps>
      </a-col>
    </a-row>

    <div class="steps-content" :style="{ height: _heigth + 'px' }">
      <keep-alive>
        <component :is="conlist[thisCon]" ref="parCon" :msg-config="msgConfig" :msg="msg" :check="check" :bascinfo-cofig="basicinfo" @basicinfo="basicinfofun" />
      </keep-alive>
    </div>
    <div class="steps-action">
      <a-button v-if="current < steps.length - 1" type="primary" @click="check = { ischeck: true }">下一步</a-button>
      <a-button v-else type="primary" @click="prev">上一步</a-button>
      <a-button type="primary" style="margin: 0 20px" @click="router.go(-1)">取消</a-button>
      <a-button type="primary" @click="saveAndgo()"> 保存并退出 </a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import BasicInformation from './m_children/BasicInformation.vue';
  import ParameterConfigCopy from './m_children/ParameterConfig.vue';
  import { interfaceAddInfo, interfacePut } from '@/api/aq/index';
  import { message } from 'ant-design-vue';
  import { getInfoListAll } from '@/api/aq/index';
  import { cloneDeep } from 'lodash-es';
  import { useRoute } from 'vue-router';
  const router = useRouter();
  const steps = [{ title: '基本信息' }, { title: '参数配置' }];
  const thisCon = ref<number>(0);
  const conlist = [BasicInformation, ParameterConfigCopy];
  const current = ref<number>(0);
  const check = ref<object>({}); //触发校验规则
  const basicinfo = ref(); //保存校验合格的基本信息
  // 编辑的时候的操作
  const msg = ref(undefined); //当编辑的时候传给基本信息组件
  const msgConfig = ref(undefined); //当编辑的时候传给参数配置组件
  const imId = useRoute().query.imId;
  const imStatus = useRoute().query.imStatus;
  if (imId) {
    // console.log(useRoute().query);
    getInfoListAll(Number(useRoute().query.imId)).then((res: any) => {
      console.log('编辑的信息', res);
      let msgCopy = cloneDeep(res.data);
      msgConfig.value = cloneDeep(res.data.interfaceConfigList);
      // console.log('需要传的值', msgConfig.value);

      msgCopy.iid = `${msgCopy.iid}-${msgCopy.imCategory}`;
      delete msgCopy.interfaceConfigList;
      delete msgCopy.imCategory;
      msg.value = msgCopy;
    });
  }
  const prev = () => {
    //上一页
    current.value--;
    thisCon.value--;
  };
  const parCon = ref();
  const saveAndgo = async () => {
    //判断是基本信息的保存退出还是参数配置位置的保存退出
    if (thisCon.value == 0) {
      check.value = { ischeck: true, savego: true };
    } else {
      try {
        let parameter = cloneDeep(basicinfo.value);
        // 将children属性名替换为icList
        let refs = JSON.parse(JSON.stringify(cloneDeep(parCon.value)).replace(/children/g, 'icList'));
        // Object.keys(refs).forEach((item, index) => {
        addStatus(refs.req.dataSource, 0);
        if (refs.reqBody) addStatus(refs.reqBody.dataSource, 1);
        addStatus(refs.resp.dataSource, 2);
        // });

        let isreqBody = refs.reqBody ? refs.reqBody.dataSource : [];
        parameter.icList = [...refs.req.dataSource, ...isreqBody, ...refs.resp.dataSource];
        // console.log(parameter);
        // console.log('路由', useRoute().query.imId);

        if (imId) {
          // console.log('imId', imId);
          parameter.imId = Number(imId);
          parameter.iId = parameter.iid;
          delete parameter.iid;
          parameter.imTimeout = parameter.imTimeout.toString();
          parameter.imStatus = Number(imStatus);
          parameter = JSON.parse(JSON.stringify(parameter).replace(/icList/, 'interfaceConfigList'));
          await interfacePut(parameter);
          message.success('编辑成功');
        } else {
          await interfaceAddInfo(parameter);
          message.success('新增接口成功');
        }
        router.go(-1);
      } catch (error) {
        console.log(error);
        message.error('操作失败');
      }
    }
  };
  //0-输入参数，2-请求body，3-返回参数
  function addStatus(arr: [], status: number) {
    arr.forEach((item: any) => {
      item.icStatus = status;
      if (item.icList && item.icList.length > 0) addStatus(item.icList, status);
    });
  }

  // 检验成功后处理函数
  const basicinfofun = async (val: any) => {
    let variable = val.values.iid;
    val.values.iid = Number(variable.split('-')[0]);
    val.values.imCategory = variable.split('-')[1];
    val.values.imTimeout = Number(val.values.imTimeout);
    if (val.next) {
      basicinfo.value = val.values;
      current.value++;
      thisCon.value++;
    } else if (val.save) {
      try {
        if (imId) {
          val.values.imId = Number(imId);
          val.values.iId = val.values.iid;
          val.values.imStatus = Number(imStatus);
          await interfacePut(val.values);
          message.success('编辑接口成功');
        } else {
          await interfaceAddInfo(val.values);
          message.success('新增接口成功');
        }
        router.go(-1);
      } catch (error) {
        console.log(error);
        message.error('操作失败');
      }
    }
  };

  const _heigth = ref(document.body.clientHeight / 1.6);
  window.onresize = function () {
    _heigth.value = document.body.clientHeight / 1.6;
  };
</script>
<style scoped>
  .steps-content {
    position: relative;
    overflow-y: auto;
    margin-top: 16px;
    border: 1px dashed #e9e9e9;
    border-radius: 6px;
    padding-top: 80px;

    text-align: center;
    background-color: #fafafa;
  }

  .steps-action {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  [data-theme='dark'] .steps-content {
    border: 1px dashed #404040;
    background-color: #2f2f2f;
  }
</style>
