const startBtn = document.getElementById('start-button');
const pingElem = document.getElementById('ping');
const downloadElem = document.getElementById('download');
const uploadElem = document.getElementById('upload');

const socket = io();

let results = [];
let requestStart;
let testStart;
let startChunkSize = 100000; // 1 KiB
let chunkSize;
let junkData;

/* Get server info */ 
async function hello(){
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const response = await fetch('/hello', options);
    const json = await response.json();
    if (json.status == 200) {
        document.getElementById('name').innerHTML = '<i class="fas fa-server"></i>' + json.result.name;
        document.getElementById('location').innerHTML = '<i class="fas fa-globe-europe"></i>' + json.result.location;
    } else {
        document.getElementById('name').innerHTML = "An error ocurred, please try again";
    }
}

hello();

function startTest(){
    startBtn.style.display = "none";
    startPing();
}


/* Start tests */
function startPing(){
    pingElem.innerHTML = '';
    results = [];
    ping();
}

function startDownload(){
    downloadElem.innerHTML = '';
    results = [];
    chunkSize = startChunkSize;
    testStart = Date.now();
    download();
}

function startUpload(){
    uploadElem.innerHTML = '';
    results = [];
    chunkSize = startChunkSize;
    testStart = Date.now();
    upload();
}


/* Emit events */
function ping(){
    setTimeout(function() {
        socket.emit("clientPing", Date.now())     
    }, 50)  
}

function download(){
    setTimeout(function() {
        requestStart = Date.now();
        socket.emit('download', chunkSize);   
    }, 10)
}

function upload(){
    setTimeout(function() {
        let data = randomBytes(chunkSize);
        requestStart = Date.now();
        socket.emit('upload', data);
    }, 10)
}

/* Handle Events */
socket.on('serverPong', function(data) {
    let latency = Date.now() - data;
    pingElem.innerHTML = latency + " ms";
    results.push(latency);
    if (results.length === 15){
        let result = Math.min.apply(null, results);
        pingElem.innerHTML = result + " ms";
        startDownload();
    }else{
        ping();
    }
});

socket.on('download', function(data) {
    let elapsed = ( Date.now() - requestStart ) / 1000; //in sec
    let received = data.byteLength * 8 / 1024 / 1024;
    let result = received / elapsed;
    //junkData = data;
    results.push(result);
    downloadElem.innerHTML = rounded(result) + " Mbit/s";
    if(Date.now() - testStart > 1000 * 10){
        let max = Math.max.apply(null, results);
        downloadElem.innerHTML = rounded(max) + " Mbit/s";
        startUpload();
    }else{
        chunkSize = calcChunk(result);
        console.log(chunkSize);
        download();
    }
})

socket.on('upload', function() {
    let elapsed = ( Date.now() - requestStart ) / 1000; //in sec
    let sent = chunkSize * 8 / 1024 / 1024;
    let result = sent / elapsed;
    results.push(result);
    uploadElem.innerHTML = rounded(result) + " Mbit/s";
    if(Date.now() - testStart > 1000 * 10){
        let max = Math.max.apply(null, results);
        uploadElem.innerHTML = rounded(max) + " Mbit/s";
        startBtn.style.display = "block";
        startBtn.innerHTML = "RUN AGAIN";
    }else{
        chunkSize = calcChunk(result);
        console.log(chunkSize);
        upload();
    }
})

/* Helpers */
function rounded(num){
    return Math.round((num + Number.EPSILON) * 100) / 100
}

function calcChunk(data){
    let value = (data * 1024 * 1024 / 8) / 4;
    return value;
}

function randomBytes(size) {
    var str = '';
    for (var i = 0; i < size; i++) {
        var randByte = parseInt(Math.random() * 256, 10);
        randByte = randByte.toString(16);
        if (randByte.length == 1) {
            randByte = "0" + randByte;
        }
        str += randByte;
    }
    return str;
}