// H5 piano play
// 可直接被引用或者AMD、CMD方式加载
;(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {// CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {// AMD / RequireJS
        define(factory);
    } else {
        root.Piano = factory.call(root);
    }
}(this, function() {
    'use strict';

	var Piano = function(options){
		this.options= $.extend({
			albumList: {	// 曲谱json数据
				"小星星": "11556650443322105544332055443320115566504433221",
				"茉莉花": "33568865056503356886505650555356066503235032101210321203568650523532121",
				"光阴的故事": "555653323138868650886865565135565320555653323138868650886865565358886789",
				"找朋友": "5656565058765530553355302432121",
				"上学歌": "12315066865066805630653531231",
				"一分钱": "5868503523503568565351032032123065356058865630523210",
				"征服": "58755650587563606665334044456322",
				"大约在冬季": "4440456880689665606542206542202455555658",
				"沧海一声笑": "998654065421012124456809986545",
				"童话": "543034303434321013560665224301356066765434321",
				"我爱北京天安门": "58543210112331345058543520432650231536876750999870675053687678905678905888",
				"同桌的你": "5555345706666465055557654044443210888856888809999876077777890507789878",
				"葫芦兄弟": "1130113066656513086656051207535",
				"祝你一路顺风": "3230321556503566666350366656685556312223212032303215565035666663503666566855531012223211018888986563012012320188898656805605689",
				"老男孩": "55550565403678750556112350545312055550565403678750556112350543211",
				"菊花台": "3323035323011235302212035365065535032353221",
				"回忆里的疯狂": "111543212330135666876545566687655321023434211023434311",
				"小熊和洋娃娃": "1023455543444321351023455543444321316066545554344432135606654555434044321031",
				"爱情转移": "187767605653235650565666656530123532101235321011108888686865",
				"红尘客栈": "1260126045065415012502405678097606676545067046756076536033677053567605350679765",
				"小红帽": "12345031806450301234532120302050123450318064503012345321203010108064501080645030123453212030101",
				"魔法城堡": "58856687650344345650568776598",
				"发如雪": "23302353023302365306122612061232023302353023305236530612261220123206161612206161613103336533052332356501236535",
				"爱情买卖": "36883680776530222623503775303688368000989000989987053566",
				"粉刷匠": "5353531024325053535310243210224432502432505353531024321",
				"小苹果": "66678998076767055567987065656",
				"小苹果[长版]": "60405020654502060405055086304043203450109860605405656580888880604050206545020604050550863040432034501098606054056501020242",
				"送别": "5358068505123021205358076850512301106880767806786065312053580768505123011",
				"Big big world": "123330342220231110123201233303422202310322",
				"命运交响曲": "334554321123322033455432112321102231234321210334554321123211",
				"爸爸去哪儿": "150150333253066678760533015015033337608645678",
			},
			keyboard: {		// 曲谱-键盘定义
				"1": "A",
				"2": "S",
				"3": "D",
				"4": "F",
				"5": "G",
				"6": "H",
				"7": "J",
				"8": "K",
				"9": "L"
			},
			playKeyCallback: null,	// 按键i回调
			randomPlay: true,		// 初始化时随机播放
			timeSpace: 50,			// 节奏计时间隔 50ms
			keyLen: 9,				// 默认9个key
			mediaSrc: 'http://www.xuanfengge.com/wp-content/themes/lee3.0/dist/media/',  // 音频路径前缀
		}, options);

		this.property = {
			opernLink: '',		// 弹奏后生成的曲谱链接
			timeRuner: null,	// 计时器setinterval
			timeCount: 0,		// 节奏总时间
			step: 0, 			// 计时器时间累加
			lazyTimer: [],		// 延时定时器
			extraTimer: null,	// 导航延时计时器
			key: {},			// 声音key
			audioReady: 0,		// 是否加载audio dom
			playing: false,		// 是否正在弹奏
		}

		this.init();
	}

	Piano.prototype = {
		// 初始化
		init: function(){
			this.initAudio();
		},

		// 检测支持audio的格式
		getAudioFormat: function(){
			var _audio = document.createElement('audio');
	        if(_audio.canPlayType){
	            // CanPlayType returns maybe, probably, or an empty string.
	            var mp3 = _audio.canPlayType('audio/mpeg');
	            var ogg = _audio.canPlayType('audio/ogg; codecs="vorbis"');
	            return mp3 ? 'mp3' : 'ogg';
	        }
	        return null;
		},

		// 加载音频文件
		initAudio: function(){
			// 获取格式
			var audioFormat = this.getAudioFormat();
			var src = this.options.mediaSrc + '{{key}}.' + audioFormat;
			for(var key=1; key<=this.options.keyLen; key++){
				this.loadAudio(key, src.replace(/{{key}}/g, key));
			}
		},

		loadAudio: function(key, url){
			var _self = this;
			var _audio = new Audio();
			_audio.addEventListener('canplay', function(){
				_self.checkReady(key, true);
			});
			_audio.addEventListener('error', function(){
				_self.checkReady(key,  false);
			});
			_audio.src = url;
			this.property.key[key] = _audio;
		},

		// 检测是否全部音频加载完成
		checkReady: function(key, status){
			// this.property.key[key].play();

			this.property.audioReady++;
			if(this.property.audioReady == this.options.keyLen){
				this.listenEvents();

				if(/\/\#music=(\d:\d-?)*/.test(location.href)){
					this.autoPlay(location.href);
				}else{
					if(this.options.randomPlay && (parseInt(Math.random()*10) < 2)){
						this.autoPlay("#music=1:0-2:3-3:2-4:2-5:2-6:2-7:2-8:2-9:2");
					}
				}
			}
		},

		// 打开页面时自动播放
		autoPlay: function(opern){
			// 获取参数
			var start = opern.search(/#music=/) + 7,
				end = opern.length,
				params = opern.substring(start, end);

			// 封装数据
			var dataArr = params.split("-"),
				music = this.parseData(dataArr);
			this.previewSong(music);
		},

		// 根据key播放按键声音
		playKey: function(key){
			// 判断是否已加载
			if(this.property.audioReady){
				try{
					var _audio = this.property.key[key];
					_audio.currentTime = 0;
					_audio.play();
					this.options.playKeyCallback && this.options.playKeyCallback(key);
				}catch(e){
					console.log(e);
				}
			}
		},

		// 计时(记录按键之间的节奏，50ms为单位)
		_timeRun: function(){
			var _self = this;
			this.property.step = 0;

			clearInterval(this.property.timeRuner);
			this.property.timeRuner = setInterval(function(){
				_self.property.step += _self.options.timeSpace;
				_self.property.timeCount = _self.property.step;
			}, _self.options.timeSpace);
		},

		// 录制
		record: function(key){
			// 判断是否开始录制，是否已结束
			if(this.property.playing){
				// 录制时统计数据
				if(this.property.opernLink){
					if(key){
						var space = this.property.timeCount/this.options.timeSpace;
						this.property.opernLink += "-" + key + ":" + space;
						// 继续计时
						this._timeRun();
					}else{
						// 为0时表示输入空格，用于曲谱间隔，在此无效
						this.property.opernLink += "-" + key + ":0";
					}
				}else{
					this.property.opernLink += key + ":0";
					// 开启计时
					this._timeRun();
				}
			}
		},

		// 开始录制
		startRecord: function(){
			// 曲谱链接置空并开启记录数据
			this.property.opernLink = '';
			this.property.playing = true;
		},

		// 完成录制
		finishRecord: function(){
			// 取消记录数据并返回已弹奏链接
			this.property.playing = false;
			return location.origin + "#music=" + this.property.opernLink;
		},

		// 取消录制
		cancelRecord: function(){
			// 取消记录并清空已弹奏数据
			this.property.opernLink = "";
			this.property.playing = false;
		},

		// 当前状态
		getStatus: function(){
			return this.property.playing;
		},

		// 事件监听
		listenEvents: function(){
			var _self = this;
			// 键盘按下录制钢琴
			$(document).on('keydown', function(event){
				// 主键盘
				// 1-49 2-50 3-51 4-52 5-53 6-54 7-55 8-56 9-57
				// 小键盘
				// 1-97 2-98 3-99 4-100 5-101 6-102 7-103 8-104 9-105
				// 主键盘字母
				// a-65 s-83 d-68 f-70 g-71 h-72 j-74 k-75 l-76

				if( event.keyCode == 49 || event.keyCode == 97 || event.keyCode == 65 ){
					// 手动弹奏，播放音乐
					_self.playKey(1);
					// 录制
					_self.record(1);
				}else if( event.keyCode == 50 || event.keyCode == 98 || event.keyCode == 83 ){
					_self.playKey(2);
					_self.record(2);
				}
				else if( event.keyCode == 51 || event.keyCode == 99 || event.keyCode == 68 ){
					_self.playKey(3);
					_self.record(3);
				}
				else if( event.keyCode == 52 || event.keyCode == 100 || event.keyCode == 70 ){
					_self.playKey(4);
					_self.record(4);
				}
				else if( event.keyCode == 53 || event.keyCode == 101 || event.keyCode == 71 ){
					_self.playKey(5);
					_self.record(5);
				}
				else if( event.keyCode == 54 || event.keyCode == 102 || event.keyCode == 72 ){
					_self.playKey(6);
					_self.record(6);
				}
				else if( event.keyCode == 55 || event.keyCode == 103 || event.keyCode == 74 ){
					_self.playKey(7);
					_self.record(7);
				}
				else if( event.keyCode == 56 || event.keyCode == 104 || event.keyCode == 75 ){
					_self.playKey(8);
					_self.record(8);
				}
				else if( event.keyCode == 57 || event.keyCode == 105 || event.keyCode == 76 ){
					_self.playKey(9);
					_self.record(9);
				}else if( event.keyCode == 32 ){
					// 空格
					_self.record(0);
				}
				else if( event.keyCode == 13 ){}
				// console.log(event.keyCode)
			});
		},

		// 试听数据触发音乐
		// 分析：传入json数据
		previewSong: function(songData){
			var data = songData.data,
				len = data.length,
				startTime = 0;		//延时定时器计时

			this.playOver();
			for( var i=0; i<len; i++){
				var now = data[i],
					key = now.key,
					time = startTime + now.time*this.options.timeSpace;
				// 触发音键
				this.playPace(key, time);
				// 计时时间叠加
				startTime = time;
			}
		},

		// 弹钢琴的节奏
		// 分析：延时，生成很多个定时器
		playPace: function(key, time){
			var _self = this;
			var eachTimer = setTimeout(function(){
				// 弹奏
				_self.playKey(key);
			}, time);
			// 添加定时器到数据，以便一次性清除
			this.property.lazyTimer.push(eachTimer);
		},

		// 结束自动弹奏
		// 分析：一次性清除定时器及数组
		playOver: function(){
			var _self = this;
			for(var i=_self.property.lazyTimer.length; i>0; i--){
				clearTimeout(_self.property.lazyTimer[i]);
			}
			this.property.lazyTimer = [];
		},

		// 分析链接
		// 返回json
		analysis: function(list){
			if(/#music=(\d:\d-?)*/.test(list)){
				// 获取参数
				var paramReg = /#music=/,
					start = list.search(paramReg) + 7,
					end = list.length,
					params = list.substring(start, end);
				// console.log(params);
				// 封装数据
				var dataArr = params.split("-");
				return this.parseData(dataArr);
			}else{
				alert("钢琴链接格式出错，请粘贴完整！")
			}
		},

		// 数组转成json数据
		parseData: function(arr){
			var autoPlayData = {};
			autoPlayData.data = [];
			var jsonObj = autoPlayData.data;
			var len = arr.length;
			// 遍历封装
			for(var i=0; i<len; i++){
				var newArr = arr[i].split(":"),
					key = newArr[0],
					time = newArr[1];
				if(key){
					var newObj = {};
					newObj.key = key;
					newObj.time = time;
					jsonObj.push(newObj);
				}
			}
			// 返回json
			return autoPlayData;
		},

		getAlbumList: function(){
			return this.options.albumList || {};
		},

		getKeyboard: function(){
			return this.options.keyboard || {};
		},

	}

	return Piano;
}));