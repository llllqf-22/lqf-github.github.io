var audio = document.getElementById('audioTag');
var playPause = document.getElementsByClassName('playPause')[0];
var recordImg = document.getElementsByClassName('record-img')[0];
var body = document.body;
var musicTitle = document.getElementsByClassName('music-title')[0];
var authorName = document.getElementsByClassName('author-name')[0];
var beforeMusic = document.getElementsByClassName('beforeMusic')[0];
var nextMusic = document.getElementsByClassName('nextMusic')[0];
var playedTime = document.getElementsByClassName('played-time')[0];
var totalTime = document.getElementsByClassName('audio-time')[0];
var progressPlayed = document.getElementsByClassName('progress-played')[0];
var playMode = document.getElementsByClassName('playMode')[0];
var totleProgress = document.getElementsByClassName('progress')[0];
var volumn = document.getElementsByClassName('volumn')[0];
var volumnTogger = document.getElementById('volumn-togger');
var speed = document.getElementsByClassName('speed')[0];
var listIcon = document.getElementsByClassName('list')[0];
var closeList = document.getElementsByClassName('close-list')[0];
var musicList = document.getElementsByClassName('musicList-container')[0];
var musicNameList = document.getElementsByClassName('musics-list')[0];

// 添加MV相关变量
var mv = document.getElementsByClassName('MV')[0];
var mvContainer = null; // MV视频容器
var isMvMode = false; // 是否处于MV模式

var musicId = 0;
var musicData = [
    ['大湾鸡舞曲', '25216950112'],
    ['Sunflower', '25216950112'],
    ['I Really Want to Stay at Your House', '25216950112'],
    ['Cruel Summer', '25216950112'],
];

// MV数据（假设每首歌都有对应的MV）
var mvData = [
    './mp4/video0.mp4',
    './mp4/video1.mp4',
    './mp4/video2.mp4',
    './mp4/video3.mp4'
];

function initMusic() {
    audio.src = `./mp3/music${musicId}.mp3`;
    audio.load();
    recordImg.classList.remove('rotate-play');
    
    audio.onloadedmetadata = function() {
        recordImg.style.backgroundImage = `url('./img/record${musicId}.jpg')`;
        body.style.backgroundImage = `url('./img/bg${musicId}.png')`;
        refreshRotate();
        musicTitle.innerText = musicData[musicId][0];
        authorName.innerText = musicData[musicId][1];

        // 如果处于MV模式，加载对应的MV
        if (isMvMode && mvContainer) {
            loadCurrentMv();
        }

        totalTime.innerText = transTime(audio.duration);
        audio.currentTime = 0;
        updateProgress();
    };
}

initMusic();

function initAndplay() {
    initMusic();
    audio.play();
    playPause.classList.remove('icon-play');
    playPause.classList.add('icon-pause');
    rotateRecord();
}

playPause.addEventListener('click', function() {
    if (audio.paused) {
        audio.play();
        rotateRecord();
        playPause.classList.remove('icon-play');
        playPause.classList.add('icon-pause');
    } else {
        audio.pause();
        rotateRecordStop();
        playPause.classList.remove('icon-pause');
        playPause.classList.add('icon-play');
    }
});

function rotateRecord() {
    recordImg.style.animationPlayState = 'running';
}

function rotateRecordStop() {
    recordImg.style.animationPlayState = 'paused';
}

function refreshRotate() {
    recordImg.classList.add('rotate-play');
}

// 统一的下一首函数
function playNext() {
    if (isMvMode) {
        closeMv();
    }
    musicId++;
    if (musicId >= musicData.length) {
        musicId = 0;
    }
    initAndplay();
}

// 统一的上一首函数 - 修复了逻辑错误
function playPrev() {
    if (isMvMode) {
        closeMv();
    }
    musicId--;
    if (musicId < 0) {  // 修复这里：把 <= 改为 <
        musicId = musicData.length - 1;
    }
    initAndplay();
}

// 绑定事件
nextMusic.addEventListener('click', playNext);
beforeMusic.addEventListener('click', playPrev);

function transTime(value) {
    var hour = parseInt(value / 3600);
    var minutes = parseInt((value % 3600) / 60);
    var seconds = parseInt(value % 60);

    if (hour > 0) {
        return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', updateProgress);

function updateProgress() {
    playedTime.innerText = transTime(audio.currentTime);
    var value = audio.currentTime / audio.duration;
    progressPlayed.style.width = value * 100 + '%';
}

var modeId = 1;
playMode.addEventListener('click', function() {
    modeId++;
    if (modeId > 3) {
        modeId = 1;
    }
    playMode.style.backgroundImage = `url('./img/mode${modeId}.png')`;
});

audio.addEventListener('ended', function() {
    if (isMvMode) {
        closeMv();
    }

    if (modeId == 2) {
        musicId = (musicId + 1) % musicData.length;
    } else if (modeId == 3) {
        var oldId = musicId;
        while (true) {
            musicId = Math.floor(Math.random() * musicData.length);
            if (musicId != oldId) {
                break;
            }
        }
    }

    // 如果MV模式开启，自动播放下一首的MV
    if (isMvMode && musicId < mvData.length) {
        initAndplay();
        openMv();
    } else {
        initAndplay();
    }
});

totleProgress.addEventListener('mousedown', function(event) {
    if (!audio.paused || audio.currentTime != 0) {
        var pgswidth = totleProgress.getBoundingClientRect().width;
        var rate = event.offsetX / pgswidth;
        audio.currentTime = audio.duration * rate;
        updateProgress();
    }
});

// 音量调节
let lastVolumn = 70;
audio.volume = lastVolumn / 100;
volumnTogger.addEventListener('input', updateVolumn);

function updateVolumn() {
    audio.volume = volumnTogger.value / 100;
}

volumn.addEventListener('click', setNoVolumn);

// 点击音量按钮
function setNoVolumn() {
    audio.muted = !audio.muted;
    if (audio.muted) {
        lastVolumn = volumnTogger.value;
        volumnTogger.value = 0;
        volumn.style.backgroundImage = `url('./img/静音.png')`;
    } else {
        volumnTogger.value = lastVolumn;
        volumn.style.backgroundImage = `url('./img/音量.png')`;
    }
}

speed.addEventListener('click', function() {
    var speedText = speed.innerText;
    if (speedText == '1.0X') {
        speed.innerText = '1.5X';
        audio.playbackRate = 1.5;
    } else if (speedText == '1.5X') {
        speed.innerText = '2.0X';
        audio.playbackRate = 2.0;
    } else if (speedText == '2.0X') {
        speed.innerText = '0.5X';
        audio.playbackRate = 0.5;
    } else if (speedText == '0.5X') {
        speed.innerText = '1.0X';
        audio.playbackRate = 1.0;
    }
});

listIcon.addEventListener('click', function() {
    musicList.classList.remove('list.hide');
    musicList.classList.add('list.show');
    closeList.style.display = 'block';
    musicList.style.display = 'block';
});

closeList.addEventListener('click', function() {
    musicList.classList.remove('list.show');
    musicList.classList.add('list.hide');
    closeList.style.display = 'none';
    musicList.style.display = 'none';
});

// 创建列表歌单
function createMusicList() {
    for (let i = 0; i < musicData.length; i++) {
        let div = document.createElement('div');
        div.innerText = `${musicData[i][0]}`;

        musicNameList.appendChild(div);
        div.addEventListener('click', function() {
            if (isMvMode) {
                closeMv();
            }
            musicId = i;
            initAndplay();
        });
    }
}

document.addEventListener('DOMContentLoaded', createMusicList);

// 创建MV容器函数
function createMvContainer() {
    if (mvContainer) return;

    mvContainer = document.createElement('div');
    mvContainer.className = 'mv-container';
    mvContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 1000;
        display: none;
        justify-content: center;
        align-items: center;
    `;

    var video = document.createElement('video');
    video.id = 'mvVideo';
    video.style.cssText = `
        max-width: 100%;
        max-height: 100%;
    `;
    video.controls = true;

    var closeBtn = document.createElement('div');
    closeBtn.className = 'close-mv';
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        color: white;
        font-size: 50px;
        cursor: pointer;
        z-index: 1001;
        background-color: rgba(0,0,0,0.5);
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    closeBtn.addEventListener('click', function() {
        closeMv();
    });

    mvContainer.appendChild(video);
    mvContainer.appendChild(closeBtn);
    document.body.appendChild(mvContainer);

    // 点击MV容器背景关闭
    mvContainer.addEventListener('click', function(e) {
        if (e.target === mvContainer) {
            closeMv();
        }
    });

    // 监听视频播放结束
    video.addEventListener('ended', function() {
        closeMv();
    });
}

// 加载当前MV
function loadCurrentMv() {
    if (!mvContainer || !isMvMode) return;

    var video = document.getElementById('mvVideo');
    if (musicId < mvData.length) {
        video.src = mvData[musicId];
        video.load();

        // 同步音频时间到MV
        video.currentTime = audio.currentTime;

        // 播放MV视频
        video.play().catch(function(error) {
            console.log('MV播放失败:', error);
        });
    }
}

// 打开MV
function openMv() {
    if (musicId >= mvData.length) {
        alert('当前歌曲暂无MV');
        return;
    }

    createMvContainer();
    isMvMode = true;

    // 暂停音频（MV播放时会播放视频音频）
    audio.pause();
    rotateRecordStop();
    playPause.classList.remove('icon-pause');
    playPause.classList.add('icon-play');

    // 显示MV容器
    mvContainer.style.display = 'flex';

    // 加载并播放MV
    loadCurrentMv();

    // 隐藏主界面
    document.querySelector('.upper-container').style.opacity = '0.3';
    document.querySelector('.bottom-container').style.opacity = '0.3';
}

// 关闭MV
function closeMv() {
    if (!mvContainer) return;

    var video = document.getElementById('mvVideo');
    video.pause();
    mvContainer.style.display = 'none';
    isMvMode = false;

    // 恢复主界面
    document.querySelector('.upper-container').style.opacity = '1';
    document.querySelector('.bottom-container').style.opacity = '1';

    // 如果音频之前是播放状态，继续播放
    if (!audio.paused) {
        audio.play();
        rotateRecord();
        playPause.classList.remove('icon-play');
        playPause.classList.add('icon-pause');
    }
}

// MV按钮点击事件
mv.addEventListener('click', function() {
    if (isMvMode) {
        closeMv();
    } else {
        openMv();
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMvMode) {
        closeMv();
    }
});