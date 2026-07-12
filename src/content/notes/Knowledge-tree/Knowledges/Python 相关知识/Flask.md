### 1.创建基础路由
```python
from datetime import datetime

from flask import Flask, render_template
from flask import request,jsonify
from sqlalchemy.exc import SQLAlchemyError

# 创建flask应用实例
app = Flask(__name__)


# 定义路由和试图函数
# 1路由
# 1.1静态路由
@app.route('/forTest')
def my_test():
    return 'hello flask world'
    
# 1.2动态路由
# '<name>' 是一个路由参数，Flask会把URL中的部分内容传递给视图函数。例如，访问/hello/John会调用hello_name('John')。
@app.route('/hello/<int:name>',methods = ['GET'])  # 这里的int:name表示name参数为整数类型
def hello_name(name):
    return f'hello {name} !'

# 运行应用
if __name__ == '__main__':
    #host的作用是指定运行的主机名，默认是localhost，如果想让应用对外提供服务，需要指定为0.0.0.0，这样才可以被其他主机访问。
    app.run(debug=True,host='0.0.0.0')
```

### 2.路由方法
>GET 用于获取数据，通常没有请求体，数据通过 URL 查询字符串传递.(默认响应)
>POST 用于提交数据，通常携带表单数据或文件数据，数据通过请求体传递。
>PUT 用于更新资源，通常携带要更新的数据。
>DELETE 用于删除资源。

#### 2.1 GET 方法
```python
#浏览器中是用这样请求： /for_get_method?name=muhammad&age=23&degree=本科
@app.route('/for_get_method',methods = ['GET'])  
def get_method():
    #args 是类字典对象，用于获取请求参数和参数类型。
    # 可以指定默认值，如果请求参数不存在，则使用默认值。
    # name = request.args.get('name','default_name',type=str)
    # age = request.args.get('age',0,type=int)
    name = request.args.get('name')
    age = request.args.get('age')
    degree = request.args.get('degree')
    my_time_str = '2021年08月01日 12:00:00'
    datas = {
        'name':name,
        'age':age,
        'degree':degree,
        'time':datetime.now().strftime('%Y年%m月%d日 %H:%M:%S'),
        'my_time':datetime.strptime(my_time_str,'%Y年%m月%d日 %H:%M:%S')
         #Y 是全写(如2026)，y是简写（如26）；H是24小时制，I是12小时制

    } #.strftime（format）是用于格式化时间形式的；其中formt是需要的格式
    # 相反的  .strptime（time_string，time_string_format） 用于将字符串转时间对象。其中time_string是需要转换成时间的的原来的字符串，
    # time_string_format是原来的字符串的格式。
    my_list = ['apple','orange','pear',1,5,8]
    print(f'my_datas:{datas},my_list:{my_list}')
    return jsonify(datas,my_list)

```

#### 2.2 POST 方法
```python
@app.route('/for_post_method',methods = ['POST'])
def post_method():
    # 根据情况还有  name = request.form.get('name')  # 获取表单数据
    # file = request.files.get('file')  # 获取文件数据
    name = request.json.get('name') # 因为json数据可以说是字典，所以可以用字典的方式获取数据
    age = request.json['age']
    print(name)
    return 'received successfully'

```
> [!TIPS]
> request.args: 解析URL中的查询字符串部分（GET请求参数）。
> request.form: 处理表单数据（POST请求中的form-data）。
> request.get_json(): 将请求体解析为JSON格式的数据。
> request.json 用于处理 JSON 数据，适用于处理 API 请求中的 JSON 格式数据。
> request.files: 处理上传的文件。
> request.headers: 访问请求头信息。
> request.method: 获取请求方法（如GET、POST等）。
> request.cookies: 访问请求中的cookie。
> request.path: 请求路径的一部分。
> request.full_path: 完整的请求路径，包括查询字符串。
> request.url: 完整的请求URL。
> request.base_url: 基础URL，不包括查询字符串。
> request.host_url: URL根地址。
### 3.数据库集成
#### 3.1 数据库创建
```python
from flask_sqlalchemy import SQLAlchemy
# 配置数据库URT（统一资源标识符）
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'  #表示使用SQLite数据库，并且数据库文件名为example.db
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # 默认为True。如果设置为True，Flask-SQLAlchemy会跟踪对象的修改并且发出信号。这可能会占用额外的内存，因此通常将其设置为False。
db = SQLAlchemy(app)  # 初始化SQLAlchemy，并立即绑定到应用实例上


'''
db = SQLAlchemy()  # 初始化SQLAlchemy，但不立即绑定到应用实例上
# 延迟初始化数据库
db.init_app(app)
'''

#创建模型

class User(db.Model):
    id = db.Column(db.Integer,primary_key = True) #
    uname = db.Column(db.String(20),nullable = False)
    age = db.Column(db.Float,nullable = False)
    def __repr__(self):  # 定义打印对象时显示的字符串，作用是方便调试
        return f'User name in Model {self.uname}'

    # 编写to_dict方法，将SQLAlchemy对象转换成字典
    def to_dict(self):
        return {
            'id':self.id,
            'uname':self.uname,
            'age':self.age
        }

@app.before_request
def create_table():
# with app.app_context():
    # db.drop_all()
    db.create_all()

#创建一个新用户
@app.route('/submit_user_datas',methods = ['GET','POST'])
def submit_user_datas():
    if request.method == 'GET':
        return render_template('submit_user_datas.html')
    elif request.method == 'POST':
        try:
            uname = request.form.get('username')
            age = int(request.form.get('age')) * 1.5 if request.form.get('age') else None
            print(f'username:{uname},age:{age}')
            if uname is None or age is None:
                return 'you have not input username or age',400

            if int(age) <18:
                return 'you are so yong ! you can not submit datas',410
            params = {'uname':uname,'age':age}
            # 解包机制：
            # 1.单星号（*）表示收集参数，并将参数打包成元组或者列表，以位置参数的形式传递给函数。
            # 2.双星号（**）表示收集关键字参数，并将参数打包成字典，以关键字参数的形式传递给函数。
            user = User(**params) # 也就是说，等同于 User(username=uname,age=age)
            db.session.add(user)
            # 提交数据库会话
            db.session.commit()
            # return f'you are in GET method ! username is {uname},age is {age}'
            return render_template('submit_user_datas.html',username=uname,age=age)
        except ValueError as ve:
            return str(ve),415
        except SQLAlchemyError as sve:
            return {'error':str(sve)},425

# 查询用户信息
@app.route('/get_user_info',methods = ['GET'])
def get_user_info():
    uname = request.args.get('username')
    try:
        if uname is None:
            users_info = db.session.query(User).all() # 查询所有用户信息
            print(f'users_info:{users_info},type:{type(users_info)}')
            # users_info_list = [(user.id,user.uname,user.age) for user in users_info]
            users_info_list = [user.to_dict() for user in users_info] #因为直接查询到的对象类型是SQLAlchemy对象，所以需要转换成字典。上面和下面两种方式都可以。
            # return {'message': 'you have not input eneyone name !so queryied all user info !', 'users_info': users_info_list}, 200
            return render_template('get_user_info.html',users_info_list=users_info_list)
        else:
            user_info = db.session.query(User).filter(
                User.uname == uname
            ).first() # 查询单个用户信息
            print(f'user_info:{user_info},type:{type(user_info)}')
            if user_info is None:  # 用户不存在
                return {'message': 'user not found !', 'user_info': None}, 404
            else:
                return {'message': 'user found !', 'user_info': user_info.to_dict()}, 200
    except SQLAlchemyError as sve:
        return {'error': str(sve)}, 425
    except Exception as e:
        return {'error': str(e)}, 500
```
#### 3.2数据库增删改查
##### 1.插入数据
```python
# 1. 创建orm对象
 user = User(uname='muhammad',age=23)
 #2. 添加到session
db.session.add(user)
# 3. 提交数据库会话
db.session.commit()
```
##### 2.删除数据
```Python
User.query(User).filter(User.id == 1).delete()
db.session.commit()
```
##### 3.更新数据
```python
user = User.query(User).filter(User.id == 1).first()
user.age = 25
db.session.commit()
```
##### 4.查询数据
```python
# 1.get()方法；根据逐渐查找条件，返回单个对象，如果对象不存在，则返回None。
user = User.query.get(1)
print(f'id:{user.id},uname:{user.uname},age:{user.age}')

# 2.filter_by()方法；根据条件查找对象，返回Query对象(即类列表)，可以进行遍历，排序、分页等操作。
with app.app_context():
    # users = User.query.filter_by(age = 18).all()
    users = User.query.filter(User.age >= 18).all()  #filter()和filter_by()的区别是filter()可以指定多个查询条件，而filter_by()只能关键字参数查询。
    print(f'users:{users}，type:{type(users)}')
    for user in users:
        print(f'id:{user.id}--user:{user.uname}-----age:{user.age}')
# .query.order_by(User.id.desc()).limit(48).all()[::-1]  # 先按id倒序排序，再取前48条记录，然后反转顺序。
```
### 扩展 ：会话（Session）
>既可以用数据库对象（如User）来操作数据库，也可以用会话对象（Session）来操作数据库。
```python
一、用会话对象操作数据库：
# 1. 创建会话对象
from sqlalchemy.orm import sessionmaker
Session = sessionmaker(bind=db.engine)
session = Session()
# 现在，session对象可以用来查询、插入、删除、更新数据库中的数据。
user = session.query(User).filter(User.id == 1).delete()
session.commit()
# 2. 关闭会话对象
session.close()
------------------------------------------------
二、用数据库对象操作数据库：
user = User(uname='muhammad',age=23)
db.session.add(user)
db.session.commit()

    except SQLAlchemyError as e:
        session.rollback()  # 让一个操作失败，则回滚会话中的所有操作，撤销未提交的更改。
```

