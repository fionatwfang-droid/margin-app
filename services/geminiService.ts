
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Account, Category } from "../types";

// Helper to safely get API key
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.API_KEY) || null;
  } catch {
    return null;
  }
};

export const generateSpendingInsights = async (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[]
) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  const contextData = transactions.map(t => ({
    amount: t.amount,
    type: t.type === 'EXPENSE' ? '支出' : '收入',
    category: categories.find(c => c.id === t.categoryId)?.name,
    account: accounts.find(a => a.id === t.accountId)?.name,
    date: t.date,
    note: t.note
  }));

  const prompt = `請分析以下財務交易紀錄，並以「繁體中文」提供：一個簡短的支出摘要、3個具體的理財建議，以及任何異常的活動。
  交易數據：${JSON.stringify(contextData)}
  
  請嚴格按照以下 JSON 格式回傳，不要包含任何 Markdown 代碼塊 or 額外文字：
  {
    "summary": "摘要字串",
    "recommendations": ["建議1", "建議2", "建議3"],
    "unusualActivity": ["異常活動1", "異常活動2"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const parseSmartTransaction = async (text: string, accounts: Account[], categories: Category[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `請將這段自然語言描述轉換為結構化的 JSON。
  描述內容："${text}"
  可用的帳戶列表：${JSON.stringify(accounts.map(a => ({ id: a.id, name: a.name })))}
  可用的分類列表：${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
  
  JSON 結構要求：
  {
    "amount": 數字,
    "type": "EXPENSE" 或 "INCOME",
    "accountId": "帳戶ID (請從列表中選取最匹配的)",
    "categoryId": "分類ID (請從列表中選取最匹配的)",
    "note": "內容備註",
    "isRecurring": 布林值,
    "frequency": "ONCE", "WEEKLY", "MONTHLY" 或 "YEARLY",
    "isInstallment": 布林值,
    "totalMonths": 數字 (如果是分期付款)
  }
  
  請直接回傳 JSON 字串，不要包含額外說明。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const analyzeCSVMapping = async (sampleRows: any[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `我有一份 CSV 檔案的資料樣本（JSON 格式）：
  ${JSON.stringify(sampleRows)}
  
  請幫我分析這些欄位，找出對應的系統欄位索引（Index）：
  1. date (交易日期)
  2. amount (金額)
  3. category (分類/項目名稱)
  4. note (備註)
  5. type (交易類型：收入或支出，若無請回傳 null)

  請嚴格按照以下 JSON 格式回傳映射索引：
  {
    "dateIndex": number,
    "amountIndex": number,
    "categoryIndex": number,
    "noteIndex": number,
    "typeIndex": number | null
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Mapping Error:", error);
    return null;
  }
};
