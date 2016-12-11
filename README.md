piano-play
==========

##基于html5的钢琴弹奏游戏

- demo预览：http://www.xuanfengge.com/demo/201612/piano/html/index.html
- 钢琴节奏：http://www.xuanfengge.com/piano


##功能

- 看谱弹琴
- 录制曲子
- 分享曲子
- 弹奏试听

##2016-12-10更新
- 更新demo样式
- 优化代码，抽出为组件
- piano-play.js 可直接被引用或者AMD、CMD方式加载
- 增加动画
- 取消本地保存曲子功能

##构建
使用WeFlow：http://weflow.io

##piano-play.js
###引用

可直接被引用或者AMD、CMD方式加载

````
var piano = new Piano({
	playKeyCallback: function(i){},
});
````

###options
````
albumList: {	// 曲谱json数据
	"小星星": "11556650443322105544332055443320115566504433221",
	"茉莉花": "33568865056503356886505650555356066503235032101210321203568650523532121",
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
mediaSrc: ''         // 音频路径前缀
````

###方法
- getAudioFormat：检测支持audio的格式，mp3或者ogg
- checkReady：检测是否全部音频加载完成
- autoPlay：打开页面时自动播放，可以在url中传递参数#music=xxx或者页面打开时随机播放
- playKey：根据key播放按键声音，0-9，0为空格
- startRecord：开始录制
- finishRecord：完成录制
- cancelRecord：取消录制
- getStatus：获取当前是否正在弹奏
- previewSong：试听数据触发音乐，传入json数据
- playOver：结束自动弹奏
- analysis：分析链接，返回json
- parseData：数组转成json数据
- getAlbumList：获取曲谱列表，用于渲染
- getKeyboard：获取曲谱-键盘定义

###曲谱格式

自动播放URL格式

`#music=1:0-2:3-3:2-4:2-5:2-6:2-7:2-8:2-9:2`

- : 冒号前表示key
- : 冒号后表示时间
- 每个节奏使用-中划线分隔

曲谱json数据

`小星星: 11556650443322105544332055443320115566504433221`

- 0：间隔符
- 8、9：高音节拍，其余为低音节拍

-------------------
 * 源码未经允许勿使用于其他网站！
