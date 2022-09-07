import { message } from 'ant-design-vue';
import axios from 'axios';
// const service = 'http://120.48.72.17:9900';
const service = 'http://8.130.19.70:9900';
// const service = 'http://120.48.72.17:8500';
export default class HttpService {
  public axios: any;
  public modal: any;

  constructor() {
    // 获取axios实例
    this.axios = new Interceptors().getInterceptors();
  }

  //get请求8500
  public getData(params: object, operation: string) {
    const url = service + '/' + operation;
    return new Promise((resolve, reject) => {
      this.axios
        .get(url, {
          params: params,
        })
        .then((res: any) => {
          this.resultHandle(res, resolve);
        })
        .catch((err: any) => {
          reject(err.message);
        });
    });
  }

  //post请求
  public postData(params: any, operation: string) {
    const url = service + '/' + operation;
    return new Promise((resolve, reject) => {
      this.axios
        .post(url, params)
        .then((res: any) => {
          this.resultHandle(res, resolve);
        })
        .catch((err: any) => {
          reject(err.message);
        });
    });
  }

  //delete请求
  public deleteData(params: any, operation: string) {
    const url = service + '/' + operation;
    return new Promise((resolve, reject) => {
      this.axios
        .delete(url, { data: params })
        .then((res: any) => {
          this.resultHandle(res, resolve);
        })
        .catch((err: any) => {
          reject(err.message);
        });
    });
  }

  //put请求
  public putData(params: any, operation: string) {
    const url = service + '/' + operation;
    return new Promise((resolve, reject) => {
      this.axios
        .put(url, params)
        .then((res: any) => {
          this.resultHandle(res, resolve);
        })
        .catch((err: any) => {
          reject(err.message);
        });
    });
  }

  /**
   * @param res
   * @param resolve
   */
  public resultHandle(res: any, resolve: any) {
    if (res.code == 100200 || res.code == null) {
      //null为文件下载
      resolve(res);
    } else {
      this.errorHandle(res);
    }
  }

  /**
   * 服务端状态处理,例如中断性异常,退出异常等等(与拦截器http握手状态注意区分,一般都能分清楚吧)
   * @param res
   */
  public errorHandle(res: any) {
    message.warn(res.msg); // 统一谈服务端提示,我们提示统一由服务端提供
  }
}

// 拦截器
class Interceptors {
  public instance: any;

  constructor() {
    // 创建axios实例
    this.instance = axios.create({ timeout: 1000 * 12 });
    // 初始化拦截器
    this.initInterceptors();
  }

  // 为了让http.ts中获取初始化好的axios实例
  public getInterceptors() {
    return this.instance;
  }

  // 初始化拦截器
  public initInterceptors() {
    // 设置post请求头
    this.instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    /**
     * 请求拦截器
     * 每次请求前，如果存在token则在请求头中携带token
     */
    // this.instance.interceptors.request.use(
    //   (config: any) => {
    // 登录流程控制中，根据本地是否存在token判断用户的登录情况
    // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
    // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
    // if (config.headers.isJwt) {
    //   const token = localStorage.getItem('id_token');
    //   if (token) {
    // config.headers.Authorization = 'Bearer ' + token;
    //   }
    // }
    // return config;
    //   },
    //   (error: any) => {
    // console.log(error);
    //   },
    // );

    // 响应拦截器
    this.instance.interceptors.response.use(
      // 请求成功
      (res: any) => {
        if (res.status === 200) {
          return Promise.resolve(res.data);
        } else {
          this.errorHandle(res);
          return Promise.reject(res.data);
        }
      },
      // 请求失败
      (error: any) => {
        const { response } = error;
        if (response) {
          // 请求已发出，但是不在2xx的范围
          this.errorHandle(response);
          return Promise.reject(response.data);
        } else {
          // 处理断网的情况
          // eg:请求超时或断网时，更新state的network状态
          // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
          // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
          message.warn('网络连接异常,请稍后再试!');
        }
      },
    );
  }

  /**
   * http握手错误
   * @param res  响应回调,根据不同响应进行不同操作
   */
  private errorHandle(res: any) {
    // 状态码判断
    switch (res.data.code) {
      case 100500:
        message.warn('系统异常');
        break;
      case 100401:
        message.warn('请求参数错误');
        break;
      case 100404:
        message.warn('请求的资源或服务为找到');
        break;
      default:
        message.warn('连接超时');
    }
  }
}
