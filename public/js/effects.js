function effects(botao, splash, image)
{
	$('#'+botao).effect("pulsate", {times:3}, 1500);
	$('#'+splash).toggleClass('splashOrange');
	$('#image-'+image).attr('src', '/images/2.0/'+image+'_neg.jpg');
}