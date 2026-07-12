# 1.Pyside6基础

## 1.PySide6 的核心模块

> [!NOte]
>
> - PySide6.QtWidgets:所有基础 GUI 组件（按钮、窗口、输入框等）核心模块
> - PySide6.QtCore: 核心非 GUI 功能（信号槽、事件、线程、数据类型）：
> - - 包括时间、文件、目录、数据类型、文本流、链接、进程等。
> - PySide6.QtGui : 基本图形相关的类（字体、颜色、图像、鼠标 / 键盘事件）：
> - - 包括字体、图形、图标、颜色等

![Qt核心类继承关系图|357](D:\SofitWares-Datas\Obsidian-Notes\Knowledge-tree\Knowledges\Assets\images\Qt核心类继承关系图.png)

>[!abstract]
>关键结论：所有 UI 组件（QPushButton、QMainWindow 等）都继承自 QWidget，而 QWidget 又继承自 QObject(提供信号与槽)—— 这意味着**所有 UI 组件都拥有 QObject 的核心能力**（信号槽、父子管理等）。


## 2.QWidgets
```python
import sys  
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel, QPushButton  
from PySide6.QtCore import Qt  
  
  
class MyFirstWindow(QWidget):  
    """  
    我们定义一个类，继承自 QWidget。  
    这意味着 MyFirstWindow 拥有了 QWidget 的所有属性：大小、标题、绘图能力等。  
    """  
    def __init__(self):  
        super().__init__()  # 必须调用父类构造函数  
  
        # 1. 设置窗口基本属性（这些方法都继承自 QWidget）  
        self.setWindowTitle("PySide6 第一课")  
        self.resize(400, 300)  
  
        # 2. 创建布局（用于管理控件位置）  
        layout = QVBoxLayout()  
  
        # 3. 添加控件  
        self.label = QLabel("你好，PySide6！")  
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)  # 设置居中  
  
        self.btn = QPushButton("点我改变文字")  
  
        # 4. 将控件添加到布局中  
        layout.addWidget(self.label)  
        layout.addWidget(self.btn)  
  
        # 5. 将布局设置给窗口  
        self.setLayout(layout)  
  
        # 6. 信号与槽（逻辑连接）  
        self.btn.clicked.connect(self.change_text)  
  
    def change_text(self):  
        self.label.setText("文字已改变！这就是信号与槽的力量。")  
  
  
if __name__ == "__main__":  
    # 创建应用程序实例，sys.argv 允许程序处理命令行参数  
    app = QApplication(sys.argv)  
  
    # 实例化我们的窗口  
    window = MyFirstWindow()  
    window.show()  # 窗口默认是隐藏的，必须手动显示  ,有hide(),update() 等方法来改变显示清空
  
    # 进入事件循环，等待用户操作  
    sys.exit(app.exec())
```

>[!note]
>1. QApplication：程序的大脑
>- 作用：它管理整个应用的生命周期。没有它，窗口无法捕获鼠标点击，也无法绘制自己。
>- 唯一性：一个程序只能有一个 QApplication 实例。
>app.exec()：启动主事件循环。这行代码会让程序“停”在这里，不断检测用户的操作，直到你关闭窗口。
>2. 信号 (Signals) 与 槽 (Slots)
>- 信号 (Signal)：就像是一个闹钟。例如 QPushButton.clicked。
>- 槽 (Slot)：就像是听到闹钟后的动作。它本质上是一个 Python 函数（如 self.change_text）。
>- 连接：通过 button.clicked.connect(slot_function) 实现逻辑联动。


### 2.1QWidget
>[!tip]
>在 PySide6 中，几乎你看到的所有东西（按钮、输入框、标签、甚至主窗口本身）都是 QWidget 的子类

#### 1.坐标系统 (Coordinate System)
>[!warning]
>- PySide6 的坐标系以左上角为原点 (0, 0)。
>- geometry() (几何尺寸)：指的是客户区（不包含标题栏和边框）相对于父窗口的位置和大小。
>- frameGeometry() (框架几何尺寸)：指的是包含标题栏和边框的完整窗口尺寸。
>- 常用方法：
>	- x(), y(): 返回坐标。
>	- width(), height(): 返回纯内容的宽高。
>	- move(x, y): 移动窗口到指定位置。
>	- resize(w, h): 改变大小（用户仍可手动拉伸）。
>	- setFixedSize(w, h): 固定大小，禁用最大化和拉伸。


#### 2.窗口状态与外观
|           方法            |   作用    |        说明         |
| :---------------------: | :-----: | :---------------: |
|   setWindowTitle(str)   |  设置标题   |     只有顶级窗口有效。     |
|  setWindowIcon(QIcon)   |  设置图标   | 需要引入 QtGui.QIcon。 |
|     setToolTip(str)     | 设置工具提示  |    鼠标悬停时显示的文字。    |
|    setEnabled(bool)     |  启用/禁用  |   禁用后控件变灰且不可点击。   |
| setWindowOpacity(float) |  设置透明度  | 0.0（全透）到 1.0（不透）。 |
|   setStyleSheet(str)    | QSS 样式表 |   用类似CSS的语法美化控件   |
##### 2.1QSS相关
###### 2.1.1基础语法
```qss
选择器 { 属性名1: 属性值1;
 属性名2: 属性值2; /* 最后一条必须加分号！ */ }
```

>[!warning]
>✅ **强制规范**：
>1.  每条样式**必须以分号 `;` 结尾**（少写直接失效）；
>2. 注释用 `/* 注释内容 */`；
>3. **不支持 CSS 嵌套写法**,必须平级；
>4. 大小写不敏感（推荐小写，规范统一）；
>5. 单位优先用 `px`（像素），支持 `pt/em`，**纯数字默认 px**。
###### 2.1.2 QSS选择器
1. 类型选择器
```qss
/* 选中所有 QPushButton 按钮 */ 
QPushButton { color: red; } 
/* 选中所有 QLineEdit 输入框 */ 
QLineEdit { border: 1px solid gray; }
```

2. 对象名选择器（精准选中单个控件）
给控件设置 `objectName`，用 `#名称` 选中
```python
# 代码中设置 
self.btn.setObjectName("login_btn")
```

```qss
/* 仅选中 objectName=login_btn 的按钮 */
#login_btn { background: pink; }
```

3. 分组选择器
多个控件共用一套样式，用 `,` 分隔
```qss
QLabel, QLineEdit, QPushButton { padding: 5px; }
```

4. 后代选择器
选中父控件内的**所有子控件**（包含孙子控件）,这里MyApp是一个我写的一个Python的测试用的gui的类
```qss
/* 选中 MyApp 窗口内所有 QPushButton */
MyApp QPushButton { ... }
```

5. 子选择器
仅选中**直接子控件**
```qss
MyApp > QPushButton { ... }
```

6. 类选择器
自定义类控件的选择器（用 `.类名`）
```qss
.MyButton { ... }
```

7. 属性选择器
根据控件属性选中（进阶）
```qss
QPushButton[enabled="true"] { ... }
```

###### 2.1.3伪状态（Pseudo-States）
伪状态 = 控件的**交互状态**（悬浮、禁用、聚焦、按下等）
**语法**
```qss
选择器:伪状态 { 样式 }
```
**所有常用伪状态**

| 伪状态          | 含义     | 适用控件           |
| ------------ | ------ | -------------- |
| `:hover`     | 鼠标悬浮   | 所有控件           |
| `:pressed`   | 鼠标按下   | 按钮、标签          |
| `:disabled`  | 控件禁用   | 所有控件（你登录窗口用的！） |
| `:enabled`   | 控件启用   | 所有控件           |
| `:focus`     | 控件获得焦点 | 输入框、按钮         |
| `:checked`   | 选中状态   | 单选框、复选框        |
| `:unchecked` | 未选中状态  | 单选框、复选框        |
| `:active`    | 控件活跃   | 窗口、按钮          |
###### 2.1.4 QSS 高级：子控件（Sub-Controls）
复杂控件（下拉框、滚动条、复选框）由**多个小部分组成**，叫子控件，可单独美化。
**语法**
```qss
选择器::子控件 { 样式 }
/* 比如*/
QCheckBox::indicator { width: 20px; height: 20px; }
```
**常用子控件**

| 控件             | 子控件              | 作用    |
| -------------- | ---------------- | ----- |
| `QCheckBox`    | `::indicator`    | 复选框方框 |
| `QRadioButton` | `::indicator`    | 单选框圆点 |
| `QComboBox`    | `::drop-down`    | 下拉箭头  |
| `QScrollBar`   | `::handle`       | 滚动条滑块 |
| `QLineEdit`    | `::clear-button` | 清空按钮  |
| QLineEdit      | ::placeholder    |       |
###### 2.1.5 QSS 支持的所有常用样式属性
1. 通用属性（所有控件都能用）

| 属性                 | 作用         | 示例                        |
| ------------------ | ---------- | ------------------------- |
| `color`            | 文字颜色       | `color: red;`             |
| `background-color` | 背景色        | `background: #fff;`       |
| `font-size`        | 字体大小       | `font-size: 16px;`        |
| `font-family`      | 字体         | `font-family: 微软雅黑;`      |
| `border`           | 边框         | `border: 1px solid gray;` |
| `border-radius`    | 圆角         | `border-radius: 5px;`     |
| `padding`          | 内边距（控件内边距） | `padding: 5px 10px;`      |
| `margin`           | 外边距（控件间距）  | `margin: 10px;`           |
| `opacity`          | 透明度        | `opacity: 0.8;`           |
>[!warning]
> - 不支持 `text-align` 居中！,应该必须用Python代码实现
>	-  正确写法  
>	`self.le_name.setAlignment(Qt.AlignCenter)`
>- ❌ 布局控件不能用 QSS！`QGridLayout/QVBoxLayout` **没有样式**，
>	- 布局间距只能用代码：
>	 `layout.setSpacing(10) ` 控件间距
>	 `layout.setContentsMargins(10,10,10,10)`  边距

2. 专用控件属性
- `QLineEdit`：无专用 QSS 属性（密码模式用代码 `setEchoMode`）
- `QWidget`：`background` 窗口背景
- `QLabel`：`pixmap` 背景图片

###### 2.1.6 QSS 加载的 3 种方式
1. 内联样式
```python
self.setStyleSheet("""
 QPushButton { ... } 
 """)
```

2. 外部 QSS 文件
	1. 新建 `style.qss` 文件，写样式；
	2. 代码读取文件加载：
```python
with open("style.qss", "r", encoding="utf-8") as f:
	 app.setStyleSheet(f.read())
```

3. 单个控件样式
```python
self.btn.setStyleSheet("background: red;")
```

##### 2.2 案例
```python
import sys  
from PySide6.QtWidgets import QWidget, QLabel, QApplication, QPushButton, QGridLayout, QLineEdit, \  
    QMessageBox, QStyle  
from PySide6.QtCore import Qt  
class MyApp(QWidget):  
    def __init__(self):  
        super().__init__()  
        # self.setWindowOpacity(0.9)  
        self.setWindowTitle('login dialog')  
        self.initUI()  
    def initUI(self):  
  
        layout = QGridLayout()  
        layout.setContentsMargins(10,10,10,10)  
        layout.setSpacing(10)  
        self.setLayout(layout)  
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)  
        self.resize(400, 300)  
  
        label_name = QLabel('账号')  
        label_name.setAlignment(Qt.AlignmentFlag.AlignCenter)  
        label_pwd = QLabel('密码')  
        label_pwd.setAlignment(Qt.AlignmentFlag.AlignCenter)  
  
        self.le_name = QLineEdit('')  
        self.le_name.setAlignment(Qt.AlignmentFlag.AlignCenter)  
        self.le_name.setPlaceholderText('请输入账号')  
        # self.le_name.textChanged.connect(self.check_input_enabled()) #  有()时立即执行函数，一般gui中不实用这样的立即执行函数  
        self.le_name.textChanged.connect(self.check_input_enabled)  
        self.le_pwd = QLineEdit('')  
        self.le_pwd.setPlaceholderText('请输入密码')  
        self.le_pwd.textChanged.connect(self.check_input_enabled)  
        self.le_pwd.setAlignment(Qt.AlignmentFlag.AlignCenter)  
        self.le_pwd.setEchoMode(QLineEdit.EchoMode.Password)  
        self.btn = QPushButton('确认')  
        self.btn.setToolTip('confirm button')  
        self.btn.setEnabled(False)  
  
  
  
        self.btn.clicked.connect(self.handle_confirm)  
        self.set_Qss()  
  
        layout.addWidget(label_name, 0, 0)  
        layout.addWidget(self.le_name, 0, 1)  
        layout.addWidget(label_pwd, 1,0)  
        layout.addWidget(self.le_pwd, 1,1)  
        layout.addWidget(self.btn, 2,0,1,2)  
  
    def check_input_enabled(self):  
        if self.le_name.text().strip() != '' and self.le_pwd.text().strip() != '':  
            self.btn.setEnabled(True)  
        else:  
            self.btn.setEnabled(False)  
  
  
    def handle_confirm(self):  
        pre_name = 'abc'  
        pre_pwd = '123'  
        if self.le_name.text().strip() == pre_name and self.le_pwd.text().strip() == pre_pwd:  
            QMessageBox.information(  
                self,  
                'success',  
                '登录正确'  
            )  
        else:  
            QMessageBox.critical(  
                self,  
            'error',  
            '账号或者密码错误'  
            )  
  
  
    def set_Qss(self):  
        self.setStyleSheet("""  
        QLabel {            font-size: 20px;            color:red;            border-radius: 5px;            padding: 10px;        }        QLineEdit {            font-size: 14px;            color:#0000ff;            border-radius: 5px;            padding: 10px;        }        QPushButton {            font-size: 20px;            color:red;            background-color:pink;            padding: 10px 20px;            margin: 10px 100px;            box-shadow: 2px 2px 5px red;        }        /* 按钮悬浮 */        QPushButton:hover {            background-color: #ff69b4;        }            QPushButton:disabled {            background-color: rgb(255, 255, 255);            color:blue;        }        """)  
  
if __name__ == '__main__':  
    app = QApplication(sys.argv)  
    window = MyApp()  
    icon = window.style().standardIcon(QStyle.StandardPixmap.SP_DirIcon)  
    window.setWindowIcon(icon)  
    window.show()  
    sys.exit(app.exec())
```
![qss示例效果图-1](/notes-assets/Knowledge-tree/qss%E7%A4%BA%E4%BE%8B%E6%95%88%E6%9E%9C%E5%9B%BE-1.png)

![qss示例效果图-2](/notes-assets/Knowledge-tree/qss%E7%A4%BA%E4%BE%8B%E6%95%88%E6%9E%9C%E5%9B%BE-2.png)
#### 3.窗口标志 (Window Flags)
> [!tip]
> 有时候你需要窗口有一些特殊行为，比如“总在最前”或“去掉标题栏”。这需要通过 setWindowFlags() 实现。
> - 窗口标志通过`setWindowFlags(Qt.WindowType.xxx)`来控制，其中xx有：
> 	- `WindowStaysOnTopHint` 窗口始终在最前面（有好几个窗口时，最上面显示）。
> 	- `Window` 默认窗口 ：带标题栏/可缩放、可左右上下拖动、最大化、最小化
> 	- `FramelessWindowHint` 无边框窗口 (无titlebar)，效果就是上面Window的取反
> 	- `CustomizeWindowHint` 无边框窗口（无titlebar），但可左右上下缩放，但拖动不了
> 	- `WindowTitleHint` 跟默认窗口（即上面的Window）就差一个关闭按钮，即没有❌
> 	- `WindowCloseButtonHint` 这个单独使用跟默认的没事区别，必须跟customize那个配合，通过管道符链接，比如说`Qt.WindowType.CustomizeWindowHint |Qt.WindowType.WindowCloseButtonHint` 。才会把最小化去掉了，还得通过`setMaximumSize(500, 400)`来去掉最大化，仅保留标题和关闭按钮的效果
> 	- `MSWindowsFixedSizeDialogHint` 跟默认窗口的区别是无法最大化和无法缩放，其他方面都一样
> 

#### 4.核心概念：Size Policy (尺寸策略)
>[!note]
>​当窗口被用户拉大时，里面的按钮是跟着变大，还是保持原样？
>- sizeHint(): 每个控件都有一个“建议大小”，这是系统认为它显示最完美的大小。
>- setMinimumSize / setMaximumSize: 限制拉伸的极限。
>- setSizePolicy(): 决定控件在布局中如何伸缩（这部分会在布局管理器那章细讲，但要知道它属于 QWidget 的属性）。


# 2.Pyside6 核心概念
## 1. 信号与槽（Signal and Slot）
- 信号 (Signal)：当某个特定事件发生时（如点击按钮、滑动进度条、输入文字），对象就会“发射”（emit）一个信号。它不关心谁在听，只管喊一嗓子。
- 槽 (Slot)：本质上是一个普通的 Python 函数或方法。它是信号的接收端，决定了“听到信号后该做什么”。
- 连接 (Connect)：将信号指向槽的过程。
