const startBtn = document.getElementById('play-transcription');
const stopBtn = document.getElementById('stop-transcription');
const resultText = document.getElementById('transcription');
let mediaRecorder;
let audioChunks = [];

startBtn.onclick = async function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('このブラウザは音声録音をサポートしていません');
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioBase64 = await blobToBase64(audioBlob);
        const data = await sendAudioToServer(audioBase64);
        displayTranscription(data);
        audioChunks = [];
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = function () {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
};

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function sendAudioToServer(audioBase64) {
    const response = await fetch('https://peaceful-tide-429307-m0.an.r.appspot.com/api/identify-speaker', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audio: audioBase64 })
    });
    const data = await response.json();
    return data;
}

function displayTranscription(data) {
    const colorMap = { '1': 'blue', '2': 'red', '3': 'green' };
    const transcript = data.transcript;

    resultText.innerHTML += `<span style="color: ${colorMap[data.speakerId]};">${transcript}</span><br>`;
}
