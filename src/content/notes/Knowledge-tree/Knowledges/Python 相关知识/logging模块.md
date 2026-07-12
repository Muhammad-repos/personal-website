0. log level :

|   日志等级   | 数值  |               何时使用               |
| :------: | :-: | :------------------------------: |
|  DEBUG   | 10  |     细节调试信息，排查故障专用，打印变量、中间过程      |
|   INFO   | 20  |     程序正常运行状态，服务启动、任务完成、流程正常      |
| WARNING  | 30  | 潜在异常风险，不影响运行，但后续可能出问题（磁盘不足、参数异常） |
|  ERROR   | 40  |        功能出错，局部模块失效、业务执行失败        |
| CRITICAL | 50  |       致命崩溃错误，核心故障，程序无法继续运行       |
>[!tip]
>- 日志级别**数值越大，优先级越高**
>- 配置 `level=XXX` 后，**大于等于该等级**的日志才会输出
>- 优先级顺序：`DEBUG < INFO < WARNING < ERROR < CRITICAL`


1. basic Config :
```python
import logging  
  
# 基础配置，决定了日志的去向，格式和最低准入门槛  
logging.basicConfig(filename='main.log', # 日志输出文件  
                    filemode='w', # a 为追加，w为覆盖  
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', # 定义输出格式。  
                    datefmt='%d/%m/%Y %I:%M:%S %p', # 定义时间格式  
                    level=logging.DEBUG, # 日志等级，debug 为最低等级,大于等于这个等级的才会被记录到日志文件中，低于的则被忽略。  
                    encoding='utf-8'  
                    )  
  
  
  
logging.debug('this is a debug message,value is: 10')  
logging.info('this is a info message,value is: 20')  
logging.warning('this is a warning message,value is: 30')  
logging.error('this is a error message,value is: 40')  
logging.critical('this is a critical message,value is: 50')
```

>[!note]
> basic config 只能为要么输出到文件，要么输出到控制台（得把配置里的file name参数删除）。不能同时输出到两个位置。一般小项目使用，正常项目不怎么用

2. 进阶

|    组件名     |                                      作用                                       | 对应到上面的basicConfig |
|:-------------:|:-------------------------------------------------------------------------------:|:-----------------------:|
|  **Logger**   |       日志的**入口**，你用它调用 `debug/info` 等方法（唯一直接用的组件）        |      根日志器 root      |
|  **Handler**  | 日志的**搬运工**，决定日志输出到哪：控制台 / 文件 / 邮件 / 网络（**进阶核心**） | basicConfig 的 filename |
| **Formatter** |           日志的**化妆师**，定义日志格式、时间格式。决定日志长什么样            |     format/datefmt      |
|  **Filter**   |   日志的**守门员**，提供比“等级”更细粒度的控制，决定哪些特定信息能通过。<br>    |            -            |
```python
  
import logging  
from logging.handlers import TimedRotatingFileHandler  
# 1.创建logger（日志入口）  
# 1.1 自定义日志器，名字随便取（推荐用 __name__，自动取模块名）  
logger = logging.getLogger(__name__) # 也可以是 __name__，表示当前模块名作为logger的name  
# 1.2 设置日志器的总级别为 DEBUGlogger.setLevel(logging.DEBUG)  
# 关键：防止日志重复输出（阻止日志器向上传递，避免多模块日志输出重复）  
logger.propagate = False  
logger.handlers.clear()  # 清空日志器已有的Handler  
# 2. 创建 Formatter（日志格式）  
formatter = logging.Formatter(  
    fmt="%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",  
    datefmt="%Y-%m-%d %H:%M:%S"  
)  
  
# 3. 创建 Handler（搬运工：决定输出到哪）  
  
# 3.1 控制台输出 Handlerconsole_handler = logging.StreamHandler()  
# 给控制台设置格式  
console_handler.setFormatter(formatter)  
# 控制台只输出 INFO 及以上（灵活设置！）  
console_handler.setLevel(logging.INFO)  
  
# 3.2 文件输出 Handler;按天分割日志  
file_handler = TimedRotatingFileHandler(  
    filename="app.log",  
    when="D",      # 每天切割  
    interval=1,    # 1天一次  
    backupCount=30, # 保留30天日志  
    encoding="utf-8"  
)  
# 给文件设置格式  
file_handler.setFormatter(formatter)  
# 文件输出所有级别（DEBUG及以上）  
file_handler.setLevel(logging.DEBUG)  
  
# 3.3 把 Handler 绑定到 Logger 上  
logger.addHandler(console_handler)  
logger.addHandler(file_handler)

# from log_config import logger  
# 4. 使用日志  
logger.debug("调试信息：数据库连接成功")  
logger.info("普通信息：用户登录成功")  
logger.warning("警告信息：磁盘空间不足")  
logger.error("错误信息：接口请求失败")  
logger.critical("严重错误：程序崩溃")
```

