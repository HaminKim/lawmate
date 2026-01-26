const fs = require("fs");
const path = require("path");

// ============================================================
// 📍 경로 설정 (유진님 경로 그대로)
// ============================================================
const lawPath = String.raw`C:\Users\xfg1\Desktop\Hamin Kim\law-auto\ai_data\01.민사법_LLM_사전학습_및_Instruction_Tuning_데이터\3.개방데이터\1.데이터\Training\02.라벨링데이터\법령_전체`;
const caseBasePath = String.raw`C:\Users\xfg1\Desktop\Hamin Kim\law-auto\ai_data\01.민사법_LLM_사전학습_및_Instruction_Tuning_데이터\3.개방데이터\1.데이터\Validation\02.라벨링데이터`;

const outputFile = "law_data_v3.txt"; // 파일명 변경 (v3)

// 대용량 처리를 위한 스트림 생성
const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf-8' });

console.log("🔥 [v3] 날짜와 출처까지 완벽하게 기록합니다...");

// ============================================================
// 1️⃣ 법령 데이터 처리 (시행일자 추가)
// ============================================================
if (fs.existsSync(lawPath)) {
    console.log(`\n📘 1단계: 법령 데이터 정리 중...`);
    const files = fs.readdirSync(lawPath);
    
    files.forEach((file) => {
        if (!file.endsWith(".json")) return;
        try {
            const content = fs.readFileSync(path.join(lawPath, file), "utf-8");
            const json = JSON.parse(content);
            
            const lawName = json.info.statute_name || "법령";
            // ⭐ [추가] 시행일자 (법이 언제부터 효력이 있는지)
            const date = json.info.effective_date || "날짜미상"; 
            
            let fullText = "";
            if (json.taskinfo && json.taskinfo.sentences) {
                fullText = Array.isArray(json.taskinfo.sentences) 
                    ? json.taskinfo.sentences.join("\n") 
                    : json.taskinfo.sentences;
            }

            writeStream.write(`[법령정보]\n`);
            writeStream.write(`법령명: ${lawName}\n`);
            writeStream.write(`시행일자: ${date}\n`); // 날짜 정보 추가!
            writeStream.write(`내용:\n${fullText}\n`);
            writeStream.write(`--------------------------------------------------\n\n`);
            
        } catch (e) {}
    });
}

// ============================================================
// 2️⃣ 판례 요약 데이터 처리 (선고일자 추가)
// ============================================================
const summaryPath = path.join(caseBasePath, "판결문_요약");
if (fs.existsSync(summaryPath)) {
    console.log(`📙 2단계: 판례 요약 데이터 정리 중...`);
    const files = fs.readdirSync(summaryPath);
    
    files.forEach((file) => {
        if (!file.endsWith(".json")) return;
        try {
            const content = fs.readFileSync(path.join(summaryPath, file), "utf-8");
            const json = JSON.parse(content);
            
            const caseName = json.info.casenames || "사건";
            const caseNo = json.info.doc_id || "번호미상";
            // ⭐ [추가] 선고일자 (판결이 난 날짜)
            const date = json.info.announce_date || "날짜미상";

            // 원문
            let facts = "";
            if (json.taskinfo.sentences) {
                facts = Array.isArray(json.taskinfo.sentences) 
                    ? json.taskinfo.sentences.join(" ") 
                    : json.taskinfo.sentences;
            }
            const summary = json.taskinfo.output || "";

            writeStream.write(`[판례요약]\n`);
            writeStream.write(`사건명: ${caseName}\n`);
            writeStream.write(`사건번호: ${caseNo}\n`);
            writeStream.write(`선고일자: ${date}\n`); // 날짜 정보 추가!
            writeStream.write(`[판례원문]:\n${facts}\n`);
            writeStream.write(`[핵심요약]:\n${summary}\n`);
            writeStream.write(`--------------------------------------------------\n\n`);

        } catch (e) {}
    });
}

// ============================================================
// 3️⃣ 판례 Q&A 데이터 처리 (선고일자 추가)
// ============================================================
const qnaPath = path.join(caseBasePath, "판결문_질의응답");
if (fs.existsSync(qnaPath)) {
    console.log(`📗 3단계: 판례 Q&A 데이터 정리 중...`);
    const files = fs.readdirSync(qnaPath);
    
    files.forEach((file) => {
        if (!file.endsWith(".json")) return;
        try {
            const content = fs.readFileSync(path.join(qnaPath, file), "utf-8");
            const json = JSON.parse(content);
            
            const caseName = json.info.casenames || "사건";
            const caseNo = json.info.doc_id || "번호미상";
            // ⭐ [추가] 선고일자
            const date = json.info.announce_date || "날짜미상";

            const question = json.taskinfo.input;
            const answer = json.taskinfo.output;
            
            let context = "";
            if (json.taskinfo.sentences) {
                context = Array.isArray(json.taskinfo.sentences) 
                    ? json.taskinfo.sentences.join(" ") 
                    : json.taskinfo.sentences;
            }

            if (question && answer) {
                writeStream.write(`[법률Q&A]\n`);
                writeStream.write(`사건명: ${caseName} (${caseNo})\n`);
                writeStream.write(`선고일자: ${date}\n`); // 날짜 정보 추가!
                writeStream.write(`[참고판례]:\n${context}\n`);
                writeStream.write(`[질문]: ${question}\n`);
                writeStream.write(`[답변]: ${answer}\n`);
                writeStream.write(`--------------------------------------------------\n\n`);
            }

        } catch (e) {}
    });
}

writeStream.end();

console.log(`\n🎉 [v3] 날짜 정보가 포함된 완벽한 데이터셋 완성!`);
console.log(`👉 결과 파일: [law_data_v3.txt]`);