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

  return {
    scoreForResult: scoreForResult,
  };
})();

window.Putting = Putting;
