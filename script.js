const textToSpeak = document.getElementById('text-to-speak');
const speakButton = document.getElementById('speak-button');
const voiceSelect = document.getElementById('voice-select');
const emotionSelect = document.getElementById('emotion-select');
const audioContainer = document.getElementById('audio-container');

// ملاحظة: مفتاح API الخاص بك. من الأفضل عدم وضعه مباشرة في الشيفرة البرمجية للتطبيقات الإنتاجية.
const apiKey = '8389ac98a19c49d48f1a022f66f7c6f7';
const apiUrl = 'https://api.topmediai.com/v1/text2speech';

// قائمة الأصوات المتاحة (يمكن توسيعها إذا كان لدى API نقطة نهاية للحصول على قائمة الأصوات)
const voices = [
    { name: "Brian (Male)", speaker_id: "00151554-3826-11ee-a861-00163e2ac61b" }
    // يمكنك إضافة المزيد من الأصوات هنا
];

function populateVoiceList() {
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = voice.name;
        option.setAttribute('data-speaker-id', voice.speaker_id);
        voiceSelect.appendChild(option);
    });
}

populateVoiceList();

speakButton.addEventListener('click', async () => {
    const text = textToSpeak.value;
    const selectedSpeakerId = voiceSelect.selectedOptions[0].getAttribute('data-speaker-id');
    const selectedEmotion = emotionSelect.value;

    if (text.trim() === '') {
        alert('الرجاء إدخال نص.');
        return;
    }

    speakButton.disabled = true;
    speakButton.textContent = '...جاري التحويل';

    const options = {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            speaker: selectedSpeakerId,
            text: text,
            emotion: selectedEmotion
        })
    };

    try {
        const response = await fetch(apiUrl, options);
        const data = await response.json();

        if (data.status === 200 && data.data.oss_url) {
            playAudio(data.data.oss_url);
        } else {
            console.error('API Error:', data);
            alert(`حدث خطأ: ${data.message}`);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('حدث خطأ أثناء الاتصال بالـ API.');
    } finally {
        speakButton.disabled = false;
        speakButton.textContent = 'تحدث';
    }
});

function playAudio(url) {
    audioContainer.innerHTML = ''; // مسح أي صوت سابق
    const audio = new Audio(url);
    audio.controls = true;
    audio.autoplay = true;
    audioContainer.appendChild(audio);
}
