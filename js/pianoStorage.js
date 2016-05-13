/*
* 名称：本地存储函数
* 功能：兼容各大浏览器存储
* 作者：轩枫
* 日期：2013/10/27
* 版本：V1.0
*/

// 1. IE7下的UserData对象
var UserData = {

	userData: null,
	name: location.href,

	init: function(){
		// IE7下的初始化
		if( !UserData.userData ){
			try{
				UserData.userData = document.createElement("INPUT");
				UserData.userData.type = "hidden";
				UserData.userData.style.display = "none";
				UserData.userData.addBehavior("#default#userData");
				document.body.appendChild(UserData.userData);
				var expires = new Date();
				expires.setDate(expires.getDate() + 365);
				UserData.userData.expires = expires.toUTCString();
			} catch(e){
				return false;
			}
		}
		return true;
	},

	setItem: function(key, value){
		if(UserData.init()){
			UserData.userData.load(UserData.name);
			UserData.userData.setAttribute(key, value);
			UserData.userData.save(UserData.name);
		}
	},

	getItem: function(key){
		if(UserData.init()){
			UserData.userData.load(UserData.name);
			return UserData.userData.getAttribute(key);
		}
	},

	removeItem: function(key){
		if(UserData.init()){
			UserData.userData.load(UserData.name);
			UserData.userData.removeAttribute(key);
			UserData.userData.save(UserData.name);
		}
	}

};
// UserData

// 2. 兼容只支持globalStorage的浏览器
// 使用： var storage = getLocalStorage();
function getLocalStorage(){
	if(typeof localStorage == "object"){
		return localStorage;
	} else if(typeof globalStorage == "object"){
		return globalStorage[location.href];
	} else if(typeof userData == "object"){
		return globalStorage[location.href];
	} else{
		throw new Error("不支持本地存储");
	}
}
var storage = getLocalStorage();


// 3. 高级浏览器的LocalStorage对象
var LocalStorage = {

	setItem: function(key, value){
		if(!window.localStorage){
			UserData.setItem(key, value);
		}else{
			storage.setItem(key, value);
		}
	},

	getItem: function(key){
		if(!window.localStorage){
			return UserData.getItem(key);
		}else{
			return storage.getItem(key);
		}
	},

	removeItem: function(key){
		if(!window.localStorage){
			UserData.removeItem(key);
		}else{
			storage.removeItem(key);
		}
	}
};



// 存储功能主函数
$(function(){

	/**
    * 数据封装成字符串
    * return    {string}    存储的字符串数据
    */
	function getDataText(){
		// 数据获取
		var key = getKey(),
			title = $(".save_info").val().trim(),
			link = $(".share_record").attr("href"),
			book = selectBook(link);

		// 数据封装
		var data = {
			"key": key,
			"title": title,
			"link": link,
			"book": book
		}
		// 转换成字符串
		var dataText = $.toJSON(data);
		return dataText;
	}


	/**
    * 存储一条曲谱数据
    */
	function insertData(){
		// 获取存储信息
		var indexKey = "music_"+getKey(),
			dataKey = LocalStorage.getItem(indexKey),
			musicData = getDataText(),
			position = $(".save_info").offset();

		if(dataKey == null || dataKey ==""){
			LocalStorage.setItem("musicKey", getKey()+1);
			LocalStorage.setItem(indexKey, musicData);
			savePopShow("保存成功", position);
		}else{
			savePopShow("ID重复，请联系博主", position, "error");
		}
	}

 
	/**
    * 生成曲谱数据
    * param     {string}    曲谱链接
    * return    {string}    曲谱的键key
    */
	function selectBook(link){
		var paramReg = /\/\?music=/,
			start = link.search(paramReg) + 8,
			end = link.length,
			params = link.substring(start, end),
			result = params.match(/\d{1}:/g).join("").replace(/:/g, "");
			console.log(result);
		return result;
	}


	/**
    * key的计算
    * return    {num}    存储的键id
    */
	function getKey(){
		var musicKey = LocalStorage.getItem("musicKey");
		if(!musicKey){
			LocalStorage.setItem("musicKey","0");
			musicKey = LocalStorage.getItem("musicKey");
			return parseInt(musicKey);
		}else{
			return parseInt(musicKey);
		}
	}


	/**
    * 读取全部数据
    * return    {array}    返回已存储的曲谱
    */
	function dataRead(){
		var result = [],
			value = "";
		for(var i=0, len = storage.length; i<len; i++){
			var key = storage.key(i),
				reg = /music_\d*/g;
			if(reg.test(key)){
				value = LocalStorage.getItem(key);
				result.push(value);
			}
		}
		return result;
	};


	/**
    * 判断曲谱是否为空
    * return    {array}    返回已存储的曲谱
    */
	function isEmpty(){
		for(var i=0, len = storage.length; i<len; i++){
			var key = storage.key(i),
				reg = /music_\d*/g;
			if(reg.test(key)){
				return false;
			}
		}
		return true;
	};


	// 本地曲谱json对象
	var albumList = {};


	/**
    * 将曲谱数组转成json数据
    * param     {array}     曲谱数组
    * return    {string}    曲谱的键key
    */
	function view(data){
		var len = data.length;
		for(var i=0; i<len; i++){
			var oData = $.parseJSON(data[i]),
				key = oData.key,
				title = oData.title,
				link = oData.link,
				book = oData.book;
			// 装到json
			albumList[key] = {};
			albumList[key].title = title;
			albumList[key].link = link;
			albumList[key].book = book;
		}
		return albumList;
	};

	
	// var saveList = view(dataRead());


	// 显示我的曲谱
	$(".my_album").on("click", function(){
		// 读取本地曲谱json数据		
		saveList = view(dataRead());
		var empty = isEmpty();
		if(!empty){
			// 布局曲谱
			renderList(saveList);
			$(".song-list h3").text("请选择要弹奏的曲谱");
		}else{
			// 已全部被删除，重置存储id
			$("#list-info").empty();
			LocalStorage.setItem("musicKey","0");
			$(".song-list h3").text("还没有保存过任何曲子，请先去弹奏保存吧");
		}

		// 下一步
		$(".piano_album").show();
		$(".album_choose").show();
		$(".piano_function").hide();
		$(".song-list").show();
		$(".song-opern").hide();
	});


	// 删除曲谱
	$(".save_delete").click(function(){
		// 获取曲谱信息
		var key = "music_" + $("#opern-info").data("key");
		var dataKey = LocalStorage.getItem(key);
		var position = $(".save_listen").offset();

		if(dataKey == null || dataKey ==""){
			savePopShow("删除失败", position, "error");
		}else{
			// 删除该键，并将本地曲谱json对象置空
			LocalStorage.removeItem(key);
			savePopShow("删除成功", position);
			// 这个大bug啊!!!造成虚拟缓存
			albumList = {};
		}
		// 删除后显示我的曲谱
		$(".my_album").click();
	});


	// 清空收藏数据(含book_关键字的数据)-没有用到
	function clear(){
		var reg = /book_\d+/;
		var key;
		for(var i=0, len = storage.length; i<len; i++){
			key = storage.key(i);
			if(reg.test(key)){
				console.log("succe: "+key);
				LocalStorage.removeItem(key);
				i=i-1;
				len=len-1;
			}else{
				console.log("error: "+key);
			}
		}
		LocalStorage.setItem("musicKey","0");
	};


	// 本地保存信息表单显示
	$(".save_record").click(function(){
		// 如果是在曲谱打开界面，则设置为该曲谱标题
		var title_info = $(".album_choose:visible").find(".song-opern:visible").find(".title").text();
		if(title_info != ""){
			$(".save_info").val(title_info);
		}
		$(".save_info, .save_record_btn").show();
	});


	// 曲谱保存按钮
	$(".save_record_btn").click(function(){
		var title = $(".save_info").val().trim();
		if(title == ""){
			var position = $(".save_info").offset();
			savePopShow("内容为空！", position, "error");
		}else{
			insertData();
			$(".save_info, .save_record_btn").hide();
		}
	});


	// 防止填写数据时弹奏钢琴
	$(".save_info").on("keydown", function(e){
		e.stopPropagation();
	});

	


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
			tmp += '<li class="save_song"><span class="split">•</span><a data-key="'+i+'">'+list[i].title+'</a></li>';
		}
		tmp += '<li class="mysong"><span class="split">•</span><a href="http://www.xuanfengge.com/piano" target="_blank" data-title="'+i+'">我要提交曲谱>></a></li>';
		tmp += "</ul>";
		$("#list-info")[0].innerHTML = tmp;
	}

	// 根据key生成歌曲的曲谱
	function renderSong(key){
		var opern = $("#song-opern"),		//曲谱面板dom
			song = albumList[key],			//根据歌名获取数据
			title = song.title,				//获取歌名
			keys = song.book,				//获取曲谱
			from = $("#song-opern").find(".opern-from");	//贡献者dom
		from.hide();						//隐藏贡献者信息
		opern.find(".title").html(title);	//设置歌名	
								
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
		// 显示试听链接
		$(".save_listen").data("list", song.link);	//试听链接
		$(".share_record").attr("href", song.link);	//更新分享链接
		$(".save_extra").show();					//显示试听与删除
		$("#opern-info").data("key", key);			//设置key，便于删除
	}




	
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
	    var picShare = "http://www.xuanfengge.com/wp-content/themes/lee2.0/images/piano.jpg";
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

	// 点击歌曲获取曲谱
	$("#list-info").delegate(".save_song a","click",function(e){
		e.preventDefault();
		var key = $(this).data("key"),				//获取歌名
			song = albumList[key];					//获取曲谱数据
		renderSong(key);							//生成曲谱面板
		share();
		$("#song-list").hide();						//隐藏歌曲列表
		$("#song-opern").show();					//显示曲谱面板
		$(".piano_function").show();
		$(".record-area").show();
		$(".record-success .record-panel").hide();
		$(".record-share").show();
		$(".record-success").show();
	});
	

});
