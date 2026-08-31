(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function setupCanvas(canvas, logicalWidth, logicalHeight) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var canvas = byId('green-canvas');
    var ctx = setupCanvas(canvas, Putting.game.CANVAS_WIDTH, Putting.game.CANVAS_HEIGHT);

    var dom = {
      totalScoreValue: byId('total-score-value'),
      scorecard: byId('scorecard'),
      stage: byId('stage'),
      holeProgress: byId('hole-progress'),
      statDistance: byId('stat-distance'),
      statSlope: byId('stat-slope'),
      statElevation: byId('stat-elevation'),
      powerMeter: byId('power-meter'),
      powerFill: byId('power-fill'),
      resultBanner: byId('result-banner'),
      resultLabel: byId('result-label'),
      resultPoints: byId('result-points'),
      nextBtn: byId('next-btn'),
      menuScreen: byId('menu-screen'),
      startBtn: byId('start-btn'),
      gameOverScreen: byId('game-over-screen'),
      finalScoreValue: byId('final-score-value'),
      gradeBadge: byId('grade-badge'),
      tauntQuote: byId('taunt-quote'),
      restartBtn: byId('restart-btn'),
      shareBtn: byId('share-btn'),
      shareFeedback: byId('share-feedback'),
      toast: byId('toast'),
    };

    Putting.game.init(dom);

    Putting.input.attach(canvas, {
      canDrag: Putting.game.canDrag,
      getBall: Putting.game.getBall,
      onDragStart: Putting.game.onDragStart,
      onDragMove: Putting.game.onDragMove,
      onDragEnd: Putting.game.onDragEnd,
    });

    dom.startBtn.addEventListener('click', Putting.game.startRound);
    dom.nextBtn.addEventListener('click', Putting.game.onNextClicked);
    dom.restartBtn.addEventListener('click', Putting.game.startGame);
    dom.shareBtn.addEventListener('click', Putting.game.onShareClicked);

    var lastTime = null;
    function loop(timestamp) {
      if (lastTime === null) {
        lastTime = timestamp;
      }
      var dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      Putting.game.tick(dt);
      Putting.game.render(ctx);

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
})();
