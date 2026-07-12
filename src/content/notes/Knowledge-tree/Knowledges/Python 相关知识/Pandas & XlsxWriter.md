
> 包含pandas 和xlsx writer
# pandas

### 1. DataFrame 的创建

> - DataFrame 是二维结构, 对应 Excel 中的「表格」、SQL 中的「表」。
>
> - 行有**行索引（index）**，列有**列名（columns）**。

```python
# 1. 从字典创建（字典的key作为列名，value作为列数据）
import numpy as np
import pandas as pd

data = {
    "姓名": ["张三", "李四", "王五", "赵六"], # 一列
    "年龄": [20, 25, 22, 28],
    "城市": ["北京", "上海", "广州", "北京"],
    "薪资": [8000, 12000, 9500, 15000]
}
df = pd.DataFrame(data)
print("没有打印索引的DataFrame：\n",df.to_string(index= False))
print(f"基础DataFrame：\n{df}")
# 输出：
	基础DataFrame：
   姓名  年龄  城市     薪资
0  张三  20  北京   8000
1  李四  25  上海  12000
2  王五  22  广州   9500
3  赵六  28  北京  15000

# 1.1 自定义行索引
df2 = pd.DataFrame(data, index=["员工1", "员工2", "员工3", "员工4"])
print(f"自定义行索引的DataFrame：\n{df2}")
# 输出：
	自定义行索引的DataFrame：
     姓名  年龄  城市     薪资
员工1  张三  20  北京   8000
员工2  李四  25  上海  12000
员工3  王五  22  广州   9500
员工4  赵六  28  北京  15000

# 1.2 更改列名

# 2. 从NumPy数组创建
arr = np.array([[1,2,3], [4,5,6]])
df3 = pd.DataFrame(arr, columns=["A", "B", "C"], index=["X", "Y"])
print(f"NumPy数组创建的DataFrame：\n{df3}")

```

### 2. 数据读取与保存

   > [pandas读写详细笔记](读写Excel.md)

#### 2.1 读取常见格式：

   ```python
   df_csv = pd.read_csv("data.csv", encoding="utf-8") # encoding指定编码，避免中文乱码
   df_excel = pd.read_excel("data.xlsx", sheet_name="Sheet1")  # sheet_name指定工作表,也可以不指定工作表，则默认读取第一个工作表
   
   ```

#### 2.2 保存数据：

   ```python
   # 保存为CSV
   df.to_csv("output.csv", index=False)  # index=False不保存行索引
   # 保存为Excel
   df.to_excel("output.xlsx", sheet_name="员工信息", index=False)
   ```

3. 数据查看与探索

```python
print(df.head(2)) # 默认显示前5行，现在是显示前2行
print(df.tail()) # 默认显示最后5行
print(df.describe()) # 默认显示数值型列的统计信息
print(df.info()) # 显示数据框的详细信息

# ⚠️ 以下这几个都不带括号
print(df.columns) # 列名
print(df.index) # 索引
print(df.values) # 值(即不包含索引和列名的二维数组)
print(df.shape) # 行数列数
print(df.dtypes) # 列数据类型
print(df.size) # 总元素个数（不包含行列索引）
print(df.T) # 转置(行变列，列变行)

print(df['城市'].unique()) # 唯一值（也就是说对应列的唯一值））
print(df['城市'].nunique()) # 唯一值个数（也就是说对应列的唯一值个数）
print(df["城市"].value_counts())# 列值出现的次数
```

4. 数据筛选与索引

> 多列选择需用`df[["列1", "列2"]]`（即双层中括号）

> - iloc：基于整数的位置选取数据，可以指定行和列的位置，从0开始。左闭右开
> - loc：基于标签选取数据，可以指定行和列的名称。左右都闭
> - 公式：
> - - df.iloc[行位置, 列位置],或者df.iloc[start_row:end_row,start_col:end_col]
> - - df.loc[行标签, 列标签]，默认行索引是0,1,2,3这种
>
> > 一般用iloc就行，loc性能不好

```python

# 1.按列选择
print(df["姓名1"]) # 选择单列（即选择姓名这一列）
print(df[["年龄1", "城市1"]]) # 选择多列（即选择姓名和城市这两列）,注意：有两个中括号

# 2.按行选择
# 2.1 按位置：iloc
print(df.iloc[0]) # 选择第一行
print(df.iloc[1:3]) # 选择第二行和第三行(左闭右开)
print(df.iloc[0,3]) # 选择第一行第四列的数据
print(df.iloc[0,:3]) # 选择第一行前三列的数据
print(df.iloc[:,:3]) # 选择前三列的数据(即所有行的前三列数据)
# 2.2 按索引名：loc
print(df.loc["员工2"])  # 索引名为"员工2"的行
print(df.loc["员工2":"员工3"]) # 索引名为"员工2"到"员工3"的行(左闭右闭) ,注意：只有一个中括号
print(df.loc["员工2", "城市1"]) # 索引名为"员工2"的行 和"城市1"的列 的值

# 3.条件筛选
# 3.1 单条件筛选
print(df[df["年龄1"]>22]) # 筛选出年龄大于22的行；公式：df[条件]
# 3.2 多条件筛选
beijing_young_man = df[(df["城市1"] == "北京") & (df["年龄1"] >= 22)] # 筛选出城市为北京且年龄大于等于22的行；
print(beijing_young_man)
```

> [!NOTE]
>
> - 选择
>
>   选择单列的公式：`df["列名"]` 或 `df.列名`
>
>   选择多列的公式：  `df[["列名1", "列名2"]]`
>
>   选择单行 / 多行  `df.loc["行索引"]`/`df.loc[["行1","行2"]]`
>
> - 条件筛选
>
>   多条件筛选（`&`表示且、`|`表示或、`~`表示取反，条件需用()包裹）
>
>   如`df[~(df["城市1"] == "北京")]`（筛选非北京的员工）。
>
>   公式：df[(条件1) & (条件2) & (条件3) | ...]

5. 数据清洗

   > [新增行列详细笔记](新增行列.md)

```python
# 模拟创建含缺失值、重复值的DataFrame
df_clean = df.copy() # 创建一个副本，即深拷贝
df_clean.loc["员工2", "薪资1"] = np.nan # 第2行薪资设为缺失值
df_clean = pd.concat([df_clean,df_clean.iloc[0:1]]) # 将第1行复制1行并添加到df_clean的末尾添加一行
print(df_clean)
# 1. 缺失值处理
print(df_clean.isnull().sum()) # 查看各列缺失值数量
# 1.1 填充
# 1.1.1 用0 填充缺失值
df_clean.fillna({"薪资1":0},inplace=True)
# # 1.1.2 用均值填充缺失值
df_clean.fillna({"薪资1":df_clean["薪资1"].mean()},inplace= True) # 用均值填充缺失值, inplace=True表示将修改后的数据保存在原数据中
# # 1.1.3 用前一个值填充缺失值
df_clean.ffill(inplace= True)
# # 1.1.4 用后一个值填充缺失值
df_clean.bfill(inplace= True)
# 1.2 删除
df_clean.dropna(inplace= True) # 删除有缺失值的行
print(f'处理缺失值后的数据：\n{df_clean}')

# 2. 重复值处理(duplicate 是复制、重复的意思)
print(f'df_clean.duplicated().sum():{df_clean.duplicated().sum()}') # 查看重复行数量
df_clean.drop_duplicates(inplace= True) # 删除重复行

# 3. 数据类型转换
df_clean["年龄1"] = df_clean["年龄1"].astype(float) 
# 4. 新增/修改列
df_clean["年薪1"] = df_clean["薪资1"] * 12 # 新增年薪列
df_clean.loc[df_clean["薪资1"] > 10000, "薪资等级"] = "高"  # 条件赋值 ，通过loc定位满足条件的行，再给指定列赋值（列不存在时会自动新增）。
df_clean.loc[df_clean["薪资1"] <= 10000, "薪资等级"] = "中"
# 也可以简单一句：
df_clean["薪资等级1"] = np.where(df_clean["薪资1"] > 10000, "高", "中")
```

> [!NOTE]
>
> - `inplace`参数的作用
>
> `inplace`是 pandas 中很多修改类方法（如`rename`、`drop`、`fillna`等）的通用参数，作用是控制 “修改是否直接作用于原 DataFrame”：
>
> - - `inplace=True`：**直接修改原 DataFrame**，方法返回`None`，无需重新赋值，修改 “立刻生效” 在原 df 上；
>
> -   - `inplace=False`（默认值）：**不修改原 DataFrame**，而是返回一个 “修改后的新 DataFrame”，如果不把这个新对象赋值给变量，修改就不会被保留（看起来 “没生效”）。
>
> - 注意事项
>
> - - `inplace=True`是 “不可逆” 的：一旦原地修改，原 DataFrame 的结构就变了，无法恢复；

6. 分组聚合（groupby）

   > [**分组、聚合、排序**](分组聚合排序.md)

```python
# 按城市分组，计算各城市的平均薪资、最大年龄
group_result = df.groupby("城市").agg({
    "薪资": "mean",  # 平均薪资
    "年龄": "max"    # 最大年龄
}).reset_index()  # 重置索引，让分组列变回普通列
print(group_result)

# 简化写法（单列聚合）
print(df.groupby("城市")["薪资"].mean())
```

7. 数据合并

   > [concat 和 merge区别](typora://app/Assets/mds/pandas/concat和merge.md)

```python
# 模拟第二个DataFrame（员工部门信息）
df_dept = pd.DataFrame({
    "姓名": ["张三", "李四", "王五", "赵六"],
    "部门": ["技术", "产品", "销售", "技术"]
})

# 1. 合并（类似SQL的JOIN）
df_merge = pd.merge(df, df_dept, on="姓名", how="inner")  # 内连接（默认）
print(f'df_merge: \n{df_merge}')
# 输出（已经去掉了更改行索引语句了）：
	df_merge: 
   姓名  年龄  城市     薪资  部门
0  张三  20  北京   8000  技术
1  李四  25  上海  12000  产品
2  王五  22  广州   9500  销售
3  赵六  28  北京  15000  技术
# 2. 拼接（上下/左右拼接）,应该保证行索引是没有改过的，也就是说最初那样的索引
# axis=1：左右拼接；axis=0：上下拼接。
# ignore_index 是否重置索引（避免重复索引）;
# outer=保留所有列/行（默认），inner=只保留重叠的列/行
df_concat = pd.concat([df, df_dept], axis=1,join="outer")
print(f'df_concat: \n{df_concat}')
# 输出：
	df_concat: 
   姓名  年龄  城市     薪资  姓名  部门
0  张三  20  北京   8000  张三  技术
1  李四  25  上海  12000  李四  产品
2  王五  22  广州   9500  王五  销售
3  赵六  28  北京  15000  赵六  技术
```

8. 时间序列处理

   > [时间处理](时间处理.md)

```python
# 创建时间索引
import pandas as pd

date_range = pd.date_range(start="2026-01-01", end="2026-01-05", freq="D")  # 按天生成
df_time = pd.DataFrame({
    "销量": [100, 120, 90, 150, 110]
}, index=date_range)

# 时间筛选
print(df_time["2026-01-02":"2026-01-04"])  # 按时间范围筛选

# 时间重采样（如按周汇总）
print(df_time.resample("W").sum())  # W表示周，sum()汇总每周销量
```



9. 后续
   目前暂时没有涉及其他多余的内容，后续会继续补充。
