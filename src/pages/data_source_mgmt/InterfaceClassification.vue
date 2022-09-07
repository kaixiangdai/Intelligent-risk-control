<template>
  <a-drawer title="分类修改" :size="size" :visible="visible" @close="onClose">
    <template #extra>
      <a-button style="margin-right: 8px" @click="showDrawerqu">取消</a-button>
      <a-button type="primary" @click="showDrawer">确定</a-button>
    </template>
    <a-table :columns="columns" :data-source="data[1]" :row-selection="{ selectedRowKeys: state.selectedRowKeys[0], onChange: Change }" :row-key="(record:any)=> record.imId"> </a-table>
    <a-dropdown>
      <a class="ant-dropdown-link" @click.prevent>
        {{ readName }}
        <DownOutlined />
      </a>
      <template #overlay>
        <a-menu>
          <template v-for="(item, index) in datalist" :key="index">
            <a-menu-item>
              <a href="javascript:;" @click="readqu(item)">{{ item.iName }}</a>
            </a-menu-item>
          </template>
        </a-menu>
      </template>
    </a-dropdown>
  </a-drawer>
</template>
<script lang="ts" setup>
  import type { DrawerProps } from 'ant-design-vue';
  import { object } from 'vue-types';
  import { interfaceInfoGetAllcategory, interfaceInfoSortInfolist } from '@/api/aq/index';
  import { message } from 'ant-design-vue';
  const props = defineProps({
    state: {
      type: Object,
      required: true,
    },
  });
  const data = computed({
    get: () => {
      return props.state;
    },
    set: value => {
      console.log(value);
    },
  });
  const emit = defineEmits(['timevalue', 'datadel']);

  const visible = ref<boolean>(false);
  const size = ref<DrawerProps['size']>('default');
  const onequ = ref(0);
  const showDrawer = () => {
    if (readId.value == -1) {
      message.error('请选择分类', 1);
      return false;
    }
    if (state.selectedRowKeys[0].length == 0) {
      message.error('请选择要修改的接口', 1);
      return false;
    }
    let time = new Date().getTime(); //唯一时间
    onequ.value = time;
    (async () => {
      await interfaceInfoSortInfolist({
        im_id: [...state.selectedRowKeys[0]],
        i_id: readId.value,
      });
      emit('datadel', state.selectedRowKeys[1]);
      state.selectedRowKeys = [[], []];
      message.success('操作成功', 1);
    })();
  };
  const onClose = () => {
    visible.value = false;
  };
  //显示
  const columns = computed(() => {
    return [{ title: '接口名称:', dataIndex: 'imName', width: 100, ellipsis: true }];
  });
  //选择
  const state = reactive({
    selectedRowKeys: [[], []],
  });
  let Change = (selectedRowKeys1: any, selectedRowKeys2: any) => {
    state.selectedRowKeys[0] = selectedRowKeys1;
    state.selectedRowKeys[1] = selectedRowKeys2;
  };
  //分类，第一种，请求新数据。第二种，使用兄弟组件传递的消息
  //请求新数据，现在组件传值已经过多
  const datalist = ref([]);
  onBeforeMount(async () => {
    const res = await interfaceInfoGetAllcategory();
    looplist(res.data);
    console.log(datalist.value);
  });
  //列表数据
  function looplist(wholevalue: any) {
    for (let i in wholevalue) {
      datalist.value.push({
        iId: wholevalue[i].iId,
        iName: wholevalue[i].iName,
      });
      looplist(wholevalue[i].children);
    }
  }
  const readName = ref('分类');
  const readId = ref(-1);
  const readqu = value => {
    readName.value = value.iName;
    readId.value = value.iId;
    console.log(value);
  };
  const showDrawerqu = () => {
    emit('timevalue', '');
  };
</script>
