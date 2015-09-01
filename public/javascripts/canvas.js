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

	var lineColorSelector = $('#line-color');
	var lineWidthSelector = $('#line-width');

	var setLineColor = function() {
		context.strokeStyle = lineColorSelector.val();
	};
	var setLineWidth = function() {
		context.lineWidth = lineWidthSelector.val();
	};

	lineColorSelector.on('change', setLineColor);
	lineWidthSelector.on('change', setLineWidth);

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
		onCacheUpdated(c);
		if (cacheLevel < 0) loadStage();
	};
	var onCacheUpdated = function(c) {
		cache = c.cache;
		cacheLevel = c.cacheLevel;
		loadCache();
	};

	$('#undo').on('click', onClickUndo);
	$('#redo').on('click', onClickRedo);
	$('#clear').on('click', onClickClear);

	socket.on('cacheInitialize', onCacheInitialized);
	socket.on('cacheUpdate', onCacheUpdated);

	setLineColor();
	setLineWidth();
});
