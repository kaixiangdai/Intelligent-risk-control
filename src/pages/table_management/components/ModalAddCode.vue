<template>
  <div>
    <a-modal
      v-model:visible="modaladdcode.flagVisible"
      :title="modaladdcode.flag == 0 ? '新增码表' : '编辑码表'"
      width="700px"
      ok-text="Submint"
      :mask-closable="false"
      cancel-text="Cancel"
      @ok="onOk"
    >
      <a-form ref="formRef" :model="formState" name="form_in_modal" autocomplete="off" :label-col="{ style: { width: '100px' } }">
        <!-- 码表名称 -->
        <a-form-item label="码表名称" name="name" :rules="rules.name">
          <a-input v-model:value.trim="formState.name" show-count :maxlength="30" placeholder="请输入码表名称（必填）" />
        </a-form-item>
        <!-- 码表说明 -->
        <a-form-item label=" 码表说明" name="comment">
          <a-textarea v-model:value="formState.comment" show-count :maxlength="200"></a-textarea>
        </a-form-item>
        <hr />
        <!-- 配置项 -->
        <a-space v-for="(item, index) in formState.codeConfigArr" :key="index" style="display: flex; margin-bottom: 8px">
          <a-form-item :name="['codeConfigArr', index, 'cValue']" :rules="rules.cValue">
            <a-input v-model:value.trim="item.cValue" :maxlength="10" placeholder="码值取值（必填）" />
          </a-form-item>
          <a-form-item :name="['codeConfigArr', index, 'cName']" :rules="rules.cName">
            <a-input v-model:value.trim="item.cName" :maxlength="30" placeholder="码值名称（必填）" />
          </a-form-item>
          <a-form-item :name="['codeConfigArr', index, 'cComment']">
            <a-input v-model:value="item.cComment" show-count :maxlength="200" placeholder="码值含义" />
          </a-form-item>
          <!-- delete图标 -->
          <div style="margin-top: -20px">
            <MinusCircleOutlined @click="deleteItem(item, index)" />
          </div>
        </a-space>
        <!-- add图标 -->
        <a-form-item>
          <a-button type="dashed" block @click="addCodeItem">
            <PlusOutlined />
            Add Item
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { message } from 'ant-design-vue';
  import { useMainStore } from '@/store/useInterfaceStore';
  import type { Rule } from 'ant-design-vue/es/form';
  import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { getdetails, postaddstopwatch, postUpdate } from '@/api/aq/index';

  const props = defineProps({
    modaladdcode: {
      type: Object,
      default: function () {
        return {};
      },
    },
  });
  const emit = defineEmits(['renovateData']);
  //使用piana
  const mainStore = useMainStore();

  interface modaladdcode {
    flagVisible: boolean;
    flag: number;
    flagData: any;
  }
  const modaladdcode = ref<modaladdcode>({
    flagVisible: false,
    flag: 0,
    flagData: {},
  });
  watch(
    () => props.modaladdcode,
    (nVal: any) => {
      modaladdcode.value = nVal;
    },
    {
      immediate: true,
    },
  );

  interface Code {
    cValue: string;
    cName: string;
    cComment: string;
    cStatus: number;
  }

  interface FormState {
    name: string;
    comment: string;
    codeConfigArr: Code[];
  }

  //表单数据
  const formState = ref<FormState>({
    name: '',
    comment: '',
    codeConfigArr: [{ cValue: '', cName: '', cComment: '', cStatus: 1 }],
  });

  //获得编辑数据
  const getEdit = async (id: number) => {
    const res = await getdetails(id);
    formState.value.name = res.data.sname;
    formState.value.comment = res.data.scomment;
    formState.value.codeConfigArr = res.data.stopWatchValueList;
  };
  //编辑时，请求数据
  if (modaladdcode.value.flag == 1) getEdit(modaladdcode.value.flagData.sId);

  //添加
  const addCodeItem = () => {
    formState.value.codeConfigArr.push({ cValue: '', cName: '', cComment: '', cStatus: 1 });
  };

  //删除
  const editArr = ref<any[]>([]);
  const deleteItem = (item: any, index: number) => {
    if (modaladdcode.value.flag == 0) formState.value.codeConfigArr.splice(index, 1);
    if (modaladdcode.value.flag == 1) {
      item.cStatus = 2;
      editArr.value.push(item);
      formState.value.codeConfigArr.splice(index, 1);
    }
  };

  //校验配置项是否存在相同值 true|不存在  false|存在
  const checkSameValue = (key: string, value: string) => {
    if (key === 'cValue') {
      let len = formState.value.codeConfigArr.filter((item: any) => item.cValue == value).length;
      if (len > 1) return false;
      else return true;
    } else if (key === 'cName') {
      let len = formState.value.codeConfigArr.filter((item: any) => item.cName == value).length;
      if (len > 1) return false;
      else return true;
    }
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

  //校验码值取值
  const checkcValue = async (_rule: Rule, value: string) => {
    if (value === '') {
      return Promise.reject('码值取值不能为空');
    } else if (!checkSameValue('cValue', value)) {
      return Promise.reject('存在相同码值取值');
    }
  };

  //校验码值名称
  const checkcName = async (_rule: Rule, value: string) => {
    let reg = /^[\u4e00-\u9fa5a-zA-Z]{1,}$/;
    if (value === '') {
      return Promise.reject('码值名称不能为空');
    } else if (!reg.test(value)) {
      return Promise.reject('只能包含中文和英文');
    } else if (!checkSameValue('cName', value)) {
      return Promise.reject('存在相同码值名称');
    } else {
      return Promise.resolve();
    }
  };

  // 校验集
  const rules = {
    name: [{ required: true, validator: checkName, trigger: 'change' }],
    cValue: [{ required: true, validator: checkcValue, trigger: 'change' }],
    cName: [{ required: true, validator: checkcName, trigger: 'change' }],
  };

  //新增
  const addCode = async () => {
    try {
      let res = await postaddstopwatch({
        sName: formState.value.name,
        sComment: formState.value.comment,
        stopWatchValues: formState.value.codeConfigArr,
      });
      console.log('res:', res);
      //将得到的新的sid放在piana
      mainStore.$patch(state => {
        state.sidCodeValue.sId = res.data.sId;
      });
      modaladdcode.value.flagVisible = false;
      emit('renovateData');
      message.success('新增成功');
    } catch (err) {
      console.log(err);
      message.error('新增失败');
    }
  };

  //编辑
  const editCode = async () => {
    console.log({
      sId: modaladdcode.value.flagData.sId,
      sName: formState.value.name,
      sComment: formState.value.comment,
      stopWatchValues: formState.value.codeConfigArr.concat(editArr.value),
    });

    try {
      await postUpdate({
        sId: modaladdcode.value.flagData.sId,
        sName: formState.value.name,
        sComment: formState.value.comment,
        stopWatchValues: formState.value.codeConfigArr.concat(editArr.value),
      });
      modaladdcode.value.flagVisible = false;
      emit('renovateData');
      message.success('修改成功');
    } catch (err) {
      console.log(err);
      message.error('修改失败');
    }
  };

  //弹框 按钮
  const formRef = ref<FormInstance>();
  const onOk = () => {
    formRef.value
      .validateFields()
      .then(() => {
        if (modaladdcode.value.flag == 0) {
          addCode();
        } else if (modaladdcode.value.flag == 1) {
          editCode();
        }
      })
      .catch(err => {
        console.log('Validate Failed:', err);
      });
  };
</script>
<style scoped lang="less">
  .code-config {
    display: flex;
    justify-content: space-between;
  }
</style>
