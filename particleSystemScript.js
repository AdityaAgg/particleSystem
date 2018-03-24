let f01AttractionCoef = 100;
let f01DragCoef = 0.1;
let attractionPts = [];
//data
let position = [];
let delta = [];
//let color = [];


//constants
const SIZE = 1000;
main();



















//**************************************************


//
// main function
//
function main() {
  const canvas = document.querySelector("#glCanvas");
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  canvas.style.height = h;

  canvas.style.width =  w;

  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  var handleStart = function(evt) {
    evt.preventDefault();
    //alert("touch start");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      let touchObj = copyTouch(gl.canvas.clientWidth, gl.canvas.clientHeight, touches[i]);


      attractionPts.push(touchObj);
      var color = colorForTouch(touches[i]);



    }

  }



  let handleEnd = function(evt) {
    evt.preventDefault();

    //var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      var color = colorForTouch(touches[i]);
      var idx = ongoingTouchIndexById(touches[i].identifier);

      if (idx >= 0) {

        attractionPts.splice(idx, 1);  // remove it; we're done

      } else {
        console.log("can't figure out which touch to end");
      }
    }
  }



  let handleMove = function(evt) {
    evt.preventDefault();
    //var el = document.getElementsByTagName("canvas")[0];
    //var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      var color = colorForTouch(touches[i]);
      var idx = ongoingTouchIndexById(touches[i].identifier);

      if (idx >= 0) {
        //console.log("continuing touch "+idx);
        //ctx.beginPath();
        //console.log("ctx.moveTo(" + ongoingTouches[idx].pageX + ", " + ongoingTouches[idx].pageY + ");");
        //ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        //console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
        //ctx.lineTo(touches[i].pageX, touches[i].pageY);
        //ctx.lineWidth = 4;
        //ctx.strokeStyle = color;
        //ctx.stroke();

        attractionPts.splice(idx, 1, copyTouch(gl.canvas.clientWidth , gl.canvas.clientHeight, touches[i]));  // swap in the new touch record
      } else {
        console.log("can't figure out which touch to continue");
      }
    }
    console.log("move touch");
  }


  let handleCancel = function(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
      var idx = ongoingTouchIndexById(touches[i].identifier);
      attractionPts.splice(idx, 1);  // remove it; we're done
    }
  }



  handleStart.bind(canvas, gl);
  handleEnd.bind(canvas, gl);
  handleMove.bind(canvas, gl);
  handleCancel.bind(canvas, gl);




  canvas.addEventListener("touchstart", handleStart, false);

  canvas.addEventListener("touchend", handleEnd, false);
  canvas.addEventListener("touchmove", handleMove, false);
  canvas.addEventListener("touchcancel", handleCancel, false);

  //canvas.addEventListener('click', simulateClick);



    // initialize shaders
    //  attribute vec4 aVertexColor;
    //varying lowp vec4 vColor;
    //varying lowp vec4 vColor;
  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;



    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

      gl_PointSize = 1.0;
    }
  `;

  //varying lowp vec4 vColor;
  const fsSource = `


      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `;


  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    //  vertexColor: gl.AttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };



   var then = 0;

   initParticles(400, 400);
   // Draw the scene repeatedly
   function render(now) {
     for(let i = 0; i<delta.length; ++i) {
       updateParticle(i);
     }
     const buffers = initBuffers(gl);
     now *= 0.001;  // convert to seconds
     const deltaTime = now - then;
     then = now;

     drawScene(gl, programInfo, buffers, deltaTime);

     requestAnimationFrame(render);
   }
   requestAnimationFrame(render);


  // Set clear color to black, fully opaque

}













//event listeners


function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < attractionPts.length; i++) {
    var id = attractionPts[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}





// found from : https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

function colorForTouch(touch) {
  var r = touch.identifier % 16;
  var g = Math.floor(touch.identifier / 3) % 16;
  var b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
  console.log("color for touch with identifier " + touch.identifier + " = " + color);
  return color;
}












//found from : https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

function copyTouch(width, height, touch) {
  console.log(touch.identifier);


  console.log((touch.pageY/height * 400) - 200);
  let ratio = width/height;
  return { identifier: touch.identifier, location: vec2.fromValues( (touch.pageX/width * 400)- 200 , ((touch.pageY/height * 400) - 200) * -1)};
}












// function SpeedCoef(let v) {
//   let coef;
//   coef = log(v.x * v.x  + v.y + v.y + 1)/4.5f;
//   coef = Math.min(coef, 1.0f);
//   return coef;
// }


//initialize the particles
function initParticles(width, height) {
  let radius = width/2;

  for(let i = 0; i < SIZE; ++i) {

    r = radius * Math.sqrt(Math.random())

    theta = Math.random() * Math.PI * 2;

    position.push((r * Math.cos(theta)));
    position.push((r * Math.sin(theta) + 1));

    delta.push(vec2.fromValues(0.0, 0.0));

  }
}

//update the particles
function updateParticle(index) {

  let speedCoef, theta;
  let diffSqNorm;

  let acc = vec2.fromValues(0.0, 0.0);

  let offsetFactor = 2;
  let pt = vec2.fromValues(position[index * offsetFactor], position[index * offsetFactor + 1]);


  //compute forces from all attraction pts


  for (var i = 0; i< attractionPts.length; ++i) {

    let diff = vec2.fromValues(0.0, 0.0);
    vec2.subtract(diff, attractionPts[i].location, pt);

    let distance = vec2.squaredLength(diff);

    if(distance < 0.1) {
      theta = Math.random() * Math.PI * 2;
      diff[0] = Math.cos(theta);
      diff[1] = Math.sin(theta);
      distance = 1;
    }

    //speedCoef = SpeedCoef(v);
    let smallAcceleration = vec2.create();
    vec2.scale(smallAcceleration, diff, (f01AttractionCoef/distance));
    vec2.add(acc, acc, smallAcceleration);
  }


  vec2.add(delta[index], delta[index], acc);

  position[index * offsetFactor] += delta[index][0];
  position[index * offsetFactor + 1] += delta[index][1];

  vec2.scale(delta[index],  delta[index], f01DragCoef);

}






function drawScene(gl, programInfo, buffers, deltaTime) {


  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 90 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 250;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -200.0]);  // amount to translate



  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to  from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }


  //for color
  // {
  //   const numComponents = 4;
  //   const type = gl.FLOAT;
  //   const normalize = false;
  //   const stride = 0;
  //   const offset = 0;
  //
  //
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //   gl.vertexAttribPointer(
  //       programInfo.attribLocations.vertexColor,
  //       numComponents,
  //       type,
  //       normalize,
  //       stride,
  //       offset);
  //   gl.enableVertexAttribArray(
  //       programInfo.attribLocations.vertexColor);
  // }


  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);



  {
    const offset = 0;

    gl.drawArrays(gl.POINTS, offset, SIZE);
  }
}
















//*********Initialize buffers
function initBuffers(gl) {

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.







  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(position),
                gl.STATIC_DRAW);

  //let colorBuffer = gl.createBuffer();
  //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // const colors = [
  //   1.0,  1.0,  1.0,  1.0,    // white
  //   1.0,  0.0,  0.0,  1.0,    // red
  //   0.0,  1.0,  0.0,  1.0,    // green
  //   0.0,  0.0,  1.0,  1.0,    // blue
  // ];

  // gl.bufferData(gl.ARRAY_BUFFER,
  //               new Float32Array(colors),
  //               gl.STATIC_DRAW);





  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.



  return {
    position: positionBuffer,
    //color: colorBuffer,
  };
}
















//shader code **************************************************
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.ShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.ProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}
