# Personal Decision Sandbox Agent

> **Personal Decision Sandbox Agent** 是一个面向学生、独立开发者和科研竞赛初学者的 AI 个人决策沙盘原型。它把用户的目标、时间、能力、资源和风险偏好转化为可推演的多路径行动方案，帮助用户在真正投入时间与成本之前，先看清不同选择的可行性、风险和执行路线。

🌐 推荐部署地址：`https://moonquietcolor.github.io/personal-decision-sandbox-agent/`  
📦 仓库地址：`https://github.com/MoonQuietColor/personal-decision-sandbox-agent`

---

## 1. 项目想解决什么问题？

很多个人项目、课程设计、竞赛原型或学习计划失败，并不是因为想法不好，而是因为：

- 目标过大，早期没有拆成可执行任务；
- 不了解自己的时间、能力和资源边界；
- 做计划时只看理想情况，没有提前暴露失败风险；
- 执行过程中缺少复盘机制，计划很快失效；
- 普通 To-do List 只能记录任务，不能判断方案是否现实。

本项目尝试把 AI Agent 的思路应用到个人决策场景中，让系统像一个“小型策略会议室”一样，从规划、质疑、资源约束、执行拆解和复盘五个角度帮助用户做判断。

---

## 2. 核心功能

### 多 Agent 协作推演

系统内置五个角色化 Agent 逻辑：

| Agent | 作用 |
|---|---|
| Planner Agent | 负责把目标拆成阶段路线和行动结构 |
| Critic Agent | 负责发现计划中的风险、漏洞和不现实之处 |
| Resource Agent | 负责评估时间、技能、工具和资源是否足够 |
| Executor Agent | 负责生成近期可执行任务 |
| Reviewer Agent | 负责形成复盘指标和后续优化方向 |

### 四种路径方案

系统会根据输入自动生成不同推进路径：

- **Conservative Path**：保守路径，降低范围，优先保证完成；
- **MVP Path**：最小可行路径，先做可展示 Demo；
- **Balanced Path**：平衡路径，兼顾完成度和创新表达；
- **Moonshot Path**：冲刺路径，突出创意和展示效果，但风险更高。

### 风险雷达与执行路线

系统会输出：

- 范围失控风险；
- 技术卡点风险；
- 时间不足风险；
- 展示材料不足风险；
- 创新表达不足风险；
- 阶段路线图；
- 可导出的 Markdown / JSON 结果。

---

## 3. 在线部署

本项目是纯静态项目，不需要后端，也不需要数据库，适合直接部署到 GitHub Pages。

### GitHub Pages 部署方式

1. 把本项目所有文件上传到仓库根目录。
2. 进入仓库：`Settings` → `Pages`。
3. Source 选择：`GitHub Actions`。
4. 推送后等待 Actions 自动部署。
5. 部署成功后访问：

```text
https://moonquietcolor.github.io/personal-decision-sandbox-agent/
```

仓库中已经包含自动部署文件：

```text
.github/workflows/pages.yml
```

---

## 4. 本地运行

### 方式一：直接打开

双击 `index.html` 即可运行。

### 方式二：使用本地服务

```bash
python -m http.server 5173
```

然后在浏览器打开：

```text
http://localhost:5173
```

### 方式三：使用 npm 脚本

```bash
npm start
```

---

## 5. 文件结构

```text
personal-decision-sandbox-agent/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── package.json
├── assets/
│   └── logo.svg
├── docs/
│   ├── architecture.md
│   ├── product-brief.md
│   └── website-application-copy.md
├── .github/
│   └── workflows/
│       └── pages.yml
├── .gitignore
└── LICENSE
```

---

## 6. 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages
- GitHub Actions

项目刻意保持轻量化，避免复杂框架依赖，方便快速展示、提交网站申请、参加课程项目或竞赛原型展示。

---

## 7. 项目亮点

相比普通 AI 聊天助手或计划工具，本项目的特点是：

1. **不是只生成计划，而是推演选择。**  
   它会比较不同路径的收益、风险和执行难度。

2. **不是单一 AI 视角，而是多 Agent 评估。**  
   Planner、Critic、Resource、Executor、Reviewer 分别模拟不同角色。

3. **不是只服务开发者，也适合学生和个人成长场景。**  
   可用于竞赛项目、课程复习、职业规划、科研入门、个人作品集规划等。

4. **零后端、低成本、容易部署。**  
   任何人都可以用 GitHub Pages 直接运行。

---

## 8. 适合填写到网站申请中的简介

> I am building a Personal Decision Sandbox Agent, an AI-powered simulation workspace that helps students and independent creators evaluate goals before investing real time and resources. Instead of simply generating a to-do list, it transforms personal constraints such as time, skills, tools, risk tolerance and deadlines into multiple possible execution paths. A group of role-based agents, including Planner, Critic, Resource, Executor and Reviewer, collaboratively analyzes feasibility, exposes hidden risks and generates actionable roadmaps. The project aims to become a lightweight personal strategy lab for learning, competitions, career planning and early-stage project development.

---

## 9. 后续计划

- 接入真实大模型 API，生成更自然的 Agent 推演文本；
- 增加历史记录和多次复盘对比；
- 增加中英文切换；
- 增加项目截图、展示视频和案例模板；
- 支持导入课程表、GitHub Issues 或学习资料；
- 增加更完整的风险评分模型和可视化图表。

---

## 10. License

MIT License
