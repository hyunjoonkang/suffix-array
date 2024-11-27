import { useState } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Radix sort 구현
  const radixSortPairs = (pairs) => {
    let sortingSteps = [];
    const n = pairs.length;
    let result = [...pairs];

    // 두 번째 값으로 먼저 정렬한 후 첫 번째 값으로 정렬 (안정성 유지)
    for (let pairIndex = 1; pairIndex >= 0; pairIndex--) {
      // 버킷 초기화
      let buckets = Array.from({ length: 300 }, () => []); // ASCII 값 범위 고려

      // 현재 값에 따라 버킷에 분배
      for (let i = 0; i < n; i++) {
        const value = result[i].pair[pairIndex];
        buckets[value + 128].push(result[i]); // 음수 처리를 위해 +128
      }

      // 버킷에서 순서대로 가져오기
      result = [];
      for (let bucket of buckets) {
        if (bucket.length > 0) {
          result.push(...bucket);
        }
      }

      // 정렬 단계 저장
      sortingSteps.push({
        phase: "기수 정렬",
        description: `${pairIndex === 0 ? "첫" : "두"} 번째 값 기준 정렬`,
        sortedPairs: [...result],
        radixInfo: {
          currentKey: pairIndex,
          bucketSample: buckets.map((b) => b.length).filter((l) => l > 0),
        },
      });
    }

    return { sortedPairs: result, sortingSteps };
  };

  const calculateSuffixArray = (s) => {
    const n = s.length;
    let rank = Array(n + 1).fill(0);
    let newRank = Array(n + 1).fill(0);
    let steps = [];

    // 초기 순위 설정 (사전순)
    rank = [...s].map((c) => c.charCodeAt(0));
    rank.push(-1); // 문자열 끝 표시

    steps.push({
      phase: "초기화",
      k: 0,
      ranks: [...rank],
      pairs: null,
      sortedPairs: null,
      description: "사전순으로 초기 순위 부여",
    });

    // Doubling 알고리즘
    for (let k = 1; k < n; k *= 2) {
      let pairs = [];
      // k 길이 페어 생성
      for (let i = 0; i < n; i++) {
        const nextRank = i + k < n ? rank[i + k] : -1;
        pairs.push({
          pair: [rank[i], nextRank],
          index: i,
          suffix: s.slice(i),
        });
      }

      steps.push({
        phase: "페어 생성",
        k: k,
        ranks: [...rank],
        pairs: [...pairs],
        sortedPairs: null,
        description: `k=${k}일 때의 페어 생성`,
      });

      // 기수 정렬 적용
      const { sortedPairs, sortingSteps } = radixSortPairs(pairs);

      // 정렬 과정의 각 단계를 steps에 추가
      sortingSteps.forEach((step) => {
        steps.push({
          ...step,
          k: k,
          ranks: [...rank],
          pairs: [...pairs],
        });
      });

      // 새로운 순위 부여
      newRank = Array(n + 1).fill(0);
      newRank[sortedPairs[0].index] = 0;
      let rankValue = 0;

      for (let i = 1; i < n; i++) {
        if (
          sortedPairs[i].pair[0] !== sortedPairs[i - 1].pair[0] ||
          sortedPairs[i].pair[1] !== sortedPairs[i - 1].pair[1]
        ) {
          rankValue++;
        }
        newRank[sortedPairs[i].index] = rankValue;
      }

      steps.push({
        phase: "순위 갱신",
        k: k,
        ranks: [...newRank],
        pairs: [...pairs],
        sortedPairs: [...sortedPairs],
        description: "새로운 순위 부여 완료",
      });

      if (rankValue === n - 1) {
        // 모든 순위가 다르면 종료
        steps.push({
          phase: "최종 결과",
          k: k,
          ranks: [...newRank],
          pairs: null,
          sortedPairs: sortedPairs.map((p) => ({
            index: p.index,
            suffix: p.suffix,
            rank: rankValue,
          })),
          description: "모든 접미사가 사전순으로 정렬됨",
        });
        break;
      }

      rank = [...newRank];
    }

    return steps;
  };

  const StepVisualizer = ({ step }) => {
    if (!step) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">
            단계: {step.phase} {step.k > 0 ? `(k=${step.k})` : ""}
          </h3>
          <p className="text-blue-700">{step.description}</p>
        </div>

        {step.radixInfo && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-900">
              기수 정렬 정보
            </h4>
            <p className="text-yellow-700">
              현재 정렬 중인 키: {step.radixInfo.currentKey === 0 ? "첫" : "두"}{" "}
              번째 값
            </p>
            {step.radixInfo.bucketSample.length > 0 && (
              <div className="mt-2">
                <p className="text-yellow-900 font-semibold">
                  비어있지 않은 버킷 수: {step.radixInfo.bucketSample.length}
                </p>
              </div>
            )}
          </div>
        )}

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순위
                </th>
                {step.pairs && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페어
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {step.ranks &&
                step.ranks.slice(0, -1).map((rank, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {idx}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {input.slice(idx)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rank}
                    </td>
                    {step.pairs && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`(${step.pairs[idx].pair[0]}, ${step.pairs[idx].pair[1]})`}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {step.sortedPairs && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">정렬된 결과</h4>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      값
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {step.sortedPairs.map((pair, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pair.index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pair.suffix}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pair.pair
                          ? `(${pair.pair[0]}, ${pair.pair[1]})`
                          : pair.rank}
                      </td>
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
        <h2 className="text-2xl font-bold mb-4">
          Suffix Array 시각화 (기수 정렬 + Doubling)
        </h2>

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
            <StepVisualizer step={steps[currentStep]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuffixArrayVisualizer;
