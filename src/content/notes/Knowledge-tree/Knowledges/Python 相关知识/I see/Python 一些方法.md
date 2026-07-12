### 1.lambda表达式
>[!NOTES]
>lambda 表达式的基本语法如下：
>- lambda arguments: expression
>- 其中
>	- arguments：参数列表，可以有零个或多个参数，用逗号分隔。
>	- expression：表达式，这是一个计算结果的表达式，不能包含复杂的语句（如 if 语句、循环等）。
```Python
1.单个参数的 lambda 表达式
a = lambda x:x+1
print(a(111)) # 输出 112

2.多个参数的 lambda 表达式
b = lambda x,y:x+y
print(b(1,2)) # 输出 3

3.多个表达式的 lambda 表达式
c = lambda x:x+1 if x>0 else x-1
print(c(1)) # 输出 2
print(c(-1)) # 输出 -2

4.无参数的 lambda 表达式
d = lambda:100
print(d()) # 输出 100

lambda 表达式的应用场景
1.排序
data = [{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 30}, {'name': 'Charlie', 'age': 20}]
sorted_data = sorted(data,key = lambda x: x['age'],reverse = True)  #reverse=True表示降序排序,默认是升序排序。
print(sorted_data)

2.过滤
numbers = [1, 2, 3, 4, 5, 6]
even_numbers = tuple(filter(lambda x: x % 2 ==0 ,numbers))
print(even_numbers)  # 输出 (2, 4, 6)
其中，filter()函数基本语法如下：
filter(function, iterable)
function：一个函数，用于测试每个元素，返回 True 或 False。
iterable：一个可迭代对象，包含待测试的元素，类型可以是列表、元组、字符串等，集合。
返回值：一个迭代器，包含所有使 function 返回 True 的元素。可以用list（），tuple（）等函数转换成列表或元组。

3.映射
numbers = [1, 2, 3, 4, 5, 6]
squared_number = list(map(lambda x: x**2,numbers))
print(squared_number)
其中，map()函数基本语法如下：
map(function, iterable,...)
function：一个函数，用于将每个元素映射到另一个元素。
iterable：一个可迭代对象，包含待映射的元素，类型可以是列表、元组、字符串等，集合。
返回值：一个迭代器，包含所有 function 映射后的元素。可以用list（），tuple（）等函数转换成列表或元组。
```
### 2.isinstace() 方法
>[!NOTES]
>语法：
>`isinstance(object, classinfo)`
>其中：
>- object：待判断的对象。
>- classinfo：判断的类型，可以是类、元组、字符串等。
>- 返回值：如果 object 是 classinfo 的实例，则返回 True，否则返回 False。

### 3. 列表推导式
#### 3.1 单层列表推导式：
##### 3.1.1 公式：
`[ 要放进新列表的东西(表达式) for 变量 in 原可迭代对象 ] `
##### 3.1.2 比较
1. 正常写法：
```python 
old_list = [1, 2, 3, 4]
new_list = []
for num in old_list: 
	new_list.append(num ** 2)
```

2. 列表推导式写法：
```python 
old_list = [1, 2, 3, 4]
new_list = [num ** 2 for num in old_list]
```

#### 3.2 嵌套列表推导式：
##### 3.2.1 公式：
`[ 要放进新列表的东西(表达式) for 外层变量 in 外层对象 for 内层变量 in 内层对象 ]`

##### 3.2.2 比较
1. 正常写法：
```python
# 需求：把二维列表 [[1, 2], [3, 4, 5], [6]]` 展平成一维列表 `[1, 2, 3, 4, 5, 6]并乘以2
old_list = [[1, 2], [3, 4, 5], [6]]  
new_list = []  
for sublist in old_list:  
    for item in sublist:  
        new_list.append(item*2)  
print(new_list)

```
2. 列表推导式写法：
```python 
old_list = [[1, 2], [3, 4, 5], [6]]  
new_list = [item*2 for sublist in old_list for item in sublist]  
print(new_list)
```