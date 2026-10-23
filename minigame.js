(() => {
  const canvas = document.querySelector("#mowing-game");
  if (!canvas) return;

  const scoreEl = document.querySelector("#game-score");
  const timeEl = document.querySelector("#game-time");
  const statusEl = document.querySelector("#game-status");
  const startButton = document.querySelector("#game-start");
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

  const grassLayout = [
    [-10,-39], [-4,-38], [3,-40], [10,-39],
    [-12,-34], [-6,-34], [1,-33], [8,-34],
    [-9,-29], [-2,-28], [5,-29], [11,-28],
    [-11,-24], [-5,-24], [2,-23], [9,-24],
    [-8,-19], [-1,-18], [6,-19], [12,-18],
    [-10,-14], [-4,-14], [3,-13], [10,-14],
    [-12,-9], [-6,-9], [1,-8], [8,-9],
    [-9,-4], [-2,-3], [5,-4], [11,-3],
    [-11,1], [-5,1], [2,2], [9,1],
    [-8,6], [-1,7], [6,6], [12,7],
  ];
  const mower = { x: 0, z: -11, angle: 0 };
  let patches = [];
  let score = 0;
  let timeLeft = 90;
  let playing = false;
  let lastFrame = 0;
  let frame = 0;
  const keys = new Set();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

  function localBox(viewProjection, parent, x, y, z, width, height, depth, color) {
    const model = m4.multiply(parent, m4.multiply(m4.translation(x, y, z), m4.scaling(width, height, depth)));
    drawCube(m4.multiply(viewProjection, model), color);
  }

  function drawPatch(viewProjection, patch) {
    if (patch.mowed) {
      box(viewProjection, patch.x, .05, patch.z, 1.5, .09, 1.3, [.34,.62,.26]);
      return;
    }
    box(viewProjection, patch.x, .5, patch.z, 1.35, .95, .34, [.09,.38,.12]);
    box(viewProjection, patch.x - .3, .58, patch.z + .24, .3, 1.2, .7, [.15,.52,.15], .35);
    box(viewProjection, patch.x + .28, .52, patch.z - .2, .28, 1.08, .72, [.23,.59,.15], -.4);
  }

  function drawMower(viewProjection) {
    const parent = m4.multiply(m4.translation(mower.x, .48, mower.z), m4.rotationY(mower.angle));
    localBox(viewProjection, parent, 0, 0, 0, 1.35, .42, 1.65, [.8,.08,.07]);
    localBox(viewProjection, parent, 0, .33, .24, .72, .38, .7, [.18,.24,.24]);
    localBox(viewProjection, parent, 0, .55, .3, .45, .08, .42, [.54,.6,.55]);
    localBox(viewProjection, parent, -.62, -.18, -.48, .27, .3, .34, [.035,.045,.04]);
    localBox(viewProjection, parent, .62, -.18, -.48, .27, .3, .34, [.035,.045,.04]);
    localBox(viewProjection, parent, -.62, -.18, .48, .27, .3, .34, [.035,.045,.04]);
    localBox(viewProjection, parent, .62, -.18, .48, .27, .3, .34, [.035,.045,.04]);
    localBox(viewProjection, parent, 0, .7, -.7, .08, .08, 1.7, [.78,.76,.58]);
    localBox(viewProjection, parent, 0, .74, -1.45, .46, .11, .12, [.05,.07,.07]);
  }

  function drawTree(viewProjection, x, z) {
    box(viewProjection, x, .65, z, .3, 1.3, .3, [.36,.2,.08]);
    box(viewProjection, x, 1.8, z, 1.65, 1.25, 1.55, [.08,.33,.11]);
    box(viewProjection, x - .18, 2.55, z + .1, 1.15, .85, 1.1, [.12,.43,.16]);
  }

  function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(.45, .74, .93, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const forwardX = Math.sin(mower.angle);
    const forwardZ = Math.cos(mower.angle);
    const eye = [
      clamp(mower.x - forwardX * 6.2, -13.2, 13.2),
      4.5,
      clamp(mower.z - forwardZ * 6.2, -44.2, 10.2),
    ];
    const target = [mower.x + forwardX * 2.8, .35, mower.z + forwardZ * 2.8];
    const projection = m4.perspective(Math.PI / 3.2, canvas.width / canvas.height, .1, 70);
    const viewProjection = m4.multiply(projection, m4.lookAt(eye, target, [0,1,0]));

    box(viewProjection, 0, -.2, -17.5, 31, .35, 59, [.17,.5,.19]);
    for (let stripe = -44; stripe <= 10; stripe += 4) box(viewProjection, 0, -.005, stripe, 29.6, .03, 1.7, [.25,.59,.24]);
    [-14.45, 14.45].forEach((x) => box(viewProjection, x, 1.25, -17.5, .5, 2.5, 59, [.34,.24,.13]));
    [-46.45, 11.45].forEach((z) => box(viewProjection, 0, 1.25, z, 29.4, 2.5, .5, [.34,.24,.13]));
    for (let post = -44; post <= 10; post += 4) {
      box(viewProjection, -14.45, 2.15, post, .72, 4.3, .72, [.22,.16,.09]);
      box(viewProjection, 14.45, 2.15, post, .72, 4.3, .72, [.22,.16,.09]);
    }
    for (let post = -12; post <= 12; post += 4) {
      box(viewProjection, post, 2.15, -46.45, .72, 4.3, .72, [.22,.16,.09]);
      box(viewProjection, post, 2.15, 11.45, .72, 4.3, .72, [.22,.16,.09]);
    }
    [[-16,-42], [16,-42], [-16,10], [16,10], [-15,-16], [15,-5]].forEach(([x,z]) => drawTree(viewProjection, x, z));
    patches.forEach((patch) => drawPatch(viewProjection, patch));
    drawMower(viewProjection);
  }

  const updateHud = () => {
    scoreEl.textContent = score;
    timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
  };

  function resetMission() {
    mower.x = 0; mower.z = -6.5; mower.angle = 0;
    patches = grassLayout.map(([x, z]) => ({ x, z, mowed: false }));
    score = 0;
    timeLeft = 90;
    updateHud();
  }

  function finishMission() {
    playing = false;
    const complete = score === patches.length;
    statusEl.textContent = complete
      ? `Route complete! You mowed all ${score} tall-grass patches.`
      : `Shift complete! You mowed ${score} of ${patches.length} patches. Try again to clear the lawn.`;
    startButton.innerHTML = "Play again <span aria-hidden=\"true\">→</span>";
  }

  function update(delta) {
    const turnSpeed = 2.35;
    const driveSpeed = 6.4;
    if (keys.has("a")) mower.angle -= turnSpeed * delta;
    if (keys.has("d")) mower.angle += turnSpeed * delta;
    const direction = (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0);
    if (direction) {
      mower.x += Math.sin(mower.angle) * driveSpeed * direction * delta;
      mower.z += Math.cos(mower.angle) * driveSpeed * direction * delta;
    }
    mower.x = clamp(mower.x, -13, 13);
    mower.z = clamp(mower.z, -44, 10.2);
    patches.forEach((patch) => {
      if (!patch.mowed && Math.hypot(mower.x - patch.x, mower.z - patch.z) < 1.12) {
        patch.mowed = true;
        score += 1;
        statusEl.textContent = `Nice pass! ${score} of ${patches.length} tall-grass patches mowed.`;
      }
    });
    timeLeft -= delta;
    updateHud();
    if (score === patches.length || timeLeft <= 0) finishMission();
  }

  function gameLoop(now) {
    const delta = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    if (playing) update(delta);
    render();
    frame = requestAnimationFrame(gameLoop);
  }

  function startMission() {
    resetMission();
    playing = true;
    statusEl.textContent = "Mission underway — W/S drives and A/D steers the mower.";
    startButton.innerHTML = "Restart mission <span aria-hidden=\"true\">↻</span>";
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
  });
  document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());
  startButton.addEventListener("click", startMission);

  resetMission();
  statusEl.textContent = "Press Start mission, then use W/S to drive and A/D to steer.";
  lastFrame = performance.now();
  frame = requestAnimationFrame(gameLoop);
})();
