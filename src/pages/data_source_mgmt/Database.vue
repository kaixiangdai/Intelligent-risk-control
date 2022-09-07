<template>
  <div class="">
    <div class="nav1">
      <a-form layout="inline" class="flexce">
        <a-form-item label="应用状态">
          <a-select ref="select" v-model:value="Common_parameters.dbStatus" style="width: 120px">
            <a-select-option v-for="item in dataclasssels" :key="item.classvalue">{{ item.classname }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="数据源名称">
          <a-input v-model:value="dataname" placeholder="数据源名称"> </a-input>
        </a-form-item>
        <a-button size="small" class="addsource" type="primary" @click="addSource"> 新增数据源</a-button>
        <span>
          <a-space>
            <a-button type="primary" size="small" ghost @click="selin">重置</a-button>
            <a-button size="small" type="primary" @click="sel">查询</a-button>
          </a-space>
        </span>
      </a-form>
    </div>

    <a-table :columns="columns" :data-source="data" :scroll="{ y: scrollHeight / 1.8 }" style="width: 100%" :pagination="pagination" @change="onChange">
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'updateTime'">
          <div class="icon">
            <p>更新时间</p>
          </div>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key == '5'">
          <template v-if="record.dbStatus == 0">
            <span>{{ data_dbStatus[0].dbStatusText }}</span>
          </template>
          <template v-if="record.dbStatus == 1">
            <span>{{ data_dbStatus[1].dbStatusText }}</span>
          </template>
          <template v-if="record.dbStatus == 2">
            <span>{{ data_dbStatus[2].dbStatusText }}</span>
          </template>
        </template>
        <template v-if="column.key == '4'">
          <template v-if="record.dbStatus == 0">
            <a-button type="primary" size="small" @click="cs(0, record)">连通测试</a-button><span>　</span>
            <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(1, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm><span>　</span>
            <a-button type="primary" size="small" @click="cs(4, record)">编辑</a-button><span>　</span>
            <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="cs(3, record)"> <a-button type="primary" size="small">删除</a-button> </a-popconfirm><span>　</span>
          </template>
          <template v-if="record.dbStatus == 2">
            <a-button type="primary" size="small" @click="cs(0, record)">连通测试</a-button>
            <span>　</span>
            <a-popconfirm title="确认发布?" ok-text="确认" cancel-text="取消" @confirm="cs(1, record)"> <a-button type="primary" size="small">发布</a-button> </a-popconfirm><span>　</span>
            <a-button type="primary" size="small" @click="cs(4, record)">编辑</a-button>
            <span>　</span>
          </template>
          <template v-if="record.dbStatus == 1">
            <a-button type="primary" size="small" @click="cs(0, record)">连通测试</a-button>
            <span>　</span>
            <a-popconfirm title="确认停用?" ok-text="确认" cancel-text="取消" @confirm="cs(2, record)"> <a-button type="primary" size="small">停用</a-button> </a-popconfirm><span>　</span>
          </template>
        </template>
      </template>
    </a-table>
    <div class="tips"></div>
    <DataSourceOperations v-if="isShow" :edit-show="editShow" :fa-data="faData" @cancel="cancel" @confirm="confirm"> </DataSourceOperations>
  </div>
</template>

<script setup lang="ts">
  import DataSourceOperations from '@/pages/data_source_mgmt/DataSourceOperations.vue';
  import { getdatabaselist, deldatabase, databasetext, updatadbstatus } from '@/api/aq/index';
  const faData = ref({
    dbId: undefined,
    dbType: '',
    dbName: '',
    dbDepict: '',
    jdbcUrl: '',
    driverClassname: '',
    username: '',
    password: '',
  });
  const isShow = ref<boolean>(false);
  //展示编辑或者新增
  const editShow = ref<boolean>(false);
  //editShow为false为编辑
  const addSource = () => {
    isShow.value = true;
    editShow.value = true;
  };
  const confirm = async () => {
    isShow.value = false;
    await get_database_list(Common_parameters);
  };
  const cancel = () => {
    isShow.value = false;
  };

  const dataclasssels = [
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
  const data_dbStatus = [
    { dbStatus: 0, dbStatusText: '未发布' },
    {
      dbStatus: 1,
      dbStatusText: '发布',
    },
    {
      dbStatus: 2,
      dbStatusText: '停用',
    },
  ];
  const dataname = ref('');
  //数据
  //数据长度
  const data = ref();
  const datalength = ref(0);
  const sortS = ref(0); //默认序列
  //公共数据
  const Common_parameters = reactive({
    dbStatus: '',
    dbName: '',
    sortStatus: 0,
    page: 1,
    num: 20,
  });
  //公共查询方法
  const get_database_list = async (Common_parameters: any) => {
    const res = await getdatabaselist(Common_parameters);
    data.value = res.data.records;
    console.log(data.value);
    data.value.forEach((element: any) => {
      let updateTime = new Date(element.updateTime).toLocaleString();
      element.updateTime = updateTime;
    });
    datalength.value = res.data.total;
    if (data.value == '' && Common_parameters.page > 1) {
      Common_parameters.page = Common_parameters.page - 1;
      get_database_list(Common_parameters);
    }
  };
  onBeforeMount(() => {
    get_database_list(Common_parameters);
  });
  //表單設置
  const sortedInfo = ref({});
  const columns: any = computed(() => {
    const sorted = sortedInfo.value;
    return [
      { title: '数据源名称', width: 200, dataIndex: 'dbName', ellipsis: true },
      { title: '数据库类型', width: 200, dataIndex: 'dbType', ellipsis: true },
      { title: '数据源描述', dataIndex: 'dbDepict', key: '1', ellipsis: true },
      { title: '连接信息', dataIndex: 'jdbcUrl', key: '2', ellipsis: true },
      { title: '应用状态', width: 150, dataIndex: 'dbStatus', key: '5', ellipsis: true },
      { title: '更新时间', dataIndex: 'updateTime', key: '3', ellipsis: true, sorter: true, sortOrder: sorted.field === 'updateTime' && sorted.order },
      { title: '操作', dataIndex: 'dbStatus', key: '4', fixed: 'right', width: 300 },
    ];
  });

  const pu_updatadbstatus = reactive({
    dbIds: [],
    flagStatus: 0,
  });
  //发布，连接，停用
  const cs = (x: any, record: any) => {
    let dbId = Number(record.dbId);
    let jdbcUrl = record.jdbcUrl;
    let driverClassname = record.driverClassname;
    let username = record.username;
    let password = record.password;
    if (x == 0) {
      console.log('连接测试');
      let key = username;
      let databasetextRequest = { jdbcUrl: jdbcUrl, driverClassname: driverClassname, username: username, password: password };
      databasetext(databasetextRequest);
    } else if (x == 1 || x == 2) {
      pu_updatadbstatus.flagStatus = x;
      pu_updatadbstatus.dbIds = [dbId];
      (async () => {
        await updatadbstatus(pu_updatadbstatus);
        get_database_list(Common_parameters);
      })();
    } else if (x == 3) {
      (async () => {
        await deldatabase(dbId);
        get_database_list(Common_parameters);
      })();
    } else if (x == 4) {
      faData.value = record;
      console.log(faData.value);
      isShow.value = true;
      //false为编辑
      editShow.value = false;
    }
  };
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
  //表单回调，分页，排序
  const onChange = (pagination: any, filters: any, sorter: any) => {
    console.log(sorter);
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
    get_database_list(Common_parameters);
  };
  //重置
  const selin = () => {
    dataname.value = '';
    Common_parameters.dbStatus = '';
    Common_parameters.dbName = '';
    Common_parameters.page = 1;
    Common_parameters.sortStatus = 0;
    sortedInfo.value = {};
    get_database_list(Common_parameters);
  };
  //搜索，查询
  // let rr = {};
  const sel = () => {
    console.log('擦寻');
    console.log(Common_parameters.dbStatus);
    Common_parameters.dbName = dataname.value;
    Common_parameters.page = 1;
    Common_parameters.sortStatus = 0;
    sortedInfo.value = {};
    get_database_list(Common_parameters);
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

  .addsource {
    position: absolute;
    right: 1%;
    margin-top: -60px;
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

  .nav1 {
    margin: 0 auto;
    width: 800px;
  }

  .flexcenter {
    display: flex;
    justify-content: center;
  }

  .flot {
    float: left;
  }
</style>
