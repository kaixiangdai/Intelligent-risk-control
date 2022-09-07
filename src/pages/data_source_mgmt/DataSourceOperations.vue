<template>
  <div>
    <a-modal v-model:visible="Flag" :centered="true" :footer="null" @cancel="cancel">
      <!-- 添加数据库的部分 -->
      <div>
        <a-form ref="formRef" :rules="rules" :model="infoMysql" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" autocomplete="off">
          <a-form-item label="数据库类型" name="dbType">
            <a-select v-model:value="infoMysql.dbType" :options="dbTypeOptions" :disabled="disableFlag"></a-select>
          </a-form-item>
          <a-form-item label="数据源名称" name="dbName">
            <a-input v-model:value="infoMysql.dbName" show-count :maxlength="30" />
          </a-form-item>
          <a-form-item label="数据源描述" name="dbDepict">
            <a-input v-model:value="infoMysql.dbDepict" show-count :maxlength="200" />
          </a-form-item>
          <a-form-item label="JDBC URL:" name="jdbcUrl">
            <a-row>
              <a-col :span="22">
                <a-input v-model:value="infoMysql.jdbcUrl" show-count :maxlength="200" />
              </a-col>
              <a-col>
                <a> <question-circle-filled style="margin-top: 6px; font-size: 22px" title="jdbc:mysql://rm-bp138f17dm76a8i0apo.mysql.rds.aliyuncs.com:3306/reggie_takeout" /></a>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="驱动类名:" name="driverClassname">
            <a-input v-model:value="infoMysql.driverClassname" show-count :maxlength="30" />
          </a-form-item>
          <a-form-item label="用户名:" name="username">
            <a-input v-model:value="infoMysql.username" />
          </a-form-item>
          <a-form-item label="密码:" name="password">
            <a-input v-model:value="infoMysql.password" />
          </a-form-item>
          <a-button class="text-btn" size="small" type="primary" @click="connected">连通测试</a-button>
          <a-form-item :wrapper-col="{ offset: 9, span: 16 }">
            <a-button @click="cancel">取消</a-button>　
            <a-button type="primary" @click="submitData">确认</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { adddatabase, databasetext, databaseupdate } from '@/api/aq/index';
  import { PropType } from 'vue';
  import { SelectProps, Form, message } from 'ant-design-vue';
  const useForm = Form.useForm;
  const props = defineProps({
    editShow: {
      type: Boolean,
      default: false,
    },
    faData: {
      type: Object as PropType<typeof infoMysql.value>,
      default: () => ({}),
    },
  });
  const emit = defineEmits(['cancel', 'confirm']);
  const Flag = ref<boolean>(true);
  const formRef = ref();
  const cancel = () => {
    emit('cancel');
  };
  //页面数据
  const infoMysql = ref({
    dbId: undefined,
    dbType: '',
    dbName: '',
    dbDepict: '',
    jdbcUrl: '',
    driverClassname: '',
    username: '',
    password: '',
  });
  const rules = {
    //里面写效验规则
    dbType: { required: true, message: '请选择', trigger: ['blur', 'change'] },
    dbName: { required: true, max: 30, message: '不能为特殊字符且长度最大为30', pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, trigger: ['blur', 'change'] },
    dbDepict: { max: 200, message: '长度需为200之内', trigger: ['blur', 'change'] },
    jdbcUrl: { required: true, max: 200, message: '长度需为200之内,必填', trigger: ['change'] },
    driverClassname: [
      { required: true, max: 30, message: '长度需为300之内,必填', trigger: ['change'] },
      { pattern: '^[^\s]*$', message: '不能空格开头', trigger: ['blur'] },
    ],
    username: { required: false, message: '必填', trigger: ['blur', 'change'] },
    password: {
      required: false,
      // pattern: new RegExp(/((?=.*\d)(?=.*\D)|(?=.*[a-zA-Z])(?=.*[^a-zA-Z]))(?!^.*[\u4E00-\u9FA5].*$)^\S{0,10}$/),
      // message: '密码至少包含数字，字母和字符的两种组合，长度在0-10之间',
      message: '必填',
      trigger: ['blur', 'change'],
    },
  };
  const submitData = async () => {
    try {
      rules.username.required = false;
      rules.password.required = false;
      rules.dbType.required = true;
      rules.dbName.required = true;
      //改变状态
      await formRef.value.validate();
      if (props.editShow == false) {
        //编辑状态
        await confirm(databaseupdate);
      } else {
        await confirm(adddatabase);
      }
      // console.log('values', infoMysql, toRaw(infoMysql));
    } catch (error: any) {
      console.log('error', error);
    }
  };

  const { resetFields } = useForm(infoMysql.value);
  const dbTypeOptions = ref<SelectProps['options']>([
    { value: 'Mysql', label: 'Mysql' },
    { value: 'Oracl', label: 'Oracl' },
  ]);
  //监听获得数据
  const disableFlag = ref();
  watch(
    props.faData,
    nvalue => {
      if (props.editShow == false) {
        //编辑状态
        for (let key in infoMysql.value) {
          infoMysql.value[key] = nvalue[key];
        }
        disableFlag.value = true;
      } else {
        resetFields();
      }
    },
    { deep: true, immediate: true },
  );
  //修改databaseupdate
  //添加adddatabase
  const confirm = async (interfaceParameters: any) => {
    try {
      await interfaceParameters(infoMysql.value);
      //自动进行拦截
      emit('confirm');
    } catch (error) {
      console.log(error);
    }
  };
  //连通测试
  const connected = async () => {
    try {
      rules.username.required = true;
      rules.password.required = true;
      rules.dbType.required = false;
      rules.dbName.required = false;
      //切换表单规则
      await formRef.value.validate();
      connectedAxios();
    } catch (error) {
      console.log(error);
    }
  };
  //发送消息
  const connectedAxios = async () => {
    let connected = {
      jdbcUrl: infoMysql.value.jdbcUrl,
      driverClassname: infoMysql.value.driverClassname,
      username: infoMysql.value.username,
      password: infoMysql.value.password,
    };

    // let connected = {
    //   jdbcUrl: 'jdbc:mysql://rm-bp138f17dm76a8i0apo.mysql.rds.aliyuncs.com:3306/reggie_takeout',
    //   driverClassname: 'com.mysql.cj.jdbc.Driver',
    //   username: 'reggie',
    //   password: '2196587899Zxc',
    // };
    let res = await databasetext(connected);
    if (res.msg != '连通测试失败') {
      message.success(res.msg, 1);
    } else {
      message.error(res.msg, 1);
    }
  };
</script>
<style scoped lang="less">
  .text-btn {
    margin-left: 40px;
  }
</style>
