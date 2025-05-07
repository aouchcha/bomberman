window.addEventListener('load', function () {
    const music = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    music.volume = 0.5;
    
    // Add error handling
    music.addEventListener('error', function(e) {
        console.error('Error loading audio:', e);
        musicToggle.textContent = '❌ Music Error';
        musicToggle.disabled = true;
    });

    // Handle music toggle
    musicToggle.addEventListener('click', function() {
        if (music.paused) {
            music.play().then(() => {
                musicToggle.textContent = '🔇 Stop Music';
            }).catch(function(error) {
                console.error('Audio playback failed:', error);
                musicToggle.textContent = '❌ Play Failed';
            });
        } else {
            music.pause();
            musicToggle.textContent = '🔊 Play Music';
        }
    });
});