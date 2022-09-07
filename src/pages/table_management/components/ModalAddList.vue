<template>
  <div>
    <a-modal v-model:visible="modaladdlist.visible" :title="modaladdlist.flag == 0 ? '新增标准' : '编辑标准'" width="700px" :mask-closable="false" @cancal="cancal" @ok="submit">
      <a-form ref="formRef" :model="formState" autocomplete="off" :rules="rules" :label-col="{ style: { width: '100px' } }">
        <a-form-item name="dcname" label="中文名称">
          <a-input v-model:value="formState.dcname" show-count :maxlength="30" />
        </a-form-item>
        <a-form-item name="dename" label="英文名称">
          <a-input v-model:value="formState.dename" show-count :maxlength="30" />
        </a-form-item>
        <a-form-item name="dcomment" label="标准说明">
          <a-textarea v-model:value="formState.dcomment" :rows="4" show-count :maxlength="200" />
        </a-form-item>
        <a-form-item name="dorigin" label="来源机构">
          <a-select v-model:value="formState.dorigin" :options="options.dorigin" />
        </a-form-item>
        <a-form-item name="dnull" label="是否可为空">
          <a-select v-model:value="formState.dnull" :options="options.dnull" />
        </a-form-item>
        <a-form-item name="dtype" label="数据类型">
          <a-select v-model:value="formState.dtype" :options="options.dtype" />
        </a-form-item>

        <a-form-item v-if="formState.dtype == 'Enum'" name="denum" label="枚举范围">
          <a-select v-model:value="formState.denum" :options="options.denum" />
        </a-form-item>
        <a-form-item v-if="formState.dtype == 'String'" name="dlength" label="数据长度">
          <a-input v-model:value="formState.dlength" max="10" />
        </a-form-item>
        <a-form-item v-if="formState.dtype == 'Float'" name="daccuracy" label="数据精度">
          <a-input v-model:value="formState.daccuracy" />
        </a-form-item>
        <a-space v-if="['Int', 'Float'].includes(formState.dtype)">
          <a-form-item name="drangemin" label="取值范围">
            <a-input v-model:value="formState.drangemin" style="width: 200px" :maxlength="41" placeholder="最小值" />
          </a-form-item>
          <a-form-item name="drangemax">
            <a-input v-model:value="formState.drangemax" style="width: 200px" :maxlength="41" placeholder="最大值" />
          </a-form-item>
        </a-space>

        <a-form-item v-if="['Int', 'Float', 'String', 'Enum'].includes(formState.dtype)" name="ddefault" label="默认值">
          <a-input v-model:value="formState.ddefault" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import type { Rule } from 'ant-design-vue/es/form';
  import { FormInstance, message } from 'ant-design-vue';

  import { ModalCodeFace } from '../../../api/aq/model';
  import { getstopwatch, adddirectory, aqputdirectory } from '../../../api/aq/index';

  const emit = defineEmits(['flsh']);
  //弹窗配置
  const props = defineProps({
    modaladdlist: {
      type: Object,
      defalut: function () {
        return {};
      },
    },
  });
  const modaladdlist = ref<ModalCodeFace>({
    visible: false,
    flag: 0,
    data: {},
  });
  watch(
    () => props.modaladdlist,
    (nVal: any) => {
      modaladdlist.value = nVal;
    },
    {
      immediate: true,
    },
  );

  const formRef = ref<FormInstance>();
  //表单
  interface addList {
    dcname: string;
    dename: string;
    dcomment: string;
    dorigin: string;
    dnull: string;
    dtype: string;
    dlength: string;
    daccuracy: string;
    ddefault: string;
    drange: string;
    denum: string;
    dstatus: number;
    sid: any;
    [propName: string]: any;
  }
  const formState = ref<addList>({
    dcname: '',
    dename: '',
    dcomment: '',
    dorigin: '', //来源机构
    dnull: '',
    dtype: '',
    drange: '', //取值范围
    drangemin: '',
    drangemax: '',
    ddefault: '',
    daccuracy: '', //数据精度
    denum: '',
    dlength: '',
    dstatus: 0,
    sid: '',
  });
  //表单 下拉配置项
  const options = ref({
    dorigin: [{ value: '数宜信', label: '数宜信' }], //来源机构
    dnull: [
      //是否为空
      { value: 0, label: '不可为空' },
      { value: 1, label: '可为空' },
    ],
    dtype: [
      //数据类型
      { value: 'Int', label: 'Int' },
      { value: 'Float', label: 'Float' },
      { value: 'String', label: 'String' },
      { value: 'Enum', label: 'Enum' },
    ],
    denum: [{ value: '', label: '' }], //枚举范围
    denummap: [{ sId: '', sName: '' }],
  });
  //枚举范围
  const enumAsk = async () => {
    try {
      const res = await getstopwatch({});
      res.data.forEach((element: any) => {
        options.value.denum.push({ value: element.sName, label: element.sName });
        options.value.denummap.push({ sId: element.sId, sName: element.sName }); //id
      });
    } catch (err) {
      console.log(err);
    }
  };
  enumAsk();
  const sId = (): number => {
    let id = 0;
    options.value.denummap.forEach((item: any) => {
      if (item.sName == formState.value.denum) id = item.sId;
    });
    return id;
  };

  //配置 校验规则
  const dcname = async (_rule: Rule, value: string) => {
    let reg = /^[\u4e00-\u9fa5a-zA-Z]{1,}$/;
    if (!value) return Promise.reject('请输入中文名称');
    else if (!reg.test(value)) return Promise.reject('只能由中文及中文英文大小写组成');
    else return Promise.resolve();
  };
  const dename = async (_rule: Rule, value: string) => {
    let reg = /^[a-zA-Z][a-zA-z0-9_]{1,}$/;
    if (!value) return Promise.reject('请输入英文名称');
    else if (!reg.test(value)) return Promise.reject('英文名称只支持英文大小写、数字及下划线且只能英文开头');
    else return Promise.resolve();
  };
  const checkNull = async (_rule: Rule, value: string) => {
    if (value === '') return Promise.reject('请选择');
    else return Promise.resolve();
  };
  const checkDrangeMin = async (_rule: Rule, value: number) => {
    while (formState.value.drangemax) {
      if (!value) return Promise.reject('请输入最小值');
      else if (value > formState.value.drangemax) return Promise.reject('最小值不能超过最大值');
      else return Promise.resolve();
    }
  };
  const checkDrangeMax = async (_rule: Rule, value: number) => {
    if (value < formState.value.drangemin) return Promise.reject('最大值不能低于最小值');
    else return Promise.resolve();
  };
  const checkDaccuracy = async (_rule: Rule, value: number) => {
    if (value) {
      if (value > 9 || value < 1) return Promise.reject('数据精度范围1-9');
      else return Promise.resolve();
    }
  };
  const checkDlength = async (_rule: Rule, value: number) => {
    if (value) {
      if (value < 1) return Promise.reject('数据长度最小为1');
      else return Promise.resolve();
    }
  };
  const rules = {
    dcname: [{ required: true, validator: dcname, trigger: 'change' }],
    dename: [{ required: true, validator: dename, trigger: 'change' }],
    dorigin: [{ required: true, validator: checkNull, trigger: 'change' }],
    dnull: [{ required: true, validator: checkNull, trigger: 'change' }],
    dtype: [{ required: true, validator: checkNull, trigger: 'change' }],
    denum: [{ required: true, validator: checkNull, trigger: 'change' }],
    drangemin: [{ validator: checkDrangeMin, trigger: 'change' }],
    drangemax: [{ validator: checkDrangeMax, trigger: 'change' }],
    daccuracy: [{ validator: checkDaccuracy, trigger: 'change' }],
    dlength: [{ validator: checkDlength, trigger: 'change' }],
  };

  //新增
  const addListForm = async () => {
    try {
      const res = await adddirectory({
        dCname: formState.value.dcname,
        dEname: formState.value.dename,
        dComment: formState.value.dcomment,
        dOrigin: formState.value.dorigin,
        dNull: formState.value.dnull,
        dType: formState.value.dtype,
        dLength: formState.value.dlength,
        dAccuracy: formState.value.daccuracy,
        dDefault: formState.value.ddefault,
        dRange: formState.value.drangemin == '' && formState.value.drangemax == '' ? '' : formState.value.drangemin + '-' + formState.value.drangemax,
        dEnum: formState.value.denum,
        dStatus: 0,
        sId: sId(),
      });
      message.success(res.msg);
      modaladdlist.value.visible = false;
      emit('flsh');
    } catch (err) {
      console.log(err);
    }
  };

  //编辑
  if (modaladdlist.value.flag == 1) {
    formState.value = modaladdlist.value.data;
    if (modaladdlist.value.data.drange.length > 1) {
      formState.value.drangemin = modaladdlist.value.data.drange.match(/(\S*)-/)[1];
      formState.value.drangemax = modaladdlist.value.data.drange.match(/-(\S*)/)[1];
    }
  }
  const edidLiatForm = async () => {
    try {
      const res = await aqputdirectory({
        dId: formState.value.did,
        dCname: formState.value.dcname,
        dEname: formState.value.dename,
        dComment: formState.value.dcomment,
        dOrigin: formState.value.dorigin,
        dType: formState.value.dtype,
        dLength: formState.value.dlength,
        dAccuracy: formState.value.daccuracy,
        dDefault: formState.value.ddefault,
        dRange: formState.value.drangemin == undefined ? '' : formState.value.drangemin + '-' + formState.value.drangemax,
        dEnum: formState.value.denum,
        dNull: formState.value.dnull == '可为空' ? 0 : 1,
        sId: sId(),
      });
      message.success(res.msg);
      modaladdlist.value.visible = false;
      emit('flsh');
    } catch (err) {
      console.log(err);
    }
  };

  //提交
  const submit = async () => {
    try {
      await formRef.value.validateFields();
      if (modaladdlist.value.flag == 0) addListForm();
      else if (modaladdlist.value.flag == 1) edidLiatForm();
    } catch (err) {
      console.log(err);
    }
  };

  //取消
  const cancal = () => {
    emit('flsh');
  };
</script>
<style scoped lang="less"></style>
