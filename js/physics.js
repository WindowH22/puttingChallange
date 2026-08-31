var Putting = window.Putting || {};

Putting.physics = (function () {
  var METERS_TO_PIXELS = 45;
  var BALL_RADIUS = 6;
  var HOLE_RADIUS = 11;

  var FRICTION_DECEL = 140; // px/s^2, constant rolling resistance
  var SLOPE_ACCEL = 70; // px/s^2 per unit slope strength (left/right break)
  var ELEVATION_ACCEL = 55; // px/s^2 per unit elevation strength (uphill/downhill)
  var STOP_SPEED = 8; // px/s, below this the ball is considered stopped
  var CAPTURE_SPEED_LIMIT = 260; // px/s, faster than this and it lips out instead of dropping

  var MAX_DRAG_PX = 160;
  var MAX_SHOT_SPEED = 450; // px/s at full pull-back

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function speedFromDrag(dragPx) {
    var clamped = Math.min(dragPx, MAX_DRAG_PX);
    return (clamped / MAX_DRAG_PX) * MAX_SHOT_SPEED;
  }

  function launchVelocity(ball, dragVector) {
    var dragDist = Math.hypot(dragVector.x, dragVector.y);
    if (dragDist < 1) {
      return { vx: 0, vy: 0 };
    }
    var speed = speedFromDrag(dragDist);
    var shotX = -dragVector.x / dragDist;
    var shotY = -dragVector.y / dragDist;
    return { vx: shotX * speed, vy: shotY * speed };
  }

  function stepBall(ball, hole, dt) {
    var speed = Math.hypot(ball.vx, ball.vy);

    if (!ball.moving || speed <= STOP_SPEED) {
      return { x: ball.x, y: ball.y, vx: 0, vy: 0, moving: false };
    }

    var frictionDecel = FRICTION_DECEL * dt;
    var newSpeed = Math.max(0, speed - frictionDecel);
    var scale = newSpeed / speed;
    var vx = ball.vx * scale;
    var vy = ball.vy * scale;

    vx += hole.slopeDirection * hole.slopeStrength * SLOPE_ACCEL * dt;
    vy += hole.elevationDirection * hole.elevationMeters * ELEVATION_ACCEL * dt;

    var x = ball.x + vx * dt;
    var y = ball.y + vy * dt;

    var nextSpeed = Math.hypot(vx, vy);
    var moving = nextSpeed > STOP_SPEED;

    return {
      x: x,
      y: y,
      vx: moving ? vx : 0,
      vy: moving ? vy : 0,
      moving: moving,
    };
  }

  function checkCapture(ball, holeScreen) {
    var d = distance(ball.x, ball.y, holeScreen.x, holeScreen.y);
    var speed = Math.hypot(ball.vx, ball.vy);
    if (d <= HOLE_RADIUS && speed <= CAPTURE_SPEED_LIMIT) {
      return true;
    }
    return false;
  }

  function pixelsToMeters(px) {
    return px / METERS_TO_PIXELS;
  }

  return {
    METERS_TO_PIXELS: METERS_TO_PIXELS,
    BALL_RADIUS: BALL_RADIUS,
    HOLE_RADIUS: HOLE_RADIUS,
    MAX_DRAG_PX: MAX_DRAG_PX,
    launchVelocity: launchVelocity,
    speedFromDrag: speedFromDrag,
    stepBall: stepBall,
    checkCapture: checkCapture,
    distance: distance,
    pixelsToMeters: pixelsToMeters,
  };
})();

window.Putting = Putting;
