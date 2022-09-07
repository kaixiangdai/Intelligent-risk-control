<template>
  <div class="bascinformation">
    <a-form ref="formRef" :model="allMsg" name="basicinformation" :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }" autocomplete="off" @finish="onFinish" @finish-failed="onFinishFailed">
      <p>基本信息</p>

      <a-form-item label="接口分类：" name="iid" :rules="[{ required: true, message: '请选择接口分类!' }]">
        <a-tree-select
          v-model:value="allMsg.iid"
          style="text-align: start"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择接口分类"
          :field-names="{
            children: 'children',
            label: 'iName',
            value: 'idAndName',
          }"
          allow-clear
          tree-default-expand-all
          :tree-data="allMsg._treeData"
        >
        </a-tree-select>
      </a-form-item>

      <a-form-item label="接口名称：" name="imName" :rules="[{ required: true, message: '请输入接口名称' }]">
        <a-input v-model:value="allMsg.imName" />
      </a-form-item>

      <a-form-item label="接口来源：" name="imOrigin" :rules="[{ required: true, message: '请选择数据源' }]">
        <a-select
          v-model:value="allMsg.imOrigin"
          style="text-align: start"
          placeholder="Please select"
          :options="[
            { value: '数据服务', label: '数据服务' },
            { value: '指标管理', label: '指标管理' },
            { value: '决策引擎', label: '决策引擎' },
          ]"
        ></a-select>
      </a-form-item>

      <a-form-item label="接口描述：" name="imDescribe">
        <a-textarea v-model:value="allMsg.imDescribe" placeholder="描述信息...." :rows="4" />
      </a-form-item>
      <p>API参数</p>
      <a-form-item label="协议：" name="imAgreement" :rules="[{ required: true, message: '请选择协议' }]">
        <a-select
          v-model:value="allMsg.imAgreement"
          style="text-align: start"
          placeholder="Please select"
          :options="[
            { value: 'HTTP', label: 'HTTP' },
            { value: 'HTTPS', label: 'HTTPS' },
          ]"
        ></a-select>
      </a-form-item>

      <a-form-item
        label="IP端口："
        name="imPort"
        :rules="[
          {
            required: true,
            message: 'IP端口错误',
            pattern:
              /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]):([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
          },
        ]"
      >
        <a-input v-model:value="allMsg.imPort" placeholder="x.x.x.x:xxxx" />
      </a-form-item>

      <a-form-item label="Path：" name="imPath" :rules="[{ required: true, message: '请输入地址', pattern: /^[a-z]([a-z]*\/)+([a-z]*|\/)$/ }]">
        <a-input v-model:value="allMsg.imPath" />
      </a-form-item>
      <a-form-item label="请求方式" name="imRequest" :rules="[{ required: true, message: '请选择请求方式' }]">
        <a-select
          v-model:value="allMsg.imRequest"
          style="text-align: start"
          placeholder="请选择请求方式"
          :options="[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
            { value: 'PUT', label: 'PUT' },
          ]"
        ></a-select>
      </a-form-item>

      <a-form-item label="超时时间：" name="imTimeout">
        <a-input v-model:value="allMsg.imTimeout" :max-length="4" placeholder="单位秒（s）" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
  import { getAllCategory } from '@/api/aq/index';
  // import { interfaceMgmtStore } from '@/store/data_source_management/InterfaceMgmt';
  import { limitstr } from '@/utils/op';
  import type { FormInstance } from 'ant-design-vue';
  // const _interfaceMgmtStore = interfaceMgmtStore();
  import { cloneDeep } from 'lodash-es';

  const props = defineProps({
    check: {
      type: Object,
      required: true,
    },
    msg: {
      type: Object,
      default: undefined,
    },
  });
  const emits = defineEmits(['basicinfo']);
  const formRef = ref<FormInstance>();
  // 参数

  const allMsg = reactive({
    //接口分类
    _treeData: [],
    iid: '', //iid+iName
    imName: '', //接口名称
    imOrigin: '', // 接口来源
    imDescribe: '', //接口描述
    imAgreement: '', //协议
    imPort: '', //IP端口号
    imPath: '', //地址
    imRequest: '', //请求方式
    imTimeout: '30', //超时时间
  });
  // 如果是编辑将会传值过来
  watch(
    () => props.msg,
    nval => {
      if (nval) {
        Object.assign(allMsg, cloneDeep(nval));
      }
    },
  );
  // 接口分类
  getAllCategory().then(val => {
    iidAndiName(val.data);
    // console.log(val);

    allMsg._treeData = val.data;
  });
  // 递归函数将iid与iName拼接在一起
  interface CATEGORY {
    iId: number;
    iName: string;
    iFid: number;
    iRank: number;
    children?: CATEGORY[];
    idAndName: string;
  }
  function iidAndiName(arr: CATEGORY[]) {
    arr.forEach((item: CATEGORY) => {
      item.idAndName = `${item.iId}-${item.iName}`;
      if (item.children && item.children?.length > 0) iidAndiName(item.children);
    });
  }
  watch(
    () => allMsg.imName,
    nVal => {
      allMsg.imName = limitstr(nVal, 30) as string;
    },
  );
  watch(
    () => props.check,
    async (nval: any) => {
      try {
        const values = await (formRef.value as FormInstance).validateFields();
        nval.savego ? emits('basicinfo', { values, save: true }) : emits('basicinfo', { values, next: true });
      } catch (error) {
        //校验失败
        console.log('错误');
      }
    },
  );
  //超时时间校验规则
  const format = (val: string, preVal: string) => {
    const reg = /^[1-9]\d*$/; //匹配正整数
    if ((!isNaN(+val) && reg.test(val) && 0 < parseInt(val) && parseInt(val) < 1800) || val == '') {
      allMsg.imTimeout = val; //满足条件等于新值
    } else {
      allMsg.imTimeout = preVal; //否则旧值
    }
  };
  watch(
    () => allMsg.imTimeout,
    (val, preVal) => {
      format(val, preVal);
    },
  );
  const onFinish = (val: any) => {
    console.log(val);

    console.log('校验完成');
  };
  const onFinishFailed = () => {
    console.log('');
  };
</script>
<style scoped lang="less">
  .bascinformation {
    margin: 0 auto;
    width: 80%;
  }

  p {
    margin: 0;
    padding: 0;
    text-align: start;
  }
</style>
