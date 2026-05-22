import React, { useState, useEffect } from "react";
import axios from "axios";

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${
          highlight ? "text-green-600" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
function Business() {
  const [bNo, setBNo] = useState("");           // 사업자등록번호 입력값
  const [pNm, setPNm] = useState("");           // 대표자성명 입력값
  const [startDt, setStartDt] = useState("");   // 개업일자 입력값
  const [trigger, setTrigger] = useState(0);    // 🔔 useEffect 실행 신호
  const [result, setResult] = useState(null);   // 조회 결과
  const [loading, setLoading] = useState(false);// 로딩 상태

  useEffect(() => {
    // 초기 마운트 시에는 실행하지 않음
    if (trigger === 0) return;

    const fetchBusiness = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          import.meta.env.VITE_API_URL,
          {
            businesses: [
              {
                b_no: bNo,
                p_nm: pNm,
                start_dt: startDt,
              },
            ],
          },
          {
            params: {
              serviceKey: import.meta.env.VITE_API_KEY,
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response.data.data);
        setResult(response.data.data);
      } catch (error) {
        console.error("에러 발생:", error);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [trigger]); // 🎯 trigger가 바뀔 때마다 useEffect 실행

  // 버튼 클릭 핸들러 → trigger 값을 바꿔서 useEffect에 신호 전송
  const handleSubmit = () => {
    if (!bNo || !pNm || !startDt) {
      alert("모든 항목을 입력해주세요!");
      return;
    }
    setTrigger((prev) => prev + 1); // 신호! useEffect 실행됨
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          사업자 진위확인
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자등록번호
            </label>
            <input
              type="text"
              value={bNo}
              onChange={(e) => setBNo(e.target.value)}
              placeholder="숫자 10자리 (- 제외)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표자성명
            </label>
            <input
              type="text"
              value={pNm}
              onChange={(e) => setPNm(e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              개업일자
            </label>
            <input
              type="text"
              value={startDt}
              onChange={(e) => setStartDt(e.target.value)}
              placeholder="YYYYMMDD (예: 20200101)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "조회 중..." : "조회하기"}
          </button>
        </div>

        {/* 결과 표시 */}
        {result && result.length > 0 && (
          <div className="mt-6 space-y-4">
            {result.map((item, idx) => {
              const isValid = item.valid === "01";
              const status = item.status;

              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <div
                    className={`px-5 py-3 flex items-center justify-between ${
                      isValid ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs text-gray-500">사업자등록번호</p>
                      <p className="text-lg font-bold text-gray-800">
                        {item.b_no.replace(
                          /(\d{3})(\d{2})(\d{5})/,
                          "$1-$2-$3"
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isValid
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {isValid ? "✓ 일치" : "✗ 불일치"}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 bg-white">
                    <h3 className="text-sm font-semibold text-gray-600 border-b pb-2 mb-3">
                      📋 사업자 상태 정보
                    </h3>

                    <InfoRow
                      label="사업자 상태"
                      value={status.b_stt || "정보 없음"}
                      highlight={status.b_stt === "계속사업자"}
                    />
                    <InfoRow label="과세 유형" value={status.tax_type} />

                    {status.end_dt && (
                      <InfoRow label="폐업일자" value={status.end_dt} />
                    )}

                    <InfoRow
                      label="단위과세전환폐업여부"
                      value={status.utcc_yn === "Y" ? "예" : "아니오"}
                    />

                    {status.rbf_tax_type !== "해당없음" && (
                      <InfoRow
                        label="직전 과세유형"
                        value={status.rbf_tax_type}
                      />
                    )}
                  </div>

                  <div className="bg-gray-50 px-5 py-3 text-xs text-gray-500">
                    <p>
                      조회: {item.request_param.p_nm} · 개업일{" "}
                      {item.request_param.start_dt.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        "$1.$2.$3"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Business;