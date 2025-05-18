document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const timerDisplay = document.getElementById('timer');
    const startButton = document.getElementById('startTimer');
    const writingSpace = document.getElementById('writingSpace');
    const meditationPrompt = document.getElementById('meditationPrompt');
    const startNewSessionButton = document.getElementById('startNewSession');
    const backgroundImageInput = document.getElementById('backgroundImage');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const backgroundImageElement = document.querySelector('.background-image');
    const backgroundOverlay = document.querySelector('.background-overlay');
    const appContainer = document.querySelector('.app-container');

    // State
    let timer;
    let remainingTime = 10; // 15 minutes in seconds
    let isTimerRunning = false;
    let isFullscreen = false;

    // Initialize the app
    function init() {
        loadSavedData();
        setupEventListeners();
        updateTimerDisplay();
    }

    // Load saved data from localStorage
    function loadSavedData() {
        // Load saved writing
        const savedWriting = localStorage.getItem('writing');
        if (savedWriting) {
            writingSpace.value = savedWriting;
        }

        // Load saved background image
        const savedImage = localStorage.getItem('backgroundImage');
        if (savedImage) {
            setBackgroundImage(savedImage);
        }

        // Focus the writing area
        writingSpace.focus();
    }


    // Set up event listeners
    function setupEventListeners() {
        // Timer controls
        startButton.addEventListener('click', toggleTimer);
        startNewSessionButton.addEventListener('click', startNewSession);
        
        // Writing area
        writingSpace.addEventListener('input', saveWriting);
        
        // Background image upload
        backgroundImageInput.addEventListener('change', handleBackgroundUpload);
        
        // Fullscreen toggle
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        // Reset button
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', resetPage);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyDown);
        
        // Auto-save writing every 30 seconds
        setInterval(saveWriting, 30000);
    }

    // Timer functions
    function toggleTimer() {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
        startButton.innerHTML = '<i class="fas fa-pause"></i>';
        startButton.setAttribute('title', 'Pause Timer');
        
        timer = setInterval(() => {
            remainingTime--;
            updateTimerDisplay();

            if (remainingTime <= 0) {
                completeSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isTimerRunning) return;
        
        clearInterval(timer);
        isTimerRunning = false;
        startButton.innerHTML = '<i class="fas fa-play"></i>';
        startButton.setAttribute('title', 'Start Timer');
    }

    function completeSession() {
        clearInterval(timer);
        isTimerRunning = false;
        // Show time's up alert
        alert("Time's up! Take a moment to breathe and reflect on your writing.");
        showMeditationPrompt();
        saveWriting();
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Background image handling
    function setBackgroundImage(imageData) {
        backgroundImageElement.style.backgroundImage = `url(${imageData})`;
        localStorage.setItem('backgroundImage', imageData);
        
        // Adjust overlay based on image brightness
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.naturalWidth || this.width;
            canvas.height = this.naturalHeight || this.height;
            
            try {
                ctx.drawImage(this, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                
                let r = 0, g = 0, b = 0;
                const blockSize = 5; // Sample every 5th pixel for performance
                let count = 0;
                
                for (let i = 0; i < imageData.length; i += 4 * blockSize) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }
                
                const brightness = (r + g + b) / (3 * count);
                const overlayOpacity = Math.min(0.8, Math.max(0.6, 0.9 - (brightness / 255) * 0.5));
                
                backgroundOverlay.style.background = `linear-gradient(135deg, 
                    rgba(10, 10, 10, ${overlayOpacity}) 0%, 
                    rgba(20, 20, 30, ${overlayOpacity - 0.2}) 100%)`;
                    
            } catch (e) {
                console.error('Error processing image:', e);
                // Fallback to default overlay if there's an error
                backgroundOverlay.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(20, 20, 30, 0.7) 100%)';
            }
        };
        
        img.onerror = function() {
            console.error('Error loading image');
            backgroundOverlay.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(20, 20, 30, 0.7) 100%)';
        };
        
        img.src = imageData;
    }

    function handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Fullscreen handling
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            appContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    function handleFullscreenChange() {
        isFullscreen = !!document.fullscreenElement;
        fullscreenBtn.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        fullscreenBtn.setAttribute('title', isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen');
    }

    // Meditation prompt and affirmations
    const affirmations = [
        "You are capable of amazing things.",
        "Every word you write brings value to the world.",
        "Your voice matters and deserves to be heard.",
        "Creativity flows through you effortlessly.",
        "You are growing with every moment.",
        "Your potential is limitless.",
        "You are exactly where you need to be right now.",
        "Every challenge is an opportunity to grow.",
        "You are making progress, one word at a time.",
        "The world needs your unique perspective."
    ];

    let breathingInterval;
    let affirmationInterval;
    let currentAffirmation = 0;
    const affirmationElement = document.createElement('div');
    affirmationElement.className = 'affirmation';
    document.querySelector('.affirmation-message').appendChild(affirmationElement);

    function showMeditationPrompt() {
        meditationPrompt.classList.add('visible');
        document.body.style.overflow = 'hidden';
        
        // Start breathing animation
        startBreathingAnimation();
        
        // Show first affirmation
        currentAffirmation = 0;
        showNextAffirmation();
        
        // Rotate affirmations every 8 seconds
        affirmationInterval = setInterval(showNextAffirmation, 8000);
        
        // Play gentle sound if user interacts
        playGentleSound();
    }

    function showNextAffirmation() {
        const affirmationContainer = document.querySelector('.affirmation');
        affirmationContainer.style.opacity = 0;
        
        setTimeout(() => {
            currentAffirmation = (currentAffirmation + 1) % affirmations.length;
            affirmationContainer.textContent = `"${affirmations[currentAffirmation]}"`;
            affirmationContainer.style.opacity = 1;
        }, 300);
    }

    function startBreathingAnimation() {
        const circle = document.querySelector('.breath-circle');
        const text = document.querySelector('.breathing-guide p');
        let isInhaling = true;
        
        // Initial state
        circle.style.transform = 'scale(1)';
        text.textContent = 'Breathe in...';
        
        breathingInterval = setInterval(() => {
            isInhaling = !isInhaling;
            if (isInhaling) {
                circle.style.transform = 'scale(1.3)';
                text.textContent = 'Breathe in...';
            } else {
                circle.style.transform = 'scale(1)';
                text.textContent = 'Breathe out...';
            }
        }, 4000); // 4 seconds for each breath cycle (inhale + exhale)
    }


    function playGentleSound() {
        // Create a gentle wind chime sound using the Web Audio API
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 2);
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 2);
        } catch (e) {
            console.log('Audio could not be played', e);
        }
    }

    function startNewSession() {
        // Clear intervals
        clearInterval(breathingInterval);
        clearInterval(affirmationInterval);
        
        // Reset meditation prompt
        meditationPrompt.classList.remove('visible');
        document.body.style.overflow = '';
        
        // Reset timer and UI
        remainingTime = 1 * 60; // Reset to 15 minutes
        updateTimerDisplay();
        writingSpace.value = '';
        startButton.innerHTML = '<i class="fas fa-play"></i>';
        startButton.setAttribute('title', 'Start Timer');
        
        // Clear local storage if reset is requested
        if (confirm('Start a new session? This will clear your current writing.')) {
            localStorage.removeItem('writing');
            writingSpace.value = '';
        }
        
        // Focus writing space after a short delay
        setTimeout(() => {
            writingSpace.focus();
        }, 100);
    }
    
    // Add page reset functionality
    function resetPage() {
        if (confirm('Are you sure you want to reset everything? This will clear all your writing and settings.')) {
            // Clear all local storage
            localStorage.clear();
            
            // Reset UI
            writingSpace.value = '';
            remainingTime = 1 * 60;
            updateTimerDisplay();
            
            // Reset background to default
            backgroundImageElement.style.backgroundImage = '';
            backgroundOverlay.style.background = 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(20, 20, 30, 0.7) 100%)';
            
            // Reset timer button
            startButton.innerHTML = '<i class="fas fa-play"></i>';
            startButton.setAttribute('title', 'Start Timer');
            
            // Focus writing area
            writingSpace.focus();
            
            alert('All settings have been reset to default.');
        }
    }

    // Save writing to localStorage
    function saveWriting() {
        localStorage.setItem('writing', writingSpace.value);
    }

    // Handle keyboard shortcuts
    function handleKeyDown(e) {
        // Toggle timer with Space (when not typing in the textarea)
        if (e.code === 'Space' && e.target !== writingSpace) {
            e.preventDefault();
            toggleTimer();
        }
        
        // Toggle fullscreen with F11
        if (e.code === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // Start new session with Escape
        if (e.code === 'Escape' && meditationPrompt.classList.contains('visible')) {
            startNewSession();
        }
    }

    // Initialize the app
    init();
});
