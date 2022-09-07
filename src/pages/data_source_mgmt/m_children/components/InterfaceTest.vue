<template>
  <a-modal :visible="isshow" width="1000px" :mask="false" :footer="null" @cancel="changestatus">
    <template #title>
      <p style="text-align: center">接口测试</p>
    </template>
    <a-row>
      <a-col :span="14" style="overflow: scroll; max-height: 500px">
        <span>接口名称：</span>
        <a-table
          :show-header="false"
          :columns="[{ dataIndex: 'name', width: 150 }, { dataIndex: 'value' }]"
          :data-source="[
            { name: 'Request URl', value: name.url },
            { name: '请求方式', value: name.way },
          ]"
          :pagination="false"
          bordered
          style="width: 100%"
        >
        </a-table>
        <br />
        <span>输入参数</span>
        <a-table :columns="columns1" :data-source="inputdata" :pagination="false" bordered style="width: 100%">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex == 'icType'">
              <a-select v-model:value="record.icType" style="width: 100%" :disabled="true">
                <a-select-option v-for="(item, index) in ['String', 'Int', 'Float', 'Array', 'Object']" :key="index">{{ item }}</a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex == 'icFill'">
              <a-select v-model:value="record.icType" style="width: 100%" :disabled="true">
                <a-select-option v-for="(item, index) in ['否', '是']" :key="index">{{ item }}</a-select-option>
              </a-select>
            </template>
            <div v-if="column.dataIndex == 'optinos'">
              <a-input v-model:value="record.testval" placeholder="请输入测试值" />
            </div>
          </template>
        </a-table>
        <br />
        <span>请求Body</span>
        <a-table :columns="columns2" :data-source="body" :pagination="false" bordered style="width: 100%">
          <template #bodyCell="{ column, record }">
            <div v-if="column.dataIndex == 'optinos' && !['Object', 'Array'].includes(record.type)">
              <a-input v-model:value="record.testval" placeholder="请输入测试值" />
            </div>
          </template>
        </a-table>
        <br />
        <a-row>
          <a-button style="color: white; background-color: #32cd32" @click="testRuslt">测试</a-button>
        </a-row>
      </a-col>
      <a-col :span="10">
        <div class="backJson">
          <div>
            <p>返回结果(JSON)</p>
            <!-- 结果展示 -->
            <div v-text="testResults"></div>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-modal>
</template>
<script lang="ts" setup>
  import axios from 'axios';
  import { DataItem } from '@/api/aq/model';
  import { getInfoListAll } from '@/api/aq/index';
  import { cloneDeep } from 'lodash-es';
  const columns1 = [
    { title: '参数名称', dataIndex: 'icName', align: 'center' },
    { title: '数据类型', dataIndex: 'icType', align: 'center' },
    { title: '参数位置', dataIndex: 'icPosition', align: 'center' },
    { title: '是否必填', dataIndex: 'icFill', align: 'center' },
    { title: '测试值', dataIndex: 'optinos', align: 'center' },
  ];
  const columns2 = [
    { title: '参数名称', dataIndex: 'icName' },
    { title: '数据类型', dataIndex: 'icType' },
    { title: '是否必填', dataIndex: 'icFill' },
    { title: '测试值', dataIndex: 'optinos' },
  ];
  const _props = defineProps({
    isshow: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  const emit = defineEmits(['isshowchange']);
  const name = ref({
    url: '',
    way: '',
  });
  const inputdata = ref<DataItem[]>([]);
  const body = ref<DataItem[]>([]);
  const resp = ref<DataItem[]>([]);
  watch(
    () => _props.data,
    async (nval: any) => {
      if (nval.imId) {
        //主页面直接测试http://localhost:3200/one/test1#/
        let _temporary = await getInfoListAll(nval.imId);
        _temporary = JSON.parse(JSON.stringify(_temporary.data).replace(/icId/g, 'key'));
        addtestval(_temporary.interfaceConfigList);
        name.value.url = `${_temporary.imAgreement}://${_temporary.imPort}/${_temporary.imPath}`;
        name.value.way = _temporary.imRequest;
        console.log('测试接口', _temporary);
        _temporary.interfaceConfigList.forEach((item: any) => {
          switch (item.icStatus) {
            case 0:
              inputdata.value?.push(cloneDeep(item));
              break;
            case 1:
              body.value?.push(cloneDeep(item));
              break;
            case 2:
              resp.value?.push(cloneDeep(item));
              break;
          }
        });
      } else {
        //新增的时候测试
        nval.input.forEach((item: DataItem) => {
          item.testval = '';
        });
        inputdata.value = nval.input;
        addtestval(nval.body);
        body.value = nval.body;
        name.value = nval.name;
        resp.value = nval.resp;
      }
    },
  );
  function addtestval(arr: DataItem[]) {
    arr.forEach((item: DataItem) => {
      item.testval = '';
      if (item.children && item.children.length > 0) addtestval(item.children);
    });
  }

  const changestatus = () => {
    emit('isshowchange'); //关闭后修改状态
  };
  // 点击展示测试结果
  const testResults = ref('');
  const testRuslt = () => {
    if (name.value.way == 'POST') {
      axios
        .post(name.value.url.toLowerCase())
        .then(data => {
          testResults.value = JSON.stringify(data);
          // console.log(data);
        })
        .catch(error => {
          testResults.value = JSON.stringify(error);
          // console.log(error);
        });
    } else {
      axios
        .get(name.value.url.toLowerCase())
        .then(data => {
          testResults.value = JSON.stringify(data);
          // console.log(data);
        })
        .catch(error => {
          testResults.value = JSON.stringify(error);
          // console.log(error);
        });
    }
    // fetch(name.value.url, {
    //   method: name.value.way,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body.value),
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     // console.log('Success:', data);
    //     testResults.value = JSON.stringify(data);
    //   })
    //   .catch(error => {
    //     // console.error('Error:', error);
    //     testResults.value = JSON.stringify(error);
    //   });
  };
</script>
<style scoped lang="less">
  .backJson {
    width: 100%;
    height: 500px;

    & > div {
      margin: 0 auto;
      border: 1px solid rgba(146, 144, 144, 0.5);
      width: 90%;
      height: 100%;

      p {
        padding: 10px;
        height: 5%;
        text-align: center;
      }

      div {
        overflow-y: scroll;
        padding: 10px;
        width: 100%;
        height: 95%;
        color: white;
        background-color: black;
      }
    }
  }
</style>
