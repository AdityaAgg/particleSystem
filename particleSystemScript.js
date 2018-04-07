let f01AttractionCoef = 100;
let f01DragCoef = 0.1;
let attractionPts = [];
//data
let position = [];
let positionsData = [];
let delta = [];
let color = [];
let textureCoords = [];


let slowHue = 0.0;
let slowSaturation = 0.0;
let slowValue = 0.0;
let fastHue = 1.0;
let fastSaturation = 1.0;
let fastValue = 1.0;
let hueDirection = 1; //0 for clockwise and 1 for counterclockwise

let spriteDim = 6;


//constants
const SIZE = 5000;
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
  const gl = canvas.getContext("webgl",  {
    premultipliedAlpha: false  // Ask for non-premultiplied alpha
  });

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
      //var color = colorForTouch(touches[i]);
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
    attribute vec2 aTextureCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    attribute vec4 aVertexColor;
    varying lowp vec4 vColor;
    varying lowp vec2 vTextureCoord;



    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
      vTextureCoord = aTextureCoord;
      gl_PointSize = 1.0;
    }
  `;

  //varying lowp vec4 vColor;
  const fsSource = `
      varying lowp vec4 vColor;
      varying lowp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      void main() {

        gl_FragColor =  vec4(texture2D(uSampler, vTextureCoord).r * 0.4 + vColor.r * 0.6, texture2D(uSampler, vTextureCoord).g * 0.4 + vColor.g * 0.6, texture2D(uSampler, vTextureCoord).b * 0.4 + vColor.b * 0.6, texture2D(uSampler, vTextureCoord).a);

      }
    `;


  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };



   var then = 0;

   initParticles(400, 400);
   //updateParticle(0);
   //Draw the scene repeatedly

   const texture = loadTexture(gl, 'img/sprite2.png');
   function render(now) {
     for(let i = 0; i<delta.length; ++i) {
       updateParticle(i);


     }
     const buffers = initBuffers(gl);


     //console.log(color);
     now *= 0.001;  // convert to seconds
     const deltaTime = now - then;
     then = now;

     drawScene(gl, programInfo, buffers, deltaTime, texture);

     requestAnimationFrame(render);
   }
   requestAnimationFrame(render);


  // Set clear color to black, fully opaque

}


//Loading Texture function
//Found from: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
//for loading texture
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.crossOrigin = "Anonymous";
  image.src = url;

  //image.load();
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
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
  //console.log("color for touch with identifier " + touch.identifier + " = " + color);
  return color;
}












//found from : https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

function copyTouch(width, height, touch) {
  console.log(touch.identifier);


  console.log((touch.pageY/height * 400) - 200);
  let ratio = width/height;
  return { identifier: touch.identifier, location: vec2.fromValues( (touch.pageX/width * 400) * ratio - (400*ratio/2) , ((touch.pageY/height * 400) - 200) * -1)};
}











//returns a speed from 0 to 1
function getSpeedCoef(v) {
  let coef;

   coef = Math.log(v[0] * v[0]  + v[1] * v[1] + 1)/4.5;
   coef = Math.min(coef, 1.0);

   return coef;
}




function getHue(coef) {
  let hue;
  let sh = slowHue;
  let fh = fastHue;
  if(sh < fh && hueDirection == 0) {
    sh += 1;
  } else if(sh > fh && hueDirection == 1) {
    fh += 1;
  }
  hue = (1 - coef) * sh + coef * fh;
  if(hue >= 1) {
    hue -= 1;
  }

  return hue;
}


function getSaturation(coef) {
  return (1-coef) * slowSaturation  + coef * fastSaturation;
}

function getValue(coef) {
  return (1-coef) * slowValue + coef * fastValue;
}

function hsv2rgba(h, s, v)
{

  let rgba;
  let h6 = 6 * h;
  let r, g, b;
  let coef;
  let a;
  if(h6 < 1) {
    r = 0;
    g = 1 - h6;
    b = 1;
  } else if (h6 < 2) {
    r = h6 - 1;
    g = 0;
    b = 1;
  } else if (h6 < 3) {
    r = 1;
    g = 0;
    b = 3 - h6;
  } else if (h6 < 4) {
    r = 1;
    g = h6 - 3;
    b = 0;
  } else if(h6 < 5) {
    r = 5 - h6;
    g = 1;
    b = 0;
  } else {
    r = 0;
    g = 1;
    b = h6 - 5;
  }

  coef = v * s;

  r = v - coef * r;
  g = v - coef * g;
  b = v - coef * b;
  //console.log("r " +  r + "g " + g + "b " + b);

  a = 1.0;
  rgba = vec4.fromValues(r, g, b, a);
  //console.log(rgba);
  return rgba;
}

//initialize the particles
function initParticles(width, height) {
  let radius = width/2;

  for(let i = 0; i < SIZE; ++i) {

    r = radius * Math.sqrt(Math.random())

    theta = Math.random() * Math.PI * 2;
    let x = (r * Math.cos(theta));
    let y = r * Math.sin(theta) + 1;
    position.push(x);
    position.push(y);

    positionsData.push(x - spriteDim);
    positionsData.push(y - spriteDim);

    positionsData.push(x - spriteDim);
    positionsData.push(y + spriteDim);

    positionsData.push(x + spriteDim);
    positionsData.push(y + spriteDim);

    positionsData.push(x + spriteDim);
    positionsData.push(y + spriteDim);

    positionsData.push(x + spriteDim);
    positionsData.push(y - spriteDim);

    positionsData.push(x - spriteDim);
    positionsData.push(y - spriteDim);

    Array.prototype.push.apply(textureCoords, [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0]);





    delta.push(vec2.fromValues(0.0, 0.0));
    speedCoef = getSpeedCoef(delta[i]);

    let c = hsv2rgba(getHue(speedCoef), getSaturation(speedCoef), getValue(speedCoef));

    for (let num = 0; num<6; ++num)
    {
      color.push(c[0]);
      color.push(c[1]);
      color.push(c[2]);
      color.push(c[3]);
    }

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


    let smallAcceleration = vec2.create();
    vec2.scale(smallAcceleration, diff, (f01AttractionCoef/distance));
    vec2.add(acc, acc, smallAcceleration);
  }


  vec2.add(delta[index], delta[index], acc);

  position[index * offsetFactor] += delta[index][0];
  position[index * offsetFactor + 1] += delta[index][1];

  //update positions data
  for (let i = 0; i<6; ++i) {

    positionsData[index * 12 + i * offsetFactor] += delta[index][0];
    positionsData[index * 12 + i * offsetFactor + 1] += delta[index][1];
  }

  speedCoef = getSpeedCoef(delta[index]);
  let c = hsv2rgba(getHue(speedCoef), getSaturation(speedCoef), getValue(speedCoef));
  //color[index] = c;



  color[index * 4 * 6] = c[0];
  color[index * 4 * 6  + 1] = c[1];
  color[index * 4 * 6 + 2] = c[2];
  color[index * 4 * 6 + 3] =  c[3];


  vec2.scale(delta[index],  delta[index], f01DragCoef);

}






function drawScene(gl, programInfo, buffers, deltaTime, texture) {


  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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


  //texture coords
  {
    const numComponents = 2;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to  from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);

  }





  //Tell WebGL how to pull out colors from color
  //buffer into vertexColor attribute
  {
    const numComponents = 4;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to  from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }



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


  //set texture
  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);



  {
    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, SIZE * 6);
  }
}
















//*********Initialize buffers
function initBuffers(gl) {

  const colorBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);


  gl.bufferData(gl.ARRAY_BUFFER,
                 new Float32Array(color),
                 gl.STATIC_DRAW);

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.







  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(positionsData),
                gl.STATIC_DRAW);

  //let colorBuffer = gl.createBuffer();
  //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // const colors = [
  //   1.0,  1.0,  1.0,  1.0,    // white
  //   1.0,  0.0,  0.0,  1.0,    // red
  //   0.0,  1.0,  0.0,  1.0,    // green
  //   0.0,  0.0,  1.0,  1.0,    // blue
  // ];






  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);


  return {
    position: positionBuffer,
    color: colorBuffer,
    textureCoord: textureCoordBuffer,
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
