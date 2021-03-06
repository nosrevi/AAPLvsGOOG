﻿
var mode = 1;

var Game = function(){

	var init = function(){
		
        var loading = $('<img>').attr({id: 'loading', src: 'images/g/loading.jpg'})
		$('#wrap').append( loading ).css('left', (document.body.offsetWidth  - 900 ) / 2 + 'px');
    
		//document.body.style.position = 'relative'
		//document.body.style.left = ( document.body.offsetWidth  - 900 ) / 2 + 'px'
		//document.body.style.top = '20px'
		//document.body.style.overflow = 'hidden';

//		div2 = document.body.appendChild( document.createElement( 'div' ) );
//		div2.style.position = 'absolute';
//		div2.style.top = '300px';
//		div2.style.left = '450px';
//		div2.style.fontSize = '35px'
//		div2.style.color = '#fff';
//		div2.style.width = '500px';
//		div2.style.height = '500px';
		
		Util.loadImg( function(){	
			
			Util.loadAudio( function(){
			
        $('#start').prop('disabled', false);
				gameStart();

			})
		
		});

	}

	return {
		init: init
	}

}();

var gameStart = function(){
	
		$('#wrap > img').remove();
		$('#wrap > div').remove();
			
		Timer.start();
	
		window.player1 = Spirit.getInstance( Config.Spirit.RYU1 );
		window.player2 = Spirit.getInstance( Config.Spirit.RYU2 );
	
		player1.setEnemy( player2 );
		player2.setEnemy( player1 );

		player1.bloodBar = Blood.leftBar();
		player2.bloodBar = Blood.rightBar();
	
		window.map = Map.init();
				
		window.Stage = Stage();

		Spirit.interface( 'Stage', Stage );

		player1.init( 80, 240, 1 );   //left, top, direction
		player2.init( 680, 240, -1 );  //left, top, direction
	
		Blood.init();

		player1.keyManage.stop();
		player1.ai = player1.implement( 'Ai' );
		//player1.ai.start();
		
		player2.keyManage.stop();
		player2.ai = player2.implement( 'Ai' );
		//player2.ai.start();

		player1.enemy.bloodBar.event.listen( 'empty', function(){
//      if (player_dead == 2) {
//        $('#draw').val(+$('#draw').val() + 1);
//      } else {
      $('#'+player1.name+'_win').text(+$('#'+player1.name+'_win').text() + 1);
//      }
			player1.ai.stop();
			player2.ai.stop();
		})

		player2.enemy.bloodBar.event.listen( 'empty', function(){
//      if (player_dead == 2) {
//        $('#draw').val(+$('#draw').val() + 1);
//      } else {
      $('#'+player2.name+'_win').text(+$('#'+player2.name+'_win').text() + 1);
//      }
			player1.ai.stop();
			player2.ai.stop();
		})

//		var pause = false, lock = false;
//	
//		document.onkeydown = function( ev ){
//			var ev = ev || window.event;
//			var keycode = ev.keyCode;
//			if ( keycode === 113 ){
//				( pause = !pause ) ? Timer.stop() : Timer.start();
//			}
//			if ( keycode === 50 || keycode === 49 ){
//				if ( lock ) return;
//				lock = true;
//				mode = keycode - 48;
//				player1.ai.stop();
//				player2.ai.stop();
//				Game.reload();
//				setTimeout( function(){
//					lock = false;
//				}, 1000 )
//			}
//		}	
	
}

var fightStart = function(){
  player1.ai.start();
  player2.ai.start();
  $('#start').prop('disabled', true);
}

var Blood = function(){
	
	var init = function(){

        var div = $('<div>').addClass('blood');

		$('#wrap').append( div );

        var img = $('<img>').attr({src: 'images/g/bar.gif'});
		div.append( img );

	}
	
	var reload = function(){
		
		var d = $('#wrap');

		while( d.firstChild != null && d.firstChild.tagName !== 'CANVAS'  ){
			d.removeChild( d.firstChild );
		}

		init();
	}

	var animateWidth = function( timeAll, _f_width, width ){

		var f_time = +new Date;

		var easing = Config.easing[ 'linear' ], timeoutfn;

		var move = function(){
			var t = ( ( +new Date ) - f_time ) / timeAll;
			var w = easing( t, _f_width, width, 1 );
			if ( t > 1 ){
				w = _f_width + width;
				timeoutfn && timeoutfn();
			}
			return w;
		}

		timeout = function( fn ){
			w = _f_width + width;
			timeoutfn = fn;
		}
		
		var fireTimeout = function(){
			w = _f_width + width;
			timeoutfn && timeoutfn();
		}

		return {
			move: move,
			timeout: timeout,
			fireTimeout: fireTimeout
		}
	}


	var leftBar = function(){

		var div = document.createElement( 'div' );

		div.style.top = '41px';
		div.style.left = '96px';
		div.style.width = '322px';
		div.style.height = '21px';
		div.style.background = 'yellow';
		div.style.position = 'absolute';
		div.style.zIndex = 9999;
		div.style.border = '1px #fff solid';

		$('#wrap').append(div);

		var _blood = 1500, _f_left = 96, _f__blood = 1500, _f_width = 322, currWidth = _f_width, timer, animate, emptyfn;
		
		var event = Event();
		
		var framefn = function(){

			var w = animate.move();

			div.style.width = w + 'px';
			div.style.left = Math.min( _f_left + _f_width - w , _f_left + _f_width )+ 'px';

		}
		
		var firing = false;
		
		timer = Timer.add( framefn );

		var reduce = function( count ){
	
			_blood -= count;

			var _w = -count / _f__blood * _f_width;

			var timeAll = Math.min( 500, Math.abs( count * 1.5 ) );

			animate = animateWidth( timeAll, currWidth, _w );

			if ( _blood < 0 ){
				event.fireEvent( 'empty' );
			}

			animate.timeout( function(){
				currWidth += _w;
				firing = false;
				timer.stop();
			});

			if ( firing ){
				animate.fireTimeout();	
			}

			timer.start();
			
			firing = true;

		}

		var reload = function(){
			reduce( _blood - _f__blood );
		}
		
		return {
			reduce: reduce,
			event: event,
			reload: reload
		}
		
	}


	var rightBar = function(){
		var div = document.createElement( 'div' );
		div.style.top = '41px';
		div.style.left = '493px';
		div.style.width = '320px';
		div.style.height = '21px';
		div.style.background = 'yellow';
		div.style.position = 'absolute';
		div.style.zIndex = 9999;
		div.style.border = '1px #fff solid';
		$('#wrap').append(div);

		var _blood = 1500, _f_left = 493, _f__blood = 1500, _f_width = 320, currWidth = _f_width, timer, animate, emptyfn, queue = Interfaces.Queue();

		var event = Event();
		
		var framefn = function(){

			var w = animate.move();

			div.style.width = w + 'px';

		}
		
		var firing = false;
		
		timer = Timer.add( framefn );

		var reduce = function( count ){
			
			_blood -= count;

			var _w = -count / _f__blood * _f_width;

			var timeAll = Math.min( 500, Math.abs( count * 1.5 ) );

			animate = animateWidth( timeAll, currWidth, _w );

			if ( _blood < 0 ){
				event.fireEvent( 'empty' );
			}

			animate.timeout( function(){
				currWidth += _w;
				firing = false;
				timer.stop();
			});

			if ( firing ){
				animate.fireTimeout();	
			}

			timer.start();
			
			firing = true;

		}
		
		var empty	= function( fn ){
			emptyfn = fn;
		}

		var reload = function(){
			reduce( _blood - _f__blood );
		}
		
		return {
			reduce: reduce,
			event: event,
			reload: reload
		}

	}
	
	return {
		init: init,
		leftBar: leftBar,
		rightBar: rightBar,
		reload: reload,
	}
	
}()

window.onload = function(){
	Game.init();
}

Game.reload = function(lastGame){
	player1.keyManage.stop();
	player2.keyManage.stop();
	player1.bloodBar.reload();
	player2.bloodBar.reload();
	setTimeout( function(){
		player1.play( 'force_wait', 'force' );
		setTimeout( function(){
		 player1.animate.moveto( 80, 240 );
		 player1.keyManage.start();
		 player1.direction = 1;
		}, 30 )

		player2.play( 'force_wait', 'force' );
		setTimeout( function(){
		 player2.animate.moveto( 680, 240 );
		 player2.keyManage.start();
		 player2.direction = -1;
		}, 30 )
    $('#start').prop('disabled', false);
		
	}, 1000 )

}
