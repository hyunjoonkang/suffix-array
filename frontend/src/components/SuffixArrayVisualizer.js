import { useState } from "react";

const SuffixArrayVisualizer = () => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // 기수 정렬 구현
  const radixSort = (pairs) => {
    let sortedPairs = [...pairs];
    let sortingSteps = [];

    // 두 개의 키(pair[0], pair[1])에 대해 각각 정렬
    for (let keyIndex = 1; keyIndex >= 0; keyIndex--) {
      // 현재 키의 최대값 찾기
      const max = Math.max(...sortedPairs.map((p) => p.pair[keyIndex] + 1));

      // 각 자릿수별로 정렬
      for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const output = new Array(sortedPairs.length).fill(null);
        const count = new Array(10).fill(0);

        // Count 배열 채우기
        for (let i = 0; i < sortedPairs.length; i++) {
          const num = sortedPairs[i].pair[keyIndex] + 1; // 음수 처리를 위해 +1
          const digit = Math.floor(num / exp) % 10;
          count[digit]++;
        }

        // Count 배열 누적합 계산
        for (let i = 1; i < 10; i++) {
          count[i] += count[i - 1];
        }

        // 뒤에서부터 정렬하여 안정성 보장
        for (let i = sortedPairs.length - 1; i >= 0; i--) {
          const num = sortedPairs[i].pair[keyIndex] + 1;
          const digit = Math.floor(num / exp) % 10;
          output[count[digit] - 1] = sortedPairs[i];
          count[digit]--;
        }

        sortedPairs = [...output];

        // 정렬 과정 저장
        sortingSteps.push({
          phase: "기수 정렬",
          sortedPairs: [...sortedPairs],
          description: `${
            keyIndex === 0 ? "첫 번째" : "두 번째"
          } 키의 ${exp}의 자릿수로 정렬 중`,
          digit: exp,
          keyIndex: keyIndex,
          countArray: [...count],
        });
      }
    }

    return { sortedPairs, sortingSteps };
  };

  const calculateSuffixArray = (s) => {
    const n = s.length;
    let rank = Array(n + 1).fill(0);
    let newRank = Array(n + 1).fill(0);
    let sa = Array.from({ length: n }, (_, i) => i);
    let steps = [];

    // 문자 빈도수 계산
    const charFreq = {};
    for (let char of s) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    // 초기 순위 설정 (문자 빈도수 기준)
    rank = [...s].map((c) => charFreq[c]);
    rank.push(-1);

    steps.push({
      phase: "초기화",
      k: 0,
      ranks: [...rank],
      pairs: null,
      sortedPairs: null,
      charFreq: { ...charFreq },
      description: "문자 빈도수 기준으로 초기 순위 부여",
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

      steps.push({
        phase: "페어 생성",
        k: k,
        ranks: [...rank],
        pairs: [...pairs],
        sortedPairs: null,
        charFreq: { ...charFreq },
        description: `k=${k}일 때의 페어 생성`,
      });

      // 기수 정렬 적용
      const { sortedPairs, sortingSteps } = radixSort(pairs);

      // 정렬 과정의 각 단계를 steps에 추가
      steps.push(
        ...sortingSteps.map((step) => ({
          ...step,
          k: k,
          ranks: [...rank],
          pairs: [...pairs],
          charFreq: { ...charFreq },
        }))
      );

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

      steps.push({
        phase: "순위 갱신",
        k: k,
        ranks: [...newRank],
        pairs: [...pairs],
        sortedPairs: [...sortedPairs],
        charFreq: { ...charFreq },
        description: "새로운 순위 부여 완료",
      });

      if (rankValue === n - 1) break;
      rank = [...newRank];
    }

    // 최종 결과 추가
    steps.push({
      phase: "최종 결과",
      k: null,
      ranks: [...rank],
      pairs: null,
      sortedPairs: [...sa]
        .sort((a, b) => rank[a] - rank[b])
        .map((i) => ({
          index: i,
          suffix: s.slice(i),
          rank: rank[i],
        })),
      charFreq: { ...charFreq },
      description: "모든 접미사가 사전순으로 정렬된 최종 결과",
    });

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

        {step.charFreq && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold text-green-900">
              문자 빈도수
            </h4>
            <div className="grid grid-cols-4 gap-4 mt-2">
              {Object.entries(step.charFreq).map(([char, freq]) => (
                <div key={char} className="text-green-700">
                  {char}: {freq}
                </div>
              ))}
            </div>
          </div>
        )}

        {step.digit && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-900">
              기수 정렬 정보
            </h4>
            <p className="text-yellow-700">
              정렬 중인 키: {step.keyIndex === 0 ? "첫 번째" : "두 번째"} 키
            </p>
            <p className="text-yellow-700">
              현재 처리 중인 자릿수: {step.digit}
            </p>
            {step.countArray && (
              <div className="mt-2">
                <p className="text-yellow-900 font-semibold">카운트 배열:</p>
                <div className="grid grid-cols-10 gap-2 mt-1">
                  {step.countArray.map((count, idx) => (
                    <div key={idx} className="text-yellow-700">
                      {idx}: {count}
                    </div>
                  ))}
                </div>
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          Suffix Array 시각화 (기수 정렬)
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
