
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { LogIn, Mail, Loader2, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("Supabase 未配置，請檢查環境變數。");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    
    if (error) {
      setMessage("登入失敗：" + error.message);
    } else {
      setMessage("已發送魔術連結 (Magic Link) 至您的信箱，請查收！");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-fin-midnight/60 backdrop-blur-xl">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-fin-paper overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center">
          <div className="bg-fin-paper/30 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-fin-midnight">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-fin-ink tracking-tight mb-2 uppercase">啟動雲端同步</h2>
          <p className="text-xs text-fin-wood/40 font-bold uppercase tracking-widest mb-10">Secure Cloud Synchronization</p>

          {message ? (
            <div className="p-6 bg-fin-paper/20 rounded-2xl text-fin-midnight font-bold text-sm animate-in fade-in">
              {message}
              <button onClick={onClose} className="block w-full mt-4 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100">關閉視窗</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-fin-linen w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="輸入您的 Email"
                  className="w-full bg-fin-paper/20 border-2 border-fin-paper rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-fin-ink focus:border-fin-midnight outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-fin-midnight hover:bg-fin-ink text-fin-paper font-bold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[11px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> 發送登入連結</>}
              </button>
              <p className="text-[9px] text-fin-wood/30 leading-relaxed italic">
                無須密碼，點擊連結即可自動同步資料。
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
