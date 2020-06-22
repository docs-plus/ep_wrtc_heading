"use strict";

var WRTC_Room = (function () {
	var loc = document.location;
	var port = loc.port === "" ? loc.protocol === "https:" ? 443 : 80 : loc.port;
	var url = loc.protocol + "//" + loc.hostname + ":" + port + "/" + "heading_chat_room";
	var socket = io.connect(url);
	var currentUserRoom = {};
	var VIDEOCHATLIMIT = 0;
	var $lastJoinButton = null;
	var prefixId = "wbrtc_roomBox_";

	var self = {
		aceSetAuthorStyle: function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = self.getUserFromId(context.author);
				if (user) {
					self.$body_ace_outer().find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']").css({ "border-color": user.colorId }).text(user.name);
				}
			}
		},
		isUserMediaAvailable: function isUserMediaAvailable() {
			return window.navigator.mediaDevices.getUserMedia({ audio: true, video: true })["catch"](function (err) {
				WRTC.showUserMediaError(err);
				console.error(err);
			});
		},
		initSocketJoin: function initSocketJoin() {
			socket.emit("joinPadRooms", clientVars.padId, function () {});
		},
		init: function init() {
			var _self = this;
			this._pad = window.pad;
			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;

			socket.on("userJoin", function (data) {
				self.socketUserJoin(data, false);
			});

			socket.on("userLeave", function (data) {
				_self.removeUserFromRoom(data);
			});

			socket.on("bulkUpdateRooms", function (users) {
				users.forEach(function (user) {
					_self.addUserToRoom(user);
				});
			});

			_self.activeEventListenr();
			setTimeout(function () {
				self.joinByQueryString();
			}, 400);
		},
		joinByQueryString: function joinByQueryString() {
			var urlParams = new URLSearchParams(window.location.search);
			var headingId = urlParams.get('heading');
			var joinvideo = urlParams.get('joinvideo');
			if (headingId && joinvideo === "true") {
				var data = {
					padId: clientVars.padId,
					userId: clientVars.userId,
					userName: clientVars.userName || "anonymous",
					headingId: prefixId + headingId
				};

				self.isUserMediaAvailable().then(function () {

					if (!currentUserRoom.userId) return socket.emit("userJoin", data, self.socketUserJoin);
					// if user join the video-chat before, first leave that chatroom
					// then join to the new chatroom
					socket.emit("userLeave", currentUserRoom, function (_data) {
						self.socketUserLeave(_data);
						socket.emit("userJoin", data, self.socketUserJoin);
					});
				});
			}
		},
		getUserFromId: function getUserFromId(userId) {
			if (!this._pad || !this._pad.collabClient) return null;
			var result = this._pad.collabClient.getConnectedUsers().filter(function (user) {
				return user.userId === userId;
			});
			var user = result.length > 0 ? result[0] : null;
			return user;
		},
		leaveSession: function leaveSession(data) {
			socket.emit("leaveSession", data, function (user) {
				self.removeUserFromRoom(user);
			});
		},
		removeUserFromRoom: function removeUserFromRoom(data) {
			if (!data) return false;

			var $headingRoom = this.$body_ace_outer().contents();
			var $user = $headingRoom.find(".wbrtc_roomBoxBody ul li[data-id='" + data.userId + "']");
			$headingRoom = $user.closest("div").parent(".wbrtc_roomBox");
			$user.remove();

			var users = $headingRoom.find(".wbrtc_roomBoxBody ul li");
			var userCount = users.length;

			$headingRoom.find(".userCoutn").text(userCount);

			if (data.userId === clientVars.userId) {
				WRTC.deactivate(data.userId, data.headingId);
				window.headingId = null;
				currentUserRoom = {};
				$headingRoom.find(".wbrtc_roomBoxFooter button.btn_door").html("<b></b>").attr({
					"data-userId": data.userId,
					"data-action": "JOIN",
					"disabled": false
				}).addClass('active').removeClass('deactivate').find("b").text("JOIN");
				$("#rtcbox .chatTitle").remove();
			}
		},
		addUserToRoom: function addUserToRoom(data) {
			if (!data) return false;

			var $headingRoom = this.$body_ace_outer().find("#" + data.headingId);

			var user = this.getUserFromId(data.userId);
			// some user may session does exist but the userinfo does not avilable in all over current pad
			if (!user) return true;

			var headerText = $headingRoom.find(".wbrtc_roomBoxHeader b").text();

			// if user exist in the room do not add it any more
			var IsUserInRooms = $headingRoom.find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']").text();
			if (IsUserInRooms) return false;

			$headingRoom.find(".wbrtc_roomBoxBody ul").append("<li data-id=" + user.userId + " style='border-color: " + user.colorId + "'>" + user.name + "</li>");

			var $headingRoomUsers = $headingRoom.find(".wbrtc_roomBoxBody ul li");

			var userCount = $headingRoomUsers.length;

			$headingRoom.find(".userCoutn").text(userCount);

			var msg = {
				time: new Date(),
				userId: user.userId,
				text: "has joined the video-chat <b>" + headerText + "</b> <a class='txt_shareLink' href='" + self.createSahreLink(data.headingId) + "'>Join</a>",
				userName: user.name
			};
			// notify a user join the video-chat room
			self.addTextChatMessage(msg);

			if (data.headingId === currentUserRoom.headingId && data.userId !== clientVars.userId) {
				$.gritter.add({
					text: '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerText + '"</b></i>',
					sticky: false,
					time: 3000,
					position: 'bottom',
					class_name: 'chat-gritter-msg'
				});
			}

			if (data.userId === clientVars.userId) {
				window.headingId = data.headingId;
				WRTC.activate(data.headingId, user.userId);
				currentUserRoom = data;
				var $button = $headingRoom.find(".wbrtc_roomBoxFooter button.btn_door");
				$button.attr({
					"data-userId": user.userId,
					"data-action": "LEAVE",
					"disabled": false
				}).removeClass("deactivate active").html("<b>LEAVE</b>");
				$("#rtcbox").prepend('<h4 class="chatTitle">' + headerText + '</h4>');
			}
		},
		scrollDown: function scrollDown(force) {
			if ($('#chatbox').hasClass('visible')) {
				if (force || !self.lastMessage || !self.lastMessage.position() || self.lastMessage.position().top < $('#chattext').outerHeight() + 20) {
					$('#chattext').animate({ scrollTop: $('#chattext')[0].scrollHeight }, { duration: 400, queue: false });
					self.lastMessage = $('#chattext > p').eq(-1);
				}
			}
		},
		addTextChatMessage: function addTextChatMessage(msg) {
			var authorClass = "author-" + msg.userId.replace(/[^a-y0-9]/g, function (c) {
				if (c == ".") return "-";
				return 'z' + c.charCodeAt(0) + 'z';
			});

			//create the time string
			var minutes = "" + new Date(msg.time).getMinutes();
			var hours = "" + new Date(msg.time).getHours();
			if (minutes.length == 1) minutes = "0" + minutes;
			if (hours.length == 1) hours = "0" + hours;
			var timeStr = hours + ":" + minutes;

			var html = "<p data-authorId='" + msg.userId + "' class='" + authorClass + "'><b>" + msg.userName + ":</b><span class='time " + authorClass + "'>" + timeStr + "</span> " + msg.text + "</p>";

			$(document).find("#chatbox #chattext").append(html);
			self.scrollDown();
		},
		$body_ace_outer: function $body_ace_outer() {
			return $('iframe[name="ace_outer"]').contents();
		},
		createSahreLink: function createSahreLink(headingTagId) {
			var headingTagId = /(?:^| )wbrtc_roomBox_([A-Za-z0-9]*)/.exec(headingTagId);
			return window.location.origin + window.location.pathname + "?heading=" + headingTagId[1] + "&joinvideo=true";
		},
		findTags: function findTags() {
			var _self = this;
			var hTagList = []; // The main object we will use
			var hElements = ["h1", "h2", "h3", "h4", "h5", "h6", ".h1", ".h2", ".h3", ".h4", ".h5", ".h6"];
			hElements = hElements.join(",");
			var hTags = _self.$body_ace_outer().find("iframe").contents().find("#innerdocbody").children("div").children(hElements);
			var aceOuterPadding = parseInt(_self.$body_ace_outer().find('iframe[name="ace_inner"]').css("padding-top"));
			var aceInnerOffset = _self.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
			$(hTags).each(function () {
				var lineNumber = $(this).parent().prevAll().length;
				var tag = $(this).prop("tagName").toLowerCase();
				var offset = $(this).offset();
				var newY = Math.floor(offset.top + aceOuterPadding);
				var newX = Math.floor(aceInnerOffset.left);
				var linkText = $(this).text();
				var headingTagId = $(this).find("span").attr("class");
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);
				if (!headingTagId) return true;
				hTagList.push({
					headingTagId: "wbrtc_roomBox_" + headingTagId[1],
					tag: tag,
					y: newY,
					x: newX,
					text: linkText,
					lineNumber: lineNumber,
					url: window.location.origin + window.location.pathname + "?heading=" + headingTagId[1] + "&joinvideo=true"
				});
			});

			clientVars.plugins.plugins.ep_wrtc_heading_room = hTagList;
			var target = _self.$body_ace_outer().find("#outerdocbody");
			$.each(hTagList, function (index, el) {
				var data = {
					lineNumber: el.lineNumber,
					positionTop: el.y,
					positionLeft: el.x,
					headTitle: el.text,
					headingTagId: el.headingTagId,
					url: el.url,
					videoChatLimit: VIDEOCHATLIMIT
				};
				// if the new heading does not exists
				if (target.find("#" + el.headingTagId).length <= 0) {
					var box = $("#wertc_roomBox").tmpl(data);
					target.find("#wbrtc_chatBox").append(box);
				}
			});

			_self.bulkUpdateRooms(hTagList);
		},
		bulkUpdateRooms: function bulkUpdateRooms(hTagList) {
			var _self = this;
			socket.emit("bulkUpdateRooms", clientVars.padId, hTagList, function (users) {
				users.forEach(function (user) {
					_self.addUserToRoom(user);
				});
			});
		},
		activeEventListenr: function activeEventListenr() {

			self.$body_ace_outer().on("mouseover", ".wbrtc_roomBox", function () {
				var $this = $(this);
				self.$body_ace_outer().find("#wbrtc_chatBox").css({ overflow: "inherit" }).animate({}, 10, function () {
					$this.addClass("active").find(".wbrtc_roomBoxFooter, .wbrtc_roomBoxBody, .wbrtc_roomBoxHeader b").show('fast');
				});
			});

			self.$body_ace_outer().on("mouseleave", ".wbrtc_roomBox", function () {
				$(this).removeClass("active").find(".wbrtc_roomBoxFooter, .wbrtc_roomBoxBody, .wbrtc_roomBoxHeader b").css({ display: "none" }).animate({ display: "none" }, 10, function () {
					self.$body_ace_outer().find("#wbrtc_chatBox").css({ overflow: "hidden" });
				});
			});

			self.$body_ace_outer().on("click", ".wbrtc_roomBoxFooter > button.btn_door", function () {
				var parent = $(this).parent().parent();
				var headingId = parent.attr("id");
				var actions = $(this).attr("data-action");
				var data = {
					padId: clientVars.padId,
					userId: clientVars.userId,
					userName: clientVars.userName || "anonymous",
					headingId: headingId
				};

				$(this).addClass('deactivate').attr({ "disabled": true });
				$lastJoinButton = $(this);

				if (actions === "JOIN") {

					self.isUserMediaAvailable().then(function () {

						if (!currentUserRoom.userId) return socket.emit("userJoin", data, self.socketUserJoin);

						// if user join the video-chat before, first leave that chatroom
						// then join to the new chatroom
						socket.emit("userLeave", currentUserRoom, function (_data) {
							self.socketUserLeave(_data);
							socket.emit("userJoin", data, self.socketUserJoin);
						});
					});
				} else {
					socket.emit("userLeave", data, self.socketUserLeave);
				}
			});

			function copyToClipboard(text) {
				var $temp = $("<input>");
				$("body").append($temp);
				$temp.val(text).select();
				document.execCommand("copy");
				$temp.remove();
				$.gritter.add({
					title: "Copied",
					text: "Join link copied to clip board",
					sticky: false,
					class_name: "copyToClipboard",
					time: '3000'
				});
			}

			self.$body_ace_outer().on("click", ".wbrtc_roomBoxFooter > button.btn_share", function () {
				var url = $(this).find("input").val();
				copyToClipboard(url);
			});
		},
		reachedChatRoomSize: function reachedChatRoomSize(present, showAlert) {
			if (present < VIDEOCHATLIMIT) return true;
			showAlert = showAlert || true;
			if (showAlert) $.gritter.add({
				title: "Video chat Limitation",
				text: "The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is " + VIDEOCHATLIMIT + ".",
				sticky: false,
				class_name: "error",
				time: '5000'
			});
			$lastJoinButton.addClass("deactivate").attr({ "disabled": false });
			return false;
		},
		socketUserJoin: function socketUserJoin(data, showAlert) {
			if (self.reachedChatRoomSize(data.users.present, showAlert)) self.addUserToRoom(data);
		},
		socketUserLeave: function socketUserLeave(data) {
			self.removeUserFromRoom(data);
		}
	};

	return self;
})();