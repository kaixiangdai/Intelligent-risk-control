import Index from '@/pages/Index.vue';
export default [
  {
    path: '/',
    component: Index,
    redirect: '/one',
  },
  //数据资源管理
  {
    path: '/one',
    component: Index,
    redirect: '/one/test1',
    meta: {
      title: '数据资源管理',
    },
    children: [
      {
        path: 'test1',
        component: () => import('../../pages/data_source_mgmt/InterfaceMgmt.vue'),
        meta: {
          title: '接口管理',
        },
      },
      {
        path: 'manualRegistration', //人工注册
        component: () => import('../../pages/data_source_mgmt/ManualRegistration.vue'),
        // meta: {
        //   title: '',
        // },
      },
      {
        path: 'test2',
        component: () => import('../../pages/data_source_mgmt/Database.vue'),
        meta: {
          title: '数据库管理',
        },
      },
    ],
  },
  //数据标准管理
  {
    path: '/two',
    component: Index,
    meta: {
      title: '数据标准管理',
    },
    children: [
      {
        path: 'test3',
        component: () => import('../../pages/table_management/DataStandardsCatalog.vue'),
        meta: {
          title: '数据标准目录',
        },
      },
      {
        path: 'test4',
        component: () => import('../../pages/table_management/TableMgmt.vue'),
        meta: {
          title: '码表管理',
        },
      },
    ],
  },
  //数据资产管理
  {
    path: '/three',
    component: Index,
    redirect: '/three/test5',
    meta: {
      title: '数据资产管理',
    },
    children: [
      {
        path: 'test5',
        component: () => import('../../pages/assetmanagement/AssetManagement.vue'),
        meta: {
          title: '数据资产目录',
        },
      },
      {
        path: 'AssetManagementInput',
        component: () => import('../../pages/assetmanagement/AssetManagementInput.vue'),
        meta: {
          title: '数据资产新增',
        },
      },
    ],
  },
  //脚本管理
  {
    path: '/four',
    component: Index,
    meta: {
      title: '脚本管理',
    },
    children: [
      {
        path: 'test6',
        component: () => import('../../pages/Test6.vue'),
        meta: {
          title: '测试页面6',
        },
      },
    ],
  },
  //任务管理
  {
    path: '/five',
    component: Index,
    meta: {
      title: '任务管理',
    },
    children: [
      {
        path: 'test7',
        component: () => import('../../pages/Test7.vue'),
        meta: {
          title: '测试页面7',
        },
      },
    ],
  },
];
