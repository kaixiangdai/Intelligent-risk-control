<template>
  <div>
    <a-form layout="inline" :model="selectVal">
      <a-form-item label="码表状态" name="sStatus">
        <a-select ref="select" v-model:value="selectVal.sStatus" style="width: 100px">
          <a-select-option v-for="(item, index) in ['未发布', '已发布', '已停用']" :key="index" :value="index">{{ item }} </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="码表名称" name="sName">
        <a-input v-model:value="selectVal.sName" style="width: 200px"></a-input>
      </a-form-item>
      <a-form-item>
        <a-button @click="resetDate">重置</a-button>&nbsp;
        <a-button type="primary" @click="aqinquire">查询</a-button>
      </a-form-item>
    </a-form>
    <div style="display: flex; justify-content: space-between; margin: 15px 0 10px 0">
      <a-space>
        <a-button type="primary" :disabled="batch.publish" size="small" :block="true" @click="batchrelease">批量发布 </a-button>
        <a-button type="primary" :disabled="batch.deactivate" size="small" :block="true" @click="batchdeactiveation">批量停用 </a-button>
      </a-space>
      <a-space>
        <a-button type="primary" size="small" @click="exportexcil">码表模板下载</a-button>
        <!-- <a-upload action="http://8.130.19.70:9900/stop-watch/importExcel" accept=".xlsx" :file-list="fileList" name="excelFile" @change="handleChange"> -->
        <input ref="input" type="file" style="display: none" @change="importExcel" />
        <a-button type="primary" size="small" :block="true" @click="input.click()">码表导入</a-button>
        <!-- </a-upload> -->
        <a-button type="primary" size="small" @click="modaladdcode = { flagVisible: true, flag: 0, flagData: null }">新增码表</a-button>
      </a-space>
    </div>

    <a-table
      :columns="codeTableColumns"
      :data-source="tabledata"
      row-key="sId"
      :scroll="{ x: 1500, y: 600 }"
      :row-selection="{ selectedRowKeys: batch.selectedRowKeys, onChange: fundisabled }"
      style="font-weight: normal"
      show-quick-jumper
      :pagination="pagination"
      @change="paginationfun"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'sCode'">
          <a class="aqfont" @click="codedetails(record.sId, record.sCode)">&nbsp;&nbsp;{{ record.sCode }}</a>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <span>
            <a-popconfirm title="你确定要发布这一个码表吗?" ok-text="Yes" cancel-text="No" @confirm="singleOperation(record.sId, 0)">
              <a-button v-if="record.sStatus === '未发布' || record.sStatus === '已停用'" style="margin-right: 5px" type="primary" size="small">发布 </a-button>
            </a-popconfirm>
            <a-button
              v-if="record.sStatus === '未发布' || record.sStatus === '已停用'"
              style="margin-right: 5px"
              type="primary"
              size="small"
              @click="modaladdcode = { flagVisible: true, flag: 1, flagData: record }"
              >编辑</a-button
            >
            <a-popconfirm title="你确定要删除这一条码表吗？" @confirm="singleOperation(record.sId, 1)">
              <template #icon>
                <question-circle-outlined style="color: red" />
              </template>
              <a-button v-if="record.sStatus === '未发布'" style="margin-right: 5px" type="primary" danger size="small">删除</a-button>
            </a-popconfirm>

            <a-popconfirm title="你确定要停用这一条码表吗？" @confirm="singleOperation(record.sId, 2)">
              <a-button v-if="record.sStatus === '已发布'" style="margin-right: 5px" type="primary" size="small">停用</a-button>
            </a-popconfirm>
          </span>
        </template>
      </template>
    </a-table>

    <!-- 弹出框部分 -->
    <ModalAddCode v-if="modaladdcode.flagVisible" :modaladdcode="modaladdcode" @renovate-data="renovateData" />
  </div>
</template>
<script lang="ts" setup>
  import { getstopwatchlit, publishandstop, onedel, getdetails } from '@/api/aq/index';
  import { modaladdcodeInter } from '@/api/aq/model';
  import { exportExcel } from '@/utils/op';
  import { message, Modal } from 'ant-design-vue';
  // import type { UploadChangeParam } from 'ant-design-vue';
  import { aqtableData } from '@/api/aq/model';
  import ModalAddCode from './components/ModalAddCode.vue';
  import { h } from 'vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { codeTableColumns } from '@/pages/table_management/dataStandardDirectoryHooks';
  import { importFile } from '@/utils/imAndExport';
  const state = ['未发布', '已发布', '已停用'];
  const pagination = computed(() => ({
    total: selectVal.total,
    current: selectVal.page,
    pageSize: selectVal.num,
    showQuickJumper: true,
    showTotal: (total: number) => `共${total}条`,
  }));
  const selectVal = reactive({
    sStatus: '', //状态
    sName: '', //输入的值
    page: 1,
    num: 20,
    total: 0,
  });
  //控制批量发布与停用
  const batch = reactive({
    selectedRowKeys: [], // 选择的sId
    publish: true,
    deactivate: true,
  });
  const fundisabled = (val: []) => {
    batch.selectedRowKeys = val;
    let havePublish = tabledata.value.find((item: aqtableData) => val.find(i => i == item.sId && (item.sStatus == '未发布' || item.sStatus == '已停用')));
    let haveDeactivate = tabledata.value.find((item: aqtableData) => val.find(e => item.sId == e && item.sStatus == '已发布'));
    if (!havePublish && val.length) {
      //没有找到需要发布的且不为空
      batch.deactivate = false;
    } else if (!haveDeactivate && val.length) {
      //没有找到需要停用的且不为空
      batch.publish = false;
    } else {
      batch.deactivate = true;
      batch.publish = true;
    }
  };
  const modaladdcode = ref<modaladdcodeInter>({
    flagVisible: false,
    flag: 0,
    flagData: null,
  });
  //刷新
  const renovateData = () => {
    modaladdcode.value.flagVisible = false;
    resuest(selectVal);
  };

  // 默认加载数据
  const tabledata = ref<aqtableData[]>([]);
  const resuest = async (val = {}) => {
    try {
      const res = await getstopwatchlit(val);
      if (!res.data.records.length) return (tabledata.value = []);
      res.data.records.forEach((item: aqtableData) => {
        item.updateTime = new Date(item.updateTime).toLocaleString();
        item.sStatus = state[Number(item.sStatus)];
        tabledata.value = res.data.records; //处理后的表格数据
        selectVal.total = Number(res.data.total); //总数据条数
      });
    } catch (error) {
      console.log(error);
    }
  };
  resuest();
  // 查看码值详情
  const codedetails = (sId: number, sCode: string) => {
    getdetails(sId).then((res: any) => {
      const harr = [h('tr', { style: { textAlign: 'center' } }, [h('td', '码值取值'), h('td', '码值名称'), h('td', '编码含义')])];
      res.data.stopWatchValueList.forEach((item: any) => {
        harr.push(h('tr', { style: { textAlign: 'center' } }, [h('td', item.cValue), h('td', item.cName), h('td', item.cComment)]));
      });
      if (res.data.stopWatchValueList.length == 0) harr.push(h('tr', { style: { textAlign: 'center' } }, [h('td', '无数据'), h('td', '无数据'), h('td', '无数据')]));
      Modal.success({
        icon: '',
        mask: false,
        centered: true,
        title: `人员性别码表(${sCode})`,
        content: h('table', { border: '1px solid black', width: '100%', textAlign: 'center' }, harr),
      });
    });
  };

  // 查找
  const aqinquire = () => {
    selectVal.page = 1;
    resuest(selectVal);
  };
  //重置
  const resetDate = () => {
    selectVal.sStatus = '';
    selectVal.sName = '';
    selectVal.page = 1;
    resuest();
  };
  //分页
  const paginationfun = (val: any) => {
    selectVal.num = val.pageSize;
    selectVal.page = val.current;
    resuest(selectVal);
  };
  //批量操作
  const batchrelease = () => {
    Modal.info({
      okText: '确定',
      closable: true,
      title: '确认发布已选择的码表吗！',
      async onOk() {
        try {
          await publishandstop({ sIds: batch.selectedRowKeys.map(Number), flagStatus: 0 });
          await resuest(selectVal);
          message.success('批量发布成功');
        } catch (error) {
          message.error('批量发布失败');
        } finally {
          batch.publish = true;
          batch.selectedRowKeys = [];
        }
      },
    });
  };
  const singleOperation = async (sId: number, which: number) => {
    //单个操作函数
    try {
      switch (which) {
        case 0:
          await publishandstop({ sIds: [sId], flagStatus: 0 }); //发布
          break;
        case 1:
          await onedel(sId); //删除
          break;
        case 2:
          await publishandstop({ sIds: [sId], flagStatus: 1 }); //停用
          break;
      }
      await resuest(selectVal);
      message.success(['发布成功', ['删除成功'], ['停用成功']][which]);
    } catch (error) {
      console.log(error);
      message.error('操作失败');
    }
  };

  const batchdeactiveation = () => {
    Modal.info({
      okText: '确定',
      closable: true,
      title: '确认停用已选择的码表吗！',
      async onOk() {
        try {
          await publishandstop({ sIds: batch.selectedRowKeys.map(Number), flagStatus: 1 });
          await resuest(selectVal);
          message.success('批量停用成功');
        } catch (error) {
          message.error('批量停用失败');
        } finally {
          batch.deactivate = true;
          batch.selectedRowKeys = [];
        }
      },
    });
  };
  // 文件下载
  const exportexcil = async () => {
    try {
      await exportExcel();
      message.success('文件下载中......');
    } catch (error) {
      message.error('文件下载失败');
    }
  };
  // 文件上传
  const input = ref<any>(null);
  const importExcel = async (e: any) => {
    let url = 'http://8.130.19.70:9900/stop-watch/importExcel';
    try {
      const file = e.target.files[0];
      await importFile(file, url, 'buffer');
      resuest(selectVal);
    } catch (err) {
      console.log(err);
    }
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
<style lang="less" scoped></style>
