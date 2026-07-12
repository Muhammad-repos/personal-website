---
time: 2025-05-23T20:20:00
---
#  1.git 配置
## 1. 打开git bash``
## 2.设置用户信息
```bash
# 配置
git config --global user.name "your name"
git config --global user.email "your email"
# 查看
git config --global user.name
git config --global user.email
```

## 3. 为常用指令配置别名
### 1. 打开用户目录，创建 .bashrc文件
```bash
# 注意，要在用户目录，即C:\Users\26679中创建
touch ~/.bashrc  # ~是当前目录的意思。touch是创建命令
```

### 2.设置别名
```bash
# alias 是别名，也就是说以后仅输入等号左边的内容来达到等号右边命令的效果。
# 用于输出git提交日志 
alias git-log='git log --pretty=oneline --all --graph --abbrev-commit'
# 用于输出当前目录所有文件及基本信息 
alias ll='ls -al'
```

# 2.开始操作

## 1. 获取本地仓库
1) 在电脑的任意位置创建一个空日录(例如test)作为我们的本地Git仓库
2) 进入这个目录中，点击右键打开Git bash窗口
3) 执行命令git init
4) 4)如果创建成功后可在文件夹下看到隐藏的.git日录
```bash
git init
```

## 2. 基础指令
```bash
# 创建文件
touch myfile01.txt
# 查看状态
git status
# 暂存文件
# 点号指的是该工作目录的所有内容，也可以换成具体的文件名，如git add myfile01.txt
git add .
# 提交文件至本地仓库  git commit，后面可以加上 -m来添加注释
git commit -m "i added the file called myfile01.txt"
# 查看日志
git log
# 或者查看提交记录
git-log


```

## 3. 退回版本
```bash
git reset 
```

## 4. 分支
```bash
# 查看分支
git branch
# 创建分支mydev01
git branch mydev01
# 切换分支
git checkout mydev01
# 创建并切换分支
git checkout -b mydev02
# 合并分支  要出在某一个分支，比如说我现在在master，然后想把mydev01分支合并到master中。
git merge mydev01
# 删除某个分支
git branch -d mydev01
```


# 3. 远程仓库
## 1. 配置公钥
```bash
# 输入这个命令以后，一直按回车即可（即不用管其他让输入的东西）
ssh-keygen -t rsa
# 获取公钥 ,然后把生成的内容复制到目标代码托管平台的ssh公钥那儿
cat ~/.ssh/id_rsa.pub
# 验证配置是否成功(这里是gitee平台)
ssh -T git@gitee.com
```

## 2.远程仓库添加
命令: git remote add <远端名称><仓库路径>
远端名称，默认是origin，取决于远端服务器设置
仓库路径，从远端服务器获取此URL

```bash
# remote add 远程仓库添加，origin 本地仓库昵称，git@gitee.com:mhmt/git_learn.git  要提交的远程仓库的地址
git remote add origin git@gitee.com:mhmt/git_learn.git
```

## 3. 推送到远程仓库
```bash
# 查看远程仓库
git remote
# 推送
git push origin master
# 查看本地分支和远程分支的对应关系
git branch -vv
# 远程master和本地master给关联上
git push --set-upstream origin master:master


```


