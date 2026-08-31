var Putting = window.Putting || {};

Putting.game = (function () {
  var physics = Putting.physics;
  var levels = Putting.levels;
  var scoring = Putting.scoring;

  var CANVAS_WIDTH = 420;
  var CANVAS_HEIGHT = 560;
  var BALL_START = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };

  var dom = null;
  var state = null;

  function createHoleScreen(hole) {
    return {
      x: BALL_START.x,
      y: BALL_START.y - hole.distance * physics.METERS_TO_PIXELS,
    };
  }

  function freshBall() {
    return { x: BALL_START.x, y: BALL_START.y, vx: 0, vy: 0, moving: false };
  }

  function setScreen(name) {
    state.screen = name;
    syncScreenVisibility();
  }

  function syncScreenVisibility() {
    dom.menuScreen.classList.toggle('is-visible', state.screen === 'menu');
    dom.gameOverScreen.classList.toggle('is-visible', state.screen === 'gameOver');

    var playing = state.screen === 'aiming' || state.screen === 'putting' || state.screen === 'result';
    dom.scorecard.classList.toggle('is-visible', playing);
    dom.stage.classList.toggle('is-visible', playing);

    dom.nextBtn.classList.toggle('is-visible', state.screen === 'result');
    dom.resultBanner.classList.toggle('is-visible', state.screen === 'result');
    dom.powerMeter.style.opacity = state.screen === 'aiming' ? '1' : '0';
  }

  function startGame() {
    state = {
      screen: 'menu',
      holeIndex: 0,
      holes: levels.generateHoles(),
      currentHole: null,
      holeScreen: BALL_START,
      ballStart: BALL_START,
      ball: freshBall(),
      drag: null,
      totalScore: 0,
      lastResult: null,
    };
    dom.totalScoreValue.textContent = '0';
    dom.shareFeedback.classList.remove('is-visible');
    dom.toast.classList.remove('is-visible');
    setScreen('menu');
  }

  function startRound() {
    state.holeIndex = 0;
    state.totalScore = 0;
    dom.totalScoreValue.textContent = '0';
    startHole();
  }

  function startHole() {
    var hole = state.holes[state.holeIndex];

    state.currentHole = hole;
    state.holeScreen = createHoleScreen(hole);
    state.ball = freshBall();
    state.drag = null;
    state.lastResult = null;

    dom.holeProgress.textContent = '홀 ' + (state.holeIndex + 1) + ' / ' + levels.TOTAL_HOLES;
    dom.statDistance.textContent = hole.distance.toFixed(1) + 'm';
    dom.statSlope.textContent = levels.slopeText(hole);
    dom.statElevation.textContent = levels.elevationText(hole);
    dom.powerFill.style.width = '0%';

    setScreen('aiming');
  }

  function onDragStart() {
    state.drag = { vector: { x: 0, y: 0 } };
  }

  function onDragMove(vector, power) {
    if (!state.drag) {
      return;
    }
    state.drag.vector = vector;
    dom.powerFill.style.width = Math.round(power * 100) + '%';
  }

  function onDragEnd(vector) {
    if (!state.drag) {
      return;
    }
    state.drag = null;
    var dragDist = Math.hypot(vector.x, vector.y);
    if (dragDist < 6) {
      dom.powerFill.style.width = '0%';
      return;
    }
    var launch = physics.launchVelocity(state.ball, vector);
    state.ball = {
      x: state.ball.x,
      y: state.ball.y,
      vx: launch.vx,
      vy: launch.vy,
      moving: true,
    };
    setScreen('putting');
  }

  function finalizeResult(holed) {
    var finalDistancePx = holed ? 0 : physics.distance(state.ball.x, state.ball.y, state.holeScreen.x, state.holeScreen.y);
    var finalDistanceM = physics.pixelsToMeters(finalDistancePx);
    var result = scoring.scoreForResult({ holed: holed, finalDistanceM: finalDistanceM });

    state.lastResult = result;
    state.totalScore += result.points;

    dom.totalScoreValue.textContent = String(state.totalScore);
    dom.resultLabel.textContent = result.label;
    dom.resultPoints.textContent = '+' + result.points;
    dom.resultBanner.setAttribute('data-tier', result.tier);

    setScreen('result');
  }

  function skillScoreFromTotal() {
    return Math.round(state.totalScore / levels.TOTAL_HOLES);
  }

  function onNextClicked() {
    state.holeIndex += 1;
    if (state.holeIndex >= levels.TOTAL_HOLES) {
      var skillScore = skillScoreFromTotal();
      var grade = scoring.gradeForSkillScore(skillScore);

      dom.finalScoreValue.textContent = String(skillScore);
      dom.gradeBadge.textContent = grade.emoji + ' 상위 ' + grade.percentile + '%';
      dom.tauntQuote.textContent = '"' + grade.quote + '"';
      dom.shareFeedback.classList.remove('is-visible');
      setScreen('gameOver');
      return;
    }
    startHole();
  }

  function tick(dt) {
    if (state.screen !== 'putting') {
      return;
    }
    var next = physics.stepBall(state.ball, state.currentHole, dt);
    state.ball = next;

    var holed = physics.checkCapture(next, state.holeScreen);
    if (holed) {
      finalizeResult(true);
      return;
    }
    if (!next.moving) {
      finalizeResult(false);
    }
  }

  function render(ctx) {
    Putting.render.draw(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state);
  }

  var TOAST_DURATION_MS = 2000;
  var toastTimer = null;

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      dom.toast.classList.remove('is-visible');
    }, TOAST_DURATION_MS);
  }

  function showShareFeedback(message) {
    dom.shareFeedback.textContent = message;
    dom.shareFeedback.classList.add('is-visible');
  }

  var CLIPBOARD_TIMEOUT_MS = 1500;

  function legacyCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      success = false;
    }
    document.body.removeChild(textarea);
    return success;
  }

  function copyToClipboard(fullText) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      if (legacyCopy(fullText)) {
        showToast('링크가 복사되었어요!');
      } else {
        showShareFeedback(fullText);
      }
      return;
    }

    var settled = false;
    function finish(success) {
      if (settled) {
        return;
      }
      settled = true;
      if (success) {
        showToast('링크가 복사되었어요!');
      } else {
        showShareFeedback(fullText);
      }
    }

    navigator.clipboard
      .writeText(fullText)
      .then(function () {
        finish(true);
      })
      .catch(function () {
        finish(false);
      });

    setTimeout(function () {
      finish(false);
    }, CLIPBOARD_TIMEOUT_MS);
  }

  var SHARE_URL = 'https://puttingchallange.vercel.app/';

  function onShareClicked() {
    var skillScore = skillScoreFromTotal();
    var grade = scoring.gradeForSkillScore(skillScore);

    var text =
      '🏌️ 내 퍼팅 점수 ' +
      skillScore +
      '점 / 상위 ' +
      grade.percentile +
      '%\n' +
      grade.shareTaunt +
      '\n👉 퍼팅 테스트 해보기\n' +
      SHARE_URL;
    copyToClipboard(text);
  }

  function init(domRefs) {
    dom = domRefs;
    startGame();
  }

  return {
    CANVAS_WIDTH: CANVAS_WIDTH,
    CANVAS_HEIGHT: CANVAS_HEIGHT,
    init: init,
    tick: tick,
    render: render,
    startGame: startGame,
    startRound: startRound,
    onDragStart: onDragStart,
    onDragMove: onDragMove,
    onDragEnd: onDragEnd,
    onNextClicked: onNextClicked,
    onShareClicked: onShareClicked,
    canDrag: function () {
      return state.screen === 'aiming';
    },
    getBall: function () {
      return state.ball;
    },
  };
})();

window.Putting = Putting;
