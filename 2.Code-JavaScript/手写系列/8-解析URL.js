









function parseURL(url) {
    const paramsStr = /.+\?(.+)$/.exec(url)[1];
    const paramsArr = paramsStr.split('&');
    const paramsObj = {};

    paramsArr.forEach(item => {
        if (/=/.test(item)) {
            let [key, value] = item.split('=');
            value = decodeURIComponent(value);// 解码
            value = /^\d+$/.test(value) ? parseFloat(value) : value;

            if (paramsObj.hasOwnProperty(key)) {
                paramsObj[key] = [].concat(paramsObj[key], value);

            } else {
                paramsObj[key] = value;

            }

        } else {
            paramsObj[item] = item;
        }
    });
    return paramsObj
}

console.log(parseURL('http://www.getui.com?user=superman&id=345&id=678&user=superman2'));
