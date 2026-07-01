/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './DashboardPage';
import React from 'react';

// Create a query client for wrapper
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('DashboardPage KPI 및 차트 렌더링 검증', () => {
  it('기본 로딩 스피너 및 메트릭스 추출 진행 표시 여부 확인', async () => {
    const queryClient = createTestQueryClient();
    const handleSimulate = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage 
          onSimulateWebSocket={handleSimulate} 
          lastWebSocketEvent={null} 
        />
      </QueryClientProvider>
    );

    // spinner displays on initial load
    expect(screen.getByText(/실시간 대시보드 KPI 및 DB 통계 산출 중/i)).toBeInTheDocument();
  });

  it('WebSocket 실시간 이벤트 주입 버튼 동작 여부 검증', async () => {
    const queryClient = createTestQueryClient();
    const handleSimulate = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage 
          onSimulateWebSocket={handleSimulate} 
          lastWebSocketEvent={null} 
        />
      </QueryClientProvider>
    );

    // Wait until loading finishes
    await waitFor(() => {
      expect(screen.queryByText(/실시간 대시보드/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const simulateBtn = screen.getByText(/실시간 WebSocket 데이터 주입/i);
    expect(simulateBtn).toBeInTheDocument();

    // Click trigger test
    fireEvent.click(simulateBtn);
    expect(handleSimulate).toHaveBeenCalledTimes(1);
  });
});
