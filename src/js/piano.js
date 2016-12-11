$(function(){
	var mediaSrc = 'http://www.xuanfengge.com/wp-content/themes/lee3.0/dist/media/';
	if(location.hostname == 'localhost'){
		mediaSrc = '../media/';
	}

	var piano = new Piano({
		playKeyCallback: navAnimate,
		mediaSrc: mediaSrc
	});

	// 大面板
	var $pianoPannel = $('.js_piano_pannel');

	// 图标
	$('.js_piano_nav_icon').on('click', function(){
		var $body = $('body');
		$('body').toggleClass('mod-piano');
		$(this).toggleClass('close');
		$('.js_piano').toggleClass('ui-d-n');

		$('.js_piano_nav li').eq(0).trigger('click');
	});

	// hover弹奏
	$('.js_menu li').on('mouseover', function(){
		var index = $(this).index() + 1;
		piano.playKey(index);
		piano.record(index);
	});

	// 导航
	$('.js_piano_nav li').on('click', function(){
		$(this).siblings('li').removeClass('active').end().addClass('active');

		var type = $(this).data('type') || 'album';
		switch(type){
			case 'album':
				renderAlbum();
				break;
			case 'record':
				renderRecord();
				break;
			case 'mine':
				renderMine();
				break;
		}
	});

	// 选择曲谱
	$('.js_album_list').on('click', 'a', function(){
		if($(this).attr('href') == 'javascript:;'){
			renderOpern($(this).text());
			$pianoPannel.filter('[data-type=record]').show();
		}
	});

	// 返回曲谱
	$('.js_show_album').on('click', function(){
		renderAlbum();
	});

	// 开始录制
	$('.js_start_record').on('click', function(){
		$('.js_start_record').addClass('ui-d-n');
		$(".js_cancel_record, .js_finish_record").removeClass('ui-d-n');
		$(".js_recore_text").text("正在录制，请使用鼠标或键盘弹奏");
		piano.startRecord();
	});

	// 完成录制
	$('.js_finish_record').on('click', function(){
		var playing = piano.getStatus();
		if(playing){
			$('.js_song_link').val(piano.finishRecord());
			$(".js_recore_success, .js_start_record").removeClass('ui-d-n');
			$(".js_record_srea, .js_finish_record, .js_cancel_record").addClass('ui-d-n');
			$(".js_recore_text").text("点击开始录制，可以把你弹奏的曲子录制下来");
			pianoShare();
		}else{
			Tips(false, '没有弹奏，请重新录制');
		}
	});

	// 取消
	$('.js_cancel_record').on('click', function(){
		$(".js_finish_record, .js_cancel_record").addClass('ui-d-n');
		$(".js_start_record").removeClass('ui-d-n');
		$(".js_recore_text").text("点击开始录制，可以录制弹奏的曲子");
	});

	// 马上试听
	$('.js_preview_record').on('click', function(){
		var shareLink = $(".js_song_link").val();
		var music = piano.analysis(shareLink);	//生成json数据
		piano.previewSong(music);						//启动自动播放
	});

	// 重新录制
	$('.js_reset_record').on('click', function(){
		$('.js_record_srea').removeClass('ui-d-n');
		$(".js_recore_success").addClass('ui-d-n');
	});

	// 提交此曲
	$('.js_upload_record').on('click', function(){
		var _self = this;
		$('.js_share_record').trigger('click');
		setTimeout(function(){
			window.open($(_self).attr('href'));
		}, 1500);
		return false;
	});

	// 复制链接
	$('.js_share_record').on('click', function(){
		copy();
	});

	// 看谱弹琴
	function renderAlbum(){
		$pianoPannel.hide().filter('[data-type=album]').show();

		var albumList = piano.getAlbumList(),
			_html = '';
		for(var album in albumList){
			_html += '<li><a href="javascript:;">' + album + '</a></li>';
		}
		$('.js_album_list').empty().html(_html);
	}

	// 录制曲谱
	function renderRecord(){
		$pianoPannel.hide().filter('[data-type=record]').show();
	}

	// 歌曲曲谱
	function renderOpern(name){
		// 生成歌曲的曲谱
		var $opern = $(".js_opern"),		// 曲谱面板dom
			albumList = piano.getAlbumList(),
			keyboard = piano.getKeyboard(),
			album = albumList[name],		// 根据歌名获取数据
			keys = album;					//获取曲谱

		if(keys.length){					//全部遍历
			var COUNT = 35,					//一行最多35个音
				len = Math.ceil(keys.length/COUNT),		//计算行数
				_html = '';
			for(var i=0; i<len; i++){
				var l = COUNT*(i+1),		//每行的音节数
					tmp1 = tmp2 = "";
				if(i == len - 1){
					l = keys.length;		//最后一行音节数
				}
				for(var j=i*COUNT; j<l; j++){	//遍历每一行音节
					var num = keys[j];			//当前音符的调
					// 间隔符
					if(num == "0"){
						tmp1 += '<dd class="empty-pat"></dd>';
						tmp2 += '<dd class="empty-pat"></dd>';
					}else{
						if(num == "8" || num == "9"){
							// 高音
							tmp1 += '<dd class="high-pat">' + (num-7) + '</dd>';
						}else{
							// 低音
							tmp1 += '<dd>' + num + '</dd>';
						}
						tmp2 += '<dd>' + keyboard[num] + '</dd>';
					}
				}
				_html += '<dl class="number"><dt>乐谱</dt>' + tmp1 + '</dl>';
				_html += '<dl class="letter"><dt>键盘弹奏</dt>' + tmp2 + '</dl>';
			}

			$opern.find(".title").html(name);		//设置歌名
			$opern.find(".js_opern_info").html(_html);

			$pianoPannel.hide().filter('[data-type=opern]').show();
		}
	}

	// 成功/错误提示
	function Tips(isSuc, msg){
		var $tip = $('.js_tips');
		if($tip.length) $tip.remove();

		var _class = isSuc ? 'success' : 'error';
		var _html = '<div class="js_tips mod-tips ' + _class + '">' + msg + '</div>';
		$('body').append(_html);
		setTimeout(function(){
			$('.js_tips').fadeOut(300);
		}, 3000);
	}

	// 复制链接
	function copy(){
		var elem = $('.js_song_link')[0];

	    // is element selectable
	    // 判断元素是否能被选中
	    if (elem && elem.select) {
	      	// select text
	      	// 选择文本
	      	elem.select();

	      	try {
	        	// copy text
	        	// 复制文本
	        	document.execCommand('copy');
	        	Tips(true, '复制链接成功，粘贴分享');
	      	} catch (err) {
	      		Tips(false, '浏览器不支持复制');
	      	}
	    }
	}

	// 导航动画
	function navAnimate(key){
		var $menu = $('.js_menu li');
		$menu.eq(key-1).removeClass('on').addClass('on');
		setTimeout(function(){
			$menu.eq(key-1).removeClass('on');
		}, 200);
	}

	// sns分享
	function pianoShare(){
	    var picShare = '',
	    	shareUrl = encodeURIComponent($('.js_song_link').val());

	    var sinaTitle = '分享钢琴节奏@轩枫Y_me',
	        renrenTitle = '分享钢琴节奏',
	        tqqTitle = '分享钢琴节奏@轩枫阁',
	        tqzoneTitle = '分享钢琴节奏';

	    $('body').snsShare({
	        tsina: {
	        	url: shareUrl,
	            title: sinaTitle,
	            pic: picShare
	        },
	        renren: {
	        	url: shareUrl,
	            title: renrenTitle,
	            pic: picShare
	        },
	        tqq: {
	        	url: shareUrl,
	            title: tqqTitle,
	            pic: picShare
	        },
	        tqzone:{
	        	url: shareUrl,
	            title: tqzoneTitle,
	            pic: picShare
	        }
	    });
	}

	// 初始化
	$('.js_piano_nav_icon').click();

});