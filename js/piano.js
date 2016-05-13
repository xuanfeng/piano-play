$(function(){

	
	var piano = {
		"keyDom": $("#nav #menu-nav li"),
		"url": "",			//弹奏后生成的曲谱链接
		"audioOn": 0,		//是否加载audio dom
		"timeRuner": null,	//计时器setinterval
		"timeCount": 0,		//节奏总时间
		"step": 0, 			//计时器时间累加
		"lazyTimer": [],	//延时定时器
		"extraTimer": null	//导航延时计时器
	}

	// 钢琴导航菜单，显示菜单
	$(".music_trangle").hover(function(){
		clearTimeout(piano.extraTimer);
		$(".piano_extra").show();
		$(this).addClass('trangle_hover');
	},function(){
		piano.extraTimer = setTimeout(function(){
			$(".piano_extra").hide();
			$(".music_trangle").removeClass('trangle_hover');
		},800);
	});


	// 延时隐藏菜单
	$(".piano_extra").hover(function(){
		clearTimeout(piano.extraTimer);
		$(this).show();
		$(".music_trangle").addClass('trangle_hover');
	},function(){
		$(this).hide();
		$(".music_trangle").removeClass('trangle_hover');
	});

	// 菜单1. 看谱弹琴
	$(".book_play").click(function(){
		renderList(list);
		$(".piano_album").show();
		$(".album_choose").show();
		$(".piano_function").hide();
		$(".song-list").show();
		$(".song-opern").hide();
		$(".save_extra").hide();
	});

	// 菜单2. 录制曲子
	$(".song_record").click(function(){
		$(".album_choose").hide();
		$(".piano_function").show();
		$(".piano_album").show();
		$(".record-area").show();
		$(".record-success").hide();
	});

	$(".piano_extra").click(function(){
		$("#banner, .feature, #top, #logo").hide();
		$("#nav").animate({width: "980px"});
		$("#nav li").animate({width: "108.5px"});
	});

	$(".piano_album").on("click", ".album_close", function(){
		$("#banner, .feature, #top, #logo").show();
		$("#nav li").css({width: "90px"});
		$("#nav").css({width: "810px"});
	});

	// dom中插入音乐文件
	function addPiano(){
		// 添加色块
		$(".menu li a").after('<div class="hover-bg"></div>');
		// 获取格式
		var audio_msg=checkAudioCompat(),
			show_audio=setTimeout(function(){
			var len=$(".menu li").length,
				audio_html = "";
			for(var j=0;j<len;j++){
				audio_html += '<audio class="my_audio" preload="auto"><source class="audio_source" src="./media/'+(j+1)+'.'+audio_msg+'" type=audio/'+audio_msg+'></audio>';
			}
			$(".piano_audio").append(audio_html);
			piano.audioOn=1;
		},1000);
		// 延时加载
	}


	// 打开页面时自动播放
	function initAutoMusic(initUrl){
		var testReg = /\/\?music=(\d:\d-?)*/;
		var test = testReg.test(initUrl);
		if(test){
			// 声音文件是否加载完毕
			var testTimer = setInterval(function(){
				if(piano.audioOn = 1){
					clearInterval(testTimer);
					// 等待下载文件
					setTimeout(function(){
						// 获取参数
						var paramReg = /\/\?music=/,
							start = initUrl.search(paramReg) + 8,
							end = initUrl.length,
							params = initUrl.substring(start, end);
						
						// 封装数据
						var dataArr = params.split("-"),
							music = parseData(dataArr);
						listen(music);
					},1500)
				}
			},500);	
		}
	}


	// 根据浏览器判断是否加载声音文件
	if( $.browser.msie && $.browser.version <9){
		$(".menu li a").after('<div class="hover-bg"></div>');
		$(".menu").addClass("menupiano");
		$(".music_extra_nav").hide();
		var initUrl = location.href;
		var testReg = /\/\?music=(\d:\d-?)*/;
		var test = testReg.test(initUrl);
		if(test){
			var position = $("#logo").offset();
			alert("浏览器不支持音乐播放，请使用chrome谷歌内核浏览器");
		}
	}else{
		var clientWidth=document.documentElement.clientWidth || document.body.clientWidth;
		if(clientWidth>980){
			// 加载声音dom
			addPiano();
			// 有节奏链接时自动播放
			var initUrl = location.href;
			initAutoMusic(initUrl)
		}
	}


	// 检测支持audio的格式
	function checkAudioCompat() {
        var myAudio = document.createElement('audio');
        var msg = "";   
        if (myAudio.canPlayType) {
            // CanPlayType returns maybe, probably, or an empty string.
            var playMsg = myAudio.canPlayType('audio/mpeg');
            playMsg = myAudio.canPlayType('audio/ogg; codecs="vorbis"'); 
            if ( "" != playMsg){
                return msg="ogg";                    
            }
            if ( "" != playMsg) {
                return msg="mp3";
            }
        }  
    }

  	
  	// 根据key播放按键声音
    function playKey(i){
    	// 获取audio格式
		var audio_msg=checkAudioCompat();
		// 判断是否已加载
		if(piano.audioOn==1){
			try{
				// 方案一（弹一次加载一次）
				// var source = "media/"+(i+1)+".mp3";
				// console.log(source)
				// $("body").find(".my_audio").eq(i).attr("src", source);
				// $("body").find(".my_audio").eq(i).attr("autoplay", "autoplay");

				// 方案二（弹奏速度过快时存在误差）
				$("body").find(".my_audio").eq(i).get(0).currentTime=0;
				$("body").find(".my_audio").eq(i).get(0).play();

			}catch(e){
				console.log(e);
			}
		}
    }



	// 计时(记录按键之间的节奏，100ms为单位)
	function timeRun(){
		piano.step = 0;
		clearInterval(piano.timeRuner);
		piano.timeRuner = setInterval(function(){
			piano.step += 100;
			piano.timeCount = piano.step;
		},100);
	}

	// 开始录制
	function startRecord(key){
		// 判断是否开始录制，是否已结束
		if(status.play){
			// 切换成已开始弹奏状态，可点击完成弹奏
			status.end = true;
			// 录制时统计数据	
			if(piano.url != ""){
				// 时间换算 1s:100ms
				if(key !=0){
					var urlTime = piano.timeCount/100;
					piano.url += "-" + key + ":" + urlTime;
					// 继续计时
					timeRun();
				}else{
					// 为0时表示输入空格，用于曲谱间隔，在此无效
					piano.url += "-" + key + ":0";
				}
			}else{
				piano.url += key + ":0";
				// 开启计时
				timeRun();
			}
		}	
	}


	// hover时弹钢琴
	piano.keyDom.each(function(i){
		$(this).hover(function(){
			// 色块动画
			$(this).children("div").stop(true, false).animate({top:'0px'},200);
			// 声音文件（判断是否已加载）
			playKey(i);
			// 录制
			startRecord(i+1);			
		},function(){
			// 色块动画
			$(this).children("div").animate({top:'66px'},200);
		});
	});

	// 键盘按下录制钢琴
	$(document).keydown(function(event){
		// 主键盘
		// 1-49 2-50 3-51 4-52 5-53 6-54 7-55 8-56 9-57
		// 小键盘
		// 1-97 2-98 3-99 4-100 5-101 6-102 7-103 8-104 9-105
		// 主键盘字母
		//a-65 s-83 d-68 f-70 g-71 h-72 j-74 k-75 l-76

		if( event.keyCode == 49 || event.keyCode == 97 || event.keyCode == 65 ){
			// 手动弹奏，播放音乐
			playPiano(1);
			// 录制
			startRecord(1);
		}else if( event.keyCode == 50 || event.keyCode == 98 || event.keyCode == 83 ){
			playPiano(2);
			startRecord(2);
		}
		else if( event.keyCode == 51 || event.keyCode == 99 || event.keyCode == 68 ){
			playPiano(3);
			startRecord(3);
		}
		else if( event.keyCode == 52 || event.keyCode == 100 || event.keyCode == 70 ){
			playPiano(4);
			startRecord(4);
		}
		else if( event.keyCode == 53 || event.keyCode == 101 || event.keyCode == 71 ){
			playPiano(5);
			startRecord(5);
		}
		else if( event.keyCode == 54 || event.keyCode == 102 || event.keyCode == 72 ){
			playPiano(6);
			startRecord(6);
		}
		else if( event.keyCode == 55 || event.keyCode == 103 || event.keyCode == 74 ){
			playPiano(7);
			startRecord(7);
		}
		else if( event.keyCode == 56 || event.keyCode == 104 || event.keyCode == 75 ){
			playPiano(8);
			startRecord(8);
		}
		else if( event.keyCode == 57 || event.keyCode == 105 || event.keyCode == 76 ){
			playPiano(9);
			startRecord(9);
		}else if( event.keyCode == 32 ){
			startRecord(0);
		}
		else if( event.keyCode == 13 ){
			
		}
		// console.log(event.keyCode)
	});


	// 弹奏钢琴
	function playPiano(i){
		var key = i-1;
		// 色块动画
		piano.keyDom.eq(key).children("div").stop(true, false).animate({top:'0px'},200);
		piano.keyDom.eq(key).children("div").animate({top:'66px'},200);
		// 声音播放
		playKey(key);
	}






	/*
	* 第二部分
	* 功能：弹奏按钮功能，控制流程
	*/


	// 状态存储
	var status = {
		"play":false, 		//正在录制
		"copy":false, 		//复制
		"end":false, 		//结束
		"reset": false		//重置
	}
	

	// 开始录制
	$(".piano_function").on("click", ".start_record", function(){
		// 开启记录数据
		status.play = true;
		// 下一步
		$(".cancel_record").show();
		$(".finish_record").show();
		$(".record-state").text("正在录制，请使用鼠标或键盘弹奏");
		$(this).hide();
	});

	// 取消录制
	$(".piano_function").on("click", ".cancel_record", function(){
		// 取消记录并清空已弹奏数据
		status.play = false;
		piano.url = "";
		// 切换成已结束弹奏状态
		status.end = false;
		// 下一步
		$(".finish_record").hide();
		$(".start_record").show();
		$(this).hide();
		$(".record-state").text("点击开始录制，可以把你弹奏的曲子录制下来");
	});

	// 完成录制
	// 分析：更新链接，显示分享、试听、复制
	$(".piano_function").on("click", ".finish_record", function(){
		// 判断是否已录制声音
		if(status.end){
			// 取消记录数据并更新链接
			status.play = false;
			// 切换成已结束弹奏状态
			status.end = false;
			// 生成已弹奏链接
			var allUrl = "http://www.xuanfengge.com/?music=" + piano.url;
			$(".share_record").attr("href", allUrl);
			piano.url = "";
			// 更新链接，用于点击复制（AS获取）
			var copyCon = $(".share_record").attr("href");
			var flashvars = {
				content: encodeURIComponent(copyCon),
				uri: './images/copy.png'
			};
			var params = {
				wmode: "transparent",
				allowScriptAccess: "always"
			};
			swfobject.embedSWF("./js/clipboard.swf", "forLoadSwf", "120", "25", "9.0.0", null, flashvars, params);
			// 更新链接,触发分享函数（分享获取）
			shareUrl = encodeURIComponent($(".share_record").attr("href"));
			share();

			// 显示试听、保存
			$(".record-success .record-info").hide();
			$(".start_listen, .save_record").show();
			$(".record-share").show();
			$(".record-success .record-panel").show();
		}else{
			// 未有录入声音
			$(".record-success .record-info").show();
			$(".start_listen, .save_record").hide();
			$(".upload_record").hide();
			$(".record-share").hide();
		}
		
		// 下一步
		$(".record-success").show();
		$(".record-state").text("点击开始录制，可以把你弹奏的曲子录制下来");
		$(".start_record").show();
		$(".finish_record, .cancel_record").hide();
		$(".record-area").hide();
	});


	// 马上试听
	// 分析：获取链接数据、解析、触发
	$(".piano_function").on("click", ".start_listen", function(){
		var shareLink = $(".share_record").attr("href");
		var music = analysis(shareLink);	//生成json数据
		listen(music);						//启动自动播放
	});


	// 重新录制
	// 分析：重置数据（url、time、share）,可忽略
	$(".piano_function").on("click", ".reset_record", function(){
		// 下一步
		$(".record-area").show();
		$(".record-success").hide();
	});


	// 复制链接
	// 分析：完成录制时更新链接
	$(".piano_function").on("click", ".share_record", function(){
		// var shareLink = $(this).attr("href");
		// 这里无效，已用flash解决
	});


	// 提交曲谱
	// 分析：本地分享，链接跳转，判断是否已复制
	$(".piano_function").on("click", ".upload_record", function(){
		var position = $(this).offset();
		if($(".share_record").data("copy")){
			savePopShow("已复制歌曲链接，正在跳转...", position);
			// setTimeout(function(){
			// 	window.open("http://www.xuanfengge.com/piano");
			// },300);
		}else{
			savePopShow("请先复制歌曲链接", position, "error");
			return false;
		}
	});


	// 返回曲谱列表(相当于取消录制)
	$(".album_choose").on("click", ".select-another", function(){
		// 取消记录数据
		status.play = false;
		// 切换成已结束弹奏状态
		status.end = false;
		// 下一步
		$(".finish_record").hide();
		$(".start_record").show();
		$(".cancel_record").hide();
		$(".record-state").text("点击开始录制，可以把你弹奏的曲子录制下来");
		$(".piano_function").hide();
		$(".record-success").hide();
	});


	// 点击歌曲选择曲谱（显示面板）
	$(".album_choose").on("click", ".song a", function(){
		$(".piano_function").show();
	});


	// 社交分享
    // 分析：链接数据随时改变，需要即时触发
    var shareUrl = "";
	function share(){
		// 定义数据：新浪微博、腾讯微博、QQ空间、人人网
		var shareCourseTitle = $(".share_title").data("title");
	    var sinaTitle = '分享节奏 「' + shareCourseTitle + '」 -轩枫阁（分享自@轩枫Y_me）',
	        renrenTitle = '分享节奏 「' + shareCourseTitle + '」-轩枫阁（分享自@农航亮(356948827)）',
	        tqqTitle = '分享节奏 「' + shareCourseTitle + '」-轩枫阁（分享自@轩枫阁）';
	        tqzoneTitle = '分享节奏 「' + shareCourseTitle + '」-轩枫阁（分享自@♪紫轩枫、）';
	    var picShare = "./images/piano.jpg";
	    shareUrl = encodeURIComponent($(".share_record").attr("href"));
		$('body').pianoSnsShare({
	        tsina:{
	        	url: shareUrl,
	            title:sinaTitle,
	            pic:picShare
	        },
	        renren:{
	        	srcUrl: shareUrl,
	            title:renrenTitle,
	            pic:picShare
	        },
	        tqq:{
	        	url: shareUrl,
	            title:tqqTitle,
	            pic:picShare 
	        },
	        tqzone:{
	        	url: shareUrl,
	            title:tqzoneTitle,
	            pic:picShare 
	        }
	    });
	}
    




	
	/*
	* 第三部分
	* 功能：自动弹钢琴
	*/



	// 试听数据模版
	var autoPlayData = {
		"data": [
			{"key": 1, "time": 300},
			{"key": 3, "time": 200},
			{"key": 6, "time": 400},
			{"key": 2, "time": 600}
		]
	};


	// 试听数据触发音乐
	// 分析：传入json数据
	function listen(playData){
		var data = playData.data,
			len = data.length,
			startTime = 0;		//延时定时器计时

		for( var i=0; i<len; i++){
			var now = data[i],
				key = now.key,
				time = startTime + now.time*100;
			// 触发音键
			timeOut(key, time);
			// 计时时间叠加
			startTime = time;
		}
	}


	// 弹钢琴的节奏
	// 分析：延时，生成很多个定时器
	function timeOut(key, time){
		var eachTimer = setTimeout(function(){
			// 弹奏
			playPiano(key);
		},time);
		// 添加定时器到数据，以便一次性清除
		piano.lazyTimer.push(eachTimer);
	}


	// 结束自动弹奏
	// 分析：一次性清除定时器及数组
	function playOver(){
		for(var i=piano.lazyTimer.length; i>0; i--){
			clearTimeout(piano.lazyTimer[i]);
		}
		piano.lazyTimer.length = 0;
	}

	// 分析链接,返回json
	function analysis(list){
		// 链接检测
		var testReg = /\/\?music=(\d:\d-?)*/,
			test = testReg.test(list);
		if(test){
			// 获取参数
			var paramReg = /\/\?music=/,
				start = list.search(paramReg) + 8,
				end = list.length,
				params = list.substring(start, end);
			console.log(params);
			// 封装数据
			var dataArr = params.split("-");
			return parseData(dataArr);	
		}else{
			alert("钢琴链接格式出错，请粘贴完整！")
		}
	}

	// 数组转成json数据
	function parseData(arr){
		var autoPlayData = {};
		autoPlayData.data = [];
		var jsonObj = autoPlayData.data;
		var len = arr.length;
		// 遍历封装
		for(var i=0; i<len; i++){
			var newArr = arr[i].split(":"),
				key = newArr[0],
				time = newArr[1];
			if(key != 0){
				var newObj = {};
				newObj.key = key;
				newObj.time = time;
				jsonObj.push(newObj);
			}
		}
		// 返回json
		return autoPlayData;
	}

		



	/*
	* 第四部分
	* 功能：曲谱部分
	*/


	// 关闭曲谱面板
	$(".piano_album").on("click", ".album_close", function(){
		// 取消记录并清空已弹奏数据
		status.play = false;
		piano.url = "";
		// 切换成已结束弹奏状态
		status.end = false;
		// 下一步
		$(".finish_record").hide();
		$(".start_record").show();
		$(".record-state").text("点击开始录制，可以把你弹奏的曲子录制下来");
		
		$(".piano_album").hide();
		$(".song-list").show();
		$(".song-opern").hide();

		$(".record-success").hide();
		$(".record-area").show();
	});


	// 曲谱json数据
	// 分析：曲谱key节奏之间以0间隔
	/*
	** 格式："歌名":"key|贡献者名字|贡献者链接"
	*/
	var list = {
		"小星星":"11556650443322105544332055443320115566504433221",
		"茉莉花":"33568865056503356886505650555356066503235032101210321203568650523532121",
		"光阴的故事":"555653323138868650886865565135565320555653323138868650886865565358886789",
		"找朋友":"5656565058765530553355302432121",
		"上学歌":"12315066865066805630653531231",
		"一分钱":"5868503523503568565351032032123065356058865630523210",
		"征服":"58755650587563606665334044456322",
		"大约在冬季":"4440456880689665606542206542202455555658",
		"沧海一声笑":"998654065421012124456809986545",
		"童话":"543034303434321013560665224301356066765434321",
		"我爱北京天安门":"58543210112331345058543520432650231536876750999870675053687678905678905888",
		"同桌的你":"5555345706666465055557654044443210888856888809999876077777890507789878",
		"葫芦兄弟":"1130113066656513086656051207535",
		"祝你一路顺风":"3230321556503566666350366656685556312223212032303215565035666663503666566855531012223211018888986563012012320188898656805605689",
		"老男孩":"55550565403678750556112350545312055550565403678750556112350543211",
		"回忆里的疯狂":"111543212330135666876545566687655321023434211023434311|羽毛公主|http:\/\/bbs.360safe.com\/forum.php?mod=redirect&goto=findpost&ptid=1969236&pid=13529820",
		"小熊和洋娃娃":"1023455543444321351023455543444321316066545554344432135606654555434044321031|wangsongha1986lzq|http:\/\/bbs.360safe.com\/forum.php?mod=redirect&goto=findpost&ptid=1969236&pid=13527397"
	};


	// 曲谱-键盘定义
	var map = {
		"1":"A",
		"2":"S",
		"3":"D",
		"4":"F",
		"5":"G",
		"6":"H",
		"7":"J",
		"8":"K",
		"9":"L"
	}


	// 生成歌曲列表
	function renderList(list){
		var tmp = '<ul>';
		list = list || [];
		for(var i in list){
			tmp += '<li class="song"><span class="split">•</span><a data-title="'+i+'">'+i+'</a></li>';
		}
		tmp += '<li class="mysong"><span class="split">•</span><a href="http://www.xuanfengge.com/piano" data-title="'+i+'">我要提交曲谱>></a></li>';
		tmp += "</ul>";
		$("#list-info")[0].innerHTML = tmp;
	}


	// 生成歌曲的曲谱
	function renderSong(title){
		var opern = $("#song-opern"),		//曲谱面板dom
			song = list[title];				//根据歌名获取数据
		opern.find(".title").html(title);	//设置歌名
		var arr = song.split("|"),			//拆分数据（可能为3部分）
			keys = arr && arr[0];			//获取曲谱
		var from = $("#song-opern").find(".opern-from");	//贡献者dom
		from.hide();						//隐藏贡献者信息
		if(keys.length){					//全部遍历
			var COUNT = 35,					//一行最多35个音
				len = Math.ceil(keys.length/COUNT);		//计算行数
			$("#opern-info")[0].innerHTML = "";			//重置曲谱面板
			for(var i=0;i<len;i++){
				var l = COUNT*(i+1),		//每行的音节数
					tmp1 = tmp2 = "";
				if(i == len - 1){
					l = keys.length;		//最后一行音节数
				}
				for(var j=i*COUNT;j<l;j++){		//遍历每一行音节
					var num = keys[j];			//当前音符的调
					// 间隔符
					if(num == "0"){
						tmp1 += '<dd class="empty-pat"></dd>';
						tmp2 += '<dd class="empty-pat"></dd>';
					}else{
						if(num == "8" || num == "9"){
							// 高音
							tmp1 += '<dd class="high-pat">'+(num-7)+'</dd>';
						}else{
							// 低音
							tmp1 += '<dd>'+num+'</dd>';
						}
						tmp2 += '<dd>'+map[num]+'</dd>';
					}
				}
				$("#opern-info")[0].innerHTML += '<dl class="number"><dt>乐谱</dt>'+tmp1+'</dl>';
				$("#opern-info")[0].innerHTML += '<dl class="letter"><dt>键盘弹奏</dt>'+tmp2+'</dl>';
			}
		}
		// 是否有曲谱贡献者
		if(arr[1]){
			var link = from.find("a");
			link.html(arr[1]);						//贡献者名字
			arr[2] && link.attr("href",arr[2]);		//贡献者链接
			from.show();							//显示贡献者信息
		}
	}


	// 点击歌曲获取曲谱
	$("#list-info").delegate(".song a","click",function(e){
		e.preventDefault();
		var title = $(this).attr("data-title"),		//获取歌名
			song = list[title];					 	//获取曲谱数据
		renderSong(title);							//生成曲谱面板
		$("#song-list").hide();						//隐藏歌曲列表
		$("#song-opern").show();					//显示曲谱面板
		$(".record-area").show();
		$(".record-success").hide();
	});


	// 返回曲谱列表-事件绑定
	$("#song-opern").delegate(".select-another","click",function(e){
		e.preventDefault();
		showSongList();
	});


	// 显示歌曲列表，隐藏曲谱
	function showSongList(){
		$("#song-opern").hide();
		$("#song-list").show();
	}

	// 点击试听(本地存储)
	$(".save_listen").click(function(){
		var shareLink = $(this).data("list");
		console.log(shareLink);
		var music = analysis(shareLink);
		listen(music);
	});

	// 点击歌曲获得曲谱（本地存储）
	$("#list-info").delegate(".save_song a","click",function(){
		var copyCon = $(".share_record").attr("href");
		var flashvars = {
			content: encodeURIComponent(copyCon),
			uri: './images/copy.png'
		};
		var params = {
			wmode: "transparent",
			allowScriptAccess: "always"
		};
		swfobject.embedSWF("./js/clipboard.swf", "forLoadSwf", "120", "25", "9.0.0", null, flashvars, params);
		// 更新链接,触发分享函数（分享获取）
		// shareUrl = $(".share_record").attr("href");
		// share();
	});


// end
});



// 提示tip
// 提示收藏成功
function savePopShow(tips,position,or){
	var len = arguments.length;
	var oHide = ".save-success";
	if(len ==3){
		oHide = ".save-success";
	}else{
		oHide = ".save-fail";
	}
	if(!$("#save-pop").length){
		var saveHtml = '<div id="save-pop"><div class="save save-success">删除成功</div><div class="save save-fail">保存失败！</div></div>';
	}
	$("body").append(saveHtml);
	$('#save-pop').find(oHide).hide().siblings("div").fadeIn(300).html(tips);
	$('#save-pop').css('position','absolute')
	  			    .css('top',position.top+5)
		  		    .css('left',position.left-130)
		  		    .css('background','#fafafa')
		  		    .fadeIn('slow').delay(600).fadeOut('slow'); 
}
// var position = $("#header").offset();
// savePopShow("删除成功",position);
// savePopShow("删除失败",position,"error");



//flash复制功能回调函数
// 分析：只能放最外面才生效。。
function copySuccess(){
	$(".share_record").data("copy", "true");
	var position = $(".share_title").offset();
	savePopShow("复制成功",position);
}
