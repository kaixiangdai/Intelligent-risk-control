<template>
  <aside>
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
    <a-directory-tree
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      style="font-size: 12px; background-color: #f2f2f2"
      :field-names="{ title: 'title', key: 'key', children: 'children' }"
      :tree-data="_treeData"
    >
      <template #icon>
        <span class="img">
          <img src="@/assets/images/file.png" alt="" />
        </span>
      </template>
      <template #title="{ title, key, children }">
        <span @mouseenter="mouse1" @mouseleave="mouse2">{{ title }}</span>
        <span v-show="mousereturn">
          <a-popconfirm v-if="children.length == 0 && key != selectedKeys" placement="bottom" title="你确定要删除当前目录吗?" ok-text="确定" cancel-text="取消" @confirm="deletefun(key, children)">
            <span class="threeicon" @click.stop><img src="../../../public/img/删除.png" title="点击删除" /></span>
          </a-popconfirm>
          <a-popover placement="bottom" title="请输新的文件名" trigger="click">
            <template #content>
              <a-form :model="modifytitle" name="basic" layout="inline" autocomplete="off" @finish="ces()">
                <a-form-item :name="title" :rules="[{ required: true, trigger: 'blur', validator: modifythisFun }]">
                  <a-input v-model:value="modifytitle.modifythis" :placeholder="title" />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" html-type="submit"> 确认修改</a-button>
                </a-form-item>
              </a-form>
            </template>
            <span class="threeicon" @click.stop><img src="../../../public/img/编辑.png" title="点击编辑" /></span>
          </a-popover>
        </span>
      </template>
    </a-directory-tree>
  </aside>
</template>
<script lang="ts" setup>
  import InterfaceTest from './m_children/components/InterfaceTest.vue';
  import InterfaceDialog from './m_modal/InterfaceDetails.vue';
  import { TableProps, message } from 'ant-design-vue';
  import { interfaceMgmtStore } from '@/store/data_source_management/InterfaceMgmt';
  import { aqtitle, aqtreearr, addtitle } from '@/utils/op';
  import { useRouter } from 'vue-router';
  import {
    geiinterfaceinfolist,
    modifyinfolist,
    interfaceinfodelinfo,
    interfaceInfoGetAllcategory,
    interfaceInfoAddCategory,
    interfaceInfoDelCategory,
    interfaceInfoUpdateCategory,
  } from '@/api/aq/index';
  const mousereturn = ref(true);
  const props = defineProps({
    massge: {
      type: Number,
      required: true,
    },
  });
  const emit = defineEmits(['newkey']);
  //遍历树型组装成符合组件所需
  const _treeData = ref();
  function _replaceType(treearr: any) {
    treearr.forEach((item: any) => {
      // item.disabled = true;
      item.title = item.iName;
      item.key = item.iId + '';
      if (item.children && item.children.length > 0) {
        _replaceType(item.children);
        // item.disabled = true;
      }
    });
    return treearr;
  }
  onBeforeMount(() => {
    (async () => {
      const res = await interfaceInfoGetAllcategory();
      _treeData.value = _replaceType(res.data);
    })();
  });

  //添加分类
  const expandedKeys = ref<string[]>(['0']); //默认展开目录
  const selectedKeys = ref<string[]>(['0']); //选择的目录key
  const categoryName = ref<string>('');
  //树型数据匹配，点击目录时触发,获取父级标签
  let text = ref('全局'); //父级名称
  let addCategoryValue = reactive({
    iId: undefined,
    iName: '',
    iRank: undefined,
  });
  const fatherlog = ref();
  function loopFatherName(selectedKeys: any, value: any) {
    for (let i in value) {
      if (selectedKeys === value[i].key) {
        text.value = value[i].title;
        addCategoryValue.iId = value[i].iId;
        addCategoryValue.iRank = value[i].iRank;
        fatherlog.value = value[i];
        return;
      } else {
        if (value[i].children.length !== 0) {
          loopFatherName(selectedKeys, value[i].children);
        } else if (value[i].children.length == 0) {
          continue;
        }
      }
    }
  }
  //树型数据匹配,添加时判断是否重复
  let addClassText = ref(false);
  function loopAddClassification(add: any, value: any) {
    console.log(value);
    let reu = false;
    if (value != undefined) {
      if (add == value.title) {
        console.log('匹配到');
        addClassText.value = true;
      } else {
        if (reu == false) {
          for (let i in value.children) {
            if (add === value.children[i].title) {
              console.log('匹配到');
              addClassText.value = true;
              reu = true;
            } else {
              loopAddClassification(add, value.children[i]);
            }
          }
        }
      }
    }
  }
  // -------当选中目录页可以删除时使用
  //树型数据匹配，删除
  //获取删除目标所在对象
  let arrChildrens = ref();
  //获取删除目标的确定对象
  let arrChildren = ref();
  function loopDel(del: any, value: any) {
    for (let i in value) {
      if (del === value[i].key) {
        arrChildrens.value = value;
        arrChildren.value = value[i];
      } else {
        if (value[i].children.length !== 0) {
          loopDel(del, value[i].children);
        } else if (value[i].children.length == 0) {
          continue;
        }
      }
    }
  }
  //匹配选择对象和删除对象的位置关系
  let selectedKeysDel = ref(false);
  //为true时表示选择的在修改目标中
  function loopSelDel(sel: any, value: any) {
    if (value.key == sel) {
      console.log('判断到了');
      selectedKeysDel.value = true;
      return;
    } else {
      if (value.children.length != 0) {
        for (let i in value.children) {
          loopSelDel(sel, value.children[i]);
        }
      }
    }
  }
  //

  //展示父级名称
  const fatherName = computed(() => {
    loopFatherName(selectedKeys.value[0], _treeData.value);
    return text.value;
  });
  //将目录传给父组件
  watch(
    () => selectedKeys.value,
    nVal => {
      //选择的目录改变发送给父组件
      emit('newkey', nVal[0]);
    },
  );
  //添加
  const addClassification = () => {
    if (categoryName.value == '') {
      message.warning('请先输入');
      return false;
    }
    loopAddClassification(categoryName.value, fatherlog.value);
    if (addClassText.value == true) {
      message.warn('文件目录已存在');
      return false;
    } else {
      addCategoryValue.iName = categoryName.value;
      (async () => {
        await interfaceInfoAddCategory(addCategoryValue);
        const res = await interfaceInfoGetAllcategory();
        message.success('操作成功', 1);
        _treeData.value = _replaceType(res.data);
        categoryName.value = '';
      })();
    }
  };
  //删除
  const deletefun = (value: any, children: any) => {
    //当选中目录也可以删除时使用
    // selectedKeysDel.value = false;
    // loopDel(value,_treeData.value)
    // loopSelDel(selectedKeys.value,arrChildren.value)
    //获取删除目标所在对象
    // let arrChildrens = ref();
    //获取删除目标的确定对象
    // let arrChildren = ref()
    //匹配选择对象和删除对象的位置关系
    // let selectedKeysDel=ref(false);
    //为true时表示选择的在删除目标中
    // if(selectedKeysDel.value==false){
    //   //正常删除，对数据无影响
    // }else{
    //   //在的情况
    //   //判断删除的目录所在数组的长度，大于1，第一种,变为选中父级，将内容变为父级内容

    // }
    (async () => {
      const res1 = await interfaceInfoDelCategory(value);
      const res = await interfaceInfoGetAllcategory();
      message.success('操作成功', 1);
      _treeData.value = _replaceType(res.data);
    })();
  };
  //修改名称
  const modifytitle = reactive({
    //修改新增目录的文件名
    fathertitle: '',
    childtitle: '',
    modifythis: '',
  });
  //表单验证成功后执行
  const ces = async () => {
    await interfaceInfoUpdateCategory({ iId: iId.value, iName: modifytitle.modifythis });
    const res = await interfaceInfoGetAllcategory();
    message.success('操作成功', 1);
    _treeData.value = _replaceType(res.data);
    modifytitle.modifythis = '';
  };
  //验证规则
  //是否有相同名称，true为由，false为无
  let loop_return = ref(false);
  //同级目录
  let arrmodifythis = ref();
  //自己的key
  let modifythisKey = ref();
  //自己的ifid
  let iFid = ref();
  //自己的iId
  let iId = ref();
  //自己
  let modifythisSelf = ref();
  //获取父节点
  let fatherarr = ref();
  //获取树型
  //获取修改对象的数据
  function loopmodifythisFun1(wholevalue: any, targetvalue: any) {
    for (let i in wholevalue) {
      if (wholevalue[i].title == targetvalue) {
        arrmodifythis.value = wholevalue;
        modifythisKey.value = wholevalue[i].key;
        modifythisSelf.value = wholevalue[i];
        iFid.value = wholevalue[i].iFid;
        iId.value = wholevalue[i].iId;
        fatherarr.value = wholevalue;
        return;
      } else {
        if (wholevalue[i].children.length !== 0) {
          loopmodifythisFun1(wholevalue[i].children, targetvalue);
        } else if (wholevalue[i].children.length == 0) {
          continue;
        }
      }
    }
  }

  //同级判断
  function loopmodifythisFun2(wholevalue: any, targetvalue: any) {
    for (let i in wholevalue) {
      if (wholevalue[i].title == targetvalue && wholevalue[i].iFid == iFid.value && wholevalue[i].key != modifythisKey.value) {
        loop_return.value = true;
      } else {
        if (wholevalue[i].children.length !== 0) {
          loopmodifythisFun2(wholevalue[i].children, targetvalue);
        } else if (wholevalue[i].children.length == 0) {
          continue;
        }
      }
    }
  }
  //子级判断,由枝干判断代替
  function loopmodifythisFun3(wholevalue: any, targetvalue: any) {
    if (wholevalue.children.length != 0) {
      for (let i in wholevalue.children) {
        if (wholevalue.children[i].title == targetvalue) {
          loop_return.value = true;
        } else {
          loopmodifythisFun3(wholevalue.children[i], targetvalue);
        }
      }
    } else {
      return;
    }
  }
  // //枝干判断
  // //存储枝干数组
  // let ars = [];
  // let arss = ref();
  // //结束状态
  // let cool = ref(false);
  // //判断函数//获取那一条枝干
  // let oeel=0;
  // //通过判断是否添加到数组
  // let ints=ref();
  // function loopcool(wholevalue: any, targetvalue: any,subscript:any) {
  //   console.log("执行此处1")
  //   if (wholevalue.title == targetvalue && wholevalue.key == modifythisKey.value){
  //     console.log("变为true")
  //     cool.value = true;
  //     ars.push({
  //       title:wholevalue.title,
  //       key:wholevalue.key
  //     })
  //     ints.value=subscript;
  //     console.log("改变后的ints.value",ints.value)
  //   } else {
  //     console.log("执行此处2")
  //     for (let i in wholevalue.children) {
  //       if (wholevalue.children[i].title == targetvalue && wholevalue.children[i].key == modifythisKey.value) {
  //         cool.value = true;
  //         console.log("children处变为true")
  //         ars.push({
  //           title:wholevalue.children[i].title,
  //           key:wholevalue.children[i].key
  //         })
  //         ints.value=wholevalue.key;
  //       } else {
  //         loopcool(wholevalue.children[i], targetvalue,wholevalue.key)
  //         if (ints.value == wholevalue.key) {
  //             ars.push({
  //               title:wholevalue.title,
  //               key:wholevalue.key
  //             })
  //             console.log("==========",subscript)
  //             ints.value=subscript;
  //         }

  //       }
  //     }
  //     }
  //   }
  // function reqs(wholevalue: any, targetvalue: any){
  //   for(let i in wholevalue){
  //     if(cool.value==false){
  //       arss.value=wholevalue[i];
  //       ars=[];
  //       oeel=0;
  //       loopcool(wholevalue[i],targetvalue,arss.value.key)
  //     }
  // }

  //枝干判断
  //存储枝干数组
  let ars = ref();
  let arss = ref();
  //结束状态
  let cool = ref(false);
  //判断
  function reqs(wholevalue: any, targetvalue: any) {
    let resd = false;
    // for(let i in wholevalue){
    //   if(cool.value==false){
    //     arss.value=wholevalue[i];
    //     ars.value=[];
    //     loopcool(wholevalue[i],targetvalue)
    //     loopping(wholevalue[i])
    //   }
    // }
    for (let i in wholevalue) {
      if (cool.value == false) {
        arss.value = wholevalue[i];
        ars.value = [];
        loopcool(wholevalue[i], targetvalue);
        loopping(wholevalue[i]);
      }
    }
  }
  //筛选需要的枝干
  function loopcool(wholevalue: any, targetvalue: any) {
    if (wholevalue.title == targetvalue && wholevalue.key == modifythisKey.value) {
      console.log('变为true');
      cool.value = true;
    } else {
      for (let i in wholevalue.children) {
        if (wholevalue.children[i].title == targetvalue && wholevalue.children[i].key == modifythisKey.value) {
          cool.value = true;
        } else {
          loopcool(wholevalue.children[i], targetvalue);
        }
      }
    }
  }
  //数据平铺
  function loopping(wholevalue: any) {
    console.log('wholevalue', wholevalue);
    ars.value.push({
      iFid: wholevalue.iFid,
      iId: wholevalue.iId,
      title: wholevalue.title,
    });
    for (let i in wholevalue.children) {
      loopping(wholevalue.children[i]);
    }
  }
  //对枝干进行匹配
  function loopfid(wholevalue: any, ifid: any) {
    let show = ref(true);
    if (wholevalue.id == ifid) {
      if (wholevalue.title == modifytitle.modifythis) {
        loop_return.value = true;
        show.value = false;
        retu.value = false;
      } else {
        iFid.value = wholevalue.iFid;
        if (wholevalue.iFid == 0) {
          show.value = false;
          retu.value = false;
        }
      }
    } else {
      for (let i in wholevalue.children) {
        if (show.value == true) {
          loopfid(wholevalue.children[i], iFid.value);
        }
      }
    }
  }

  const modifythisFun = (rule, val, callback) => {
    console.log(rule.field);
    cool.value = false;
    if (modifytitle.modifythis == '') {
      //输入名称为空
      return Promise.reject('名称为空');
    } else {
      loopmodifythisFun1(_treeData.value, rule.field); //获取判断的数据，自己，同级
      reqs(_treeData.value, rule.field); //判断自己单线的上级
      loopmodifythisFun2(arrmodifythis.value, modifytitle.modifythis); //判断同级
      loopmodifythisFun3(modifythisSelf.value, modifytitle.modifythis); //判断子级
      if (loop_return.value == true) {
        return Promise.reject('重复');
      }
      return Promise.resolve('可以开始下一步');
    }
  };
  //重置归零
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
</script>
<style lang="less" scoped>
  @width: 6px;

  .intermgmt_left {
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
