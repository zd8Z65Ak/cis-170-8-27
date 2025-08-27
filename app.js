// Slope Formula App - vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  const equationEl = document.getElementById('equation');
  const coordinateEl = document.getElementById('coordinate');
  const resultEl = document.getElementById('result');
  const slopeEl = document.getElementById('slopeValue');
  const interceptEl = document.getElementById('interceptValue');
  const newBtn = document.getElementById('newBtn');
  const expander = document.getElementById('answerExpander');
  const summaryText = document.getElementById('summaryText');

  const canvas = document.getElementById('graph');
  const ctx = canvas.getContext('2d');

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Problem state
  let m = 1, b = 0, x = 0, y = 0, isOnLine = true;

  function formatEquation(m, b) {
    const mStr = (m === 1) ? 'x' : (m === -1) ? '-x' : `${m}x`;
    const bStr = (b === 0) ? '' : (b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`);
    return `y = ${mStr}${bStr}`;
  }

  function generateProblem() {
    // pick slope and intercept
  m = getRandomInt(-5, 5);
  b = getRandomInt(-5, 5);

    // coordinate ranges
    const MIN_COORD = -10;
    const MAX_COORD = 10;

    // pick whether the point should be on the line (~50%)
    isOnLine = Math.random() < 0.5;

    if (isOnLine) {
      // try to find an x in range that produces a y in range
      let attempts = 0;
      let found = false;
      while (attempts < 200 && !found) {
        x = getRandomInt(MIN_COORD, MAX_COORD);
        y = m * x + b;
        if (y >= MIN_COORD && y <= MAX_COORD) {
          found = true;
          break;
        }
        attempts++;
      }
      // if we couldn't find a matching on-line coordinate, fall back to an off-line point
      if (!found) {
        isOnLine = false;
      }
    }

    if (!isOnLine) {
      // generate an off-line point while keeping coordinates in range
      let attempts = 0;
      let placed = false;
      while (attempts < 200 && !placed) {
        x = getRandomInt(MIN_COORD, MAX_COORD);
        const yTrue = m * x + b;
        // try small offsets that keep y within range
        const offsets = [1, -1, 2, -2, 3, -3, 4, -4];
        for (let off of offsets) {
          const candidate = yTrue + off;
          if (candidate >= MIN_COORD && candidate <= MAX_COORD) {
            y = candidate;
            placed = true;
            break;
          }
        }
        attempts++;
      }
      // last-resort: pick a random coordinate in range that is not exactly on the line
      if (!placed) {
        x = getRandomInt(MIN_COORD, MAX_COORD);
        // pick y in range and ensure it's not equal to yTrue
        let yCandidate = getRandomInt(MIN_COORD, MAX_COORD);
        const yTrue = m * x + b;
        if (yCandidate === yTrue) {
          yCandidate = (yCandidate < MAX_COORD) ? yCandidate + 1 : yCandidate - 1;
        }
        y = yCandidate;
      }
    }

    equationEl.textContent = formatEquation(m, b);
    coordinateEl.textContent = `${x}, ${y}`;
    slopeEl.textContent = m;
    interceptEl.textContent = b;
    resultEl.textContent = '';
    summaryText.textContent = 'Select your answer';
    expander.open = false;

    drawGraph();
  }

  function checkAnswer(userAnswer) {
    if (!userAnswer) {
      resultEl.textContent = 'Please pick Yes or No.';
      return;
    }
    const correct = (isOnLine && userAnswer === 'yes') || (!isOnLine && userAnswer === 'no');
    resultEl.textContent = correct ? 'Correct!' : 'Incorrect.';
    // update summary
    summaryText.textContent = `You answered: ${userAnswer.toUpperCase()}`;
    // briefly show result then auto-generate next
    setTimeout(generateProblem, 1400);
  }

  // Graphing
  function drawAxes(ctx, w, h, originX, originY, scale) {
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(w, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, h);
    ctx.stroke();

    // ticks
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    for (let u = -Math.floor(originX/scale); u <= Math.floor((w-originX)/scale); u++) {
      const tx = originX + u * scale;
      ctx.beginPath();
      ctx.moveTo(tx, originY - 4);
      ctx.lineTo(tx, originY + 4);
      ctx.stroke();
      if (u !== 0) ctx.fillText(u.toString(), tx - 6, originY + 14);
    }
    for (let v = -Math.floor(originY/scale); v <= Math.floor((h-originY)/scale); v++) {
      const ty = originY - v * scale;
      ctx.beginPath();
      ctx.moveTo(originX - 4, ty);
      ctx.lineTo(originX + 4, ty);
      ctx.stroke();
      if (v !== 0) ctx.fillText(v.toString(), originX + 6, ty + 4);
    }
  }

  function drawGraph() {
    const w = canvas.width;
    const h = canvas.height;
    // white background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    const originX = Math.floor(w / 2);
    const originY = Math.floor(h / 2);
    const scale = 24; // pixels per unit

    drawAxes(ctx, w, h, originX, originY, scale);

    // draw line y = m x + b
    ctx.strokeStyle = '#0074D9';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // compute y at left and right edges
    const xLeft = -(originX / scale);
    const xRight = (w - originX) / scale;
    const yLeft = m * xLeft + b;
    const yRight = m * xRight + b;

    const pxLeft = originX + xLeft * scale;
    const pyLeft = originY - yLeft * scale;
    const pxRight = originX + xRight * scale;
    const pyRight = originY - yRight * scale;

    ctx.moveTo(pxLeft, pyLeft);
    ctx.lineTo(pxRight, pyRight);
    ctx.stroke();

  // Note: do NOT draw the coordinate or label on the graph.
  // The coordinate is shown in the UI (`#coordinate`) and the user
  // must determine if it lies on the line themselves.
  }

  // wire up answer buttons
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      checkAnswer(val);
    });
  });

  newBtn.addEventListener('click', generateProblem);

  // initial
  generateProblem();
});
