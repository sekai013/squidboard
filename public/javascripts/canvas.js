$(function() {
	const Stages = {
		hakohugu: {
			size: {
				width: 800,
				height: 1500
			}
		},
		sionome: {
			size: {
				width: 800,
				height: 1137
			}
		},
		blackbass: {
			size: {
				width: 600,
				height: 1200
			}
		},
		arowana: {
			size: {
				width: 675,
				height: 1800
			}
		},
		dekaline: {
			size: {
				width: 800,
				height: 1600
			}
		},
		hokke: {
			size: {
				width: 750,
				height: 1900
			}
		},
		mozuku: {
			size: {
				width: 800,
				height: 800
			}
		},
		negitoro: {
			size: {
				width: 700,
				height: 1600
			}
		},
		tachiuo: {
			size: {
				width: 800,
				height: 1400
			}
		},
		mongara: {
			size: {
				width: 800,
				height: 1422
			}
		},
		hirame: {
			size: {
				width: 800,
				height: 1244
			},
		}
	}

	var canvas = document.getElementById('canvas');
	if (!canvas || !canvas.getContext) return false;
	var context = canvas.getContext('2d');
	context.lineJoin = 'round';
	context.lineCap = 'round';
	var stageContainer = $('#stage-container');
	var stageSelector = $('#stage-selector');
	var modeSelector = $('#mode-selector');

	var loadStage = function() {
		var calcMagnifcation = function(stage) {
			return Math.min(canvas.width/stage.size.width,
											canvas.height/stage.size.height,
											1);
		};
		var stage = Stages[$(stageSelector).val()];
		var img = new Image();
		img.src = '/images/' + $(modeSelector).val() + '/' + $(stageSelector).val() + '.jpg';
		img.onload = function() {
			var mag = calcMagnifcation(stage);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(img,
												0, 0, stage.size.width, stage.size.height,
												(canvas.width-stage.size.width*mag)/2.0, 0, stage.size.width*mag, stage.size.height*mag);
			cacheCanvas();
		};
	};

	$(stageSelector).on('change', loadStage);
	$(modeSelector).on('change', loadStage);

	/*** Drawing Line ***/

	const BorderSize = 0;
	var startX, startY, endX, endY;
	var isDrawing = false;
	var cache = [];
	var cacheLevel = -1;
	var socket = io();

	var onMouseDown = function(e) {
		if (e.pageX && e.pageY) {
			startX = e.pageX - $(canvas).offset().left - BorderSize;
			startY = e.pageY - $(canvas).offset().top - BorderSize;
		} else {
			e.preventDefault();
			var touch = e.originalEvent.touches[0];
			startX = touch.clientX + document.body.scrollLeft - $(canvas).offset().left - BorderSize;
			startY = touch.clientY + document.body.scrollTop - $(canvas).offset().top - BorderSize;
		}
		isDrawing = true;
	};
	var onMouseMove = function(e) {
		if (!isDrawing) return;
		if (e.pageX && e.pageY) {
			endX = e.pageX - $(canvas).offset().left - BorderSize;
			endY = e.pageY - $(canvas).offset().top - BorderSize;
		} else {
			var touch = e.originalEvent.touches[0];
			endX = touch.clientX + document.body.scrollLeft - $(canvas).offset().left - BorderSize;
			endY = touch.clientY + document.body.scrollTop - $(canvas).offset().top - BorderSize;
		}
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(endX, endY);
		context.stroke();
		startX = endX;
		startY = endY;
	};
	var stopDrawing = function() {
		if (isDrawing) cacheCanvas();
		isDrawing = false;
	};

	$(canvas).on('mousedown', onMouseDown)
					 .on('mousemove', onMouseMove)
					 .on('mouseup', stopDrawing)
					 .on('mouseleave', stopDrawing);
	$(canvas).on('touchstart', onMouseDown)
					 .on('touchmove', onMouseMove)
					 .on('touchend', stopDrawing);

	/*** Drawing Line Style ***/

	$('#stage-form').on('submit', function(e) { return false; });

	/***** Line Color *****/

	var lineColorButton = $('#color-button');

	var setLineColor = function() {
		context.strokeStyle = lineColorButton.val();
	};
	var isColorPopupOpen = false;

	var onClickColorBtn = (function() {

		const PopupWidth = 200;
		const PopupHeight = 350;
		
		return function(e) {

			e.stopPropagation();
			if (isColorPopupOpen) return;
			isColorPopupOpen = true;
			var popupContainer = $('#color-popup-container');
			popupContainer.css({
				'box-sizing': 'content-box',
				width: PopupWidth,
				height: PopupHeight,
				position: 'absolute',
				left: e.pageX,
				top: e.pageY,
				display: 'none'
			}).animate({
				height: 'toggle',
				opacity: 'toggle'
			});
			$(document).on('keydown', onESCKeydownColor);
			$(document).on('click', onClickNonColorPopup);
			$('.color').on('click', onClickColorPopupBtn);

		};

	})();

	var removeColorPopup = function() {
		$(document).off('keydown', onESCKeydownColor);
		$(document).off('click', onClickNonColorPopup);
		$('.color').off('click', onClickColorPopupBtn);
		$('#color-popup-container').animate({
			height: 'toggle',
			opacity: 'toggle',
		}, function() {
			lineColorButton.on('click', onClickColorBtn);
		});
	};

	var onESCKeydownColor = function(e) {
		if (isColorPopupOpen && e.keyCode === 27) {
			isColorPopupOpen = false;
			removeColorPopup();
		}
	};

	var onClickNonColorPopup = function(e) {
		if (isColorPopupOpen && !$.contains($('#color-popup-conteiner'), e.target)) {
			isColorPopupOpen = false;
			removeColorPopup();
		}
	};

	var onClickColorPopupBtn = function(e) {
		if (!isColorPopupOpen) return;
		lineColorButton.css('background-color', e.target.id);
		lineColorButton.val(e.target.id);
		setLineColor();
		isColorPopupOpen = false;
		removeColorPopup();
	};

	lineColorButton.on('click', onClickColorBtn);

	/***** Line Width *****/

	var lineWidthButton = $('#width-button');

	var setLineWidth = function() {
		context.lineWidth = lineWidthButton.val();
	};
	var isWidthPopupOpen = false;

	var onClickWidthBtn = (function() {

		const PopupWidth = 150;
		const PopupHeight = 50;
		
		return function(e) {

			e.stopPropagation();
			if (isWidthPopupOpen) return;
			isWidthPopupOpen = true;
			var popupContainer = $('#width-popup-container');
			popupContainer.css({
				'box-sizing': 'content-box',
				width: PopupWidth,
				height: PopupHeight,
				position: 'absolute',
				left: e.pageX,
				top: e.pageY,
				display: 'none'
			}).animate({
				height: 'toggle',
				opacity: 'toggle'
			});
			$(document).on('keydown', onESCKeydownWidth);
			$(document).on('click', onClickNonWidthPopup);
			$('.width').on('click', onClickWidthPopupBtn);

		};

	})();

	var removeWidthPopup = function() {
		$(document).off('keydown', onESCKeydownWidth);
		$(document).off('click', onClickNonWidthPopup);
		$('.color').off('click', onClickWidthPopupBtn);
		$('#width-popup-container').animate({
			height: 'toggle',
			opacity: 'toggle',
		}, 'fast', function() {
			lineWidthButton.on('click', onClickWidthBtn);
		});
	};

	var onESCKeydownWidth = function(e) {
		if (isWidthPopupOpen && e.keyCode === 27) {
			isWidthPopupOpen = false;
			removeWidthPopup();
		}
	};

	var onClickNonWidthPopup = function(e) {
		if (isWidthPopupOpen && !$.contains($('#width-popup-conteiner'), e.target)) {
			isWidthPopupOpen = false;
			removeWidthPopup();
		}
	};

	var onClickWidthPopupBtn = function(e) {
		if (!isWidthPopupOpen) return;
		lineWidthButton.css('background-image', 'url(' + e.target.value + ')');
		lineWidthButton.val(e.target.id);
		setLineWidth();
		isWidthPopupOpen = false;
		removeWidthPopup();
	};

	lineWidthButton.on('click', onClickWidthBtn);

	/*** Stamp ***/

	var stampButton = $('#stamp-button');
	var isStampPopupOpen = false;

	var onClickStampBtn = (function() {

		const PopupWidth = 100;
		const PopupHeight = 50;
		
		return function(e) {

			e.stopPropagation();
			if (isStampPopupOpen) return;
			isStampPopupOpen = true;
			var popupContainer = $('#stamp-popup-container');
			popupContainer.css({
				'box-sizing': 'content-box',
				width: PopupWidth,
				height: PopupHeight,
				position: 'absolute',
				left: e.pageX,
				top: e.pageY,
				display: 'none'
			}).animate({
				height: 'toggle',
				opacity: 'toggle'
			});
			$(document).on('keydown', onESCKeydownStamp);
			$(document).on('click', onClickNonStampPopup);
			$('.stamp').on('click', onClickStampPopupBtn);

		};

	})();

	var removeStampPopup = function() {
		$(document).off('keydown', onESCKeydownStamp);
		$(document).off('click', onClickNonStampPopup);
		$('.color').off('click', onClickStampPopupBtn);
		$('#stamp-popup-container').animate({
			height: 'toggle',
			opacity: 'toggle',
		}, 'fast', function() {
			stampButton.on('click', onClickStampBtn);
		});
	};

	var onESCKeydownStamp = function(e) {
		if (isStampPopupOpen && e.keyCode === 27) {
			isStampPopupOpen = false;
			removeStampPopup();
		}
	};

	var onClickNonStampPopup = function(e) {
		if (isStampPopupOpen && !$.contains($('#stamp-popup-conteiner'), e.target)) {
			isStampPopupOpen = false;
			removeStampPopup();
		}
	};

	var onClickStampPopupBtn = function(e) {
		if (!isStampPopupOpen) return;
		stampButton.css('background-image', 'url(' + e.target.value + ')');
		stampButton.val(e.target.id);
		isStampPopupOpen = false;
		removeStampPopup();
	};

	stampButton.on('click', onClickStampBtn);

	const Stamps = {
		'beacon-gamepad': {
			size: {
				width: 156,
				height: 138
			}
		},
		'beacon-real': {
			size: {
				width: 173,
				height: 243
			}
		}
	}

	var stampCanvas = function(e) {
		if (!$('#stamp-checkbox').prop('checked')) return;
		var img = new Image();
		img.src = '/images/stamp/png/' + stampButton.val() + '.png';
		img.onload = function() {
			var x, y;
			var stamp = Stamps[stampButton.val()];
			var mag = Math.min(37/stamp.size.width, 37/stamp.size.height);

			if (e.pageX && e.pageY) {
				x = e.pageX - $(canvas).offset().left - BorderSize;
				y = e.pageY - $(canvas).offset().top - BorderSize;
			} else {
				e.preventDefault();
				var touch = e.originalEvent.touches[0];
				x = touch.clientX + document.body.scrollLeft - $(canvas).offset().left - BorderSize;
				y = touch.clientY + document.body.scrollTop - $(canvas).offset().top - BorderSize;
			}

			context.drawImage(img,
												x-stamp.size.width*mag/2,
												y-stamp.size.height*mag/2,
												stamp.size.width*mag,
												stamp.size.height*mag);
			cacheCanvas();
		};
	};

	$(canvas).on('click', stampCanvas)
					 .on('touchstart', stampCanvas);

	/*** Canvas Cache, Undo, Redo ***/

	const CacheMaxLen = 15;
	var emitCache = function() {
		socket.emit('cache', {
			cache: cache,
			cacheLevel: cacheLevel
		});
	};
	var cacheCanvas = function() {
		if (++cacheLevel < cache.length) {
			cache.length = cacheLevel;
		}
		cache.push({
			url: canvas.toDataURL(),
			stage: stageSelector.val(),
			mode: modeSelector.val()
		});
		if (cache.length > CacheMaxLen) {
			cache = cache.slice(cache.length - CacheMaxLen);
			cacheLevel = CacheMaxLen - 1;
		}
		emitCache();
	};
	var loadCache = function() {
		var img = new Image();
		var c = cache[cacheLevel];
		img.src = c.url;
		img.onload = function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(img, 0, 0);
		};
		stageSelector.val(c.stage);
		modeSelector.val(c.mode);
	};

	var onClickUndo = function(e) {
		e.preventDefault();
		if (cacheLevel <= 0) return;
		cacheLevel--;
		loadCache();
		emitCache();
	};
	var onClickRedo = function(e) {
		e.preventDefault();
		if (cache.length - 1 <= cacheLevel) return;
		cacheLevel++;
		loadCache();
		emitCache();
	};
	var onClickClear = function(e) {
		e.preventDefault();
		context.clearRect(0, 0, canvas.width, canvas.height);
		loadStage();
		emitCache();
	};

	var onCacheInitialized = function(c) {
		if (c.cacheLevel < 0) {
			loadStage();
		} else {
			cacheUpdate(c);
		}
	};
	var cacheUpdate = function(c) {
		cache = c.cache;
		cacheLevel = c.cacheLevel;
		loadCache();
	};

	$('#undo').on('click', onClickUndo);
	$('#redo').on('click', onClickRedo);
	$('#clear').on('click', onClickClear);

	socket.on('cacheInitialize', onCacheInitialized);
	socket.on('cacheUpdate', cacheUpdate);

	setLineColor();
	setLineWidth();
});
