<template>
  <div class="intermgmt">
    <!-- <aside>
      <p
        >接口分类
        <span>
          <a-popover :title="'父级：' + fatherName" trigger="click" placement="right">
            <template #content>
              <a-input v-model:value="categoryName" size="small" placeholder="请输入目录名称" @press-enter="addClassification" />
            </template>
            <a><img src="@/assets/images/加.png" alt="" /></a>
          </a-popover>
        </span>
      </p>

      <a-directory-tree v-model:expandedKeys="expandedKeys" v-model:selectedKeys="selectedKeys" style="font-size: 12px; background-color: #f2f2f2" :tree-data="treeData">
        <template #icon>
          <span class="img">
            <img src="@/assets/images/file.png" alt="" />
          </span>
        </template>
      </a-directory-tree>
    </aside> -->

    <Interface :massge="resettingTree" @newkey="newkey"></Interface>

    <div class="intermgmt_left">
      <div class="btnpeop">
        <a-button size="small" type="primary" @click="topeople">人工注册</a-button>
      </div>
      <a-form layout="inline" :model="_input_conditions">
        <a-form-item label="接口来源" name="source">
          <a-select ref="select" v-model:value="dataimOrigin" size="small" style="width: 100px">
            <a-select-option v-for="(item, index) in ['数据服务', '指标管理', '决策引擎']" :key="index" :value="item">{{ item }} </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="API状态" name="status">
          <a-select ref="select" v-model:value="dataAPI" size="small" style="width: 100px">
            <a-select-option v-for="(item, index) in ['未发布', '已发布', '已停用', '草稿']" :key="index" :value="index">{{ item }} </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="接口名称" name="name">
          <a-input v-model:value="dataname" size="small" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button size="small" @click="gei(0)">重置</a-button>
            <a-button type="primary" size="small" @click="gei(1)">查询</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <br />
      <a-space>
        <a-button type="primary" style="font-size: 10px" size="small" :block="true" :disabled="disabled['disabled_release']" @click="batchrelease(0)">批量发布 </a-button>
        <a-button type="primary" style="font-size: 10px" size="small" :block="true" :disabled="disabled['disabled_deactivate']" @click="batchrelease(1)">批量停用 </a-button>
        <a-button type="primary" style="font-size: 10px" size="small" :block="true" :disabled="disabled['disabled_class']" @click="showDrawer()">批量分类 </a-button>
      </a-space>
      <a-table
        :columns="columns"
        :data-source="data"
        :scroll="{ y: scrollHeight / 2 }"
        :pagination="pagination"
        :custom-row="customRow"
        :row-selection="{ selectedRowKeys: state.selectedRowKeys[0], onChange: Change }"
        :row-key="(record:any)=> record.imId"
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
          <template v-if="column.dataIndex === 'imName'">
            <a @click="showModalDetails(record)">{{ record.imName }}</a>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <template v-if="record.imStatus == 0">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(0, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm>
                <a-button type="primary" size="small" @click="testfun(record.imId)">接口测试</a-button>
                <a-button type="primary" size="small" @click="router.push({ path: 'manualRegistration', query: { imId: record.imId, imStatus: record.imStatus } })">编辑</a-button>
                <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="del(record)"> <a-button type="primary" size="small">删除</a-button> </a-popconfirm>
              </a-space>
            </template>
            <template v-if="record.imStatus == 1">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认停用?" ok-text="确认" cancel-text="取消" @confirm="cs(1, record)"> <a-button type="primary" size="small">停用</a-button> </a-popconfirm>
                <a-button type="primary" size="small" @click="testfun(record.imId)">接口测试</a-button>
              </a-space>
            </template>
            <template v-if="record.imStatus == 2">
              <a-space style="display: flex; justify-content: flex-start">
                <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(0, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm>
                <a-button type="primary" size="small" @click="testfun(record.imId)">接口测试</a-button>
                <a-button type="primary" size="small" @click="router.push({ path: 'manualRegistration', query: { imId: record.imId, imStatus: record.imStatus } })">编辑</a-button>
              </a-space>
            </template>
          </template>
          <template v-if="column.dataIndex === 'imStatus'">
            <template v-if="record.imStatus == 0">{{ data_imStatus[0].imStatusText }}</template>
            <template v-if="record.imStatus == 1">{{ data_imStatus[1].imStatusText }}</template>
            <template v-if="record.imStatus == 2">{{ data_imStatus[2].imStatusText }}</template>
            <template v-if="record.imStatus == 3">{{ data_imStatus[3].imStatusText }}</template>
          </template>
        </template>
      </a-table>
    </div>
    <!-- <InterfaceTest :isshow="testBtn" :data="testobj" @isshowchange="testBtn = false" /> -->
    <InterfaceTest :data="alertdata" :isshow="alerttest" @isshowchange="alerttest = false" />
    <InterfaceDetails v-if="visibleDetails" :visible-details="visibleDetails" :record-data="recordData" @visible-details-flag="visibleDetailsFlag" />
    <InterfaceClassification v-model:visible="visible" :state="state.selectedRowKeys" @timevalue="timevalue" @datadel="datadel"></InterfaceClassification>
  </div>
</template>
<script lang="ts" setup>
  import InterfaceClassification from './InterfaceClassification.vue';
  import Interface from './Interface.vue';
  import InterfaceTest from './m_children/components/InterfaceTest.vue';
  import InterfaceDetails from './m_modal/InterfaceDetails.vue';
  import { TableProps, message, Modal } from 'ant-design-vue';
  import { interfaceMgmtStore } from '@/store/data_source_management/InterfaceMgmt';
  import { aqtitle, aqtreearr, addtitle } from '@/utils/op';
  import { useRouter } from 'vue-router';
  import { geiinterfaceinfolist, modifyinfolist, interfaceinfodelinfo, interfaceInfoGetAllcategory } from '@/api/aq/index';
  import { number } from 'vue-types';

  //弹窗方法
  const visibleDetails = ref<boolean>();
  const recordData = ref<number>();
  const showModalDetails = (record: any) => {
    visibleDetails.value = true;
    recordData.value = record;
  };
  const visibleDetailsFlag = (): void => {
    visibleDetails.value = false;
  };
  const router = useRouter();
  const interface_mgmt_store = interfaceMgmtStore();
  const { treeData }: any = storeToRefs(interface_mgmt_store);
  //添加分类
  // const expandedKeys = ref<string[]>(['-1']); //默认展开目录
  // const selectedKeys = ref<string[]>(['-1']); //选择的目录key
  // const categoryName = ref<string>('');

  // const fatherName = computed(() => aqtitle(interface_mgmt_store.treeData, selectedKeys.value[0]));

  // const addClassification = () => {
  //   if (categoryName.value == '') message.warning('请先输入');
  //   let _return = aqtreearr(interface_mgmt_store.treeData).indexOf(categoryName.value);
  //   if (_return >= 0) {
  //     message.warn('文件目录已存在');
  //     return;
  //   }
  //   treeData.value = addtitle(interface_mgmt_store.treeData, selectedKeys.value[0], categoryName.value);
  //   categoryName.value = '';
  // };

  // 输入条件
  const _input_conditions = reactive({
    source: '',
    status: '',
    name: '',
  });
  //
  const topeople = () => {
    router.push('manualRegistration');
  };
  //操作按钮部分
  //弹出测试接口
  const alerttest = ref<boolean>(false);
  const alertdata = ref<any>();
  const testfun = (imId: number) => {
    alertdata.value = { imId };
    alerttest.value = true;
  };
  const sortedInfo = ref({});
  const columns = computed(() => {
    const sorted = sortedInfo.value;
    return [
      { title: '接口名称', dataIndex: 'imName', width: 100, ellipsis: true },
      { title: '接口描述', dataIndex: 'imDescribe', width: 100, ellipsis: true },
      { title: '接口分类', dataIndex: 'imCategory', key: '1', ellipsis: true },
      { title: '接口来源', dataIndex: 'imOrigin', key: '2', ellipsis: true, width: 100, align: 'center' },
      { title: 'API状态', dataIndex: 'imStatus' },
      { title: '更新时间', dataIndex: 'updateTime', key: '3', ellipsis: true, sorter: true, sortOrder: sorted.field === 'updateTime' && sorted.order },
      { title: '操作', dataIndex: 'operation', key: '4', fixed: 'right', width: 300, ellipsis: true, align: 'center' },
    ];
  });

  const data = ref(); //数据
  const datalength = ref(); //数据长度
  const data_imStatus = [
    { imStatus: 0, imStatusText: '未发布' },
    {
      imStatus: 1,
      imStatusText: '发布',
    },
    {
      imStatus: 2,
      imStatusText: '停用',
    },
    {
      imStatus: 3,
      imStatusText: '草稿',
    },
  ];
  //公共查询数据
  const Common_parameters = reactive({
    imOrigin: '',
    imStatus: '',
    imName: '',
    page: 1,
    num: 20,
    sortStatus: 0,
    iId: '',
  });
  //公共查询方法
  const pu_geiinterfaceinfolist = async (pu: {}) => {
    const res = await geiinterfaceinfolist(pu);
    data.value = res.data.records;
    data.value.forEach((element: any) => {
      let updateTime = new Date(element.updateTime).toLocaleString();
      element.updateTime = updateTime;
    });
    datalength.value = res.data.total;
    if (data.value == '' && Common_parameters.page > 1) {
      Common_parameters.page = Common_parameters.page - 1;
      pu_geiinterfaceinfolist(Common_parameters);
    }
  };
  onBeforeMount(() => {
    pu_geiinterfaceinfolist(Common_parameters);
  });
  //表单自带分页
  const pagination = computed(() => ({
    current: Common_parameters.page,
    pageSize: Common_parameters.num,
    total: datalength.value,
    'show-quick-jumper': true,
    'show-size-changer': true,
    'show-total': (datalength: any) => `总共有 ${datalength} 条数据`,
    'page-size-options': ['10', '20', '30', '40', '50'],
  }));
  //表单回调，分页，勾选
  const onChange = (pagination: any, filters: any, sorter: any) => {
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
    pu_geiinterfaceinfolist(Common_parameters);
  };
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
        console.log(state.selectedRowKeys);
      },
    };
  };
  //状态修改 0发布 1停用
  //确保操作后内容从选择的数组中消失
  const maintain = (record: any) => {
    const selectedRowKeys1 = [...state.selectedRowKeys[0]];
    const selectedRowKeys2 = [...state.selectedRowKeys[1]];
    if (selectedRowKeys1.indexOf(record.imId) >= 0) {
      selectedRowKeys1.splice(selectedRowKeys1.indexOf(record.imId), 1);
      selectedRowKeys2.splice(selectedRowKeys2.indexOf(record), 1);
    }
    state.selectedRowKeys[0] = selectedRowKeys1;
    state.selectedRowKeys[1] = selectedRowKeys2;
  };
  //公共修改方法
  const pu_modifyinfolist = async (pu: any) => {
    await modifyinfolist(pu);
    modifyin.imIdList.length = 0;
  };
  //公共修改参数
  const modifyin = reactive({
    imIdList: [],
    flagStatus: 0,
  });
  //操作
  const cs = async (x: number, record: any) => {
    modifyin.imIdList = [record.imId];
    modifyin.flagStatus = x;
    await pu_modifyinfolist(modifyin);
    maintain(record);
    pu_geiinterfaceinfolist(Common_parameters);
  };
  //计算属性监听批量按钮
  const disabled = computed(() => {
    //true表禁用，false表启用
    let disabled = { disabled_release: true, disabled_deactivate: true, disabled_class: true };
    if (state.selectedRowKeys[0].length != 0) {
      disabled['disabled_release'] = false;
      disabled['disabled_deactivate'] = false;
      disabled['disabled_class'] = false;
      state.selectedRowKeys[1].forEach(element => {
        if (element.imStatus == 1) {
          disabled['disabled_release'] = true;
        }
      });
      state.selectedRowKeys[1].forEach(element => {
        if (element.imStatus == 0 || element.imStatus == 2) {
          disabled['disabled_deactivate'] = true;
        }
      });
    }
    return disabled;
  });

  //删除
  const del = async (record: any) => {
    await interfaceinfodelinfo(record.imId);
    maintain(record);
    pu_geiinterfaceinfolist(Common_parameters);
  };
  //查询,重置
  const dataname = ref<string>('');
  const dataimOrigin = ref<string>('');
  const dataAPI = ref<string>('');

  const resettingTree = ref(0);

  const gei = (x: any) => {
    if (x === 1) {
      //查询
      Common_parameters.imName = dataname.value;
      Common_parameters.page = 1;
      Common_parameters.imOrigin = dataimOrigin.value;
      Common_parameters.imStatus = dataAPI.value;
      state.selectedRowKeys = [[], []];
      modifyin.imIdList = [];
      Common_parameters.sortStatus = 0;
      sortedInfo.value = {};
      pu_geiinterfaceinfolist(Common_parameters);
    }
    if (x === 0) {
      //重置
      let uniquetime = new Date().getTime(); //唯一时间
      resettingTree.value = uniquetime;
      state.selectedRowKeys = [[], []];
      modifyin.imIdList = [];
      Common_parameters.imName = '';
      dataname.value = '';
      dataimOrigin.value = '';
      dataAPI.value = '';
      Common_parameters.page = 1;
      Common_parameters.imOrigin = '';
      Common_parameters.sortStatus = 0;
      Common_parameters.imStatus = '';
      sortedInfo.value = {};
      pu_geiinterfaceinfolist(Common_parameters);
    }
  };
  const newkey = (value: any) => {
    console.log('接收', value);
    Common_parameters.iId = value;
    pu_geiinterfaceinfolist(Common_parameters);
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

  //批量分类
  const visible = ref<boolean>(false);
  const showDrawer = () => {
    visible.value = true;
  };
  //关闭抽屉
  const timevalue = (value: any) => {
    // console.log(value)
    visible.value = false;
  };
  const datadel = (value: any) => {
    for (let i in value) {
      console.log(value[i]);
      maintain(value[i]);
      pu_geiinterfaceinfolist(Common_parameters);
    }
  };
  //批量修改
  // const generous = async (x: any) => {
  //   modifyin.imIdList = state.selectedRowKeys[0];
  //   modifyin.flagStatus = x;
  //   await pu_modifyinfolist(modifyin);
  //   message.success('操作成功', 1);
  //   state.selectedRowKeys = [[], []];
  //   pu_geiinterfaceinfolist(Common_parameters);
  // };
  const batchrelease = (x: any) => {
    if (x == 0) {
      Modal.info({
        okText: '确定',
        closable: true,
        title: '确认发布已选择的码表吗！',
        async onOk() {
          try {
            modifyin.imIdList = state.selectedRowKeys[0];
            modifyin.flagStatus = x;
            await pu_modifyinfolist(modifyin);
            message.success('批量发布成功', 1);
          } catch (error) {
            message.error('批量发布失败', 1);
          } finally {
            state.selectedRowKeys = [[], []];
            pu_geiinterfaceinfolist(Common_parameters);
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
            modifyin.imIdList = state.selectedRowKeys[0];
            modifyin.flagStatus = x;
            await pu_modifyinfolist(modifyin);
            message.success('批量停用成功', 1);
          } catch (error) {
            message.error('批量停用失败', 1);
          } finally {
            state.selectedRowKeys = [[], []];
            pu_geiinterfaceinfolist(Common_parameters);
          }
        },
      });
    }
  };
</script>
<style lang="less" scoped>
  @width: 6px;

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

  .sortlcolor {
    color: rgb(26, 114, 246);
  }

  .intermgmt {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .img {
    display: inline-block;
    width: @width*3;
    height: @width*3;

    img {
      margin-top: -5px;
      width: 100%;
      height: 100%;
    }
  }

  aside {
    padding: 0 0.5rem;
    min-width: 280px;
    height: 100%;
    font-size: @width*2;
    background-color: #f2f2f2;

    & > p {
      padding: 1rem 0;
      font-weight: bolder;
      text-align: center;

      span {
        display: inline-block;
        width: @width*2;
        height: @width*2;

        img {
          margin-top: -2px;
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .intermgmt_left {
    width: 100%;
    height: 100%;
  }

  .btnpeop {
    position: fixed;
    top: 70px;
    right: 25px;
  }
</style>
