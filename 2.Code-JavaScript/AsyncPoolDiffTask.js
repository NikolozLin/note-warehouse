'use strict'

class LimitPromise {
  constructor (max) {
    this._max = max
    this._count = 0
    this._taskQueue = []
  }

  /**
   * 调用器，将异步任务函数和它的参数传入
   * @param caller 异步任务函数，它必须是async函数或者返回Promise的函数
   * @param args 异步任务函数的参数列表
   * @returns {Promise<unknown>} 返回一个新的Promise
   */
  call (caller, ...args) {
    return new Promise((resolve, reject) => {
      const task = this._createTask(caller, args, resolve, reject)
      if (this._count >= this._max) {
        console.log('并发量过大，推入等待队列！ 当前数量-->', this._taskQueue.length)
        this._taskQueue.push(task)
      } else {
        task()
      }
    })
  }

  /**
   * 创建一个任务
   * @param caller 实际执行的函数
   * @param args 执行函数的参数
   * @param resolve
   * @param reject
   * @returns {Function} 返回一个任务函数
   * @private
   */
  _createTask (caller, args, resolve, reject) {
    const attempt = () => {
      caller(...args)
        .then(resolve)
        .catch(() => {
          //可以在这里做错误重试的业务
          // reject()
        }).finally(() => {
          this._count--
          if (this._taskQueue.length) {
            console.log('去除任务队列 任务， 当前队列大小--》', this._taskQueue.length)
            const task = this._taskQueue.shift()
            task()
          }
        })
        // 执行任务 总计加1
      this._count++
    }
    return attempt
  }

  // _retryTask (caller, args, resolve, reject) {

  // }
}

module.exports = LimitPromise
