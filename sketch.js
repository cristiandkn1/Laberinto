/**
 * Matriz que representa el laberinto.
 * 1 = muro, 0 = camino.
 * @global
 * @type {number[][]}
 */
let maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1],
  [1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1],
  [1,0,1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,0,1],
  [1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,0,1,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,1,0,1],
  [1,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,1,0,1,1,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,0,0,1,0,1],
  [1,1,1,1,1,0,1,1,1,0,0,0,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,1,1,0,1,0,1,0,1,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0]
];

/** Número de filas del laberinto */
let rows = maze.length;
/** Número de columnas del laberinto */
let cols = maze[0].length;
/** Tamaño de cada celda en píxeles */
let cellSize = 35;

/** Punto de inicio (fila, columna) */
let start = [1, 1];
/** Punto de fin/salida (fila, columna) */
let end = [19, 19];
/** Celdas exploradas por BFS (para animación) */
let bfsExplored = [];
/** Celdas exploradas por DFS (para animación) */
let dfsExplored = [];
/** Camino final encontrado por BFS */
let bfsPath = [];
/** Camino final encontrado por DFS */
let dfsPath = [];
/** Índice actual para animar BFS */
let bfsIndex = 0;
/** Índice actual para animar DFS */
let dfsIndex = 0;
/** Controla si se está animando */
let animating = true;

/**
 * Configura el canvas y prepara la animación del laberinto.
 * Inicializa la exploración y los caminos de BFS y DFS.
 * @function
 * @global
 */
function setup() {
  createCanvas(cols * cellSize, rows * cellSize); // Canvas proporcional al laberinto
  frameRate(10); // Velocidad de la animación (más alto = más rápido)

  // Calcula el orden en que BFS y DFS explorarán el laberinto (para animación)
  bfsExplored = bfsSteps(start, end);
  dfsExplored = dfsSteps(start, end);
  bfsPath = [];
  dfsPath = [];
  bfsIndex = 0;
  dfsIndex = 0;
  animating = true;
}

/**
 * Dibuja el laberinto y gestiona la animación y visualización
 * de los algoritmos BFS y DFS.
 * @function
 * @global
 */
function draw() {
  background(255);

  // Dibuja el laberinto: negro = muro, blanco = camino
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (maze[i][j] === 1) {
        fill(0);  // Muro
      } else {
        fill(255); // Camino
      }
      stroke(200);
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }

  // ANIMACIÓN DE LA EXPLORACIÓN
  if (animating) {
    // Muestra las casillas visitadas por BFS en azul
    if (bfsIndex < bfsExplored.length) {
      let [i, j] = bfsExplored[bfsIndex];
      fill(0, 0, 255, 120);
      noStroke();
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
      bfsIndex++;
    }
    // Muestra las casillas visitadas por DFS en rojo
    if (dfsIndex < dfsExplored.length) {
      let [i, j] = dfsExplored[dfsIndex];
      fill(255, 0, 0, 120); // Rojo translúcido
      noStroke();
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
      dfsIndex++;
    }
    // Cuando ambos algoritmos terminan de explorar, calcula los caminos y termina la animación
    if (bfsIndex >= bfsExplored.length && dfsIndex >= dfsExplored.length) {
      bfsPath = bfs(start, end);
      dfsPath = dfs(start, end);
      animating = false;
    }
  } else {
    // Dibuja el camino BFS final (azul)
    drawPath(bfsPath, color(0, 0, 255, 220));
    // Dibuja el camino DFS final (rojo)
    drawPath(dfsPath, color(255, 0, 0, 220));
  }
}

/**
 * Dibuja una ruta/camino en el laberinto con un color específico.
 * @param {Array} path - Lista de posiciones [fila, columna] del camino.
 * @param {p5.Color} colorVal - Color con el que se dibuja la ruta.
 */
function drawPath(path, colorVal) {
  noFill();
  stroke(colorVal);
  strokeWeight(4);
  beginShape();
  for (let [i, j] of path) {
    vertex(j * cellSize + cellSize / 2, i * cellSize + cellSize / 2);
  }
  endShape();
}

/**
 * Calcula el orden de exploración BFS (Breadth-First Search) para animación.
 * @param {Array} start - Posición inicial [fila, columna].
 * @param {Array} end - Posición final [fila, columna].
 * @returns {Array} Celdas exploradas en orden BFS.
 */
function bfsSteps(start, end) {
  let queue = [];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let explored = [];
  queue.push(start);
  visited[start[0]][start[1]] = true;
  while (queue.length > 0) {
    let [x, y] = queue.shift();
    explored.push([x, y]);
    if (x === end[0] && y === end[1]) break;
    let neighbors = [
      [x+1, y], [x-1, y], [x, y+1], [x, y-1]
    ];
    for (let [nx, ny] of neighbors) {
      if (
        nx >= 0 && nx < rows &&
        ny >= 0 && ny < cols &&
        maze[nx][ny] === 0 &&
        !visited[nx][ny]
      ) {
        queue.push([nx, ny]);
        visited[nx][ny] = true;
      }
    }
  }
  return explored;
}

/**
 * Calcula el orden de exploración DFS (Depth-First Search) para animación.
 * @param {Array} start - Posición inicial [fila, columna].
 * @param {Array} end - Posición final [fila, columna].
 * @returns {Array} Celdas exploradas en orden DFS.
 */
function dfsSteps(start, end) {
  let stack = [];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let explored = [];
  stack.push(start);
  visited[start[0]][start[1]] = true;
  while (stack.length > 0) {
    let [x, y] = stack.pop();
    explored.push([x, y]);
    if (x === end[0] && y === end[1]) break;
    let neighbors = [
      [x+1, y], [x-1, y], [x, y+1], [x, y-1]
    ];
    for (let [nx, ny] of neighbors) {
      if (
        nx >= 0 && nx < rows &&
        ny >= 0 && ny < cols &&
        maze[nx][ny] === 0 &&
        !visited[nx][ny]
      ) {
        stack.push([nx, ny]);
        visited[nx][ny] = true;
      }
    }
  }
  return explored;
}

/**
 * Busca un camino usando DFS (Depth-First Search).
 * @param {Array} start - Posición inicial [fila, columna].
 * @param {Array} end - Posición final [fila, columna].
 * @returns {Array} Camino encontrado desde start a end usando DFS.
 */
function dfs(start, end) {
  let stack = [];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  stack.push(start);
  visited[start[0]][start[1]] = true;

  while (stack.length > 0) {
    let [x, y] = stack.pop();

    if (x === end[0] && y === end[1]) break;

    let neighbors = [
      [x+1, y], [x-1, y], [x, y+1], [x, y-1]
    ];

    for (let [nx, ny] of neighbors) {
      if (
        nx >= 0 && nx < rows &&
        ny >= 0 && ny < cols &&
        maze[nx][ny] === 0 &&
        !visited[nx][ny]
      ) {
        stack.push([nx, ny]);
        visited[nx][ny] = true;
        prev[nx][ny] = [x, y];
      }
    }
  }

  let path = [];
  let at = end;
  while (at) {
    path.push(at);
    at = prev[at[0]][at[1]];
  }
  path.reverse();
  return path;
}

/**
 * Busca un camino usando BFS (Breadth-First Search).
 * @param {Array} start - Posición inicial [fila, columna].
 * @param {Array} end - Posición final [fila, columna].
 * @returns {Array} Camino encontrado desde start a end usando BFS.
 */
function bfs(start, end) {
  let queue = [];
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  queue.push(start);
  visited[start[0]][start[1]] = true;

  while (queue.length > 0) {
    let [x, y] = queue.shift();

    if (x === end[0] && y === end[1]) break;

    let neighbors = [
      [x+1, y], [x-1, y], [x, y+1], [x, y-1]
    ];

    for (let [nx, ny] of neighbors) {
      if (
        nx >= 0 && nx < rows &&
        ny >= 0 && ny < cols &&
        maze[nx][ny] === 0 &&
        !visited[nx][ny]
      ) {
        queue.push([nx, ny]);
        visited[nx][ny] = true;
        prev[nx][ny] = [x, y];
      }
    }
  }
  // Reconstruye el camino desde end a start usando prev[]

  let path = [];
  let at = end;
  while (at) {
    path.push(at);
    at = prev[at[0]][at[1]];
  }
  path.reverse();
  return path;
}
