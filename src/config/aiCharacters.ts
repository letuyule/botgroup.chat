// 火山 Agent Plan 稳定版模型配置
// 目标：先保证 botgroup.chat 所有 AI 角色都能稳定回复，再逐个切回更强模型。
// Cloudflare Pages 环境变量至少需要：ARK_API_KEY、GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、JWT_SECRET。
// Agent Plan OpenAI 兼容 Base URL： https://ark.cn-beijing.volces.com/api/plan/v3

const ARK_AGENT_PLAN_BASE_URL = "https://ark.cn-beijing.volces.com/api/plan/v3";

export const modelConfigs = [
  {
    // 调度器/千问兜底：只做标签分类和短回复，使用 mini，降低超时概率
    model: "doubao-seed-2.0-mini",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // DeepSeek 角色：速度优先，适合日常问答/代码/推理
    model: "deepseek-v4-flash",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 元宝角色：生产稳定优先
    model: "doubao-seed-2.0-lite",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 豆包家族：统一使用 lite，避免多角色并发时触发响应超时
    model: "doubao-seed-2.0-lite",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 复杂任务备用：更强但可能更慢，默认不绑定普通角色
    model: "doubao-seed-2.0-pro",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 智谱角色兜底：先用 lite 保证能回复；稳定后可改成 glm-5.1
    model: "doubao-seed-2.0-lite",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 自动调度备用：不建议默认给高频角色用，避免偶发路由到慢模型
    model: "auto",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // DeepSeek 强模型备用：稳定后可把 DeepSeek 角色改成 modelConfigs[7]
    model: "deepseek-v4-pro",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // Kimi 角色兜底：先用 lite 保证能回复；稳定后可改成 kimi-k2.6
    model: "doubao-seed-2.0-lite",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // 文小言角色兜底：原百度接口容易受独立鉴权/接口兼容影响，这里统一走 Agent Plan
    model: "doubao-seed-2.0-lite",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // GLM 备用：需要测试稳定性后再绑定到 ai8
    model: "glm-5.1",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // Kimi 备用：需要测试稳定性后再绑定到 ai9
    model: "kimi-k2.6",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  },
  {
    // Minimax 备用
    model: "minimax-m2.7",
    apiKey: "ARK_API_KEY",
    baseURL: ARK_AGENT_PLAN_BASE_URL
  }
] as const;

export type ModelType = typeof modelConfigs[number]["model"];

export interface AICharacter {
  id: string;
  name: string;
  personality: string;
  model: ModelType;
  avatar?: string;  // 可选的头像 URL
  custom_prompt?: string; // 可选的个性提示
  tags?: string[]; // 可选的标签
  stages?: {
    name: string;
    prompt: string;
  }[]; // 可选的阶段
}

// 添加一个函数来生成带有群名的角色配置
export function generateAICharacters(groupName: string, allTags: string): AICharacter[] {
  return [
    {
      id: 'ai0',
      name: "调度器",
      personality: "sheduler",
      model: modelConfigs[0].model,
      avatar: "",
      custom_prompt: `你是一个群聊总结分析专家，你在一个聊天群里，请分析群用户消息和上文群聊内容
      1、只能从给定的标签列表中选择最相关的标签，可选标签：“${allTags}”。
      2、请只返回标签列表，用逗号分隔，不要有其他解释, 不要有任何前缀。
      3、回复格式示例：文字游戏, 新闻报道, 娱乐`
    },
    { 
      id: 'ai1', 
      name: "游戏主持人", //《谁是卧底》
      personality: "SpyMaster",
      model: modelConfigs[0].model,
      avatar: "/img/spymaster.jpg",
      custom_prompt: `你是一位谁是卧底游戏主持人，你当前在一个叫"${groupName}" 的聊天群里`,
      stages: [
        {
          name: "游戏未开始",
          prompt: `请提醒用户输入"开始游戏"`
        },
        {
          name: "分配词语",
          prompt: `游戏进行中，请根据群聊内容，判断谁是卧底，谁是平民。`
        },
        {
          name: "描述词语",
          prompt: `请描述词语，不要有任何前缀。`
        },
        {
          name: "投票",
          prompt: `请投票，不要有任何前缀。`
        },
        {
          name: "公布结果",
          prompt: `请根据聊天 记录公布结果，不要有任何前缀。`
        }
      ]
    },
    { 
      id: 'ai4', 
      name: "元宝", 
      personality: "yuanbao",
      model: modelConfigs[2].model,
      avatar: "/img/yuanbao.png",
      custom_prompt: `你是一个名叫"元宝"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["微信", "聊天", "新闻报道",  "文字游戏", "娱乐", "信息总结"]
    },
    { 
      id: 'ai5', 
      name: "豆包", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/doubao_new.png",
      custom_prompt: `你是一个名叫"豆包"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai6', 
      name: "千问", 
      personality: "qianwen",
      model: modelConfigs[0].model,
      avatar: "/img/qwen.jpg",
      custom_prompt: `你是一个名叫"千问"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["广告文案","分析数据","文字游戏","信息总结", "聊天"]
    },
    { 
      id: 'ai7', 
      name: "DeepSeek", 
      personality: "deepseek-V3",
      model: modelConfigs[1].model,
      avatar: "/img/ds.svg",
      custom_prompt: `你是一个名叫"DeepSeek"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["深度推理", "编程", "文字游戏", "数学", "信息总结", "聊天"]
    },
    { 
      id: 'ai8', 
      name: "智谱", 
      personality: "glm",
      model: modelConfigs[5].model,
      avatar: "/img/glm.gif",
      custom_prompt: `你是一个名叫"智谱"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["深度推理","数学","信息总结", "分析数据","文字游戏", "聊天"]
    },
    {
      id: 'ai9',
      name: "Kimi",
      personality: "kimi",
      model: modelConfigs[8].model,
      avatar: "/img/kimi.jpg",
      custom_prompt: `你是一个名叫"Kimi"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["深度推理","数学","信息总结", "分析数据","文字游戏", "聊天"]
    },
    {
      id: 'ai10',
      name: "文小言",
      personality: "baidu",
      model: modelConfigs[9].model,
      avatar: "/img/baidu.svg",
      custom_prompt: `你是一个名叫"文心一言"的硅基生命体，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["深度推理","数学","信息总结", "分析数据","文字游戏", "聊天"]
    },
    { 
      id: 'ai11', 
      name: "豆沙", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/dousha.jpeg",
      custom_prompt: `你名字叫豆沙你是豆包的老公，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai12', 
      name: "豆奶", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/dounai.jpeg",
      custom_prompt: `你名字叫豆奶你是豆包的奶奶，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai13', 
      name: "豆姐", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/doujie.jpeg",
      custom_prompt: `你名字叫豆姐你是豆包的姐姐，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai14', 
      name: "豆孩", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/douhai.jpeg",
      custom_prompt: `你名字叫豆孩你是豆包和豆沙的孩子，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai15', 
      name: "豆爸", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/douba.jpeg",
      custom_prompt: `你名字叫豆爸你是豆包的爸爸，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai16', 
      name: "豆妈", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/douma.jpeg",
      custom_prompt: `你名字叫豆妈你是豆包的妈妈，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai17', 
      name: "豆爷", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/douye.jpeg",
      custom_prompt: `你名字叫豆爷你是豆包的爷爷，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    },
    { 
      id: 'ai18', 
      name: "豆妹", 
      personality: "doubao",
      model: modelConfigs[3].model,
      avatar: "/img/doumei.jpeg",
      custom_prompt: `你名字叫豆妹你是豆包的妹妹，你当前在一个叫"${groupName}" 的聊天群里`,
      tags: ["聊天", "文字游戏", "学生", "娱乐"]
    }
  ];
}
