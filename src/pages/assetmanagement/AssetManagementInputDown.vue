<template>
  <div class="container">
    <a-form ref="formRefTableField" :model="formTableField" name="basic2" autocomplete="off" @finish="onFinish">
      <a-row v-for="(formOne, index) in formTableField.formOnes" :key="index" :gutter="18">
        <a-col :span="4">
          <a-form-item
            :name="['formOnes', index, 'ftEname']"
            :rules="{ required: true, message: '英文大小写以及数字且只能英文开头', pattern: /^[a-zA-Z][a-zA-z0-9_]{0,}$/, trigger: ['blur', 'change'] }"
          >
            <a-input v-model:value="formOne.ftEname" placeholder="字段英文名称(必填)" show-count :maxlength="30" @change="editField(formOne)" @focus="saveEditLine(formOne)" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item :name="['formOnes', index, 'ftCname']" :rules="{ required: true, message: '中文以及英文大小写', pattern: /^[\u4e00-\u9fa5a-zA-Z]{0,}$/, trigger: ['blur', 'change'] }">
            <a-input v-model:value="formOne.ftCname" placeholder="字段中文名称(必填)" show-count :maxlength="30" />
          </a-form-item>
        </a-col>
        <a-col :span="7">
          <a-form-item :name="['formOnes', index, 'ftComment']">
            <a-input v-model:value="formOne.ftComment" placeholder="字段说明" show-count :maxlength="200" />
          </a-form-item>
        </a-col>
        <a-col :span="7">
          <a-form-item :name="['formOnes', index, 'dId']" :rules="{ required: true, message: '请选择映射', trigger: ['blur', 'change'] }">
            <a-select v-model:value="formOne.dId" show-search placeholder="请选择映射(必填)" :options="options" :filter-option="filterOption" :allow-clear="true"> </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="2" @click="formOne.editFlag = !formOne.editFlag">
          <a-row v-if="formOne.editFlag" style="margin-top: 5px">
            <a> <form-outlined style="font-size: 20px" title="编辑" @click="saveEditLine(formOne)" /> </a>　
            <a><delete-outlined style="font-size: 20px" title="删除" @click="delLine(formOne)" /></a>
          </a-row>
          <a-row v-else style="margin-top: 5px">
            <a><check-circle-outlined style="font-size: 20px" title="保存" @click="saveEditLine(formOne)" /> </a>　
            <a> <close-circle-outlined style="font-size: 20px" title="取消" @click="cancelEditLine(formOne)" /></a>
          </a-row>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { message } from 'ant-design-vue';
  import { optionseAxiosItem } from '@/api/aq/model';
  import { getdirectory } from '@/api/aq/index';
  import { cloneDeep } from 'lodash-es';
  import { PropType } from 'vue';
  const emit = defineEmits(['pushForm', 'recordAIdFlag', 'sendData', 'jiaoError', 'delftIdsFun']);
  const props = defineProps({
    tableFieldDownAxios: {
      type: Object as PropType<typeof formTableField.formOnes>,
      default: () => ({}),
    },
  });
  const formRefTableField = ref();
  const formTableField = reactive({
    formOnes: [
      {
        fieldDataId: undefined,
        ftId: undefined,
        ftEname: '',
        ftCname: '',
        ftComment: '',
        dId: undefined,
        editFlag: true,
      },
    ],
  });
  //push的变量
  const formTableFieldPush = ref({
    fieldDataId: undefined,
    ftId: undefined,
    ftEname: '',
    ftCname: '',
    ftComment: '',
    dId: undefined,
    editFlag: true,
  });
  //中间变量
  const formTableFieldAlone = ref();
  //搜索的下拉框
  interface optionseAxiosItemInterface {
    value: number;
    label: string;
  }
  const options = ref<optionseAxiosItemInterface[]>([]);
  //搜索下拉框的数据
  const inquireFun = async () => {
    //拿到所有数据
    let res = await getdirectory({ page: '', num: '' });
    try {
      res.data.directoryStandardVoList.list.forEach((element: optionseAxiosItem) => {
        options.value.push({ value: element.did, label: element.dcode + ' ' + element.dcname + ' ' + element.dename });
      });
    } catch {
      message.error('数据不正确');
    }
  };
  inquireFun();
  //根据展示的内容搜索
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  //校验规则
  // const rules = {
  //   ftEname: { required: true, message: '只能英文开头', pattern: /^[a-zA-Z][a-zA-z0-9_]{1,}$/, trigger: ['blur', 'change'] },
  //   ftCname: { required: true, message: '只支持中文开头', pattern: /^[\u4e00-\u9fa5]{1,}$|[\u4e00-\u9fa5][a-zA-Z]{1,}$/, trigger: ['blur', 'change'] },
  //   ftComment: { required: false, max: 100 },
  //   dId: { required: true, message: '请选择映射', trigger: ['blur', 'change'] },
  // };
  //校验,并添加的方法
  //校验和添加到整个父的数据里面
  //父在此调用了该函数
  const checkField = async (parameter: number) => {
    try {
      await formRefTableField.value.validate();
      emit('jiaoError', true);
      // 添加的时候
      if (parameter == 0) {
        formTableField.formOnes.push(cloneDeep(formTableFieldPush.value));
      }
      //提交表单的时候
      if (parameter == 1) {
        emit('sendData', formTableField.formOnes ?? []);
      }
    } catch (error: any) {
      console.log('error', error);
      //给父传过去一个值作为子校验状态值,默认为true,,如果校验失败,变为false
      emit('jiaoError', false);
    }
  };

  const onFinish = () => {
    console.log('Received values of form:', formTableField.formOnes);
  };
  //删除
  const delLine = (item: any) => {
    emit('delftIdsFun', item);
    let index = formTableField.formOnes.indexOf(item);
    if (index !== -1) {
      formTableField.formOnes.splice(index, 1);
    }
  };
  //当进行编辑的时候默认转换为可以保存,以及取消保存
  const editField = (item: any) => {
    item.editFlag = false;
  };
  //保存，编辑
  const editIndex = ref();
  const saveEditLine = async (item: any) => {
    //把item赋值给formTableFieldAlone,临时变量
    formTableFieldAlone.value = { ...item };
    //记录当前是第几行
    editIndex.value = formTableField.formOnes.findIndex(v => v.ftEname === item.ftEname);
  };
  //取消保存
  const cancelEditLine = async (item: any) => {
    formTableField.formOnes[editIndex.value] = {
      ...formTableFieldAlone.value,
    };
    console.log(item.editFlag, editIndex.value);
    item.editFlag = !item.editFlag;
  };
  const getDataProps = () => {
    formTableField.formOnes = props.tableFieldDownAxios;
  };

  defineExpose({ checkField, getDataProps });
</script>

<style lang="less" scoped></style>
