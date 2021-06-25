const MUSIC_URL = './../music/allWeKnow.mp3';
const music = new Audio(MUSIC_URL);
const playBtn = document.querySelector('#play');
const statusBar = document.querySelector('.status-bar');
let FREQUENCY = 100;
let HEIGHT_LIMIT = 230;
let TOTAL_DURATION = `${Math.floor(music.duration / 60)}:${Math.floor(music.duration % 60)}`;
let widthOfOneBar = statusBar.offsetWidth / FREQUENCY;
let isRunning = false;

/* Testing Frequency */

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let currentBuffer = null;
const filterData = audioBuffer => {
  const rawData = audioBuffer.getChannelData(0);
  const samples = FREQUENCY;
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    filteredData.push(rawData[i * blockSize]); 
  }
  return filteredData;
}

const visualizeAudio = url => {
    fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => visualize(audioBuffer));
};

visualizeAudio(MUSIC_URL);

const normalizeData = filteredData => {
  const multiplier = HEIGHT_LIMIT;
  return filteredData.map(n => n < 0 ? -n * multiplier : n * multiplier);
}

function mapBars(bars) {
    for(let i=0; i<bars.length; i++) {
        let freqBar = document.createElement('div');
        freqBar.classList.add('freq');
        freqBar.style.width = `${widthOfOneBar}px`;
        freqBar.style.height = `${bars[i]}px`;
        statusBar.appendChild(freqBar);
    }
}

function visualize(buffer) {
    let bars = normalizeData(filterData(buffer));
    mapBars(bars);
}

/* Testing End */


// Event listeners
playBtn.addEventListener('click', () => {
    if(isRunning) {
        music.pause();
        isRunning = false;
        playBtn.querySelector('img').src = './images/play.svg';
    } else {
        music.play();
        isRunning = true;
        playBtn.querySelector('img').src = './images/pause.svg';
    }
});

function findTarget(completePercent) {
    let noOfBars = Math.round((completePercent * statusBar.offsetWidth / 100) / widthOfOneBar);
    return statusBar.querySelectorAll('div.freq')[noOfBars];
}

music.addEventListener('timeupdate', () => {
    let completePercent = Math.round((music.currentTime / music.duration) * 100);
    let highlightUptoThis = findTarget(completePercent);
    if(highlightUptoThis) {
        setTimeout(() => {
        highLightBars(highlightUptoThis);
    }, 0);
    }
})

function highLightBars(target) {
    let prevEle = target.parentElement.firstElementChild;

    while(prevEle != target) {
        if(!prevEle.classList.contains('active')) {
            prevEle.classList.add('active');
        }
        prevEle = prevEle.nextElementSibling;
    }

    while(prevEle != target.parentElement.lastElementChild) {
        if(prevEle.classList.contains('active')) {
            prevEle.classList.remove('active');
        }
        prevEle = prevEle.nextElementSibling;
    }
}

statusBar.addEventListener('click', (event) => {
    let clickedPoint = event.clientX;
    highLightBars(event.target);
    let comPer = (clickedPoint / statusBar.offsetWidth * 100);
    music.currentTime = (comPer * music.duration / 100);
})