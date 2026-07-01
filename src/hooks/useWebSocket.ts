/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '../store/useUiStore';

interface WebSocketEvent {
  type: 'EVALUATION_COMPLETED' | 'EVENT_STATUS_CHANGED' | 'NEW_QUOTATION' | 'SYSTEM_ALERT';
  eventId?: string;
  judgeId?: string;
  judgeName?: string;
  startupName?: string;
  message: string;
  timestamp: string;
}

export function useWebSocket(eventId?: string) {
  const queryClient = useQueryClient();
  const addLog = useUiStore((state) => state.addLog);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect
  useEffect(() => {
    setIsConnected(true);
    const channel = eventId ? `/topic/events/${eventId}` : '/topic/events/all';
    
    addLog(
      'SUCCESS',
      'WEBSOCKET',
      `WebSocket 연결 수립 완료: STOMP over SockJS`,
      `구독 주소: ${channel}`
    );

    return () => {
      setIsConnected(false);
      addLog(
        'INFO',
        'WEBSOCKET',
        `WebSocket 연결 종료`,
        `구독 해제: ${channel}`
      );
    };
  }, [eventId, addLog]);

  // Handle event reception
  const handleEventReceived = useCallback((event: WebSocketEvent) => {
    setLastEvent(event);
    
    // Log the event
    addLog(
      event.type === 'SYSTEM_ALERT' ? 'WARN' : 'SUCCESS',
      'WEBSOCKET',
      `[STOMP EVENT] ${event.type}: ${event.message}`,
      `발생 시간: ${event.timestamp}`
    );

    // Invalidate TanStack Query caches to trigger real-time updates!
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['judges'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyRevenue'] });
    queryClient.invalidateQueries({ queryKey: ['judgePaymentStats'] });
  }, [addLog, queryClient]);

  // Simulate an incoming websocket event manually or automatically
  const simulateEvent = useCallback((customEvent?: Partial<WebSocketEvent>) => {
    const judgeNames = ['김기석', '이투자', '박경수', '정희진', '조민경'];
    const startupNames = ['에덴바이오텍', '이노클라우드', '스마트팜랩', '넥스트모빌리티', 'AI헬스케어'];
    const selectedJudge = judgeNames[Math.floor(Math.random() * judgeNames.length)];
    const selectedStartup = startupNames[Math.floor(Math.random() * startupNames.length)];

    const events: WebSocketEvent[] = [
      {
        type: 'EVALUATION_COMPLETED',
        eventId: 'event-uuid-1',
        judgeId: 'judge-uuid-2',
        judgeName: selectedJudge,
        startupName: selectedStartup,
        message: `심사위원 [${selectedJudge}]님이 스타트업 [${selectedStartup}]의 기술성 및 시장성 평가 입력을 완료했습니다. (실시간 점수 동기화 중)`,
        timestamp: new Date().toISOString()
      },
      {
        type: 'EVENT_STATUS_CHANGED',
        eventId: 'event-uuid-2',
        message: `행사 '2026 서울 테크 스타트업 IR 데이' 상태가 [CONFIRMED]에서 [IN_PROGRESS](진행중)로 변경되었습니다.`,
        timestamp: new Date().toISOString()
      },
      {
        type: 'NEW_QUOTATION',
        message: `발주처 (경기스타트업허브)에서 신규 IR 패키지 견적 요청(DRAFT)을 전송했습니다.`,
        timestamp: new Date().toISOString()
      }
    ];

    const finalEvent = customEvent 
      ? ({ ...events[0], ...customEvent } as WebSocketEvent)
      : events[Math.floor(Math.random() * events.length)];

    handleEventReceived(finalEvent);
    return finalEvent;
  }, [handleEventReceived]);

  // Set up periodic automated simulated events to demonstrate high-level reactivity
  useEffect(() => {
    // Every 45 seconds, trigger a simulated background event if connected
    const interval = setInterval(() => {
      simulateEvent();
    }, 45000);

    return () => clearInterval(interval);
  }, [simulateEvent]);

  return {
    isConnected,
    lastEvent,
    simulateEvent,
    setLastEvent
  };
}
