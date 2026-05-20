# 架构说明

## 技术选型

当前版本使用纯前端静态技术：

- HTML：页面结构
- CSS：视觉设计与响应式布局
- JavaScript：本地规则引擎、状态管理、导出功能
- GitHub Pages：静态部署

该架构不需要 Node.js 构建流程，也不需要数据库和后端服务，因此适合初学者快速部署和演示。

## 模块划分

```text
UI Layer
├── Hero Section
├── Input Form
├── Score Panel
├── Strategy Cards
├── Agent Council
├── Roadmap Timeline
└── Export Panel

Logic Layer
├── collectFormData()
├── estimateComplexity()
├── generatePlan()
├── buildAgents()
├── buildTimeline()
├── buildRisks()
└── toMarkdown()

Storage / Export
├── localStorage 保存最近一次推演
├── JSON 下载
└── Markdown 下载 / 复制
```

## 规则引擎思路

系统根据以下因素估算可行性：

- 截止日期距离当前日期的天数
- 每天可投入小时数
- 当前能力水平
- 目标场景复杂度
- 目标文本中是否包含 Agent、模型、科研、竞赛等复杂关键词
- 风险偏好

可行性评分不是绝对预测，而是用于帮助用户比较不同策略路径。

## 可扩展架构

后续可以将 `generatePlan()` 替换为以下形态：

```text
前端表单
  ↓
API Route / Serverless Function
  ↓
LLM Agent Orchestrator
  ↓
Planner / Critic / Resource / Executor / Reviewer
  ↓
结构化 JSON 输出
  ↓
前端可视化渲染
```

这样就可以从“本地规则原型”升级为“真实 AI Agent 应用”。
