# c++的编译过程

c++从源代码到输出可执行文件需要经过下面的几个过程。

1. 预编译（Preprocessing）
2. 编译（Compilation）
3. 汇编（Assemble）
4. 链接（Linking）

---

 **流程图**

|输入|源代码 `Source Code`(`.C`,`.h`,`.cpp`)|
|-|-|
|Step1:`Preprocessing`||
|Step2:`Compilation`||
|Step3:`Assemble`||
|Step4:`Linking`||
|||
---

## 1. 预处理 Preprocessing

预处理把所有的 `#include`头文件以及宏定义替换成其真正的内容，预处理之后得到的仍然是文本文件，但文件体积会大很多。gcc的预处理是预处理器cpp来完成的，你可以通过如下命令对test.c进行预处理：

```bash
gcc -E -I./inc test.c -o test.i
```

- `-E` ：是让编译器在预处理之后就退出，不进行后续编译过程；
- `-I` ：指定头文件目录，这里指定的是我们自定义的头文件目录；
- `-o` ：指定输出文件名。

## 2. 编译 Compilation

将经过预处理之后的程序转换成特定汇编代码(assembly code)的过程.

```bash
gcc -S -I./inc test.c -o test.s
```

-S让编译器在编译之后停止，不进行后续过程。

## 3. 汇编 Assemble

汇编过程将上一步的汇编代码转换成机器码(machine code),这一步产生的文件叫做目标文件，是二进制格式。gcc汇编过程通过as命令完成：

```bash
as test.s -o test.o
```

为每一个源文件产生一个目标文件.

## 4. 链接 Linking

链接过程将多个目标文件以及所需的库文件(.so等)链接成最终的可执行文件(executable file)。

```bash
ld -o test.out test.o inc/mymath.o ...libraries...
```
