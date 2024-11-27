import { useState } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // 기수 정렬 구현
  const radixSort = (pairs) => {
    let sortingSteps = [];
    let result = [...pairs];

    // 두 번째 값으로 먼저 정렬
    const sortBySecond = () => {
      let buckets = Array.from({ length: 128 }, () => []); // ASCII 범위

      // 두 번째 값 기준으로 버킷에 분배
      result.forEach((pair) => {
        const value = pair.pair[1] === null ? 0 : pair.pair[1];
        buckets[value].push(pair);
      });

      // 버킷에서 순서대로 가져오기
      result = buckets.flat();

      const usedBuckets = buckets
        .map((bucket, ascii) => ({ ascii, count: bucket.length }))
        .filter((b) => b.count > 0);

      if (usedBuckets.length > 0) {
        sortingSteps.push({
          phase: "기수 정렬",
          description: "두 번째 값 기준 정렬",
          sortedPairs: [...result],
          bucketInfo: usedBuckets,
        });
      }
    };

    // 첫 번째 값으로 정렬
    const sortByFirst = () => {
      let buckets = Array.from({ length: 128 }, () => []); // ASCII 범위

      // 첫 번째 값 기준으로 버킷에 분배
      result.forEach((pair) => {
        const value = pair.pair[0];
        buckets[value].push(pair);
      });

      // 버킷에서 순서대로 가져오기
      result = buckets.flat();

      const usedBuckets = buckets
        .map((bucket, ascii) => ({ ascii, count: bucket.length }))
        .filter((b) => b.count > 0);

      if (usedBuckets.length > 0) {
        sortingSteps.push({
          phase: "기수 정렬",
          description: "첫 번째 값 기준 정렬",
          sortedPairs: [...result],
          bucketInfo: usedBuckets,
        });
      }
    };

    // 두 번째 값으로 정렬 후 첫 번째 값으로 정렬
    sortBySecond();
    sortByFirst();

    return { sortedPairs: result, sortingSteps };
  };

  const calculateSuffixArray = (s) => {
    const n = s.length;
    let rank = Array(n + 1).fill(0);
    let steps = [];

    // 초기 순위 설정 (ASCII 값 기준)
    rank = [...s].map((c) => c.charCodeAt(0));
    rank.push(-1);

    // 초기 상태를 steps에 추가 - ASCII 값 포함
    const initialPairs = [...s]
      .map((c, i) => ({
        pair: [c.charCodeAt(0), null],
        index: i,
        suffix: s.slice(i),
        ascii: c.charCodeAt(0),
      }))
      .sort((a, b) => a.ascii - b.ascii);

    steps.push({
      phase: "초기화",
      k: 0,
      ranks: [...rank],
      pairs: initialPairs,
      sortedPairs: initialPairs,
      description: "ASCII 값 기준으로 초기 정렬",
    });

    // Doubling 알고리즘
    for (let k = 1; k < n; k *= 2) {
      let pairs = [];
      for (let i = 0; i < n; i++) {
        pairs.push({
          pair: [rank[i], i + k < n ? rank[i + k] : -1],
          index: i,
          suffix: s.slice(i),
        });
      }

      steps.push({
        phase: "페어 생성",
        k: k,
        ranks: [...rank],
        pairs: [...pairs],
        description: `k=${k}일 때 페어 생성`,
      });

      // 기수 정렬 적용
      const { sortedPairs, sortingSteps } = radixSort(pairs);
      steps.push(
        ...sortingSteps.map((step) => ({
          ...step,
          k: k,
          ranks: [...rank],
        }))
      );

      // 새로운 순위 부여
      let newRank = Array(n + 1).fill(-1);
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
        description: "새로운 순위 부여",
      });

      if (rankValue === n - 1) break;
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

        {step.bucketInfo && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-900">버킷 정보</h4>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {step.bucketInfo.map(({ ascii, count }, idx) => (
                <div key={idx} className="text-yellow-700">
                  {ascii === 0
                    ? "null"
                    : `'${String.fromCharCode(ascii)}' (${ascii})`}
                  : {count}개
                </div>
              ))}
            </div>
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
                  {step.k === 0 ? "ASCII 값" : "비교 값 쌍"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순위
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(step.sortedPairs || step.pairs || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.index}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.suffix}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {step.k === 0
                      ? `${item.ascii} ('${String.fromCharCode(item.ascii)}')`
                      : `(${item.pair[0]}, ${
                          item.pair[1] === -1 ? "null" : item.pair[1]
                        })`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {step.ranks[item.index]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleCalculate = () => {
    if (!input) return;
    try {
      const newSteps = calculateSuffixArray(input);
      setSteps(newSteps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error calculating suffix array:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          Suffix Array 시각화 (ASCII 기반 정렬)
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
            disabled={!input}
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
