---
date created: 2022-06-27 16:38
date updated: 2022-07-07 11:48
---

1. url转base64

> 利用canvas.toDataURL

```js
function url2base64(url){
	return new Promise((resolve,reject)=>{
		let image= new Image()
		image.onload=function(){
			let canvas=document.createElement('canves');
			//设置原始高度
			canvas.width = this.naturalWidth；
			canvas.height = this.naturalHeight;
			canvas.getContext('2d').drawImage(image,0,0)
			//转blob的话 使用 canvas.toBlob()
			let result = canvas.toDataURL()
			resolve(result)
		}
		// CORS 策略，会存在跨域问题https://stackoverflow.com/questions/20424279/canvas-todataurl-securityerror
        image.setAttribute("crossOrigin",'Anonymous');
        image.src=url;
		image.onerror = () => {
          reject(new Error('urlToBase64 error'));
	      };
	})
}
```

2. base64转blob

```js
const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
function b64ToBlob(b64Data) {
	const b64Arr = b64Data.split(',');
	const mime = b64Arr[0].match(/:(.*?);/)[1];
	const byteCharaters = atob(b64Arr[2]);
	let len = byteCharaters.length;
	const u8arr = new Uint8Array(len);
	while (len--) {
		u8arr[len] = byteCharaters.charCodeAt(len);
	}
	return new Blob([u8arr], { type: mime });
}

// 数据url长度不吃超过 限制可以下面方法
function miniB64ToBlob(b64) {
	fetch(b64)
		.then((res) => res.blob())
		.then(console.log);
}

```

3. blob 转base64
> 原理：利用fileReader的readAsDataURL，将blob转为base64

```js
blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsDataURL(blob);
    fileReader.onerror = () => {
      reject(new Error('blobToBase64 error'));
    };
  });
}
```
