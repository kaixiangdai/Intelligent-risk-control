<template>
  <div>
    <div style="display: flex">
      <a-space>
        {{ ['输入参数', '请求Body', '返回参数'].at(whichOne) }}
        <a-button type="primary" size="small" @click="addnew">新增参数</a-button>
        <a-button v-if="whichOne > 0" type="primary" size="small" @click="importjson(whichOne)">JSON数据导入</a-button>
      </a-space>
    </div>

    <a-form ref="formtable" :model="editableData">
      <a-table v-model:expandedRowKeys="expandedRowKeys" :pagination="false" size="small" :columns="_confuguration.columns[whichOne]" :data-source="dataSource" bordered>
        <template #bodyCell="{ column, text, record }">
          <!-- input -->
          <template v-if="['icName', 'icDefault', 'icComment'].includes(column.dataIndex)">
            <a-form-item v-if="column.dataIndex == 'icName' && editableData[record.key]" :has-feedback="true" :name="[record.key, 'icName']" :rules="[{ validator: validatorName }]">
              <a-input v-model:value="editableData[record.key].icName" size="small" style="margin: 0; width: 90%"> </a-input>
            </a-form-item>
            <a-input
              v-else-if="editableData[record.key]"
              v-model:value="editableData[record.key][column.dataIndex]"
              size="small"
              style="margin: 0; width: 70%"
              :disabled="'icDefault' == column.dataIndex && [3, 4].includes(record.icType)"
            />
            <template v-else>
              {{ text }}
            </template>
          </template>
          <!-- 多选框 -->
          <template v-if="['icPosition', 'icType', 'icFill'].includes(column.dataIndex)">
            <div>
              <a-select
                v-if="editableData[record.key]"
                v-model:value="editableData[record.key][column.dataIndex]"
                style="width: 100%"
                size="small"
                :disabled="'icFill' == column.dataIndex && [3, 4].includes(record.icType)"
              >
                <template v-if="whichOne == 0 && column.dataIndex == 'icPosition'">
                  <a-select-option v-for="(item1, index1) in ['query', 'header']" :key="index1" :value="item1">{{ item1 }} </a-select-option>
                </template>
                <template v-else-if="column.dataIndex == 'icType'">
                  <a-select-option v-for="(item2, index2) in typearr[whichOne]" :key="index2" :value="index2">{{ item2 }} </a-select-option>
                </template>
                <template v-else>
                  <a-select-option v-for="(item3, index3) in ['否', '是']" :key="index3" :value="index3"> {{ item3 }} </a-select-option>
                </template>
              </a-select>
              <template v-else>
                {{ column.dataIndex == 'icType' ? typearr[whichOne][text] : column.dataIndex == 'icFill' ? ['否', '是'][text] : text }}
              </template>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableData[record.key]">
                <a-typography-link :disabled="!verificationPassed.has(record.key.toString())" @click="save(record.key)">保存</a-typography-link>
                <a-popconfirm title="确认取消吗?" @confirm="cancel(record.key)">
                  <a>取消</a>
                </a-popconfirm>
                <template v-if="[0, 1].includes(record.icType)">
                  <a-popover>
                    <template #content>
                      <a-space direction="vertical">
                        <a-button @click="codeValueSavedFun(record)">已保存码值(已引用码表)</a-button>
                        <a-button @click="codeValueNotSavedFun(record)"> 未保存码值(未引用码表)</a-button>
                      </a-space>
                    </template>
                    <a>码值定义</a>
                  </a-popover>
                </template>
                <a-typography-link v-if="[3, 4].includes(record.icType)" @click="addson(record.key)">添加下级 </a-typography-link>
              </span>
              <span v-else>
                <a @click="edit(record.key)">编辑</a>
                <a v-if="record.sId" @click="codedetails(record.sId)">码值详情</a>
                <a-popconfirm title="确认删除吗?" @confirm="deleidt(record.key)">
                  <a>删除</a>
                </a-popconfirm>
                <a-typography-link v-if="[3, 4].includes(record.icType)" @click="addson(record.key)">添加下级 </a-typography-link>
              </span>
            </div>
          </template>
        </template>
      </a-table>
    </a-form>
    <ImportJsonVue :jsontype="jsontype" :json-visible="jsonVisible" @jsondata="receive" @jsonvisible="close"> </ImportJsonVue>
    <!-- <CodeValueSaved :code-value-saved-visible="codeValueSavedVisible" :code-value="codeValue" @close-code="closeCode" @close-code-toclose-code-not="closeCodeTocloseCodeNot"></CodeValueSaved>
    <CodeValueNotSaved
      :code-value-not-saved-visible="codeValueNotSavedVisible"
      :code-value="codeValue"
      @close-code-not="closeCodeNot"
      @open-code-save="codeValueSavedFun"
      @close-code-not-toclose-code="closeCodeNotTocloseCode"
    ></CodeValueNotSaved> -->
    <CodeValueSaved :code-value-saved-visible="codeValueSavedVisible" :code-value="codeValue" @close-code="closeCode"></CodeValueSaved>
    <CodeValueNotSaved :code-value-not-saved-visible="codeValueNotSavedVisible" :code-value="codeValue" @close-code-not="closeCodeNot"></CodeValueNotSaved>
  </div>
</template>
<script lang="ts" setup>
  import { getdetails } from '@/api/aq/index';
  import ImportJsonVue from './ImportJson.vue';
  import CodeValueSaved from '../../m_modal/CodeValueSaved.vue';
  import CodeValueNotSaved from '../../m_modal/CodeValueNotSaved.vue';
  import { DataItem } from '@/api/aq/model';
  import { cloneDeep } from 'lodash-es';
  import { confuguration } from '@/store/data_source_management/configuration';
  import { message, Modal } from 'ant-design-vue';
  import { useMainStore } from '@/store/useInterfaceStore';
  const _dataStandarStore = useMainStore();
  // console.log('是响应式对象吗', _dataStandarStore.sidCodeValue);
  const sIdMap = new Map();
  _dataStandarStore.$subscribe((mutation, state) => {
    sIdMap.set(state.sidCodeValue.key, state.sidCodeValue.sId);
  });

  const _confuguration = confuguration();
  const props = defineProps({
    whichOne: {
      type: Number,
      required: true,
    },
  });
  const typearr = [
    ['String', 'Int', 'Float'],
    ['String', 'Int', 'Float', 'Array', 'Object'],
    ['String', 'Int', 'Float', 'Array', 'Object'],
  ];
  const dataSource = ref<DataItem[]>([]);
  const editableData = reactive<any>({});
  const verificationPassed = ref(new Set());
  const formtable = ref();
  //表格参数名称校验规则

  const validatorName = (rule: any, value: string) => {
    let _relus = /^[a-zA-Z][a-zA-Z0-9_]{0,15}$/;
    if (_relus.test(value)) {
      verificationPassed.value.add(rule.field.replace('.icName', ''));
      // console.log('我的可以成功', rule.field.replace('.icName', ''));
      return Promise.resolve();
    } else {
      verificationPassed.value.delete(rule.field.replace('.icName', ''));
      return Promise.reject();
    }
  };
  //编辑将所要编辑的对象添加入编辑对象
  const edit = (key: string) => {
    findforkeyeidt(key, dataSource.value);
  };
  function findforkeyeidt(key: string, arr: DataItem[]) {
    //递归寻找需要更改的对象
    arr.forEach((item: DataItem) => {
      if (item.key == key) editableData[key] = cloneDeep(item);
      else if (item.children && item.children.length > 0) findforkeyeidt(key, item.children);
    });
  }
  //保存
  const save = async (key: string) => {
    verificationPassed.value.add(key);
    let status = false; //定义一个状态表示保存是否成功
    //替换需要保存的对象
    let stack: DataItem[] = [];
    dataSource.value.forEach((item: DataItem) => {
      if (item.key == key) {
        if (props.whichOne == 1 && [3, 4].includes(item.icType) && (!item.children || item.children.length == 0)) {
          message.error('请先添加下级');
        } else {
          Object.assign(item, editableData[key]);
          item.isSave = 1; // 添加一个标识表示它保存过
          item.sId = sIdMap.get(key);
          status = true; //保存成功
          if ([3, 4].includes(item.icType)) item.isNull = '';
        }
      } else if (item.children && item.children.length > 0) {
        stack.push(...item.children);
      }
    });
    let stackitem: DataItem | undefined;
    while (stack.length) {
      stackitem = (stack as DataItem[]).shift();
      if (stackitem?.key == key) {
        if ([3, 4].includes(stackitem.icType) && (!stackitem.children || stackitem.children.length == 0)) {
          message.error('请先添加下级');
        } else {
          Object.assign(stackitem, editableData[key]);
          stackitem.isSave = 1; // 添加一个标识表示它保存过
          stackitem.sId = sIdMap.get(key);
          status = true;
          if ([3, 4].includes(stackitem.icType)) stackitem.isNull = '';
        }
        break;
      } else if (stackitem?.children && stackitem.children.length > 0) stack.push(...stackitem.children);
    }
    if (status) delete editableData[key];
  };

  //根据key删除对应数据
  const deleidt = (key: string) => {
    delforkey(key, dataSource.value);
  };
  function delforkey(key: string, arr: DataItem[]) {
    try {
      arr.find((item: DataItem, index: number) => {
        if (item.key == key) arr.length > 1 || props.whichOne == 2 ? arr.splice(index, 1) : message.error('留一个喔！');
        else if (item.children && item.children.length > 0) delforkey(key, item.children);
      });
    } catch (error) {
      console.log(error);
    }
  }

  //取消
  const cancel = (key: string) => {
    try {
      cancelforkey(key, dataSource.value);
      delete editableData[key]; //删除数据
    } catch (error) {
      console.log(error);
    }
  };
  function cancelforkey(key: string, arr: DataItem[]) {
    arr.find((item: DataItem, index: number) => {
      if (!(item.isSave == 1) && item.key == key) {
        arr.splice(index, 1); //当未保存过时点区小姐就删除
      } else if (item.children && item.children.length > 0) cancelforkey(key, item.children);
    });
  }
  class aqtemplate {
    //添加数据模板
    public key: string;
    public icName = '';
    public icPosition = 'query';
    public icType = 0;
    public icFill = 0;
    public icDefault = '';
    public icComment = '';
    // public sId = null;
    constructor(key: string) {
      this.key = key;
    }
  }
  const addnew = () => {
    let _aqtemplate = new aqtemplate(new Date().getTime().toString());
    dataSource.value.push(_aqtemplate);
    //以键key值对的形式存储
    editableData[_aqtemplate.key] = _aqtemplate;
  };
  //添加下级
  const expandedRowKeys = ref<string[]>([]); //自定义展开目录
  const addson = (fatherkey: string) => {
    addsondeep(fatherkey, dataSource.value);
  };
  function addsondeep(fatherkey: string, arr: DataItem[]) {
    try {
      arr.forEach((item: DataItem) => {
        if (item.key == fatherkey) {
          let _aqtemplate = new aqtemplate(new Date().getTime().toString());
          expandedRowKeys.value.push(fatherkey);
          editableData[_aqtemplate.key] = _aqtemplate;
          // 当还没有children时候创建一个数组对象并添加
          if (!item.children) item.children = new Array(_aqtemplate);
          // 否则直接push
          else (item.children as DataItem[]).push(_aqtemplate);
        } else if (item.children && item.children.length > 0) addsondeep(fatherkey, item.children);
      });
    } catch (error) {
      console.log(error);
    }
  }
  //点击导入JSON
  const jsontype = ref<number>();
  const importjson = (who: number) => {
    console.log('嘿嘿');
    jsonVisible.value = true;
    jsontype.value = who;
  };
  //关闭
  const close = () => {
    jsonVisible.value = false;
  };
  const jsonVisible = ref<boolean>(false);
  // 接受json数据
  const receive = (res: any) => {
    dataSource.value.push(...res.data);
    close();
  };
  const codedetails = (sId: number) => {
    getdetails(sId).then((res: any) => {
      console.log('码值详情', res);
      const harr = [h('tr', { style: { textAlign: 'center' } }, [h('td', '码值取值'), h('td', '码值名称'), h('td', '编码含义')])];
      res.data.stopWatchValueList.forEach((item: any) => {
        harr.push(h('tr', { style: { textAlign: 'center' } }, [h('td', item.cValue), h('td', item.cName), h('td', item.cComment)]));
      });
      if (res.data.stopWatchValueList.length == 0) harr.push(h('tr', { style: { textAlign: 'center' } }, [h('td', '无数据'), h('td', '无数据'), h('td', '无数据')]));
      Modal.success({
        icon: '',
        mask: false,
        centered: true,
        title: `码值详情`,
        content: h('table', { border: '1px solid black', width: '100%', textAlign: 'center' }, harr),
      });
    });
  };
  defineExpose({
    dataSource,
  });
  const codeValueSavedVisible = ref<boolean>(false);
  const codeValueNotSavedVisible = ref<boolean>(false);
  //传给子的值
  const codeValue = ref({
    sId: 0,
    key: '',
  });
  const codeValueSavedFun = (item: any) => {
    codeValue.value = item;
    codeValueSavedVisible.value = true;
  };
  const codeValueNotSavedFun = (item: any) => {
    codeValue.value = item;
    codeValueNotSavedVisible.value = true;
  };
  const closeCode = () => {
    codeValueSavedVisible.value = false;
  };
  const closeCodeNot = () => {
    codeValueNotSavedVisible.value = false;
  };
  //方法已保存变未保存
  // const closeCodeTocloseCodeNot = () => {
  //   codeValueNotSavedVisible.value = true;
  //   codeValueSavedVisible.value = false;
  // };
  // //方法未保存变已保存
  // const closeCodeNotTocloseCode = () => {
  //   codeValueNotSavedVisible.value = false;
  //   codeValueSavedVisible.value = true;
  // };
  //码值引用的时候打开已保存
  // const openCode = () => {
  //   codeValueSavedVisible.value = true;
  // };
</script>
<style scoped lang="less">
  .editable-row-operations a {
    margin-left: 5px;
  }

  .ant-form-item {
    margin: 0;
  }

  :deep(.ant-form-item-with-help .ant-form-item-explain) {
    display: none;
  }
</style>
