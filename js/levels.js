var Putting = window.Putting || {};

Putting.levels = (function () {
  var TOTAL_HOLES = 6;

  function lerp(min, max, t) {
    return min + (max - min) * t;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  function generateHole(index) {
    var t = index / (TOTAL_HOLES - 1);

    var distanceMin = lerp(1.8, 4.5, t);
    var distanceMax = lerp(3.2, 8.5, t);
    var slopeMax = lerp(0.15, 0.65, t);
    var elevationMax = lerp(0.15, 0.5, t);

    var distance = randomBetween(distanceMin, distanceMax);
    var slopeStrength = randomBetween(0, slopeMax);
    var elevationMeters = randomBetween(0.05, elevationMax);

    return {
      index: index,
      distance: Math.round(distance * 10) / 10,
      slopeStrength: Math.round(slopeStrength * 100) / 100,
      slopeDirection: randomSign(),
      elevationMeters: Math.round(elevationMeters * 10) / 10,
      elevationDirection: randomSign(),
    };
  }

  function generateHoles() {
    var holes = [];
    for (var i = 0; i < TOTAL_HOLES; i++) {
      holes.push(generateHole(i));
    }
    return holes;
  }

  function slopeText(hole) {
    if (hole.slopeStrength < 0.05) {
      return '경사 거의 없음';
    }
    var side = hole.slopeDirection < 0 ? '왼쪽' : '오른쪽';
    var intensity = hole.slopeStrength < 0.25 ? '약간' : hole.slopeStrength < 0.45 ? '보통' : '심하게';
    return side + '으로 ' + intensity + ' 흐름';
  }

  function elevationText(hole) {
    if (hole.elevationMeters < 0.05) {
      return '평지';
    }
    var kind = hole.elevationDirection > 0 ? '오르막' : '내리막';
    return kind + ' ' + hole.elevationMeters.toFixed(1) + 'm';
  }

  return {
    TOTAL_HOLES: TOTAL_HOLES,
    generateHoles: generateHoles,
    slopeText: slopeText,
    elevationText: elevationText,
  };
})();

window.Putting = Putting;
