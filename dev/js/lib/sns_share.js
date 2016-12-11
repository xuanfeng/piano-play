// 文章分享
(function($) {
	$.fn.snsShare = function(options){

		var defaults = {
			// 分享到新浪微博
			tsina: {
				url: encodeURIComponent(window.location.href),							//分享的url默认是当前页面
				title: document.title,								//分享的内容默认是当前页面的title
				appkey: 3234732766,								//xuanfeng新浪微博的appkey
				pic: 'http://www.xuanfengge.com/wp-content/themes/lee/images/logo.png'	//图片默认是xuanfeng-logo
			},
			// 分享到人人网
			renren: {
				resourceUrl: encodeURIComponent(window.location.href),	 				//分享的url默认是当前页面
				srcUrl: encodeURIComponent(window.location.href),						//分享的url默认是当前页面
				title: document.title,								//分享的内容默认是当前页面的title
				appkey: 243319,									//xuanfeng人人的appkey
				pic: 'http://www.xuanfengge.com/wp-content/themes/lee/images/logo.png'	//图片默认是xuanfeng-logo
			},
			// 分享到腾讯微博
			tqq: {
				url: encodeURIComponent(window.location.href),							//分享的url默认是当前页面
				title: document.title,								//分享的内容默认是当前页面的title
				appkey: 801435972,									//xuanfeng腾讯微博的appkey
				pic: 'http://www.xuanfengge.com/wp-content/themes/lee/images/logo.png'	//图片默认是xuanfeng-logo
			},
			// 分享到QQ空间
			tqzone: {
				url: encodeURIComponent(window.location.href),							//分享的url默认是当前页面
				title: document.title,								//分享的内容默认是当前页面的title
				appkey: 100566135,									//xuanfeng腾讯微博的appkey
				pic: 'http://www.xuanfengge.com/wp-content/themes/lee/images/logo.png'	//图片默认是xuanfeng-logo
			}
		},
		settings = $.extend(true, {}, defaults, options),
		shareIconName = {
			tsina: '新浪微博',
			renren: '人人网',
			tqq: '腾讯微博',
			tqzone: 'QQ空间'
		},
		shareUrl = {
			tsina: 'http://service.weibo.com/share/share.php?url={url}&title={title}&appkey={appkey}&pic={pic}',
			renren: 'http://widget.renren.com/dialog/share?resourceUrl={resourceUrl}&srcUrl={srcUrl}&title={title}&appkey={appkey}&pic={pic}',
			tqq: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={url}&title={title}&appkey={appkey}&pic={pic}',
			tqzone: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&pics={pic}&title={title}&summary=轩枫阁'
		}


		return $(this).each(function(){

			function openWindow(str){
			    return function(){
			        window.open(formatmodel(shareUrl[str],settings[str]));
			    }
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
			    $(".js_share_" + sns).off().on('click', openWindow(sns)).attr("title", "分享到" + shareIconName[sns]).attr("href", "javascript:;");
			}

		});
	}
})(jQuery);
