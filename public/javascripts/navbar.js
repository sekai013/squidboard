(function() {
	window.onload = function() {
		var onClickTweet = function(e) {
			e.preventDefault();
			window.open(encodeURI(decodeURI(this.href)),
									'tweetwindow',
									'width=550, height=450, personalbar=0, toolbar=0, scrollbars=1, resizable=1'
								 );
		};
		document.getElementById('tweet').addEventListener('click', onClickTweet);
	};
})();
