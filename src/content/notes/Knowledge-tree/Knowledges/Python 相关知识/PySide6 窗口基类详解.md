# PySide6 窗口基类详解：从 QWidget 到 QMdiSubWindow

在 PySide6 中，所有可以作为独立窗口使用的类都继承自 `QWidget`。当你创建 `class MyWindow\(xx\)` 时，`xx` 可以是以下任何一个窗口基类，它们各自有不同的设计目的和功能特性。

## 一、所有窗口基类的共同点

1. **都继承自 QWidget**：这是所有用户界面组件的根类

2. **都可以作为顶级窗口**：当没有指定父对象时，会显示为独立的窗口

3. **都支持窗口标志**：可以通过 `setWindowFlags()` 设置窗口样式（无边框、置顶、工具窗口等）

4. **都可以包含其他控件**：可以添加按钮、标签、文本框等任何 QWidget 子类

5. **都有相同的生命周期**：`__init__` → `show()` → `close()` → 销毁

## 二、核心窗口基类详解

### 1\. QWidget \- 最基础的窗口类

```python
from PySide6.QtWidgets import QWidget

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("基础窗口")
        self.resize(400, 300)
```

**核心特点**：

- 所有用户界面组件的基类，最纯粹的窗口

- 没有预设的布局和任何内置组件

- 完全空白的画布，需要你自己添加所有元素

- 内存占用最小，性能最好

**典型使用场景**：

- 简单的自定义窗口

- 作为其他复杂窗口的子部件

- 不需要菜单栏、工具栏等标准窗口元素的场景

- 自定义控件的基类

**优点**：最灵活、最轻量、完全可控
**缺点**：没有任何内置功能，所有东西都需要自己实现

---

### 2\. QMainWindow \- 主应用窗口类

```python
from PySide6.QtWidgets import QMainWindow

class MyWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("主应用窗口")
        self.resize(800, 600)
        
        # 必须设置中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        self.main_layout = QVBoxLayout()
         # 布局必须挂载到central_widget 中，不能是self，也就是说不能是QMainWindow
        central_widget.setLayout(self.main_layout)
        
        # 可以添加菜单栏、工具栏、状态栏等
        self.statusBar().showMessage("状态栏信息")
```

**核心特点**：

- 专门设计用于应用程序的主窗口

- 内置标准窗口框架：菜单栏、工具栏、状态栏、停靠窗口

- 有一个强制的**中心部件**（central widget），所有主要内容都放在这里

- 支持多文档界面（MDI）

**典型使用场景**：

- 应用程序的主窗口

- 需要菜单栏、工具栏、状态栏的复杂应用

- 支持停靠窗口（如 IDE 的侧边栏）的应用

**优点**：提供完整的主窗口框架，符合用户使用习惯
**缺点**：相对较重，必须设置中心部件，不能直接使用布局

**重要注意事项**：

- 不能直接对 QMainWindow 本身设置布局，必须先设置中心部件，然后对中心部件设置布局

- 菜单栏、工具栏等是 QMainWindow 的专属功能，QWidget 没有

---

### 3\. QDialog \- 对话框类

```python
from PySide6.QtWidgets import QDialog, QVBoxLayout, QPushButton

class MyWindow(QDialog):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("对话框")
        self.resize(300, 200)
        
        layout = QVBoxLayout(self)
        layout.addWidget(QPushButton("确定"))
        layout.addWidget(QPushButton("取消"))
```

**核心特点**：

- 用于短期任务和与用户进行简短交互的窗口

- 有模态（modal）和非模态两种模式

- 模态对话框会阻塞父窗口的输入

- 通常有 \&\#34;确定\&\#34; 和 \&\#34;取消\&\#34; 按钮

- 支持返回结果（通过 `exec\(\)` 方法）

**典型使用场景**：

- 登录窗口

- 设置 / 首选项窗口

- 确认对话框

- 文件选择 / 保存对话框

- 进度对话框

**优点**：

- 专门为交互设计，使用简单

- 支持模态操作，确保用户完成当前任务

- 有标准的按钮和返回值机制

**缺点**：

- 不适合作为应用程序的主窗口

- 模态对话框会阻塞程序流程

**重要方法**：

- `exec\(\)`：以模态方式显示对话框，阻塞直到用户关闭

- `show\(\)`：以非模态方式显示对话框

- `accept\(\)`：接受对话框，返回 QDialog\.Accepted

- `reject\(\)`：拒绝对话框，返回 QDialog\.Rejected

---

### 4\. QFrame \- 带边框的窗口类

```python
from PySide6.QtWidgets import QFrame
from PySide6.QtCore import Qt

class MyWindow(QFrame):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("带边框的窗口")
        self.resize(400, 300)
        
        # 设置边框样式
        self.setFrameShape(QFrame.Box)
        self.setFrameShadow(QFrame.Sunken)
        self.setLineWidth(2)
```

**核心特点**：

- QWidget 的子类，增加了边框功能

- 可以设置多种边框样式和阴影效果

- 可以作为其他控件的容器，提供视觉分隔

**典型使用场景**：

- 需要边框的子部件

- 分组框（替代 QGroupBox）

- 分隔线

- 自定义控件的背景

**优点**：提供丰富的边框和阴影效果
**缺点**：作为顶级窗口使用较少，主要作为子部件

---

### 5\. 其他常用窗口基类

#### QMessageBox \- 消息对话框

```python
from PySide6.QtWidgets import QMessageBox

# 通常直接使用，不需要继承
QMessageBox.information(self, "提示", "操作成功")
QMessageBox.warning(self, "警告", "确定要删除吗？")
QMessageBox.critical(self, "错误", "发生了一个错误")
QMessageBox.question(self, "询问", "你确定要退出吗？")
```

**特点**：预定义的标准消息对话框，提供图标和标准按钮

#### QSplashScreen \- 启动画面

```python
from PySide6.QtWidgets import QSplashScreen
from PySide6.QtGui import QPixmap

splash = QSplashScreen(QPixmap("splash.png"))
splash.show()
# 加载程序资源...
splash.finish(main_window)
```

**特点**：用于应用程序启动时显示的闪屏，没有标题栏和边框

#### QDockWidget \- 停靠窗口

```python
from PySide6.QtWidgets import QDockWidget, QTextEdit

dock = QDockWidget("工具箱", self)
dock.setWidget(QTextEdit())
self.addDockWidget(Qt.LeftDockWidgetArea, dock)
```

**特点**：可以停靠在 QMainWindow 边缘或浮动的窗口

#### QMdiSubWindow \- MDI 子窗口

```python
from PySide6.QtWidgets import QMdiArea, QMdiSubWindow, QTextEdit

mdi_area = QMdiArea()
self.setCentralWidget(mdi_area)

sub_window = QMdiSubWindow()
sub_window.setWidget(QTextEdit())
mdi_area.addSubWindow(sub_window)
sub_window.show()
```

**特点**：用于多文档界面（MDI）应用程序的子窗口

## 三、窗口基类对比表

|基类|主要用途|内置组件|模态支持|典型大小|内存占用|
|---|---|---|---|---|---|
|QWidget|通用窗口 / 自定义控件|无|不支持|任意|最小|
|QMainWindow|应用主窗口|菜单栏、工具栏、状态栏、停靠区|不支持|大|较大|
|QDialog|交互对话框|无（但有标准按钮支持）|支持|小到中|中等|
|QFrame|带边框的容器|边框和阴影|不支持|任意|小|
|QMessageBox|消息提示|图标、标准按钮|支持|小|小|
|QSplashScreen|启动画面|图片|不支持|中|小|

## 四、如何选择合适的窗口基类

1. **如果是应用程序的主窗口**：**必须使用 QMainWindow**

    - 它提供了所有标准主窗口功能

    - 是用户最熟悉的窗口类型

2. **如果是弹出式交互窗口**：**使用 QDialog**

    - 需要用户响应才能继续操作时使用模态对话框

    - 不需要阻塞父窗口时使用非模态对话框

3. **如果是简单的自定义窗口**：**使用 QWidget**

    - 不需要任何标准窗口元素时

    - 追求最小内存占用和最高性能时

    - 完全自定义界面时

4. **如果需要边框和视觉分隔**：**使用 QFrame**

    - 作为子部件容器时

    - 需要分组显示内容时

5. **如果是标准消息提示**：**直接使用 QMessageBox**

    - 不需要继承，直接调用静态方法即可

## 五、重要注意事项

1. **窗口标志**：所有窗口都可以通过 `setWindowFlags\(\)` 修改行为

    ```python
    # 无边框窗口
    self.setWindowFlags(Qt.FramelessWindowHint)
    # 窗口置顶
    self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
    # 工具窗口（只有关闭按钮，没有最小化和最大化）
    self.setWindowFlags(Qt.Tool)
    ```

2. **父子关系**：

    - 当创建窗口时指定父对象，它会成为子窗口，显示在父窗口之上

    - 没有父对象的窗口是顶级窗口，在任务栏有独立图标

    - 父窗口关闭时，所有子窗口也会自动关闭

3. **布局管理**：

    - QWidget、QDialog、QFrame 可以直接设置布局

    - QMainWindow 不能直接设置布局，必须先设置中心部件
