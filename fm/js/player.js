
/*1.做音乐Fm组件,引入js后就可以自动加载随机的音乐，加载html，绑定事件
 *2.该组件的prototype中写功能，自动播放功能，选择音乐类型，暂停，播放，下一首，调音量，调音乐进度，各种事件效果
 *3.
 * */
var player = {
    init : function($node){
        this.linkCss();
        this.createPlayer();
        this.player= $node;
        this.curId = null;
        this.lyricArr=[];
        this.data = [];
        this.currentTime = null;
        this.ctLyric =  $(".lyric");
        this.typeMenu = $('.fm-type');
        this.bindEvent();
        this.getSong();
        this.getChannels();
    },
    linkCss : function(){
        var  link= '<link rel="stylesheet" href="css/index.css">';
        $("head").append(link);
    },
    createPlayer: function(){
        var playHtml='<div id="play" class="clearFix"><div id="toggle"><i class="icon iconfont icon-music"></i>'+
            '</div> <div class="screen" ><div class="play-ct clearFix"><div class="play-menu pull-left">'+
            '<ul class="fm-type"></ul></div><div class="play-main pull-left"> <div class="main-head center ">'+
            '<i class="icon iconfont icon-menu"></i><div class="song-name"></div>'+
            '<i class="icon iconfont icon-gantanhao"></i><span class="my-info">create by lynn</span></div><span class="time-outline">'+
            '<span class="time"></span><span class="time-after"></span></span>'+
            '<div class="clearFix time-num"><span class="pull-left curTime">00:00:00</span>'+
            '<span class="pull-right durTime">00:00:00</span></div><div class="song-lyric">'+
            '<ul class="lyric"></ul></div><div class="song-disc disc-animation">'+
            '<iframe id="frame" src="frame.html" frameborder="0" crossorigin="anonymous"></iframe>'+
            '</div><div class="disc-control"><i class="icon iconfont icon-pause"></i>'+
            '</div><div class="main-foot clearFix"><span class="pull-left">'+
            '<i class="icon iconfont icon-kuaijin"></i></span><span class="vol-ct" style="display: none">'+
            '<span class="vol-outline"><span class="vol"></span><span class="vol-after"></span>'+
            '</span></span><span class="pull-right"><i class="icon iconfont icon-yinliang"></i>'+
            '</span></div></div></div></div></div>';
        $('body').append(playHtml);
    },
    bindEvent : function(){
        var $this = this;
        $(".icon-menu").on("mouseover",function(){
            $(".play-menu").animate({left:0},500);
        });
        $(".play-menu").on("mouseleave",function(){
            $(".play-menu").animate({left:'-111px'},500);
        });
        $("#toggle").on("click",function(){
            $(".screen").slideToggle(500);
        });
        $(".disc-control").on("click",".icon",function(){
            if($(this).hasClass("icon-play")){
                $(this).removeClass("icon-play").addClass("icon-pause");
                $(".disc-animation").removeClass("pause");
                $this.startPlay();
            }else{
                $(this).removeClass("icon-pause").addClass("icon-play");
                $(".disc-animation").addClass("pause");
                $this.pause();
            }
        });
        $(".icon-yinliang").on("click",function(){
            $(".vol-ct").fadeToggle(500);
        })
        $this.typeMenu.on("click","li",function() {
            $(this).addClass("active").siblings().removeClass("active");
            curId = $(this).attr("data-id");
            $this.getSong(curId);
        });
        $('.time-outline').on('click',function(e){  //  点击 调节播放进度
            $this.currentTime=((e.pageX-$(this).offset().left)/200)*$('#frame').contents().find('#player')[0].duration;
            $('#frame').contents().find('#player')[0].currentTime=$this.currentTime;
            $(".time-after").css('left', e.pageX-$(this).offset().left+'px');
            $('.time').css('width', e.pageX-$(this).offset().left);
        });
        $('.vol-outline').on('click',function(e){  //  点击 调节音量
            $('.vol-after').css('left', e.pageX-$(this).offset().left+'px');
            $('.vol').css('width', e.pageX-$(this).offset().left);
            $this.volume =(e.pageX-$(this).offset().left)/150;
            $('#frame').contents().find('#player')[0].volume=$this.volume;
        });
        $(".icon-kuaijin").on("click",function(){
            var curId = $this.typeMenu.find(".active").attr("data-id");
            $this.getSong(curId);
        });
        $(".icon-gantanhao").on("mouseover",function(){
            $(".my-info").fadeIn(400);
        }).on("mouseleave",function(){
            $(".my-info").fadeOut(400);
        });
    },
    getChannels : function(){
        var $this = this;
        $.get('http://api.jirengu.com/fm/getChannels.php')
            .done(function(msg){
                var chanel = "";
                var fmInfo=JSON.parse(msg);
               //console.log(fmInfo);
                for(var i in fmInfo.channels){
                    chanel += '<li data-id = '+fmInfo.channels[i].channel_id+'>'+fmInfo.channels[i].name+'</li>'
                }
                $this.typeMenu.append(chanel);
            });
    },
    getSong : function(curId){
        var $this = this;
        $this.curId = curId || 8;
        $.get('http://api.jirengu.com/fm/getSong.php',{channel: $this.curId})
            .done(function(song){
                //console.log(song);
                var songData=JSON.parse(song);
                //console.log(songData)
                for(var i in songData.song){
                    // console.log(songData.song)
                    $this.data = [songData.song[i].ssid,songData.song[i].sid];
                    $(".song-name").text(songData.song[i].title+ ' by  '+songData.song[i].artist);
                    $(".song-disc").css({"background-image":"url("+songData.song[i].picture+")"});
                    $('#frame').contents().find('#player').attr({'src': songData.song[i].url,'data-songId':songData.song[i].sid});
                    $this.ctLyric.html("<li>本歌曲展示没有歌词</li>");
                }
                $this.startPlay();
            })
    },
    startPlay: function() {     // 开始播放
        $('#frame').contents().find('#player')[0].play();
        this.progress();
    },
    pause : function(){
        $('#frame').contents().find('#player')[0].pause();
    },
    progress : function(){
        var $this = this;
        $('#frame').contents().find('#player').on('timeupdate',function () {
            //音乐当前位置
            var cur = Math.floor(this.currentTime);
            //音乐长度
            var dur = Math.floor(this.duration);
            //进度条时间
            $(".curTime").text($this.formatTime(cur));
            $(".durTime").text($this.formatTime(dur));
            $this.setVal(cur,dur);
        });
        $this.postLyric();
    },
    formatTime : function(num){
        var secs = 1,
            mins = secs * 60,
            hs = mins * 60;
        var sec = Math.floor(((num%hs)%mins)/secs),
            min =  Math.floor((num%hs)/mins),
            h = Math.floor(num/hs);
        return h+':'+min+':'+sec;
    },
    setVal : function(cur,dur){
        $('.time-after').css('left', cur/dur*100+'%');
        $('.time').css('width',cur/dur * 100+'%');
    },
    postLyric : function(){
        var $this = this;
        $.post('http://api.jirengu.com/fm/getLyric.php', {ssid: $this.data[0], sid: $this.data[1]})
            .done(function (lyr) {
                var lyr = eval("(" + lyr + ")");
                //console.log(lyr);//如果不报错
                if(!!lyr.lyric){
                    $this.ctLyric.empty();//先清空歌词内部
                    var line = lyr.lyric.split('\n');//歌词为以排数为界的数组
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
                    $this.lyricArr = result;//存到lyricArr里面
                    // console.log($this.lyricArr);
                    $this.renderLyric();//渲染歌词
                };
            }).fail(function(){
            $this.ctLyric.html("<li>本歌曲展示没有歌词</li>");
        });
    },
    renderLyric : function(){
        var lyrLi = "";
        for (var i = 0, l = this.lyricArr.length; i < l; i++) {
            lyrLi += "<li data-time='"+this.lyricArr[i][0]+"'>"+this.lyricArr[i][1]+"</li>";
        }
        //console.log(lyrLi);
        this.ctLyric.append(lyrLi);
        this.setTime();//怎么展示歌词
    },
    setTime : function(){
        var $this = this;
        setInterval(function(){
            $this.showLyric();
        },200)
    },
    showLyric : function(){
        var $this = this,
            liH = $(".lyric li").eq(5).outerHeight(true); //每行高度
        for(var i=0;i< $this.lyricArr.length;i++){//遍历歌词下所有的li
            var curT = $(".lyric li").eq(i).attr("data-time");//获取当前li存入的当前一排歌词时间
            var nexT = $(".lyric li").eq(i+1).attr("data-time");
            var curTime = $('#frame').contents().find('#player')[0].currentTime;
            if ((curTime > curT) && (curT < nexT)){//当前时间在下一句时间和歌曲当前时间之间的时候 就渲染 并滚动
                $(".lyric li").removeClass("active");
                $(".lyric li").eq(i).addClass("active");
                $this.ctLyric.css('top', -liH*i);
            }
        }

    }
};
var Drag = {
    init : function(dragDiv){
        this.dragDiv =dragDiv;
        this.dragDiv.css('position','absolute');
        this.bind();
    },
    bind :function(){
        $this = this;
        this.dragDiv.on("mousedown",function(e){
            $this.dragDiv.css({
                cursor:'move'
            });
            $this.dragging = true;
            $this.dragDiv.X = e.pageX - $this.dragDiv.offset().left;
            $this.dragDiv.Y = e.pageY - $this.dragDiv.offset().top;
        });
        this.dragDiv.on("mousemove",function(e){
            if($this.dragging){
                $this.dragDiv.css({
                    left : e.pageX-$this.dragDiv.X,
                    top : e.pageY-$this.dragDiv.Y
                });//控件新位置
            }
        });
        this.dragDiv.on("mouseup",function(e){
            $this.dragDiv.css({
                cursor:'default'
            });
            $this.dragging = false;
        });
    }
};
player.init($("#play"));
Drag.init($('#play'));