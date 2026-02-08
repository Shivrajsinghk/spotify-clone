let currentSong = new Audio();
let songs;
let currentFolder;
let autoplay = false;
let isShuffle = false;
let isLoop = false;

// Reset playbar on reload
document.addEventListener("DOMContentLoaded", () => {
    currentSong.pause();
    currentSong.src = "";
    document.querySelector(".songinfo").innerHTML = "Select a song";
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    play.src = "assets/play.svg";
});


function secondsToMinutesSeconds(seconds){
        if (isNaN(seconds) || seconds < 0){
            return "Invalid input";
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }

const getSongs = async (folder) => {
    currentFolder = folder;
    const res = await fetch(`./Songs/${folder}/info.json`);
    const data = await res.json();
    return data.songs; 
}

// Highlight the active song
function highlightActiveSong(track) {
    const cleanTrack = decodeURIComponent(track).replace(/\.mp3$/, "");
    document.querySelectorAll(".song-list li").forEach(li => {
        const name = li.querySelector(".song-info div")?.innerText.trim();
        li.classList.toggle("active", name === cleanTrack);
    });
}

function playMusic(track, pause=false){
    currentSong.src = `./Songs/${currentFolder}/${track}`;
    if(!pause){
        currentSong.play();
        play.src = "assets/pause.svg";
    }
    else{
    play.src = "assets/play.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(/\.mp3$/, "");

    highlightActiveSong(track);

    //Highlight the active album
    document.querySelectorAll(".card").forEach(card => {
        const folder = card.dataset.folder;
        card.classList.toggle("active", folder === currentFolder);
    });

}

// Attach an Event Listener to play, previous and next songs
    play.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!currentSong.src) return; 
        if(currentSong.paused){
            currentSong.play()
            play.src = "assets/pause.svg";
        }
        else{
            currentSong.pause()
            play.src = "assets/play.svg";
        }
    })

async function displayAlbums(){
    const folders = [
        "Bella",
        "Siege",
    ];
    let cardContainer = document.querySelector(".cardContainer");   
    cardContainer.innerHTML = "";
    
    for (const folder of folders) {
        const res = await fetch(`./Songs/${folder}/info.json`);
        const data = await res.json();
        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play-button">▶</div>
                <div class="card-image">
                    <img src="./Songs/${folder}/${data.cover}" />
                </div>
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>
        `;
    }

     // Card
    Array.from(document.querySelectorAll(".card")).forEach((el) => {
        el.addEventListener("click", async (e) => {
            const folder = e.currentTarget.dataset.folder; 
            currentSong.pause();
            currentSong.currentTime = 0;
            play.src = "assets/play.svg";
            autoplay = true;
            main(folder);
        })
    })
} 

 // Previous button
    document.querySelector("#previous").addEventListener("click", () => {
        if (!songs || !currentSong.src) return;
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop())
        let index = songNames.indexOf(currentFile)

        if((index-1) >= 0){
            playMusic(songs[index-1].file)
        }
    })

    // Next button
    document.querySelector("#next").addEventListener("click", () => {
        if (!songs || !currentSong.src) return;
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex].file);
        }
        else {
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songNames.indexOf(currentFile);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1].file);
            }
        }
    })

    // Shuffle
    document.querySelector("#shuffle").addEventListener("click", () => {
        isShuffle = !isShuffle;
        document.querySelector("#shuffle").classList.toggle("active", isShuffle);   
    });

    // Loop
    document.querySelector("#loop").addEventListener("click", () => {
        isLoop = !isLoop;
        currentSong.loop = isLoop;
        document.querySelector("#loop").classList.toggle("active", isLoop);
    });

    // Time Duration
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
        `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });
    currentSong.addEventListener("timeupdate", (e) => {
        if (isNaN(currentSong.duration)) return;
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left=(currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


// Volume and Mute (ADD THIS ONCE, OUTSIDE main())
const volumeSlider = document.querySelector("#range");
const volumeIcon = document.querySelector(".volume > img");

volumeSlider.addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
    updateVolumeIcon();
});

volumeIcon.addEventListener("click", () => {
    if (currentSong.volume > 0) {
        // mute
        currentSong.volume = 0;
        volumeSlider.value = 0;
    } else {
        // unmute to 25%
        currentSong.volume = 0.25;
        volumeSlider.value = 25;
    }
    updateVolumeIcon();
});

function updateVolumeIcon() {
    volumeIcon.src =
        currentSong.volume === 0
            ? "assets/mute.svg"
            : "assets/volume.svg";
}

async function main(folder = "Bella"){
    // Get the list of all the songs
    songs = await getSongs(folder);
    if(autoplay){
        playMusic(songs[0].file);
        autoplay = false;
    }

    let songList = document.querySelector(".song-list ol") 
    songList.innerHTML = ""
    songs.forEach(song => {
    songList.innerHTML += `
        <li>
            <div class="song-left">
                <img width="30" class="invert" src="assets/music.svg">
                <div class="song-info">
                    <div>${song.name}</div>
                </div>
            </div>
            <div class="play-now">
                <span>Play Now</span>
                <img width="26" class="invert" src="assets/play.svg">
            </div>
        </li>`
    });

    songNames = songs.map(song => song.file);

    // Highlight first song if autoplay happened
    if (!currentSong.paused) {
        const currentTrack = decodeURIComponent(
            currentSong.src.split("/").pop()
        ).replace(/\.mp3$/, "");

        highlightActiveSong(currentTrack);
    }

    // Attach an Event Listener to each song
    songList.querySelectorAll("li").forEach((el) => {
        el.addEventListener("click", (e) => {
            const index = Array.from(songList.children).indexOf(el);
            playMusic(songs[index].file);
        })
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width * 100)
        document.querySelector(".circle").style.left=percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // Hamburger
    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left="0%";
    })

    // Close Hamburger
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector(".left").style.left="-120%";
    })
}

// Auto Play
currentSong.addEventListener("ended", () => {
    if (isLoop) return; 

    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        playMusic(songs[randomIndex].file);
    } else {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songNames.indexOf(currentFile);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].file);
        }
    }
});

// Search
document.querySelector("#searchInput").addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    document.querySelectorAll(".song-list li").forEach(li => {
        const songName = li
            .querySelector(".song-info div")
            .innerText
            .toLowerCase();

        li.style.display = songName.includes(query) ? "flex" : "none";
    });
});

displayAlbums()

main("Bella")
