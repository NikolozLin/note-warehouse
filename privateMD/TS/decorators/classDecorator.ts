
// 类装饰器
// 可以为 function 或下面的形式
//这里的 target 就是使用 装饰器 的类名 
const moveDecorator:ClassDecorator=(target:Function)=>{

    target.prototype.getPosition =():{x:number,y:number}=>{
        return   {x:100,y:200}
    }

}

//装饰器的叠加

const MusicDecorator:ClassDecorator=(target:Function)=>{
    target.prototype.playMusic  = ():void=>{
        console.log('播放音乐');
        
    }
}

@moveDecorator
@MusicDecorator
class Tank{}

@moveDecorator
class Player{}