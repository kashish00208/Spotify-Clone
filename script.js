let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder){
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let responce = await a.text();
    let div = document.createElement("div")
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a");
        songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3"))
        songs.push(element.href.split(`/${folder}/`)[1]);
    }


    //show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <i class="fa-solid fa-music "></i>
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>kashish</div>
                            </div>\
                            <div class="playnow">
                                <span>play now</span>
                                <i class="fa-solid fa-play "></i>
                            </div> </li>`;    
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
        
    })
    return songs;
}
const playMusic = (track,pause=false) =>{
   
    currentSong.src =`/${currfolder}/` + track;
    
    if(!pause){
        currentSong.play();
        play.src = "img/pause.svg";
    }
    
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let responce = await a.text();
    let div = document.createElement("div")
    div.innerHTML = responce;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if(e.href.includes("/songs/")){
            let folder = (e.href.split("/").slice(-1)[0])
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let responce = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML+ `<div data-folder="${folder}" class="card">
            <div  class="play">
                <i class="fa-solid fa-play invert"></i>
            </div>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${responce.tittle}</h2>
            <p>${responce.description}</p>
        </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic((songs[0]))
        })
    })
}
async function main(){
    
    await getSongs("songs/ncs");
    playMusic(songs[0],true)
    
    displayAlbums();

    //attach an event listener to play pause and nxt previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else{
           currentSong.pause(); 
           play.src = "img/play.svg"
        }
    })


    //listen for timeupdate
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //update seek bar
    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";
    })
    //close buttin
    document.querySelector(".close").addEventListener("click",()=>{

        document.querySelector(".left").style.left = "-120%";
    })


    //event listener to previous and next
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1)>0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length -1){
            playMusic(songs[index+1])
        }
    })

    //event to volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    
    //event listener to mute button
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","img/mute.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = .1; 
        }
    })

}
main();

