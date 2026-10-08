/* =========================================
   MUSIC PLAYER
========================================= */

const playlist = [
  {
    title: "Only you",
    src: "./music/song0.mp3",
  },
  {
    title: "Chờ anh chút thôi 💖",
    src: "./music/song1.mp3",
  },
  {
    title: "Nép vào vai anh 💖",
    src: "./music/song2.mp3",
  },
  {
    title: "Your last 💖",
    src: "./music/song3.mp4",
  },
];

const music = document.getElementById("bgMusic");

let currentSongIndex = 0;
let isShuffle = false;
let isRepeat = false;

function loadSong(index, shouldPlay = false) {
  if (!playlist.length) return;

  currentSongIndex = (index + playlist.length) % playlist.length;

  const song = playlist[currentSongIndex];

  music.src = song.src;

  document.getElementById("nowPlayingTitle").innerText = song.title;

  renderPlaylist();

  if (shouldPlay) {
    music
      .play()
      .then(() => {
        updatePlayButton();
      })
      .catch(() => {
        updatePlayButton();
      });
  }
}

function renderPlaylist() {
  const container = document.getElementById("playlistContainer");

  container.innerHTML = "";

  playlist.forEach((song, index) => {
    const item = document.createElement("div");

    item.className = "playlist-item";

    if (index === currentSongIndex) {
      item.classList.add("active");
    }

    item.innerHTML = `
      <div class="playlist-number">
        ${index === currentSongIndex && !music.paused ? "▶" : index + 1}
      </div>

      <div class="playlist-song-name">
        ${escapeHtml(song.title)}
      </div>
    `;

    item.onclick = () => {
      loadSong(index, true);
    };

    container.appendChild(item);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

function toggleMusicPlayer() {
  const player = document.getElementById("musicPlayer");

  player.classList.toggle("active");
}

function toggleMusic() {
  if (!playlist.length) return;

  if (!music.src) {
    loadSong(currentSongIndex, true);
    return;
  }

  if (music.paused) {
    music
      .play()
      .then(() => {
        updatePlayButton();
      })
      .catch(() => {});
  } else {
    music.pause();
    updatePlayButton();
  }
}

function updatePlayButton() {
  const button = document.getElementById("musicPlayBtn");

  button.innerText = music.paused ? "▶️" : "⏸️";

  renderPlaylist();
}

function nextSong() {
  if (!playlist.length) return;

  let nextIndex;

  if (isShuffle && playlist.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } while (nextIndex === currentSongIndex);
  } else {
    nextIndex = currentSongIndex + 1;

    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
  }

  loadSong(nextIndex, true);
}

function previousSong() {
  if (!playlist.length) return;

  /*
   * Nếu bài đã chạy quá 3 giây
   * thì Previous sẽ restart bài hiện tại.
   */
  if (music.currentTime > 3) {
    music.currentTime = 0;
    return;
  }

  let previousIndex = currentSongIndex - 1;

  if (previousIndex < 0) {
    previousIndex = playlist.length - 1;
  }

  loadSong(previousIndex, true);
}

function toggleShuffle() {
  isShuffle = !isShuffle;

  document
    .getElementById("shuffleBtn")
    .classList.toggle("mode-active", isShuffle);
}

function toggleRepeat() {
  isRepeat = !isRepeat;

  document
    .getElementById("repeatBtn")
    .classList.toggle("mode-active", isRepeat);
}

music.addEventListener("ended", () => {
  if (isRepeat) {
    music.currentTime = 0;

    music
      .play()
      .then(() => {
        updatePlayButton();
      })
      .catch(() => {});

    return;
  }

  nextSong();
});

music.addEventListener("play", updatePlayButton);

music.addEventListener("pause", updatePlayButton);

music.addEventListener("loadedmetadata", () => {
  document.getElementById("totalMusicTime").innerText = formatMusicTime(
    music.duration,
  );
});

music.addEventListener("timeupdate", () => {
  if (!music.duration) return;

  const progress = (music.currentTime / music.duration) * 100;

  document.getElementById("musicProgress").value = progress;

  document.getElementById("currentMusicTime").innerText = formatMusicTime(
    music.currentTime,
  );
});

document.getElementById("musicProgress").addEventListener("input", (event) => {
  if (!music.duration) return;

  music.currentTime = (event.target.value / 100) * music.duration;
});

function formatMusicTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

/*
 * Browser thường chặn autoplay.
 *
 * Ta thử autoplay trước.
 * Nếu bị block, lần click đầu tiên
 * trên page sẽ unlock audio.
 */

function initializeMusic() {
  if (!playlist.length) return;

  loadSong(0, false);

  music
    .play()
    .then(() => {
      updatePlayButton();
    })
    .catch(() => {
      const unlockAudio = () => {
        music
          .play()
          .then(() => {
            updatePlayButton();
          })
          .catch(() => {});

        document.removeEventListener("click", unlockAudio);

        document.removeEventListener("touchstart", unlockAudio);
      };

      document.addEventListener("click", unlockAudio);

      document.addEventListener("touchstart", unlockAudio);
    });
}

initializeMusic();
