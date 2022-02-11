# Vue 3.2` <script setup>` 的使用

## 基本语法

- 普通使用，在option api 添加setup方法

  ```html
  <script>
  import { ref, computed } from 'vue'
  
  export default {
    setup() {
      const name = ref('')
      const isNamePresent = computed(() => name.value.length > 0)
  
      function submitName() {
        console.log(name.value)
      }
  
      return {
        name,
        isNamePresent,
        submitName
      }
    }
  }
  </script>
  ```
  
- 直接使用 `<script setup>`, 模板直接能用，不需要进行多一次return。即顶层的绑定（变量、函数声明、i吗，port引入的内容）可以再接再模板中使用。

  ```html
  <template>
    <div>Hello, {{ name }}!</div>
    <input v-model="name" />
    <button :disabled="!isNamePresent" @click="submitName">Submit</button>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const name = ref('')
  const isNamePresent = computed(() => name.value.length > 0)
  
  function submitName() {
    console.log(name.value)
  }
  </script>
  ```
  

## 响应式

响应式的状态创建，需要使用响应式APIs（ref、reactive 等）。

## 组件的使用

`<script setup>`中引入的组件可以直接在template中使用，不用 在component中定义多一次。并且使用该组件推荐是用驼峰式的写法。更好与原生自定义元素进行区分

```html
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <MyComponent />
</template>
```

- 动态组件

  `<script setup>`中动态组件使需要  :is  来绑定, 下面的组件在三院表达式中 给当成变量进行使用。

  ```html
  <script setup>
  import Foo from './Foo.vue'
  import Bar from './Bar.vue'
  </script>
  
  <template>
    <component :is="Foo" />
    <component :is="someCondition ? Foo : Bar" />
  </template>
  ```

- 递归组件

  当文件组件可以通过自己的==文件名==被其自己使用。 例如 文件名为==FooBar.vue==的组件，可以在模板中用==<FooBar/>== 引用自己。

  上面这种方式 的优先级比==import== 引入的组件优先级低，如果命名冲突了 可以使使用下面的方式进行引入。

  ```js
  import {FooBar as FooBarChild} from'./components
  ```
  
- 命名空间组件

   用带点的组件标记，例如==<Foo.bar>== 来引用嵌套在对象属性中的组件。当需要从一个单文件到处多个组件时候非常有用

  ```html
  <script setup>
  import * as Form from './form-components'
  </script>
  
  <template>
    <Form.Input>
      <Form.Label>label</Form.Label>
    </Form.Input>
  </template>
  ```

  ​                                                                        

## 使用自定义指令

全局注册的指令以符合预期的方式工作， 本地注册的指令可以直接在模板中使用。

但是在使用时必须以 ==vNameDirective== 的形式命名本地指令， 这样才能直接在模板中使用。

````html
<script setup>
const vMyDirective = {
  //钩子函数
  beforeMount: (el) => {
    // 在元素上做些操作
  }
}
</script>
<template>
  <h1 v-my-directive>This is a Heading</h1>
</template>
````

或者可以在js文件导入，但是需要重新命名

```html
<script setup>
  // 导入的指令同样能够工作，并且能够通过重命名来使其符合命名规范
  import { myDirective as vMyDirective } from './MyDirective.js'
</script>
```



## defineProps  和 defineEmits

在==<script setup>==  使用defineProps 和defineEmits 来定义原先optionApi中的 Props 和 Emits。

```html
<script setup>
const props = defineProps({
  foo: String
})

const emit = defineEmits(['change', 'delete'])
// setup code
</script>
```

- defineProps 和defineEmits  无需引入 单需要在 ==<script setup>== 中使用，且编译的时候会给一起处理掉。
- defineProps 和defineEmits 选项传入后，会自动提供恰当的类型推断 

- 传入defineProps 和defineEmits 选项，会从setup提升的模块的范围。所以传入的选项不能是在setup 范围声明的局部变量。这样会引起编译错误。 但是可以引用import进来的绑定，他们也在模块范围。

### 使用TypeScirpt 进行定义props emits


  ```typescript
  // Typescript 写法
  const props=defineProps<{
    foo:string,
    bar?:number
  }>()
  const emit=defineEmits<{
    (e:'change',id:number):void,
  	(e:'update',value:string):void
  }>()
  ```

- 使用Ts 写法和非ts 写法不能同时存在，否则编译错误。

- 暂时不支持复杂类型 和从 其他文件导入类型。

- 可以使用 withDefaultes 给Props设定默认值

  ```typescript
  interface Props {
    msg?: string
    labels?: string[]
  }
  
  const props = withDefaults(defineProps<Props>(), {
    msg: 'hello',
    labels: () => ['one', 'two']
  })
  ```

  ## defineExpose 

  使用==<script setup>== 的默认不暴露内部的声明绑定，即 无法通过`ref` 和 $parent 链获取组件公开的实例。如果明确需要暴露出属性用==defineExpose==包裹，父亲组件通过模板的ref 获得实例。

  ````html
  <script setup>
  import { ref } from 'vue'
  const a = 1
  const b = ref(2)
  defineExpose({
    a,
    b
  })
  </script>
  ````

  ## useSlot 和useAttrs

  在 `<script setup>` 使用 `slots` 和 `attrs` 的情况应该是很罕见的，因为可以在模板中通过 `$slots` 和 `$attrs` 来访问它们。在你的确需要使用它们的罕见场景中，可以分别用 `useSlots` 和 `useAttrs` 两个辅助函数：

  ```html
  <script setup>
  import { useSlots, useAttrs } from 'vue'
  const slots = useSlots()
  const attrs = useAttrs()
  </script>
  ```

  `useSlots` 和 `useAttrs` 是真实的运行时函数，它会返回与 `setupContext.slots` 和 `setupContext.attrs` 等价的值，同样也能在普通的组合式 API 中使用。

  ##  `<script setup>` 可以和普通的`<script>` 一起使用

  具体看文档

  ## 顶成的await

  看文档 ，setup 变味async setup 但是使用组件的时候需要用`<Suspense>` 包裹

