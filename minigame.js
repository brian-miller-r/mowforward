(() => {
  const canvas = document.querySelector("#mowing-game");
  if (!canvas) return;

  const scoreEl = document.querySelector("#game-score");
  const timeEl = document.querySelector("#game-time");
  const statusEl = document.querySelector("#game-status");
  const startButton = document.querySelector("#game-start");
  const gameModal = document.querySelector("#hidden-game-modal");
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false });

  if (!gl) {
    statusEl.textContent = "This browser needs WebGL to play the 3D minigame.";
    startButton.disabled = true;
    return;
  }

  const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    uniform mat4 u_matrix;
    varying vec3 v_color;
    void main() {
      gl_Position = u_matrix * vec4(a_position, 1.0);
      v_color = a_color;
    }
  `;
  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() { gl_FragColor = vec4(v_color, 1.0); }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const colorLocation = gl.getAttribLocation(program, "a_color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  const cubePositions = new Float32Array([
    -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,  0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
     0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,   0.5,-0.5,-0.5, -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,
    -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,
    -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5,  -0.5,-0.5,-0.5,  0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,
     0.5,-0.5, 0.5,  0.5,-0.5,-0.5,  0.5, 0.5,-0.5,   0.5,-0.5, 0.5,  0.5, 0.5,-0.5,   0.5, 0.5, 0.5,
    -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5,  -0.5,-0.5,-0.5, -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const m4 = {
    multiply(a, b) {
      const out = new Float32Array(16);
      for (let column = 0; column < 4; column += 1) {
        for (let row = 0; row < 4; row += 1) {
          out[column * 4 + row] = a[row] * b[column * 4]
            + a[4 + row] * b[column * 4 + 1]
            + a[8 + row] * b[column * 4 + 2]
            + a[12 + row] * b[column * 4 + 3];
        }
      }
      return out;
    },
    translation(x, y, z) { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]); },
    scaling(x, y, z) { return new Float32Array([x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1]); },
    rotationY(angle) {
      const c = Math.cos(angle); const s = Math.sin(angle);
      return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
    },
    perspective(fieldOfView, aspect, near, far) {
      const f = 1 / Math.tan(fieldOfView / 2);
      const range = 1 / (near - far);
      return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(near + far) * range,-1, 0,0,near * far * range * 2,0]);
    },
    lookAt(eye, center, up) {
      let zx = eye[0] - center[0]; let zy = eye[1] - center[1]; let zz = eye[2] - center[2];
      const zLength = Math.hypot(zx, zy, zz) || 1; zx /= zLength; zy /= zLength; zz /= zLength;
      let xx = up[1] * zz - up[2] * zy; let xy = up[2] * zx - up[0] * zz; let xz = up[0] * zy - up[1] * zx;
      const xLength = Math.hypot(xx, xy, xz) || 1; xx /= xLength; xy /= xLength; xz /= xLength;
      const yx = zy * xz - zz * xy; const yy = zz * xx - zx * xz; const yz = zx * xy - zy * xx;
      return new Float32Array([
        xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0,
        -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
        -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
        -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1,
      ]);
    },
  };

  const LAWN = { left: -13, right: 13, near: -44, far: 10, cell: 1.35, cols: 19, rows: 40 };
  const mower = { x: 0, z: -5.8, angle: 0 };
  let grassCells = [];
  let cutCells = 0;
  let timeLeft = 90;
  let playing = false;
  let lastFrame = 0;
  const keys = new Set();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const cutPercent = () => Math.floor((cutCells / grassCells.length) * 100);

  const colorData = (color) => {
    const shades = [1, .62, 1.15, .42, .78, .58];
    const out = new Float32Array(36 * 3);
    for (let face = 0; face < 6; face += 1) {
      for (let vertex = 0; vertex < 6; vertex += 1) {
        const offset = (face * 6 + vertex) * 3;
        out[offset] = Math.min(1, color[0] * shades[face]);
        out[offset + 1] = Math.min(1, color[1] * shades[face]);
        out[offset + 2] = Math.min(1, color[2] * shades[face]);
      }
    }
    return out;
  };

  function drawCube(matrix, color) {
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorData(color), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

  function box(viewProjection, x, y, z, width, height, depth, color, angle = 0) {
    const model = m4.multiply(m4.translation(x, y, z), m4.multiply(m4.rotationY(angle), m4.scaling(width, height, depth)));
    drawCube(m4.multiply(viewProjection, model), color);
  }

  function localBox(viewProjection, parent, x, y, z, width, height, depth, color, angle = 0) {
    const model = m4.multiply(parent, m4.multiply(m4.translation(x, y, z), m4.multiply(m4.rotationY(angle), m4.scaling(width, height, depth))));
    drawCube(m4.multiply(viewProjection, model), color);
  }

  function drawLawn(viewProjection) {
    box(viewProjection, 0, -.15, -17, 27.4, .3, 56, [.12,.42,.12]);
    grassCells.forEach((cell) => {
      const variation = ((cell.col * 7 + cell.row * 3) % 4) * .012;
      const color = cell.cut
        ? [.27 + variation, .55 + variation, .19 + variation]
        : [.075 + variation, .34 + variation, .075 + variation];
      box(viewProjection, cell.x, cell.cut ? .012 : .085, cell.z, LAWN.cell - .035, cell.cut ? .03 : .17, LAWN.cell - .035, color);
      if (cell.cut && cell.row % 4 === 0) {
        box(viewProjection, cell.x, .035, cell.z, LAWN.cell - .08, .012, .08, [.42,.67,.29]);
      }
    });
  }

  function drawFence(viewProjection) {
    [-14.35, 14.35].forEach((x) => {
      box(viewProjection, x, 1.35, -17, .2, 2.7, 55.3, [.53,.36,.17]);
      box(viewProjection, x, .86, -17, .35, .12, 55.3, [.76,.62,.38]);
      box(viewProjection, x, 1.78, -17, .35, .12, 55.3, [.76,.62,.38]);
    });
    for (let z = -43; z <= 9; z += 5) {
      box(viewProjection, -14.35, 1.7, z, .62, 3.4, .62, [.38,.24,.1]);
      box(viewProjection, 14.35, 1.7, z, .62, 3.4, .62, [.38,.24,.1]);
    }
    [-45.3, 11.3].forEach((z) => {
      box(viewProjection, 0, 1.25, z, 28.4, 2.5, .22, [.53,.36,.17]);
      box(viewProjection, 0, .85, z, 28.4, .13, .36, [.76,.62,.38]);
      box(viewProjection, 0, 1.75, z, 28.4, .13, .36, [.76,.62,.38]);
    });
  }

  function drawMower(viewProjection) {
    const parent = m4.multiply(m4.translation(mower.x, .5, mower.z), m4.rotationY(mower.angle));
    // Cutting deck and chassis.
    localBox(viewProjection, parent, 0, -.24, .68, 2.28, .22, 1.42, [.85,.57,.07]);
    localBox(viewProjection, parent, 0, .04, .22, 1.46, .42, 1.78, [.76,.06,.05]);
    localBox(viewProjection, parent, 0, .42, .38, .96, .46, .8, [.89,.1,.08]);
    // Engine hood, seat, steering column and wheel.
    localBox(viewProjection, parent, 0, .37, .94, 1.2, .36, .58, [.68,.05,.04]);
    localBox(viewProjection, parent, 0, .62, -.28, .68, .3, .58, [.09,.12,.12]);
    localBox(viewProjection, parent, 0, .86, -.1, .09, .62, .09, [.28,.3,.28], -.25);
    localBox(viewProjection, parent, 0, .65, .15, .07, .67, .07, [.18,.2,.2], .2);
    // Four chunky tires.
    [[- .82,.56], [.82,.56], [-.78,-.6], [.78,-.6]].forEach(([x, z]) => {
      localBox(viewProjection, parent, x, -.2, z, .42, .46, .43, [.03,.04,.04]);
      localBox(viewProjection, parent, x, -.2, z, .26, .28, .45, [.33,.35,.34]);
    });
    // Headlights and a small Mission Mow stripe.
    localBox(viewProjection, parent, -.36, .38, 1.27, .2, .13, .06, [.96,.88,.45]);
    localBox(viewProjection, parent, .36, .38, 1.27, .2, .13, .06, [.96,.88,.45]);
    localBox(viewProjection, parent, 0, .28, -.72, .84, .07, .08, [.95,.95,.88]);
  }

  function drawTree(viewProjection, x, z) {
    box(viewProjection, x, .7, z, .34, 1.4, .34, [.34,.19,.07]);
    box(viewProjection, x, 1.88, z, 1.72, 1.28, 1.58, [.05,.28,.08]);
    box(viewProjection, x - .22, 2.55, z + .1, 1.22, .9, 1.18, [.1,.38,.13]);
  }

  function drawAmericanFlag(viewProjection) {
    const x = -16.4; const z = -9;
    box(viewProjection, x, 3.2, z, .13, 6.4, .13, [.48,.5,.5]);
    box(viewProjection, x, 6.45, z, .32, .14, .32, [.86,.7,.22]);
    // A gently stepped red-and-white flag and blue canton.
    const flagX = x + .98;
    for (let stripe = 0; stripe < 7; stripe += 1) {
      box(viewProjection, flagX, 5.75 - stripe * .28, z, 1.9 - stripe * .05, .17, .07, stripe % 2 === 0 ? [.76,.05,.07] : [.92,.92,.87]);
    }
    box(viewProjection, x + .48, 5.38, z, .78, .87, .09, [.04,.21,.48]);
  }

  function drawNeptune(viewProjection) {
    const x = 16.4; const z = -27;
    // Stylized bronze Neptune statue: stone base, body, arms, trident and crown.
    box(viewProjection, x, .38, z, 2.8, .76, 2.8, [.5,.48,.4]);
    box(viewProjection, x, .94, z, 1.85, .4, 1.85, [.63,.59,.47]);
    box(viewProjection, x, 2.2, z, .68, 2.18, .72, [.32,.43,.37]);
    box(viewProjection, x, 3.45, z, 1.1, .84, .72, [.37,.5,.42]);
    box(viewProjection, x - .86, 2.8, z, .38, .42, 1.65, [.34,.47,.39], .42);
    box(viewProjection, x + .95, 2.94, z, .3, .34, 2.1, [.34,.47,.39], -.18);
    box(viewProjection, x + 1.35, 4.55, z, .12, 3.3, .12, [.38,.5,.42]);
    [-.26, 0, .26].forEach((offset) => box(viewProjection, x + 1.35 + offset, 6.14, z, .1, .75, .1, [.38,.5,.42]));
    box(viewProjection, x, 4.1, z, .92, .14, .88, [.43,.56,.46]);
  }

  function drawBeachfront(viewProjection) {
    box(viewProjection, 0, -.1, 14.5, 42, .18, 6.6, [.68,.76,.77]);
    box(viewProjection, 0, -.01, 12.4, 40, .04, 1.5, [.82,.67,.4]);
    for (let x = -17; x <= 17; x += 5.5) {
      box(viewProjection, x, .65, 12.25, .12, 1.25, .12, [.4,.25,.1]);
      box(viewProjection, x, 1.2, 12.25, 2.3, .08, .75, x % 2 ? [.76,.1,.08] : [.07,.31,.67]);
    }
  }

  function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(.46, .74, .92, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const forwardX = Math.sin(mower.angle);
    const forwardZ = Math.cos(mower.angle);
    const eye = [
      clamp(mower.x - forwardX * 7.2, -15, 15),
      4.7,
      clamp(mower.z - forwardZ * 7.2, -45.5, 11.5),
    ];
    const target = [mower.x + forwardX * 3.2, .45, mower.z + forwardZ * 3.2];
    const projection = m4.perspective(Math.PI / 3.25, canvas.width / canvas.height, .1, 82);
    const viewProjection = m4.multiply(projection, m4.lookAt(eye, target, [0,1,0]));

    drawBeachfront(viewProjection);
    drawLawn(viewProjection);
    drawFence(viewProjection);
    [[-16,-42], [16,-42], [-16,8], [16,8], [-16,-23], [16,-5], [-16,-32], [16,-37]].forEach(([x, z]) => drawTree(viewProjection, x, z));
    drawAmericanFlag(viewProjection);
    drawNeptune(viewProjection);
    drawMower(viewProjection);
  }

  const updateHud = () => {
    scoreEl.textContent = `${cutPercent()}%`;
    timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
  };

  function resetMission() {
    mower.x = 0; mower.z = -5.8; mower.angle = 0;
    grassCells = [];
    for (let row = 0; row < LAWN.rows; row += 1) {
      for (let col = 0; col < LAWN.cols; col += 1) {
        grassCells.push({
          col,
          row,
          x: LAWN.left + LAWN.cell * .5 + col * LAWN.cell,
          z: LAWN.near + LAWN.cell * .5 + row * LAWN.cell,
          cut: false,
        });
      }
    }
    cutCells = 0;
    timeLeft = 90;
    updateHud();
  }

  function finishMission() {
    playing = false;
    const percent = cutPercent();
    const complete = percent >= 75;
    statusEl.textContent = complete
      ? `Lawn complete! You cut ${percent}% into clean Mission Mow stripes.`
      : `Time is up. You cut ${percent}% of the lawn—make wider, steadier passes next time.`;
    startButton.innerHTML = "Play again <span aria-hidden=\"true\">→</span>";
  }

  function update(delta) {
    const turnSpeed = 2.3;
    const driveSpeed = 7.2;
    if (keys.has("a")) mower.angle -= turnSpeed * delta;
    if (keys.has("d")) mower.angle += turnSpeed * delta;
    const direction = (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0);
    if (direction) {
      mower.x += Math.sin(mower.angle) * driveSpeed * direction * delta;
      mower.z += Math.cos(mower.angle) * driveSpeed * direction * delta;
    }
    mower.x = clamp(mower.x, -12.15, 12.15);
    mower.z = clamp(mower.z, -43.15, 9.15);
    grassCells.forEach((cell) => {
      const inDeck = !cell.cut && Math.hypot(mower.x - cell.x, mower.z - cell.z) < 1.45;
      if (inDeck) {
        cell.cut = true;
        cutCells += 1;
      }
    });
    timeLeft -= delta;
    updateHud();
    const percent = cutPercent();
    if (percent && percent % 20 === 0 && Math.floor(timeLeft * 10) % 8 === 0) {
      statusEl.textContent = `${percent}% cut. Keep your rows tidy.`;
    }
    if (percent >= 75 || timeLeft <= 0) finishMission();
  }

  function gameLoop(now) {
    const delta = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    const gameIsVisible = !gameModal || !gameModal.classList.contains("hidden");
    if (gameIsVisible) {
      if (playing) update(delta);
      render();
    }
    requestAnimationFrame(gameLoop);
  }

  function startMission() {
    resetMission();
    playing = true;
    statusEl.textContent = "Mission underway — cut tall grass into clean stripes. W/S drives, A/D steers.";
    startButton.innerHTML = "Restart mission <span aria-hidden=\"true\">↻</span>";
  }

  document.addEventListener("keydown", (event) => {
    if (gameModal?.classList.contains("hidden")) return;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
  });
  document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());
  document.addEventListener("mission-mow-close-game", () => {
    playing = false;
    keys.clear();
    statusEl.textContent = "Press Start mission, then use WASD to mow clean stripes into the lawn.";
    startButton.innerHTML = "Start mission <span aria-hidden=\"true\">→</span>";
  });
  startButton.addEventListener("click", startMission);

  resetMission();
  statusEl.textContent = "Press Start mission, then use WASD to mow clean stripes into the lawn.";
  lastFrame = performance.now();
  requestAnimationFrame(gameLoop);
})();
