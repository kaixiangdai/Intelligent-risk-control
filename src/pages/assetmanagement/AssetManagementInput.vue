<template>
  <div class="container">
    <div>
      <a-row :span="6" :pull="8" style="font-size: 1.2em; font-weight: 900"> <span style="color: red">*</span>数据资产表基础信息: </a-row>
    </div>
    <a-form ref="formRef" :rules="rules" v-bind="layout" :model="formState" autocomplete="off">
      <a-form-item label="中文名称" name="acname">
        <a-input v-model:value="formState.acname" show-count :maxlength="30" />
      </a-form-item>
      <a-form-item label="英文名称" name="aename">
        <a-input v-model:value="formState.aename" show-count :maxlength="30" />
      </a-form-item>
      <a-form-item label="数据资产描述" name="adescribe">
        <a-input v-model:value="formState.adescribe" show-count :maxlength="200" />
      </a-form-item>
      <!-- 树形选框 -->
      <a-form-item label="所属目录" name="adIdOne">
        <a-tree-select
          v-model:value="formState.adIdOne"
          v-model:selectedKeys="selectedKeys"
          :field-names="{ children: 'children', label: 'adName', value: 'adId' }"
          allow-clear
          multiple
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :show-checked-strategy="SHOW_ALL"
          tree-default-expand-all
          placeholder="请选择树"
          :tree-data="_treeData"
        >
          <template #tagRender="{ label, closable, onClose }">
            <a-tag :closable="closable" style="margin-right: 3px" @close="onClose"> {{ label }}&nbsp;&nbsp; </a-tag>
          </template>
        </a-tree-select>
      </a-form-item>
    </a-form>
    <!-- 下方表格 -->
    <a-row :span="9" :push="1" style="font-size: 1.2em; font-weight: 900">
      <span style="color: red; opacity: 0">*</span>数据资产表字段添加：
      <a-button type="primary" @click.stop="pushArr"> 添加字段</a-button>
    </a-row>

    <div class="outer-container">
      <div class="inner-container"
        ><AssetManagementInputDown v-if="true" ref="mychild" :table-field-down-axios="tableFieldDownAxios" @send-data="sendData" @jiao-error="jiaoError" @delft-ids-fun="delftIdsFun" />
      </div>
    </div>
    <a-form-item :wrapper-col="{ offset: 10, span: 16 }">
      <a-button><router-link to="/three/test5">取消</router-link></a-button
      >　
      <a-button type="primary" @click="submitData">确认</a-button>
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
  import AssetManagementInputDown from './AssetManagementInputDown.vue';
  import { TreeSelect, Form, message } from 'ant-design-vue';
  import useTreeSelect from '@/hook/useTreeSelect';
  import { formTableFieldInterface } from '@/api/aq/model';
  import { dataassetsdatadetails, kxdataassetsadd, kxdataassetsupdate } from '@/api/aq/index';
  import { useRoute, useRouter } from 'vue-router';
  const formRef = ref();
  const SHOW_ALL = TreeSelect.SHOW_ALL;
  //清空方法
  const useForm = Form.useForm;
  //父调用子方法
  const mychild = ref();
  interface AdIdInterface {
    adId?: number;
  }
  interface FormState {
    acname: string;
    aename: string;
    adescribe: string;
    adIdOne: AdIdInterface[];
    formTableField: formTableFieldInterface[];
  }
  const formState = reactive<FormState>({
    acname: '',
    aename: '',
    adescribe: '',
    adIdOne: [],
    formTableField: [],
  });
  //在父点击确认的时候,将数据拿到
  const sendData = (formTableField: any) => {
    formState.formTableField = formTableField;
  };
  //子校验不通过
  const jiaoErrorFlag = ref();
  const jiaoError = (state: boolean) => {
    jiaoErrorFlag.value = state;
  };
  //点击确认,提交
  const submitData = async () => {
    try {
      await formRef.value.validate();
      console.log('Finish:', toRaw(formState));
      //拿到子的值
      await mychild.value.checkField(1);
      console.log(formState);
      //中断
      if (jiaoErrorFlag.value == false) {
        return false;
      }

      //判断是哪种状态,如果有router的aid就是编辑
      if (aId != undefined) {
        //编辑
        await editaxios();
        router.push('/three/test5');
      } else {
        await addaxios();
        router.push('/three/test5');
      }
    } catch (error: any) {
      console.log('error', error);
    }
  };
  //子组件校验再添加
  const pushArr = async () => {
    mychild.value.checkField(0);
    console.log(tableFieldDownAxios);
  };

  //校验规则
  const rules = {
    //里面写效验规则
    acname: { required: true, max: 30, message: '长度最大为30,中文名称只支持中文 及中文+英文大小写', pattern: /^[\u4e00-\u9fa5a-zA-Z]{0,}$/, trigger: ['blur', 'change'] },
    aename: { required: true, max: 30, message: '英文名称只支持英文大小写、数字及下划线且只能英文开头,长度最大为30', pattern: /^[a-zA-Z][a-zA-z0-9_]{0,30}$/, trigger: ['blur', 'change'] },
    adescribe: { required: false, max: 200, message: '数据资产表描述长度最大为200', trigger: ['blur', 'change'] },
    adIdOne: { required: true, message: '必填', trigger: ['blur', 'change'] },
  };
  const { resetFields } = useForm(formState);
  const { _treeData } = useTreeSelect();
  //这里使用了hook存放树的值
  const selectedKeys = ref<string[]>(['0']); //选择的目录key
  //布局
  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
  };

  // //编辑
  const route = useRoute();
  const router = useRouter();
  //装初始页面获得的数组
  let getadIdOneAxios = ref<number[]>([]);
  let aId = route.query.aId;
  //下方表格数据
  const tableFieldDownAxios: Array<string> = [];
  //根据aId查到数据并展示
  const getaxios = async () => {
    let res = await dataassetsdatadetails(aId);
    //给第三部分加上flag,数据传给子
    res.data.dataFieldAndDirectoryVoList.forEach((element: any) => {
      tableFieldDownAxios.push({ ...element, editFlag: true });
    });
    //子拿到数据
    mychild.value.getDataProps();
    //1
    formState.acname = res.data.acname;
    formState.aename = res.data.aename;
    formState.adescribe = res.data.adescribe;
    //2
    if (res.data.dataAssetsDirectoryVoList == null) {
      formState.adIdOne = [];
    } else {
      getadIdOneAxios.value = [];
      res.data.dataAssetsDirectoryVoList.forEach((item: any) => {
        formState.adIdOne.push(item.adId);
        getadIdOneAxios.value.push(item.adId);
      });
    }
  };
  //如果有参数 判断为编辑
  if (aId != undefined) {
    getaxios();
  } else {
    // resetFields();
    console.log('无');
  }
  interface objMid {
    adId: string | number;
  }
  // 分割
  const adIdList = ref<objMid[]>([]);
  //adIdOne变形为对象
  const arrToObject = () => {
    formState.adIdOne.forEach(item => {
      let objMid = { adId: '' };
      objMid.adId = item;
      adIdList.value.push(objMid);
    });
  };
  //axios的第三部分
  const dataFieldList = ref<object[]>([]);
  //去掉数组不需要的
  const delEditFlag = () => {
    dataFieldList.value = [];
    formState.formTableField.forEach(item => {
      let { editFlag, ...objNew } = item;
      dataFieldList.value.push(objNew);
      // console.log(item);
    });
  };
  //新增方法
  const addaxios = async () => {
    //得到adIdList第二部分
    arrToObject();
    // axios的第三部分
    delEditFlag();
    let addArr = {
      acname: formState.acname,
      aename: formState.aename,
      adescribe: formState.adescribe,
      adIdList: adIdList.value,
      dataFieldList: dataFieldList.value,
    };
    console.log(addArr);
    //发送新增
    const res = await kxdataassetsadd(addArr);
    message.success(res.msg);
    resetFields();
  };

  //删除的数组
  const addadIds = ref([]);
  const deladIds = ref([]);
  const delftIds = ref<number[]>([]);

  const delftIdsFun = (One: any) => {
    //删除的下面的一条数据
    delftIds.value.push(One.ftId);
  };
  //修改方法
  const editaxios = async () => {
    // axios的第三部分修改去掉flag
    delEditFlag();
    console.log(dataFieldList.value);
    const _arr1 = new Set(getadIdOneAxios.value);
    const _arr2 = new Set(formState.adIdOne);
    //取交集
    const someArr = [...new Set([..._arr1].filter(x => _arr2.has(x)))];
    formState.adIdOne.map(item => {
      addadIds.value = [];
      if (someArr.indexOf(item) === -1) {
        addadIds.value.push(item);
      }
    });
    //删除的
    getadIdOneAxios.value.map(item => {
      deladIds.value = [];
      if (someArr.indexOf(item) === -1) {
        deladIds.value.push(item);
      }
    });
    interface editdataFieldListItem {
      fieldDataId: string | number | undefined;
      ftId: number | undefined;
      ftEname: string;
      ftCname: string;
      ftComment: string;
      did: number | undefined;
    }
    let editdataFieldList = ref<editdataFieldListItem[]>([]);
    dataFieldList.value.forEach((item: any) => {
      //此处did区大小写,
      editdataFieldList.value.push({ fieldDataId: item.fieldDataId, ftId: item.ftId, ftEname: item.ftEname, ftCname: item.ftCname, ftComment: item.ftComment, did: item.dId });
    });
    //发送的数据
    let updateArr = {
      aid: aId,
      acname: formState.acname,
      aename: formState.aename,
      adescribe: formState.adescribe,
      //以下为数组
      addadIds: addadIds.value,
      deladIds: deladIds.value,
      dataFieldDTOList: editdataFieldList.value,
      delftIds: delftIds.value,
    };
    //发送新增
    console.log(updateArr);

    const res = await kxdataassetsupdate(updateArr);
    if (res.msg == '返回成功') {
      //清空
      resetFields();
      message.success(res.msg);
    } else {
      message.error(res.msg);
    }
  };
</script>

<style lang="less" scoped>
  .outer-container {
    position: relative;
    overflow: hidden;
    margin: 10px 0px;
    height: 250px;
  }

  .inner-container {
    position: absolute;
    top: 0;
    right: -17px;
    bottom: 0;
    left: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }
</style>
