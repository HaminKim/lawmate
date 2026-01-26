const fs = require('fs');
const AdmZip = require('adm-zip');

const targetFile = "TL_01._민사법_002._법령_0001._질의응답.zip.part0";
const zipName = "법령_전체.zip";

console.log("🔥 Training 데이터 해제 작업을 시작합니다...");

if (fs.existsSync(targetFile)) {
    console.log(`📦 파일 발견: ${targetFile}`);
    fs.copyFileSync(targetFile, zipName); // 1. 파일 복사 (이름 변경 효과)
    console.log(`✅ 복사 완료 -> ${zipName}`);

    try {
        console.log("📂 압축 해제 중... (시간이 좀 걸릴 수 있어요)");
        const zip = new AdmZip(zipName);
        zip.extractAllTo("법령_전체", true); // 2. 압축 풀기
        console.log("🎉 성공! [법령_전체] 폴더가 생성되었습니다.");
    } catch (e) {
        console.log("❌ 압축 풀기 실패:", e.message);
    }
} else {
    console.log(`⚠️ 파일이 없습니다: ${targetFile}`);
    console.log("👉 이 파일이 현재 폴더에 있는지 확인해주세요.");
}