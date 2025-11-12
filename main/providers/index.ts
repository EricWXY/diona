import { OpenAIProvider } from "./OpenAIProvider";


const providers = [
  {
    id: 1,
    name: 'bigmodel',
    title: '智谱AI',
    models: ['glm-4.5-flash'],
    openAISetting: {
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      apiKey: '',
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  },
  {
    id: 2,
    name: 'deepseek',
    title: '深度求索 (DeepSeek)',
    models: ['deepseek-chat'],
    openAISetting: {
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: '',
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  },
  {
    id: 3,
    name: 'siliconflow',
    title: '硅基流动',
    models: ['Qwen/Qwen3-8B', 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'],
    openAISetting: {
      baseURL: 'https://api.siliconflow.cn/v1',
      apiKey: '',
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  },
  {
    id: 4,
    name: 'qianfan',
    title: '百度千帆',
    models: ['ernie-speed-128k', 'ernie-4.0-8k', 'ernie-3.5-8k'],
    openAISetting: {
      baseURL: 'https://qianfan.baidubce.com/v2',
      apiKey: '',
    },
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime()
  },
];


export function createProvider(name: string) {
  // TODO: const provider = config

  if (!providers) {
    throw new Error('provider config not found');
  }

  for (const provider of providers) {
    if (provider.name === name) {
      if (!provider.openAISetting?.apiKey || !provider.openAISetting?.baseURL) {
        throw new Error('apiKey or baseURL not found');
      }
      // TODO: visible

      return new OpenAIProvider(provider.openAISetting.apiKey, provider.openAISetting.baseURL);
    }
  }
}
