<template>
  <div class="assetmgmt">
    <aside>
      <p
        >数据资产表目录
        <span>
          <a-popover title="" trigger="click" placement="right">
            <template #content>
              <a-form :model="modifytitle" name="basic" layout="inline" autocomplete="off" @finish="modifyfun(0)">
                <a-form-item name="fathertitle" :rules="[{ required: true, message: '文件名称不符合规则', trigger: 'blur', pattern: /^[\u4e00-\u9fa5a-zA-Z]{1,30}$/ }]">
                  <a-input v-model:value="modifytitle.fathertitle" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" html-type="submit"> 确认新增</a-button>
                </a-form-item>
              </a-form>
            </template>
            <a><img src="@/assets/images/加.png" alt="" /></a>
          </a-popover>
        </span>
      </p>
      <div>
        <a-input-search v-model:value="searchtitle" placeholder="按数据资产表名称或目录名称查询" style="width: 100%" @search="searchFun" />
      </div>
      <br />
      <a-directory-tree
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        :field-names="{ title: 'adName', key: 'adId' }"
        style="font-size: 12px; background-color: #f2f2f2"
        :tree-data="_treeData"
      >
        <template #icon>
          <span class="img">
            <img src="@/assets/images/file.png" />
          </span>
        </template>
        <template #title="{ adName, adId, adLevel }">
          <span @mouseenter="aqenterOrleave(0, adId)">
            <span>{{ adName }}</span>
            &nbsp;
            <span v-if="aqeidtkey == adId && selectedKeys[0] != adId">
              <a-popover placement="bottom" title="添加子级目录" trigger="click">
                <template #content>
                  <a-form :model="modifytitle" name="basic" layout="inline" autocomplete="off" @finish="modifyfun(1, adId, adLevel)">
                    <a-form-item name="childtitle" :rules="[{ required: true, message: '文件名称不符合规则', trigger: 'blur', pattern: /^[\u4e00-\u9fa5a-zA-Z]{1,30}$/ }]">
                      <a-input v-model:value="modifytitle.childtitle" :placeholder="adName" />
                    </a-form-item>
                    <a-form-item>
                      <a-button type="primary" html-type="submit"> 确认新增 </a-button>
                    </a-form-item>
                  </a-form>
                </template>
                <span class="threeicon" @click.stop><img src="../../../public/img/添加.png" title="点击新增" /></span>
              </a-popover>
              <a-popconfirm placement="bottom" title="你确定要删除当前目录吗?" ok-text="确定" cancel-text="取消" @confirm="deletefun(adId)">
                <span class="threeicon" @click.stop><img src="../../../public/img/删除.png" title="点击删除" /></span>
              </a-popconfirm>

              <a-popover placement="bottom" title="请输新的文件名" trigger="click">
                <template #content>
                  <a-form :model="modifytitle" name="basic" layout="inline" autocomplete="off" @finish="modifyfun(2, adId)">
                    <a-form-item name="modifythis" :rules="[{ required: true, message: '文件名称不符合规则', trigger: 'blur', validator: modifythisFun, pattern: /^[\u4e00-\u9fa5a-zA-Z]{1,30}$/ }]">
                      <a-input v-model:value="modifytitle.modifythis" :placeholder="adName" />
                    </a-form-item>
                    <a-form-item>
                      <a-button type="primary" html-type="submit"> 确认修改 </a-button>
                    </a-form-item>
                  </a-form>
                </template>
                <span class="threeicon" @click.stop><img src="../../../public/img/编辑.png" title="点击编辑" /></span>
              </a-popover>
            </span>
          </span>
        </template>
      </a-directory-tree>
    </aside>
  </div>
</template>
<script setup lang="ts">
  import { aqtreeData } from '@/api/aq/model';
  import { aqgetdirectorylists, aqadddirectory, aqupdatedirectory, aqdeldirectory } from '@/api/aq/index';
  import { message } from 'ant-design-vue';
  import { dataAssetMgmtStore } from '@/store/data_asset_management/dataAssetMgmt';
  const props = defineProps({
    massge: {
      type: Number,
      required: true,
    },
  });

  const emit = defineEmits(['newkey']);
  // aq数据资产表目录
  const _treeData = ref<aqtreeData[]>([]);
  // 请求数据资产表目录
  async function requestTreedata() {
    try {
      const res = await aqgetdirectorylists();

      _treeData.value = _replaceType(res.data); //处理数据

      dataAssetMgmtStore().treeData = _treeData.value; //将数据存入状态仓库
    } catch (error) {
      console.log(error);
    }
  }
  requestTreedata();

  const aqeidtkey = ref<string>(''); //当前鼠标移入选中的key
  const aqenterOrleave = (status: number, key: string) => {
    //0表示移入1表示移出
    status == 0 ? (aqeidtkey.value = key) : null;
  };
  const expandedKeys = ref<string[]>(['0']); //默认展开目录
  const selectedKeys = ref<string[]>(['0']); //选择的目录key

  watch(
    () => selectedKeys.value,
    nVal => {
      //选择的目录改变发送给父组件
      // console.log(nVal[0]);
      emit('newkey', nVal[0]);
      // selectedKeys.value = ['0']; //选择的目录key
      // expandedKeys.value = ['0'];
    },
  );

  watch(
    () => props.massge,
    (pnvalue, povalue) => {
      selectedKeys.value = ['0']; //选择的目录key
      expandedKeys.value = ['0'];
    },
    {
      deep: true,
      immediate: true,
    },
  );
  const modifytitle = ref({
    //修改新增目录的文件名
    fathertitle: '',
    childtitle: '',
    modifythis: '',
  });
  // 新增、修改
  const modifyfun = async (who: number, adId = '', adLevel = 999) => {
    //新增父级目录与新增子级目录公用同一个方法 0:父级 1:子级 2：修改当前文件名
    try {
      if (who == 0) {
        //添加外层
        const res = await aqadddirectory({ adName: modifytitle.value.fathertitle });
        message.success(res.msg);
      } else if (who == 1) {
        //添加里面
        const res = await aqadddirectory({ adName: modifytitle.value.childtitle, adId: Number(adId), adLevel });
        message.success(res.msg);
      } else if (who == 2) {
        //修改
        const res = await aqupdatedirectory({ adId: Number(adId), adName: modifytitle.value.modifythis });
        message.success(res.msg);
      }
      ({ ...modifytitle.value } = { fathertitle: '', childtitle: '', modifythis: '' });
      aqeidtkey.value = '';
      requestTreedata();
    } catch (error) {
      message.error('操作失败');
    }
  };
  //删除
  const deletefun = async (adId: number) => {
    try {
      const res = await aqdeldirectory(adId);
      console.log('删除', res);

      message.success(res.msg);
      requestTreedata();
    } catch (error) {
      message.error('删除失败');
    }
  };
  function _replaceType(treearr: aqtreeData[]): aqtreeData[] {
    //递归遍历树形结构 转化adId类型为string
    treearr.forEach((item: aqtreeData) => {
      item.adId = item.adId + '';
      if (item.children && item.children.length > 0) _replaceType(item.children);
    });
    return treearr;
  }
  //搜索目录
  const searchtitle = ref<string>('');
  const searchFun = () => {
    let _key = aqserachkey(_treeData.value, searchtitle.value);
    if (_key.length > 0) {
      //将搜索出来的目录展开
      expandedKeys.value.push(_key);
      selectedKeys.value.push(_key);
    }
  };
  function aqserachkey(arr: aqtreeData[], title: string): string {
    //遍历树形结构根据title拿到key
    let str = '';
    if (!arr.length && !title.length) return str;
    const stack: aqtreeData[] = [];
    let aq: aqtreeData;
    for (aq of arr) {
      if (aq.adName.substring(0, 1) == title.substring(0, 1)) {
        if (aq.adName == title) return aq.adId + '';
        stack.push(aq);
        break;
      }
    }
    let item: any;
    let i = 1;
    while (stack.length) {
      item = stack.shift();
      let a: aqtreeData;
      for (a of item.children) {
        if (a.adName?.substring(i, i + 1) == title.substring(i, i + 1)) {
          if (a.adName == title) return a.adId + '';
          stack.push(a);
          break;
        }
      }
      i++;
    }
    return str;
  }
</script>

<style lang="less" scoped>
  @width: 6px;

  .assetmgmt {
    font-size: 12px;
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

  p {
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

  // aq
  .threeicon {
    display: inline-block;
    width: @width*2.5;
    height: @width*2.5;

    img {
      width: 100%;
      height: 100%;
    }
  }
</style>
