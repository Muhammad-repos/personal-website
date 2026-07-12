
### 1. 获取系统与环境信息

```python
import os

# 1. 获取操作系统类型（Windows返回'nt'，Linux/Unix/Mac返回'posix'）
print("操作系统类型:", os.name)

# 2. 获取当前工作目录（CWD，即代码当前运行的目录）
current_dir = os.getcwd()
print("当前工作目录:", current_dir)  # 示例输出：C:\Users\你的用户名\Desktop

# 3. 获取系统环境变量（比如PATH等）
path_env = os.environ.get('PATH')
print("系统PATH环境变量（前100字符）:", path_env[:100])
```

### 2. 目录操作（创建、切换、删除、遍历）

|      方法       |        作用        |                 关键注意事项                 |
| :-------------: | :----------------: | :------------------------------------------: |
|   os.mkdir()    |    创建单级目录    |              父目录不存在则报错              |
|  os.makedirs()  |    创建多级目录    | 自动创建不存在的父目录（如`dir1/dir2/dir3`） |
|   os.chdir()    |  切换当前工作目录  |               目录不存在则报错               |
|   os.rmdir()    |  删除空的单级目录  |                目录非空会报错                |
| os.removedirs() |  删除空的多级目录  |        从最内层开始删，直到父目录非空        |
|  os.listdir()   | 列出目录下所有内容 |         返回列表，包含文件和子目录名         |

`````python
new_path = 'dir1/dir2/dir3'
os.makedirs(new_path, exist_ok=True)
`````

### 3. 文件与路径操作（os.path 子模块）

```python
import os

new_path = 'dir1/dir2/dir3'
os.makedirs(new_path, exist_ok=True)
my_txt = 'test.txt'
txt_path = os.path.join('dir1', 'dir2', my_txt)
print("拼接后的路径:", txt_path) # 输出: 拼接后的路径: dir1\dir2\test.txt；注意：这里使用了os.path.join()函数，所以路径分隔符会根据操作系统自动选择；注意：还没有创建文件，只是拼接了路径
# 2. 判断路径是否存在
print("路径是否存在:", os.path.exists(txt_path)) # 输出:  False

# 3. 创建测试文件并验证类型
with open(txt_path, 'w') as f:
    f.write('This is a test file.')
    # os.startfile(txt_path) # 启动对应的默认程序打开文件；注意：os.startfile()函数只能在Windows系统下使用

print("是否是文件:", os.path.isfile(txt_path))  # True
print("是否是目录:", os.path.isdir(txt_path))  # False

# 4. 获取路径的绝对路径/文件名/目录部分
print("绝对路径:", os.path.abspath(txt_path)) # 输出: 绝对路径: D:\Muhammad202510\径流调节\径流调节程序开发\just_test\dir1\dir2\test.txt
print("文件名:", os.path.basename(txt_path)) # 输出: 文件名: test.txt
print("目录部分:", os.path.dirname(txt_path)) # 输出: 目录部分: D:\Muhammad202510\径流调节\径流调节程序开发\just_test\dir1\dir2

# 5. 重命名/删除文件
new_name = 'test_renamed.txt'
new_path = os.path.join('dir1', 'dir2', new_name)
os.rename(txt_path, new_path)
print(f'os.listdir("dir1/dir2"): {os.listdir("dir1/dir2")}')
print("重命名后的路径是否存在:", os.path.exists(new_path)) # 输出:  True
# os.remove(new_path) # 只能删文件，不能删目录
# print("删除后的路径是否存在:", os.path.exists(new_path)) # 输出:  False
```

> [!CAUTION]
>
> 1. os.path.join()函数会根据路操作系统自动选择径分隔符
> 2. os.path.join()函数 还没有创建文件或者路径，只是拼接了路径
> 3. os.startfile(txt_path) 函数只能在Windows系统下使用，启动对应的默认程序打开文件

