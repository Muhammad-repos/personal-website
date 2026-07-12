
# conda 常用命令

1. `conda create -n 环境名称 python=版本号 -y` 创建环境，-y 表示自动确认
2. `conda activate 环境名称` 激活环境
3. `conda deactivate` 退出环境
4. `conda install 包名` 安装包
5. `conda remove 包名` 卸载包
6. `conda list` 列出已安装的包
7. `conda search 包名` 搜索包
8. `conda update 包名` 更新包
9.  `conda env export > environment.yaml` 导出环境
10. `conda env create -f environment.yaml` 从文件创建环境
11. `conda env remove -n 环境名称` 删除环境
12. `conda clean -a` 清理缓存
13. `conda info` 查看conda信息