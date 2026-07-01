/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { SystemLog } from '../types';

interface UiStore {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  logs: SystemLog[];
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (value: boolean) => void;
  addLog: (level: SystemLog['level'], category: SystemLog['category'], message: string, details?: string) => void;
  clearLogs: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isDarkMode: false, // Default to clean and professional light mode
  isSidebarOpen: true,
  logs: [
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'SYSTEM',
      message: '이든 IR 통합 관리 플랫폼 대시보드 엔진 초기화 완료',
      details: 'Zustand UI 및 로깅 컨텍스트 시작됨'
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      category: 'AUTH',
      message: '보안 통신 레이어 (AES-256 및 JWT 검증 필터) 활성화',
    }
  ],
  toggleDarkMode: () => set((state) => {
    const nextVal = !state.isDarkMode;
    // Apply class to html tag for tailwind dark mode
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return {
      isDarkMode: nextVal,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'INFO',
          category: 'ACTION',
          message: `화면 테마 변경: ${nextVal ? '다크 모드' : '라이트 모드'} 활성화`,
        },
        ...state.logs
      ]
    };
  }),
  setDarkMode: (value) => set((state) => {
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: value };
  }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (value) => set({ isSidebarOpen: value }),
  addLog: (level, category, message, details) => set((state) => ({
    logs: [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        details
      },
      ...state.logs
    ].slice(0, 100) // Keep last 100 logs for memory performance
  })),
  clearLogs: () => set({ logs: [] })
}));
