<template>
  <div class="main">
    <div class="side">
      <AssetManagementSide :massge="resettingTree" @newkey="emitid"></AssetManagementSide>
    </div>
    <div class="content">
      <a-form layout="inline" class="flexce">
        <a-select ref="select" v-model:value="Common_parameters.aStatus" style="width: 120px">
          <a-select-option v-for="item in dataclasssels" :key="item.classvalue">{{ item.classname }}</a-select-option> </a-select
        >　
        <a-form-item label="中文名称">
          <a-input v-model:value="datanameCN" placeholder="中文名称"> </a-input>
        </a-form-item>
        <a-form-item label="英文名称">
          <a-input v-model:value="datanameEN" placeholder="英文名称"> </a-input>
        </a-form-item>
        <a-space>
          <a-button type="primary" size="small" @click="inquiry">查询</a-button>
          <a-button size="small" type="primary" ghost @click="resetting">重置</a-button>
        </a-space>
      </a-form>

      <div style="float: left" class="nav2">
        <a-space>
          <a-button type="primary" size="small" :disabled="disabled['disabled_release']" @click="batchrelease(0)">批量发布</a-button>
          <a-button size="small" type="primary" :disabled="disabled['disabled_deactivate']" @click="batchrelease(1)">批量停用</a-button>
        </a-space>
        <div style="float: right">
          <a-button type="primary" size="small">
            <router-link to="/three/AssetManagementInput">新增资产表</router-link>
          </a-button>
        </div>
      </div>
      <!-- :row-selection="rowSelection" -->
      <a-table
        class="table_info"
        :columns="columns"
        :data-source="data"
        :scroll="{ y: scrollHeight / 1.8 }"
        style="width: 100%"
        :pagination="pagination"
        :custom-row="customRow"
        :row-selection="{ selectedRowKeys: state.selectedRowKeys[0], onChange: Change }"
        :row-key="(record:any) => record.aId"
        @change="onChange"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'updateTime'">
            <div class="icon">
              <p>更新时间</p>
            </div>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == '4'">
            <template v-if="record.aStatus == 0">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(0, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm>
                <a-button type="primary" size="small"> <router-link :to="{ path: '/three/AssetManagementInput', query: { aId: record.aId } }" class="text-dark">编辑</router-link> </a-button>
                <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="cs(2, record)"> <a-button type="primary" size="small">删除</a-button> </a-popconfirm>
              </a-space>
            </template>
            <template v-if="record.aStatus == 2">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(0, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm>
                <a-button type="primary" size="small"> <router-link :to="{ path: '/three/AssetManagementInput', query: { aId: record.aId } }" class="text-dark">编辑</router-link> </a-button>
              </a-space>
            </template>
            <template v-if="record.aStatus == 1">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认停用?" ok-text="确认" cancel-text="取消" @confirm="cs(1, record)"> <a-button type="primary" size="small">停用</a-button> </a-popconfirm>
              </a-space>
            </template>
          </template>
          <template v-if="column.key === '2'">
            <template v-if="record.aStatus == 0">
              <span>{{ data_aStatus[0].aStatusText }}</span>
            </template>
            <template v-if="record.aStatus == 1">
              <span>{{ data_aStatus[1].aStatusText }}</span>
            </template>
            <template v-if="record.aStatus == 2">
              <span>{{ data_aStatus[2].aStatusText }}</span>
            </template>
          </template>
          <template v-if="column.dataIndex === 'aCname'">
            <a @click.stop="showModal(record)">
              {{ record.aCname }}
            </a>
          </template>
          <template v-if="column.dataIndex === 'aEname'">
            <a @click.stop="showModal(record)">
              {{ record.aEname }}
            </a>
          </template>
        </template>
      </a-table>
      <AssetManagementLog :visible="visible" :record-a-id="recordAId" @visibleFlag="visibleFlag" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import AssetManagementLog from './AssetManagementLog.vue';
  import AssetManagementSide from '@/pages/assetmanagement/AssetManagementSide.vue';
  import { getassetstable, dataassetsdelete, dataassetsupdatastatus } from '@/api/aq/index';
  import { message, Modal } from 'ant-design-vue';
  import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue';
  import { any } from 'vue-types';
  //弹窗方法
  const visible = ref<boolean>();
  const recordAId = ref<number>();
  const showModal = (record: any) => {
    visible.value = true;
    //id
    recordAId.value = record.aId;
  };
  const visibleFlag = () => {
    visible.value = false;
    recordAId.value = undefined;
  };
  const data = ref(); //数据
  const datalength = ref(); //数据长度
  const dataclass = ref(''); //数据状态
  const dataclasssels = [
    //数据分类
    {
      classvalue: '',
      classname: '全部',
    },
    {
      classvalue: 0,
      classname: '未发布',
    },
    {
      classvalue: 1,
      classname: '发布',
    },
    {
      classvalue: 2,
      classname: '停用',
    },
  ];
  const data_aStatus = [
    { aStatus: 0, aStatusText: '未发布' },
    {
      aStatus: 1,
      aStatusText: '发布',
    },
    {
      aStatus: 2,
      aStatusText: '停用',
    },
  ];
  const datanameCN = ref(''); //查询数据名称
  const datanameEN = ref(''); //查询数据名称
  const sortedInfo = ref({});
  const columns = computed(() => {
    const sorted = sortedInfo.value;
    return [
      { title: '数据资产表中文名称', width: 200, dataIndex: 'aCname', ellipsis: true },
      { title: '数据资产表英文名称', width: 200, dataIndex: 'aEname', ellipsis: true },
      { title: '数据资产描述', dataIndex: 'aDescribe', key: '1', ellipsis: true },
      { title: '发布状态', dataIndex: 'aStatus', key: '2', ellipsis: true, width: 100, align: 'center' },
      { title: '更新时间', dataIndex: 'updateTime', key: '3', ellipsis: true, sorter: true, sortOrder: sorted.field === 'updateTime' && sorted.order },
      { title: '操作', dataIndex: 'aStatus', key: '4', fixed: 'right', width: 200, ellipsis: true, align: 'center' },
    ];
  });
  //公共查询参数
  let Common_parameters = reactive({
    page: 1,
    num: 20,
    aCname: '',
    aEname: '',
    aStatus: '',
    sortStatus: 0,
    adId: 0,
    // aId:'',
  });
  //分页参数，方法---利用表单自带分页
  const pagination = computed(() => ({
    current: Common_parameters.page,
    pageSize: Common_parameters.num,
    total: datalength.value,
    'show-quick-jumper': true,
    'show-size-changer': true,
    'show-total': (datalength: any) => `总共有 ${datalength} 条数据`,
    'page-size-options': ['2', '10', '20', '30', '40', '50'],
  }));
  //公共查询实际参数
  interface LooseObject {
    [key: string]: any;
  }
  let Common_parameters_true: LooseObject = {};
  //公共状态改变参数
  let updatastatus = {
    aIds: [],
    flagStatus: 0,
  };
  //公共查询方法
  const get_assets_table = async (rr: any) => {
    const res: any = await getassetstable(rr);
    data.value = res.data.list;
    data.value.forEach((element: any) => {
      let updateTime = new Date(element.updateTime).toLocaleString();
      element.updateTime = updateTime;
    });
    datalength.value = res.data.total;
    if (datalength.value == 0 && Common_parameters.page != 1) {
      Common_parameters.page = Common_parameters.page - 1;
      get_assets_table(Common_parameters);
    }
  };
  //公共状态改变方法
  const data_assets_updatastatus = async (jj: any) => {
    try {
      await dataassetsupdatastatus(jj);
      Common_parameters_true_fun();
      console.log(Common_parameters_true);
      await get_assets_table(Common_parameters_true);
    } catch {
      (err: any) => {
        message.error('操作失败', 1);
      };
    }
  };
  //公共查询实际参数改变方法
  const Common_parameters_true_fun = () => {
    Common_parameters_true = {};
    if (Common_parameters.aCname != '') {
      Common_parameters_true.aCname = Common_parameters.aCname;
    }
    if (Common_parameters.aEname != '') {
      Common_parameters_true.aEname = Common_parameters.aEname;
    }
    if (Common_parameters.aStatus !== '') {
      Common_parameters_true.aStatus = Common_parameters.aStatus;
    }
    if (Common_parameters.adId != 0) {
      Common_parameters_true.adId = Common_parameters.adId;
    }
    Common_parameters_true.page = Common_parameters.page;
    Common_parameters_true.num = Common_parameters.num;
    Common_parameters_true.sortStatus = Common_parameters.sortStatus;
  };
  //确保操作后内容从选择的数组中消失
  const maintain = (record: any) => {
    const selectedRowKeys1 = [...state.selectedRowKeys[0]];
    const selectedRowKeys2 = [...state.selectedRowKeys[1]];
    if (selectedRowKeys1.indexOf(record.aId) >= 0) {
      selectedRowKeys1.splice(selectedRowKeys1.indexOf(record.aId), 1);
      selectedRowKeys2.splice(selectedRowKeys2.indexOf(record), 1);
    }
    state.selectedRowKeys[0] = selectedRowKeys1;
    state.selectedRowKeys[1] = selectedRowKeys2;
  };

  //发布，编辑，删除的操作
  //0为发布，1为停用，2为删除, 4编辑
  const cs = (x: any, record: any) => {
    //获取事件
    let event = window.event;
    //阻止事件冒泡，防止点击发布停用等功能使得当前数据被选中
    event.stopPropagation();
    if (x == 0 || x == 1) {
      updatastatus.aIds.length = 0;
      updatastatus.flagStatus = x;
      updatastatus.aIds = [record.aId];
      data_assets_updatastatus(updatastatus);
    } else if (x == 2) {
      (async () => {
        try {
          await dataassetsdelete(record.aId);
          message.success('删除成功', 1);
          maintain(record);
          Common_parameters_true_fun();
          get_assets_table(Common_parameters_true);
        } catch {
          () => {
            message.error('删除失败', 1);
          };
        }
      })();
    }
  };
  //表单选择
  const state = reactive({
    selectedRowKeys: [[], []],
  });
  let Change = (selectedRowKeys1: any, selectedRowKeys2: any) => {
    state.selectedRowKeys[0] = selectedRowKeys1;
    state.selectedRowKeys[1] = selectedRowKeys2;
  };
  //表单点击时对每一行进行点击时触发
  const customRow = (record: any) => {
    return {
      onClick: () => {
        // console.log('-----', state.selectedRowKeys);
        // selectRow(record);
      },
    };
  };
  //批量
  // const generous = (x: any) => {
  //   //0发布，1停用
  //   updatastatus.flagStatus = x;
  //   updatastatus.aIds = state.selectedRowKeys[0];
  //   (async () => {
  //     await data_assets_updatastatus(updatastatus);
  //     state.selectedRowKeys = [[], []];
  //   })();
  // };
  //计算属性监听批量按钮
  const disabled = computed(() => {
    //true表禁用，false表启用
    let disabled = { disabled_release: true, disabled_deactivate: true };
    if (state.selectedRowKeys[0].length != 0) {
      disabled['disabled_release'] = false;
      disabled['disabled_deactivate'] = false;
      state.selectedRowKeys[1].forEach(element => {
        if (element.aStatus == 1) {
          disabled['disabled_release'] = true;
        }
      });
      state.selectedRowKeys[1].forEach(element => {
        if (element.aStatus == 0 || element.aStatus == 2) {
          disabled['disabled_deactivate'] = true;
        }
      });
    }
    return disabled;
  });
  //查询
  const inquiry = () => {
    if (datanameCN.value != '') {
      Common_parameters.aCname = datanameCN.value;
    }
    if (datanameEN.value != '') {
      Common_parameters.aEname = datanameEN.value;
    }
    Common_parameters.page = 1;
    state.selectedRowKeys = [[], []];
    Common_parameters.sortStatus = 0;
    Common_parameters_true_fun();
    sortedInfo.value = {};
    get_assets_table(Common_parameters_true);
  };
  //重置
  const resettingTree = ref(0);
  const resetting = () => {
    let uniquetime = new Date().getTime(); //唯一时间
    resettingTree.value = uniquetime;
    Common_parameters.aCname = '';
    datanameCN.value = '';
    Common_parameters.aEname = '';
    datanameEN.value = '';
    Common_parameters.page = 1;
    Common_parameters.num = 20;
    Common_parameters.aStatus = '';
    Common_parameters.adId = 0;
    dataclass.value = '';
    Common_parameters.sortStatus = 0;
    state.selectedRowKeys = [[], []];
    Common_parameters_true_fun();
    sortedInfo.value = {};
    get_assets_table(Common_parameters_true);
  };

  //排序
  const onChange = (pagination: number, filters: any, sorter: any) => {
    if (sorter.order == undefined) {
      console.log('初始状态');
      Common_parameters.sortStatus = 0;
    } else if (sorter.order == 'ascend') {
      console.log('向上排序');
      Common_parameters.sortStatus = 1;
    } else if (sorter.order == 'descend') {
      console.log('向下排序');
      Common_parameters.sortStatus = 2;
    }
    sortedInfo.value = sorter;
    Common_parameters.page = pagination.current;
    Common_parameters.num = pagination.pageSize;
    Common_parameters_true_fun();
    get_assets_table(Common_parameters_true);
  };

  const emitid = (value: any) => {
    //子组件默认传0，作为初始请求参数
    Common_parameters.page = 1;
    Common_parameters.adId = Number(value);
    Common_parameters_true_fun();
    get_assets_table(Common_parameters_true);
  };
  // 动态改变滚动区域场赌博
  const scrollHeight = ref<number>(document.body.clientHeight);
  function a() {
    let lastTime = 0;
    return () => {
      let nowTime = new Date().getTime();
      let remainderTime = nowTime - lastTime;
      if (remainderTime - 100 > 0) {
        scrollHeight.value = document.body.clientHeight;
        lastTime = nowTime;
      }
    };
  }
  window.onresize = a();
  //批量
  const batchrelease = (x: any) => {
    if (x == 0) {
      Modal.info({
        okText: '确定',
        closable: true,
        title: '确认发布已选择的码表吗！',
        async onOk() {
          try {
            updatastatus.flagStatus = x;
            updatastatus.aIds = state.selectedRowKeys[0];
            await data_assets_updatastatus(updatastatus);
            message.success('批量发布成功', 1);
          } catch (error) {
            message.error('批量发布失败', 1);
          } finally {
            state.selectedRowKeys = [[], []];
          }
        },
      });
    } else if (x == 1) {
      Modal.info({
        okText: '确定',
        closable: true,
        title: '确认停用已选择的码表吗！',
        async onOk() {
          try {
            updatastatus.flagStatus = x;
            updatastatus.aIds = state.selectedRowKeys[0];
            await data_assets_updatastatus(updatastatus);
            message.success('批量停用成功', 1);
          } catch (error) {
            message.error('批量停用失败', 1);
          } finally {
            state.selectedRowKeys = [[], []];
          }
        },
      });
    }
  };
</script>

<style lang="less" scoped>
  .flexce {
    display: flex;
    justify-content: center;
  }

  .sortlcolor {
    color: rgb(26, 114, 246);
  }

  .icon {
    display: flex;
    align-items: center;

    p {
      display: flex;
      align-items: center;
      margin: 0;
      height: 100% !important;
    }

    span {
      display: flex;
      margin: 0;
      flex-direction: column;
    }
  }

  .main {
    display: flex;
    height: 100%;
    background-color: rgb(255, 255, 255);
  }

  .side {
    overflow: auto;
    padding: 5px;
    // width: 15%;
    width: 245px;
    background-color: rgb(242, 242, 242);
  }

  .content {
    padding: 24px;
    width: 90%;
  }

  .nav1 {
    margin: 0 auto;
    width: 900px;
  }

  .span {
    margin-right: 40px;
    border: 1px solid #000;
    height: 1.5rem;
  }

  .input {
    margin-right: 40px;
    border: 1px solid #000;
    height: 1.5rem;
  }

  .nav2 {
    width: 100%;
    height: 2rem;
  }

  .table_info {
    &:deep(.ant-table-tbody > tr > td) {
      padding: 5px !important;
    }
  }

  // 表格
  table {
    /* 取消th td 之间的间隔 */
    border-collapse: collapse;
    border-spacing: 0;
    color: #000000;
  }

  /* table 头部的样式 */
  thead {
    border: 1px solid #000000;
    border-bottom: none;
    color: #000000;
    background-color: rgba(255, 255, 255, 1);
  }

  thead tr {
    height: 42px;
    text-align: center;
  }

  /* tbody 主体的样式 */
  tbody tr {
    border: 1px solid #000000;
    border-bottom: none;
    height: 35px;
    text-align: center;
  }

  tbody tr:last-child {
    border-bottom: 1px solid #000000;
  }

  /* thead和tbody的单元格 border-right的设置 */
  thead tr th,
  tbody tr td {
    border-right: 1px solid rgba(0, 0, 0, 0.7);
    border-left: 1px solid #000000;
  }
</style>
