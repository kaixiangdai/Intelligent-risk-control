import axios from 'axios';

//获取本地图片
export function getAssetsImages(name: string): string {
  return new URL(`/src/assets/images/${name}`, import.meta.url).href;
}
//文件下载
export function exportExcel() {
  return new Promise((resolve, reject) => {
    axios({
      url: 'http://8.130.19.70:9900/stop-watch/exportExcel',
      method: 'post',
      responseType: 'arraybuffer',
    })
      .then((res: any) => {
        // console.log(res.headers['content-disposition'].split('=')[1]);
        // 创建Blob对象，设置文件类型
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });
        const downloadElement = document.createElement('a');
        const href = window.URL.createObjectURL(blob); // 创建下载的链接
        downloadElement.href = href;
        downloadElement.download = '码表.xlsx'; // 下载后文件名
        document.body.appendChild(downloadElement);
        downloadElement.click(); // 点击下载
        document.body.removeChild(downloadElement); // 下载完成移除元素
        window.URL.revokeObjectURL(href); // 释放掉blob对象
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}
//防抖
// export function debounce(fn:Function,wait:number){
//   var timer:any = null;
//   return function(){
//       if(timer !== null){
//           clearTimeout(timer);
//       }
//       timer = setTimeout(()=>{
//         fn&&fn();
//       },wait);
//   }
// }

// 遍历树形结构
interface treeinter {
  key?: string;
  title?: string;
  children?: object[];
}
//arr: object[]
//为了测试修改为any
export function aqtitle(arr: any, seldicy: string): any {
  //遍历树形结构根据key拿到title
  const str = '';

  if (!arr.length && !seldicy.length) return '';
  const stack: object[] = [];
  let aq: treeinter;
  for (aq of arr) {
    if (aq.key == seldicy.substring(0, 1)) {
      if (aq.key == seldicy) return aq.title + '';
      stack.push(aq);
      break;
    }
  }
  let item: any;
  let i = 1;
  while (stack.length) {
    item = stack.shift();
    let a: treeinter;
    for (a of item.children) {
      if (a.key?.substring(i, i + 1) == seldicy.substring(i, i + 1)) {
        if (a.key == seldicy) return a.title + '';
        stack.push(a);
        break;
      }
    }
    i++;
  }
}
//遍历树形结构拿到title数组
export function aqtreearr(arr: object[]): string[] {
  const titlearr: string[] = [];
  const stack: object[] = [];
  let i: treeinter;
  for (i of arr) {
    titlearr.push(i.title + '');
    if (i.children && i.children.length) stack.push(...i.children);
  }
  let item: any;
  while (stack.length) {
    item = stack.shift();
    let a: treeinter;
    titlearr.push(item.title);
    if (item.children && item.children.length) {
      for (a of item.children) {
        titlearr.push(a.title + '');
        if (a.children && a.children.length) stack.push(...a.children);
      }
    }
  }
  return titlearr;
}
//根据父亲级key添加子集目录
export function addtitle(arr: object[], key: string, newtitle: string) {
  //父级key,以及新添加文件的值,要修改的数组
  const arrs: object[] = JSON.parse(JSON.stringify(arr));
  const str = '';
  const stack: object[] = [];
  let aq: any;
  for (aq of arrs) {
    if (aq.key == key.substring(0, 1)) {
      if (aq.key == key) {
        aq.children.unshift({ title: newtitle, key: `${aq.key}${aq.children.length}`, children: [] });
        return arrs;
      }
      stack.push(aq);
      break;
    }
  }
  let item: any;
  let i = 1;
  while (stack.length) {
    item = stack.shift();
    let a: any;
    for (a of item.children) {
      if (a.key?.substring(i, i + 1) == key.substring(i, i + 1)) {
        if (a.key == key) {
          a.children.unshift({ title: newtitle, key: `${a.key}${a.children.length}`, children: [] });
          return arrs;
        }
        stack.push(a);
        break;
      }
    }
    i++;
  }
}
//1参数：输入的值  2参数：要限制输入的字符个数
// [\x00-\xff]匹配单字节字符
export const limitstr = (strval: string, strnum: number) => {
  let re = '';
  const strleng = strval.length;
  //返回字符串的总字节数
  const byteleng = strval.replace(/[^\x00-\xff]/g, '**').length;
  if (byteleng <= strnum) return strval;
  for (let i = 0, bytenum = 0; i < strleng; i++) {
    const byte = strval.charAt(i);
    if (/[\x00-\xff]/.test(byte)) {
      bytenum++; //单字节字符累加1
    } else {
      bytenum += 2; //非单字节字符累加2
    }
    if (bytenum <= strnum) {
      re += byte;
    } else {
      return re; //丢弃长度超出部分
    }
  }
};
//是否为JSON数据
export function isJSON(str: string): boolean {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
  return false;
}
