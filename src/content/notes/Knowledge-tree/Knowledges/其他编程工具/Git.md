
# git的基础使用
>[git 学习](obsidian://open?vault=Knowledge%20Vault&file=Assets%2Fmds%2Fgit%2FGIt%E5%AD%A6%E4%B9%A0)
1. `git init` 初始化仓库
2. `touch .gitignore` 创建gitignore 文件  
3. `git add` 文件名 添加文件到暂存区
4. `git add .` 添加所有文件到暂存区
5. `git status` 查看当前仓库状态
6. `git commit -m "xx提交信息的描述"`  对暂存文件的描述
7. `git log` 查看提交历史
8. `git log --oneline` 查看简洁的提交历史
9. `git push -u origin master` 推送到远程仓库
# 回滚操作
1. `git reset --hard HEAD^` 回退到上一个版本
2. `git reset --hard HEAD^^` 回退到上上个版本
3. `git reset --hard` 版本号 回退到指定版本
4. 仅需代码文件：
```bash
# 格式：git archive --format=zip --output="目标文件夹/导出文件名.zip" 要导出的版本哈希 
# 示例：把哈希为 81dfb39 的版本导出到 D 盘的 backup 文件夹，命名为 runoff_v1.zip
 git archive --format=zip --output="D:/backup/runoff_v1.zip" 81dfb39 # 如果是想要最新版本，则可以把版本哈希改成HEAD
```
5. 需保留 Git 历史：
```bash
# 格式：git clone 原仓库路径 新仓库文件夹名 
# 示例：克隆 D 盘的原仓库到当前文件夹，命名为 runoff_v1
 git clone D:/Muhammad202510/径流调节/径流调节程序开发 runoff_v1
 cd runoff_v1 # 进入新文件夹 
 git checkout 81dfb39 # 检出要保存的版本哈希
```

# 创建新分支

1. `git remote -v` 查看当前项目的远程仓库

2. `git pull origin main` 从远程仓库 origin 的 main 分支拉取最新代码，并合并到当前本地分支

3. `git checkout -b feature/daily-ten-day-runoff` 创建并切换到新分支,其中`feature/daily-ten-day-runoff`是新分支的名称。这个命令等价于先执行 `git branch xx` (创建分支)，再执行 `git checkout xx`  （切换分支）。
4. `git branch`   查看所有本地分支
5. `git push -u origin feature/daily-ten-day-runoff` 将新分支推送到远程仓库（建立追踪关系）
6. `git branch -d 分支名` 删除本地无用分支
7. `git branch -a` # 查看本地和远程所有分支 git branch -a
```Python
# 移除所有 __pycache__ 文件夹的追踪（递归匹配所有目录下的）
 git rm -r --cached **/__pycache__ 
 # 移除所有 .pyc 文件的追踪
  git rm -r --cached **/*.pyc
```
