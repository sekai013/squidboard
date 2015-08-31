$(function() {
	var socket = io();

	// constants

	const NameMaxLen = 20;
	const MessageMaxLen = 150;

	// functions

	var isValidString = function(str, maxLen) {
		return (typeof str === 'string')
					 && (0 < str.length) && (str.length <= maxLen);
	};

	var nameToParagraph = function(name) {
		var tpl = '<p id="name-show-navbar" class="navbar-text"><%- name %></p>';
		var compiledTpl = _.template(tpl);
		return compiledTpl({ name: name });
	};

	var appendNameToNavbar = function(name) {
		var elem = nameToParagraph(name);
		$('#name-container').append(elem);
	};

	var postToHtml = function(post) {
		const tpl = '<tr><td><%- name %></td><td><%- message %></td></tr>';
		var compiledTpl = _.template(tpl);
		return compiledTpl(post);
	};

	// event handlers

	var onSubmitName = function(e) {
		e.preventDefault();
		var name = $('#name').val();
		if (!isValidString(name, NameMaxLen)) {
			// error
			return;
		}

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
			// error
			return;
		}

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
				if (isValidString(newName, NameMaxLen)) {
					localStorage.setItem('name', newName);
					name = newName;
				} else {
					name = localStorage.getItem('name') || '';
					// error
				}
				$('#name-form-container').hide();
				appendNameToNavbar(name);
			}
			isNameShown = !isNameShown;
		};
	})();

	var onNewPost = function(post) {
		var elem = postToHtml(post);
		$(elem).prependTo($('#messages'));
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
