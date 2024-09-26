/* 검색영역 배경 바꾸기 */
$(document).on('ready', function() {
  
	$('.field').on('focus', function() {
	  $('.searchbox').addClass('is-focus');
	});
	
	$('.field').on('blur', function() {
	  $('.searchbox').removeClass('is-focus is-type');
	});
	
	$('.field').on('keydown', function(event) {
	  $('.searchbox').addClass('is-type');
	  if((event.which === 8) && $(this).val() === '') {
		$('.searchbox').removeClass('is-type');
	  }
	});
	
  });