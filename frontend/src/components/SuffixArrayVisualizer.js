import { useState, useCallback } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateSuffixArray = useCallback((s) => {
    const steps = [];
    const n = s.length;
    let rank = new Array(n);
    let currentPairs = null;

    // k=1 단계: ASCII 코드 기준 순위 설정
    let chars = [...new Set(s.split(""))].sort(); // 중복 제거 후 정렬
    let initialRanks = {};
    chars.forEach((char, idx) => {
      initialRanks[char] = idx + 1;
    });

    for (let i = 0; i < n; i++) {
      rank[i] = initialRanks[s[i]];
    }

    // k=1 단계 정보 저장
    steps.push({
      phase: "초기화 (k=1)",
      characterRanks: chars
        .map((char) => `${char}=${initialRanks[char]}`)
        .join(", "),
      ranks: [...rank],
      suffixes: Array.from({ length: n }, (_, i) => ({
        index: i,
        suffix: s.slice(i),
        firstChar: s[i],
        rank: rank[i],
      })),
      sortedSuffixes: Array.from({ length: n }, (_, i) => ({
        index: i,
        suffix: s.slice(i),
        pairRank: [rank[i], -1],
        newRank: rank[i],
      })).sort((a, b) => a.newRank - b.newRank),
      description: "문자별 순위 부여 및 첫 글자 기준 순위",
      k: 1,
    });

    // k=2부터 시작하는 단계별 처리
    let currentK = 1;
    while (currentK < n) {
      // 순위쌍 생성
      currentPairs = [];
      for (let i = 0; i < n; i++) {
        currentPairs.push({
          index: i,
          suffix: s.slice(i),
          currentRank: rank[i],
          nextRank: i + currentK < n ? rank[i + currentK] : -1,
        });
      }

      // 순위쌍 정렬
      currentPairs.sort((a, b) => {
        if (a.currentRank !== b.currentRank) {
          return a.currentRank - b.currentRank;
        }
        return a.nextRank - b.nextRank;
      });

      // 새로운 순위 부여
      const tempRank = new Array(n);
      tempRank[currentPairs[0].index] = 0;
      let rankValue = 0;

      for (let i = 1; i < n; i++) {
        const current = currentPairs[i];
        const prev = currentPairs[i - 1];

        if (
          current.currentRank !== prev.currentRank ||
          current.nextRank !== prev.nextRank
        ) {
          rankValue++;
        }
        tempRank[current.index] = rankValue;
      }

      // 단계 정보 저장
      steps.push({
        phase: `단계 (k=${currentK * 2})`,
        ranks: [...rank],
        suffixes: Array.from({ length: n }, (_, i) => ({
          index: i,
          suffix: s.slice(i),
          pairRank: [rank[i], i + currentK < n ? rank[i + currentK] : -1],
          pairString: [
            s.slice(i, i + currentK), // 현재 k만큼의 문자열
            i + currentK < n ? s.slice(i + currentK, i + currentK * 2) : "$", // 다음 k만큼의 문자열
          ],
          newRank: tempRank[i],
        })),
        sortedSuffixes: currentPairs.map((item, idx) => ({
          order: idx + 1,
          index: item.index,
          suffix: item.suffix,
          pairRank: [item.currentRank, item.nextRank],
          pairString: [
            s.slice(item.index, item.index + currentK),
            item.index + currentK < n
              ? s.slice(item.index + currentK, item.index + currentK * 2)
              : "$",
          ],
          newRank: tempRank[item.index],
        })),
        description: `길이 ${currentK * 2}를 기준으로 정렬 및 새로운 순위 부여`,
        k: currentK * 2,
      });

      if (rankValue === n - 1) break;
      rank = [...tempRank];
      currentK *= 2;
    }

    // 최종 결과 저장
    steps.push({
      phase: "최종 결과",
      ranks: [...rank],
      suffixes: null,
      sortedSuffixes: currentPairs.map((item) => ({
        index: item.index,
        suffix: s.slice(item.index),
      })),
      description: "최종 정렬된 접미사 배열",
      k: currentK * 2,
    });

    return steps;
  }, []);

  const StepVisualizer = ({ step, input }) => {
    if (!step) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">
            단계: {step.phase}
          </h3>
          <p className="text-blue-700">{step.description}</p>
          {step.characterRanks && (
            <p className="text-blue-700 mt-2">
              문자별 순위: {step.characterRanks}
            </p>
          )}
        </div>

        {step.suffixes && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    접미사
                  </th>
                  {step.k === 1 ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        첫글자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순위
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순위쌍
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        새순위
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {step.suffixes.map((item) => (
                  <tr key={item.index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.suffix}
                    </td>
                    {step.k === 1 ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.firstChar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.rank}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {`(${item.pairRank[0]}, ${
                            item.pairRank[1] === -1 ? "$" : item.pairRank[1]
                          }) // ${item.pairString[0]},${
                            item.pairString[1] === "$"
                              ? "$"
                              : item.pairString[1]
                          }`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.newRank}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {step.sortedSuffixes && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">정렬된 순서</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {!step.phase.includes("최종") && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순서
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      위치
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      접미사
                    </th>
                    {!step.phase.includes("최종") && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          순위쌍
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          새순위
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {step.sortedSuffixes.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {!step.phase.includes("최종") && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.order}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.suffix}
                      </td>
                      {!step.phase.includes("최종") && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {`(${item.pairRank[0]}, ${
                              item.pairRank[1] === -1 ? "$" : item.pairRank[1]
                            })`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.newRank}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleCalculate = () => {
    if (!input) return;
    setIsProcessing(true);
    const newSteps = calculateSuffixArray(input);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Suffix Array 시각화</h2>

        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="문자열을 입력하세요 (예: banana)"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleCalculate}
            disabled={isProcessing || !input}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            계산
          </button>
        </div>

        {steps.length > 0 && (
          <div className="space-y-4">
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
            <StepVisualizer step={steps[currentStep]} input={input} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuffixArrayVisualizer;
