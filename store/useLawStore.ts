// store/useLawStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. 데이터 타입 정의
interface LegalResult {
  prayer: string; // 청구취지
  cause: string;  // 청구원인
  law: string;    // 관련법규
  case: string;   // 판례/사례
  strategy: string; // 전략
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LawState {
  // [메인 페이지 상태]
  mainInput: string;
  mainResult: LegalResult | null;
  setMainInput: (input: string) => void;
  setMainResult: (result: LegalResult | null) => void;

  // [전략 페이지 상태]
  strategyMessages: Message[];
  strategyThreadId: string | null;
  addMessage: (message: Message) => void;
  setThreadId: (id: string) => void;
  resetStrategy: () => void;
}

// 2. 스토어 생성 (persist 미들웨어로 자동 저장 구현)
export const useLawStore = create<LawState>()(
  persist(
    (set) => ({
      // 초기값
      mainInput: '',
      mainResult: null,
      strategyMessages: [],
      strategyThreadId: null,

      // 액션 (상태 변경 함수)
      setMainInput: (input) => set({ mainInput: input }),
      setMainResult: (result) => set({ mainResult: result }),
      
      addMessage: (message) => 
        set((state) => ({ strategyMessages: [...state.strategyMessages, message] })),
      
      setThreadId: (id) => set({ strategyThreadId: id }),
      
      resetStrategy: () => set({ strategyMessages: [], strategyThreadId: null }),
    }),
    {
      name: 'lawmate-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 저장소 지정
      skipHydration: true, // Next.js Hydration 오류 방지를 위해 수동 처리 (중요)
    }
  )
);