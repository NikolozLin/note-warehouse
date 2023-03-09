//并发控制池

/**
 * 
 * @param {number} poolLimit  
 * @param {*} array 每次请求的参数
 * @param {*} iteratorFn 迭代函数，将会吧arry的数组项作为参数传入iteratorFn 
 * @returns 
 */
async function asyncPoolES7(poolLimit, array, iteratorFn) {

    const ret = []; //存储所有的异步任务
    const executing = []; //存储正在进行的任务

    for (const item of array) {
        // 调用iteratorFn创建异步任务
        const p = Promise.resolve.then(() => iteratorFn(item, array))
        ret.push(p)
        //如果poolLimit数小于或者等于任务数量，进行并发控制
        if (poolLimit <= array.length) {
            // 任务执行后，从正在执行队列移除已经完成的任务
            const e = p.then(() => executing.splice(executing.indexOf(e), 1))
            executing.push(e) //保存正在执行的的任务
            if (executing.length >= poolLimit) {
                await Promise.race(executing) // 等待全部正在执行的任务，当其中一个完成后进行下次循环。
            }
        }
    }
    return Promise.all(ret)
}


function asyncPoolES6(poolLimit, array, iteratorFn) {
    let i = 0;
    const ret = []; // 存储所有的异步任务
    const executing = []; // 存储正在执行的异步任务
    const enqueue = function () {
        if (i === array.length) {
            return Promise.resolve();
        }
        const item = array[i++]; // 获取新的任务项
        const p = Promise.resolve().then(() => iteratorFn(item, array));
        ret.push(p);

        let r = Promise.resolve();

        // 当poolLimit值小于或等于总任务个数时，进行并发控制
        if (poolLimit <= array.length) {
            // 当任务完成后，从正在执行的任务数组中移除已完成的任务
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                r = Promise.race(executing);
            }
        }

        // 正在执行任务列表 中较快的任务执行完成之后，才会从array数组中获取新的待办任务
        return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
}
