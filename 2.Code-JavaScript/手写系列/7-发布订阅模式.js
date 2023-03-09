class EventEmitter {

    constructor() {
        this.cache = [];
    }

    on(name, fn) {
        if (this.cache[name]) {
            this.cache[name].push(fn)
        } else {
            this.cache[name] = [fn]
        }
    }

    remove(name, fn) {
        if (this.cache[name]) {
            let index = this.cache[name].findIndex(f => f === fn);
            if (index >= 0) this.cache[name].splice(index, 1);
        }
    }

    emit(name,...args){
        if(this.cache[name]){
           const task = this.cache[name]
           task.forEach((cb)=> cb.apply(this,args))
        }
    }
}

// 测试
let eventBus = new EventEmitter()
let fn1 = function(name, age) {
	console.log(`${name} ${age}`)
}
let fn2 = function(name, age) {
	console.log(`hello, ${name} ${age}`)
}
eventBus.on('aaa', fn1)
eventBus.on('aaa', fn2)
eventBus.emit('aaa', 'koki', 12)
// '布兰 12'
// 'hello, 布兰 12'