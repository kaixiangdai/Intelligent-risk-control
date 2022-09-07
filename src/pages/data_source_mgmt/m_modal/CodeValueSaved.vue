<template>
  <!-- 已保存码值 -->
  <div class="container">
    <a-modal v-model:visible="Flag" :centered="true" :wrap-style="{ overflow: 'hidden' }" width="800px" @cancel="cancel" @ok="handleOk">
      <template #title>
        <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center">码值定义</div>
      </template>
      <a-row>
        <a-col :span="15">引用码表名称：{{ sname }}</a-col>
        <a-col v-if="sname" :span="5" :offset="4">
          <a-popconfirm placement="bottom" title="你确定要解除码值引用吗?" ok-text="确定" cancel-text="取消" @confirm="jiechu">
            <a-button @click.stop>解除码值引用</a-button>
          </a-popconfirm>
        </a-col>
      </a-row>
      <a-table :columns="columns" :data-source="dataBody" :pagination="false">
        <template #headerCell="{ column }">
          <template v-if="column.name === 'scode'">
            <span>
              <fire-outlined />
              码值取值
            </span>
          </template>
          <template v-if="column.name === 'sname'">
            <span>
              <fire-outlined />
              码值名称
            </span>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { useMainStore } from '@/store/useInterfaceStore';
  import { storeToRefs } from 'pinia';
  import { getdetails } from '@/api/aq/index';
  import { PropType } from 'vue';
  const props = defineProps({
    codeValueSavedVisible: {
      type: Boolean,
      defalut: false,
    },
    codeValue: { type: Object as PropType<typeof codeValueNot.value>, default: () => ({}) },
  });
  //监听传过来的sid和值
  const codeValueNot = ref({
    sId: 0,
    key: '',
  });
  const Flag = ref<boolean>(false);
  //使用piana
  const mainStore = useMainStore();
  // const { sidCodeValue } = storeToRefs(mainStore);
  watch(
    () => props.codeValueSavedVisible,
    n => {
      if (n == true) {
        Flag.value = n;
      }
    },
    {
      immediate: true,
    },
  );
  watch(
    () => props.codeValue,
    newcodeValue => {
      mainStore.sidCodeValue = { sId: newcodeValue.sId, key: newcodeValue.key };
      codeValueNot.value = { sId: newcodeValue.sId, key: newcodeValue.key };
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const emit = defineEmits(['closeCode', 'closeCodeTocloseCodeNot']);
  const cancel = () => {
    emit('closeCode');
  };
  const handleOk = () => {
    //确认的时候关闭
    Flag.value = false;
    emit('closeCode');
  };

  const dataBody = ref<object[]>([]);
  //码表名称
  const sname = ref();
  //得到码表名称
  const getstopwatchvalueFun = async () => {
    if (mainStore.sidCodeValue.sId != undefined) {
      //不做if判断会显示undefined不能赋值
      const res = await getdetails(mainStore.sidCodeValue.sId);
      //码表名称
      sname.value = res.data.sname;
      dataBody.value = res.data.stopWatchValueList;
    }
  };
  watch(
    () => mainStore.sidCodeValue,
    n => {
      if (n.sId != 0) {
        getstopwatchvalueFun();
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const columns = [
    { title: '码值取值', dataIndex: 'cValue', key: 'cValue', name: 'cValue' },
    { title: '码值名称', dataIndex: 'cName', key: 'cName', name: 'cName' },
    { title: '码值含义', dataIndex: 'cComment', key: 'cComment', name: 'cComment' },
  ];

  //解除码值引用
  const jiechu = async () => {
    dataBody.value = [];
    sname.value = '';
    emit('closeCode');
    emit('closeCodeTocloseCodeNot');
    //重新给空值
    mainStore.sidCodeValue.sId = 0;
    console.log(mainStore.sidCodeValue);
    // mainStore.setSidKey({ sId: 0, key: sidCodeValue.value.key });
    Flag.value = false;
  };
</script>

<style lang="less" scoped></style>
