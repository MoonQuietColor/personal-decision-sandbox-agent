const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = {
  latestPlan: null,
};

const examples = [
  {
    goal: "六周内完成一个可展示的 AI 个人决策沙盘 Agent，用于网站申请、GitHub 展示和后续科研竞赛项目包装。",
    hours: 2,
    skill: "beginner",
    risk: "medium",
    resources: "个人电脑、AI Coding、浏览器、GitHub Pages、少量公开资料",
    scenarios: ["competition", "coding", "research"],
  },
  {
    goal: "三十天内完成一个面向学生的课程复习路径推演工具，帮助用户从考试目标倒推每日任务 and 风险预警。",
    hours: 1.5,
    skill: "beginner",
    risk: "low",
    resources: "浏览器、静态网页、Excel 数据、AI 辅助写代码",
    scenarios: ["study", "coding"],
  },
];

const scenarioText = {
  competition: "科研竞赛",
  coding: "Coding 项目",
  study: "课程学习",
  career: "职业规划",
  research: "科研入门",
};

const debateState = {
  activeTimer: null,
  skipRequested: false,
  currentQueue: [],
  currentIndex: 0
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function getDaysUntil(deadline) {
  if (!deadline) return 30;
  const today = new Date();
  const end = new Date(`${deadline}T23:59:59`);
  const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return clamp(days, 1, 365);
}

function collectFormData() {
  const checked = $$('input[name="scenario"]:checked').map((item) => item.value);
  return {
    goal: $("#goal").value.trim() || "完成一个 AI 个人决策沙盘 Agent 原型",
    deadline: $("#deadline").value,
    hours: Number($("#hours").value || 2),
    skill: $("#skill").value,
    risk: $("#risk").value,
    resources: $("#resources").value.trim() || "个人电脑、AI Coding、浏览器、GitHub Pages",
    scenarios: checked.length ? checked : ["coding"],
  };
}

function estimateComplexity(data) {
  let complexity = 60;
  if (data.scenarios.includes("research")) complexity += 14;
  if (data.scenarios.includes("competition")) complexity += 12;
  if (data.scenarios.includes("career")) complexity += 6;
  if (data.goal.length > 80) complexity += 8;
  if (/多Agent|Agent|智能体|API|模型|科研|竞赛/i.test(data.goal)) complexity += 10;
  return complexity;
}

// 本地规则启发式计算引擎
function generatePlan(data) {
  const days = getDaysUntil(data.deadline);
  const availableHours = Math.round(days * data.hours);
  const skillBonus = { beginner: 0, intermediate: 12, advanced: 22 }[data.skill];
  const riskTolerance = { low: 0.78, medium: 1, high: 1.18 }[data.risk];
  const complexity = estimateComplexity(data);
  const rawScore = 42 + (availableHours / complexity) * 34 + skillBonus - (data.risk === "high" ? 4 : 0);
  const feasibility = Math.round(clamp(rawScore, 18, 96));

  const recommended = feasibility >= 76 ? "平衡增长路径" : feasibility >= 58 ? "MVP 优先路径" : "保守降范围路径";
  const riskLevel = feasibility >= 78 ? "低" : feasibility >= 58 ? "中" : "高";

  const strategySeed = [
    {
      id: "safe",
      title: "保守降范围路径",
      label: "完成率优先",
      score: clamp(feasibility + 11, 0, 98),
      summary: "先保证可运行 Demo，减少复杂后端和模型依赖，用静态页面 + 本地规则引擎完成闭环。",
      steps: ["只做一个核心输入表单", "输出三类路径和风险清单", "用 README 强化项目包装"],
    },
    {
      id: "mvp",
      title: "MVP 优先路径",
      label: "推荐",
      score: clamp(feasibility + 4, 0, 96),
      summary: "在短周期内完成首页、推演引擎、导出功能和 GitHub 展示页，适合申请网站和项目展示。",
      steps: ["完成视觉化原型", "实现本地沙盘推演", "支持 Markdown / JSON 导出"],
    },
    {
      id: "balanced",
      title: "平衡增长路径",
      label: "创新平衡",
      score: clamp(feasibility - 3, 0, 94),
      summary: "加入多 Agent 分工叙事、任务路线图和风险雷达，让项目比普通计划工具更有辨识度。",
      steps: ["完善 Agent Council", "加入复盘规则", "准备演示案例和截图"],
    },
    {
      id: "moonshot",
      title: "高亮冲刺路径",
      label: "高风险高收益",
      score: clamp(feasibility - 16 * riskTolerance, 0, 88),
      summary: "尝试接入真实 LLM API、本地存储和多轮计划修正，但需要更强调时间管理与错误回退。",
      steps: ["接入模型 API", "增加历史计划记忆", "加入自动复盘对话"],
    },
  ];

  const agents = buildAgents(data, feasibility, riskLevel, recommended, availableHours);
  const timeline = buildTimeline(data, days);
  const risks = buildRisks(data, feasibility, complexity, availableHours);

  return {
    input: data,
    days,
    availableHours,
    complexity,
    feasibility,
    riskLevel,
    recommended,
    strategies: strategySeed,
    agents,
    timeline,
    risks,
    createdAt: new Date().toISOString(),
  };
}

function buildAgents(data, feasibility, riskLevel, recommended, availableHours) {
  const scene = data.scenarios.map((key) => scenarioText[key] || key).join("、");
  return [
    {
      name: "Planner Agent",
      icon: "🧭",
      title: "路径规划",
      advice: `目标属于「${scene}」场景，建议采用「${recommended}」。先做可展示闭环，再扩展智能化。`,
      bullets: ["目标输入与约束收集", "路径生成与任务拆解", "导出可复用计划"],
    },
    {
      name: "Critic Agent",
      icon: "🧪",
      title: "漏洞审查",
      advice: `当前主要风险等级为「${riskLevel}」。最容易失败的点不是创意，而是范围过大和演示证据不足。`,
      bullets: ["避免一开始接复杂后端", "先完成可运行页面", "准备 1 个强案例"],
    },
    {
      name: "Resource Agent",
      icon: "📦",
      title: "资源核算",
      advice: `估算可投入约 ${availableHours} 小时。建议把 60% 时间用于可运行原型，25% 用于展示包装，15% 用于修 Bug。`,
      bullets: ["静态部署优先", "少依赖、少配置", "用 GitHub Pages 展示"],
    },
    {
      name: "Executor Agent",
      icon: "⚙️",
      title: "执行拆解",
      advice: "第一版不追求全自动，而是把输入、分析、输出、导出四步做顺，形成清晰演示链路。",
      bullets: ["今天完成首页", "明天完善推演规则", "第三天写 README"],
    },
    {
      name: "Reviewer Agent",
      icon: "🔁",
      title: "复盘调整",
      advice: "每次迭代只问三个问题：是否能跑、是否好懂、是否能打动评审。不能满足就减功能。",
      bullets: ["每日记录变更", "保留失败原因", "根据反馈重排任务"],
    },
  ];
}

function buildTimeline(data, days) {
  const phase = (ratio) => Math.max(1, Math.round(days * ratio));
  return [
    {
      title: `第 1-${phase(0.18)} 天：定义问题与 Demo 边界`,
      detail: "写清项目解决什么痛点、不是做什么、第一版只交付什么。避免一开始把 Agent、模型、数据库全部堆上。",
    },
    {
      title: `第 ${phase(0.18) + 1}-${phase(0.42)} 天：完成 MVP 闭环`,
      detail: "实现目标输入、约束选择、路径评分、Agent Council、风险雷达和路线图输出。",
    },
    {
      title: `第 ${phase(0.42) + 1}-${phase(0.66)} 天：增强展示效果`,
      detail: "优化 UI、准备示例目标、完善导出功能，让演示时 30 秒内能看懂创新点。",
    },
    {
      title: `第 ${phase(0.66) + 1}-${phase(0.84)} 天：测试与证据整理`,
      detail: "使用不同目标进行压力测试，记录哪些建议合理、哪些建议需要人工修正。",
    },
    {
      title: `第 ${phase(0.84) + 1}-${days} 天：发布与复盘`,
      detail: "部署 GitHub Pages，补充 README、截图、使用说明、未来计划和项目申请描述。",
    },
  ];
}

function buildRisks(data, feasibility, complexity, availableHours) {
  const scopeRisk = clamp(complexity - availableHours * 0.45, 18, 92);
  const techRisk = data.skill === "beginner" ? 72 : data.skill === "intermediate" ? 48 : 32;
  const showRisk = data.scenarios.includes("competition") ? 62 : 44;
  const noveltyRisk = data.risk === "low" ? 38 : data.risk === "medium" ? 56 : 75;
  return [
    { name: "范围失控", value: Math.round(scopeRisk), detail: "目标过大时，先删掉后端、真实模型和复杂账号系统。" },
    { name: "技术卡点", value: Math.round(techRisk), detail: "初版使用静态网页和本地规则引擎，降低安装和调试成本。" },
    { name: "展示不足", value: Math.round(showRisk), detail: "准备一个强 Demo 场景，比堆功能更容易打动人。" },
    { name: "创新表达", value: Math.round(noveltyRisk), detail: "用多 Agent 质询、路径推演、风险雷达来区别普通计划工具。" },
    { name: "完成可行性", value: Math.round(100 - feasibility), detail: "分阶段验收，每一步都能单独展示，降低延期风险。" },
  ];
}

// 渲染雷达图 (SVG 原生渲染)
function drawRadarChart(risks) {
  const svg = $("#radarSvg");
  if (!svg) return;

  const cx = 200;
  const cy = 180;
  const r = 110;
  const numAxes = 5;

  const angles = [];
  for (let i = 0; i < numAxes; i++) {
    angles.push(-Math.PI / 2 + (2 * Math.PI / numAxes) * i);
  }

  // 1. 同心网格
  let gridHtml = "";
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  gridLevels.forEach((level) => {
    const points = angles
      .map((angle) => {
        const px = cx + r * level * Math.cos(angle);
        const py = cy + r * level * Math.sin(angle);
        return `${px},${py}`;
      })
      .join(" ");
    gridHtml += `<polygon points="${points}" class="radar-polygon-bg" />`;
  });

  // 2. 轴线和文字
  let axesHtml = "";
  risks.forEach((risk, i) => {
    const angle = angles[i];
    const targetX = cx + r * Math.cos(angle);
    const targetY = cy + r * Math.sin(angle);

    axesHtml += `<line x1="${cx}" y1="${cy}" x2="${targetX}" y2="${targetY}" class="radar-axis-line" />`;

    const labelDistance = r + 24;
    const labelX = cx + labelDistance * Math.cos(angle);
    let labelY = cy + labelDistance * Math.sin(angle);

    if (Math.sin(angle) > 0.1) {
      labelY += 5;
    } else if (Math.sin(angle) < -0.1) {
      labelY -= 5;
    }

    axesHtml += `
      <text x="${labelX}" y="${labelY}" class="radar-label">
        ${risk.name} (${risk.value}%)
      </text>
    `;
  });

  // 3. 填充的多边形
  const dataPoints = risks.map((risk, i) => {
    const valueRatio = clamp(risk.value, 5, 100) / 100;
    const angle = angles[i];
    const px = cx + r * valueRatio * Math.cos(angle);
    const py = cy + r * valueRatio * Math.sin(angle);
    return { x: px, y: py };
  });

  const pointsStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const dataPolygonHtml = `<polygon points="${pointsStr}" class="radar-polygon-data" />`;

  // 4. 数据点圆形标记
  let markersHtml = "";
  dataPoints.forEach((p) => {
    markersHtml += `<circle cx="${p.x}" cy="${p.y}" r="4.5" class="radar-point" />`;
  });

  svg.innerHTML = `
    ${gridHtml}
    ${axesHtml}
    ${dataPolygonHtml}
    ${markersHtml}
  `;
}

// 模拟 Agent 辩论对话流逻辑
function buildDebateBubbleHtml(agent) {
  const nameMap = {
    "Planner Agent": "planner",
    "Critic Agent": "critic",
    "Resource Agent": "resource",
    "Executor Agent": "executor",
    "Reviewer Agent": "reviewer"
  };
  const agentClass = nameMap[agent.name] || "planner";
  return `
    <article class="debate-bubble ${agentClass}">
      <div class="agent-avatar">${agent.icon || "🧭"}</div>
      <div class="bubble-content">
        <div class="agent-meta">
          <span class="agent-name">${agent.name}</span>
          <span class="agent-title">${agent.title}</span>
        </div>
        <div class="bubble-text">${agent.advice}</div>
        <ul>
          ${agent.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
    </article>
  `;
}

function playDebate(agents, instant = false) {
  if (debateState.activeTimer) {
    clearTimeout(debateState.activeTimer);
    debateState.activeTimer = null;
  }

  const container = $("#debateContainer");
  if (!container) return;

  if (instant) {
    container.innerHTML = agents.map((agent) => buildDebateBubbleHtml(agent)).join("");
    container.scrollTop = container.scrollHeight;
    return;
  }

  container.innerHTML = "";
  debateState.currentQueue = agents;
  debateState.currentIndex = 0;
  debateState.skipRequested = false;

  function nextBubble() {
    if (debateState.skipRequested || debateState.currentIndex >= debateState.currentQueue.length) {
      if (debateState.skipRequested) {
        playDebate(agents, true);
      }
      return;
    }

    const agent = debateState.currentQueue[debateState.currentIndex];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildDebateBubbleHtml(agent);
    container.appendChild(wrapper.firstElementChild);
    container.scrollTop = container.scrollHeight;

    debateState.currentIndex++;

    const delay = Math.max(1600, agent.advice.length * 30 + 800);
    debateState.activeTimer = setTimeout(nextBubble, delay);
  }

  nextBubble();
}

// LLM 接口调用模块
async function generatePlanWithLLM(data) {
  const url = $("#apiUrl").value.trim() || "https://api.deepseek.com/v1";
  const key = $("#apiKey").value.trim();
  const model = $("#apiModel").value.trim() || "deepseek-chat";

  const systemPrompt = `你是一个个人项目兵棋推演与决策辅助 Agent 联席会系统。
你的任务是将用户的目标与现实约束拆解，并以严格合法的 JSON 格式返回推演结论。

返回的 JSON 必须完全符合以下 Schema 结构，不得包含任何 markdown 代码块包裹标记，直接返回 JSON 字符串本身：
{
  "feasibility": 50, // 18-96 之间的数值
  "riskLevel": "中", // "低" | "中" | "高"
  "recommended": "平衡增长路径", // "保守降范围路径" | "MVP 优先路径" | "平衡增长路径" | "高亮冲刺路径"
  "strategies": [
    {
      "id": "safe",
      "title": "保守降范围路径",
      "label": "完成率优先",
      "score": 80,
      "summary": "...",
      "steps": ["步骤1", "步骤2", "步骤3"]
    },
    {
      "id": "mvp",
      "title": "MVP 优先路径",
      "label": "推荐",
      "score": 75,
      "summary": "...",
      "steps": ["步骤1", "步骤2"]
    },
    {
      "id": "balanced",
      "title": "平衡增长路径",
      "label": "创新平衡",
      "score": 70,
      "summary": "...",
      "steps": ["步骤1", "步骤2"]
    },
    {
      "id": "moonshot",
      "title": "高亮冲刺路径",
      "label": "高风险高收益",
      "score": 50,
      "summary": "...",
      "steps": ["步骤1", "步骤2"]
    }
  ],
  "agents": [
    {
      "name": "Planner Agent",
      "icon": "🧭",
      "title": "路径规划",
      "advice": "以 Planner 语气发言建议...",
      "bullets": ["要点1", "要点2"]
    },
    {
      "name": "Critic Agent",
      "icon": "🧪",
      "title": "漏洞审查",
      "advice": "以 Critic 语气发言，找出不切实际的最差可能...",
      "bullets": ["漏洞1", "漏洞2"]
    },
    {
      "name": "Resource Agent",
      "icon": "📦",
      "title": "资源核算",
      "advice": "以 Resource 算账语气发言，压缩任务...",
      "bullets": ["资源建议1", "资源建议2"]
    },
    {
      "name": "Executor Agent",
      "icon": "⚙️",
      "title": "执行拆解",
      "advice": "以 Executor 语气发言建议近期执行...",
      "bullets": ["任务1", "任务2"]
    },
    {
      "name": "Reviewer Agent",
      "icon": "🔁",
      "title": "复盘调整",
      "advice": "以 Reviewer 语气发言，设定自我量化衡量条件...",
      "bullets": ["指标1", "指标2"]
    }
  ],
  "timeline": [
    { "title": "第 1-5 天：边界定义", "detail": "..." },
    { "title": "第 6-15 天：核心构建", "detail": "..." },
    { "title": "第 16-22 天：细节打磨", "detail": "..." },
    { "title": "第 23-27 天：压力测试", "detail": "..." },
    { "title": "第 28-30 天：发布及复盘", "detail": "..." }
  ],
  "risks": [
    { "name": "范围失控", "value": 60, "detail": "..." },
    { "name": "技术卡点", "value": 50, "detail": "..." },
    { "name": "展示不足", "value": 40, "detail": "..." },
    { "name": "创新表达", "value": 70, "detail": "..." },
    { "name": "完成可行性", "value": 65, "detail": "..." }
  ]
}`;

  const userPrompt = `用户目标：${data.goal}
现实约束：
- 截止日期：${data.deadline || "未设定（默认按30天计算）"}
- 每天可用时间：${data.hours} 小时
- 当前能力水平：${data.skill}（beginner-初学者/intermediate-中级/advanced-高级）
- 风险偏好：${data.risk}
- 可用资源：${data.resources}
- 场景：${data.scenarios.map(s => scenarioText[s] || s).join("、")}

请严格进行推理并返回 JSON 格式分析数据。注意 advice 内容应当具体针对该目标及约束，不要空谈。`;

  const response = await fetch(`${url}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP Error ${response.status}: ${errText}`);
  }

  const resData = await response.json();
  let content = resData.choices[0].message.content.trim();

  if (content.startsWith("```")) {
    content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  const parsed = JSON.parse(content);

  const days = getDaysUntil(data.deadline);
  const availableHours = Math.round(days * data.hours);

  return {
    input: data,
    days,
    availableHours,
    complexity: parsed.complexity || estimateComplexity(data),
    feasibility: parsed.feasibility || 50,
    riskLevel: parsed.riskLevel || "中",
    recommended: parsed.recommended || "平衡增长路径",
    strategies: parsed.strategies,
    agents: parsed.agents,
    timeline: parsed.timeline,
    risks: parsed.risks,
    createdAt: new Date().toISOString(),
  };
}

function renderPlan(plan) {
  state.latestPlan = plan;
  localStorage.setItem("decisionSandbox:lastPlan", JSON.stringify(plan));

  $("#scoreRing").style.setProperty("--score", plan.feasibility);
  $("#mainScore").textContent = plan.feasibility;
  $("#scoreTitle").textContent = `推荐：${plan.recommended}`;
  $("#scoreText").textContent = `系统估算该目标在当前约束下的可行性为 ${plan.feasibility}/100，风险等级为「${plan.riskLevel}」。建议优先完成能展示的闭环，再追求自动化。`;
  $("#metricTime").textContent = plan.availableHours;
  $("#metricRisk").textContent = plan.riskLevel;
  $("#metricMode").textContent = plan.recommended.replace("路径", "");

  $("#strategyGrid").innerHTML = plan.strategies
    .map(
      (item) => `
    <article class="strategy-card ${item.label === "推荐" ? "featured" : ""}">
      <span class="badge">${item.label}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <div class="progress" aria-label="路径评分 ${Math.round(item.score)}"><span style="width:${Math.round(item.score)}%"></span></div>
      <strong>${Math.round(item.score)}/100</strong>
      <ul>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ul>
    </article>
  `
    )
    .join("");

  // 为导出/无动画做备份渲染
  $("#agentGrid").innerHTML = plan.agents
    .map(
      (agent) => `
    <article class="agent-card">
      <div class="agent-icon">${agent.icon}</div>
      <h3>${agent.name}</h3>
      <p><strong>${agent.title}</strong>：${agent.advice}</p>
      <ul>${agent.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
    </article>
  `
    )
    .join("");

  // 播放 Agent 辩论
  playDebate(plan.agents, false);

  $("#timeline").innerHTML = plan.timeline
    .map(
      (item, index) => `
    <li data-step="${index + 1}">
      <h3>${item.title}</h3>
      <p>${item.detail}</p>
    </li>
  `
    )
    .join("");

  $("#riskRadar").innerHTML = plan.risks
    .map(
      (risk) => `
    <div class="risk-item">
      <strong><span>${risk.name}</span><span>${risk.value}%</span></strong>
      <div class="risk-bar"><span style="width:${risk.value}%"></span></div>
      <p>${risk.detail}</p>
    </div>
  `
    )
    .join("");

  // 绘制雷达图
  drawRadarChart(plan.risks);
}

function toMarkdown(plan) {
  if (!plan) return "# Personal Decision Sandbox Agent\n\n尚未生成推演。";
  return `# Personal Decision Sandbox Report

## 目标
${plan.input.goal}

## 现实约束
- 截止时间：${plan.input.deadline || "未设置，默认按 30 天估算"}
- 每天投入：${plan.input.hours} 小时
- 可用总小时：${plan.availableHours} 小时
- 能力水平：${plan.input.skill}
- 风险偏好：${plan.input.risk}
- 可用资源：${plan.input.resources}
- 场景：${plan.input.scenarios.map((key) => scenarioText[key] || key).join("、")}

## 总体判断
- 可行性评分：${plan.feasibility}/100
- 风险等级：${plan.riskLevel}
- 推荐路径：${plan.recommended}

## 策略路径
${plan.strategies.map((item) => `### ${item.title}（${Math.round(item.score)}/100）\n${item.summary}\n${item.steps.map((step) => `- ${step}`).join("\n")}`).join("\n\n")}

## Agent Council 辩论摘要
${plan.agents.map((agent) => `### ${agent.icon} ${agent.name} (${agent.title})\n> ${agent.advice}\n${agent.bullets.map((bullet) => `- ${bullet}`).join("\n")}`).join("\n\n")}

## 路线图
${plan.timeline.map((item, index) => `${index + 1}. **${item.title}**：${item.detail}`).join("\n")}

## 风险雷达
${plan.risks.map((risk) => `- ${risk.name}：${risk.value}% —— ${risk.detail}`).join("\n")}
`;
}

function download(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const existing = $(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

function setFormExample(example) {
  $("#goal").value = example.goal;
  $("#hours").value = example.hours;
  $("#hoursVal").textContent = example.hours;
  $("#skill").value = example.skill;
  $("#risk").value = example.risk;
  $("#resources").value = example.resources;
  $$('input[name="scenario"]').forEach((item) => {
    item.checked = example.scenarios.includes(item.value);
  });
  const future = new Date();
  future.setDate(future.getDate() + 42);
  $("#deadline").value = future.toISOString().slice(0, 10);
  updateDaysLeft();
}

function updateDaysLeft() {
  const days = getDaysUntil($("#deadline").value);
  $("#daysLeftVal").textContent = `(还剩 ${days} 天)`;
}

// API 配置的本地读写
function saveApiSettings() {
  const config = {
    enable: $("#apiEnable").checked,
    url: $("#apiUrl").value.trim(),
    key: $("#apiKey").value.trim(),
    model: $("#apiModel").value.trim(),
  };
  localStorage.setItem("decisionSandbox:apiConfig", JSON.stringify(config));
}

function loadApiSettings() {
  const saved = localStorage.getItem("decisionSandbox:apiConfig");
  if (saved) {
    try {
      const config = JSON.parse(saved);
      $("#apiEnable").checked = !!config.enable;
      $("#apiUrl").value = config.url || "https://api.deepseek.com/v1";
      $("#apiKey").value = config.key || "";
      $("#apiModel").value = config.model || "deepseek-chat";

      if (config.enable) {
        $("#apiInputs").classList.remove("disabled");
      } else {
        $("#apiInputs").classList.add("disabled");
      }
    } catch (e) {
      console.warn("Failed to load API settings", e);
    }
  } else {
    $("#apiInputs").classList.add("disabled");
  }
}

// URL Hash 状态共享编解码
function encodeState(data) {
  const jsonStr = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonStr));
}

function decodeState(base64Str) {
  try {
    const jsonStr = decodeURIComponent(atob(base64Str));
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to decode state from URL", error);
    return null;
  }
}

function getShareUrl() {
  const data = collectFormData();
  const stateStr = encodeState({
    goal: data.goal,
    deadline: data.deadline,
    hours: data.hours,
    skill: data.skill,
    risk: data.risk,
    resources: data.resources,
    scenarios: data.scenarios
  });
  return `${window.location.origin}${window.location.pathname}#state=${stateStr}`;
}

// 实时触发推演刷新 (防抖)
const debouncedTriggerSimulation = debounce(() => {
  const data = collectFormData();
  // 实时推演只采用本地引擎，不调用 API 扣费
  const plan = generatePlan(data);
  renderPlan(plan);
}, 350);

function bootstrap() {
  // 1. 初始化截止日期
  const future = new Date();
  future.setDate(future.getDate() + 30);
  $("#deadline").value = future.toISOString().slice(0, 10);
  updateDaysLeft();

  // 2. 加载大模型配置
  loadApiSettings();

  // 3. 检测是否从 Hash 还原状态
  let restored = false;
  try {
    const hash = window.location.hash;
    if (hash && hash.includes("state=")) {
      const stateStr = hash.split("state=")[1];
      const data = decodeState(stateStr);
      if (data) {
        $("#goal").value = data.goal || "";
        $("#hours").value = data.hours || 2;
        $("#hoursVal").textContent = data.hours || 2;
        $("#skill").value = data.skill || "beginner";
        $("#risk").value = data.risk || "medium";
        $("#resources").value = data.resources || "";
        $("#deadline").value = data.deadline || "";
        $$('input[name="scenario"]').forEach((item) => {
          item.checked = (data.scenarios || []).includes(item.value);
        });
        updateDaysLeft();
        renderPlan(generatePlan(data));
        showToast("已加载分享链接中的沙盘配置");
        restored = true;
      }
    }
  } catch (e) {
    console.error("Error restoring URL hash state", e);
  }

  // 4. 若未还原，则加载 LocalStorage 或默认 Presets
  if (!restored) {
    const saved = localStorage.getItem("decisionSandbox:lastPlan");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        renderPlan(parsed);
        // 回填表单
        const inputData = parsed.input;
        if (inputData) {
          $("#goal").value = inputData.goal || "";
          $("#hours").value = inputData.hours || 2;
          $("#hoursVal").textContent = inputData.hours || 2;
          $("#skill").value = inputData.skill || "beginner";
          $("#risk").value = inputData.risk || "medium";
          $("#resources").value = inputData.resources || "";
          $("#deadline").value = inputData.deadline || "";
          $$('input[name="scenario"]').forEach((item) => {
            item.checked = (inputData.scenarios || []).includes(item.value);
          });
          updateDaysLeft();
        }
      } catch (error) {
        console.warn("Failed to restore saved plan", error);
      }
    } else {
      setFormExample(examples[0]);
      renderPlan(generatePlan(collectFormData()));
    }
  }

  // 5. 监听表单输入变化进行“防抖实时刷新”
  const inputsToWatch = ["#goal", "#hours", "#skill", "#risk", "#resources", "#deadline"];
  inputsToWatch.forEach((selector) => {
    $(selector).addEventListener("input", () => {
      if (selector === "#hours") {
        $("#hoursVal").textContent = $("#hours").value;
      }
      if (selector === "#deadline") {
        updateDaysLeft();
      }
      debouncedTriggerSimulation();
    });
  });

  $$('input[name="scenario"]').forEach((checkbox) => {
    checkbox.addEventListener("change", debouncedTriggerSimulation);
  });

  // API 启用切换
  $("#apiEnable").addEventListener("change", (e) => {
    if (e.target.checked) {
      $("#apiInputs").classList.remove("disabled");
    } else {
      $("#apiInputs").classList.add("disabled");
    }
    saveApiSettings();
  });

  // 6. 提交推演表单（显式运行 API 推演或强制刷新）
  $("#decisionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = collectFormData();
    saveApiSettings();

    const apiEnabled = $("#apiEnable").checked;
    const apiKey = $("#apiKey").value.trim();

    let plan;
    if (apiEnabled && apiKey) {
      showToast("🚀 正在通过云端 AI 启动决策推演，请稍候...");
      const submitBtn = event.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "AI 推演中...";

      try {
        plan = await generatePlanWithLLM(data);
        showToast("✅ AI 决策推演生成成功");
      } catch (err) {
        console.error("LLM Generation failed", err);
        showToast("⚠️ AI 生成失败，已降级至本地算法");
        plan = generatePlan(data);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } else {
      if (apiEnabled && !apiKey) {
        showToast("未配置 API Key，已使用本地引擎");
      }
      plan = generatePlan(data);
      showToast("本地沙盘推演已刷新");
    }

    renderPlan(plan);
    $("#scoreRing").scrollIntoView({ behavior: "smooth" });
  });

  // 7. 示例按钮
  $("#loadExampleBtn").addEventListener("click", () => {
    const example = examples[Math.floor(Math.random() * examples.length)];
    setFormExample(example);
    renderPlan(generatePlan(collectFormData()));
    $("#sandbox").scrollIntoView({ behavior: "smooth" });
  });

  // 8. 重置按钮
  $("#resetBtn").addEventListener("click", () => {
    $("#decisionForm").reset();
    $("#hoursVal").textContent = "2";
    updateDaysLeft();
    localStorage.removeItem("decisionSandbox:lastPlan");
    showToast("已清空输入设置");
    // 渲染个默认的新推演
    renderPlan(generatePlan(collectFormData()));
  });

  // 9. 复制 Markdown
  $("#copyMarkdownBtn").addEventListener("click", async () => {
    const md = toMarkdown(state.latestPlan);
    try {
      await navigator.clipboard.writeText(md);
      showToast("Markdown 报告已复制到剪贴板");
    } catch (e) {
      showToast("复制失败，请重试");
    }
  });

  // 10. 重新播放与跳过动画
  $("#replayDebateBtn").addEventListener("click", () => {
    if (state.latestPlan) {
      playDebate(state.latestPlan.agents, false);
      showToast("已重新播放 Agent 联席辩论会");
    }
  });

  $("#skipDebateBtn").addEventListener("click", () => {
    if (state.latestPlan) {
      debateState.skipRequested = true;
      playDebate(state.latestPlan.agents, true);
      showToast("已跳过动画，显示完整辩论结果");
    }
  });

  // 11. 分享链接
  $("#sharePlanBtn").addEventListener("click", async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("🔗 分享链接已复制！发送给他人可直接载入此沙盘配置");
    } catch (e) {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("🔗 分享链接已复制");
    }
  });

  // 12. 下载 JSON/Markdown
  $("#downloadJsonBtn").addEventListener("click", () => {
    download("decision-sandbox-report.json", JSON.stringify(state.latestPlan, null, 2), "application/json");
  });

  $("#downloadMarkdownBtn").addEventListener("click", () => {
    download("decision-sandbox-report.md", toMarkdown(state.latestPlan), "text/markdown");
  });
}

bootstrap();
