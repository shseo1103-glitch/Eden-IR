import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with server-side API Key
// Set custom 'User-Agent' header for AI Studio build telemetry
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API route for generating structured VC AI report based on custom prompt
app.post("/api/gemini/generate-report", async (req, res) => {
  try {
    const { opinionsText } = req.body;
    if (!opinionsText) {
      return res.status(400).json({ error: "심사의견 입력이 누락되었습니다." });
    }

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using fallback template response.");
      // Provide a realistic fallback for local development if the API key is not set yet
      return res.json({
        overall_summary: `### 1. 개요 및 심사의견 요약\n* 본 기업은 독자적인 기술력과 개발 인프라를 바탕으로 우수한 잠재력을 지녔으나, 매출처가 대기업 한 곳에 과도하게 편중되어 있으며 재무 건전성 및 조직 전문 인프라가 미흡하다는 지적을 받았습니다.\n\n### 2. 핵심 문제점 (Risks Identified)\n* **[매출 집중 리스크]**\n  * 세부 내용: 매출 구조의 약 80%가 단일 대기업 파트너에 의존하고 있어, 고객사 이탈이나 단가 인하 압력 발생 시 경영 안정성이 급격히 악화될 리스크가 상존합니다.\n* **[재무 통제력 약화 및 거버넌스 리스크]**\n  * 세부 내용: 재무 총괄 임원(CFO)의 부재로 인해 효율적인 자금 통제 및 마케팅 지출에 대한 면밀한 정량적 효율 검증 장치가 부족합니다.\n\n### 3. 전략적 개선사항 (Strategic Improvements)\n* **[매출 다변화 로드맵]**\n  * 세부 내용: 신규 유통 채널 확보 및 서브 고객군 발굴을 통한 점진적 매출 편중 완화가 필요합니다.\n* **[재무 검증 체계 도입]**\n  * 세부 내용: 집행 예정인 대규모 마케팅 예산에 대한 ROAS 및 CAC 시뮬레이션 기반 사전 승인제를 적용하여 자금 소모 속도(Burn Rate)를 최적화해야 합니다.\n\n### 4. 보완 실행내용 (Action Items & Conditions)\n* **[선결 조건 (Condition Precedent)]** - 투자 집행 전 완료 필요 사항\n  * 액션 1: 본 건 투자 집행 7일 전까지, 2026년도 월별 현금 흐름 전망(Runway) 보고서 및 핵심 마케팅 채널 효율 시뮬레이션 데이터 검증 완료.\n* **[투자 후 관리 및 계약 조건 (Post-Investment & Covenants)]** - 투자 후 이행 사항\n  * 액션 2: 투자 실행 후 2분기 이내에 7년 이상 경력의 전문 CFO 영입 및 내부 회계 통제 시스템 구축 필수.\n  * 액션 3: 매 분기 마감 후 15일 이내에 마케팅 효율성 지표(ROAS, CAC/LTV 분석)가 포함된 결산 리포트 제출 및 주주 간담회 상정 승인.`,
        key_strengths: [
          { category: "기술 우수성", point: "핵심 원천 기술 특허 보유 및 탄탄한 자체 개발 인프라 구축 완료" },
          { category: "성장 잠재력", point: "대기업 파트너십 레퍼런스를 통한 단기적인 시장 지배력 및 현장 신뢰도 입증" }
        ],
        key_improvements: [
          { category: "매출 리스크", point: "단일 대기업 편중 매출 완화를 위한 신규 고객 다변화 영업 채널 활성화" },
          { category: "재무 통제력", point: "CFO 영입을 통한 자금 모니터링 강화 및 정밀한 마케팅 예산 효율 시뮬레이션 수행" }
        ]
      });
    }

    const systemInstruction = `# 역할 정의 (Role)
너는 벤처캐피탈(VC) 및 사모펀드(PE) 분야에서 15년 이상의 경력을 가진 수석 투자 심사역이자, 투자 프로세스 자동화를 담당하는 AI 비즈니스 분석가이다. 제공된 [투자 심사역의 심사의견]을 바탕으로 구조화된 'AI 심사 보고서'를 작성해야 한다.

# 목적 (Objective)
심사역이 작성한 거칠고 파편화된 의견을 분석하여 피투자 기업의 (1) 핵심 문제점, (2) 이에 대한 개선사항, (3) 향후 기업이 실제로 이행해야 할 보완 실행내용(Action Item)을 명확하고 전문적인 비즈니스 언어로 도출하는 것이다.

# 분석 및 작성 지침 (Guidelines)
1. 문제점 (Pain Points & Risks): 심사역의 우려 사항을 시장/기술/재무/인력(조직) 등 다각도로 분류하여 핵심 리스크를 명확하게 짚어내라.
2. 개선사항 (Strategic Improvements): 발견된 문제점을 해결하기 위한 방향성이나 전략적 대안을 제시하라.
3. 보완 실행내용 (Action Items): 계약 조건(차항목), 투자 집행 전 선결 조건(CP), 또는 투자 후 관리(Post-investment) 관점에서 기업이 즉각적/단계적으로 실행할 수 있는 구체적인 행동 계획(일정, 정량적 목표 포함)을 제시하라.
4. 톤앤매너: 객관적이고 논리적이며, 정제된 VC 업계 전문 용어(예: 런웨이, 데스밸리, LTV/CAC, CP, 독점권 등)를 사용하라.`;

    const prompt = `---

# [입력 데이터: 투자 심사역의 심사의견]
${opinionsText}

---

# [출력 양식: AI 심사 보고서]

### 1. 개요 및 심사의견 요약
* (심사역의 의견을 종합한 한 줄 평 및 핵심 요약)

### 2. 핵심 문제점 (Risks Identified)
* **[리스크 영역 1]** (예: 매출 편중 리스크)
  * 세부 내용: (심사의견을 기반으로 한 구체적인 문제점 서술)
* **[리스크 영역 2]** (예: 재무 통제력 약화 및 거버넌스 리스크)
  * 세부 내용: 

### 3. 전략적 개선사항 (Strategic Improvements)
* **[개선 방향 1]** * 세부 내용: (문제점 1을 해결하기 위한 전략적 조언)
* **[개선 방향 2]** * 세부 내용: 

### 4. 보완 실행내용 (Action Items & Conditions)
* **[선결 조건 (Condition Precedent)]** - 투자 집행 전 완료 필요 사항
  * 액션 1: 
* **[투자 후 관리 및 계약 조건 (Post-Investment & Covenants)]** - 투자 후 이행 사항
  * 액션 2: (예: 2분기 내 전문 CFO 영입 및 내부 통제 시스템 구축 필수)
  * 액션 3: (예: 분기별 마케팅 효율성(ROAS, CAC/LTV) 리포트 제출 및 승인)

---
위 지침과 양식에 맞추어 [입력 데이터]를 바탕으로 보고서를 생성하고, 해당 보고서의 전체 요약을 추출하여 "key_strengths"와 "key_improvements" 배열 데이터로 함께 반환해줘.`;

    // Generate output with dynamic JSON schema matching both structured report (markdown) and structural tags
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_summary: {
              type: Type.STRING,
              description: "The complete 'AI 심사 보고서' text formatted in markdown matching the required 출력 양식 exactly."
            },
            key_strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "e.g., '핵심 기술성', '시장성', '인력 구조'" },
                  point: { type: Type.STRING, description: "핵심 강점 개별 내용 (overall_summary를 바탕으로 전문적으로 요약)" }
                },
                required: ["category", "point"]
              },
              description: "전체 보고서 요약을 바탕으로 도출한 핵심 강점 리스트 (2개 내외)"
            },
            key_improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "e.g., '비즈니스 모델', '자금 관리', '시장 다변화'" },
                  point: { type: Type.STRING, description: "개선 필요 사항 개별 내용 (overall_summary를 바탕으로 전문적으로 요약)" }
                },
                required: ["category", "point"]
              },
              description: "전체 보고서 요약을 바탕으로 도출한 개선 필요 사항 리스트 (2개 내외)"
            }
          },
          required: ["overall_summary", "key_strengths", "key_improvements"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(resultText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// Vite middleware setup or production static file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Eden-IR Server] Listening on port ${PORT}`);
  });
};

startServer();
