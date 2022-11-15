mapboxgl.accessToken =
  "pk.eyJ1IjoiZG5vbWFkYiIsImEiOiJjaW16aXFsZzUwNHJmdjdra3h0Nmd2cjY1In0.SqzkaKalXxQaPhQLjodQcQ";

var vertexSource = `
    attribute vec2 aPos;
    uniform mat4 uMatrix;
    varying vec2 vTexCoord;

    float Extent = 8192.0;

    void main() {
        vec4 a = uMatrix * vec4(aPos * Extent, 0, 1);
        gl_Position = vec4(a.rgba);
        vTexCoord = aPos;
    }
`;
var fragmentSource = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform sampler2D uTexture;
    // uniform elevation

    void main() {
        float elevationScale = 15.0;
        float interval = 0.05;
        vec4 color = texture2D(uTexture, vTexCoord);
        float i = -10000.0 + (color.r * 255.0 * 256.0 + color.g * 255.0 + color.b) * 0.1;
        float e = (mod(i, interval) - ((mod(floor(i / interval), 2.0)) * interval)) * (mod(floor(i / interval), -2.0) * 2.0 + 1.0);
        gl_FragColor = vec4(0, 1.0 - e * elevationScale, 1.0 - e * elevationScale, 1);
    }           
     `;
const map = new mapboxgl.Map({
  container: document.getElementById("map"),
  style: "mapbox://styles/mapbox/empty-v8",
  center: [145, -16],
  zoom: 0,
  hash: true,
});
map.on("load", () => {
  const customlayer = new TextureLayer(
    "test",
    {
      type: "raster",
    //   tiles: ["http://localhost:3000/tiles/rgb/{z}/{x}/{y}.png"]
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    },
    setupLayer,
    render
  );
  map.addLayer(customlayer);
});

let program;
function setupLayer(map, gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.validateProgram(program);

  program.aPos = gl.getAttribLocation(program, "aPos");
  program.uMatrix = gl.getUniformLocation(program, "uMatrix");
  program.uTexture = gl.getUniformLocation(program, "uTexture");
  const vertexArray = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

  program.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, program.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
}
function render(gl, matrix, tiles) {
  gl.useProgram(program);

  tiles.forEach((tile) => {
    if (!tile.texture) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tile.texture.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindBuffer(gl.ARRAY_BUFFER, program.vertexBuffer);
    gl.enableVertexAttribArray(program.a_pos);
    gl.vertexAttribPointer(program.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(program.uMatrix, false, tile.tileID.projMatrix);
    gl.uniform1i(program.uTexture, 0);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });
}
