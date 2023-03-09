function render(template,data){
    const reg=/\{(\w+)\}/;

    if(reg.test(template)){
        const name = reg.exec(template)[1]; 
        template = template.replace(reg, data[name]);
        return render(template, data); 
    }
    return template
}

function render2(template,data){
    const reg=/\{\{(\w+)\}\}/ig;

    return template.replace(reg,(match, p1,offset, string) =>{
        console.log(p1)
        return   p1 in data?data[p1]:''
    })
}

let template = '我是{{name}}，年龄{{age}}，性别{{sex}}';
let person = {
    name: '布兰',
    age: 12
}
console.log(render2(template, person)); // 我是布兰，年龄12，性别undefined

