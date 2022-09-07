<template>
  <div class="flow-out">
    <div>
      <a-row :span="6" :pull="8" style="font-size: 1.2em; font-weight: 900"> <span style="color: red">*</span>数据资产表基础信息: </a-row>
    </div>
    <!-- 上方表格 -->
    <div class="biao">
      <a-form ref="formRef" :model="formState" name="basic" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" autocomplete="off" @finish="onFinish" @finish-failed="onFinishFailed">
        <a-form-item
          label="中文名称"
          name="acname"
          :rules="[{ required: true, max: 30, message: '长度最大为30,中文名称只支持中文 及中文+英文大小写', pattern: /^[\u4e00-\u9fa5]{1,}$|[\u4e00-\u9fa5][a-zA-Z]{1,}$/ }]"
        >
          <a-input v-model:value="formState.acname" />
        </a-form-item>
        <a-form-item label="英文名称" name="aename" :rules="[{ required: true, message: '英文名称只支持英文大小写、数字及下划线且只能英文开头,长度最大为30', pattern: /^[a-zA-Z][a-zA-z0-9_]{1,}$/ }]">
          <a-input v-model:value="formState.aename" :maxlength="30" />
        </a-form-item>
        <a-form-item label="数据资产描述" name="adescribe" :rules="[{ required: false, message: '数据资产表描述长度最大为200' }]">
          <a-input v-model:value="formState.adescribe" />
        </a-form-item>
        <!-- 树形选框 -->
        <a-form-item label="所属目录" name="adIdOne" :rules="[{ required: true, message: '必填' }]">
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

        <!-- 下方表格 -->
        <a-row :span="9" :push="1" style="font-size: 1.2em; font-weight: 900">
          <span style="color: red; opacity: 0">*</span>数据资产表字段添加：
          <a-button type="primary" @click.stop="pushArr"> 添加字段</a-button>
        </a-row>

        <div class="outer-container">
          <div class="inner-container">
            <a-row v-for="(large, index) in formState.larges" :key="index">
              <a-col :span="3">
                <a-form-item :name="['larges', index, 'ftEname']" :rules="[{ required: true, message: '只能英文开头', pattern: /^[a-zA-Z][a-zA-z0-9_]{1,}$/ }]">
                  <a-input v-model:value="large.ftEname" :maxlength="30" :disabled="large.editFlag" placeholder="字段英文名称(必填)" />
                </a-form-item>
              </a-col>
              <a-col :span="3">
                <a-form-item :name="['larges', index, 'ftCname']" :rules="[{ required: true, message: '只支持中文开头', pattern: /^[\u4e00-\u9fa5]{1,}$|[\u4e00-\u9fa5][a-zA-Z]{1,}$/ }]">
                  <a-input v-model:value="large.ftCname" :maxlength="30" :disabled="large.editFlag" placeholder="字段中文名称(必填)" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :name="['larges', index, 'ftComment']">
                  <a-input v-model:value="large.ftComment" :disabled="large.editFlag" placeholder="字段说明" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :name="['larges', index, 'dId']" :rules="[{ required: true, message: '请选择映射' }]">
                  <a-select v-model:value="large.dId" show-search placeholder="请选择映射(必填)" :options="options" :filter-option="filterOption" :allow-clear="true" :disabled="large.editFlag">
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="2">
                <a v-if="!large.editFlag" @click.stop="(large.editFlag = true), preservation(large)"> <check-circle-outlined style="font-size: 20px" title="保存" /> </a>　
                <a v-else @click.stop="edit(large), preservation(large)"> <form-outlined style="font-size: 20px" title="编辑" /> </a>　
                <a v-if="large.editFlag" @click="delLine(large, index)">
                  <delete-outlined style="font-size: 20px" title="删除" />
                </a>
                <a v-else @click.stop="cancelHandle(large, index)">
                  <close-circle-outlined style="font-size: 20px" title="取消" />
                </a>
              </a-col>
            </a-row>
          </div>
        </div>
        <!-- 底部的按钮 -->
        <a-form-item :wrapper-col="{ offset: 10, span: 16 }">
          <a-button type="primary" html-type="submit">确认</a-button>　　
          <a-popconfirm title="确定清除全部？" ok-text="Yes" cancel-text="No" @confirm="resetForm">
            <a-button type="danger">全部清空</a-button>
          </a-popconfirm>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { SelectProps, TreeSelect, Form, message, FormInstance } from 'ant-design-vue';
  import { aqtreeData, optionseAxiosItem, largesItemInterface } from '@/api/aq/model';
  import { useRoute, useRouter } from 'vue-router';
  import { cloneDeep } from 'lodash-es';
  import { dataassetsdatadetails, aqgetdirectorylists, getdirectory, kxdataassetsadd, kxdataassetsupdate } from '@/api/aq/index';
  const formRef = ref<FormInstance>();
  const SHOW_ALL = TreeSelect.SHOW_ALL;

  //分割
  //上面的数据
  const formState = reactive({
    acname: '',
    aename: '',
    adescribe: '',
    adIdOne: [],
    //下面tableField
    larges: [
      {
        fieldDataId: undefined,
        ftId: '',
        ftEname: '',
        ftCname: '',
        ftComment: '',
        dId: undefined,
        //判断编辑
        editFlag: false,
      },
    ],
  });
  //小的
  const small = ref({
    fieldDataId: undefined,
    ftId: '',
    ftEname: '',
    ftCname: '',
    ftComment: '',
    dId: undefined,
    //判断编辑
    editFlag: false,
  });

  //清空方法
  const useForm = Form.useForm;
  const { resetFields } = useForm(formState);
  // aq数据资产表目录
  const _treeData = ref<aqtreeData[]>([]);
  // 请求数据资产表目录
  async function requestTreedata() {
    try {
      const res = await aqgetdirectorylists();
      _treeData.value = _replaceType(res.data); //处理数据
    } catch (error) {
      console.log(error);
    }
  }
  requestTreedata();
  const selectedKeys = ref<string[]>(['0']); //选择的目录key
  function _replaceType(treearr: aqtreeData[]): aqtreeData[] {
    //递归遍历树形结构 转化adId类型为string
    treearr.forEach((item: aqtreeData) => {
      // item.adId = item.adId + '';

      if (item.children && item.children.length > 0) {
        _replaceType(item.children);
        item.disabled = true;
      }
    });
    return treearr;
  }
  //编辑
  const route = useRoute();
  const router = useRouter();
  //装初始页面获得的数组
  let getadIdOneAxios = ref<number[]>([]);
  let aId = route.query.aId;
  //根据aId查到数据并展示
  const getaxios = async () => {
    let res = await dataassetsdatadetails(aId);
    //给第三部分加上flag
    const formStateLagesAxios: Array<string> = [];
    res.data.dataFieldAndDirectoryVoList.forEach((element: any) => {
      formStateLagesAxios.push(element);

      // formState.larges.push({
      //   editFlag: false,
      //   fieldDataId: element.fieldDataId,
      //   ftId: element.ftId,
      //   ftEname: element.ftEname,
      //   ftCname: element.ftCname,
      //   ftComment: element.ftComment,
      //   dId: element.dId,
      // });
    });
    formState.larges = formStateLagesAxios.map(v => {
      return { ...v, editFlag: true };
    });
    //1
    formState.acname = res.data.acname;
    formState.aename = res.data.aename;
    formState.adescribe = res.data.adescribe;
    //2
    if (res.data.dataAssetsDirectoryVoList == null) {
      formState.adIdOne = [];
    } else {
      getadIdOneAxios.value = [];
      res.data.dataAssetsDirectoryVoList.forEach(item => {
        formState.adIdOne.push(item.adId);
        getadIdOneAxios.value.push(item.adId);
      });
    }
  };
  //如果有参数 判断为编辑
  if (aId != undefined) {
    formState.larges = [];
    getaxios();
  } else {
    resetFields();
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
    formState.larges.forEach(item => {
      let { editFlag, ...objNew } = item;
      dataFieldList.value.push(objNew);
      // console.log(item);
    });
  };

  //拦截,页面的验证失败
  const onFinishFailed = (errorInfo: any) => {
    arrToObject();
    console.log('Failed:', errorInfo);
    message.warning('还有必填项');
  };

  //新增
  const addaxios = async () => {
    //得到adIdList第二部分
    arrToObject();
    // axios的第三部分
    delEditFlag();
    //large.value修改delftIds
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

  //修改
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
      // for (let key in editdataFieldList.value) {
      //   editdataFieldList.value[key] = item[key];}
      // let objDid = { did: item.dId };
      // editdataFieldList.value={...editdataFieldList.value,...objDid};
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
    const res = await kxdataassetsupdate(updateArr);
    if (res.msg == '返回成功') {
      //清空
      resetFields();
      message.success(res.msg);
    } else {
      message.error(res.msg);
    }
  };

  // 全部清空
  const resetForm = () => {
    resetFields();
  };
  //树形选框

  //搜索的下拉框
  const options = ref<SelectProps['options']>([]);
  //数据:标准映射
  const data = ref<optionseAxiosItem[]>([]);
  //搜索下拉框的数据
  const inquireFun = async () => {
    let res = await getdirectory();
    try {
      data.value = res.data.directoryStandardVoList.list;
      data.value.forEach(element => {
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

  //添加字段
  const pushArr = () => {
    //把已经填好的数据进行保存
    formState.larges.forEach(item => {
      item.editFlag = true;
    });
    //再添加.深拷贝
    const shallowCopy = cloneDeep(small.value);
    formState.larges.unshift(shallowCopy);
  };
  //删除数组
  const delLine = (large: largesItemInterface, index: number) => {
    delftIds.value.push(large.ftId);
    formState.larges.splice(index, 1);
    message.success('删除成功,待确认', 3);
  };
  //中间变量
  const editRow = ref();
  //保存
  function preservation(item: any) {
    console.log(item);
    let itemCopy: any = cloneDeep(item);
    editRow.value = itemCopy;
  }
  //取消按钮
  function cancelHandle(large: any, index: number) {
    let editRowJson = JSON.stringify(editRow.value);
    let largeRowJson = JSON.stringify(large);
    //初始状态editRowJson为空,没有保存任何东西.取消失败,比较修改前后的数据是否相同
    if (editRowJson != undefined) {
      if (editRowJson != largeRowJson) {
        console.log(formState.larges);
        // console.log(item.editFlag);
        formState.larges.splice(index, 1, editRow.value);
      } else {
        message.error('修改前后相同,请先保存其他数据', 3);
        large.editFlag = true;
      }
    } else {
      message.error('未进行编辑');
      large.editFlag = true;
    }
  }
  //编辑按钮
  function edit(item: any) {
    preservation(item);
    //校验内容
    let contentFlag = 0;
    formState.larges.forEach(inn => {
      if (inn.editFlag == false) {
        contentFlag++;
      }
    });
    if (contentFlag < 1) {
      item.editFlag = !item.editFlag;
    } else {
      message.error('请先保存其他数据');
    }
  }

  //点击确认成功
  const onFinish = (values: any) => {
    console.log('Success:', values);
    if (aId != undefined) {
      editaxios();
      router.push('/three/test5');
    } else {
      addaxios();
      router.push('/three/test5');
    }
  };
</script>
<style lang="less" scoped>
  //隐藏滚动条
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
