const startBtn = document.getElementById('start-button');
const pingElem = document.getElementById('ping');
const downloadElem = document.getElementById('download');
const uploadElem = document.getElementById('upload');

const socket = io();
let pingTests = [];
let downLoadTests = [];
let uploadTests = [];
let downloadTestStart = 0;
let uploadTestStart = 0;
let chunkSize =  1000000; // 1 KiB

let junkData;

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
    pingElem.innerHTML = '';
    downloadElem.innerHTML = '';
    uploadElem.innerHTML = '';
    startBtn.style.display = "none";
    ping();
}

function ping(){
    setTimeout(function() {
        console.log("sending ping")
        socket.emit("clientPing", Date.now())     
    }, 100)  
}

function download(){
    setTimeout(function() {
        downloadTestStart = Date.now();
        socket.emit('download', chunkSize);   
    }, 100)
}

function upload(){
    setTimeout(function() {
        let data = randomBytes(chunkSize);
        uploadTestStart = Date.now();
        socket.emit('upload', junkData);
    }, 100)
}

/* Web Sockets */
socket.on('serverPong', function(data) {
    let latency = Date.now() - data;
    pingElem.innerHTML = latency + " ms";
    pingTests.push(latency);
    if (pingTests.length === 20){
        let result = Math.min.apply(null, pingTests);
        console.log(pingTests)
        pingElem.innerHTML = result + " ms";
        pingTests = [];
        download();
    }else{
        ping();
    }
});

socket.on('download', function(data) {
    let elapsed = ( Date.now() - downloadTestStart ) / 1000; //in sec
    let received = data.byteLength * 8 / 1024 / 1024;
    let result = received / elapsed;
    junkData = data;
    downLoadTests.push(result);
    downloadElem.innerHTML = rounded(result) + " Mbit/s";
    if(downLoadTests.length === 20){
        let max = Math.max.apply(null, downLoadTests);
        console.log(downLoadTests)
        downloadElem.innerHTML = rounded(max) + " Mbit/s";
        downLoadTests = [];
        upload();
    }else{
        download();
    }
})

socket.on('upload', function(time) {
    let elapsed = ( Date.now() - uploadTestStart ) / 1000; //in sec
    let sent = chunkSize * 8 / 1024 / 1024;
    let result = sent / elapsed;
    uploadTests.push(result);
    uploadElem.innerHTML = rounded(result) + " Mbit/s";
    if(uploadTests.length === 20){
        let max = Math.max.apply(null, uploadTests);
        console.log(uploadTests)
        uploadElem.innerHTML = rounded(max) + " Mbit/s";
        uploadTests = [];
        startBtn.style.display = "block";
        startBtn.innerHTML = "RUN AGAIN";
    }else{
        upload();
    }
})

function rounded(num){
    return Math.round((num + Number.EPSILON) * 100) / 100
}

function randomBytes (size) {
    return new Blob([new ArrayBuffer(size)], {type: 'application/octet-stream'});
}