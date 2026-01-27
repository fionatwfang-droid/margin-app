
import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Transaction, TransactionType, Account } from '../types';
import { CATEGORIES } from '../constants';
import { analyzeCSVMapping } from '../services/geminiService';
import { FileUp, Check, Loader2, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Partial<Transaction>[]) => void;
  accounts: Account[];
}

const CSVImporterModal: React.FC<Props> = ({ isOpen, onClose, onImport, accounts }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const processCSV = async () => {
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      complete: async (results: Papa.ParseResult<any>) => {
        const rows = results.data as any[];
        const cleanRows = rows.filter(row => row.length > 1);
        const sample = cleanRows.slice(0, 5);
        const mapping = await analyzeCSVMapping(sample);

        if (mapping) {
          const parsedTransactions = cleanRows.slice(1).map((row, idx) => {
            const rawAmount = row[mapping.amountIndex];
            const amount = Math.abs(parseFloat(String(rawAmount).replace(/[^\d.-]/g, ''))) || 0;
            return {
              id: `imported-${idx}`,
              date: row[mapping.dateIndex] || new Date().toISOString().split('T')[0],
              amount: amount,
              type: mapping.typeIndex !== null ? 
                    (String(row[mapping.typeIndex]).includes('收') ? TransactionType.INCOME : TransactionType.EXPENSE) : 
                    TransactionType.EXPENSE,
              categoryId: CATEGORIES[0].id,
              note: row[mapping.noteIndex] || row[mapping.categoryIndex] || '匯入交易',
              accountId: targetAccountId,
              isRecurring: false,
              isInstallment: false
            };
          });
          setPreviewData(parsedTransactions);
          setStep('preview');
        } else {
          alert('AI 無法辨識此 CSV 格式。');
        }
        setLoading(false);
      },
      error: (error: Error) => {
        alert('解析失敗：' + error.message);
        setLoading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-fin-midnight/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3.5rem] shadow-2xl border border-fin-paper overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        <div className="px-10 py-8 border-b border-fin-paper flex justify-between items-center bg-fin-paper/20 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-fin-ink tracking-tight">批次匯入外部數據</h2>
          <button onClick={onClose} className="p-2.5 hover:bg-fin-paper rounded-full text-fin-ink/20 hover:text-fin-midnight transition-all">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-fin-paper/5">
          {step === 'upload' ? (
            <div className="space-y-10 text-center py-10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-fin-linen/30 rounded-[3rem] p-16 hover:border-fin-midnight hover:bg-fin-linen/5 transition-all cursor-pointer group"
              >
                <div className="bg-fin-midnight w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-fin-paper group-hover:scale-110 transition-transform shadow-xl shadow-fin-midnight/20">
                  <FileUp className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-fin-ink mb-3">
                  {file ? file.name : '選擇匯入的 CSV 文件'}
                </h3>
                <p className="text-fin-ink/30 text-[10px] font-bold uppercase tracking-[0.2em]">支持拖放上傳數據</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                <label className="block text-[10px] font-bold text-fin-linen uppercase tracking-[0.2em] mb-2">匯入至目標帳戶</label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full bg-white border border-fin-paper rounded-2xl px-6 py-4 text-sm font-bold text-fin-ink focus:border-fin-midnight outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={processCSV}
                disabled={!file || loading}
                className="w-full max-w-xs bg-fin-midnight hover:bg-fin-ink disabled:bg-fin-wood/20 text-fin-paper font-bold py-5 rounded-2xl transition-all shadow-xl shadow-fin-midnight/20 uppercase tracking-[0.2em] text-[11px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '開始 AI 結構化分析分析'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-fin-midnight font-bold">
                  <Check className="w-5 h-5" />
                  <span className="tracking-tight uppercase text-sm">Detected {previewData.length} Activities Found</span>
                </div>
                <button onClick={() => setStep('upload')} className="text-[10px] text-fin-ink/40 font-bold uppercase tracking-widest hover:text-fin-midnight underline decoration-fin-linen/30">重新上傳文件</button>
              </div>

              <div className="border border-fin-paper/40 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-fin-paper/20 border-b border-fin-paper">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-bold text-fin-ink/40 uppercase tracking-widest">日期</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-fin-ink/40 uppercase tracking-widest">分類建議</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-fin-ink/40 uppercase tracking-widest">內容描述</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-fin-ink/40 uppercase tracking-widest">交易金額</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fin-paper">
                    {previewData.map((item) => (
                      <tr key={item.id} className="hover:bg-fin-paper/10 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-bold text-fin-ink/60">{item.date}</td>
                        <td className="px-6 py-4">
                          <select className="bg-white border border-fin-paper rounded-lg px-2 py-1.5 text-[10px] font-bold text-fin-ink focus:border-fin-midnight outline-none">
                            {CATEGORIES.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-fin-ink truncate max-w-[150px]">{item.note}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${item.type === TransactionType.EXPENSE ? 'text-fin-ink' : 'text-fin-linen'}`}>
                          ${item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setPreviewData(prev => prev.filter(p => p.id !== item.id))} className="p-2 text-fin-ink/20 hover:text-red-800 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-fin-paper bg-white flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-fin-ink/30 font-bold uppercase tracking-widest hover:text-fin-ink transition-all text-[11px]">取消匯入</button>
          {step === 'preview' && (
            <button
              onClick={() => { onImport(previewData); onClose(); }}
              className="flex-[2] bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-4 px-10 rounded-xl transition-all shadow-xl uppercase tracking-[0.2em] text-[11px]"
            >
              確認匯入批次數據 DATA STORAGE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImporterModal;
