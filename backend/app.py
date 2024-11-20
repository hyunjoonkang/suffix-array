# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def calculate_suffix_array(s):
    n = len(s)
    rank = [ord(c) for c in s]
    rank.append(-1)
    sa = list(range(n))
    steps = []
    
    # 초기화 단계 저장
    steps.append({
        "phase": "초기화",
        "k": 0,
        "ranks": rank[:-1],
        "pairs": None,
        "sortedPairs": None,
        "description": "첫 글자를 기준으로 초기 순위 부여"
    })
    
    k = 1
    while k < n:
        # Pair 생성
        pairs = []
        for i in range(n):
            next_rank = rank[i + k] if i + k < n else -1
            pairs.append({
                "pair": [rank[i], next_rank],
                "index": i,
                "suffix": s[i:]
            })
            
        steps.append({
            "phase": "페어 생성",
            "k": k,
            "ranks": rank[:-1],
            "pairs": pairs,
            "sortedPairs": None,
            "description": f"k={k}일 때의 페어 생성"
        })
        
        # Pair 정렬
        pairs.sort(key=lambda x: (x["pair"][0], x["pair"][1]))
        
        steps.append({
            "phase": "페어 정렬",
            "k": k,
            "ranks": rank[:-1],
            "pairs": pairs,
            "sortedPairs": pairs,
            "description": "페어를 기준으로 정렬"
        })
        
        # 새로운 순위 부여
        new_rank = [0] * (n + 1)
        new_rank[pairs[0]["index"]] = 0
        rank_value = 0
        
        for i in range(1, n):
            if (pairs[i]["pair"][0] != pairs[i-1]["pair"][0] or 
                pairs[i]["pair"][1] != pairs[i-1]["pair"][1]):
                rank_value += 1
            new_rank[pairs[i]["index"]] = rank_value
            
        if rank_value == n - 1:
            break
            
        rank = new_rank
        
        steps.append({
            "phase": "순위 갱신",
            "k": k,
            "ranks": rank[:-1],
            "pairs": pairs,
            "sortedPairs": pairs,
            "description": "새로운 순위 부여 완료"
        })
        
        k *= 2
    
    return steps

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    input_string = data.get('input', '')
    
    if not input_string:
        return jsonify({"error": "입력 문자열이 필요합니다"}), 400
        
    steps = calculate_suffix_array(input_string)
    return jsonify({"steps": steps})

if __name__ == '__main__':
    app.run(debug=True, port=5000)