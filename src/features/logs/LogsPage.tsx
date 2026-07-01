/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useUiStore } from '../../store/useUiStore';
import { 
  Terminal, 
  Trash2, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Flame,
  Filter
} from 'lucide-react';

export default function LogsPage() {
  const { logs, clearLogs, addLog } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const getLevelBadge = (level: typeof logs[0]['level']) => {
    switch (level) {
      case 'INFO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">INFO</span>;
      case 'WARN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">WARN</span>;
      case 'ERROR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">ERROR</span>;
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SUCCESS</span>;
    }
  };

  const getLevelIcon = (level: typeof logs[0]['level']) => {
    switch (level) {
      case 'INFO':
        return <Info className="w-3.5 h-3.5 text-blue-400" />;
      case 'WARN':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'ERROR':
        return <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />;
      case 'SUCCESS':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const triggerMockError = () => {
    addLog(
      'ERROR',
      'SECURITY',
      'JWT Authentication Filter Failed - Token Expired',
      'Internal Filter Error: java.lang.SecurityException: Signature verification failed for token segment 2.'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">시스템 감사 및 활동 로그</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">사용자 권한 활동 및 전역 예외 처리기(GlobalExceptionHandler) 수집 경고 기록</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Error trigger */}
          <button
            id="trigger-mock-error-btn"
            onClick={triggerMockError}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 dark:border-rose-400/20 rounded-xl transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>보안 예외 에러 유도</span>
          </button>

          {/* Clear logs */}
          <button
            id="clear-logs-btn"
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>로그 초기화</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            id="search-log-input"
            type="text"
            placeholder="로그 메시지 또는 세부 에러 파싱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <select
            id="filter-log-level-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs bg-transparent border-none text-slate-300 focus:outline-none pr-4 font-mono font-bold"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO ONLY</option>
            <option value="WARN">WARN ONLY</option>
            <option value="ERROR">ERROR ONLY</option>
            <option value="SUCCESS">SUCCESS ONLY</option>
          </select>
        </div>
      </div>

      {/* TERMINAL DISPLAY SCREEN */}
      <div className="rounded-2xl bg-slate-950 border border-slate-900 shadow-2xl p-6 font-mono text-xs text-slate-300 space-y-4">
        
        {/* Terminal Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Eden-IR Audit Stream v1.0.2</span>
          </div>
          <span className="text-[10px] text-slate-600">Total logs: {filteredLogs.length} matching</span>
        </div>

        {/* Logs Output list */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 divide-y divide-slate-900">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-600 italic text-center py-12">기록된 이벤트가 존재하지 않습니다.</p>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-3 first:pt-0 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px]">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(log.level)}
                    {getLevelBadge(log.level)}
                    <span className="text-indigo-400 font-bold">[{log.category}]</span>
                  </div>
                  <span className="text-slate-600">{new Date(log.timestamp).toISOString()}</span>
                </div>

                <div className="pl-5">
                  <p className="text-slate-200 font-bold leading-relaxed">{log.message}</p>
                  {log.details && (
                    <p className="text-[11px] text-slate-500 mt-1 pl-3 border-l-2 border-slate-900 bg-slate-900/10 py-1 rounded">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
