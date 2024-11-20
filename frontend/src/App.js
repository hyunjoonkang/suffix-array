import SuffixArrayVisualizer from "./components/SuffixArrayVisualizer";
import "./index.css";

function App() {
  return (
    <div className="App">
      <h1>Suffix Array Visualizer</h1>{" "}
      {/* 이 줄 추가 - 화면에 뭐라도 보이는지 테스트 */}
      <SuffixArrayVisualizer />
    </div>
  );
}

export default App;
