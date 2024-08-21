// link to the model folder directory
const URL = "./model/";

const imageData = [];

var media = document.getElementById('video-ads');


let model, webcam, labelContainer, maxPredictions, probableClass;

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

   
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    probableClass = document.getElementById("probable-class");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
        probableClass.appendChild(document.createElement("div"));
    }
}



function image(url, label) {
    this.url = `${url}`
    this.label = label;
}


function captureFrameperSecond() {
    setInterval(captureFrame, 1000);
}


function safeSetItem(key, value) {
    // Check if the key already exists
    if (!localStorage.getItem(key)) {
        // If the key doesn't exist, set the new value with the provided key
        localStorage.setItem(key, value);
        console.log(`Value for key '${key}' set to '${value}'.`);
    } else {
        console.log(`Key '${key}' already exists. Generating a new key...`);
        
        // Generate a new key
        var newKey = generateUniqueKey();
        
        // Set the new value with the generated key
        localStorage.setItem(newKey, value);
        
        console.log(`New key '${newKey}' generated. Value set to '${value}'.`);
    }
}

function generateUniqueKey() {
    // Generate a unique key using a timestamp or a random number
    return 'autoKey_' + Date.now();
}

// Example usage:





function captureFrame() {
    myCanvas.getContext('2d').drawImage(webcam.canvas, 0, 0, 200, 200);
    let image_data_url = myCanvas.toDataURL('image/jpeg');
    //console.log(image_data_url)
    const url = image_data_url;
    let label = probableClass.childNodes[0].innerHTML;
    displayImageFrames();
    console.log('displayed triggered')
        //console.log(url)


    //b64 to blob

    //.then(URL.createObjectURL(res.blob))
    //.then(console.log(res))
    //save image and label to array
    imageData.push(new image(url, label))
}



//playing event
media.addEventListener("playing", function() {
    console.log("capturing frames");
    captureFrameperSecond()
});

// Pause event
media.addEventListener("pause", function() {
    console.log("Pause event triggered");
});


//end event
media.addEventListener("ended", function() {
    console.log("video finished");
    clearInterval(captureFrameperSecond)

   // window.localStorage.setItem("images", JSON.stringify(imageData));
      safeSetItem(generateUniqueKey(),  JSON.stringify(imageData));
});


// Function to create image frames and labels and append them to the container
function displayImageFrames() {
    const container = document.getElementById('imageContainer');

    imageData.forEach(data => {
        const frame = document.createElement('div');
        frame.classList.add('imageFrame');

        const img = document.createElement('img');
        img.src = data.url;

        const label = document.createElement('p');
        label.textContent = data.label;

        frame.appendChild(img);
        frame.appendChild(label);
        container.appendChild(frame);
    });
}

// Call the function to display image frames
displayImageFrames();


async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element


    const prediction = await model.predict(webcam.canvas);


    //console.log(webcam.canvas)

    //get the most probable prediction 
    const maxClass = prediction.reduce(function(prev, current) {
        return (prev.probability > current.probability) ? prev : current;
    })["className"];
    //  console.log(maxClass)

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        probableClass.childNodes[0].innerHTML = maxClass;


    }

}