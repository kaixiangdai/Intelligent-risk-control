export interface aqtreeData {
  adId: string;
  adLevel: number;
  adName: string;
  children: aqtreeData[];
  createTime: string;
  deleted: number;
  parentId: number;
  updateTime: string;
  version: any;
  disabled?: boolean;
}
export interface aqtableData {
  createTime: string;
  deleted: number;
  sCode: string;
  sComment: string;
  sId: number;
  sName: string;
  sStatus: number | string;
  updateTime: string;
  version: number;
}

// 资产管理下拉框
export interface optionseAxiosItem {
  did: number;
  dcode: string;
  dcname: string;
  dename: string;
}
//新增数据资产表
export interface formTableFieldInterface {
  fieldDataId?: number | undefined;
  ftId?: number | undefined;
  ftEname: string;
  ftCname: string;
  ftComment: string;
  dId: number | undefined;
  //判断编辑
  editFlag?: boolean;
}
// export interface dataFieldListItem {
//   fieldDataId: number | undefined;
//   ftId: string | number;
//   ftEname: string;
//   ftCname: string;
//   ftComment: string;
//   dId: number | undefined;
// }
//数据标准目录 表格数据
export interface dataItemFace {
  key: number;
  dcode: string;
  dcname: string;
  dename: string;
  dcomment: string;
  dorigin: string;
  dtype: string;
  dlength: string;
  daccuracy: string;
  ddefault: string;
  drange: string;
  denum: string;
  dnull: string;
  dstatus: string;
  updateTime: any;
  [propName: string]: any;
}

//数据标准目录 搜索条件
export interface searchInfoFace {
  // origin: string;
  // status: any;
  // code: string;
  // cname: string;
  // ename: string;
  [propName: string]: any;
}
//数据标准目录 批量发布/批量停用
export interface FilterItem {
  filterRelease: number[];
  filterDisable: number[];
}
//数据标准目录 标准编号 弹框
export interface FlagState {
  visible: boolean;
  flag: number;
  data: any;
}
export interface Data {
  title: string;
  details: string;
}
export interface DataEnum {
  cValue: string;
  cName: string;
  cComment: string;
}

export interface DataItem {
  key: string;

  icName: string;

  icPosition: string;

  icType: number;

  icFill?: number;

  icDefault?: string | null;

  icComment: string | null;

  children?: DataItem[];
  sId?: number | null;
  isSave?: number;
  [key: string]: any;
}

//数据标准目录 标准编号/枚举范围
export interface ModalCodeFace {
  visible: boolean;
  flag: number;
  data: object;
}
export interface modaladdcodeInter {
  flagVisible: Boolean;
  flag: Number;
  flagData: object | null;
}
