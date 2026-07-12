# Python

## 1.list

​	我之前一直一以为`[]`和`list()`是一个意思，但实际上不是，具体区别如下：

```python
a = [ i for i in range(3)]  
print( a) # [0, 1, 2]  
b= [range(3)]  
print(b) # [range(0, 3)]  
c = list(i for i in range(3))  
print(c) # [0, 1, 2]  
d =list(range(3))  
print(d) # [0, 1, 2]
```

> -  `[]` 是创建一个新列表,然后把  range(3)  当作一个东西放进去
> -  `list(xxx)`  的意思是：把 xxx 里面的内容拆出来，变成列表，即xxx必须是***Iterable对象***
> - 如果` [] `内的是[元素表达式 for 变量 in 可迭代对象]，也就是说通过`for`主动循环了，则是列表推导式；如果没有主动循环，则无论有没有可迭代对象，都只是一个普通的单元素列表。
> - `list(可迭代对象)`的作用是固定的：**接收一个可迭代对象（比如 range、生成器、列表等），遍历它的每一个元素，把这些元素逐个收集成新列表**。
>
> > 最通俗的比喻：
> >
> > -  `[range()]`  = 拿一个盒子，把整包薯片放进去
> >
> > -  `list(range())`  = 把整包薯片拆开，一片一片放进盒子


## 2. numpy 的ndim
我之前认为，一维数组的`shape (1,9)`和`shape (9,)`是等价的，但实际上不是，具体区别如下：
- `shape (9,)` 是**一维数组**（ndim=1），`shape (1,9)` 是**二维数组**（ndim=2），二者维度本质不同。
- 一维数组是没有行列概念的，只有一个维度，只有axis=0；
- 二维数组是有行列概念的，有两个维度，有axis=0（对应行，即竖直方向）、axis=1（对应列，即水平方向）；
```python
import numpy as np  
  
# 一维数组 (9,)
arr1 = np.array([1,2,3,4,5,6,7,8,9])  
# 二维数组 (1,9)
arr2 = np.array([[1,2,3,4,5,6,7,8,9]])  
  
# 1. 维度不同  
print("arr1 shape:", arr1.shape)  # 输出 (9,)
print("arr1 维度:", arr1.ndim)  # 输出1  
print("arr2 shape:", arr2.shape)  # 输出 (1,9)
print("arr2 维度:", arr2.ndim) # 输出 2
  
# 2. 索引方式不同  
print(arr1[0])       # 输出 1
print(arr2[0][0])     # 输出 1  

# 3.转置不同  
print('arr1.T.shape:', arr1.T.shape)  # 一维数组转置后shape不变：(9,)  
print('arr2.T.shape:',arr2.T.shape)  # 二维数组转置后shape变为(9,1)  
  
# 4. 维度转换  
# 将 (9,) 转为 (1,9)
arr1_reshape = arr1.reshape(1,9)  
print(arr1_reshape.shape)  # 输出 (1,9)  
# 将 (1,9) 转为 (9,)# squeeze 是挤压的意思，即去除维度为1的维度  
arr2_squeeze = arr2.squeeze()  # squeeze() 去除长度为1的维度  
print(arr2_squeeze.shape)      # 输出 (9,)
```