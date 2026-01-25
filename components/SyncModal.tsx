
import React, { useState } from 'react';
import { Copy, Download, Upload, Check, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportAll: (data: any) => void;
  currentData: any;
}

const SyncModal: React.FC<Props> = ({ isOpen, onClose, onImportAll, currentData }) => {
  const [syncString, setSyncString] = useState('');
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(currentData);
    const encoded = btoa(encodeURIComponent(dataStr)); // Simple encoding
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      const decoded = decodeURIComponent(atob(syncString));
      const data = JSON.parse(decoded);
      if (data.accounts && data.transactions) {
        onImportAll(data);
        setImported(true);
        setTimeout(() => {
          setImported(false);
          onClose();
        }, 1500);
      } else {
        alert("無效的同步格式。");
      }
    } catch (e) {
      alert("解析同步代碼失敗，請確認代碼是否完整。");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-fin-midnight/60 backdrop-blur-xl">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl border border-fin-paper overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-10 py-8 border-b border-fin-paper flex justify-between items-center bg-fin-paper/10">
          <div>
            <h2 className="text-xl font-bold text-fin-midnight tracking-tight uppercase">同步中心 / Sync Hub</h2>
            <p className="text-[9px] text-fin-linen font-bold uppercase tracking-widest mt-1">Cross-device data migration</p>
          </div>
          <button onClick={onClose} className="p-2 text-fin-midnight/20 hover:text-fin-midnight transition-all text-2xl">&times;</button>
        </div>

        <div className="p-10 space-y-10">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-fin-midnight uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-fin-linen" /> 1. 生成當前裝置快照
            </h3>
            <div className="p-8 bg-fin-midnight rounded-[2rem] text-fin-paper relative overflow-hidden group">
              <p className="text-[10px] text-fin-linen/60 mb-4 font-semibold leading-relaxed">
                點擊下方按鈕將當前所有帳戶、餘額與紀錄打包。您可以將此代碼傳送到您的手機或另一台電腦貼上。
              </p>
              <button 
                onClick={handleExport}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/10"
              >
                {copied ? <><Check className="w-4 h-4 text-fin-linen" /> 已複製到剪貼簿</> : <><Copy className="w-4 h-4" /> 複製同步代碼</>}
              </button>
            </div>
          </div>

          <div className="h-px bg-fin-paper w-full"></div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-fin-midnight uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3 text-fin-linen" /> 2. 匯入其他裝置數據
            </h3>
            <textarea
              value={syncString}
              onChange={(e) => setSyncString(e.target.value)}
              placeholder="請在此貼上來自其他裝置的同步代碼..."
              className="w-full bg-fin-paper/20 border-2 border-fin-paper rounded-[1.5rem] p-6 text-xs font-mono text-fin-ink outline-none focus:border-fin-midnight h-32 transition-all resize-none"
            />
            <button 
              onClick={handleImport}
              disabled={!syncString}
              className="w-full bg-fin-midnight hover:bg-fin-ink disabled:opacity-20 text-fin-paper font-bold py-5 rounded-[1.5rem] transition-all shadow-xl uppercase tracking-[0.2em] text-[11px]"
            >
              {imported ? "同步成功！Refreshing..." : "覆蓋並同步資料 OVERWRITE & SYNC"}
            </button>
            <p className="text-[9px] text-center text-fin-wood/40 font-bold uppercase tracking-widest italic">
              注意：此動作將會覆蓋當前裝置的所有本地資料。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
