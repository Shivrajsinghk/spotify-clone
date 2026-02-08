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
    currentFolder = folder
    let fetchapi = await fetch(`http://127.0.0.1:63900/PROJECTS/Spotify%20Clone/${folder}/`) 
    let response = await fetchapi.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let a = Array.from(div.querySelectorAll("a")).filter(a => a.href.endsWith(".mp3"));
    return a;
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
    currentSong.src = `/PROJECTS/Spotify Clone/${currentFolder}/` + track;
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
        card.classList.toggle(
            "active",
            `Songs/${folder}` === currentFolder
        );
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
    let cardContainer = document.querySelector(".cardContainer");   
    cardContainer.innerHTML = "";
    let fetchapi = await fetch(`http://127.0.0.1:63900/PROJECTS/Spotify%20Clone/Songs/`) 
    let response = await fetchapi.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let array = Array.from(div.getElementsByClassName("icon")).slice(1)
    for(let i=0;i<array.length;i++){
        const el = array[i]
        if(el.href.includes("/Songs")){
        let folder = el.href.split("/").pop().replace("%20", " ")
            let fetchapi = await fetch(`http://127.0.0.1:63900/PROJECTS/Spotify%20Clone/Songs/${folder}/info.json`) 
            let response = await fetchapi.json();
            let cardContainer = document.querySelector(".cardContainer");
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                            <div class="play-button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/></svg>
                            </div>
                            <div class="card-image">
                                <img src="Songs/${folder}/cover.jpg" alt="${folder} Cover">
                            </div>
                                <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`
        }
    }
    
     // Card
    Array.from(document.querySelectorAll(".card")).forEach((el) => {
        el.addEventListener("click", async (e) => {
            const folder = e.currentTarget.dataset.folder; 
            currentSong.pause();
            currentSong.currentTime = 0;
            play.src = "assets/play.svg";
            autoplay = true;
            main(`Songs/${folder}`);
        })
    })
} 

 // Previous button
    document.querySelector("#previous").addEventListener("click", () => {
        if (!songs || !currentSong.src) return;
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop())
        let index = songNames.indexOf(currentFile)

        if((index-1) >= 0){
            playMusic(songs[index-1].href.split("/").pop())
        }
    })

    // Next button
    document.querySelector("#next").addEventListener("click", () => {
        if (!songs || !currentSong.src) return;
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            playMusic(songs[randomIndex].href.split("/").pop());
        }
        else {
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
            let index = songNames.indexOf(currentFile);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1].href.split("/").pop());
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

async function main(folder = "Songs/Bella"){
    // Get the list of all the songs
    songs = await getSongs(folder);
    if(autoplay){
        playMusic(songs[0].href.split("/").pop());
        autoplay = false;
    }

    let songList = document.querySelector(".song-list ol") 
    songList.innerHTML = ""
    for (const song of songs){
        let songHref = song.href
        let cleanSong = songHref.split("/").pop()
        let superCleanSong = cleanSong.replace(/%20/g, " ")
        songList.innerHTML += `<li>
                            <div class="song-left">
                                <img width="30px" class="invert" src="assets/music.svg" alt="music">
                                <div class="song-info">
                                    <div>${superCleanSong.replace(/\.mp3$/, "")}</div>
                                    <div></div>
                                </div>
                            </div>
                            <div class="play-now">
                                <span>Play Now</span>
                                <img width="26px" class="invert" src="assets/play.svg" alt="play">
                            </div>
                        </li>`
    }

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
            let track = el.querySelector(".song-info").firstElementChild.innerHTML.trim();
            playMusic(track + ".mp3");
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

    songNames = songs.map(song =>
        decodeURIComponent(song.href.split("/").pop())
    );

    // Volume Button
    document.querySelector("#range").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value)/100
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    })

    // Mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if(e.target.src.includes("volume.svg")){
            document.querySelector("#range").value = 0
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0
        }
        else{
            document.querySelector("#range").value = 25
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.25
        }
    })
}

// Auto Play
currentSong.addEventListener("ended", () => {
    if (isLoop) return; 

    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        playMusic(songs[randomIndex].href.split("/").pop());
    } else {
        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songNames.indexOf(currentFile);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].href.split("/").pop());
        }
    }
});


// Search
const searchInput = document.querySelector("#searchInput");
searchInput.addEventListener("input", () => {
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
main("Songs/Bella")