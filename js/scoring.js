var Putting = window.Putting || {};

Putting.scoring = (function () {
  function scoreForResult(result) {
    if (result.holed) {
      return { points: 100, label: '홀인!', tier: 'holed' };
    }

    var d = result.finalDistanceM;

    if (d <= 0.3) {
      return { points: 70, label: '아깝다! 탭인 거리예요', tier: 'close' };
    }
    if (d <= 0.8) {
      return { points: 40, label: '아쉬워요', tier: 'close' };
    }
    if (d <= 1.5) {
      return { points: 20, label: '조금 멀리 빠졌어요', tier: 'near' };
    }
    return { points: 0, label: '많이 빗나갔어요', tier: 'miss' };
  }

  var GRADES = [
    { min: 95, emoji: '🏆', percentile: 1, quote: '이건 거의 프로 아니야?', shareTaunt: '이걸 이길 수 있으면 인정한다 🔥' },
    { min: 85, emoji: '🥇', percentile: 5, quote: '필드 나가도 되겠는데?', shareTaunt: '너 이거 이길 자신 있어?' },
    { min: 70, emoji: '🥈', percentile: 23, quote: '퍼팅 좀 하는데?', shareTaunt: '너는 나보다 잘할 수 있어? 😏' },
    { min: 50, emoji: '🥉', percentile: 45, quote: '이 정도면 나쁘지 않지?', shareTaunt: '너도 한번 해볼래?' },
    { min: 30, emoji: '⛳', percentile: 70, quote: '다음엔 더 잘할 수 있을 듯', shareTaunt: '너는 나보다 잘할 수 있지 않을까?' },
    { min: 0, emoji: '🌱', percentile: 95, quote: '이제 시작이지 뭐', shareTaunt: '그래도 재밌지 않아? 같이 해보자' },
  ];

  function gradeForSkillScore(skillScore) {
    for (var i = 0; i < GRADES.length; i++) {
      if (skillScore >= GRADES[i].min) {
        return GRADES[i];
      }
    }
    return GRADES[GRADES.length - 1];
  }

  return {
    scoreForResult: scoreForResult,
    gradeForSkillScore: gradeForSkillScore,
  };
})();

window.Putting = Putting;
