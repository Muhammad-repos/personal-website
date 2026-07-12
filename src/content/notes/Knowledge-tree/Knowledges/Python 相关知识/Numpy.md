# numpy 基础操作

### 1.数组的创建
#### 1.1直接创建
```python
# 1. 直接创建  
arr1 = np.array([1, 2, 3, 4, 5])  
arr2 = np.array([[1, 2, 3], [4, 5, 6]])  
# 2.根据列表创建
my_list = [[1, 2, 3], [4, 5, 6]]  
arr3 = np.array(my_list)
```
#### 1.2 随机数创建
##### 均匀分布类 ：*控制范围的 “等概率” 随机数*
###### rng.random *生成 [0-1) 之间均匀分布的随机浮点数* 
```python
import numpy as np  
rng = np.random.default_rng(42) # 创建一个随机数生成器，种子为42  
arr_random_0 = rng.random() # 生成单个随机数字,是0-1之间均匀分布的随机数，是标量  
arr_random_1 = rng.random(3) # 0-1之间均匀分布的3个随机数组  
arr_random_2 = rng.random((3, 3)) # 0-1之间均匀分布的3*3的随机数组  
arr_random_3 = rng.random((3, 3, 3)) # 0-1之间均匀分布的3*3*3的随机数组
```
###### rng.uniform  *生成[low,high)* 之间均匀分布的随机浮点数*
```python

rng = np.random.default_rng(42) # 创建一个随机数生成器，种子为42  
arr_uni_0 = rng.uniform(low=2, high=3) # 2-3之间均匀分布的单个随机数，是标量  
arr_uni_1 = rng.uniform(low=2, high=3, size=3) # 2-3之间均匀分布的3个随机数,shape=(3,)  
arr_uni_2 = rng.uniform(low=2, high=3, size=(3, 3)) # 2-3之间均匀分布的3*3的随机数,shape=(3,3)  
arr_uni_3 = rng.uniform(low=2, high=3, size=(3, 3, 3)) # 2-3之间均匀分布的3*3*3的随机数,shape=(3,3,3)
```
###### rng.integers *生成[low,high)之间均匀分布的随机整数*
```python
rng = np.random.default_rng(42) # 创建一个随机数生成器，种子为42  
arr_int_0 = rng.integers(low=8, high=30) # 是8至30之间的单个整数,是标量  
arr_int_1 = rng.integers(low=8, high=30, size=3) # 是8至30之间的3个整数数组，shape=(3,)  
arr_int_2 = rng.integers(low=8, high=30, size=(3, 3)) # 是8至30之间的3*3的整数数组，shape=(3,3)  
arr_int_3 = rng.integers(low=8, high=30, size=(3, 3, 3)) # 是8至30之间的3*3*3的整数数组，shape=(3,3,3)
```
##### 正态分布类 (Normal)： “钟形” 分布
###### rng.normal *生成均值为loc，标准差为sclae的正态分布随机数*
>公式：rng.normal(loc, scale, size)
>其中：
>-  `loc`：均值 (μ)，分布的中心位置。loc ∈ R
>- `scale`：标准差 (σ)，数据的离散程度 scale >0 ,越大—>越胖
```python
rng = np.random.default_rng(42) # 创建一个随机数生成器，种子为42  
  
arr_norm_0 = rng.normal(loc=2, scale=10) # 生成一个均值为2，标准差为10的正态分布随机数  
arr_norm_1 = rng.normal(loc=2, scale=10, size=3) # 生成3个均值为2，标准差为10的正态分布随机数  
arr_norm_2 = rng.normal(loc=2, scale=10, size=(3, 3)) # 生成3*3的均值为2，标准差为10的正态分布随机数  
arr_norm_3 = rng.normal(loc=2, scale=10, size=(3, 3, 3)) # 生成3*3*3的均值为2，标准差为10的正态分布随机数
```

###### rng.standard_normal(size)
> 标准正态分布,即正态分布rng.normal（均值 = 0，标准差 = 1）的简写版
> ```python
> arr_stand = rng.standard_normal(size=10)  
print("标准正态分布随机数:", arr_stand)
> ```
#### 1.3 特殊创建
```python
arr1 = np.zeros((3, 3))  # 全0数组 ,shape=(3, 3)arr2 = np.ones((3, 3))  # 全1数组 ，shape=(3, 3)  
arr3 = np.empty((3, 3))  # 未初始化的数组 ,元素值随机,shape=(3, 3)  
arr4 = np.eye(3) #正对角线元素为1，其余为0,shape=(3, 3)  
arr5 = np.linspace(0, 1, 5) # 0到1之间分5个数,shape=(5,)  
arr6 = np.arange(0, 10, 0.2) # 0到1之间步长为0.2的数组,shape=(50,)  
arr7 = np.full((3, 3), 7) # 全7数组,shape=(3, 3)  
arr7_special = np.full((3, 5), np.nan) # arr7的特殊形式，全nan的数组,shape=(3, 5)  
arr8 = np.zeros_like(arr7_special) #形状跟arr7_special一样的全0数组，即shape=(3, 5)
```

### 2.数组的属性
```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(arr.shape)  # 输出：(2, 3)
print(arr.dtype)  # 输出：int64
print(arr.size)  # 输出：6
```

### 3.数组的运算
```python
import numpy as np
arr1 = np.array([1, 2, 3, 4, 5])
arr2 = np.array([5, 4, 3, 2, 1])

# 1. 加法
arr3 = arr1 + arr2
print(arr3)  # 输出：[ 6  6  6  6  6]

# 2. 减法
arr4 = arr1 - arr2
print(arr4)  # 输出：[-4 -2  0  2  4]

# 3. 乘法
arr5 = arr1 * arr2
print(arr5)  # 输出：[ 5 10 15 20 25]

# 4. 除法
arr6 = arr1 / arr2
print(arr6)  # 输出：[0.2        0.5        0.75       1.        1.25      ]


# 5. 矩阵乘法
arr7 = np.array([[1, 2], [3, 4]])
arr8 = np.array([[5, 6], [7, 8]])
arr9 = np.dot(arr7, arr8)  # 矩阵乘法 （只能对二维数组进行，因为矩阵就是二维数组）
print(arr9)  # 输出：[[19 22] [43 50]]
```

### 4. 数组的索引
```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

# 1. 单个元素的索引
print(arr[1, 2])  # 输出：6

# 2. 切片的索引（公式： [start_row:end_row,sart_col,end_col]）
print(arr[1:3, 1:3])  # 输出：[[5 6] [8 9]]

# 3. 布尔索引
print(arr[arr > 5])  # 输出：[6 7 8 9]
```

### 5. 数组的合并

   > stack 是堆叠，concatenate 是拼接、延伸;
   >
   > **axis=0是垂直方向操作，axis=1是水平方向操作**

#### 5.1 一维数组的合并 
```python

import numpy as np
arr1 = np.array([1, 2, 3])
arr2 = np.array([4, 5, 6])
print(f'arr1: {arr1}, arr1.shape: {arr1.shape},
      arr2: {arr2}, arr2.shape: {arr2.shape}')
      # arr1: [1 2 3], arr1.shape: (3,), arr2: [4 5 6], arr2.shape: (3,)

# 1. vstack：纵向合并（垂直堆叠，行数增加），会比原来的多一个维度(只要有stack，就会维度增加1个)
arr3 = np.vstack((arr1, arr2))
print(arr3,arr3.shape())  # [[1 2 3] [4 5 6]] ,shape:(2, 3)

# 2. hstack：横向合并（水平拼接，列数增加）
arr4 = np.hstack((arr1, arr2))
print(arr4,arr4.shape())  # 输出：[1 2 3 4 5 6],shape:(6,)

# 3. concatenate 
arr5 = np.concatenate([arr1,arr2], axis=0) # 其实也可以不用写axis=0
print(f'arr5: concatenate(axis=0) \n{arr5}, arr5.shape: {arr5.shape}')
# 输出：
      arr5: concatenate(axis=0) 
[1 2 3 4 5 6], arr5.shape: (6,)

# arr6 = np.concatenate([arr1,arr2], axis=1) # ❌，一维数组不能进行axis=1的拼接
```
> 结论：
> 
> ​	一维数组中hstack 和concatenate效果一样
>一维数组没有axis=1，只有axis=0

#### 5.2 二维数组的合并 

```python
arr1_2d = np.array([[1,2,3],[4,5,6]])
arr2_2d = np.array([[7,8,9],[10,11,12]])
print(f' arr1_2d.shape: {arr1_2d.shape}') # arr1_2d.shape: (2, 3)
print(f' arr2_2d.shape: {arr2_2d.shape}') # arr2_2d.shape: (2, 3)

#vstack 垂直堆叠
a1_2d = np.vstack([arr1_2d,arr2_2d])
print(f'a1_2d:vstack \n{a1_2d}, a1_2d.shape: {a1_2d.shape}')
# 输出：
	a1_2d:vstack 
[[ 1  2  3]
 [ 4  5  6]
 [ 7  8  9]
 [10 11 12]], a1_2d.shape: (4, 3)

# hstack 水平堆叠
b1_2d = np.hstack([arr1_2d,arr2_2d])
print(f'b1_2d:hstack \n{b1_2d}, b1_2d.shape: {b1_2d.shape}')
# 输出：
	b1_2d:hstack 
[[ 1  2  3  7  8  9]
 [ 4  5  6 10 11 12]], b1_2d.shape: (2, 6)

# concatenate (axis=0) 垂直拼接
c1_2d = np.concatenate([arr1_2d,arr2_2d], axis=0)
print(f'c1_2d: concatenate(axis=0) \n{c1_2d}, c1_2d.shape: {c1_2d.shape}')
# 输出：
	c1_2d: concatenate(axis=0) 
[[ 1  2  3]
 [ 4  5  6]
 [ 7  8  9]
 [10 11 12]], c1_2d.shape: (4, 3)

# # concatenate (axis=1) 水平拼接
d_2d = np.concatenate([arr1_2d,arr2_2d], axis=1)
print(f'd_2d: concatenate(axis=1) \n{d_2d}, d_2d.shape: {d_2d.shape}')
# 输出：
	d_2d: concatenate(axis=1) 
[[ 1  2  3  7  8  9]
 [ 4  5  6 10 11 12]], d_2d.shape: (2, 6)
```

> 结论：
>
> 二维数组中:
>
> ​	vstack 和concatenate(axis=0)效果一样
>
> ​	hstack 和concatenate(axis=1)效果一样

#### 6. 数组的排序

```python
import numpy as np
arr = np.array([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5])

# 1. 直接排序
sorted_arr = np.sort(arr)
print(sorted_arr)  # 输出：[1 1 2 3 3 4 5 5 5 6 9]

# 2. 倒序排序
sorted_arr = np.sort(arr)[::-1]
print(sorted_arr)  # 输出：[9 6 5 5 5 4 3 3 2 1 1]
```
#### 7. 数组的统计
```python
import numpy as np
arr = np.array([1, 2, 3, 4, 5])

# 1. 最大值
print(np.max(arr))  # 输出：5

# 2. 最小值
print(np.min(arr))  # 输出：1

# 3. 平均值
print(np.mean(arr))  # 输出：3.0

# 4. 中位数
print(np.median(arr))  # 输出：3.0

# 5. 标准差
print(np.std(arr))  # 输出：1.4142135623730951

# 6. 其他统计指标
print(np.sum(arr))  #和， 输出：15
print(np.var(arr))  #方差， 输出：1.2 
```
#### 8. 数组的分割
```python
import numpy as np
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9])
# 1. 切分数组
arr1, arr2, arr3 = np.split(arr, [3, 6])
print(arr1)  # 输出：[1 2 3]
print(arr2)  # 输出：[4 5 6]
print(arr3)  # 输出：[7 8 9]

# 2. 数组的分割
arr1, arr2 = np.array_split(arr, 2)
print(arr1)  # 输出：[1 2 3 4]
print(arr2)  # 输出：[5 6 7 8 9]
```
#### 10. 数组的迭代
```python
import numpy as np
arr = np.array([[1, 2, 3], [4, 5, 6]])

# 1. 迭代
for row in arr:
    print(row)

# 2. 迭代并修改
for row in np.nditer(arr, op_flags=['readwrite']):
    row[...] = 0
print(arr)  # 输出：[[0 0 0] [0 0 0]]
```
#### 11. 数组的条件筛选
```python
import numpy as np
arr = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9])

# 1. 条件筛选
arr1 = arr[arr > 5]
print(arr1)  # 输出：[6 7 8 9]

# 2. 条件筛选并修改
arr2 = arr[arr > 5]
arr2[arr2 > 7] = 0
print(arr2)  # 输出：[6 7 0 0]
```
#### 12. 数组的类型转换
```python
import numpy as np
arr = np.array([1, 2, 3, 4, 5])

# 1. 类型转换
arr1 = arr.astype(np.float64)
print(arr1)  # 输出：[1. 2. 3. 4. 5.]

# 2. 类型转换并修改
arr2 = arr.astype(np.float64)
arr2[arr2 > 3] = 0
print(arr2)  # 输出：[1. 2. 3. 0. 0.]
```
#### 13.  数组的保存与读取
```python
import numpy as np

# 1. 保存数组
arr = np.array([1, 2, 3, 4, 5])
np.save('arr.npy', arr)

# 2. 读取数组
arr1 = np.load('arr.npy')
print(arr1)  # 输出：[1 2 3 4 5]
```
#### 14. 数组的重复
- **`np.repeat()`**：**元素级** 重复 → 把数组里的**每个元素**分别重复指定次数
- **`np.tile()`**：**数组级** 平铺 → 把**整个数组**当作一个整体，像铺瓷砖一样重复拼接，*tile* 名词时瓦砖，动词时铺砖
##### 14.1 np.repeat()语法
`np.repeat(a, repeats, axis=None)` 
其中：
-  `a`: 输入数组
-  `repeats`: 重复次数（可以是数字或数组，指定每个元素的重复次数）
-  `axis`: 指定重复的轴（不指定则先展平数组）
##### 14.2 np.tile()语法
`np.tile(a, reps)` 
其中：
- `a`: 输入数组
- `reps`: 平铺次数（可以是数字或元组，指定沿各轴的平铺次数）
    - 注意：`reps` 的长度表示最终数组的维度，不足时会自动给原数组补维度

>[!NOTE]
|   特性   |            np.repeat()             |           np.tile()           |
|:--------:|:----------------------------------:|:-----------------------------:|
| 操作粒度 |         元素级（逐个重复）         |      数组级（整体平铺）       |
| 维度变化 | 不改变原数组维度（除非 axis=None） |   可扩展数组维度（补维度）    |
| 重复逻辑 |       同一位置的元素多次出现       |      整个数组块重复拼接       |
| 适用场景 |     想让每个元素单独重复 N 次      | 想让整个数组作为整体重复 N 次 |
|    例    |         [1,2] → [1,1,2,2]          |       [1,2] → [1,2,1,2]       |

##### 14.3 具体代码
```python 
import numpy as np  
# 1. 一维数组  
arr1 = np.array([1,2,3]) # shape:(3,)  
print(f'arr1:\n{arr1},shape:{arr1.shape}')  
# 1.1 repeat  
# 重复数组中的每个元素3次  
r_arr1 = np.repeat(a=arr1,repeats=3) # shape: (9,)  
print(f'r_arr1:\n{r_arr1},shape:{r_arr1.shape}') # [1 1 1 2 2 2 3 3 3]  
# 1.2 tile  
# 重复整个数组在竖直方向上3次，在水平方向上2次  
t_arr1 = np.tile(arr1,(3,2)) # shape:(3, 6)  
print(f't_arr1:\n{t_arr1},shape:{t_arr1.shape}')  
  
  
# 2. 二维数组  
arr2 = np.array([[1,2,3],[4,5,6]]) # shape: (2,3)  
print(f'arr2:\n{arr2},shape:{arr2.shape}')  
# 2.1 repeat  
r_arr2_0 = np.repeat(a=arr2,repeats=3,axis=0) # shape: (6,3)  
print(f'r_arr2_0:\n{r_arr2_0},shape:{r_arr2_0.shape}')  
r_arr2_1 = np.repeat(a=arr2,repeats=3,axis=1) # shape: (2,6)  
print(f'r_arr2_1:\n{r_arr2_1},shape:{r_arr2_1.shape}')  
  
# 2.2 tile  
t_arr2 = np.tile(arr2,(3,2)) #shape: (6,6)  
print(f't_arr2:\n{t_arr2},shape:{t_arr2.shape}')
```

# 实例
 ### 1.堆叠
```python
import numpy as np

my_2d_arr = np.array([[1, 2, 3],[4, 5, 6]])
print(f'my_2d_arr:\n{my_2d_arr}')
# keepdims=True: 保持结果的维度结构（例如，二维数组按行求和后仍为二维）
# keepdims=False: 压缩掉被操作的轴（默认行为）
# axis=0: 按行求和(即垂直方向操作)；axis=1: 按列求和(即水平方向操作)
x_sum = np.sum(my_2d_arr,axis=1,keepdims=True)
print(f'x_sum:\n{x_sum}') 
y_sum = np.sum(my_2d_arr,axis=0,keepdims=True)
print(f'y_sum:\n{y_sum}')
data_sum_h = np.hstack([my_2d_arr,x_sum]) # horizontal stacking, add x_sum to the end of each row
print(f'data_sum_h:\n{data_sum_h}')
data_sum_v = np.vstack([my_2d_arr,y_sum])
print(f'data_sum_v:\n{data_sum_v}')
# 生成既有原来的数据，也有行、列的累计和的新数组
#先生成对data_sum_h的纵向的累计和
data_sum_h_2y = np.sum(data_sum_h,axis=0,keepdims=True)
print(f'data_sum_h_2y:\n{data_sum_h_2y}')
# 再对y方向堆叠
final_data = np.vstack([data_sum_h,data_sum_h_2y])
print(f'final_data:\n{final_data}')
```

  ### 2.保存
```python
#arr.npy的方式保存的话，只能以二进制形式保存，要想保存成txt，则如下：
def save_array_to_text( array, filename, fmt='%.4f', delimiter='\t'):
    """
    :param delimiter: 分隔符（\t=制表符，间距均匀；'  '=两个空格，间距更小）
    """
    # 处理三维数组：逐层写入，层间添加分隔标识
    if array.ndim == 3:
        with open(filename, 'w', encoding='utf-8') as f:
            # 写入基础维度信息
            f.write(f'原始三维数组形状: {array.shape} (层数, 行数, 列数)\n')
            f.write('=' * 100 + '\n')

            # 遍历每一层，逐层写入+添加分隔
            for layer_idx in range(array.shape[0]):
                # 写入当前层的编号和形状
                layer_data = array[layer_idx]
                f.write(f'【第 {layer_idx + 1} 层】(索引: {layer_idx}) 形状: {layer_data.shape}\n')
                f.write('-' * 80 + '\n')

                # 写入当前层的数值
                np.savetxt(f, layer_data, fmt=fmt, delimiter=delimiter)

                # 层间分隔（最后一层不加额外分隔）
                if layer_idx < array.shape[0] - 1:
                    f.write('\n' + '=' * 60 + '\n\n')  # 空行+分隔线，视觉区分层
    else:
        np.savetxt(filename, array, fmt=fmt, delimiter=delimiter, encoding='utf-8')
    print(f'数组已保存为文本文件：{filename}')
```

### 3. 高位数组求按各个轴求和及堆叠
```python 
import numpy as np  
  
arr_3d = np.full((6,3,3),np.nan)  
print(f'arr_3d:\n{arr_3d},shape:{arr_3d.shape}')  
print(f'-'*50)  
arr_2d_0 = np.array([[1,2,3],[4,5,6],[7,8,np.nan]])  
print(f'arr_2d_0:\n{arr_2d_0},shape:{arr_2d_0.shape}')  
arr_2d_1 = np.array([[np.nan,11,12],[13,14,np.nan],[16,17,18]])  
print(f'arr_2d_1:\n{arr_2d_1},shape:{arr_2d_1.shape}')  
arr_2d_2 = np.array([[19,np.nan,21],[22,23,24],[25,26,27]])  
print(f'arr_2d_2:\n{arr_2d_2},shape:{arr_2d_2.shape}')  
arr_2d_3 = np.array([[28,29,30],[31,np.nan,33],[34,35,36]])  
print(f'arr_2d_3:\n{arr_2d_3},shape:{arr_2d_3.shape}')  
arr_2d_4 = np.array([[37,38,39],[40,41,42],[43,44,45]])  
print(f'arr_2d_4:\n{arr_2d_4},shape:{arr_2d_4.shape}')  
arr_2d_5 = np.array([[46,np.nan,48],[49,50,51],[52,53,54]])  
print(f'arr_2d_5:\n{arr_2d_5},shape:{arr_2d_5.shape}')  
  
  
  
print(f'*'*50)  
arr_3d[0] = arr_2d_0  
arr_3d[1] = arr_2d_1  
arr_3d[2] = arr_2d_2  
arr_3d[3] = arr_2d_3  
arr_3d[4] = arr_2d_4  
arr_3d[5] = arr_2d_5  
print(f'after fill arr_3d:\n{arr_3d},shape:{arr_3d.shape}')  
  
print(f'+'*50)  
data_sum_axis_0 = np.nansum(arr_3d,axis=0,keepdims=True)  
print(f'data_sum_axis_0:\n{data_sum_axis_0},shape:{data_sum_axis_0.shape}')  
data_sum_axis_1 = np.nansum(arr_3d,axis=1,keepdims=True)  
print(f'data_sum_axis_1:\n{data_sum_axis_1},shape:{data_sum_axis_1.shape}')  
data_sum_axis_2 = np.nansum(arr_3d,axis=2,keepdims=True)  
print(f'data_sum_axis_2:\n{data_sum_axis_2},shape:{data_sum_axis_2.shape}')  
  
print(f'/*'*50)  
  
concat_sum_axis_0 = np.concatenate((data_sum_axis_0,arr_3d),axis=0)  
print(f'concat_sum_axis_0:\n{concat_sum_axis_0},shape:{concat_sum_axis_0.shape}')  
  
concat_sum_axis_1 = np.concatenate((arr_3d,data_sum_axis_1),axis=1)  
print(f'concat_sum_axis_1:\n{concat_sum_axis_1},shape:{concat_sum_axis_1.shape}')  
  
concat_sum_axis_2 = np.concatenate((arr_3d,data_sum_axis_2),axis=2)  
print(f'concat_sum_axis_2:\n{concat_sum_axis_2},shape:{concat_sum_axis_2.shape}')  
  
concat_and_mean = np.nanmean(concat_sum_axis_2,axis=0,keepdims=True)  
print(f'concat_and_mean:\n{concat_and_mean},shape:{concat_and_mean.shape}')  
  
final_arr = np.concatenate((concat_sum_axis_2,concat_and_mean),axis=0)  
print(f'final_arr:\n{final_arr},shape:{final_arr.shape}')  
  
print(f'-*-*'*50)  
arr_3d = np.nan_to_num(arr_3d)  
col_sum = np.sum(arr_3d,axis=2,keepdims=True)  
print(f'col_sum:\n{col_sum},shape:{col_sum.shape}')  
  
col_sum_concated = np.concatenate((arr_3d,col_sum),axis=2)  
print(f'col_sum_concated:\n{col_sum_concated},shape:{col_sum_concated.shape}')  
row_mean = np.round(np.mean(col_sum_concated,axis=0,keepdims=True),3)  
print(f'row_mean:\n{row_mean},shape:{row_mean.shape}')  
  
row_mean_concated = np.concatenate((col_sum_concated,row_mean),axis=0)  
print(f'row_mean_concated:\n{row_mean_concated},shape:{row_mean_concated.shape}')
```

>- np.nan_to_num 是把数组中有nan的数组变为没有nan的数组，其中nan替换为0
>- nansum 、nanmean 是sum、mean 的特殊情况，即比如说对于一个数组：
>	- arr_2d_0 = np.array([[1,2,3],[4,5,6],[7,8,np.nan]])  
>	- sum时：
>	- 不给轴方向，则默认对全数组求和，然后只要有一个元素是nan，那求和结果就是nan；
>	- 如果给轴了，然后某个轴方向上某个元素为nan，则该轴方向的和就是nan，其余没有nan的方向正常。比如说axis= 0，keepdims=False时，结果是[12. 15. nan]；axis=1时，[ 6. 15. nan]
>- nansum 等这些是自动过滤nan元素（计算时剔除在外），结果分别是36.0；[12. 15.  9.]；[ 6. 15. 15.]
>	- 注意⚠️的是nansum 等，只对有效数字求和，因此求平均时，也是只对有效数字数量除以。
>

>上面这个代码中的这个三维数组（6,3,3）可以想象成一个 6 层楼（每层是一个 3x3 的网格） 。
>- 按 axis =0 （层）数学计算（如求和）：
>	- 此时每层数组是（3,3）的数组，然后计算时，取每层的[0,0]位置的数组元素，
>	- 然后计算的时候keepdims=True，的话计算结果是一个（1,3,3）的数组（求和的轴会被叠成1）否则是一个（3,3）的结果；是每一层对应位置的元素从第0层到第5层的计算结果（和），即跨楼
>- 按axis=1 （行）数学计算：
>	- 每一层中按行（即第一个3）进行计算（如求和），比如说上面代码中的arr_2d_0的第0行的元素拿出来“1，nan，19,28,37,46”，然后和是131 ，依次这样；最后是根据keepdims，计算结果的shape变成（6,1,3）或者（6,3）（行消失）
>- 按axis=2 （列）数学计算：
>	- 跟上面一样，就是按列算，最后计算结果的shape变成（6,3,1）或者（6,3）（列消失）
>也就是说 ==axis 是几，就只让那个维度的下标变化，其他下标固定不动，把动的那些数加起来。==

### 4.拿到最后一个有效数字
```python
import numpy as np  
def get_last_valid_for_row(row):  
    # print(f'row:{row},shape:{row.shape},type:{type(row)}')  
    weighted = np.where(~np.isnan(row), np.arange(len(row)), -1)  
    last_col = np.max(weighted)  
    last_val = row[last_col] if last_col != -1 else np.nan;return last_val  
  
arr_1 = np.array([  
    [1,2,np.nan,3 ,np.nan],[ 4,5,np.nan,np.nan,np.nan]])  
  
print(f'arr_1:\n{arr_1}')  
  
for i in range(arr_1.shape[0]):  
    print(f'第{i}行最后一个有效值:{get_last_valid_for_row(arr_1[i])}')
'''
输出：
arr_1:
[[ 1.  2. nan  3. nan]
 [ 4.  5. nan nan nan]]
第0行最后一个有效值:3.0
第1行最后一个有效值:5.0
'''
```