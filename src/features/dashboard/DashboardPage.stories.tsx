/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DashboardPage from './DashboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof DashboardPage> = {
  title: 'Features/Dashboard/DashboardPage',
  component: DashboardPage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-8 max-w-6xl mx-auto bg-slate-950 rounded-2xl border border-slate-900">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const Default: Story = {
  args: {
    onSimulateWebSocket: () => alert('STOMP WebSocket Event Simulated!'),
    lastWebSocketEvent: null,
  },
};

export const WithActiveWebSocketEvent: Story = {
  args: {
    onSimulateWebSocket: () => console.log('Simulated'),
    lastWebSocketEvent: {
      type: 'EVALUATION_COMPLETED',
      eventId: 'event-uuid-1',
      judgeName: '이투자',
      startupName: '에덴바이오텍',
      message: '심사위원 [이투자]님이 스타트업 [에덴바이오텍]의 기술성 및 시장성 평가 입력을 완료했습니다.',
      timestamp: new Date().toISOString(),
    },
  },
};
