/**
 * OPERATION: STEAL THE ACORN - Main Application Bootstrapper
 * Presented by TEAM MARVELZ
 */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Game Instance
  const game = new window.Game();
  window.gameInstance = game;

  const ui = window.uiManager;
  const audio = window.soundEngine;
  const storage = window.storageManager;
  const multi = window.multiplayerEngine;

  // 2. Black Intro Sequence ("TEAM MARVELZ PRESENTS")
  const introLayer = document.getElementById('screenIntro');
  let introSkipped = false;

  const finishIntro = () => {
    if (introSkipped) return;
    introSkipped = true;
    audio.playMusic('home');
    storage.markIntroSeen();
    ui.showScreen('screenHome');
  };

  // Play intro audio & set auto timer
  audio.playMusic('intro');
  const introTimer = setTimeout(finishIntro, 3500);

  // Skip on Space / Enter / Click
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && ui.currentScreen === 'intro') {
      clearTimeout(introTimer);
      finishIntro();
    }
  });

  if (introLayer) {
    introLayer.addEventListener('click', () => {
      clearTimeout(introTimer);
      finishIntro();
    });
  }

  // 3. Home Screen Navigation
  const bindBtn = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bindBtn('btnHomePlay', () => {
    audio.playButtonClick();
    multi.mode = 'single';
    ui.renderCharacterSelection(1, () => {
      game.goToMap();
    });
    ui.showScreen('screenCharSelect');
  });

  bindBtn('btnHomeMultiplayer', () => {
    audio.playButtonClick();
    ui.showScreen('screenMultiplayer');
  });

  bindBtn('btnHomeSettings', () => {
    audio.playButtonClick();
    openSettings();
  });

  bindBtn('btnHomeHowToPlay', () => {
    audio.playButtonClick();
    ui.showScreen('screenHowToPlay');
  });

  bindBtn('btnHomeQuit', () => {
    audio.playButtonClick();
    alert("❄️ Team Marvelz: Stay warm! The Arctic acorn heist awaits your return!");
  });

  // How to Play Back button
  bindBtn('btnHowToPlayBack', () => {
    audio.playButtonClick();
    ui.showScreen('screenHome');
  });

  // 4. Character Select Screen Buttons
  bindBtn('btnConfirmCharSelect', () => {
    audio.playButtonClick();
    game.goToMap();
  });

  bindBtn('btnCharSelectBack', () => {
    audio.playButtonClick();
    ui.showScreen('screenHome');
  });

  // 5. Multiplayer Lobby
  bindBtn('btnStartLocalCoop', () => {
    audio.playButtonClick();
    multi.mode = 'local';
    // Configure P1 and P2 characters
    ui.renderCharacterSelection(1, () => {
      ui.renderCharacterSelection(2, () => {
        game.goToMap();
      });
    });
    ui.showScreen('screenCharSelect');
  });

  bindBtn('btnConnectOnline', () => {
    audio.playButtonClick();
    const statusEl = document.getElementById('onlineStatus');
    if (statusEl) statusEl.textContent = 'Connecting to ws://localhost:3000...';

    multi.connectOnline('ws://localhost:3000', (res) => {
      if (statusEl) statusEl.textContent = res.msg;
      if (res.status === 'connected') {
        multi.mode = 'online';
        const p1Char = storage.getSelectedCharacter(1);
        multi.createRoom(p1Char);
      }
    });
  });

  bindBtn('btnJoinRoom', () => {
    audio.playButtonClick();
    const codeInput = document.getElementById('roomCodeInput');
    const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
    if (!code) {
      alert("Please enter a valid 4-character Room Code!");
      return;
    }
    const p1Char = storage.getSelectedCharacter(1);
    multi.joinRoom(code, p1Char);
  });

  bindBtn('btnMultiplayerBack', () => {
    audio.playButtonClick();
    ui.showScreen('screenHome');
  });

  // 6. Pause Menu
  bindBtn('btnPause', () => { game.pauseGame(); });
  bindBtn('btnResume', () => { game.resumeGame(); });
  bindBtn('btnRestart', () => { audio.playButtonClick(); game.restartLevel(); });
  bindBtn('btnPauseSettings', () => { audio.playButtonClick(); openSettings(); });
  bindBtn('btnPauseMap', () => { audio.playButtonClick(); game.goToMap(); });
  bindBtn('btnPauseHome', () => { audio.playButtonClick(); game.goToHome(); });

  // 7. Settings Modal
  const openSettings = () => {
    const s = storage.getSettings();
    const mSlider = document.getElementById('musicVolume');
    const sSlider = document.getElementById('sfxVolume');
    const mToggle = document.getElementById('muteToggle');

    if (mSlider) mSlider.value = s.musicVolume;
    if (sSlider) sSlider.value = s.sfxVolume;
    if (mToggle) mToggle.checked = s.muted;

    ui.showScreen('screenSettings');
  };

  bindBtn('btnCloseSettings', () => {
    audio.playButtonClick();
    ui.showScreen(game.state === 'paused' ? 'screenPause' : 'screenHome');
  });

  const mSlider = document.getElementById('musicVolume');
  if (mSlider) mSlider.addEventListener('input', (e) => audio.setMusicVolume(parseFloat(e.target.value)));

  const sSlider = document.getElementById('sfxVolume');
  if (sSlider) sSlider.addEventListener('input', (e) => audio.setSfxVolume(parseFloat(e.target.value)));

  const mToggle = document.getElementById('muteToggle');
  if (mToggle) mToggle.addEventListener('change', () => audio.toggleMute());

  bindBtn('btnFullscreenToggle', () => {
    audio.playButtonClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  bindBtn('btnResetProgress', () => {
    if (confirm("Reset all unlocked levels, scores, and acorns?")) {
      storage.resetProgress();
      alert("Progress reset to Stage 1!");
      ui.showScreen('screenHome');
    }
  });

  // 8. Victory & Defeat Modals
  bindBtn('btnVicNextStage', () => {
    audio.playButtonClick();
    if (game.currentLevelIndex + 1 < window.LEVELS.length) {
      game.startLevel(game.currentLevelIndex + 1);
    } else {
      game.goToMap();
    }
  });
  bindBtn('btnVicReplay', () => { audio.playButtonClick(); game.restartLevel(); });
  bindBtn('btnVicMap', () => { audio.playButtonClick(); game.goToMap(); });
  bindBtn('btnVicHome', () => { audio.playButtonClick(); game.goToHome(); });

  bindBtn('btnDefeatRetry', () => { audio.playButtonClick(); game.restartLevel(); });
  bindBtn('btnDefeatMap', () => { audio.playButtonClick(); game.goToMap(); });
  bindBtn('btnDefeatHome', () => { audio.playButtonClick(); game.goToHome(); });

  // Floating Sound Icon Toggle
  bindBtn('headerSoundToggle', () => {
    const isMuted = audio.toggleMute();
    const icon = document.getElementById('soundIcon');
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
  });

  // HUD Hero Swap button click
  bindBtn('hudSwapBadge', () => {
    if (game.state === 'playing' && game.players[0]) {
      game.players[0].cycleCharacter();
    }
  });

  // Pause on ESC
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (game.state === 'playing') game.pauseGame();
      else if (game.state === 'paused') game.resumeGame();
    }
  });
});
