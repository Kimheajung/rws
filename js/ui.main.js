var nowSection = 0;			// 현재 섹션
var totalSection = 0;		// 전체 섹션 갯수
var mainWindowH = 0;		// 창 높이
var motionSpeed = '1s';		// 모션속도
var isMotion = false;		// 모션 진행중 여부
var mainHash = [];			// 메인 hash array
var secMoveDelay;			// setTimeout 변수
var mainFooterH;			// 푸터 높이
var sectionYPos;			// 섹션 y 위치
var bgYPos;					// 배경 y 위치
var direction;				// 이전 슬라이드가 어디였나
var secMoveType = 'tabkey';	// 섹션 이동 타입 wheel, navi, tabkey
var forceFooter = false;	// 강제로 푸터 맨끝 포커스 이동했을때 변수
var forceTop = false;		// 강제로 에서 GNB로 접근할때 
var shapePosY = [2000, 0, -1908, -3462]; // shapeObject 위치값
var secPB;					// 섹션별 하단 패딩값
//============================================================================ 메인 기능 시작
function mainSecInit(){
	totalSection = $('#content.main .section').length;
	console.log( "mainSecInit totalSection : " + totalSection );
	// parallax Init
	if( totalSection > 1 ){
		// layout Setting
		if( $('#content.main').hasClass('noPara') == false ){
			layout.quickResize = function(){}
			mainLayoutSet();
		}
		console.log( "mainSecInit secPB : " + secPB )
	} else {
		if( $('#content.main section > .bg').length > 0 ){
			simpleBGSet();
		}
	}
	/*
	$('a, button, *[tabindex=0]').each(function(){
		if( $(this).hasClass('testAct') == false ){
			$(this).addClass('testAct');
			$(this).bind('focusin',function(e){
				console.log( $(e.target).text() );
			});
		}
	});*/
	$('#content.main').css('opacity',1);
	if( oldIE ){
		$('.mainEventThum').remove();
	}
}
//============================================================================ 모션 css 넣기
function motionCssInit(){
	var css = '<style type="text/css">';
	for( var j = 0 ; j < $('.pxNavi li').length ; ++j ){
		var secID = $('.secContain .section:eq('+j+')').attr('id');
		var objNum = $('.secContain .section:eq('+j+') [class*=motionObj]').length;
		for( var i = 0 ; i < objNum ; ++i){
			var num = i*0.02;
			var maxNum = Number(objNum-1)-i;
			css+='#'+secID+' .motionObj'+i+'{transition-delay:'+num+'s}'
			css+='.UP #'+secID+' .motionObj'+maxNum+'{transition-delay:'+num+'s}'
		}
	}
	var objMax = 0;
	$('.mainEventList .slideList > li').each(function(){
		if( $(this).find('.imgGroup img').length == 1 ){
			$(this).find('.imgGroup').addClass('justOne');
			$(this).find('.imgGroup img').addClass('obj1 easeOutExpo');
		}
		if( $(this).find('.imgGroup img').length > objMax ){
			objMax = $(this).find('.imgGroup img').length;
		}
	});
	$('.mainEventList .imgGroup img').addClass('easeOutExpo');
	for( var i = 1 ; i <= objMax ; ++i){
		var num = i*0.06 + moveDelay;
		css+='.mainEventList .obj'+i+'{transition-delay:'+num+'s}';
	}
	css += '.moveContain > * {transition-duration:'+moveDuration+'s}';
	css += '</style>';
	$('head').append( css );
}

//============================================================================ 섹션 네비 셋팅
function pxNaviInit(){
	$('.header h1.logo a').bind({
		'focusin':function(){
			if( $('.parallax').length > 0 ){
				if( $('body').hasClass('footerMode') ){
					forceTop = true;
					footerModeCtrl(false);
					nowSection = 0;
					sectionMove();
				}
			}
		}
	});
	$('.pxNavi a').bind({
		'click':function(e){
			e.preventDefault();
			if( isMotion == false ){
				var id = $(this).attr('href');
				secMoveType = 'navi';
				console.log(".pxNavi a 클릭 id : " + id );
				if( id != mainHash[mainHash.length] ){
					console.log("아이디와 mainHash의 길이가 다르다..... 몬조건이냐 이건" );
					footerModeCtrl(false);
				}
				mainHashChange(id);
			}
		}
	});
	$('.pxNavi').append('<div class="blind focusSet first" tabindex="0"></div><div class="blind focusSet last" tabindex="0"></div>');
	$('.pxNavi .focusSet').bind({
		'focusin':function(){
			if( $(this).hasClass('first') ){
				direction = "DOWN !important";
				secMoveType = "tabkey";
				$( wa.getEnabledFocus( '.secContain .section:eq(0) ') ).first().focus();
			} else {
				$('.pxNavi a').last().focus();
			}
		}
	});
	$('.pxNavi li a').each(function(idx){
		var sectionTit = $('.secContain section:eq('+idx+')').data('title');
		$(this).text( sectionTit );
		idx++;
	});
}

//============================================================================ 메인 휠기능
function mainScrollInit(){
	$(window).on('wheel', function(e){
		secMoveType = 'wheel';
		if( $('body').hasClass('sitemapOpen') == false && $('body').hasClass('srchOpen') == false && $('html').hasClass('popOn') == false && $('.adminPopWrap').length == 0 ){
			//e.preventDefault();
			if( isMotion == false ){
				isMotion = true;
				if( e.originalEvent.deltaY > 0 ){
					mainHashChange('DOWN');
				} else if( e.originalEvent.deltaY < 0 ){
					mainHashChange('UP');
				}
			}
		}
	});
}

//============================================================================ Hash Control
function mainHashCtrl(){
	oldSection = nowSection;
	// hash 바뀌었을때
	$(window).on('hashchange',function(e){
		e.preventDefault();
		if( forceFooter == false ){
			//mainHashChange(window.location.hash);
		}
	});
	// hash로 바로 접근했을때
	if(window.location.hash != "" ){
		secMoveType = 'navi';
		mainHashChange(window.location.hash);
	// hash없이 접근했을때
	} else {
		mainHashChange(mainHash[0]);
	}
}

function mainHashChange(str){
	console.log("mainHashChange : " + str );
	if( str == "DOWN" ){
		if( nowSection < totalSection - 1){
			nowSection++;
			sectionMove();
		} else {
			//console.log( "?????????????? : mainHashChange isMotion : " + isMotion );
			nowSection = totalSection - 1;
			footerModeCtrl(true);
		}
	} else if( str == "UP" ){
		if( $('body').hasClass('footerMode') == false ){
			if( nowSection > 0){
				nowSection--;
				sectionMove();
			} else {
				nowSection = 0;
				secMoveDelayCtrl();
			}
		} else {
			footerModeCtrl(false);
		}
	} else {
		for( var i = 0 ; i < mainHash.length ; ++i ){
			if( str == mainHash[i] ){
				nowSection = i;
				break;
			}
		}
		sectionMove();
	}
}

//============================================================================ 섹션이동
function sectionMove(){
	var oldMenu = $('.pxNavi li.on').index();
	var gap = Math.abs( oldMenu - nowSection );
	$('.secContain').removeClass("UP DOWN");
	if( direction != "DOWN !important" ){ // 위아래 방향 정하기
		( oldMenu < nowSection )?direction="DOWN":direction="UP";
	} else {// parallax navigation에서 tab키로 빠져나갔을때
		direction = "DOWN";
	}
	$('.secContain').addClass(direction);
	// 이동할 섹션 있을때만 실행
	//console.log("gap : " + gap);
	if( gap > 0){
		//console.log("sectionMove 섹션 이동!!!!!!!!!!!!!!!!!!!!!!!!!!! nowSection : " + nowSection );
		isMotion = true;
		focusBlurSet();
		// header control 
		if( nowSection != 0 ){
			$('.header').addClass('sticky');
			$('.header .cateTit').fadeIn(100);
			setTimeout(function(){gnb.barMove();},300);
			if( $('body').hasClass('notice') ){
				
			}
			$('.quick').addClass('topVisible');
		} else {
			$('.header').removeClass('sticky');
			$('.header .cateTit').fadeOut(100);
			setTimeout(function(){gnb.barMove();},300);
			$('.quick').removeClass('topVisible');
		}
		// parallax Navigatoion
		for( var i = 0 ; i < totalSection ; ++i ){
			$('.secContain').removeClass('nowSection' + i);
		}
		$('.pxNavi li').removeClass('on');
		$('.pxNavi li:eq('+nowSection+')').addClass('on');
		$('.secContain').addClass('nowSection' + nowSection);
		$('body.parallax section'+mainHash[nowSection]).addClass('active');
		if( direction != 'DOWN' ){
			$('body.parallax section'+mainHash[nowSection]).addClass('reverse');
		}
		if( $('body.parallax section'+mainHash[nowSection]).hasClass('invertNavi') ){
			$('.pxNavi').addClass('invert');
		} else {
			$('.pxNavi').removeClass('invert');
		}
		// motion speed
		motionSpeed = Number(mainWindowH*0.0005)*((gap-1)*0.5+1);
		if( motionSpeed < 0.6 )motionSpeed = 0.6;
		if( motionSpeed > 1.5 )motionSpeed = 1.5;
		sectionYPos = nowSection*mainWindowH + nowSection*secPB;
		bgYPos = nowSection*mainWindowH;
		// 역방향에서 푸터로 강제로 접근할 때 (최종 실행)
		if( forceFooter == true ){
			sectionYPos += mainFooterH;
			bgYPos += mainFooterH;
			$('body').addClass('footerMode');
			var footerDelayT = motionSpeed - 0.3;
			if( footerDelayT < 0 ) footerDelayT = 0;
			$('body.parallax .footer').css({'transition-duration':'0.3s', 'transition-delay': footerDelayT +'s'});
			oldSection = nowSection = totalSection -1;
		}
		if( $('body.parallax .bgContain').hasClass('fixed') == false ){
			$('body.parallax .bgContain').css({'transform':'translate(0,-'+bgYPos+'px)', '-ms-transform':'translate(0,-'+bgYPos+'px)', 'transition-duration':String(motionSpeed)+'s' });
		} else {
			var colorCode = $('.secContain > .section:eq('+nowSection+')').data('bgColor');
			$('body.parallax .bgContain').css({ 'background-color': colorCode,'transition-duration':String(motionSpeed)+'s' });
		}
		//console.log('section : -' + sectionYPos +', shape : '+ shapePosY[nowSection])
		//console.log("secPB : " + secPB );
		//console.log("section move sectionYPos : " + sectionYPos );
		$('body.parallax .secContain').css({'transform': 'translate(0,-'+sectionYPos+'px)', '-ms-transform': 'translate(0,-'+sectionYPos+'px)', 'transition-duration':String(motionSpeed)+'s' });
		secMoveDelayCtrl(motionSpeed);
		//console.log("oldMenu : " + oldMenu );
		//console.log("nowSection : " + nowSection );
		/*if( nowSection != 0 ){
			if($('.pcQuick').hasClass('topOff') ){
				$('.btnQuick3').stop().fadeIn();
				$('.pcQuick').removeClass('topOff');
			}
		} else {
			if($('.pcQuick').hasClass('topOff') == false ){
				$('.btnQuick3').stop().fadeOut();
				$('.pcQuick').addClass('topOff');
			}
		}*/
	}
	
	if( $('.ie9').length > 0 ){
		setTimeout(function(){
			sectionMoveEnd();
		},motionSpeed)
	}
}

//============================================================================ 섹션이동 끝났을때 실행
var sectionMoveEnd = function (){
	//console.log("sectionMoveEND 섹션 이동 종료>>>>>>>>>>>>>>>>>>>>>!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	$('#content section').each(function(idx){
		if( $(this).attr('id') != mainHash[nowSection] )$(this).removeClass('active reverse');
	});
	$('body.parallax .secContain section').removeClass('nowActive');
	$('body.parallax .secContain section:eq('+nowSection+')').addClass('nowActive');
	( nowSection != 0 )?$('.header').addClass('sticky'):$('.header').removeClass('sticky');
	if( forceFooter == false ){
		/* 주소 frameset 처리되서 굳이 필요하지 않은것 같아서 지움. (ie 느려짐 원인으로 추정)
		window.location.hash = mainHash[nowSection];
		$(window).scrollTop(0);
		주소 frameset 처리되서 굳이 필요하지 않은것 같아서 지움. (ie 느려짐 원인으로 추정) */
		console.log("secMoveType : " + secMoveType );
		console.log("direction : " + direction );
		if(direction == 'UP'){
			if( secMoveType == 'navi' || secMoveType == 'wheel' ){
				$('body.parallax section'+mainHash[nowSection]+' h3.blind').focus();
			} else {
				if( forceTop == false ){
					$( wa.getEnabledFocus( 'body.parallax section'+mainHash[nowSection]+' ') ).last().focus();
				} else {
					forceTop = false;
					$( wa.getEnabledFocus( 'body.parallax .header ') ).first().focus();
				}
			}
		} else if(direction == 'DOWN'){
			if( $('body').hasClass('footerMode') == false ){
				if( secMoveType == 'navi' || secMoveType == 'wheel' ){
					$('body.parallax section'+mainHash[nowSection]+' h3.blind').focus();
				} else {
					$(wa.getEnabledFocus( 'body.parallax section'+mainHash[nowSection]+' ')).first().focus();
				}
			} else {
				if( secMoveType == 'tabkey' ){
					$(wa.getEnabledFocus( 'body.parallax .footer ')).first().focus();
				}
			}
		}
	}
	secMoveType = 'tabkey';
}

//============================================================================ 섹션 이동중에 중복 실행 없애는 기능
function secMoveDelayCtrl(num){
	var timeoutT;
	( num != undefined )? timeoutT = num*1000:timeoutT = 0;
	clearTimeout( secMoveDelay );
	secMoveDelay = setTimeout(function(){
		isMotion = false;
		$('.focusBlur').remove();
		if(forceFooter == true ){
			forceFooter = false;
	//		$(wa.getEnabledFocus( 'body.parallax .footer ')).last().focus();
		}
	},timeoutT+100);
}

//============================================================================ 섹션이동 시작할때 함수
function focusBlurSet(){
	if( forceFooter == false ){
		var str = 	'<div class="focusBlur">'+
		'	<div class="focusPool blind first" tabindex="0">'+ $('.pxNavi li:eq('+nowSection+')').text() + ' 섹션으로 이동중</div>'+
		'	<div class="focusPool blind middle" tabindex="0">'+ $('.pxNavi li:eq('+nowSection+')').text() +' 섹션으로 이동중</div>'+
		'	<div class="focusPool blind last" tabindex="0">'+ $('.pxNavi li:eq('+nowSection+')').text() +' 섹션으로 이동중</div>'+
		'</div>';
		$('body').append(str);
		$('.focusBlur .focusPool').bind({
			'focusin':function(e){
				if( $(this).hasClass('first') ){
					$('.focusBlur .focusPool.middle').focus();
				} else if( $(this).hasClass('last') ){
					$('.focusBlur .focusPool.middle').focus();
				}
			}
		});
		$('.focusBlur .focusPool.middle').focus();
	}
	if( forceFooter == true ){
	//	$(wa.getEnabledFocus( 'body.parallax .footer ')).last().focus();
	}
}


//============================================================================ 푸터 show,hide 컨트롤 하기
function footerModeCtrl($footerMode){
	console.log("footerModeCtrl : " + $footerMode );
	var footerMotionT = '0.3';
	if( $footerMode != undefined ){
		if($footerMode == true){
			if( $('body').hasClass('footerMode') == false ){
				bgYPos += mainFooterH;
				sectionYPos += mainFooterH;
				if( $('body.parallax .bgContain').hasClass('fixed') == false ){
					$('body.parallax .bgContain').css({'transform':'translate(0,-'+bgYPos+'px)', '-ms-transform':'translate(0,-'+bgYPos+'px)', 'transition-delay':'0.01s', 'transition-duration':footerMotionT+'s' });
				}
				$('body.parallax .secContain').css({'transform': 'translate(0,-'+sectionYPos+'px)', '-ms-transform': 'translate(0,-'+sectionYPos+'px)', 'transition-delay':'0.01s', 'transition-duration':footerMotionT+'s' });
				$('body.parallax .footer').css({'transition-duration':footerMotionT+'s', 'transition-delay':'0s'});
				$('body').addClass('footerMode');
				//$('.quickTopBtn').css({'bottom': mainFooterH + 20, 'transition-duration':footerMotionT+'s' });
			}
		} else {
			if( $('body').hasClass('footerMode') == true ){
				bgYPos -= mainFooterH;
				sectionYPos -= mainFooterH;
				if( $('body.parallax .bgContain').hasClass('fixed') == false ){
					$('body.parallax .bgContain').css({'transform':'translate(0,-'+bgYPos+'px)','-ms-transform':'translate(0,-'+bgYPos+'px)', 'transition-duration':footerMotionT+'s'});
				}
				$('body.parallax .secContain').css({'transform': 'translate(0,-'+sectionYPos+'px)', '-ms-transform': 'translate(0,-'+sectionYPos+'px)', 'transition-duration':footerMotionT+'s'});
				$('body.parallax .footer').css({'transition-duration':footerMotionT+'s', 'transition-delay':'0.01s'});
				$('body').removeClass('footerMode');
			}
		}
		secMoveDelayCtrl( footerMotionT );
	}
}

//============================================================================ 리사이징시에 레이아웃 셋팅
function mainResizeInit(){
	$(window).resize(function(){
		sizeSetting();
	});
	$(window).scroll( parallaxHScroll );
	parallaxHScroll();
}

function sizeSetting(){
	mainFooterH = $('.footer').outerHeight();
	if( mainFooterH < 0 || mainFooterH == undefined )mainFooterH = 0; /* 김혜정 - 푸터 높이 지정되는 영역 5/460 */
	mainWindowH = $(window).height();
	(mainWindowH > 800)?$('body').removeClass('miniMode'):$('body').addClass('miniMode');
	$('#content.main .section, #content.main .bgContain > div, #content.main .fixedContain > div').css('height', mainWindowH + 'px');
	bgYPos = nowSection*mainWindowH;
	sectionYPos = nowSection*mainWindowH + nowSection*secPB;
	$('body.parallax .bgContain').css({'transform':'translate(0,-'+bgYPos+'px)', '-ms-transform':'translate(0,-'+bgYPos+'px)'});
	$('body.parallax .secContain').css({'transform':'translate(0,-'+sectionYPos+'px)', '-ms-transform':'translate(0,-'+sectionYPos+'px)'});
	mainWindowW = $(window).width();
	if( mainWindowW < 1270 ){
		$('.topEventContain').addClass('thin');
	} else {
		$('.topEventContain').removeClass('thin');
	}
	if( mainWindowW < 1360 ){
		$('body').addClass('thin');
		$('.pxNavi a').each(function(){
			$(this).attr('title', $(this).text() );
		});
	} else {
		$('.pxNavi a').removeAttr('title');
		$('body').removeClass('thin');
	} 
	if( mainWindowW < 1360 ){
		var num = ( 1360 - mainWindowW ) * 0.5;
		$('.topEventContain .btnPrev').css('margin-left', -635 + num );
		$('.topEventContain .btnNext').css('margin-left', 581 - num  );
	} else if( mainWindowW < 1440 ){
		num = ( 1440 - mainWindowW ) * 0.5;
		$('.topEventContain .btnPrev').css('margin-left', -635 + num );
		$('.topEventContain .btnNext').css('margin-left', 581 - num  );
	} else {
		$('.topEventContain .btnPrev, .topEventContain .btnNext').removeAttr('style');
	}
}

var parallaxHScroll = function(){
	if( $(window).scrollLeft() != 0 ){
		$('body').addClass('mainHScroll');
		$('.bgContain, .fixedContain, .secContain').css({"left":-$(window).scrollLeft(), "right":'auto'});
	} else {
		$('body').removeClass('mainHScroll');
		$('.bgContain, .fixedContain, .secContain').css({"left":0, "right":0});
	}
}

//============================================================================ 접근성등 레이아웃셋팅
focusCenterAlignFunc = null;
function mainLayoutSet(){
	console.log("mainLayoutSet : ");
	// crumbArea 메인에서 삭제하기
	if( $('.crumbArea').length > 0 ){
		$('.crumbArea').remove();
		$('.menu li.active').removeClass('active');
	}
	// 각 section title 밀어넣기
	$('#content.main .section').each(function(){
		$(this).prepend('<h2 class="blind">'+ $(this).data('title')+'</h2>');
	});
	var conEase = $('#content').data('conEase');
	//console.log( "mainLayoutSet" );
	if( conEase == undefined ){
		/* conEase = 'easeInOutQuad'; 김혜정 - 섹션 컨테이너 애니 삭제 */
	}
	$('body').addClass('parallax');
	$('#content button, #content :input, #content a').off('focusin',focusCenterAlignFunc);
	$('#content.main .pxNavi').after('<div class="secContain '+conEase+'"></div>');
	$('.quickTopBtn').addClass(conEase);
	$('.pxNavi').attr('id','pxNavi');
	$('#content section').addClass('section');
	$('#content .section').each(function(idx){
		if( $(this).attr('id') == undefined ){
			$(this).attr('id', 'section'+idx);
		}
		if( $(this).find('.secBottom').length > 0 ){
			$(this).addClass('hasSecBottom');
		}
		mainHash.push( '#'+$(this).attr('id') );
		$('.pxNavi li:eq('+idx+') a').attr('href','#'+$(this).attr('id'));
		$(this).prepend('<h3 class="blind" tabindex="-1">'+ $('#content .section:eq('+idx+')').data('title') +' 컨텐츠 내용 시작</h3>');
		$('.secContain').append($(this));
	});
	secPB = parseInt( $('#content.main .section').css('padding-bottom') );
	$('.secContain, .footer').on('focusin', focusCollector );
	$( wa.getEnabledFocus( '.footer ') ).last().addClass('focusLastBtn');
	mainBGSet();
	$('body.parallax .bgContain').on('transitionend webkitTransitionEnd oTransitionEnd msTransitionEnd', sectionMoveEnd );
	sizeSetting();
	
	//Event
	pxNaviInit();
	//paraSkipNaviSet();
	mainHashCtrl();
	mainResizeInit();
	mainScrollInit();
	
	// search, sitemap 버튼 클릭 시 메인배너 재생/일시정지
	$('.gnb_search, .gnb_sitemap').bind({
		'click': function (e) {
			setTimeout(function () {
				if ($('.srchOpen').length > 0 || $('.sitemapOpen').length > 0) {
					isMotion = true;
					mainTopAutoState = false;
					mainTopAutoStop();
				} else {
					isMotion = false;
					mainTopAutoState = true;
					mainTopAutoPlay();
				}
			}, 500);
		}
	});
	
	// 개인 메인 이벤트
	if( pubMode == true ){
		motionOrderInit();
		eventNaviInit();
		cardRolling();
		topSlideBanner();
		mainTopAutoInit();
	}
	$('.section.active').removeClass('active');
	
}

//============================================================================ skipNavi 셋팅
function paraSkipNaviSet(){
	$('#skipNavi').empty();
	$('#content .section').each(function(idx){
		$('#skipNavi').append('<a class="secNavi" href="#'+$('.section:eq('+idx+')').attr('id')+'">'+$('.pxNavi li:eq('+idx+') a').text()+' 바로가기</a>');
	});
	$('#skipNavi').append('<a href="#pxNavi">섹션 이동 메뉴 바로가기</a>');
	$('#skipNavi').append('<a href="#gnb">주메뉴 바로가기</a>');
	
	$('#skipNavi a.secNavi').bind({
		'click':function(e){
			e.preventDefault();
			var id = $(this).attr('href');
			$('.pxNavi a[href="'+id+'"]').trigger('click');
		}
	});
	
	$('.focusLastBtn').bind({
		'focusin':function(){
			if( $('body').hasClass('footerMode') == false ){
				if( $('.pxNavi li:last-child').hasClass('on') == false ){
					console.log("이조건이 걸리긴하냐??");
					forceFooter = true;
					footerModeCtrl(true);
					//mainHashChange($('.pxNavi a').last().attr('href')); /* 해시태그 기능 사용 안하기에 삭제 */
				} else {
					forceFooter = true;
				}
			}
		}
	});
}
//============================================================================ 배경컨테이너 만들기 
function mainBGSet(){
	var bgEase = $('#content').data('bgEase');
	if( bgEase == undefined ){
		bgEase = 'easeInOutQuint';
	}
	$('#content.main').append('<div class="bgContain '+bgEase+'"></div>');
	$('#content.main').append('<div class="fixedContain"></div>');
	$('#content.main section').each(function(){
		$('.bgContain').append('<div></div>');
		$('.fixedContain').append('<div></div>');
		var bgContain = $('.bgContain > div').last();
		var fixedContain = $('.fixedContain > div').last();
		var imgURL = $(this).find('.bg').attr('src');
		//console.log('걸렸다');
		if( $(this).find('.bg').hasClass('fixedBG') == false ){
			if( imgURL != undefined ){
				$(bgContain).css({'height': mainWindowH+'px', 'background':'url('+imgURL+') no-repeat center center', 'backgroundSize':'cover'});
			} else {
				var color = $(this).find('.bg').css('background-color');
				$(bgContain).css({'height': mainWindowH+'px', 'background-color': color});
			}
			$(fixedContain).remove();
		} else {
			$(bgContain).css({'height': mainWindowH+'px'});
			$(fixedContain).css({'height': mainWindowH+'px', 'background':'url('+imgURL+') no-repeat center center', 'backgroundSize':'cover'});
		}
		$(this).find('.bg').remove();
		if( $('div.fixedBG').length > 0 ){
			$('div.fixedBG').addClass('remove');
			$('.fixedContain').append( '<div class="bgVisualSlide">' +$('div.fixedBG').html() + '</div>' );
			$('div.fixedBG.remove').remove();
		}
	});
}

function simpleBGSet(){
	$('#content.main section > .bg').each(function(){
		var imgURL = $(this).attr('src');
		var imgHeight = 'auto';
		if( $(this).data('height') != undefined ){
			imgHeight = $(this).data('height')+'px';
		}
		var section = $(this).closest('section');
		//console.log( "imgURL : " + imgURL );
		$(section).css({'height': imgHeight, 'background':'url('+imgURL+') no-repeat center center', 'backgroundSize':'cover'});
		$(this).remove();
	});
}

//============================================================================ 포커스가 어느 섹션에 있는지 Catch
function focusCollector(e){
	console.log( "OK 찾는다 : " +  $(e.target).text());
	if( $(e.target).closest('.footer').length == 0 ){
		if( $(e.target).closest('.section').index() != nowSection ){
			nowSection = $(e.target).closest('.section').index();
		}
		if( $('body').hasClass('footerMode') ){
			direction = "UP !important";
			footerModeCtrl(false);
		}
	} else {
		if( $('body').hasClass('footerMode') == false ){
			forceFooter = true;
			nowSection = totalSection - 1;
			footerModeCtrl(true);
		}
	}
	
	if( $('.pxNavi li:eq('+nowSection+')').hasClass('on') == false ){
		sectionMove();
	}
}

























