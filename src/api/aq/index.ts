import HttpService from '@/utils/axios';
enum Api {
  //接口管理下
  // 查询码表码值全部数据
  GET_STOPWATCH_VALUE = 'interface-config/get-stopwatchvalue',
  //接口管理上
  STOP_WATCH_GET_WATCHLIST = 'stop-watch/getstopwatchlit',
  STOP_WATCH_POST_ADDSTOPWATCH = 'stop-watch/addstopwatch',
  STOP_WATCH_VALUE_GETDETAILS = 'stop-watch-value/getdetails',
  // STOP_WATCH_UPDATASTATUS
  STOP_WATCH_PUBONE = 'stop-watch/pubone', //单个发布
  STOP_WATCH_DEL = 'stop-watch/del', //单个删除
  STOP_WATCH_STOPONE = 'stop-watch/stopone', //单个停用
  STOP_WATCH_UPDATE = 'stop-watch/update', //更新码表
  STOP_WATCH_PUBLIDST = 'stop-watch/publist', //批量发布
  STOP_WATCH_EXPORTEXCEL = 'stop-watch/exportExcel',
  STOP_WATCH_STOPLIST = 'stop-watch/stoplist',
  STOP_WATCH_UPDATASTATUS = 'stop-watch/updatastatus',
  // 数据标准目录
  DIRECTORY_STANDARD_ADD_DIRECTORY = 'directory-standard/add-directory', //新增数据标准目录
  DIRECTORY_STANDARD_GET_STOP_WATCH = 'directory-standard/get-stop-watch', //查询枚举类型
  DIRECTORY_STANDARD_GET_DIRECTORYLIST = 'directory-standard/get-directorylist', //查询数据标准目录
  DIRECTORY_STANDARD_UPDATE = 'directory-standard/update', //编辑标准目录
  DIRECTORY_STANDARD_UPDATASTATUS = 'directory-standard/updatastatus', //修改状态  单个发布、停用 批量发布、停用 重构后
  DIRECTORY_STANDARD_DEL_DIRECTORY = 'directory-standard/del-directory', //删除

  DATABASE_GETDATABASELIAT = 'database/getdatabaselist', //数据库管理-查询数据库列表
  DATABASE_PUBDATABASE = 'database/pubdatabase', //发布数据库
  DATABASE_STOPDATABASE = 'database/stopdatabase', //
  DATABASE_ADD_DATABASE = 'database/add-database', //
  DATABASE_TEXT = 'database/text', //发布数据库
  DATABASE_databasetext = 'database/text', //数据库管理-连通测试
  DATABASE_databasePubdatabase = 'database/pubdatabase/', //数据库管理-发布
  DATABASE_databaseStopdatabase = 'database/stopdatabase/', //数据库管理-停用
  DATABASE_UPDATADBSTATUS = '/database/updatadbstatus', //数据库管理，发布，停用，批量
  DATABASE_deldatabase = 'database/del-database/', //数据库管理-删除
  DATABASE_DATABASE_UPDATE = 'database/update', //数据库管理-修改

  DATA_ASSETS_GET_ASSETS_TABLE = 'data-assets/get-assets-table', //数据资产管理查询
  DATA_ASSETS_DELETE = 'data-assets/delete/', //数据资产管理-删除
  DATA_ASSETS_PUB_LIST = '/data-assets/pub-list', //数据资产管理-发布-批量发布
  DATA_ASSETS_STOP_LIST = '/data-assets/stop-list', //数据资产管理-停用-批量停用
  DATA_ASSETS_DATADETAILS = 'data-assets/datadetails/', //数据资产管理-详情-编辑
  ADD_ATIRECTORY_LIST = 'data-assets-directory/add-directory-list', //数据资产-增加
  DATA_ASSESTS_DIRECTORY_GET_DIRECTORY_LISTS = 'data-assets-directory/get-directory-lists', //数据资产表目录
  DATA_ASSESTS_DIRECTORY_ADD_DIRECTORY_LISTS = 'data-assets-directory/add-directory-list', //增加数据资产表
  DATA_ASSESTS_DIRECTORY_UPDATE_DIRECTORY_LISTS = 'data-assets-directory/update-directory-list', //修改数据资产表
  DATA_ASSESTS_DIRECTORY_DELETE = 'data-assets-directory/delete', //删除数据资产表
  DATA_ASSESTS_ADD = 'data-assets/add', //数据资产表基础信息-增加(跳转的页面)
  DATA_ASSESTS_UPDATE = 'data-assets/update', //数据资产表基础信息-修改(跳转的页面)
  DATA_ASSESTS_UPDATASTATUS = '/data-assets/updatastatus', //数据库资产管理-修改状态

  INTERFACE_INFO_GEIINTERFACEINFOLIST = '/interface-info/geiinterfaceinfolist', //接口管理-查询
  INTERFACE_INFO_MODIFY_INFOLIST = '/interface-info/modify-infolist', //接口管理-修改状态
  INTERFACE_INFO_DEL_INFO = '/interface-info/del-info', //接口管理-删除
  INTERFACE_INFO_GET_ALLCATEGORY = '/interface-info/get-allcategory', //接口管理-目录获取
  INTERFACE_INFO_ADD_INFO = 'interface-info/add-info', //接口管理新增基本信息
  INTERFACE_INFO_GET_ALL_CATEGORY = 'interface-info/get-allcategory', //查询接口目录
  INTERFACE_INFO_GET_INFOLISTALL = 'interface-info/get-infolistall',
  INTERFACE_CONFIG_GET_STOPWATCHVALUE = 'interface-config/get-stopwatchvalue', ////{sId}
  INTERFACE_INFO_ADD_CATEGORY = '/interface-info/add-category', //接口管理-目录新增
  INTERFACE_INFO_DEL_CATEGORY = '/interface-info/del-category', //接口管理-目录删除
  INTERFACE_INFO_UPDATE_CATEGORY = '/interface-info/update-category', //接口管理-目录修改
  INTERFACE_INFO_SORT_INFOLIST = '/interface-info/sort-infolist', //接口管理-批量分类
  INTERFACE_INFO_EIDT_INFO = 'interface-info/edit-info',
}
const _httpservice = new HttpService();
// 接口管理kx-查询码表码值全部数据
export const getstopwatchvalue = (sId: number): Promise<any> => _httpservice.getData({}, Api.GET_STOPWATCH_VALUE + `/${sId}`);
// 默认展示数据&&分页
export const getstopwatchlit = (params = {}): Promise<any> => _httpservice.getData(params, Api.STOP_WATCH_GET_WATCHLIST);

//新增码表
export const postaddstopwatch = (params = {}): Promise<any> => _httpservice.postData(params, Api.STOP_WATCH_POST_ADDSTOPWATCH);
//获得码值
export const getdetails = (sId: number): Promise<any> => _httpservice.getData({}, Api.STOP_WATCH_VALUE_GETDETAILS + `/${sId}`);
//单个发布
export const onerelease = (sId: number): Promise<any> => _httpservice.getData({}, Api.STOP_WATCH_PUBONE + `/${sId}`);
//单个删除
export const onedel = (sId: number): Promise<any> => _httpservice.getData({}, Api.STOP_WATCH_DEL + `/${sId}`);
//单个停用
export const onestop = (sId: number): Promise<any> => _httpservice.getData({}, Api.STOP_WATCH_STOPONE + `/${sId}`);
//更新码表
export const postUpdate = (params = {}): Promise<any> => _httpservice.postData(params, Api.STOP_WATCH_UPDATE);
//批量发布
export const allrelease = (params: number[]): Promise<any> => _httpservice.postData(params, Api.STOP_WATCH_PUBLIDST);
//批量停用
export const allstoplist = (params: number[]): Promise<any> => _httpservice.postData(params, Api.STOP_WATCH_STOPLIST);
//批量发布和停用
export const publishandstop = (params: object): Promise<any> => _httpservice.postData(params, Api.STOP_WATCH_UPDATASTATUS);

// 数据标准目录
//新增数据标准目录
export const adddirectory = (params: object): Promise<any> => _httpservice.postData(params, Api.DIRECTORY_STANDARD_ADD_DIRECTORY);
//查询枚举范围
export const getstopwatch = (params: object): Promise<any> => _httpservice.getData(params, Api.DIRECTORY_STANDARD_GET_STOP_WATCH);
//默认数据&分页%查询
export const getdirectory = (params = {}): Promise<any> => _httpservice.getData(params, Api.DIRECTORY_STANDARD_GET_DIRECTORYLIST);
//编辑数据
export const aqputdirectory = (params = {}): Promise<any> => _httpservice.putData(params, Api.DIRECTORY_STANDARD_UPDATE);
//修改状态  单个发布、停用 批量发布、停用
export const postUpdataStatus = (params = {}): Promise<any> => _httpservice.postData(params, Api.DIRECTORY_STANDARD_UPDATASTATUS);

//删除
export const deleteItem = (params: object): Promise<any> => _httpservice.deleteData(params, Api.DIRECTORY_STANDARD_DEL_DIRECTORY);
//新增数据库
export const adddatabase = (params = {}): Promise<any> => _httpservice.postData(params, Api.DATABASE_ADD_DATABASE);
//数据库管理-连通测试
export const databasetext = (params = {}): Promise<any> => _httpservice.postData(params, Api.DATABASE_TEXT);
//hk
//数据库管理-查询数据库列表
export const getdatabaselist = (sortStatus = {}): Promise<any> => _httpservice.getData(sortStatus, Api.DATABASE_GETDATABASELIAT);
// //数据库管理-发布
export const pubdatabase = (dbId: number): Promise<any> => _httpservice.putData({}, Api.DATABASE_databasePubdatabase + `/${dbId}`);
// //数据库管理-停用
export const stopdatabase = (dbId: number): Promise<any> => _httpservice.putData({}, Api.DATABASE_databaseStopdatabase + `/${dbId}`);
//数据库管理-状态发布，停用，批量
export const updatadbstatus = (params = {}): Promise<any> => _httpservice.postData(params, Api.DATABASE_UPDATADBSTATUS);
//数据库管理-删除
export const deldatabase = (dbId: number) => _httpservice.deleteData({}, Api.DATABASE_deldatabase + `/${dbId}`);
//数据库管理-编辑
export const databaseupdate = (params = {}) => _httpservice.postData(params, Api.DATABASE_DATABASE_UPDATE);

//数据资产管理-查询资产表
export const getassetstable = (params = {}) => _httpservice.getData(params, Api.DATA_ASSETS_GET_ASSETS_TABLE);
//数据资产管理-删除资产表
export const dataassetsdelete = (aId: number) => _httpservice.deleteData({}, Api.DATA_ASSETS_DELETE + `/${aId}`);
// //数据资产管理-发布、批量发布
export const dataassetspublist = (params = []) => _httpservice.putData(params, Api.DATA_ASSETS_PUB_LIST);
// //数据资产管理-停用、批量停用
export const dataassetsstoplist = (params = []) => _httpservice.putData(params, Api.DATA_ASSETS_STOP_LIST);
//数据库资产-状态发布,发布，停用，批量
export const dataassetsupdatastatus = (params = {}) => _httpservice.postData(params, Api.DATA_ASSESTS_UPDATASTATUS);
//数据资产管理-详情
export const dataassetsdatadetails = (aId: any) => _httpservice.getData({}, Api.DATA_ASSETS_DATADETAILS + `/${aId}`);
//数据资产管理目录-增加
export const adddirectorylist = (params = {}) => _httpservice.postData(params, Api.ADD_ATIRECTORY_LIST);
// 数据资产管理
//查询数据资产表目录/查询编辑时所属目录
export const aqgetdirectorylists = (params = {}): Promise<any> => _httpservice.getData(params, Api.DATA_ASSESTS_DIRECTORY_GET_DIRECTORY_LISTS);
//增加数据资产表
export const aqadddirectory = (params: {}): Promise<any> => _httpservice.postData(params, Api.DATA_ASSESTS_DIRECTORY_ADD_DIRECTORY_LISTS);
//修改数据资产目录表
export const aqupdatedirectory = (params: {}): Promise<any> => _httpservice.putData(params, Api.DATA_ASSESTS_DIRECTORY_UPDATE_DIRECTORY_LISTS);
//删除
export const aqdeldirectory = (adId: number): Promise<any> => _httpservice.deleteData({}, Api.DATA_ASSESTS_DIRECTORY_DELETE + `/${adId}`);
//增加数据资产表基础信息(跳转的页面)
export const kxdataassetsadd = (params: {}): Promise<any> => _httpservice.postData(params, Api.DATA_ASSESTS_ADD);
//编辑数据资产表基础信息(跳转的页面)
export const kxdataassetsupdate = (params: {}): Promise<any> => _httpservice.putData(params, Api.DATA_ASSESTS_UPDATE);

//接口管理-查询
export const geiinterfaceinfolist = (params: {}): Promise<any> => _httpservice.getData(params, Api.INTERFACE_INFO_GEIINTERFACEINFOLIST);
//接口管理-修改状态
export const modifyinfolist = (params: {}): Promise<any> => _httpservice.postData(params, Api.INTERFACE_INFO_MODIFY_INFOLIST);
//接口管理-状态-删除
export const interfaceinfodelinfo = (imId: number): Promise<any> => _httpservice.deleteData({}, Api.INTERFACE_INFO_DEL_INFO + `/${imId}`);
//接口管理—目录获取
export const interfaceInfoGetAllcategory = () => _httpservice.getData({}, Api.INTERFACE_INFO_GET_ALLCATEGORY);
//接口管理-新增基本信息
export const interfaceAddInfo = (params: object): Promise<any> => _httpservice.postData(params, Api.INTERFACE_INFO_ADD_INFO);
//接口管理-查询接口，=目录
export const getAllCategory = (params = {}): Promise<any> => _httpservice.getData(params, Api.INTERFACE_INFO_GET_ALL_CATEGORY);
// 根据接口id查询信息-用于编辑
export const getInfoListAll = (imId: number): Promise<any> => _httpservice.getData({}, Api.INTERFACE_INFO_GET_INFOLISTALL + `/${imId}`);
export const getstopWatchValforsId = (sId: number): Promise<any> => _httpservice.getData({}, Api.INTERFACE_CONFIG_GET_STOPWATCHVALUE + `/${sId}`);

//接口管理-目录新增
export const interfaceInfoAddCategory = (params: {}): Promise<any> => _httpservice.postData(params, Api.INTERFACE_INFO_ADD_CATEGORY);
//接口管理-目录删除
export const interfaceInfoDelCategory = (i_id: any) => _httpservice.deleteData({}, Api.INTERFACE_INFO_DEL_CATEGORY + `?i_id=${i_id}`);
//接口管理-目录修改
export const interfaceInfoUpdateCategory = (params: {}) => _httpservice.postData(params, Api.INTERFACE_INFO_UPDATE_CATEGORY);
//接口管理-目录分类修改
export const interfaceInfoSortInfolist = (params: {}) => _httpservice.postData(params, Api.INTERFACE_INFO_SORT_INFOLIST);
//接口管理编辑
export const interfacePut = (params: {}) => _httpservice.putData(params, Api.INTERFACE_INFO_EIDT_INFO);
