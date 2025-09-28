// TopMedia AI API integration and UI logic
const PROXY_URL = 'https://proxy.cors.sh/';
const API_URL = PROXY_URL + 'https://api.topmediai.com/v1/text2speech';
const API_KEY = '8389ac98a19c49d48f1a022f66f7c6f7'; // Replace with your actual API key

const voiceSelect = document.getElementById('voice-select');
const emotionSelect = document.getElementById('emotion-select');
const ttsForm = document.getElementById('tts-form');
const ttsText = document.getElementById('tts-text');
const convertBtn = document.getElementById('convert-btn');
const audioSection = document.getElementById('audio-section');
const audioPlayer = document.getElementById('audio-player');
const downloadLink = document.getElementById('download-link');
const statusMessage = document.getElementById('status-message');

// Fetch available voices from TopMedia AI (replace with actual endpoint if available)
async function fetchVoices() {
    voiceSelect.innerHTML = '<option value="">Loading real voices from API...</option>';
    const url = PROXY_URL + 'https://api.topmediai.com/v1/voices_list';
    const options = {
        method: 'GET',
        headers: {'x-api-key': API_KEY},
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            // The API returned an error (e.g., bad API key)
            throw new Error(data.detail || `API Error: ${response.status}`);
        }

        if (data && Array.isArray(data.Voice) && data.Voice.length > 0) {
            // Success: Populate with real voices
            voiceSelect.innerHTML = data.Voice.map(v =>
                `<option value="${v.speaker}">${v.name} (${v.Languagename})</option>`
            ).join('');
        } else {
            // API worked but returned no voices
            voiceSelect.innerHTML = '<option value="">API returned no voices.</option>';
        }
    } catch (error) {
        // Fetch failed (e.g., network issue, CORS) or API returned an error
        console.error('Failed to fetch voices:', error);
        voiceSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
    }
}

fetchVoices();

ttsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = ttsText.value.trim();
    const speaker = voiceSelect.value;
    const emotion = emotionSelect.value;
    if (!text || !speaker) {
        statusMessage.textContent = 'Please enter text and select a voice.';
        return;
    }
    statusMessage.textContent = 'Converting...';
    convertBtn.disabled = true;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ text, speaker, emotion })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || `API request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 200 && result.data && result.data.oss_url) {
            // Handle successful response with audio URL
            const audioUrl = result.data.oss_url;
            audioPlayer.src = audioUrl;
            downloadLink.href = audioUrl;
            audioSection.classList.remove('hidden');
            statusMessage.textContent = 'Conversion successful!';
        } else if (result.message) {
            // Handle API-level errors reported in the JSON body
            throw new Error(`API Error: ${result.message}`);
        } else {
            // Fallback for unexpected response structure
            throw new Error('No audio returned in the response.');
        }
    } catch (err) {
        statusMessage.textContent = 'Error: ' + err.message;
        audioSection.classList.add('hidden');
    } finally {
        convertBtn.disabled = false;
    }
});

// Smooth page transitions (basic)
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.href.endsWith(window.location.pathname)) return;
        e.preventDefault();
        document.body.style.opacity = 0.5;
        setTimeout(() => {
            window.location.href = this.href;
        }, 200);
    });
});
