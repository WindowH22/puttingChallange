var Putting = window.Putting || {};

Putting.render = (function () {
  var physics = Putting.physics;

  var GRID_SPACING = 35;

  function drawGreen(ctx, width, height) {
    var gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3f8f5b');
    gradient.addColorStop(1, '#2f6f45');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (var y = 0; y < height; y += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (var x = 0; x < width; x += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  var FLOW_MAX_MAGNITUDE = Math.hypot(0.65, 0.5);

  function drawFlowArrow(ctx, hole, ballStart, holeScreen) {
    if (!hole) {
      return;
    }
    var flowX = hole.slopeDirection * hole.slopeStrength;
    var flowY = hole.elevationDirection * hole.elevationMeters;
    var magnitude = Math.hypot(flowX, flowY);

    var centerX = holeScreen.x + 95;
    var centerY = (ballStart.y + holeScreen.y) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 27, 0, Math.PI * 2);
    ctx.fill();

    if (magnitude < 0.03) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('평지', centerX, centerY);
      ctx.restore();
      return;
    }

    var dirX = flowX / magnitude;
    var dirY = flowY / magnitude;
    var ratio = Math.min(magnitude / FLOW_MAX_MAGNITUDE, 1);
    var length = 14 + ratio * 20;

    var tipX = centerX + dirX * length;
    var tipY = centerY + dirY * length;
    var tailX = centerX - dirX * length;
    var tailY = centerY - dirY * length;

    ctx.strokeStyle = '#ffd54a';
    ctx.fillStyle = '#ffd54a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    var headSize = 6 + ratio * 3;
    var perpX = -dirY;
    var perpY = dirX;
    ctx.beginPath();
    ctx.moveTo(tipX + dirX * headSize, tipY + dirY * headSize);
    ctx.lineTo(tipX - dirX * headSize * 0.4 + perpX * headSize * 0.7, tipY - dirY * headSize * 0.4 + perpY * headSize * 0.7);
    ctx.lineTo(tipX - dirX * headSize * 0.4 - perpX * headSize * 0.7, tipY - dirY * headSize * 0.4 - perpY * headSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawHole(ctx, holeScreen) {
    ctx.save();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(holeScreen.x + 10, holeScreen.y - 4);
    ctx.lineTo(holeScreen.x + 10, holeScreen.y - 60);
    ctx.stroke();

    ctx.fillStyle = '#e0483b';
    ctx.beginPath();
    ctx.moveTo(holeScreen.x + 10, holeScreen.y - 60);
    ctx.lineTo(holeScreen.x + 34, holeScreen.y - 52);
    ctx.lineTo(holeScreen.x + 10, holeScreen.y - 44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#173318';
    ctx.beginPath();
    ctx.ellipse(holeScreen.x, holeScreen.y, physics.HOLE_RADIUS, physics.HOLE_RADIUS * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawBall(ctx, ball) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + physics.BALL_RADIUS * 0.6, physics.BALL_RADIUS * 1.1, physics.BALL_RADIUS * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();

    var gradient = ctx.createRadialGradient(
      ball.x - 2,
      ball.y - 2,
      1,
      ball.x,
      ball.y,
      physics.BALL_RADIUS
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#dcdcdc');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, physics.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawAimLine(ctx, ball, dragVector) {
    var dragDist = Math.hypot(dragVector.x, dragVector.y);
    if (dragDist < 4) {
      return;
    }
    var clamped = Math.min(dragDist, physics.MAX_DRAG_PX);
    var dirX = -dragVector.x / dragDist;
    var dirY = -dragVector.y / dragDist;
    var lineLength = clamped * 1.6;

    ctx.save();
    ctx.setLineDash([6, 7]);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + dirX * lineLength, ball.y + dirY * lineLength);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(ball.x - dragVector.x, ball.y - dragVector.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw(ctx, width, height, state) {
    drawGreen(ctx, width, height);
    drawFlowArrow(ctx, state.currentHole, state.ballStart, state.holeScreen);
    drawHole(ctx, state.holeScreen);

    if (state.screen === 'aiming' && state.drag) {
      drawAimLine(ctx, state.ball, state.drag.vector);
    }

    drawBall(ctx, state.ball);
  }

  return {
    draw: draw,
  };
})();

window.Putting = Putting;
