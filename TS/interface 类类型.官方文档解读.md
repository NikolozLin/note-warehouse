### 1. 类类型接口

用来强制类符合某些规定。

1. 使用 interface 来定义公共变量，具体的类 implement 该接口

```typescript
interface ClockInterface { 
    currentTime: Date;
}

class Clock implements ClockInterface {
    currentTime: Date;
    constructor(h: number, m: number) { }
}
```

### 2. 类类型 中 静态部分类型 、 实例部分类型

一个类包含两种类型，静态类型、实例类型。

当一个类实现了一个接口时，只对其实例部分进行类型检查

```typescript
interface ClockInterface {
    currentTime: Date; //实例部分
    setTime(d: Date); // 实例部分
}

class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { } //构造器 静态部分类型
}

```

1. 实例部分：

   上面官方例子中，实例部分类型一般指的是 通过 Clock 这个类 实例化（new Clock ）出的对象，需要包含interface 中包含的属性。

2. 静态部分：

   类Clock 中 constructor 

---

### 3. 类不能直接实现静态部分的接口 

如果直接让那个类 实现 具有静态类型的interface 就会报错，如下

```typescript
// 有new，就是有构造器签名，就是静态类型的接口，所以不能被类直接实现，会报错
interface ClockConstructor { 
    new (hour: number, minute: number);
}

class Clock implements ClockConstructor {
    currentTime: Date;
    constructor(h: number, m: number) { }
}

```



---

### 4. 类 实现含有静态类型的interface 要怎么搞

```typescript
// 静态部分接口
interface ClockConstructor {
    new (hour: number, minute: number): ClockInterface;
}
// 实例部分接口
interface ClockInterface {
    tick();
}

// 第一个参数ctor的类型是接口 ClockConstructor，在这里就为类的静态部分指定需要实现的接口
function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}



// 这里 implements ColocInterface 不是 DiaitalClock本身（类的静态部分）应该符合接口规则<---
// 而是 --->类 DigitalClock 实例化出来的对象（类的实例部分）应该满足这个接口的规则<---
// 那么怎么要求这个类（函数）符合某个接口的规则？
class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("beep beep");
    }
}
class AnalogClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("tick toc");
    }
}

let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 7, 32);

```



