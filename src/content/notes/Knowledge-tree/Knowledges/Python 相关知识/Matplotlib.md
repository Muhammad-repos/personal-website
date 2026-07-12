
>[!NOTE]
>Matplotlib 的图表由两个核心对象构成：
>- **Figure（画布）**：整个绘图的窗口或页面，相当于 “画纸”，可以包含多个子图。
>- **Axes（子图）**：画布上的具体绘图区域，相当于 “画纸中的某一块”，每个 Axes 包含独立的坐标轴、标题、图例等元素。
>- 简单类比：*Figure 是 “整个画板”，Axes 是 “画板上的每一幅小画”。*

>[!tip]
> #### 设置字体及符号
>`plt.rcParams["font.sans-serif"] = ["SimHei"]`  # 用来正常显示中文标签  `plt.rcParams["axes.unicode_minus"] = False`  # 用来正常显示负号
# 1.基础绘图
### 1.快速创建图表
```python
import matplotlib.pyplot as plt
import numpy as np 
x = np.linspace(0, 10, 100)
y = np.sin(x)
# 显式创建画布和子图 
fig, ax = plt.subplots(figsize=(8, 4)) # figsize 控制画布大小 
# 通过 ax 对象操作子图 
ax.plot(x, y, color="blue", linewidth=2) 
ax.set_title("标题", fontsize=14) 
ax.set_xlabel("x 轴", fontsize=12) 
ax.set_ylabel("y 轴", fontsize=12) 
ax.grid(True, linestyle="--", alpha=0.7) # 添加网格线 
plt.show()
```
>[!TIP]
> `fig, ax = plt.subplots(figsize=(8, 4))` 返回的ax实际是个`numpy.ndarray` 对象，

### 2.不同类型图表的绘制
#### 1.折线图（Plot）
>[!note]
>用于展示数据随连续变量的 **变化趋势**，核心参数：
>- `color`：线条颜色（如 `"red"`、`"#FF5733"`）
>- `linestyle`：线条样式（`"-"` 实线、`"--"` 虚线、`":"` 点线）
>- `marker`：数据点标记（`"o"` 圆点、`"s"` 方块、`"^"` 三角）
>- `linewidth`：线条宽度- `color`：线条颜色（如 `"red"`、`"#FF5733"`）
>- `linestyle`：线条样式（`"-"` 实线、`"--"` 虚线、`":"` 点线）
>- `marker`：数据点标记（`"o"` 圆点、`"s"` 方块、`"^"` 三角）
>- `linewidth`：线条宽度
```python
import matplotlib.pyplot as plt  
import [[numpy]] as np  
  
# 生成数据  
x = np.linspace(0, 10, 100)  
y1 = np.sin(x)  
y2 = np.cos(x)  
  
# 绘图  
fig, ax = plt.subplots( figsize=(8, 6))  
  
ax.plot(x,y1,color='red',linestyle='-',
marker='o',markersize=5,label='sin(x)')  
ax.plot(x,y2,color='blue',linestyle=':',
marker='s',markersize=5,label='cos(x)')  
ax.legend() # 显示图例
plt.show()
```

#### 2.散点图（Scatter）
>[!note]
>用于展示两个**变量之间的关系**，核心参数：
>- `s`：点的大小（可以是单个值，也可以是数组，实现 “气泡图”）
>- `c`：点的颜色（可以是单个值，也可以是数组，结合 `cmap` 实现颜色映射）
>- `cmap`：颜色映射表（如 `"viridis"`、`"coolwarm"`）
>- `alpha`：点的透明度（0-1 之间）

```python
import matplotlib.pyplot as plt  
import numpy as np  
  
# 设置中文显示和负号  
plt.rcParams["font.sans-serif"] = ["SimHei"]  
plt.rcParams["axes.unicode_minus"] = False  
  
# 数据生成  
rng = np.random.default_rng(42)  
  
x = rng.random(100)  
y = rng.random(100)  
size = rng.random(100) * 300  # 点的大小  
color = rng.random(100)       # 点的颜色值  
  
# 绘图  
fig, ax = plt.subplots(figsize=(10, 5))  
# 绘制散点图  
scatter = ax.scatter(x, y, s=size, c=color, cmap="nipy_spectral",  
                     alpha=0.7, edgecolors='black', linewidth=0.5)  
  
ax.set_title("散点图示例（气泡图）", fontsize=16, pad=15)# pad为距离边框的距离  
ax.set_xlabel("X 轴数值", fontsize=12)  
ax.set_ylabel("Y 轴数值", fontsize=12)  
  
ax.grid(visible=True, linestyle='--', alpha=0.6)  # 显示网格  
  
fig.colorbar(scatter, ax=ax, label="颜色强度值")  # 显示颜色条  
  
plt.tight_layout()  
plt.show()
```

#### 3.柱状图（Bar & Barh）
> [!Note]
> 用于比较不同类别数据的大小，分为垂直柱状图（`bar`）和水平柱状图（`barh`），核心参数：
> - `width`：柱子宽度（垂直柱状图）
> - `height`：柱子高度（水平柱状图）
> - `align`：对齐方式（`"center"` 居中、`"edge"` 边缘对齐）

```python
import matplotlib.pyplot as plt  
   
datas = {"A":100, "B":200, "C":300, "D":50}  

fig,ax = plt.subplots(nrows=1,ncols=2,figsize=(10,5))  
  
ax[0].bar(datas.keys(),datas.values(),color=["red","green","blue","yellow"],width=0.5) # 垂直柱状图  
ax[0].set_title("Vertical Bar Chart")  
ax[1].barh(datas.keys(),datas.values(),color=["pink","orange","purple","brown"],height=0.5) # 水平柱状图  
ax[1].set_title("Horizontal Bar Chart")  
plt.tight_layout()  # 自动调整子图间距  
plt.show()
```

#### 4.直方图（Hist）
>[!note]
>用于展示数据的分布情况，核心参数：
>- `bins`：分组数量（或分组边界），即有多少个小直方
>- `density`：是否归一化（`True` 显示概率密度，`False` 显示频数），y轴数据不一样
>- `histtype`：直方图类型（`"bar"` 柱状、`"step"` 阶梯），默认为柱状的

```python
import matplotlib.pyplot as plt  
import numpy as np  
plt.rcParams['font.sans-serif'] = ['SimHei'] 
plt.rcParams['axes.unicode_minus'] = False 
rng = np.random.default_rng()  
data = rng.normal(loc=0, scale=1, size=1000)  
fig, ax = plt.subplots(figsize=(8, 4))  
ax.hist(data, bins=30, density=False, color="lightgreen", alpha=0.7, edgecolor="red")  
  
ax.set_title("直方图：正态分布数据")  
ax.set_xlabel("数据值")  
ax.set_ylabel("概率密度")  
plt.show()
```

```python
import matplotlib.pyplot as plt  
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签  
plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号  
# 数据  
datas = {  
       "labels":["苹果", "香蕉", "橙子", "葡萄"],  
       "sizes":[30, 25, 20, 25],  
       "explode":[0.1, 0, 0, 0]  # 突出“苹果”,即让这个标签的扇区突出显示  
       }  
fig, ax = plt.subplots(figsize=(6, 6))  
ax.pie(  
       x=datas["sizes"],  
       explode=datas["explode"],  
       labels=datas["labels"],  
       autopct="%.1f%%",  
       colors=["lightcoral", "gold", "lightgreen", "skyblue"],  
       startangle=15,# startangle 控制起始角度,是突出显示的那个的角度  
       pctdistance=0.8, # pctdistance 控制百分比标签与圆心的距离  
       labeldistance=1.1, # labeldistance 控制标签与圆心的距离  
       shadow=True, # 阴影效果,  
       radius=1.2, # 饼图半径  
       frame=True, # 是否显示饼图外框  
       textprops={"fontsize":14, "color":"b", "weight":"bold"} # 饼图标签字体大小  
  
  
       )  
  
ax.set_title("饼图示例")  
plt.show()
```

### 3.图表美化与定制
>[!note]
> 1. 标题与坐标轴标签
>- 通过 `set_title()`、`set_xlabel()`、`set_ylabel()` 定制，支持字体大小、颜色、位置;
>2. 图例设置
>- 通过 `legend()` 定制图例的位置、样式、字体;
>- `loc` 参数有：`"upper left"`、`"upper right"`、`"lower left"`、`"lower right"`、`"center"`；
>3. 刻度
>- 通过 `set_xticks()`、`set_yticks()` 设置刻度位置，`set_xticklabels()` 定制刻度标签；
>4. 网格
>- 通过 `grid()` 添加网格线，支持样式、颜色、透明度；
>5. 线条与标记样式
>- |线条样式|说明|标记样式|说明|
|---|---|---|---|
|`-`|实线（默认）|`o`|圆点|
|`--`|虚线|`s`|方块|
|`:`|点线|`^`|上三角|
|`-.`|点划线|`*`|星号|
>6. 间距调整
>- `tight_layout()`：自动调整子图间距，避免标签重叠
>- `subplots_adjust()`：手动调整间距（`left`、`right`、`top`、`bottom`、`wspace`、`hspace`）
>7. 风格与样式表
>- Matplotlib 内置了多种样式表，通过 `plt.style.use()` 快速应用；
>- 查看所有可用样式：`print(plt.style.available)` 
>- 比如：`plt.style.use("ggplot")`

```python
import matplotlib.pyplot as plt  
import numpy as np  
  
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签  
plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号  
  
# 查看所有可用样式  
print(plt.style.available)  
  
# 应用样式（如 "ggplot"、"seaborn"、"fivethirtyeight"）  
plt.style.use("seaborn-v0_8-dark-palette")  
  
# 生成数据  
x = np.linspace(0, 10, 100)  
y1 = np.sin(x)  
y2 = np.cos(x)  
  
fig, ax = plt.subplots(figsize=(8, 4))  
ax.plot(x, y1, label="sin(x)")  
ax.plot(x, y2, label="cos(x)")  
  
# 标题：字体16，加粗，颜色深蓝色  
ax.set_title("定制标题示例", fontsize=16, fontweight="bold", color="darkblue")  
# 坐标轴标签：字体12，颜色灰色  
ax.set_xlabel("x 轴", fontsize=12, color="gray")  
ax.set_ylabel("y 轴", fontsize=12, color="gray")  
# 图例：位置右上角，字体12，带阴影，背景白色  
ax.legend(loc="upper right", fontsize=12, shadow=True, facecolor="white")  
# 设置 x 轴刻度位置和标签  
ax.set_xticks(np.arange(0, 11, 2))  
ax.set_xticklabels(["零", "二", "四", "6", "八", "10"], fontsize=12, color="gray")  
# 设置 y 轴刻度位置和标签  
ax.set_yticks(np.arange(-1, 1.5, 0.5))  
ax.set_yticklabels(["-1","-0.5", "0","0.5", "1"], fontsize=12, color="gray")  
# 设置 y 轴刻度旋转45度  
ax.tick_params(axis="y", rotation=45, labelsize=12)  
  
# 添加网格线：虚线，灰色，透明度0.5  
ax.grid(True, linestyle="--", color="gray", alpha=0.5,)  
  
# 自动调整布局  
plt.tight_layout()  
  
  
# 显示图形  
plt.show()
```

# 2.进阶绘图
### 1.子图布局
#### 基础子图：`subplots()`
最常用的子图创建方式，指定行数和列数
```python
import matplotlib.pyplot as plt  
import numpy as np  
  
fig, axes = plt.subplots(nrows=2, ncols=3, figsize=(12, 6))  # 2行3列  
x = np.linspace(0, 10, 100)  
  
# 遍历子图绘图  
for i, ax in enumerate(axes.flat):  
    ax.plot(x, np.sin(x) * (i+1))  
    ax.set_title(f"fig {i+1}")  
  
plt.tight_layout()  
plt.show()
```

#### 灵活布局：`GridSpec`
适合复杂的子图布局（如跨行列的子图）
```python
import matplotlib.pyplot as plt  
import matplotlib.gridspec as gridspec  
import numpy as np  
  
fig = plt.figure(figsize=(10, 6))  
gs = gridspec.GridSpec(nrows=3, ncols=3, figure=fig)  # 3行3列的网格  
  
# 创建子图：ax1 占第1行全部，ax2 占第2-3行前2列，ax3 占第2-3行最后1列  
ax1 = fig.add_subplot(gs[0, :])  
ax2 = fig.add_subplot(gs[1:, :2])  
ax3 = fig.add_subplot(gs[1:, 2])  
  
x = np.linspace(0, 10, 100)  
ax1.plot(x, np.sin(x))  
ax2.plot(x, np.cos(x))  
ax3.plot(x, np.tan(x))  
  
plt.tight_layout()  
plt.show()
```

### 2. 坐标轴高级控制
#### 双坐标轴：`twinx()` | `twiny()`
##### 用于在同一子图中显示两个不同量级的 y 轴
```python
import matplotlib.pyplot as plt  
import numpy as np  
  
x = np.linspace(0, 10, 100)  
y1 = np.sin(x)  # 量级小  
y2 = np.exp(x)   # 量级大  
  
fig, ax1 = plt.subplots(figsize=(8, 4))  
  
# 第一个 y 轴  
ax1.plot(x, y1, color="blue")  
ax1.set_ylabel("sin(x)", color="blue")  
ax1.tick_params(axis="y", labelcolor="blue")  
  
# 第二个 y 轴（共享 x 轴）  
ax2 = ax1.twinx()  
ax2.plot(x, y2, color="red")  
ax2.set_ylabel("exp(x)", color="red")  
ax2.tick_params(axis="y", labelcolor="red")  
  
plt.title("double y-axis plot")  
plt.show()
```

##### 用于在同一子图中显示两个不同量级的 x 轴
```python
import matplotlib.pyplot as plt  
import numpy as np  
  
x1 = np.linspace(0, 10, 100)  
x2 = np.linspace(0, 1, 100)  
y= x1**2 + 2*x1 + 1  
  
fig, ax1 = plt.subplots(figsize=(8, 4))  
  
# 第一个 x 轴  
ax1.plot(x1, y, color="blue")  
ax1.set_ylabel("sin(x)", color="blue")  
ax1.tick_params(axis="y", labelcolor="blue")  
  
# 第二个 x 轴（共享 y 轴）  
ax2 = ax1.twiny()  
ax2.plot(x2, y, color="red")  
ax2.set_ylabel("exp(x)", color="red")  
ax2.tick_params(axis="y", labelcolor="red")  
  
plt.title("double x-axis plot")  
plt.show()
```

#### 对数坐标轴
用于展示指数级变化的数据
```python
import matplotlib.pyplot as plt  
import numpy as np  
  
x = np.linspace(0, 10, 100)  
y = np.exp(x)  
  
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))  
  
# 普通坐标轴  
ax1.plot(x, y)  
ax1.set_title("common coordinate axis")  
  
# 对数坐标轴（y 轴）  
ax2.semilogy(x, y)  # semilogx（x轴对数）、loglog（双轴对数）  
ax2.set_title("y axis in logarithmic scale")  
  
plt.tight_layout()  
plt.show()
```

#### 注释与文本
##### 文本添加：`text()`
在指定位置添加文本：
```python
import matplotlib.pyplot as plt  
import numpy as np  
  
x = np.linspace(0, 10, 100)  
y = np.sin(x)  
  
fig, ax = plt.subplots(figsize=(8, 4))  
ax.plot(x, y)  
  
# 在 (5, 0.5) 位置添加文本  
ax.text(5, 0.5, "this is a text", fontsize=12, color="red", ha="center")  
  
plt.show()
```
>[!tip]
>- `ha`：水平对齐（`"center"`、`"left"`、`"right"`）；
>- `va`：垂直对齐（`"center"`、`"top"`、`"bottom"`）

##### 箭头注释：`annotate()`
用于标注数据点，带箭头指向目标位置

### 3.与pandas的配合

```python
import matplotlib.pyplot as plt  
import pandas as pd  
import numpy as np  
  
# 创建 DataFramenp.random.seed(42)  
data = pd.DataFrame({  
    "A": np.random.randn(100).cumsum(),  
    "B": np.random.randn(100).cumsum(),  
    "C": np.random.randn(100).cumsum()  
}, index=pd.date_range("2023-01-01", periods=100))  
  
# 直接用 DataFrame 绘图  
fig, ax = plt.subplots(figsize=(10, 6))  
data.plot(ax=ax, title="Pandas DataFrame Plotting")  
ax.set_xlabel("date")  
ax.set_ylabel("value")  
  
plt.show()
```
#### 案例
```python
import matplotlib.pyplot as plt  
import pandas as pd  
import numpy as np  
plt.rcParams['font.sans-serif'] = ['SimHei']  # 用来正常显示中文标签  
plt.rcParams['axes.unicode_minus'] = False  # 用来正常显示负号  
# 模拟股票数据  
np.random.seed(42)  
dates = pd.date_range("2023-01-01", periods=100)  
close_price = np.random.randn(100).cumsum() + 100  
volume = np.random.randint(100000, 500000, size=100)  
  
data = pd.DataFrame({"close": close_price, "volume": volume}, index=dates)  
  
# 创建双轴子图  
fig, ax1 = plt.subplots(figsize=(12, 6))  
ax2 = ax1.twinx()  
  
# 绘制收盘价折线图  
ax1.plot(data.index, data["close"], color="blue", label="收盘价")  
ax1.set_ylabel("收盘价", color="blue")  
ax1.tick_params(axis="y", labelcolor="blue")  
  
# 绘制成交量柱状图  
ax2.bar(data.index, data["volume"], color="gray", alpha=0.3, label="成交量")  
ax2.set_ylabel("成交量", color="gray")  
ax2.tick_params(axis="y", labelcolor="gray")  
  
# 合并图例  
lines1, labels1 = ax1.get_legend_handles_labels()  
lines2, labels2 = ax2.get_legend_handles_labels()  
ax1.legend(lines1 + lines2, labels1 + labels2, loc="upper left")  
  
plt.title("股票数据可视化")  
plt.show()
```
