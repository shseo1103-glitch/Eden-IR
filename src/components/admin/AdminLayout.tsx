/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUiStore } from '../../store/useUiStore';
import { useAuthStore } from '../../store/useAuthStore';
import { UserType } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  CalendarRange, 
  Terminal, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  UserSquare2,
  Globe,
  Radio,
  FileCheck,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  webSocketConnected: boolean;
  onSimulateWebSocket: () => void;
}

export default function AdminLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  webSocketConnected,
  onSimulateWebSocket 
}: AdminLayoutProps) {
  const { isDarkMode, isSidebarOpen, toggleDarkMode, toggleSidebar } = useUiStore();
  const { currentRole, currentUser, setCurrentRole, logout } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', name: '종합 대시보드', icon: LayoutDashboard, roles: [UserType.SUPER_ADMIN, UserType.ADMIN] },
    { id: 'events', name: '행사 모니터링', icon: CalendarRange, roles: [UserType.SUPER_ADMIN, UserType.ADMIN, UserType.CLIENT, UserType.PARTNER] },
    { id: 'judges', name: '심사위원 관리 및 검색', icon: Users, roles: [UserType.SUPER_ADMIN, UserType.ADMIN] },
    { id: 'feedbacks', name: 'AI 피드백 승인', icon: FileCheck, roles: [UserType.SUPER_ADMIN, UserType.ADMIN, UserType.CLIENT, UserType.STARTUP] },
    { id: 'logs', name: '시스템 감사 로그', icon: Terminal, roles: [UserType.SUPER_ADMIN, UserType.ADMIN] },
    { id: 'members', name: '회원 관리 및 권한', icon: UserSquare2, roles: [UserType.SUPER_ADMIN] },
  ];

  // Helper to check if current role has permission for a menu item
  const hasPermission = (allowedRoles: UserType[]) => {
    return allowedRoles.includes(currentRole);
  };

  // Check if current tab is restricted for the current role
  const activeMenu = menuItems.find(item => item.id === activeTab);
  const isAccessBlocked = activeMenu ? !hasPermission(activeMenu.roles) : false;

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 transition-colors duration-300">
      
      {/* Top Banner indicating the current local simulated time */}
      <div className={`bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 ${isDarkMode ? 'dark from-slate-900 to-slate-950' : ''} text-white text-xs px-4 py-2 text-center flex items-center justify-between border-b border-indigo-500/20`}>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
          <span>이든 IR 통합 관리 플랫폼 (Eden Investment Relations)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Radio className={`w-3.5 h-3.5 ${webSocketConnected ? 'text-emerald-400 animate-ping' : 'text-rose-500'}`} />
            <span className="text-[11px] font-mono text-slate-300">
              {webSocketConnected ? 'STOMP CONNECTED' : 'STOMP DISCONNECTED'}
            </span>
          </div>
          <span className="text-slate-300">기준 시간: 2026-07-01 10:46 (KST)</span>
        </div>
      </div>

      <div className="flex">
        
        {/* SIDEBAR */}
        <aside 
          id="sidebar-container"
          className={`fixed inset-y-0 left-0 z-30 w-72 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 border-r ${isDarkMode ? 'dark bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} transition-transform duration-300 flex flex-col justify-between h-[calc(100vh-33px)] shadow-2xl lg:shadow-none`}
        >
          <div>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'}`}>Eden-IR</h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">이든 IR 통합 관리 플랫폼</p>
                </div>
              </div>
              <button 
                id="sidebar-close-btn"
                onClick={toggleSidebar} 
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Session Switcher (RBAC Tester) */}
            <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-100/60 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/80">
              <div className="flex items-center gap-2 mb-2">
                <UserSquare2 className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">접속 역할 시뮬레이션 (RBAC)</span>
              </div>
              <select
                id="rbac-role-selector"
                value={currentRole}
                onChange={(e) => {
                  const val = e.target.value as UserType;
                  setCurrentRole(val);
                  // Automatically change tabs to avoid blocking user interaction if switching to role with no permissions on current tab
                  if (val === UserType.CLIENT) {
                    setActiveTab('events');
                  } else if (val === UserType.STARTUP) {
                    setActiveTab('feedbacks');
                  } else if (val === UserType.PARTNER) {
                    setActiveTab('events');
                  } else if (val === UserType.SUPER_ADMIN) {
                    setActiveTab('dashboard');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className={`w-full text-xs font-medium p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-700 text-slate-200' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value={UserType.SUPER_ADMIN}>🛠️ 최고 관리자 (SUPER_ADMIN)</option>
                <option value={UserType.ADMIN}>🧑‍💻 일반 관리자 (ADMIN)</option>
                <option value={UserType.CLIENT}>🏛️ 발주처 담당자 (CLIENT)</option>
                <option value={UserType.STARTUP}>🚀 발표기업 대표 (STARTUP)</option>
                <option value={UserType.JUDGE}>⚖️ 전문 심사위원 (JUDGE)</option>
                <option value={UserType.PARTNER}>🎙️ 협력 파트너사 (PARTNER)</option>
              </select>
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                현재 유저: <span className="font-semibold text-indigo-500 dark:text-indigo-400">{currentUser?.name}</span>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="p-4 space-y-1.5">
              <div className="px-3 mb-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">기능 메뉴</div>
              {menuItems.map((item) => {
                const isAllowed = hasPermission(item.roles);
                const Icon = item.icon;
                return (
                  <button
                    id={`menu-item-${item.id}`}
                    key={item.id}
                    disabled={false /* Allow click to show the 403 Forbidden screens! */}
                    onClick={() => {
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                        : isAllowed
                          ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          : 'text-slate-400 dark:text-slate-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-help'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : isAllowed ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500/70'}`} />
                      <span>{item.name}</span>
                    </div>
                    {!isAllowed && (
                      <span className="text-[9px] bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-mono font-bold">RBAC</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Real-time Web Socket Simulator Button */}
            <button
              id="ws-simulator-btn"
              onClick={onSimulateWebSocket}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>실시간 소켓 이벤트 시뮬레이션</span>
            </button>

            {/* Dark Mode, Layout stats */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">테마 스위치</span>
              <button
                id="theme-toggle-btn"
                onClick={toggleDarkMode}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
            </div>

            {/* Logout Button */}
            <button
              id="logout-btn"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/10 cursor-pointer transition-all active:scale-[0.97]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃 (세션 종료)</span>
            </button>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-33px)] overflow-x-hidden">
          {/* Header Mobile / Title navbar */}
          <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between lg:justify-end gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-semibold font-mono">
                {currentRole} SESSION ACTIVE
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
              </div>
            </div>
          </header>

          {/* Main Content Pane */}
          <main className="flex-1 p-4 md:p-8">
            {isAccessBlocked ? (
              /* Beautiful 403 Forbidden Screen with automatic quick recovery options */
              <div id="forbidden-alert-screen" className="max-w-2xl mx-auto my-12 text-center p-8 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 shadow-xl shadow-rose-500/5 space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner shadow-rose-500/10">
                  <ShieldAlert className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">403 Access Denied</h2>
                  <p className="text-sm font-semibold uppercase tracking-wider text-rose-500/70 font-mono">인가되지 않은 메뉴 접근 제한</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  역할 기반 접근 제어(RBAC) 가이드에 따라, <span className="font-bold text-slate-900 dark:text-white">[{currentRole}]</span> 계정은 <span className="font-semibold text-rose-500">[{activeMenu?.name}]</span> 메뉴에 접근할 권한이 존재하지 않습니다. 이 접근 제한 세부 정보가 백엔드 보안 감지 시스템 및 GlobalExceptionHandler에 로깅되었습니다.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-left text-xs max-w-md mx-auto space-y-1 border border-slate-800">
                  <p className="text-slate-500">// 보안 로그 기록 (AES-256 토큰 검증)</p>
                  <p><span className="text-amber-400">[WARN]</span> SecurityException: Access Denied</p>
                  <p><span className="text-blue-400">UserType:</span> {currentRole}</p>
                  <p><span className="text-blue-400">Path:</span> /v1/auth/access?tab={activeTab}</p>
                  <p><span className="text-rose-400">Reason:</span> Role ADMIN role is strictly required.</p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    id="return-to-allowed-tab-btn"
                    onClick={() => {
                      if (currentRole === UserType.CLIENT || currentRole === UserType.PARTNER) {
                        setActiveTab('events');
                      } else if (currentRole === UserType.STARTUP) {
                        setActiveTab('feedbacks');
                      } else {
                        setActiveTab('events');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    가용 페이지로 복귀
                  </button>
                  <button
                    id="restore-admin-btn"
                    onClick={() => setCurrentRole(UserType.SUPER_ADMIN)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20 shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
                  >
                    🛠️ 최고 관리자(SUPER_ADMIN)로 변경하여 해제
                  </button>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
