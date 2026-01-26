const fs = require('fs');
const path = require('path');

// ============================================================
// 📍 경로 설정 (아까랑 똑같음)
// ============================================================
const trainingPath = String.raw`C:\Users\xfg1\Desktop\Hamin Kim\law-auto\ai_data\01.민사법_LLM_사전학습_및_Instruction_Tuning_데이터\3.개방데이터\1.데이터\Training\02.라벨링데이터\법령_전체`;

const validationBase = String.raw`C:\Users\xfg1\Desktop\Hamin Kim\law-auto\ai_data\01.민사법_LLM_사전학습_및_Instruction_Tuning_데이터\3.개방데이터\1.데이터\Validation\02.라벨링데이터`;

// 분석 대상
const targets = [
    { 
        path: trainingPath, 
        label: "📘 Training: 법령 데이터 (민법 등)",
        type: "law" 
    },
    // Validation은 이미 잘 되는 거 확인했으니 잠깐 주석 처리해도 됨
    // { 
    //     path: path.join(validationBase, "판결문_요약"), 
    //     label: "📙 Validation: 판결문 요약",
    //     type: "judgment" 
    // }
];

// ============================================================
// 🛠️ 업그레이드된 분석 로직
// ============================================================

console.log("🚀 법률 데이터 심층 해부 시작...\n");

targets.forEach((target) => {
    analyzeFolder(target.path, target.label, target.type);
});

function analyzeFolder(folderPath, label, type) {
    console.log(`================================================================`);
    console.log(`🔍 [${label}] 분석 중...`);
    
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ 폴더 없음: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath);
    const stats = {}; 
    let validFiles = 0;

    files.forEach(file => {
        if (!file.endsWith('.json')) return;

        try {
            const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
            const json = JSON.parse(content);
            validFiles++;

            if (type === "law") {
                const lawName = json.info.statute_name || "미확인 법령";
                
                // 텍스트 추출 (배열이든 문자열이든 다 합침)
                let text = "";
                if (json.taskinfo && json.taskinfo.sentences) {
                    text = Array.isArray(json.taskinfo.sentences) 
                           ? json.taskinfo.sentences.join(' ') 
                           : json.taskinfo.sentences;
                }

                // 🔥 [핵심 수정] 정규식에 'g'(Global) 플래그 추가해서 문서 끝까지 다 찾음!
                const regex = /제\s?(\d+)\s?조/g;
                let match;
                
                if (!stats[lawName]) stats[lawName] = { count: 0, articles: new Set() };
                stats[lawName].count++;

                // 반복문으로 모든 조항 번호 수집
                while ((match = regex.exec(text)) !== null) {
                    const articleNo = parseInt(match[1]);
                    stats[lawName].articles.add(articleNo);
                }

            } else {
                const caseName = json.info.casenames || "기타 사건";
                if (!stats[caseName]) stats[caseName] = 0;
                stats[caseName]++;
            }

        } catch (e) {
            // 에러 무시
        }
    });

    console.log(`📂 파일 개수: ${validFiles}개 (파일이 적어도 내용이 알차면 OK!)`);
    console.log(`----------------------------------------------------------------`);

    if (type === "law") {
        console.log(`  📜 법령명                     | 조문 커버리지 (Min ~ Max) | 총 조문 수`);
        console.log(`----------------------------------------------------------------`);
        Object.keys(stats).forEach(law => {
            const s = stats[law];
            const articles = Array.from(s.articles).sort((a, b) => a - b); // 오름차순 정렬
            
            const min = articles.length ? articles[0] : 0;
            const max = articles.length ? articles[articles.length - 1] : 0;
            const count = articles.length; // 실제 발견된 조문 개수
            
            const lawPrint = law.padEnd(25, ' ');
            console.log(`  ${lawPrint} | 제${min}조 ~ 제${max}조      | ${count}개 조항 발견`);
        });
    }
    console.log(`\n`);
}