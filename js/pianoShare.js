(function($) {

	$.fn.pianoSnsShare = function(options){
		var share_url = $(".share_record").attr("href");

		var defaults = {
				tsina:{//分享到新浪微博 
					url : window.location.href,							//分享的url默认是当前页面
					title : document.title,								//分享的内容默认是当前页面的title
					appkey : 2220906864,								//xuanfeng新浪微博的appkey
					pic : 'http://www.xuanfengge.com/wp-content/themes/lee2.0/images/piano.jpg'	//图片默认是xuanfeng-piano
				},
				renren:{//分享到人人网
					resourceUrl: window.location.href,	 				//分享的url默认是当前页面
					srcUrl : window.location.href,						//分享的url默认是当前页面
					title : document.title,								//分享的内容默认是当前页面的title
					appkey : 243319,									//xuanfeng人人的appkey
					pic : 'http://www.xuanfengge.com/wp-content/themes/lee2.0/images/piano.jpg'	//图片默认是xuanfeng-piano
				},
				tqq:{//分享到腾讯微博
					url : window.location.href,							//分享的url默认是当前页面
					title : document.title,								//分享的内容默认是当前页面的title
					appkey : 801435972,									//xuanfeng腾讯微博的appkey
					pic : 'http://www.xuanfengge.com/wp-content/themes/lee2.0/images/piano.jpg'	//图片默认是xuanfeng-piano
				},
				tqzone:{//分享到腾讯微博
					url : window.location.href,							//分享的url默认是当前页面
					title : document.title,								//分享的内容默认是当前页面的title
					appkey : 100566135,									//xuanfeng腾讯微博的appkey
					pic : 'http://www.xuanfengge.com/wp-content/themes/lee2.0/images/piano.jpg'	//图片默认是xuanfeng-piano
				}
			},
			settings = $.extend(true,{}, defaults, options),
			shareIconName = {
				tsina : '新浪微博',
				renren : '人人网',
				tqq : '腾讯微博',
				tqzone: 'QQ空间'
			},
			shareUrl = {
				tsina : 'http://service.weibo.com/share/share.php?url={url}&title={title}&appkey={appkey}&pic={pic}',
				renren : 'http://widget.renren.com/dialog/share?resourceUrl={resourceUrl}&srcUrl={srcUrl}&title={title}&appkey={appkey}&pic={pic}',
				tqq : 'http://share.v.t.qq.com/index.php?c=share&a=index&url={url}&title={title}&appkey={appkey}&pic={pic}',
				tqzone : 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&pics={pic}&title={title}&summary=快带上你的浏览器来弹钢琴吧，欢乐体验'
			};
		

		return $(this).each(function(){
			
			function openWindow(str){
			    return function(){
			        window.open(formatmodel(shareUrl[str],settings[str]));
			    };
			}
			
			function formatmodel(str,model){
			    for(var k in model){
			        var re = new RegExp("{"+k+"}","g");
			        str = str.replace(re,model[k]);
			    }
			    return str;
			}
			
			for(snsName in settings){ 
				var text= encodeURIComponent(settings[snsName].title);
				settings[snsName].title = text;
			}
			
			for(sns in shareUrl){
			    $(".piano_share_"+sns).off().on('click',openWindow(sns)).attr("title","分享到"+shareIconName[sns]).attr("href","javascript:;"); 
			}
			
		});
	};
})(jQuery);
