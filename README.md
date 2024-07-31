# hexo layout

Hexo-Layout 允许用户在**不修改**主题**源码**情况下对主题局部模板进行替换.

## 安装

node 版本要求 >= v14

```cmd
npm install hexo-layout --save
```

## 配置

将配置写入站点的配置文件 \_config.yml 里(不是主题的配置文件).

配置主要需要修改是 custom 字段, 建立原模板与新模板关系

```yml
layout:
  path: layout # 自定义模板存放文件夹, 相对于根目录
  prefix: _hexo_layout_ # 模板名称前缀, 避免与原主题中模板命名冲突
  custom:
    原模版: 新模板
```

## 使用

[在线使用示例](https://stackblitz.com/edit/node-bqs8oq?file=README.md)

# Lisense

MIT
