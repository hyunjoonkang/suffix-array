import { useState } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Suffix Array 계산 함수
  const calculateSuffixArray = (str) => {
    const n = str.length;
    let steps = [];

    // 초기 순위 설정 (첫 글자 기준)
    let rank = Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) {
      rank[i] = str.charCodeAt(i);
    }
    rank[n] = -1; // 문자열 끝 표시

    steps.push({
      phase: "초기화",
      description: "첫 글자 기준으로 순위 부여",
      ranks: [...rank],
      suffixes: Array.from({ length: n }, (_, i) => ({
        index: i,
        suffix: str.slice(i),
        rank: rank[i],
      })),
    });

    // Doubling Algorithm
    for (let k = 1; k < n; k *= 2) {
      // Pair 생성
      let pairs = [];
      for (let i = 0; i < n; i++) {
        pairs.push({
          index: i,
          pair: [rank[i], i + k < n ? rank[i + k] : -1],
          suffix: str.slice(i),
        });
      }

      // Pair 정렬
      pairs.sort((a, b) => {
        if (a.pair[0] !== b.pair[0]) return a.pair[0] - b.pair[0];
        return a.pair[1] - b.pair[1];
      });

      // 새로운 순위 부여
      let newRank = Array(n + 1).fill(0);
      newRank[pairs[0].index] = 0;

      for (let i = 1; i < n; i++) {
        if (
          pairs[i].pair[0] === pairs[i - 1].pair[0] &&
          pairs[i].pair[1] === pairs[i - 1].pair[1]
        ) {
          newRank[pairs[i].index] = newRank[pairs[i - 1].index];
        } else {
          newRank[pairs[i].index] = i;
        }
      }

      steps.push({
        phase: `k=${k} 단계`,
        description: `${k}글자씩 비교하여 순위 갱신`,
        ranks: [...newRank],
        pairs: [...pairs],
        suffixes: pairs.map((p) => ({
          index: p.index,
          suffix: p.suffix,
          rank: newRank[p.index],
        })),
      });

      if (newRank[pairs[n - 1].index] === n - 1) break;
      rank = newRank;
    }

    return steps;
  };

  const handleCalculate = () => {
    if (!input) return;
    const newSteps = calculateSuffixArray(input);
    setSteps(newSteps);
    setCurrentStep(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Suffix Array 시각화</h2>

        {/* 입력 섹션 */}
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="문자열을 입력하세요 (예: banana)"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCalculate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            계산
          </button>
        </div>

        {/* 단계별 시각화 */}
        {steps.length > 0 && (
          <div className="space-y-4">
            {/* 단계 네비게이션 */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
              >
                이전 단계
              </button>
              <span className="text-sm text-gray-600">
                단계 {currentStep + 1} / {steps.length}
              </span>
              <button
                onClick={() =>
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                }
                disabled={currentStep === steps.length - 1}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
              >
                다음 단계
              </button>
            </div>

            {/* 현재 단계 정보 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">
                {steps[currentStep].phase}
              </h3>
              <p className="text-blue-700">{steps[currentStep].description}</p>
            </div>

            {/* 접미사 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      위치
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      접미사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      순위
                    </th>
                    {steps[currentStep].pairs && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        페어
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {steps[currentStep].suffixes.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        {item.suffix}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.rank}
                      </td>
                      {steps[currentStep].pairs && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {`(${steps[currentStep].pairs[idx].pair[0]}, ${steps[currentStep].pairs[idx].pair[1]})`}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuffixArrayVisualizer;
