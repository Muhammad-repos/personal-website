# PySide6 事件系统

事件系统是 PySide6 的核心机制之一，所有用户交互（鼠标点击、键盘输入、窗口移动等）都通过事件来传递和处理。

### 1. 事件系统的基本概念

#### 什么是事件？

事件是对应用程序中发生的事情的描述，比如：

- 用户点击了鼠标

- 用户按下了键盘

- 窗口需要重新绘制

- 窗口大小发生了变化

- 定时器超时

#### 事件与信号槽的区别

很多初学者容易混淆事件和信号槽，它们的核心区别是：

- **事件**：是底层的消息传递机制，由操作系统或 Qt 框架产生，由事件循环分发

- **信号槽**：是 Qt 提供的高层通信机制，用于对象之间的通信

- **关系**：信号通常是由事件触发的（比如按钮的 `clicked` 信号是由鼠标点击事件触发的）

#### 事件处理的流程

1. 事件产生（操作系统或 Qt 内部）

2. 事件被放入应用程序的事件队列

3. 事件循环（`QApplication.exec()`）从队列中取出事件

4. 事件被分发到对应的目标对象

5. 目标对象的事件处理函数被调用

6. 事件处理函数可以接受事件或忽略事件

7. 如果事件被忽略，会传递给父对象处理

### 2. 事件处理的三种方式

#### 方式一：重写事件处理函数（最常用）

这是最直接、最高效的事件处理方式。每个事件类型都有对应的虚函数，你可以在子类中重写这些函数来处理事件。

```python
from PySide6.QtWidgets import QWidget
from PySide6.QtGui import QMouseEvent
from PySide6.QtCore import Qt

class MyWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(400, 300)
    
    # 重写鼠标按下事件处理函数
    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            print(f"鼠标左键按下，位置：{event.position()}")
        elif event.button() == Qt.RightButton:
            print(f"鼠标右键按下，位置：{event.position()}")
        
        # 调用父类的事件处理函数，让事件继续传递
        super().mousePressEvent(event)
```

**特点**：

- 简单直接，性能最好

- 只能处理自己的事件

- 是处理事件的首选方式

#### 方式二：事件过滤器（Event Filter）

事件过滤器允许一个对象监视另一个对象的事件，在事件到达目标对象之前进行处理。

```python
from PySide6.QtWidgets import QApplication, QWidget, QPushButton
from PySide6.QtCore import QObject, QEvent

class EventFilter(QObject):
    def eventFilter(self, watched: QObject, event: QEvent) -> bool:
        if event.type() == QEvent.MouseButtonPress:
            print(f"事件过滤器：{watched.objectName()} 被点击了")
            # 返回 True 表示事件被处理，不再传递给目标对象
            # 返回 False 表示事件继续传递
            return False
        
        return super().eventFilter(watched, event)

if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    
    window = QWidget()
    window.resize(300, 200)
    
    button = QPushButton("点击我", window)
    button.setObjectName("my_button")
    
    # 创建事件过滤器
    filter = EventFilter()
    # 为按钮安装事件过滤器
    button.installEventFilter(filter)
    
    window.show()
    sys.exit(app.exec())
```

**特点**：

- 可以监视多个对象的事件

- 可以在事件到达目标对象之前拦截事件

- 适合需要统一处理多个控件事件的场景

- 性能略低于重写事件处理函数

#### 方式三：重写 `QObject.event()` 函数

这是最底层的事件处理方式，所有事件在分发到具体的事件处理函数之前都会先经过 `event()` 函数。

```python
from PySide6.QtWidgets import QWidget
from PySide6.QtCore import QEvent

class MyWindow(QWidget):
    def event(self, event: QEvent) -> bool:
        if event.type() == QEvent.MouseButtonPress:
            print("鼠标按下事件（在event()中处理）")
            # 返回 True 表示事件被处理，不再分发到具体的事件处理函数
            # return True
        
        # 调用父类的event()函数，继续分发事件
        return super().event(event)
```

**特点**：

- 可以处理所有类型的事件

- 可以在事件分发到具体处理函数之前进行拦截

- 灵活性最高，但也最复杂

- 除非有特殊需求，否则不推荐使用

### 3. 常用事件类型详解

#### 鼠标事件

所有鼠标事件都继承自 `QMouseEvent`，常用的鼠标事件处理函数有：

|事件处理函数|触发时机|
|---|---|
|`mousePressEvent(event)`|鼠标按钮按下时|
|`mouseReleaseEvent(event)`|鼠标按钮释放时|
|`mouseDoubleClickEvent(event)`|鼠标双击时|
|`mouseMoveEvent(event)`|鼠标移动时|
|`enterEvent(event)`|鼠标进入控件时|
|`leaveEvent(event)`|鼠标离开控件时|
|`wheelEvent(event)`|鼠标滚轮滚动时|

**示例：鼠标拖动窗口**

```python
from PySide6.QtWidgets import QWidget
from PySide6.QtGui import QMouseEvent
from PySide6.QtCore import Qt, QPoint

class DraggableWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(400, 300)
        self.setWindowFlags(Qt.FramelessWindowHint)  # 无边框窗口
        self.dragging = False
        self.drag_position = QPoint()
    
    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            self.dragging = True
            self.drag_position = event.globalPosition().toPoint() - self.pos()
    
    def mouseMoveEvent(self, event: QMouseEvent):
        if self.dragging and event.buttons() & Qt.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_position)
    
    def mouseReleaseEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            self.dragging = False
```

#### 键盘事件

所有键盘事件都继承自 `QKeyEvent`，常用的键盘事件处理函数有：

|事件处理函数|触发时机|
|---|---|
|`keyPressEvent(event)`|按键按下时|
|`keyReleaseEvent(event)`|按键释放时|

**示例：处理键盘快捷键**

```python
from PySide6.QtWidgets import QWidget, QMessageBox
from PySide6.QtGui import QKeyEvent
from PySide6.QtCore import Qt

class ShortcutWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(400, 300)
    
    def keyPressEvent(self, event: QKeyEvent):
        # 处理单个按键
        if event.key() == Qt.Key_Escape:
            self.close()
        
        # 处理组合键（Ctrl+S）
        if event.modifiers() == Qt.ControlModifier and event.key() == Qt.Key_S:
            QMessageBox.information(self, "提示", "保存成功")
        
        # 处理组合键（Ctrl+Shift+A）
        if event.modifiers() == (Qt.ControlModifier | Qt.ShiftModifier) and event.key() == Qt.Key_A:
            QMessageBox.information(self, "提示", "全选")
        
        super().keyPressEvent(event)
```

#### 窗口事件

窗口事件用于处理窗口的状态变化，常用的窗口事件处理函数有：

|事件处理函数|触发时机|
|:-:|---|
|`showEvent(event)`|窗口显示时|
|`hideEvent(event)`|窗口隐藏时|
|`closeEvent(event)`|窗口关闭时|
|`resizeEvent(event)`|窗口大小改变时|
|`moveEvent(event)`|窗口移动时|
|`focusInEvent(event)`|窗口获得焦点时|
|`focusOutEvent(event)`|窗口失去焦点时|

**示例：窗口关闭确认**

```python
from PySide6.QtWidgets import QWidget, QMessageBox
from PySide6.QtGui import QCloseEvent

class CloseConfirmWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(400, 300)
    
    def closeEvent(self, event: QCloseEvent):
        reply = QMessageBox.question(self, "确认", "确定要退出吗？",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        
        if reply == QMessageBox.Yes:
            event.accept()  # 接受关闭事件，窗口关闭
        else:
            event.ignore()  # 忽略关闭事件，窗口不关闭
```

#### 绘制事件

绘制事件是所有自定义控件的基础，当窗口需要重新绘制时会触发 `paintEvent(event)`。

```python
from PySide6.QtWidgets import QWidget
from PySide6.QtGui import QPainter, QColor, QPen
from PySide6.QtCore import Qt

class PaintWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(400, 300)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        
        # 设置画笔
        pen = QPen(QColor(255, 0, 0), 2, Qt.SolidLine)
        painter.setPen(pen)
        
        # 绘制直线
        painter.drawLine(50, 50, 350, 50)
        
        # 绘制矩形
        painter.drawRect(50, 100, 100, 100)
        
        # 绘制圆形
        painter.drawEllipse(200, 100, 100, 100)
        
        # 绘制文字
        painter.drawText(50, 250, "Hello PySide6!")
```

#### 定时器事件

定时器事件用于定期执行某些操作，通过 `startTimer()` 启动定时器，通过 `timerEvent()` 处理定时器事件。

```python
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout
from PySide6.QtCore import QTimerEvent

class TimerWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.resize(300, 200)
        
        layout = QVBoxLayout(self)
        self.label = QLabel("0")
        layout.addWidget(self.label)
        
        self.counter = 0
        # 启动定时器，间隔1000毫秒（1秒）
        self.timer_id = self.startTimer(1000)
    
    def timerEvent(self, event: QTimerEvent):
        if event.timerId() == self.timer_id:
            self.counter += 1
            self.label.setText(str(self.counter))
            
            # 计数到10时停止定时器
            if self.counter == 10:
                self.killTimer(self.timer_id)
```

### 4. 事件的接受与忽略

在事件处理函数中，你可以决定是否接受事件：

- `event.accept()`：接受事件，事件不再传递给父对象

- `event.ignore()`：忽略事件，事件会传递给父对象处理

**示例：**

```python
def mousePressEvent(self, event):
    if event.button() == Qt.LeftButton:
        print("处理左键点击")
        event.accept()  # 接受事件，不再传递
    else:
        event.ignore()  # 忽略事件，传递给父对象
```

### 5. 自定义事件

你可以创建自己的事件类型，用于对象之间的通信。

```python
from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtCore import QEvent, QObject

# 定义自定义事件类型
CustomEventType = QEvent.Type(QEvent.registerEventType())

# 自定义事件类
class CustomEvent(QEvent):
    def __init__(self, data):
        super().__init__(CustomEventType)
        self.data = data

class MyWindow(QWidget):
    def customEvent(self, event: QEvent):
        if event.type() == CustomEventType:
            print(f"收到自定义事件，数据：{event.data}")
    
    def mousePressEvent(self, event):
        # 发送自定义事件
        custom_event = CustomEvent("Hello from mouse press!")
        QApplication.postEvent(self, custom_event)
```

### 6. 事件系统最佳实践

1. **优先使用重写事件处理函数**：这是最简单、最高效的方式

2. **使用事件过滤器处理多个控件的相同事件**：避免重复代码

3. **不要在事件处理函数中执行耗时操作**：会阻塞事件循环，导致界面卡顿

4. **记得调用父类的事件处理函数**：除非你确定要完全覆盖默认行为

5. **使用信号槽处理高层逻辑**：事件适合处理底层交互，信号槽适合处理业务逻辑

6. 使用 **`QTimer`**  替代  **`time.sleep()`**：`time.sleep()` 会阻塞事件循环

### 7. 常见问题与解决方案

- **问题 1**：鼠标移动事件不触发
    - **解决方案**：设置 `self.setMouseTracking(True)`，这样即使没有按下鼠标按钮也会触发鼠标移动事件
    
- **问题 2**：键盘事件不触发

    - **解决方案**：确保窗口获得了焦点，可以调用 `self.setFocus()`

- **问题 3**：子控件的事件没有传递到父窗口

    - **解决方案**：在子控件的事件处理函数中调用 `event.ignore()`，让事件继续传递

- **问题 4**：界面卡顿

    - **解决方案**：将耗时操作放到单独的线程中执行，不要在事件处理函数中执行

