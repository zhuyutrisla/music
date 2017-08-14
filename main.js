console.log(window.innerWidth);

console.log(window.devicePixelRatio);

var width = document.documentElement.clientWidth 

var scale = width / 375
var css = `
html{
	font-size: ${375 * scale/10}px;
}
`

document.write(`<style>${ css }</style>`)

var url = document.querySelector('audio').src;
var audio = new Audio();
audio.src = url;
var playPromise = audio.play();
if (playPromise !== undefined) {
      playPromise.then(function() {
         audio.addEventListener('timeupdate',function() {
            console.log(audio.currentTime, audio.duration);
         }, true);
      }).catch(function(error) {
            console.error('Failed to start your sound, retrying.');
      });
}

var music = $("audio")[0];
var lyricArr = [];

$('.close-page').on('click',function(){
    window.close()

})


$('.start').on('click',function(){
	if (music.paused) {
    musicPlay()
    }
    $('.start').addClass('fillColor').siblings().removeClass('fillColor')
})

$('.pause').on('click',function(){
    pause()
    $('.pause').addClass('fillColor').siblings().removeClass('fillColor')
})

$('#love').on('click',function(){
  //console.log(1)
  if (!$('#love').hasClass('becomered')){
    $('#love').addClass('becomered')
  }else{
    $('#love').removeClass('becomered')
  }

})


$('.next').on('click',function(){
  getMusic()
  $('.next').addClass('fillColor').siblings().removeClass('fillColor')
})

$('.change').on('click',function(){
	getChannel()
})

$('#lyric').on('click',function(){
	console.log(1)
	if ( $('.background').css('display') !== "none"){
      $('.background').hide()
			$('#lyric').css({fill:"white"})
    }else{
      $('.background').show()
      $('#lyric').css({fill:"yellow"})
    }
})


function musicPlay(){
  music.play()
  
}


function pause(){
	music.pause();

}
function getChannel(){
  $.ajax({
    url: 'https://jirenguapi.applinzi.com/fm/getChannels.php',
    type: 'GET',
    dataType: 'json'
  }).done(function(response){
    var channels = response.channels
    var num = Math.floor(Math.random()*channels.length)
    var channelname = channels[num].name
    var channelId = channels[num].channel_id
    $('.record').text(channelname);
    $('.record').attr('title',channelname);
    $('.record').attr('data-id',channelId);   
    getMusic()
  }).fail(function(){
    alert('获取数据失败')
  })
}

function getMusic(){
  var channelRecord = $('.record').attr('data-id')
  $.get('https://jirenguapi.applinzi.com/fm/getSong.php',{channel: channelRecord})
   .done(function(response){
    var song=JSON.parse(response)
    var resource = song.song[0]
        url = resource.url
        backgroundPic = resource.picture
        sid = resource.sid
        author = resource.artist
        title = resource.title
        //console.log(song)
    $('audio').attr('src',url)
    $('audio').attr('sid',sid)
    $('.musicname').text(title)
    $('.musicer').text(author)
    musicPlay()
    getLyric()

})
  
}



function getLyric(){
	var songLyric = $('audio').attr('sid');
    //console.log(songLyric)
  $.post('https://jirenguapi.applinzi.com/fm/getLyric.php', {sid:songLyric}).done(function(data){
    var lyricdata = JSON.parse(data)
    //console.log(lyricdata.lyric)

   	if (!!lyricdata.lyric) {
    	$('.music-lyric .lyric').empty();//清空歌词信息
    	var line = lyricdata.lyric.split('\n');//歌词为以排数为界的数组
          var timeReg = /\[\d{2}:\d{2}.\d{2}\]/g;//时间的正则
          var result = [];
          if(line != ""){
              for(var i in line){//遍历歌词数组
                  var time = line[i].match(timeReg);//每组匹配时间 得到时间数组
                  if(!time)continue;//如果没有 就跳过继续
                  var value = line[i].replace(timeReg,"");// 纯歌词
                  for(j in time){//遍历时间数组
                      var t = time[j].slice(1, -1).split(':');//分析时间  时间的格式是[00:00.00] 分钟和毫秒是t[0],t[1]
                      //把结果做成数组 result[0]是当前时间，result[1]是纯歌词
                      var timeArr = parseInt(t[0], 10) * 60 + parseFloat(t[1]); //计算出一个curTime s为单位
                      result.push([timeArr, value]);
                  }
              }
          }
        //时间排序
        result.sort(function (a, b) {
            return a[0] - b[0];
        });
        lyricArr = result;//存到lyricArr里面
        //console.log(lyricArr)
        renderLyric();//渲染歌词
  	}
    

  }).fail(function(){
        	$('.music-lyric .lyric').html("<li>本歌曲展示没有歌词</li>");
        })
}

function renderLyric(){
	var lyrLi = "";
    for (var i = 0; i < lyricArr.length; i++) {
    	if (lyricArr[i][1] === "音乐来自百度FM, by 饥人谷"){
    		lyricArr[i][1] = "音乐来自百度FM, --祝余"
    	}

        lyrLi += "<li data-time='"+lyricArr[i][0]+"'>"+lyricArr[i][1]+"</li>";
    }
    $('.music-lyric .lyric').append(lyrLi);
    setInterval(showLyric,100);//怎么展示歌词
}

function showLyric(){

    var liH = $(".lyric li").eq(5).outerHeight()-3; //每行高度
    for(var i=0;i< lyricArr.length;i++){//遍历歌词下所有的li
        var curT = $(".lyric li").eq(i).attr("data-time");//获取当前li存入的当前一排歌词时间
        var nexT = $(".lyric li").eq(i+1).attr("data-time");
        var curTime = music.currentTime;
        if ((curTime > curT) && (curT < nexT)){//当前时间在下一句时间和歌曲当前时间之间的时候 就渲染 并滚动
            $(".lyric li").removeClass("active");
            $(".lyric li").eq(i).addClass("active");
            $('.music-lyric .lyric').css('top', -liH*(i-2));
        }

    }

}
setInterval(present,500)	//每0.5秒计算进度条长度
$(".basebar").mousedown(function(ev){  //拖拽进度条控制进度
	var posX = ev.clientX;
    
	var targetLeft = $(this).offset().left;
	var percentage = (posX - targetLeft)/$('.basebar').width()*100;
	music.currentTime = music.duration * percentage/100;
});
function present(){
	var length = music.currentTime/music.duration*100;
	$('.progressbar').width(length+'%');//设置进度条长度
	//自动下一曲
	if(music.currentTime == music.duration){
		getMusic()
	}
}

document.ready(getMusic())
