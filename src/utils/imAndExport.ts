import axios from 'axios';
import { message } from 'ant-design-vue';
import { fileParse } from './fileParse';

//导出
export const exportFile = async () => {
  const url = 'http://8.130.19.70:9900/directory-standard/exportExcel';
  try {
    const res = await axios({
      url: url,
      method: 'post',
      responseType: 'arraybuffer',
    });
    //将数据转为blob二进制类型
    const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
    //将blob转为下载地址
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', fileUrl);
    a.setAttribute('download', '模板.xlsx');
    a.click();
  } catch (e) {
    console.log(e);
  }
};
//导入
export const importFile = async (file: any, basicUrl: any, type?: any) => {
  // const url = 'http://8.130.19.70:9900/directory-standard/importExcel';
  try {
    if (!file) return false;

    //判断类型
    if (!/(openxmlformats-officedocument.spreadsheetml.sheet|ms-excel)/i.test(file.type)) {
      message.info('文件格式不正确,请导入 .xlsx 或 .xls文件');
      return false;
    }

    //判断大小
    if (file.size > 200 * 1024 * 1024) {
      message.info('文件过大，不能超过200M!');
      return false;
    }

    //处理文件
    const resPromise = await fileParse(file, type);
    //写入服务器
    const res = await axios.post(
      basicUrl,
      {
        excelFile: resPromise,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    message.success(res.data.msg);
  } catch (e) {
    console.log(e);
  }
};
