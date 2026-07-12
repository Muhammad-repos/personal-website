# PySide6 的布局管理器

（Layout Managers）是构建响应式界面的核心，它**完全替代了手动设置控件坐标的方式**，能够自动处理窗口大小变化、不同屏幕分辨率、控件显示 / 隐藏等场景。所有布局类都继承自抽象基类 `QLayout`，它们的核心职责是：

-   自动计算并设置控件的位置和大小
-   响应窗口的大小调整事件
-   管理控件之间的间距和边距
-   处理控件的显示和隐藏状态变化

## 一、布局系统的核心共同点

1.  **都继承自 QLayout**：拥有相同的基础接口
2.  **都通过 `addWidget()` 添加控件**：这是最常用的方法
3.  **都支持嵌套使用**：可以将一个布局作为子布局添加到另一个布局中
4.  **都可以设置间距和边距**：控制控件之间和布局边缘的空白
5.  **都与 QWidget 配合使用**：通过 `widget.setLayout(layout)` 将布局应用到窗口或控件上

## 二、核心布局类详解

### 1\. QHBoxLayout - 水平布局

**作用**：将控件从左到右水平排列在一行中

```python
from PySide6.QtWidgets import QWidget, QHBoxLayout, QPushButton

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("水平布局")
        self.resize(400, 100)
        
        # 创建水平布局
        layout = QHBoxLayout(self)
        
        # 添加控件
        layout.addWidget(QPushButton("按钮1"))
        layout.addWidget(QPushButton("按钮2"))
        layout.addWidget(QPushButton("按钮3"))
```

**核心特点**：

-   所有控件高度相同（默认等于最高控件的高度）
-   宽度根据拉伸因子自动分配
-   当窗口宽度不足时，控件会被压缩到最小宽度

**常用方法**：

-   `addWidget(widget, stretch=0, alignment=Qt.Alignment())`：添加控件
-   `addLayout(layout, stretch=0)`：添加子布局
-   `addStretch(stretch=0)`：添加可拉伸的空白区域
-   `setSpacing(spacing)`：设置控件之间的间距
-   `setContentsMargins(left, top, right, bottom)`：设置布局的边距

**适用场景**：

-   按钮组（如确定 / 取消按钮）
-   工具栏
-   水平排列的标签和输入框
-   任何需要水平排列控件的场景

___

### 2\. QVBoxLayout - 垂直布局

**作用**：将控件从上到下垂直排列在一列中

```python
from PySide6.QtWidgets import QWidget, QVBoxLayout, QPushButton

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("垂直布局")
        self.resize(200, 300)
        
        layout = QVBoxLayout(self)
        
        layout.addWidget(QPushButton("按钮1"))
        layout.addWidget(QPushButton("按钮2"))
        layout.addWidget(QPushButton("按钮3"))
        # 添加一个可拉伸的空白区域，将按钮推到顶部
        layout.addStretch()
```

**核心特点**：

-   所有控件宽度相同（默认等于最宽控件的宽度）
-   高度根据拉伸因子自动分配
-   当窗口高度不足时，控件会被压缩到最小高度

**常用方法**：与 QHBoxLayout 完全相同（因为它们都继承自 QBoxLayout）

**适用场景**：

-   表单的垂直排列
-   侧边栏菜单
-   列表式界面
-   任何需要垂直排列控件的场景

___

### 3\. QGridLayout - 网格布局

**作用**：将控件排列在二维网格中，可以跨行跨列

```python
from PySide6.QtWidgets import QWidget, QGridLayout, QPushButton

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("网格布局")
        self.resize(300, 200)
        
        layout = QGridLayout(self)
        
        # 添加控件到指定的行和列（行号, 列号）
        layout.addWidget(QPushButton("(0,0)"), 0, 0)
        layout.addWidget(QPushButton("(0,1)"), 0, 1)
        layout.addWidget(QPushButton("(0,2)"), 0, 2)
        
        layout.addWidget(QPushButton("(1,0)"), 1, 0)
        # 跨行跨列：(行号, 列号, 跨行数, 跨列数)
        layout.addWidget(QPushButton("(1,1) 跨2列"), 1, 1, 1, 2)
        
        layout.addWidget(QPushButton("(2,0) 跨2行"), 2, 0, 2, 1)
        layout.addWidget(QPushButton("(2,1)"), 2, 1)
        layout.addWidget(QPushButton("(2,2)"), 2, 2)
        layout.addWidget(QPushButton("(3,1)"), 3, 1)
        layout.addWidget(QPushButton("(3,2)"), 3, 2)
```

**核心特点**：

-   最灵活的布局管理器，可以创建复杂的网格界面
-   支持控件跨行跨列显示
-   行和列都可以设置拉伸因子
-   单元格大小会根据内容自动调整

**常用方法**：

-   `addWidget(widget, row, column, rowSpan=1, columnSpan=1, alignment=Qt.Alignment())`：添加控件
-   `addLayout(layout, row, column, rowSpan=1, columnSpan=1)`：添加子布局
-   `setRowStretch(row, stretch)`：设置指定行的拉伸因子
-   `setColumnStretch(column, stretch)`：设置指定列的拉伸因子
-   `setRowMinimumHeight(row, height)`：设置指定行的最小高度
-   `setColumnMinimumWidth(column, width)`：设置指定列的最小宽度

**适用场景**：

-   计算器键盘
-   表格形式的表单
-   复杂的仪表板界面
-   任何需要二维排列控件的场景

___

### 4\. QFormLayout - 表单布局

**作用**：专门用于创建标签 - 输入框对的表单界面

```python
from PySide6.QtWidgets import QWidget, QFormLayout, QLineEdit, QSpinBox, QComboBox

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("表单布局")
        self.resize(300, 200)
        
        layout = QFormLayout(self)
        
        # 添加标签-输入框对
        layout.addRow("用户名:", QLineEdit())
        layout.addRow("密码:", QLineEdit(echoMode=QLineEdit.Password))
        layout.addRow("年龄:", QSpinBox())
        
        # 也可以添加多个控件到一行
        gender_combo = QComboBox()
        gender_combo.addItems(["男", "女", "其他"])
        layout.addRow("性别:", gender_combo)
        
        # 添加一个占据整行的控件
        layout.addRow(QPushButton("注册"))
```

**核心特点**：

-   专门为表单设计，自动对齐标签和输入框
-   标签默认右对齐，输入框左对齐
-   支持添加占据整行的控件
-   可以设置标签的对齐方式和换行策略

**常用方法**：

-   `addRow(label, field)`：添加标签 - 输入框对
-   `addRow(widget)`：添加占据整行的控件
-   `addRow(labelText, widget1, widget2)`：添加一行包含多个控件
-   `setLabelAlignment(alignment)`：设置标签的对齐方式
-   `setFieldGrowthPolicy(policy)`：设置输入框的增长策略

**适用场景**：

-   用户注册 / 登录表单
-   设置 / 首选项界面
-   数据录入界面
-   任何需要标签 - 输入框对的场景

**与 QGridLayout 的区别**：

-   QFormLayout 是专门为表单优化的，代码更简洁
-   QFormLayout 自动处理标签和输入框的对齐
-   QFormLayout 在不同平台上有更好的原生外观
-   QGridLayout 更灵活，但需要手动管理行列

___

### 5\. QStackedLayout - 堆叠布局

**作用**：将多个控件堆叠在一起，同一时间只显示一个控件

```python
from PySide6.QtWidgets import (QWidget, QStackedLayout, QVBoxLayout, 
                               QPushButton, QLabel)

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("堆叠布局")
        self.resize(300, 200)
        
        main_layout = QVBoxLayout(self)
        
        # 创建堆叠布局
        self.stacked_layout = QStackedLayout()
        
        # 添加多个页面
        self.stacked_layout.addWidget(QLabel("页面 1"))
        self.stacked_layout.addWidget(QLabel("页面 2"))
        self.stacked_layout.addWidget(QLabel("页面 3"))
        
        # 创建切换按钮
        btn_layout = QHBoxLayout()
        btn1 = QPushButton("显示页面1")
        btn1.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(0))
        btn2 = QPushButton("显示页面2")
        btn2.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(1))
        btn3 = QPushButton("显示页面3")
        btn3.clicked.connect(lambda: self.stacked_layout.setCurrentIndex(2))
        
        btn_layout.addWidget(btn1)
        btn_layout.addWidget(btn2)
        btn_layout.addWidget(btn3)
        
        main_layout.addLayout(self.stacked_layout)
        main_layout.addLayout(btn_layout)
```

**核心特点**：

-   多个控件共享同一个显示区域
-   同一时间只有一个控件可见
-   可以通过索引或控件指针切换显示的控件
-   非常适合实现多页面界面

**常用方法**：

-   `addWidget(widget)`：添加控件到堆叠布局
-   `setCurrentIndex(index)`：设置当前显示的控件索引
-   `setCurrentWidget(widget)`：设置当前显示的控件
-   `currentIndex()`：获取当前显示的控件索引
-   `currentWidget()`：获取当前显示的控件

**适用场景**：

-   向导界面（Wizard）
-   标签页界面（QTabWidget 内部就是使用 QStackedLayout）
-   多步骤操作界面
-   任何需要切换显示内容的场景

___

### 6\. QBoxLayout - 抽象基类

QHBoxLayout 和 QVBoxLayout 都继承自 QBoxLayout，它提供了所有水平和垂直布局的通用功能。你很少会直接使用 QBoxLayout，但了解它的方法对理解水平和垂直布局很有帮助。

```python
# 创建水平布局（等同于 QHBoxLayout）
layout = QBoxLayout(QBoxLayout.LeftToRight)
# 创建垂直布局（等同于 QVBoxLayout）
layout = QBoxLayout(QBoxLayout.TopToBottom)
```

## 三、特殊布局容器

这些不是严格意义上的布局管理器，而是带有内置布局功能的控件容器：

### 1\. QSplitter - 分割器

**作用**：创建可拖动的分割条，允许用户调整子控件的大小

```python
from PySide6.QtWidgets import QWidget, QSplitter, QTextEdit, Qt

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("分割器")
        self.resize(600, 400)
        
        layout = QVBoxLayout(self)
        
        # 创建水平分割器
        splitter = QSplitter(Qt.Horizontal)
        splitter.addWidget(QTextEdit("左侧面板"))
        splitter.addWidget(QTextEdit("右侧面板"))
        
        # 设置初始大小
        splitter.setSizes([200, 400])
        
        layout.addWidget(splitter)
```

**特点**：

-   支持水平和垂直分割
-   用户可以拖动分割条调整大小
-   可以嵌套使用创建复杂的分割界面
-   支持保存和恢复分割状态

### 2\. QScrollArea - 滚动区域

**作用**：为内容超出窗口大小的控件提供滚动功能

```python
from PySide6.QtWidgets import QWidget, QScrollArea, QVBoxLayout, QPushButton

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("滚动区域")
        self.resize(300, 300)
        
        # 创建滚动区域
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)  # 重要：让滚动区域自动调整内容大小
        
        # 创建内容容器
        content_widget = QWidget()
        layout = QVBoxLayout(content_widget)
        
        # 添加很多按钮
        for i in range(20):
            layout.addWidget(QPushButton(f"按钮 {i+1}"))
        
        # 将内容容器设置到滚动区域
        scroll_area.setWidget(content_widget)
        
        # 将滚动区域添加到主窗口
        main_layout = QVBoxLayout(self)
        main_layout.addWidget(scroll_area)
```

**特点**：

-   自动添加水平和垂直滚动条
-   支持鼠标滚轮和拖动滚动
-   可以设置滚动条的显示策略
-   是处理大量内容的标准方式

### 3\. QTabWidget - 标签页控件

**作用**：创建带有标签页的多页面界面（内部使用 QStackedLayout）

```python
from PySide6.QtWidgets import QWidget, QTabWidget, QVBoxLayout, QLabel

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("标签页")
        self.resize(400, 300)
        
        layout = QVBoxLayout(self)
        
        # 创建标签页控件
        tab_widget = QTabWidget()
        
        # 添加标签页
        tab_widget.addTab(QLabel("这是第一个标签页的内容"), "标签1")
        tab_widget.addTab(QLabel("这是第二个标签页的内容"), "标签2")
        tab_widget.addTab(QLabel("这是第三个标签页的内容"), "标签3")
        
        layout.addWidget(tab_widget)
```

**特点**：

-   提供直观的标签切换界面
-   支持关闭标签页
-   支持标签页的位置（顶部、底部、左侧、右侧）
-   是最常用的多页面界面解决方案

## 四、布局系统的核心概念详解

### 1\. 拉伸因子（Stretch Factor）

拉伸因子决定了控件在可用空间中分配到的额外空间比例。默认拉伸因子为 0，表示控件不会获得额外空间。

```python
layout = QHBoxLayout()
# 按钮1获得1份额外空间，按钮2获得2份额外空间
layout.addWidget(QPushButton("按钮1"), 1)
layout.addWidget(QPushButton("按钮2"), 2)
# 按钮3拉伸因子为0，保持最小宽度
layout.addWidget(QPushButton("按钮3"))
```

**效果**：当窗口宽度增加时，按钮 1 和按钮 2 会按 1:2 的比例分配额外空间，按钮 3 宽度保持不变。

### 2\. 间距（Spacing）和边距（Margins）

-   **间距**：控件之间的空白距离
-   **边距**：布局边缘与窗口边框之间的空白距离

```python
layout = QHBoxLayout()
layout.setSpacing(20)  # 设置控件之间的间距为20像素
layout.setContentsMargins(10, 20, 10, 20)  # 左、上、右、下边距
```

### 3\. 对齐方式（Alignment）

可以通过 `addWidget()` 的 `alignment` 参数设置控件在布局单元格中的对齐方式：

```python
from PySide6.QtCore import Qt

layout = QVBoxLayout()
# 按钮水平居中对齐
layout.addWidget(QPushButton("居中"), alignment=Qt.AlignCenter)
# 按钮右对齐
layout.addWidget(QPushButton("右对齐"), alignment=Qt.AlignRight)
# 按钮顶部左对齐
layout.addWidget(QPushButton("顶部左对齐"), alignment=Qt.AlignTop | Qt.AlignLeft)
```

### 4\. 大小策略（Size Policy）

大小策略决定了控件在布局中如何调整自己的大小。每个控件都有水平和垂直两个方向的大小策略。

```python
from PySide6.QtWidgets import QSizePolicy

button = QPushButton("按钮")
# 设置水平方向可以扩展，垂直方向保持固定
button.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
```

**常用大小策略**：

-   `QSizePolicy.Fixed`：大小固定，不随布局变化
-   `QSizePolicy.Minimum`：大小为最小尺寸，可以扩展
-   `QSizePolicy.Maximum`：大小为最大尺寸，可以缩小
-   `QSizePolicy.Preferred`：首选大小，可大可小（默认）
-   `QSizePolicy.Expanding`：尽可能扩展，占据所有可用空间
-   `QSizePolicy.Ignored`：忽略大小提示，任意调整大小

## 五、布局类对比表

|布局类|排列方式|灵活性|适用场景|代码复杂度|
|---|---|---|---|---|
|QHBoxLayout|水平一行|低|按钮组、工具栏|低|
|QVBoxLayout|垂直一列|低|侧边栏、列表|低|
|QGridLayout|二维网格|高|计算器、复杂表单|中|
|QFormLayout|标签 - 输入框对|中|数据录入表单|低|
|QStackedLayout|堆叠|中|多页面、向导|中|
|QSplitter|可拖动分割|高|多面板界面|中|
|QScrollArea|滚动|高|大量内容|中|
|QTabWidget|标签页|中|多页面应用|低|

## 六、最佳实践和常见问题

### 1\. 如何选择合适的布局

-   **简单水平 / 垂直排列**：使用 QHBoxLayout/QVBoxLayout
-   **表单界面**：优先使用 QFormLayout 而不是 QGridLayout
-   **复杂二维排列**：使用 QGridLayout
-   **多页面界面**：使用 QTabWidget 或 QStackedLayout
-   **需要用户调整大小**：使用 QSplitter
-   **内容超出窗口**：使用 QScrollArea

### 2\. 常见错误和解决方案

-   **错误 1**：直接对 QMainWindow 设置布局
    
    -   **解决方案**：必须先设置中心部件，然后对中心部件设置布局
    
    ```python
    # 错误
    self.setLayout(layout)
    
    # 正确
    central_widget = QWidget()
    central_widget.setLayout(layout)
    self.setCentralWidget(central_widget)
    ```
    
-   **错误 2**：忘记调用 `setWidgetResizable(True)` 导致 QScrollArea 不工作
    
    -   **解决方案**：创建 QScrollArea 后必须设置这个属性
    
    ```python
    scroll_area = QScrollArea()
    scroll_area.setWidgetResizable(True)  # 重要！
    ```
    
-   **错误 3**：控件没有显示，因为没有添加到布局中
    
    -   **解决方案**：所有控件都必须通过 `addWidget()` 添加到布局中
-   **错误 4**：手动设置控件的位置和大小，与布局冲突
    
    -   **解决方案**：使用布局后不要调用 `setGeometry()` 或 `move()` 方法

### 3\. 高级技巧

-   **嵌套布局**：组合使用不同的布局可以创建任何复杂的界面
-   **使用 QSpacerItem**：添加固定大小的空白区域
-   **动态添加 / 删除控件**：布局会自动调整
-   **保存和恢复布局状态**：QSplitter 和 QMainWindow 支持保存状态

## 七、综合示例：嵌套布局

下面是一个综合使用多种布局的示例，展示了如何构建一个典型的应用界面：

```python
from PySide6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                               QPushButton, QTextEdit, QLineEdit, QLabel)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("综合布局示例")
        self.resize(800, 600)
        
        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 主布局：垂直布局
        main_layout = QVBoxLayout(central_widget)
        
        # 顶部：搜索栏（水平布局）
        search_layout = QHBoxLayout()
        search_layout.addWidget(QLabel("搜索:"))
        search_layout.addWidget(QLineEdit())
        search_layout.addWidget(QPushButton("搜索"))
        main_layout.addLayout(search_layout)
        
        # 中间：内容区域（水平布局）
        content_layout = QHBoxLayout()
        
        # 左侧：侧边栏（垂直布局）
        sidebar_layout = QVBoxLayout()
        sidebar_layout.addWidget(QPushButton("文件"))
        sidebar_layout.addWidget(QPushButton("编辑"))
        sidebar_layout.addWidget(QPushButton("视图"))
        sidebar_layout.addStretch()  # 添加拉伸因子，将按钮推到顶部
        content_layout.addLayout(sidebar_layout, 1)  # 拉伸因子1
        
        # 右侧：主内容区
        content_layout.addWidget(QTextEdit(), 3)  # 拉伸因子3
        
        main_layout.addLayout(content_layout)
        
        # 底部：状态栏（水平布局）
        status_layout = QHBoxLayout()
        status_layout.addWidget(QLabel("就绪"))
        status_layout.addStretch()
        status_layout.addWidget(QLabel("版本: 1.0"))
        main_layout.addLayout(status_layout)

if __name__ == "__main__":
    import sys
    from PySide6.QtWidgets import QApplication
    
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
```

