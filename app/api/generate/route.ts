import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. 설정: OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. [법무사 프롬프트] 40개 파일을 200% 활용하는 업그레이드 버전
const VETERAN_PARALEGAL_PROMPT = `
[System Role] 당신은 대한민국 법원 제출 서류를 전담하는 **'20년 경력의 베테랑 법무사'**입니다. 
당신에게는 **40여 건의 실제 사건 파일(소장, 지급명령, 가압류 등)**이 지식 베이스로 제공되어 있습니다.

[핵심 작업 절차: 검색 후 모방]
사용자의 의뢰가 들어오면 무작정 작성하지 말고, **반드시 지식 파일(File Search)을 먼저 검색하십시오.**
1. **유사 사건 탐색:** 사용자의 사건 내용과 가장 유사한 파일(예: 대여금이면 대여금 소장, 명도면 명도 소장)을 찾으십시오.
2. **형식 모방:** 찾은 레퍼런스 파일의 **[청구취지] 형식**과 **[청구원인]의 목차 구조**를 그대로 벤치마킹하십시오.
3. **내용 확장:** 형식은 베끼되, 내용은 사용자가 입력한 [사실관계]를 바탕으로 육하원칙에 맞춰 구체적으로("현미경 서술") 작성하십시오.

[작성 원칙]
1. 단락의 세분화: 1. 당사자들의 관계, 2. 사건의 경위... 등 목차를 잡고 번호를 매기십시오.
2. 증거 인용: "갑 제1호증", "갑 제2호증" 등의 표현을 적재적소에 배치하십시오.
3. 문체: 법원에 제출하는 정중하고 단호한 경어체("~하였습니다", "~바랍니다")를 유지하십시오.

--------------------------------------------------------------------------------
[JSON 출력 포맷 준수]
반드시 아래 JSON 포맷으로만 응답하십시오. (마크다운, 사족 절대 금지)
{
  "prayer": "레퍼런스 파일의 형식을 따른 청구취지",
  "cause": "상세하게 작성된 청구원인 (줄바꿈은 \\n 사용)",
  "law": "관련 법규",
  "case": "유사 판례",
  "strategy": "법무사 조언 (참고한 파일명이 있다면 언급)"
}
`;

export async function POST(req: Request) {
  try {
    const { prompt, caseType } = await req.json();

    if (!prompt) return NextResponse.json({ error: "질문 내용이 없습니다." }, { status: 400 });

    console.log("1. 스레드 생성 중...");
    const thread = await openai.beta.threads.create();

    console.log("2. 메시지 추가 중...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `
      # 의뢰 내용
      - [사건 유형]: ${caseType}
      - [사실관계]: ${prompt}
      
      위 사실관계를 바탕으로 지식 파일(유사 사례)을 참고하여 서류를 작성하고, 반드시 **JSON 포맷**으로 출력하시오.
      `
    });

    console.log("3. AI 비서 실행 및 대기 중... (Strict Mode + File Search)");
    
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
      instructions: VETERAN_PARALEGAL_PROMPT, 
      // ✅ tool_choice나 tools를 여기서 굳이 재정의하지 않아도, 
      // Assistant 설정 페이지에서 'File Search'가 켜져 있다면 자동으로 동작합니다.
      response_format: { type: "json_object" } 
    });

    console.log("4. 실행 완료. 상태:", run.status);

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      
      const lastMessage = messages.data.filter(m => m.role === 'assistant')[0];
      let responseText = "";

      if (lastMessage && lastMessage.content[0].type === 'text') {
        responseText = lastMessage.content[0].text.value;
      }

      // 🧹 [수정됨] 2차 안전장치: 응답 텍스트 정제
      // 1) 마크다운 제거
      let cleanText = responseText.replace(/```json/g, "").replace(/```/g, "");
      
      // 2) ✅ [추가됨] OpenAI 주석(【4:0†source】) 완벽 제거
      cleanText = cleanText.replace(/【.*?】/g, "").trim();
      
      // 3) 혹시 앞뒤에 사족이 붙었을 경우, JSON 범위만 추출
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      try {
        const result = JSON.parse(cleanText);
        console.log("✅ JSON 파싱 성공!");
        return NextResponse.json({ result });
      } catch (e) {
        console.error("❌ JSON 파싱 실패:", e);
        console.error("원본 텍스트:", responseText);
        
        return NextResponse.json({ 
          result: {
            prayer: "자동 변환 중 오류가 발생했습니다.",
            cause: cleanText, // 정제된 텍스트라도 보여줌
            law: "-", case: "-", strategy: "-"
          } 
        });
      }
    } else {
      console.error("AI 실행 실패 Error:", run.last_error);
      return NextResponse.json({ error: `AI 처리 실패: ${run.status}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("서버 에러 발생:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}