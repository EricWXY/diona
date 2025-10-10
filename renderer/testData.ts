import { Message, Conversation } from '@common/types'

/**
 * 生成随机日期时间戳
 * @param start 开始日期
 * @param end 结束日期
 * @returns 时间戳数字
 */
const randomDate = (start: Date, end: Date): number => {
  return start.getTime() + Math.random() * (end.getTime() - start.getTime());
};

// 定义测试数据的日期范围
const startDate = new Date(2024, 0, 1); // 2024年1月1日
const endDate = new Date(2024, 11, 31); // 2024年12月31日

export const messages: Message[] = [
  // 会话1
  { id: 1, content: '什么是光合作用？能简单介绍一下吗？', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'question', conversationId: 1 },
  { id: 2, content: '光合作用是绿色植物、藻类和某些细菌利用叶绿素吸收光能，将二氧化碳和水转化为有机物并释放氧气的过程。这是地球上几乎所有生命能量的来源。', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', conversationId: 1 },
  { id: 3, content: '光合作用的具体过程是怎样的？有哪些关键步骤？', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'question', conversationId: 1 },
  { id: 4, content: '光合作用分为光反应和暗反应两个阶段。光反应发生在类囊体膜上，通过光解水产生氧气、ATP和NADPH；暗反应（卡尔文循环）发生在叶绿体基质中，利用这些能量将二氧化碳固定成有机物。', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', conversationId: 1 },
  { id: 5, content: '哪些因素会影响光合作用的效率？', createdAt: randomDate(startDate, endDate), type: 'question', updatedAt: randomDate(startDate, endDate), conversationId: 1 },
  { id: 6, content: '', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', status: 'loading', conversationId: 1 },

  // 会话2
  { id: 7, content: '人工智能目前的发展趋势是什么？', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'question', conversationId: 2 },
  { id: 8, content: '当前AI发展呈现出大模型、多模态融合、低代码化、专用化等趋势。大语言模型如GPT、Claude等能力持续提升，同时AI在医疗、金融、教育等垂直领域的应用也日益深入。', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', conversationId: 2 },
  { id: 9, content: 'AI技术在医疗领域有哪些具体应用？', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'question', conversationId: 2 },
  { id: 10, content: 'AI在医疗领域的应用非常广泛，包括医学影像诊断、药物研发、智能病历管理、个性化治疗方案制定等。例如，深度学习算法已能在某些癌症筛查中达到甚至超过专业医生的水平。', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', conversationId: 2 },

  // 会话3
  { id: 11, content: '量子计算和传统计算有什么本质区别？', createdAt: randomDate(startDate, endDate), type: 'question', updatedAt: randomDate(startDate, endDate), conversationId: 3 },
  { id: 12, content: '', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), type: 'answer', status: 'loading', conversationId: 3 },
];

export const conversations: Conversation[] = [
  { id: 1, selectedModel: 'ERNIE-4.0-8K', title: '光合作用基本原理详解', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), providerId: 1, pinned: true },
  { id: 2, selectedModel: 'qwen-plus', title: '人工智能发展趋势与应用', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), providerId: 2, pinned: false },
  { id: 3, selectedModel: 'deepseek-chat', title: '量子计算基础概念解析', createdAt: randomDate(startDate, endDate), updatedAt: randomDate(startDate, endDate), providerId: 3, pinned: false },
];
