//////////////// 
//局部应用则是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。


function partial(fn,...args){
    const args= args||[];

    return function(){
        let position=0;//占位符位置
        let len =args.length;
        for (let i = 0; i < len; i++) {

            args[i]= args[i]==='_'? arguments[position++]:args[i]
        }
        while(position<arguments.length) args.push(arguments[position++]); //剩余参数

        return fn.apply(this,args)
    }

}