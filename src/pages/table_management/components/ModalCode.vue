<template>
  <div>
    <a-modal v-if="flagState.visible" v-model:visible="flagState.visible" width="700px" :title="title" :footer="null">
      <a-table
        :columns="flagState.flag == 0 ? columns : columnEnum"
        :data-source="flagState.flag == 0 ? data : dataEnum"
        size="small"
        :show-header="flagState.flag == 0 ? false : true"
        :pagination="false"
      />
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { FlagState, Data, DataEnum } from '../../../api/aq/model';
  import { getdetails } from '../../../api/aq/index';

  const props = defineProps({
    modalCode: {
      type: Object,
      defaule: function () {
        return {};
      },
    },
  });
  const flagState = ref<FlagState>({ visible: false, flag: 0, data: {} });
  watch(
    () => props.modalCode,
    (nVal: any) => {
      flagState.value = nVal;
      data.value = [
        { title: '标准编号', details: nVal.data['dcode'] },
        { title: '中文名称', details: nVal.data['dcname'] },
        { title: '英文名称', details: nVal.data['dename'] },
        { title: '标准说明', details: nVal.data['dcomment'] },
        { title: '来源机构', details: nVal.data['dorigin'] },
        { title: '是否可为空', details: nVal.data['dnull'] },
        { title: '数据类型', details: nVal.data['dtype'] },
        { title: '数据长度', details: nVal.data['dlength'] },
        { title: '数据精度', details: nVal.data['daccuracy'] },
        { title: '默认值', details: nVal.data['ddefault'] },
        { title: '取值范围', details: nVal.data['drange'] },
        { title: '枚举范围', details: nVal.data['denum'] },
      ];
      if (nVal.flag == 1) enumAsk(nVal.data.sid);
    },
  );

  const columns = [
    { dataIndex: 'title', width: 200 },
    { dataIndex: 'details', width: 400 },
  ];
  const columnEnum = [
    { title: '编码取值', dataIndex: 'cValue', width: 150 },
    { title: '编码名称', dataIndex: 'cName', width: 150 },
    { title: '编码含义', dataIndex: 'cComment', width: 300 },
  ];

  //展示数据
  const data = ref<Data[]>([]);
  const dataEnum = ref<DataEnum[]>([]);

  //枚举范围数据
  const scode = ref<string>();
  const enumAsk = async (sid: number) => {
    try {
      dataEnum.value = [];
      const res = await getdetails(sid);
      scode.value = res.data.scode;
      res.data.stopWatchValueList.forEach((item: any) => {
        dataEnum.value.push({ cValue: item.cValue, cName: item.cName, cComment: item.cComment });
      });
    } catch (err) {
      console.log(err);
    }
  };

  //title
  const title = computed(() => {
    if (flagState.value.flag == 0) return `企业类型标准（${flagState.value.data.dcode}）`;
    else if (flagState.value.flag == 1) return `企业类型码表（${scode.value}）`;
  });
</script>
<style scoped lang="less"></style>
