const startBtn = document.getElementById('play-transcription');
const stopBtn = document.getElementById('stop-transcription');
const resultText = document.getElementById('transcription');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// 音声録音を開始する関数
startBtn.onclick = async function() {
    if (!isRecording) {
        // ユーザーの音声デバイスにアクセス
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        // 音声データを収集
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // 録音が終了した時の処理
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = []; // 次の録音に備えてリセット
            sendAudioToServer(audioBlob).then((data) => displayTranscription(data));
        };

        mediaRecorder.start();
        isRecording = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resultText.value = '';
        console.log('録音を開始しました');
    }
};

// 録音を停止する関数
stopBtn.onclick = function() {
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        console.log('録音を停止しました');
    }
};

// サーバーに音声データを送信する関数
async function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch('https://peaceful-tide-429307-m0.an.r.appspot.com/api/identify-speaker', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data;
}

// サーバーからのレスポンスを表示する関数
function displayTranscription(data) {
    const transcript = data.transcript;
    resultText.value = transcript;
}
