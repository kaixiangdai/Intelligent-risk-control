<template>
  <!-- 未保存码值 -->
  <div class="container">
    <a-modal v-model:visible="Flag" :centered="true" :wrap-style="{ overflow: 'hidden' }" width="800px" @cancel="cancel" @ok="handleOk">
      <template #title>
        <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center">未保存码值定义</div>
      </template>
      <a-row>
        <a-col :span="5"><a-button @click="addcodeValueFlag = !addcodeValueFlag">新增码表码值</a-button></a-col>
        <a-col :span="5"><a-button @click="(Flag = false), (modaladdcode.flagVisible = true)">新增自定义码值</a-button></a-col>
        <a-col :span="5"> <a-button @click="codeValueReferenceFlag = !codeValueReferenceFlag">码值引用</a-button></a-col>
        <a-col :span="5"> <a-button @click="ceshi()">码值引用</a-button></a-col>
      </a-row>
      <!-- 新增码表编码 -->
      <a-modal v-model:visible="addcodeValueFlag" :centered="true" :wrap-style="{ overflow: 'hidden' }" width="700px" @ok="handleOkaddcodeValueFlag">
        <template #title>
          <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center"> 新增码表编码</div>
        </template>
        码表选择:
        <a-select v-model:value="referenceValueSid" show-search placeholder="码表选择" style="width: 90%" :options="options" :filter-option="filterOption"> </a-select>
        <a-table :row-selection="rowSelection" :row-key="(record:any) => record.cId" :columns="columnsReference" :data-source="dataBodyReference" :pagination="false"> </a-table>
      </a-modal>
      <!-- 码值引用 -->
      <a-modal v-model:visible="codeValueReferenceFlag" :centered="true" :wrap-style="{ overflow: 'hidden' }" width="700px" @cancel="cancelReferenceFlag" @ok="handleOkReferenceFlag">
        <template #title>
          <div style="width: 100%; font-size: 24px; font-weight: 900; text-align: center">码值引用</div>
        </template>
        码表选择:
        <a-select v-model:value="referenceValueSid" show-search placeholder="码表选择" style="width: 90%" :options="options" :filter-option="filterOption"> </a-select>
        <div v-if="true">
          <a-table :columns="columnsReference" :data-source="dataBodyReference" :pagination="false" :sticky="true"> </a-table>
        </div>
      </a-modal>
      <!-- 内容区域 -->
      <div>
        <a-table :columns="columnsAdd" :data-source="dataBodyAdd" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operate'">
              <a @click="delRow(record)">删除</a>
            </template>
          </template>
        </a-table>
        <!-- table里面的数据从是数据库里面拿到的,不需要进行验证 -->
        <a-form ref="formRef" :model="formState" name="form_two" autocomplete="off" :label-col="{ style: { width: '100px' } }">
          <!-- 码表名称 -->
          <a-form-item label="码表名称" name="sName" :rules="rules.sName">
            <a-input v-model:value.trim="formState.sName" show-count :maxlength="15" placeholder="请输入码表名称（必填）" />
          </a-form-item>
          <!-- 码表说明 -->
          <a-form-item label=" 码表说明" name="sComment">
            <a-textarea v-model:value="formState.sComment" show-count :maxlength="100"></a-textarea>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <ModalAddCode v-if="modaladdcode.flagVisible" :modaladdcode="modaladdcode" @renovate-data="renovateData" />
  </div>
</template>

<script setup lang="ts">
  import { useMainStore } from '@/store/useInterfaceStore';
  import type { Rule } from 'ant-design-vue/es/form';
  import { modaladdcodeInter } from '@/api/aq/model';
  import ModalAddCode from '@/pages/table_management/components/ModalAddCode.vue';
  import { message, TableColumnType } from 'ant-design-vue';
  import { storeToRefs } from 'pinia';
  import { PropType } from 'vue';

  import { getstopwatch, getdetails, postaddstopwatch } from '@/api/aq/index';
  const props = defineProps({
    codeValueNotSavedVisible: {
      type: Boolean,
      defalut: false,
    },
    codeValue: { type: Object as PropType<typeof codeValueNot.value>, default: () => ({}) },
  });

  const emit = defineEmits(['closeCodeNot', 'openCodeSave', 'renovateData']);
  const Flag = ref<boolean>(false);
  //使用piana
  const mainStore = useMainStore();
  const codeValueNot = ref({
    sId: 0,
    key: '',
  });

  //表单验证
  const formRef = ref();
  const formState = ref({ sName: '', sComment: '' });
  //自定义的表单
  const modaladdcode = ref<modaladdcodeInter>({
    flagVisible: false,
    flag: 0,
    flagData: null,
  });
  const renovateData = async () => {
    //当那边得到sid,并写入piana里面的时候就告诉父,关闭页面
    console.log('已经拿到sid', mainStore.sidCodeValue);
    modaladdcode.value.flagVisible = false;
  };
  //校验码表名称
  const checkName = async (_rule: Rule, value: string) => {
    let reg = /^[\u4e00-\u9fa5a-zA-Z]{1,}$/;
    if (value === '') {
      return Promise.reject('码表名称不能为空');
    } else if (!reg.test(value)) {
      return Promise.reject('只能包含中文和英文');
    } else {
      return Promise.resolve();
    }
  };
  const rules = { sName: [{ required: true, validator: checkName, trigger: 'change' }] };
  //1码表码值
  const addcodeValueFlag = ref<boolean>(false);
  //3码值引用
  const codeValueReferenceFlag = ref<boolean>(false);
  watch(
    () => props.codeValueNotSavedVisible,
    n => {
      if (n) {
        Flag.value = true;
      }
    },
    {
      immediate: true,
    },
  );
  //监听传过来的sid和值

  const ceshi = () => {
    console.log(mainStore.sidCodeValue);
  };
  watch(
    () => props.codeValue,
    newcodeValue => {
      //piana传进去key,sId,
      mainStore.$patch(state => {
        state.sidCodeValue.key = newcodeValue.key;
        state.sidCodeValue.sId = newcodeValue.sId;
      });
    },
    {
      immediate: true,
    },
  );
  //最大的页面
  const cancel = () => {
    //传值关闭页面
    emit('closeCodeNot');
  };
  const handleOk = async () => {
    try {
      //操作,验证表单
      await formRef.value.validateFields();
      //验证新增没有
      if (selectedCid.value.length == 0) {
        await message.warning('未新增码值');
      } else {
        //发送请求
        await addStopWatch();
        //确认的时候关闭
        Flag.value = false;
        emit('closeCodeNot');
      }
    } catch (error) {
      await message.warning('名称或说明未填');
    }
  };
  //新增码表的方法
  const addData = reactive({ stopWatchValues: [], sStatus: 1, sComment: '', sName: '' });
  const addStopWatch = async () => {
    dataBodyAdd.value.forEach(item => {
      addData.stopWatchValues.push({ cComment: item.cComment, cName: item.cName, cValue: item.cValue, cStatus: 1 });
    });
    addData.sName = formState.value.sName;
    addData.sComment = formState.value.sComment;
    let res = await postaddstopwatch(addData);
    //得该条数据的sId,放进piana,并替换之前可能引用的sId
    //传进去sid,piana
    mainStore.$patch(state => {
      state.sidCodeValue.sId = res.data.sId;
    });
  };
  interface DataType {
    cValue: string;
    cName: string;
    cComment: string;
    cId: number;
    isCheck: number;
  }
  //多个多选的值
  const dataBodyAdd = ref<DataType[]>([]);
  //装已选的cid
  const selectedCid = ref<number[]>([]);
  //码值新增
  const selectedRowsArr = ref<object[]>([]); //单个
  const selectedRowKeysArr = ref<number[]>([]); //key
  //码值新增
  const rowSelection = {
    selectedRowKeys: selectedRowKeysArr,
    onChange: (selectedRowKeys: number[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      selectedRowKeysArr.value = selectedRowKeys;
      selectedRowsArr.value = selectedRows;
    },
    //已选之后不可选
    getCheckboxProps: (record: DataType) => {
      //为一的时候表示选中
      if (record.isCheck == 1) {
        return { disabled: true };
      }
    },
  };
  //1码值新增
  const handleOkaddcodeValueFlag = async () => {
    //页面
    addcodeValueFlag.value = false;
    //数组数字.所选的cid
    selectedRowsArr.value.forEach((item: any) => {
      selectedCid.value.push(item.cId);
      dataBodyAdd.value.push(item);
    });
    //清空这4个多选的数据
    selectedRowKeysArr.value = [];
    selectedRowsArr.value = [];
    //本来的数据modal
    dataBodyReference.value = [];
    referenceValueSid.value = undefined;
  };
  //3码值引用
  const handleOkReferenceFlag = () => {
    //传进去sid,piana
    mainStore.$patch(state => {
      state.sidCodeValue.sId = referenceValueSid.value ?? 0;
    });

    //点击码值引用确认后进入保存的页面
    codeValueReferenceFlag.value = false;
    //确认的时候关闭
    Flag.value = false;
    emit('closeCodeNot');
    // emit('openCodeSave');
  };
  const cancelReferenceFlag = () => {
    console.log('cancelReferenceFlag');
    codeValueReferenceFlag.value = false;
  };
  const options = ref<object[]>([]);
  //搜索下拉框的数据
  interface elementInterface {
    sId: number;
    sName: string;
  }
  const getSelectData = async () => {
    let res = await getstopwatch({ page: 1, num: 20 });
    res.data.forEach((element: elementInterface) => {
      options.value.push({ value: element.sId, label: element.sId + ' ' + element.sName });
    });
  };
  getSelectData();
  //引用下拉框选择的sid
  const referenceValueSid = ref<number>();
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const columnsReference: TableColumnType<DataType>[] = [
    { title: '码值取值', dataIndex: 'cValue' },
    { title: '码值名称', dataIndex: 'cName' },
    { title: '码值含义', dataIndex: 'cComment' },
  ];
  const columnsAdd: TableColumnType<DataType>[] = [
    { title: '码值取值', dataIndex: 'cValue' },
    { title: '码值名称', dataIndex: 'cName' },
    { title: '码值含义', dataIndex: 'cComment' },
    { title: '操作', dataIndex: 'operate' },
  ];
  //动态获得引用的sid
  watch(
    () => referenceValueSid.value,
    n => {
      if (n != undefined) {
        console.log(n);
        getDataBodyReference(n ?? 0);
      }
    },
  );

  //码值引用的databody,根据Sid查到数据
  const dataBodyReference = ref([]);

  //新增页面下面的表格数据
  const getDataBodyReference = async (sId: number) => {
    const res = await getdetails(sId);
    dataBodyReference.value = res.data.stopWatchValueList;
    selectedCid.value.forEach(selectedCid => {
      dataBodyReference.value.forEach((item: any) => {
        //如果存在已经选择的数据,传一个标识
        if (item.cId == selectedCid) {
          item.isCheck = 1;
        }
      });
    });
  };
  //删除
  const delRow = (item: any) => {
    let index = dataBodyAdd.value.indexOf(item);
    if (index !== -1) {
      dataBodyAdd.value.splice(index, 1);
    }
    //将他从禁选名单中剔除
    let index1 = selectedCid.value.indexOf(item.cId);
    if (index !== -1) {
      selectedCid.value.splice(index1, 1);
    }
  };
</script>

<style lang="less" scoped></style>
