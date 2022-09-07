<template>
  <div class="container">
    <div>
      <a-modal v-model:visible="Flag" :centered="true" :footer="null" :wrap-style="{ maxHeight: '80%', marginTop: '100px', overflow: 'auto' }" width="80%" @cancel="cancel">
        <template #title>
          <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center">接口详情</div>
        </template>
        <!-- 基本信息 -->
        <div>
          <a-row>
            <a-col :span="6" style="font-weight: 900"> 基本信息 </a-col>
          </a-row>
          <div>
            <a-row :gutter="6">
              <a-col :span="6" style="text-align: end"> 接口名称:</a-col>
              <a-col :span="6">{{ props.recordData.imName }}</a-col>
              <a-col :span="6" style="text-align: end"> 请求协议: </a-col>
              <a-col :span="6">{{ props.recordData.imAgreement }}</a-col>
            </a-row>
            <a-row :gutter="6">
              <a-col :span="6" style="text-align: end"> 接口分类: </a-col>
              <a-col :span="6">{{ props.recordData.imCategory }}</a-col>
              <a-col :span="6" style="text-align: end"> 请求方式: </a-col>
              <a-col :span="6">{{ props.recordData.imRequest }}</a-col>
            </a-row>
            <a-row :gutter="6">
              <a-col :span="6" style="text-align: end"> 支持格式: </a-col>
              <a-col :span="6">{{ props.recordData.imOrigin }}</a-col>
              <a-col :span="6" style="text-align: end"> ip端口: </a-col>
              <a-col :span="6">{{ props.recordData.imPort }}</a-col>
            </a-row>
            <a-row :gutter="6">
              <a-col :span="6" style="text-align: end"> 超时时间: </a-col>
              <a-col :span="6">{{ props.recordData.imTimeout }}</a-col>
              <a-col :span="6" style="text-align: end"> path: </a-col>
              <a-col :span="6">{{ props.recordData.imPath }}</a-col>
            </a-row>
            <a-row :gutter="6">
              <a-col :span="6" style="text-align: end"> 接口描述: </a-col>
              <a-col :span="6">{{ props.recordData.imDescribe }}</a-col>
            </a-row>
          </div>
        </div>
        <!-- 请求参数 -->
        <a-row>
          <a-col :span="6" style="font-weight: 900"> 请求参数 </a-col>
          <a-table :columns="columnsinterfaceConfigList" :data-source="dataBodyinterfaceConfigList" :pagination="false"> </a-table>
        </a-row>
        <!-- 请求body -->
        <a-row>
          <a-col :span="6" style="font-weight: 900"> 请求Body </a-col>
          <a-table style="width: 100%" :columns="bodyColumns" :data-source="dataBodyinterfaceConfigList" :pagination="false"> </a-table>
        </a-row>
        <!-- 接口返回参数 -->
        <a-row>
          <a-col :span="6" style="font-weight: 900"> 接口返回参数 </a-col>
          <a-table style="width: 100%" :columns="bodyColumns" :data-source="dataBodyinterfaceConfigList" :pagination="false"> </a-table>
        </a-row>
      </a-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getInfoListAll } from '@/api/aq/index';
  import { PropType } from 'vue';
  const emit = defineEmits(['visibleDetailsFlag', 'recordAIdFlag']);
  // import
  const props = defineProps({
    visibleDetails: {
      type: Boolean,
    },
    recordData: {
      type: Object as PropType<typeof recordData.value>,
      default: () => ({}),
    },
  });
  const Flag = ref<boolean>();
  const recordData = ref({
    imId: 92,
    imName: '码表查询',
    imDescribe: '产生的',
    imCategory: 'three',
    imOrigin: '数据服务',
    imStatus: 0,
    imAgreement: 'HTTP',
    imPort: '8.130.19.70:9900',
    imPath: 'database/getdatabaselist',
    imRequest: 'GET',
    imTimeout: 30,
    updateTime: '2022-08-19T16:07:04',
    createTime: '2022-08-19T16:07:04',
    deleted: 0,
    iId: 3,
    version: 0,
    interfaceConfigList: [],
  });
  const imId = ref();
  //根据id拿到数据
  const showdata = async () => {
    let res = await getInfoListAll(imId.value);
    dataBodyinterfaceConfigList.value = recursionLoop(res.data.interfaceConfigList, []);
  };
  //监听传过来的imid
  watch(
    () => props.recordData,
    n => {
      imId.value = n.imId;
      showdata();
    },
    {
      immediate: true,
    },
  );
  //监听传过来的开关Flag
  watch(
    () => props.visibleDetails,
    n => {
      Flag.value = n;
    },
    {
      immediate: true,
    },
  );

  //关闭
  function cancel() {
    // console.log(recordAId.value);
    emit('visibleDetailsFlag');
    // emit('recordAIdFlag');
  }

  //第二部分,默认请求参数
  const dataBodyinterfaceConfigList = ref();
  const columnsinterfaceConfigList = [
    { title: '参数名', dataIndex: 'icName' },
    { title: '参数位置', dataIndex: 'icPosition', align: 'center', width: 110 },
    { title: '数据类型', dataIndex: 'icType', align: 'center', ellipsis: true, width: 200 },
    { title: '是否必填', dataIndex: 'icFill', align: 'center', ellipsis: true, width: 240 },
    { title: '默认请求参数', dataIndex: 'icDefault', align: 'center', ellipsis: true },
    { title: '说明', dataIndex: 'icComment', align: 'center', ellipsis: true },
  ];

  //请求body、接口返回参数
  const bodyColumns = [
    { title: '参数名称', dataIndex: 'icName', width: '20%' },
    { title: '数据类型', dataIndex: 'icType', width: '10%' },
    { title: '参数说明', dataIndex: 'icComment', align: 'center' },
  ];

  const statusData = {
    dataType: {
      0: 'Int',
      1: 'Float',
      2: 'String',
      3: 'Enum',
    },
    isRequired: {
      0: '否',
      1: '是',
    },
  };

  //递归
  const recursionLoop = (arr: any, list: any[]) => {
    for (let item of arr) {
      item.icType = statusData.dataType[item.icType];
      item.icFill = statusData.isRequired[item.icFill];
      if (item.children.length == 0) {
        delete item.children;
        list.push(item);
      } else {
        item.children = recursionLoop(item.children, []);
        list.push(item);
      }
    }
    return list;
  };
</script>

<style lang="less" scoped></style>
