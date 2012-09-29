// Author : rainygirl : rainygirl.com
// Thanks to : Mr. Kim Moon Soo
// License : GPL

$.fn.extend({
    center:function () {
        this.css("position","fixed");
        var top=( $(window).height() - this.height() ) / 2
        if(top<0) top=0;
        this.css("top", top+'px');
        this.css("left", ( $(window).width() - this.width() ) / 2 + "px");
        return this;
    }
});

$.initPlaceholder=function(){
    $('input:text').each(function(){
        if(!$(this).hasClass('initedPlaceholder') && $(this).attr('placeholder')!='') {
            $(this).addClass('initedPlaceholder');
            $(this).val($(this).attr('placeholder'));
        }
    });
}

$.openLightLayer = function(data,width,height,typeid,color) {
    if($.openLightLayer.count==undefined)
        $.openLightLayer.count=1;
    else
        $.openLightLayer.count++;
    $('<div class="lightLayerBackground" id="lightLayerBackground'+$.openLightLayer.count+'"></div><div class="lightLayer '+typeid+'" id="lightLayer'+$.openLightLayer.count+'"></div>').appendTo('body');
    layerBG=$('#lightLayerBackground'+$.openLightLayer.count);
    layerMM=$('#lightLayer'+$.openLightLayer.count);
    data='<a href="#" class="close">close</a>'+data;
    layerBG.click(function(){$.closeLightLayer()}).show().css('z-index',9000+$.openLightLayer.count*2-1);
    if(color!=undefined) layerBG.css('background-color',color);
    layerMM.html(data).show().css('z-index',9000+$.openLightLayer.count*2);
    layerMM.find('.modal').css({width:width-2,height:height-2});
    if(width!=undefined) layerMM.css('width',width);
    if(height!=undefined) layerMM.css('height',height);
    layerMM.center();
    if(!jQuery.support.placeholder) $.initPlaceholder();
    layerMM.find('.close').click(function(e){e.preventDefault();$.closeLightLayer()});
	$('.modal input:text').focus();
}

$.closeLightLayer = function() {
    if($.closeLightLayer.lock) return false;
    $('#lightLayer'+$.openLightLayer.count).hide().remove();
    $('#lightLayerBackground'+$.openLightLayer.count).hide().remove();
    $.openLightLayer.count--;
    $.openLightLayer.lightbox=false;
}



var highlighter=function(){
	var regex=new RegExp(keyword,'g');
	var target=['<span class="highlight">',keyword,'</span>'].join('');

	$('.twit_item').each(function(){
		var str=$(this).html();
		if (str.indexOf(keyword)>-1) { $(this).html(str.replace(regex,target)); }
	});
};


var keyword='';
var accounts=[];

var initKeyword=function(nk) {
	keyword=nk;
	$('#twts').html('<div class="add"><a href="#add" id="account_add">'+keyword+'<br> 알바 트윗계정 추가</a>');
	$.get('/alba/keyword',{keyword:keyword},function(data,status){
		accounts=[];
		try{window.scrollTo(0,0);}catch(e){ }
		$.each(data.accounts,function(k,v) {
			accounts.push(v.id_str);
			var nid='twt_'+v.account;
			$(['<div id="',nid,'"></div>'].join('')).prependTo('#twts');
			html=['<div class="twit_head"><img src="http://api.twitter.com/1/users/profile_image?screen_name=',v.account,'&size=normal" class="profileimg"><a href="http://twitter.com/',v.account,'" class="twitnickname outlink">',v.nickname,'<em>',v.account,'</em></a></div>'].join('');

			$(html).prependTo('#'+nid);

		});
		$('#twts').css('width',$('#twts>div').length*320+100);
		var twts={};
		if(data.tweets) $.each(data.tweets,function(k,v){
			html=['<div class="twit_item">',v.text,(v.msg?v.msg:''),'<span class="date">',v.created_at,'</span></div>'].join('');
			try{
				twts[v.account].push(html);
			}catch(e){
				twts[v.account]=[html];
			}
		});
		$.each(twts,function(k,v){
			$(v.join('')).appendTo('#twt_'+k);
		}); 
		highlighter();
	},'json');
}
var init=false;
$(document).ready(function(){
	if(init) return;
	init=true;
    jQuery.support.placeholder = false;
    test = document.createElement('input');
    if('placeholder' in test) jQuery.support.placeholder = true;
	if(window.location.href.indexOf('#')>0) {
		keyword=window.location.href.substr(window.location.href.indexOf('#')+1);
		initKeyword(keyword);
		$('ul.tags li a').removeClass('on');
		$('ul.tags li a').each(function(){ if($(this).html()==keyword) $(this).addClass('on'); });
	} else if (window.location.href.indexOf('?')>0) {
        keyword=decodeURI(window.location.href.substr(window.location.href.indexOf('?q=')+3));
        initKeyword(keyword);
        $('ul.tags li a').removeClass('on');
        $('ul.tags li a').each(function(){ if($(this).html()==keyword) $(this).addClass('on'); });
	} else if($('ul.tags li').length>1) $('ul.tags li:eq(1) a:first').each(function(){
			$(this).addClass('on');
			initKeyword($(this).text());
	});
	$('#keyword_add').bind('click',function(e){
		e.preventDefault();
		$.closeLightLayer();
		html='<div class="modal"><h3>키워드 추가</h3><form id="newkeywordform"><label for="newkeyword">알바가 창궐하는 인물이름 또는 키워드를 적어주세요</label><input type="text" class="text" id="newkeyword" value="" placeholder="인물이름 또는 키워드"><input type="submit" class="submit" value="추가"></form></div>';
		$.openLightLayer(html,300,250);
		$('#newkeywordform').submit(function(){
			var newkeyword=$('#newkeyword').val();
			if ($.trim(newkeyword)=='인물이름 또는 키워드') return false;
			$('.modal .submit').val('추가중...');

			$.post('/alba/keyword',{keyword:newkeyword},function(data,status){
				if(data.result=='ok') {
					$('ul.tags a').removeClass('on');
					$('ul.tags').append(['<li><a href="/#',newkeyword,'" class="on">',newkeyword,'</a></li>'].join(''));
					initKeyword(newkeyword);
					$.closeLightLayer();
				} else {
					$.closeLightLayer();
					initKeyword(newkeyword);
				}
			},'json');
			return false;
		});
	});
});

$('ul.tags a').live('click',function(e){
	e.preventDefault();
	if($(this).hasClass('delete')){ return false; }
	var id=$(this).attr('id');
	if(id=='keyword_add') { return false; } 
	$('ul.tags a').removeClass('on');
	$(this).addClass('on');
	initKeyword($(this).text());	
});

$('a#account_add').live('click',function(e){
	e.preventDefault();
	$.closeLightLayer();
	if($('#twts>div').length>17){ alert('한 키워드에 계정이 너무 많아 브라우저가 느려지고 있습니다. 키워드를 하나 더 만들어 추가해주세요!');return false;}
	html='<div class="modal"><h3>'+keyword+' 알바트윗 추가</h3><form id="newaccountform"><label for="newaccount">'+keyword+'의 알바가 확실한 트위터 아이디를 적어주세요</label><input type="text" class="text" id="newaccount" value="" placeholder="인물이름 또는 키워드"><input type="submit" class="submit" value="추가"></form></div>';
	$.openLightLayer(html,300,250);
	$('#newaccountform').submit(function(){
		var account=$('#newaccount').val().replace('http://','').replace('https://','').replace('@','').replace('#','').replace('!','').replace('/','');
		if($('#twt_'+account).length>0) {alert('이미 있습니다');return false;}

		$('.modal .submit').val('확인중...').addClass('ing');

		$.post('/alba/account',{keyword:keyword,account:account},function(data,status){
			if(data.result=='ok') {
				var nid='twt_'+($('#twts>div').length+1);
				$(['<div id="',nid,'"></div>'].join('')).prependTo('#twts');
				$('#twts').css('width',$('#twts>div').length*320+100);
				$.closeLightLayer();

				html=['<div class="twit_head"><img src="http://api.twitter.com/1/users/profile_image?screen_name=',account,'&size=normal" class="profileimg"><a href="http://twitter.com/',account,'" class="twitnickname outlink">',data.nickname,'<em>',account,'</em></a></div>'].join('');
				$(html).prependTo('#'+nid);
				twts=[];
				$.each(data.tweets,function(k,v){
					html=['<div class="twit_item">',v.text,'<span class="date">',v.created_at,'</span></div>'].join('');
					twts.push(html);
				});
				$('#'+nid).append(twts.join(''));
				highlighter();
			} else {
                $('#newaccount').show('shake',{distance:3,times:5},30,function(){$(this).focus()});
                $('.modal label').html('이미 있습니다. 다른 계정을 적어주세요').addClass('r');
				$('.modal .submit').val('추가').removeClass('ing');
			}
		},'json');
		return false;
	});
});

var domain = window.location.href.replace(/https|http|:\/\//gi, "").split("/")[0];

