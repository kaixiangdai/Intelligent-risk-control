import { aqtreeData } from '@/api/aq/model';
import { aqgetdirectorylists } from '@/api/aq/index';
export default function () {
  //数据资产表目录
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
  function _replaceType(treearr: aqtreeData[]): aqtreeData[] {
    treearr.forEach((item: aqtreeData) => {
      if (item.children && item.children.length > 0) {
        _replaceType(item.children);
        item.disabled = true;
      }
    });
    return treearr;
  }
  requestTreedata();
  return { requestTreedata, _treeData };
}
