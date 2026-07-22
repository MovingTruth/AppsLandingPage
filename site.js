(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toggle = document.querySelector('.site-nav__toggle');
  var links = document.getElementById('site-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
      links.dataset.open = String(open);
    });
    links.addEventListener('click', function (event) {
      if (event.target.tagName !== 'A') return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.sr-only').textContent = 'Open navigation';
      links.dataset.open = 'false';
    });
  }

  if (!reduceMotion) {
    var container = document.getElementById('motes');
    for (var index = 0; container && index < 15; index += 1) {
      var mote = document.createElement('span');
      var duration = Math.max(8, 24 - (8 + ((index * 3.1) % 18)) * 0.55);
      mote.className = 'mote';
      mote.style.left = ((((index * 0.137 + 0.05) % 0.94) + 0.03) * 100) + '%';
      mote.style.width = (2 + ((index * 0.37) % 2)) + 'px';
      mote.style.height = mote.style.width;
      mote.style.animationDuration = duration + 's';
      mote.style.animationDelay = -((index * 1.37) % duration) + 's';
      mote.style.setProperty('--mote-opacity', (0.18 + (index % 5) * 0.045).toFixed(2));
      container.appendChild(mote);
    }
  }

  (function drawCornerSpirals() {
    var svg = document.getElementById('corner-spirals');
    if (!svg) return;

    function draw() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var radius = Math.min(width, height) * 0.2;
      var corners = [[0,0,.75],[width,0,.25],[0,height,1.25],[width,height,1.75]];
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.replaceChildren();
      corners.forEach(function (corner) {
        var data = '';
        for (var step = 0; step <= 72; step += 1) {
          var progress = step / 72;
          var angle = corner[2] * Math.PI + progress * Math.PI * 3.2;
          var distance = progress * radius;
          var x = corner[0] + Math.cos(angle) * distance;
          var y = corner[1] + Math.sin(angle) * distance;
          data += (step === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
        }
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', data.trim());
        svg.appendChild(path);
      });
    }

    var timer;
    draw();
    window.addEventListener('resize', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 180);
    });
  })();
})();
