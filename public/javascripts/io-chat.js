$(function() {
	var socket = io();

	// constants

	const NameMaxLen = 20;
	const MessageMaxLen = 100;

	// functions

	var isValidString = function(str, maxLen) {
		return (typeof str === 'string')
					 && (0 < str.length) && (str.length <= maxLen);
	};

	var nameToParagraph = function(name) {
		const tpl = '<p id="name-show-navbar" class="navbar-text"><%- name %></p>';
		var compiledTpl = _.template(tpl);
		return compiledTpl({ name: name });
	};

	var appendNameToNavbar = function(name) {
		var elem = nameToParagraph(name);
		$('#name-container').append(elem);
	};

	var postToHtml = function(post) {
		const tpl = '<tr><td><%- name %></td><td><%- message %></td><td><%- time %></td></tr>';
		var compiledTpl = _.template(tpl);
		return compiledTpl(post);
	};

	var notify = function(about, position) {
		const Notifications = {
			name: '名前に利用できるのは1文字以上20文字以下です.',
			message: '1度に投稿できるのは1文字以上100文字以下です.'
		}
		var notification = Notifications[about] || '';
		position = position || 'left';
		if (notification) {
			$('#notification-container').html(notification)
																	.removeClass('text-left', 'text-right')
																	.addClass('text-' + position)
																	.show();
		} else {
			$('#notification-container').hide();
		}
	};

	// event handlers

	var onSubmitName = function(e) {
		e.preventDefault();
		var name = $('#name').val();
		if (!isValidString(name, NameMaxLen)) {
			notify('name');
			return;
		}

		notify('clear');
		localStorage.setItem('name', name);
		appendNameToNavbar(name);
		$('#name-form').hide();
		$('#message-form').show();
	}

	var onSubmitMessage = function(e) {
		e.preventDefault();
		var name = localStorage.getItem('name');
		if (!isValidString(name, NameMaxLen)) return;
		var message = $('#message').val();
		if (!isValidString(message, MessageMaxLen)) {
			notify('message');
			return;
		}

		notify('clear');
		socket.emit('post', {
			name: name,
			message: message
		});
		$('#message').val('');
	}

	var toggleNavbar = (function() {
		var isNameShown = true;
		return function(e) {
			e.preventDefault();
			var name;
			if (isNameShown) {
				name = localStorage.getItem('name') || '';
				$('#name-navbar').val(name);
				$('#name-show-navbar').remove();
				$('#name-form-container').show();
			} else {
				var newName = $('#name-navbar').val();
				if (!isValidString(newName, NameMaxLen)) {
					notify('name', 'right');
					return;
				}
				notify('clear');
				localStorage.setItem('name', newName);
				name = newName;
				$('#name-form').hide();
				$('#message-form').show();
				$('#name-form-container').hide();
				appendNameToNavbar(name);
			}
			isNameShown = !isNameShown;
		};
	})();

	var onNewPost = function(post) {
		var autoscroll = $('#autoscroll').prop('checked');
		var elem = postToHtml(post);
		$(elem).prependTo($('#messages'));
		if (autoscroll) {
			$('#messages').scrollTop(0);
		}
	};

	// processes

	$('#name-form').on('submit', onSubmitName);
	$('#message-form').on('submit', onSubmitMessage);
	$('#name-edit').on('click', toggleNavbar);
	$('#name-form-navbar').on('submit', toggleNavbar);

	socket.on('newPost', onNewPost);

	if (isValidString(localStorage.getItem('name'), NameMaxLen)) {
		$('#name-form').hide();
		appendNameToNavbar(localStorage.getItem('name'));
	} else {
		$('#message-form').hide();
	}
});
