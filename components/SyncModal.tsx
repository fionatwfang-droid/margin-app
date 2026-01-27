
import React, { useState } from 'react';
import { Copy, Download, Upload, Check, RefreshCw, Share2 } from 'lucide-react';

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

  const getEncodedData = () => {
    const dataStr = JSON.stringify(currentData);
    return btoa(encodeURIComponent(dataStr));
  };

  const handleExport = () => {
    const encoded = getEncodedData();
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const encoded = getEncodedData();
    if (navigator.share) {
      try {
        await navigator.share({
          title: '留白 Margin 同步數據',
          text: encoded
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleExport();
    }
  };

  const handleImport = () => {
    try {
      const decoded = decodeURIComponent(atob(syncString.trim()));
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
            <p className="text-[9px] text-fin-linen font-bold uppercase tracking-widest mt-1">跨裝置數據轉移 Cross-device Migration</p>
          </div>
          <button onClick={onClose} className="p-2 text-fin-midnight/20 hover:text-fin-midnight transition-all text-2xl">&times;</button>
        </div>

        <div className="p-10 space-y-10">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-fin-midnight uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="w-3 h-3 text-fin-linen" /> 1. 生成當前裝置數據 (導出)
            </h3>
            <div className="p-8 bg-fin-midnight rounded-[2rem] text-fin-paper relative overflow-hidden group">
              <p className="text-[10px] text-fin-linen/60 mb-6 font-semibold leading-relaxed">
                將此裝置的所有紀錄打包。透過分享功能傳送至另一台手機或電腦貼上即可同步。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleExport}
                  className="flex-[2] bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/10"
                >
                  {copied ? <Check className="w-4 h-4 text-fin-linen" /> : <Copy className="w-4 h-4" />}
                  <span className="text-[11px] uppercase tracking-widest">{copied ? '已複製' : '複製代碼'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 bg-fin-linen text-fin-midnight font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-[11px] uppercase tracking-widest">一鍵分享</span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-fin-paper w-full"></div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-fin-midnight uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3 text-fin-linen" /> 2. 接收並匯入新數據 (覆蓋)
            </h3>
            <textarea
              value={syncString}
              onChange={(e) => setSyncString(e.target.value)}
              placeholder="請在此貼上來自其他裝置的同步代碼..."
              className="w-full bg-fin-paper/20 border-2 border-fin-paper rounded-[1.5rem] p-6 text-xs font-mono text-fin-ink outline-none focus:border-fin-midnight h-32 transition-all resize-none placeholder:text-fin-wood/20"
            />
            <button 
              onClick={handleImport}
              disabled={!syncString.trim()}
              className="w-full bg-fin-midnight hover:bg-fin-ink disabled:opacity-20 text-fin-paper font-bold py-5 rounded-[1.5rem] transition-all shadow-xl uppercase tracking-[0.2em] text-[11px]"
            >
              {imported ? "同步成功！Refreshing..." : "覆蓋並同步資料 DATA OVERWRITE"}
            </button>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-1.5 h-1.5 bg-red-800 rounded-full animate-pulse"></div>
              <p className="text-[9px] text-fin-wood/40 font-bold uppercase tracking-widest italic">
                注意：匯入後將清除此裝置目前的資料
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
