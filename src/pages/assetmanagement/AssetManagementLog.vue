<template>
  <div class="container">
    <div>
      <a-modal v-model:visible="Flag" :centered="true" :footer="null" :wrap-style="{ overflow: 'hidden' }" width="1400px" @cancel="cancel">
        <template #title>
          <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center">企业基本信息表</div>
        </template>
        <div>
          <a-row>
            <a-col :span="6" style="font-weight: 900"> 基本信息 </a-col>
          </a-row>
          <a-row :gutter="6">
            <a-col :span="6" style="text-align: end"> <span style="color: red">*</span>中文名称： </a-col>
            <a-col :span="15"> {{ basicObj.acname }} </a-col>
          </a-row>
          <a-row :gutter="6">
            <a-col :span="6" style="text-align: end"> <span style="color: red">*</span>英文名称： </a-col>
            <a-col :span="15"> {{ basicObj.aename }} </a-col>
          </a-row>
          <a-row :gutter="6"> <a-col :span="6" style="text-align: end">数据资产表描述： </a-col>{{ basicObj.adescribe }} </a-row>
          <a-row :gutter="6">
            <a-col :span="6" style="text-align: end"><span style="color: red">*</span>所属目录： </a-col>
            <a-col v-for="(item, index) in basicObj.dataAssetsDirectoryVoList" :key="index" :span="5" style="text-align: end">
              <a-button type="primay"> {{ item.adSplicName }} </a-button>
            </a-col>
          </a-row>
        </div>
        <a-row>
          <a-col :span="6" style="font-weight: 900"> 字段信息 </a-col>
        </a-row>
        <a-table :columns="columns" :data-source="basicData" :pagination="false" :scroll="{ x: 1000, y: 400 }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'yingse'"> {{ record.dcode }} {{ record.ftEname }} {{ record.ftCname }} </template>
          </template>
        </a-table>
      </a-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { dataassetsdatadetails } from '@/api/aq/index';
  const emit = defineEmits(['visibleFlag', 'recordAIdFlag']);
  const props = defineProps({
    visible: {
      type: Boolean,
    },
    recordAId: {
      type: Number,
      default: 0,
    },
  });
  // const props = defineProps(['visible', 'recordAId']);
  interface dataAssetsDirectoryVoListInterface {
    parentId: number;
    adSplicName: string;
    adId: number;
  }
  interface dataFieldAndDirectoryVoListInterface {
    ftId: number;
    dId: number;
    ftEname: string;
    ftCname: string;
    ftComment: string;
    version: number;
    createTime: string;
    updateTime: string;
    deleted: number;
    fieldDataId: number;
    dcode: string;
    daccuracy: any;
    ddefault: string;
    drange: any;
    denum: string;
    dtype: string;
    dlength: number;
  }

  interface ResItemInterface {
    aid: number;
    acname: string;
    aename: string;
    adescribe: string;
    dataAssetsDirectoryVoList: dataAssetsDirectoryVoListInterface[];
    dataFieldAndDirectoryVoList: dataFieldAndDirectoryVoListInterface[];
  }
  // interface DataInterface {
  //   data: ResItemInterface;
  //   code: number;
  //   msg: string;
  // }

  const Flag = ref<boolean>();
  const recordAId = ref<number>();

  //监听传过来的aId
  watch(
    () => props.recordAId,
    n => {
      if (n != undefined) {
        recordAId.value = n;
      }
      //获得数据
      if (props.visible) {
        showdata(n);
      }
    },
  );
  //监听传过来的开关Flag
  watch(
    () => props.visible,
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
    emit('visibleFlag');
    emit('recordAIdFlag');
  }

  //弹框-企业基本信息表
  const basicObj = ref<ResItemInterface[]>([]); //基本信息
  const basicData = ref<object[]>([]); //字段信息

  //底下表格数据
  const showdata = async (aId: number | undefined) => {
    let res = await dataassetsdatadetails(aId);
    console.log('看看数据', res);
    basicObj.value = res.data; //总数据
    basicData.value = res.data.dataFieldAndDirectoryVoList; //表格信息
    console.log('看看数组：', res.data.dataFieldAndDirectoryVoList);
  };
  const columns = [
    { align: 'center', title: '英文名称', dataIndex: 'ftEname', width: 110 },
    { align: 'center', title: '中文名称', dataIndex: 'ftCname', width: 110 },
    { align: 'center', title: '字段说明', dataIndex: 'ftComment', ellipsis: true, width: 200 },
    { align: 'center', title: '标准映射', dataIndex: 'yingse', ellipsis: true, width: 240 },
    { align: 'center', title: '数据类型', dataIndex: 'dtype', ellipsis: true },
    { align: 'center', title: '数据长度', dataIndex: 'dlength', ellipsis: true },
    { align: 'center', title: '数据精度', dataIndex: 'daccuracy', ellipsis: true, width: 150 },
    { align: 'center', title: '默认值', dataIndex: 'ddefault', ellipsis: true, width: 100 },
    { align: 'center', title: '取值范围', dataIndex: 'drange', ellipsis: true, width: 100 },
    { align: 'center', title: '枚举范围', dataIndex: 'denum', ellipsis: true, width: 140 },
  ];
</script>

<style lang="less" scoped></style>
