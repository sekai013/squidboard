$(function() {
	const Stages = {
		hakohugu: {
			size: {
				width: 800,
				height: 1500
			},
			path: {
				nawabari: '/images/nawabari/hakohugu.jpg',
				area: '/images/area/hakohugu.jpg'
			}
		},
		sionome: {
			size: {
				width: 800,
				height: 1137,
			},
			path: {
				nawabari: '/images/nawabari/sionome.jpg',
				area: '/images/area/sionome.jpg'
			}
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
		var stage = Stages[$(stageSelector).val()];
		var img = new Image();
		img.src = stage.path[$(modeSelector).val()];
		img.onload = function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.drawImage(img,
												0, 0, stage.size.width, stage.size.height,
												(canvas.width-stage.size.width/2)/2, 20, stage.size.width/2, stage.size.height/2);
			cacheCanvas();
		};
	};

	$(stageSelector).on('change', loadStage);
	$(modeSelector).on('change', loadStage);

	const BorderSize = 3;
	var startX, startY, endX, endY;
	var isDrawing = false;
	var cache = [];
	var cacheLevel = -1;
	var socket = io();

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
	var onMouseDown = function(e) {
		startX = e.pageX - $(canvas).offset().left - BorderSize;
		startY = e.pageY - $(canvas).offset().top - BorderSize;
		isDrawing = true;
	};
	var onMouseMove = function(e) {
		if (!isDrawing) return;
		endX = e.pageX - $(canvas).offset().left - BorderSize;
		endY = e.pageY - $(canvas).offset().top - BorderSize;
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

	/*** Drawing Line ***/

	$('#line-style').on('submit', function(e) { return false; });

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

	var lineWidthSelector = $('#line-width');

	var setLineWidth = function() {
		context.lineWidth = lineWidthSelector.val();
	};
	var isWidthPopupOpen = false;

	lineWidthSelector.on('change', setLineWidth);

	var lineWidthButton = $('#width-button');

	var setLineWidth = function() {
		context.lineWidth = lineWidthButton.val();
	};

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

	/*** Canvas Cache, Undo, Redo ***/

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
