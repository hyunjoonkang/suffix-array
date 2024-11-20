import { useState } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Suffix Array 계산 및 시각화 단계 생성
  // const calculateSuffixArray = (s) => {
  //   const n = s.length;
  //   let rank = Array(n + 1).fill(0);
  //   let newRank = Array(n + 1).fill(0);
  //   let sa = Array.from({ length: n }, (_, i) => i);
  //   let steps = [];

  //   // 초기화 단계
  //   rank = [...s].map((c) => c.charCodeAt(0));
  //   rank.push(-1);

  //   steps.push({
  //     phase: "초기화",
  //     k: 0,
  //     ranks: [...rank],
  //     pairs: null,
  //     sortedPairs: null,
  //     description: "첫 글자를 기준으로 초기 순위 부여",
  //   });

  //   // Doubling Algorithm
  //   for (let k = 1; k < n; k *= 2) {
  //     let pairs = [];
  //     // Pair 생성
  //     for (let i = 0; i < n; i++) {
  //       const nextRank = i + k < n ? rank[i + k] : -1;
  //       pairs.push({
  //         pair: [rank[i], nextRank],
  //         index: i,
  //         suffix: s.slice(i),
  //       });
  //     }

  //     steps.push({
  //       phase: "페어 생성",
  //       k: k,
  //       ranks: [...rank],
  //       pairs: [...pairs],
  //       sortedPairs: null,
  //       description: `k=${k}일 때의 페어 생성`,
  //     });

  //     // Pair 정렬
  //     pairs.sort((a, b) => {
  //       if (a.pair[0] !== b.pair[0]) return a.pair[0] - b.pair[0];
  //       return a.pair[1] - b.pair[1];
  //     });

  //     steps.push({
  //       phase: "페어 정렬",
  //       k: k,
  //       ranks: [...rank],
  //       pairs: [...pairs],
  //       sortedPairs: [...pairs],
  //       description: "페어를 기준으로 정렬",
  //     });

  //     // 새로운 순위 부여
  //     newRank = Array(n + 1).fill(0);
  //     newRank[pairs[0].index] = 0;
  //     let rankValue = 0;

  //     for (let i = 1; i < n; i++) {
  //       if (
  //         pairs[i].pair[0] !== pairs[i - 1].pair[0] ||
  //         pairs[i].pair[1] !== pairs[i - 1].pair[1]
  //       ) {
  //         rankValue++;
  //       }
  //       newRank[pairs[i].index] = rankValue;
  //     }

  //     if (rankValue === n - 1) break;
  //     rank = [...newRank];

  //     steps.push({
  //       phase: "순위 갱신",
  //       k: k,
  //       ranks: [...rank],
  //       pairs: [...pairs],
  //       sortedPairs: [...pairs],
  //       description: "새로운 순위 부여 완료",
  //     });
  //   }

  //   return steps;
  // };
  const calculateSuffixArray = (s) => {
    const n = s.length;
    let rank = Array(n + 1).fill(0);
    let newRank = Array(n + 1).fill(0);
    let sa = Array.from({ length: n }, (_, i) => i);
    let steps = [];

    // 초기 순위 설정
    rank = [...s].map((c) => c.charCodeAt(0));
    rank.push(-1);

    steps.push({
      phase: "초기화",
      k: 0,
      ranks: [...rank],
      pairs: null,
      sortedPairs: null,
      description: "첫 글자를 기준으로 초기 순위 부여",
    });

    // Doubling 알고리즘
    for (let k = 1; k < n; k *= 2) {
      let pairs = [];
      for (let i = 0; i < n; i++) {
        const nextRank = i + k < n ? rank[i + k] : -1;
        pairs.push({
          pair: [rank[i], nextRank],
          index: i,
          suffix: s.slice(i),
        });
      }

      // 페어 생성 단계
      steps.push({
        phase: "페어 생성",
        k: k,
        ranks: [...rank],
        pairs: [...pairs],
        sortedPairs: null, // 정렬되기 전의 상태를 유지
        description: `k=${k}일 때의 페어 생성`,
      });

      // 페어 정렬
      const sortedPairs = [...pairs].sort((a, b) => {
        if (a.pair[0] !== b.pair[0]) return a.pair[0] - b.pair[0];
        return a.pair[1] - b.pair[1];
      });

      // 페어 정렬 단계
      steps.push({
        phase: "페어 정렬",
        k: k,
        ranks: [...rank],
        pairs: [...pairs], // 이전 단계의 페어 유지
        sortedPairs: [...sortedPairs], // 정렬된 페어만 업데이트
        description: "페어를 기준으로 정렬",
      });

      // 새로운 순위 갱신
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

      if (rankValue === n - 1) break;
      rank = [...newRank];

      steps.push({
        phase: "순위 갱신",
        k: k,
        ranks: [...rank],
        pairs: [...pairs], // 이전 페어를 유지
        sortedPairs: [...sortedPairs], // 정렬 결과 반영
        description: "새로운 순위 부여 완료",
      });
    }

    return steps;
  };

  const handleCalculate = () => {
    if (!input) return;
    setIsProcessing(true);
    const newSteps = calculateSuffixArray(input);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsProcessing(false);
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
                  현재 순위
                </th>
                {step.pairs && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페어
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {step.ranks.slice(0, -1).map((rank, idx) => (
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
            <h4 className="text-lg font-semibold mb-2">정렬된 페어</h4>
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
                      페어
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
                        {`(${pair.pair[0]}, ${pair.pair[1]})`}
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
            <StepVisualizer step={steps[currentStep]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuffixArrayVisualizer;
