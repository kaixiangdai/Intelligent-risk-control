export const fileParse = (file: any, type = 'buffer') => {
  return new Promise(resolve => {
    const fileReader = new FileReader();
    if (type === 'base64') fileReader.readAsDataURL(file); //base64类型
    else if (type === 'buffer') fileReader.readAsArrayBuffer(file); //buffer类型
    else if (type === 'string') fileReader.readAsBinaryString(file); //二进制类型
    fileReader.onload = (e: any) => {
      resolve(e.target.result);
    };
  });
};
