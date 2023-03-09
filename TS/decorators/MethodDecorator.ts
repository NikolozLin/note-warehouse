


const methodDecorator:MethodDecorator=(...args:any[])=>{
    // args[0] 是原型对象
    args[0].name='xxx'

}


class User{

    @methodDecorator
    public show(){}
}


console.log(new User().name);
