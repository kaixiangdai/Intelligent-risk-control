<template>
  <div>
    <!-- 查询 -->
    <a-form layout="inline" :model="searchInfo">
      <a-form-item label="来源机构：" name="dOrigin">
        <a-select ref="select" v-model:value="searchInfo.dOrigin" style="margin-bottom: 5px; width: 180px" :options="dataTransition.originArr"></a-select>
      </a-form-item>
      <a-form-item label="标准状态：" name="dStatus">
        <a-select ref="select" v-model:value="searchInfo.dStatus" style="width: 180px" :options="dataTransition.statusArr"></a-select>
      </a-form-item>
      <a-form-item label="标准编号：" name="dCode">
        <a-input v-model:value="searchInfo.dCode"></a-input>
      </a-form-item>
      <a-form-item label="中文名称：" name="dCname">
        <a-input v-model:value="searchInfo.dCname"></a-input>
      </a-form-item>
      <a-form-item label="英文名称：" name="dEname">
        <a-input v-model:value="searchInfo.dEname"></a-input>
      </a-form-item>
      <a-button type="primary" ghost style="margin: 0 5px 0 36px" @click="resetBtn">重置</a-button>
      <a-button type="primary" @click="enquireBtn">查询</a-button>
    </a-form>
    <div class="btns-section">
      <div>
        <a-button type="primary" size="small" :disabled="!(filterItem.filterRelease.length > 0 && filterItem.filterDisable.length == 0)" style="margin-right: 5px" @click="ModalConfirm(0)"
          >批量发布</a-button
        >
        <a-button type="primary" size="small" :disabled="!(filterItem.filterRelease.length == 0 && filterItem.filterDisable.length > 0)" @click="ModalConfirm(1)">批量停用</a-button>
      </div>
      <div>
        <a-button type="primary" size="small" style="margin-right: 5px" @click="templateBtn">导入模板下载</a-button>
        <input ref="input" type="file" style="display: none" @change="inputChange" />
        <a-button type="primary" size="small" style="margin-right: 5px" @click="input.click()">标准导入</a-button>
        <a-button type="primary" size="small" @click="addStandardBtn(0, {})">新增标准</a-button>
      </div>
    </div>
    <!-- 表格 -->
    <a-table
      :row-selection="rowSelection"
      :row-key="(record: any) => record.did"
      :columns="columns"
      :data-source="data"
      :scroll="{ x: 1500, y: 600 }"
      :pagination="pagination"
      :show-sorter-tooltip="showSorterTooltip[searchInfo.sortStatus]"
      @change="changeTab"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'dcode'">
          <a @click="openModalCode(record, 0)">{{ text }}</a>
        </template>
        <template v-if="column.key === 'denum'">
          <a @click="openModalCode(record, 1)">{{ text }}</a>
        </template>
        <template v-if="column.key === 'operation'">
          <a-popconfirm title="你确定要发布这一条标准目录吗？" ok-text="Yes" cancel-text="No" @confirm="updataStatus([record.did], 0)">
            <a-button v-if="record.dstatus != '已发布'" size="small" type="primary" style="margin-right: 5px">发布</a-button>
          </a-popconfirm>
          <a-popconfirm title="你确定要停用这一条标准目录吗？" ok-text="Yes" cancel-text="No" @confirm="updataStatus([record.did], 1)">
            <a-button v-if="record.dstatus == '已发布'" size="small" type="primary" style="margin-right: 5px">停用</a-button>
          </a-popconfirm>
          <a-button v-if="record.dstatus != '已发布'" size="small" type="primary" style="margin-right: 5px" @click="addStandardBtn(1, record)">编辑 </a-button>
          <a-popconfirm v-if="record.dstatus == '未发布'" title="你确定要删除这一条标准目录吗？" ok-text="Yes" cancel-text="No" @confirm="deleteBtn(record.did)">
            <template #icon>
              <question-circle-outlined style="color: red" />
            </template>
            <a-button type="primary" size="small" danger style="margin-right: 5px">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    <!-- 标准编号/枚举范围模态框  -->
    <ModalCode :modal-code="modalCode" />
    <!-- 新增/编辑模态框 -->
    <ModalAddList v-if="modaladdlist.visible" :modaladdlist="modaladdlist" @flsh="flsh" />
  </div>
</template>

<script lang="ts" setup>
  import { message, TableColumnsType, Modal } from 'ant-design-vue';
  import { dataItemFace, searchInfoFace, FilterItem, ModalCodeFace } from '../../api/aq/model';
  import { getdirectory, postUpdataStatus, deleteItem } from '../../api/aq/index';
  //弹出框
  import ModalCode from './components/ModalCode.vue';
  import ModalAddList from './components/ModalAddList.vue';
  //导出、导入
  import { exportFile, importFile } from '@/utils/imAndExport';
  import { url } from 'inspector';

  //搜索
  const searchInfo = ref<searchInfoFace>({
    dOrigin: '',
    dStatus: '',
    dCode: '',
    dCname: '',
    dEname: '',
    total: 0,
    page: 1,
    num: 20,
    sortStatus: 0, //更新排序
  });
  let searchInfoClone = {
    dOrigin: '',
    dStatus: '',
    dCode: '',
    dCname: '',
    dEname: '',
    total: 0,
    page: 1,
    num: 20,
    sortStatus: 0, //更新排序
  };

  //表头配置
  const columns: TableColumnsType = [
    { title: '标准编号', dataIndex: 'dcode', key: 'dcode', width: 100, fixed: 'left' },
    { title: '中文名称', dataIndex: 'dcname', key: 'dcname', width: 100, fixed: 'left', ellipsis: true },
    { title: '英文名称', dataIndex: 'dename', key: 'dename', width: 100, fixed: 'left', ellipsis: true },
    { title: '标准说明', dataIndex: 'dcomment', key: 'dcomment', width: 150, ellipsis: true },
    { title: '来源机构', dataIndex: 'dorigin', key: 'dorigin', width: 150 },
    { title: '数据类型', dataIndex: 'dtype', key: 'dtype', width: 150 },
    { title: '数据长度', dataIndex: 'dlength', key: 'dlength', width: 150 },
    { title: '数据精度', dataIndex: 'daccuracy', key: 'daccuracy', width: 150 },
    { title: '默认值', dataIndex: 'ddefault', key: 'ddefault', width: 150 },
    { title: '取值范围', dataIndex: 'drange', key: 'drange', width: 150 },
    { title: '枚举范围', dataIndex: 'denum', key: 'denum', width: 150 },
    { title: '是否可为空', dataIndex: 'dnull', key: 'dnull', width: 150 },
    { title: '标准状态', dataIndex: 'dstatus', key: 'dstatus', width: 100, fixed: 'right' },
    { title: '更新日期（默认）', dataIndex: 'updateTime', key: 'updateTime', width: 180, fixed: 'right', sorter: true },
    { title: '操作', key: 'operation', fixed: 'right', width: 215 },
  ];

  // 表格数据
  const data = ref<dataItemFace[]>([]);
  //配置分页
  const pagination = computed(() => ({
    total: searchInfo.value.total,
    current: searchInfo.value.page,
    pageSize: searchInfo.value.num,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30', '40', '50'],
    showTotal: (total: number) => `共${total}条`,
  }));

  //状态
  let stateTransition = {
    dnull: {
      0: '不可为空',
      1: '可为空',
    },
    dstatus: {
      0: '未发布',
      1: '已发布',
      2: '已停用',
    },
  };
  //下拉框数据
  const dataTransition = ref({
    statusArr: [
      { value: 0, label: '未发布' },
      { value: 1, label: '已发布' },
      { value: 2, label: '已停用' },
    ],
    originArr: [{}], //来源机构
  });
  //默认数据&&分页&&查询
  const requestDefaultData = async (object: object) => {
    try {
      const res = await getdirectory(object);
      data.value = res.data.directoryStandardVoList.list;
      searchInfo.value.total = res.data.directoryStandardVoList.total; //总条数
      data.value.forEach((item: any) => {
        item.dnull = stateTransition.dnull[item.dnull];
        item.dstatus = stateTransition.dstatus[item.dstatus];
        item.updateTime = new Date(item.updateTime).toLocaleString();
      });
      //来源机构数据
      res.data.origins.forEach((item: object) => {
        dataTransition.value.originArr.push({ value: item, lable: item });
      });
      selectedRowKeysArr.value = [];
      //批量操作后 清空
      filterItem.value.filterRelease = [];
      filterItem.value.filterDisable = [];
    } catch (err) {
      console.log(err);
    }
  };
  requestDefaultData(searchInfo.value);

  //多选
  const selectedRowsArr = ref<object[]>([]); //item
  const selectedRowKeysArr = ref<number[]>([]); //id
  const rowSelection = {
    selectedRowKeys: selectedRowKeysArr,
    onChange: (selectedRowKeys: number[], selectedRows: dataItemFace[]) => {
      selectedRowKeysArr.value = selectedRowKeys;
      selectedRowsArr.value = selectedRows;
      filterItem.value.filterRelease = [];
      filterItem.value.filterDisable = [];
      selectedRows.forEach((item: any) => {
        if (item.dstatus === '未发布' || item.dstatus === '已停用') filterItem.value.filterRelease.push(item.did);
        else if (item.dstatus === '已发布') filterItem.value.filterDisable.push(item.did);
      });
    },
  };
  //批量发布、停用禁用id
  const filterItem = ref<FilterItem>({
    filterRelease: [],
    filterDisable: [],
  });

  //重置
  const resetBtn = async () => {
    try {
      searchInfo.value = { ...searchInfoClone };
      columns[13].title = showSorterTooltip.value[searchInfo.value.sortStatus].name;
      await requestDefaultData({ page: 1, num: 20 });
      searchInfo.value.page = 1;
      searchInfo.value.num = 20;

      message.success('重置成功');
    } catch (err) {
      console.log(err);
    }
  };
  //查询
  const enquireBtn = async () => {
    try {
      await requestDefaultData(searchInfo.value);
      message.success('查询成功');
    } catch (e) {
      console.log(e);
    }
  };

  //修改状态 单个发布、停用/批量发布停用
  const updataStatus = async (dids: any, flagStatus: number) => {
    try {
      await postUpdataStatus({
        dIds: dids,
        flagStatus: flagStatus,
      });
      if (flagStatus == 0) {
        if (dids.length > 1) message.success('批量发布成功！');
        else message.success('发布成功');
      } else {
        if (dids.length > 1) message.success('批量停用成功！');
        else message.success('停用成功');
      }
      requestDefaultData(searchInfo.value);
    } catch (e) {
      console.log(e);
    }
  };
  //删除
  const deleteBtn = async (did: number) => {
    try {
      await deleteItem({ dId: did });
      requestDefaultData(searchInfo.value);
      message.success('删除成功');
    } catch (err) {
      console.log(err);
    }
  };
  //批量操作-及确认事件
  const ModalConfirm = (flag: number) => {
    Modal.confirm({
      title: flag == 0 ? '确定要批量发布？' : '确定要批量停用？',
      okText: 'Yes',
      cancelText: 'No',
      onOk() {
        try {
          flag == 0 ? updataStatus(filterItem.value.filterRelease, flag) : updataStatus(filterItem.value.filterDisable, flag);
        } catch (e) {
          console.log(e);
        }
      },
    });
  };

  //新增/编辑flag
  const modaladdlist = ref<ModalCodeFace>({
    visible: false,
    flag: 0,
    data: {},
  });
  //新增标准/编辑
  const addStandardBtn = (flag: number, record: object) => {
    modaladdlist.value = { visible: true, flag: flag, data: record };
  };

  //标准编号弹窗/枚举范围弹窗
  const modalCode = ref<ModalCodeFace>({
    visible: false,
    flag: 0,
    data: {},
  });
  const openModalCode = (record: object, flag: number) => {
    modalCode.value = { visible: true, flag: flag, data: record };
  };
  //根据change事件进行排序
  const showSorterTooltip = ref({
    0: { title: '点击升序', name: '更新时间(默认)' },
    1: { title: '点击降序', name: '更新时间(升序)' },
    2: { title: '点击默认排序', name: '更新时间(降序)' },
  });
  const changeTab = (page: any, filters: any, sorter: any) => {
    searchInfo.value.page = page.current;
    searchInfo.value.num = page.pageSize;
    if (sorter.order == 'ascend') searchInfo.value.sortStatus = 1;
    else if (sorter.order == 'descend') searchInfo.value.sortStatus = 2;
    else searchInfo.value.sortStatus = 0;
    columns[13].title = showSorterTooltip.value[searchInfo.value.sortStatus].name;
    requestDefaultData(searchInfo.value);
  };

  const flsh = () => {
    requestDefaultData(searchInfo.value);
  };

  //导出
  const input = ref<any>(null);
  const templateBtn = async () => {
    try {
      await exportFile();
      message.success('模板下载中···');
    } catch (e) {
      console.log(e);
    }
  };
  //导入
  const inputChange = async (e: any) => {
    let url = 'http://8.130.19.70:9900/directory-standard/importExcel';
    try {
      const file = e.target.files[0];
      await importFile(file, url, 'buffer');
      requestDefaultData(searchInfo.value);
    } catch (err) {
      console.log(err);
    }
  };
</script>
<style scoped lang="less">
  .btns-section {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    width: 100%;

    & > div:first-child {
      display: flex;
    }

    & > div:last-child {
      display: flex;
    }
  }
</style>
