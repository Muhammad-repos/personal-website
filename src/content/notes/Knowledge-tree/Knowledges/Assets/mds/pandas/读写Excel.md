### 先明确前置知识

Pandas 本身不直接解析 Excel 文件，必须依赖**第三方引擎**：

-   读 Excel：`.xls` 用 `xlrd`，`.xlsx` 用 `openpyxl`；
-   写 Excel：`.xls` 用 `xlwt`，`.xlsx` 用 `openpyxl`/`xlsxwriter`（最常用）。

___

## 一、读 Excel：pd.read\_excel vs pd.ExcelFile

两者都是读 Excel 文件，核心区别是「文件打开方式」——`read_excel` 是「便捷式单次读取」，`ExcelFile` 是「句柄式多次读取」（更高效）。

### 先准备测试 Excel 文件

假设我们有 `sales_data.xlsx`，包含两个 sheet：

-   `sheet1`：1 月销售数据（姓名、销售额）；
-   `sheet2`：2 月销售数据（姓名、销售额）。

### 1\. pd.read\_excel：便捷式读取（优先用）

**核心逻辑**：直接读取 Excel 文件的指定 sheet，语法简洁，适合「单次读取 1 个 / 多个 sheet」。

#### 基本用法

```python
import pandas as pd

# 1. 读取单个 sheet（默认读第一个 sheet）
df1 = pd.read_excel(
    "sales_data.xlsx",
    sheet_name="sheet1",  # 指定sheet名（也可用索引0/1）
    engine="openpyxl",    # 读.xlsx必须指定openpyxl
    header=0,             # 第0行作为列名（默认）
    usecols=["姓名", "销售额"]  # 只读取指定列（节省内存）
)
print("sheet1 数据：")
print(df1)

# 2. 读取多个 sheet（返回字典：{sheet名: DataFrame}）
df_dict = pd.read_excel("sales_data.xlsx", sheet_name=["sheet1", "sheet2"], engine="openpyxl")
print("\nsheet2 数据：")
print(df_dict["sheet2"])
```

### 2\. pd.ExcelFile：句柄式读取（适合多次读同文件）

**核心逻辑**：先打开 Excel 文件生成「文件句柄」，再从句柄中读取不同 sheet—— 优点是「只打开一次文件」，多次读取时效率远高于 `read_excel`（避免重复 IO）。

#### 基本用法

```python
# 第一步：打开文件生成句柄（仅打开一次）
excel_file = pd.ExcelFile("sales_data.xlsx", engine="openpyxl")

# 第二步：从句柄读取多个sheet（无需重复打开文件）
df1 = excel_file.parse("sheet1", usecols=["姓名", "销售额"])
df2 = excel_file.parse("sheet2", usecols=["姓名", "销售额"])

print("ExcelFile 读取 sheet1：")
print(df1)
print("\nExcelFile 读取 sheet2：")
print(df2)

# 可选：关闭句柄（自动关闭，也可手动）
excel_file.close()
```

### 读 Excel 工具对比

| 工具           | 核心优势             | 适用场景                               |
| -------------- | -------------------- | -------------------------------------- |
| pd.read\_excel | 语法简洁，一行搞定   | 单次读取 1 个 / 少量 sheet，快速验证   |
| pd.ExcelFile   | 多次读取同文件效率高 | 读取同一个 Excel 的多个 sheet（≥3 个） |

___

## 二、写 Excel：pd.to\_excel vs pd.ExcelWriter

两者都是写 Excel 文件，核心区别是「是否支持多 sheet 写入」——`to_excel` 是「便捷式单次写入」，`ExcelWriter` 是「句柄式多 sheet 写入」（支持自定义格式）。

### 先准备要写入的 DataFrame

```python
import pandas as pd

# 1月数据
df_jan = pd.DataFrame({
    "姓名": ["张三", "李四", "王五"],
    "销售额": [5000, 3000, 4500]
})

# 2月数据
df_feb = pd.DataFrame({
    "姓名": ["张三", "李四", "赵六"],
    "销售额": [6000, 2800, 5200]
})
```

### 1\. pd.to\_excel：便捷式写入（单次写 1 个 sheet）

**核心逻辑**：直接将单个 DataFrame 写入 Excel 的指定 sheet，语法简洁，但**多次调用会覆盖文件**（无法写多个 sheet）。

#### 基本用法

```python
# 写入 sheet1（覆盖原有文件）
df_jan.to_excel(
    "output_sales.xlsx",
    sheet_name="1月",
    engine="openpyxl",  # 写.xlsx用openpyxl/xlsxwriter
    index=False,        # 不写入行索引（关键！避免多余列）
    header=True         # 写入列名（默认）
)
print("已写入1月数据到 output_sales.xlsx")

# ❌ 错误：再次调用会覆盖文件，看不到1月数据
# df_feb.to_excel("output_sales.xlsx", sheet_name="2月", index=False)
```

### 2\. pd.ExcelWriter：句柄式写入（多 sheet / 自定义格式）

**核心逻辑**：先创建「写入句柄」，再将多个 DataFrame 写入不同 sheet，最后保存 —— 支持多 sheet 写入，还能结合引擎实现复杂格式（如单元格样式、图表）。

#### 场景 1：写入多个 sheet（核心用法）

```python
# 第一步：创建写入句柄（mode="w" 覆盖，"a" 追加）
with pd.ExcelWriter("output_sales_multi.xlsx", engine="openpyxl", mode="w") as writer:
    # 第二步：写入多个sheet到同一个文件
    df_jan.to_excel(writer, sheet_name="1月", index=False)
    df_feb.to_excel(writer, sheet_name="2月", index=False)

print("已写入1月+2月数据到 output_sales_multi.xlsx")
```

#### 场景 2：结合 xlsxwriter 写复杂格式（图表 / 公式）

`xlsxwriter` 仅支持写，不支持读，但能实现「单元格样式、公式、图表」等高级功能：

```python
# 创建xlsxwriter引擎的句柄
with pd.ExcelWriter("sales_with_style.xlsx", engine="xlsxwriter") as writer:
    # 写入数据
    df_jan.to_excel(writer, sheet_name="1月", index=False)
    
    # 获取xlsxwriter的工作簿和工作表对象（自定义格式）
    workbook = writer.book
    worksheet = writer.sheets["1月"]
    
    # 1. 设置单元格格式（销售额列加粗）
    bold_format = workbook.add_format({"bold": True, "font_color": "red"})
    worksheet.set_column("B:B", 15, bold_format)  # B列（销售额）加粗+红色+宽度15
    
    # 2. 添加公式（计算总销售额）
    worksheet.write("B5", "=SUM(B2:B4)")  # B5单元格写入求和公式
    worksheet.write("A5", "总销售额", bold_format)
    
    # 3. 添加柱状图
    chart = workbook.add_chart({"type": "column"})
    chart.add_series({
        "name": "销售额",
        "categories": "=1月!$A$2:$A$4",
        "values": "=1月!$B$2:$B$4"
    })
    worksheet.insert_chart("D2", chart)  # D2位置插入图表

print("已写入带格式/图表的Excel文件")
```

### 写 Excel 工具对比

| 工具           | 核心优势                 | 适用场景                                    |
| -------------- | ------------------------ | ------------------------------------------- |
| pd.to\_excel   | 语法简洁，一行搞定       | 单次写入 1 个 sheet，快速导出               |
| pd.ExcelWriter | 支持多 sheet、自定义格式 | 写入多个 sheet，或需要设置单元格样式 / 图表 |

___

## 三、核心引擎：openpyxl vs xlsxwriter（关键区别）

这是最容易踩坑的点 —— 不同引擎支持的功能、文件格式完全不同，下表是核心对比：

| 维度                 | openpyxl                        | xlsxwriter                           |
| -------------------- | ------------------------------- | ------------------------------------ |
| 支持操作             | 读 + 写 .xlsx                   | 仅写 .xlsx（不支持读）               |
| 多 sheet 写入        | 支持                            | 支持                                 |
| 追加写入（mode="a"） | 支持（可往已有 Excel 加 sheet） | 不支持（仅 mode="w"，覆盖文件）      |
| 高级格式支持         | 基础样式（加粗、颜色），无图表  | 全量样式（图表、公式、条件格式）     |
| 兼容性               | 兼容所有.xlsx，支持追加         | 不支持追加，适合全新写入复杂格式     |
| 常用场景             | 读.xlsx、追加写入、简单写       | 全新写入、需要图表 / 公式 / 复杂样式 |

### 引擎选择实战技巧

1.  **读.xlsx 文件**：必选 `openpyxl`（xlrd 新版不支持.xlsx）；
2.  **简单写.xlsx（单 / 多 sheet，无格式）**：选 `openpyxl`（支持追加）；
3.  **复杂写.xlsx（图表 / 公式 / 样式）**：选 `xlsxwriter`（但只能全新写入）；
4.  **写.xls 文件**：用 `xlwt`（但有 65536 行限制，尽量不用）。

#### 示例：openpyxl 追加写入（往已有 Excel 加 sheet）

```python
# 往已有的 output_sales_multi.xlsx 追加3月数据
df_mar = pd.DataFrame({
    "姓名": ["张三", "赵六", "钱七"],
    "销售额": [5800, 4900, 6200]
})

# mode="a" 追加模式（仅openpyxl支持）
with pd.ExcelWriter("output_sales_multi.xlsx", engine="openpyxl", mode="a") as writer:
    df_mar.to_excel(writer, sheet_name="3月", index=False)

print("已追加3月数据到原有Excel文件")
```

___

### 总结

1.  **读 Excel**：单次读用 `pd.read_excel`，多次读同文件用 `pd.ExcelFile`（效率更高），读.xlsx 引擎选 `openpyxl`；
2.  **写 Excel**：单次写用 `pd.to_excel`，多 sheet / 自定义格式用 `pd.ExcelWriter`；
3.  **引擎选择**：
    -   读 / 追加写 / 简单写 → `openpyxl`；
    -   全新写 + 复杂格式（图表 / 公式）→ `xlsxwriter`；
    -   避免用.xls（xlwt/xlrd），优先用.xlsx。
