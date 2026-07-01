/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User, UserType } from '../types';
import { useUiStore } from './useUiStore';

interface AuthStore {
  currentUser: User | null;
  currentRole: UserType;
  isAuthenticated: boolean;
  setCurrentRole: (role: UserType) => void;
  login: (email: string, role: UserType) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  currentRole: UserType.SUPER_ADMIN,
  isAuthenticated: false,
  setCurrentRole: (role) => set((state) => {
    // Generate role details
    let roleName = '';
    let email = '';
    let name = '';
    let client_id = undefined;
    let startup_id = undefined;
    let judge_id = undefined;

    switch (role) {
      case UserType.SUPER_ADMIN:
        roleName = '최고 관리자 (SUPER_ADMIN)';
        email = 'superadmin@irplus.co.kr';
        name = '박하나';
        break;
      case UserType.ADMIN:
        roleName = '관리자 (ADMIN)';
        email = 'admin@irplus.co.kr';
        name = '이관리';
        break;
      case UserType.CLIENT:
        roleName = '발주처 기관 담당자 (CLIENT)';
        email = 'client@agency.go.kr';
        name = '김도진';
        client_id = 'client-1';
        break;
      case UserType.STARTUP:
        roleName = '발표기업 대표 (STARTUP)';
        email = 'startup@edenbiotech.io';
        name = '홍길동';
        startup_id = 'startup-1';
        break;
      case UserType.JUDGE:
        roleName = '심사위원 (JUDGE)';
        email = 'judge1@abc.com';
        name = '이투자';
        judge_id = 'judge-1';
        break;
      case UserType.PARTNER:
        roleName = '협력 파트너사 (PARTNER)';
        email = 'partner@soundtech.co.kr';
        name = '박지훈';
        break;
    }

    const updatedUser: User = {
      user_id: `${role.toLowerCase()}-uuid-999`,
      email,
      user_type: role,
      name,
      phone: '010-9999-8888',
      region_code: role === UserType.CLIENT ? 'SEOUL' : undefined,
      status: 'ACTIVE',
      created_at: '2026-03-20T10:00:00Z',
      last_login_at: new Date().toISOString(),
      client_id,
      startup_id,
      judge_id
    };

    // Add log
    useUiStore.getState().addLog(
      'INFO',
      'AUTH',
      `사용자 세션 강제 변경: ${state.currentRole} ➔ ${role} (${name})`,
      `접근 권한 역할이 변경되었습니다: ${roleName}`
    );

    // If roles changed to something other than admin roles, log warning
    if (role !== UserType.SUPER_ADMIN && role !== UserType.ADMIN) {
      useUiStore.getState().addLog(
        'WARN',
        'SECURITY',
        `인가되지 않은 대시보드 접근 감지: ${roleName}가 ADMIN 대시보드 접근 시도`,
        `역할 기반 접근 제어(RBAC) 작동: 접근 거부 및 403 Forbidden 시뮬레이션 작동`
      );
    }

    return {
      currentRole: role,
      currentUser: updatedUser
    };
  }),
  login: (email, role) => set(() => {
    let matchedUser: any = null;
    if (typeof window !== 'undefined' && (window as any).__eden_ir_db?.users) {
      matchedUser = (window as any).__eden_ir_db.users.find((u: any) => u.email === email && u.user_type === role);
    }

    let name = '사용자';
    let client_id = undefined;
    let judge_id = undefined;
    let startup_id = undefined;

    if (matchedUser) {
      name = matchedUser.name;
      client_id = matchedUser.client_id;
      judge_id = matchedUser.judge_id;
      startup_id = matchedUser.startup_id;
    } else {
      if (email === 'superadmin@irplus.co.kr') {
        name = '박하나';
      } else if (email === 'admin@irplus.co.kr') {
        name = '이관리';
      } else if (email === 'client@agency.go.kr') {
        name = '김도진';
        client_id = 'client-1';
      } else if (email === 'startup@edenbiotech.io') {
        name = '홍길동';
        startup_id = 'startup-1';
      } else if (email === 'judge1@abc.com') {
        name = '이투자';
        judge_id = 'judge-1';
      } else if (email === 'partner@soundtech.co.kr') {
        name = '박지훈';
      }
    }

    const user: User = {
      user_id: matchedUser?.user_id || `user-generated-${Date.now()}`,
      email,
      user_type: role,
      name,
      status: 'ACTIVE',
      created_at: matchedUser?.created_at || new Date().toISOString(),
      last_login_at: new Date().toISOString(),
      client_id,
      judge_id,
      startup_id
    };

    useUiStore.getState().addLog(
      'SUCCESS',
      'AUTH',
      `로그인 성공: ${email} (${role})`,
      `사용자: ${name} 세션 활성화 완료`
    );

    return {
      currentUser: user,
      currentRole: role,
      isAuthenticated: true
    };
  }),
  logout: () => set(() => {
    useUiStore.getState().addLog(
      'INFO',
      'AUTH',
      '사용자 로그아웃 완료',
      '보안 토큰 및 세션 정보 파기됨'
    );
    return {
      currentUser: null,
      currentRole: UserType.SUPER_ADMIN, // Default fallback
      isAuthenticated: false
    };
  })
}));
