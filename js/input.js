var Putting = window.Putting || {};

Putting.input = (function () {
  var physics = Putting.physics;
  var GRAB_RADIUS = 42;

  function attach(canvas, handlers) {
    var dragging = false;
    var startX = 0;
    var startY = 0;

    function canvasPoint(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = Putting.game.CANVAS_WIDTH / rect.width;
      var scaleY = Putting.game.CANVAS_HEIGHT / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function touchOf(evt) {
      return evt.touches.length > 0 ? evt.touches[0] : evt.changedTouches[0];
    }

    function beginDrag(clientX, clientY) {
      if (!handlers.canDrag()) {
        return false;
      }
      var point = canvasPoint(clientX, clientY);
      var ball = handlers.getBall();
      if (physics.distance(point.x, point.y, ball.x, ball.y) > GRAB_RADIUS) {
        return false;
      }
      dragging = true;
      startX = ball.x;
      startY = ball.y;
      canvas.classList.add('is-dragging');
      handlers.onDragStart();
      return true;
    }

    function updateDrag(clientX, clientY) {
      if (!dragging) {
        return;
      }
      var point = canvasPoint(clientX, clientY);
      var vector = { x: point.x - startX, y: point.y - startY };
      var dragDist = Math.min(Math.hypot(vector.x, vector.y), physics.MAX_DRAG_PX);
      var power = dragDist / physics.MAX_DRAG_PX;
      handlers.onDragMove(vector, power);
    }

    function endDrag(clientX, clientY) {
      if (!dragging) {
        return;
      }
      dragging = false;
      canvas.classList.remove('is-dragging');
      var point = canvasPoint(clientX, clientY);
      var vector = { x: point.x - startX, y: point.y - startY };
      handlers.onDragEnd(vector);
    }

    function onMouseDown(evt) {
      beginDrag(evt.clientX, evt.clientY);
    }

    function onMouseMove(evt) {
      updateDrag(evt.clientX, evt.clientY);
    }

    function onMouseUp(evt) {
      endDrag(evt.clientX, evt.clientY);
    }

    function onTouchStart(evt) {
      var touch = touchOf(evt);
      if (beginDrag(touch.clientX, touch.clientY)) {
        evt.preventDefault();
      }
    }

    function onTouchMove(evt) {
      if (!dragging) {
        return;
      }
      var touch = touchOf(evt);
      updateDrag(touch.clientX, touch.clientY);
      evt.preventDefault();
    }

    function onTouchEnd(evt) {
      if (!dragging) {
        return;
      }
      var touch = touchOf(evt);
      endDrag(touch.clientX, touch.clientY);
      evt.preventDefault();
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });
  }

  return {
    attach: attach,
  };
})();

window.Putting = Putting;
