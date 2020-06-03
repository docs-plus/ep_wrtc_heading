"use strict";

window.WRTC_Room = (function () {
	var loc = document.location;
	var port = loc.port === "" ? loc.protocol === "https:" ? 443 : 80 : loc.port;
	var url = loc.protocol + "//" + loc.hostname + ":" + port + "/" + "heading_chat_room";
	var socket = io.connect(url);

	var WRTC_Room = {
		initSocketJoin: function initSocketJoin(param) {
			socket.emit("joinPadRooms", clientVars.padId, function () {});
		},
		init: function init() {
			var _self = this;
			this._pad = pad || window.pad;
			socket.on("userJoin", function (data) {
				_self.addUserToRoom(data);
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
			var _self = this;
			socket.emit("leaveSession", data, function (user) {
				_self.removeUserFromRoom(user);
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
				$headingRoom.find(".wbrtc_roomBoxFooter button").html("<b></b>(</span class='userCoutn'>" + userCount + "</span>)").attr({
					"data-userId": data.userId,
					"data-action": "JOIN",
					"class": "active"
				}).find("b").text("JOIN");
			}
		},
		addUserToRoom: function addUserToRoom(data) {
			if (!data) return false;

			var $headingRoom = this.$body_ace_outer().find("#" + data.headingId);

			var user = this.getUserFromId(data.userId);
			// some user may session does exist but the userinfo does not avilable in all over current pad
			if (!user) return true;

			// if user exist in the room do not add it any more
			var IsUserInRooms = $headingRoom.find(".wbrtc_roomBoxBody ul li[data-id='" + user.userId + "']").text();
			if (IsUserInRooms) return false;

			$headingRoom.find(".wbrtc_roomBoxBody ul").append("<li data-id=" + user.userId + " style='border-color: " + user.colorId + "'>" + user.name + "</li>");

			var $headingRoomUsers = $headingRoom.find(".wbrtc_roomBoxBody ul li");

			var userCount = $headingRoomUsers.length;

			$headingRoom.find(".userCoutn").text(userCount);

			if (data.userId === clientVars.userId) {
				window.headingId = data.headingId;
				WRTC.activate(data.headingId, user.userId);

				var $button = $headingRoom.find(".wbrtc_roomBoxFooter button");
				$button.attr({
					"data-userId": user.userId,
					"data-action": "LEAVE",
					"class": ""
				}).html("<b>LEAVE</b>");
			}
		},
		$body_ace_outer: function $body_ace_outer() {
			return $('iframe[name="ace_outer"]').contents();
		},
		findTags: function findTags() {
			var _self = this;
			var hTagList = []; // The main object we will use
			var hElements = ["h1", "h2", "h3", "h4", "h5", "h6", ".h1", ".h2", ".h3", ".h4", ".h5", ".h6"];
			hElements = hElements.join(",");
			var hTags = _self.$body_ace_outer().find("iframe").contents().find("#innerdocbody").children("div").children(hElements);
			var aceOuterPadding = parseInt(_self.$body_ace_outer().find('iframe[name="ace_inner"]').css("padding-top"));

			$(hTags).each(function () {
				var lineNumber = $(this).parent().prevAll().length;
				var tag = this.nodeName.toLowerCase();
				var newY = $(this).context.offsetTop + aceOuterPadding;
				var linkText = $(this).text();
				var headingTagId = $(this).find("span").attr("class");
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);
				if (!headingTagId) return true;
				hTagList.push({
					headingTagId: "wbrtc_roomBox_" + headingTagId[1],
					tag: tag,
					y: newY,
					text: linkText,
					lineNumber: lineNumber
				});
			});

			clientVars.plugins.plugins.ep_wrtc_heading_room = hTagList;
			var target = _self.$body_ace_outer().find("#outerdocbody");
			$.each(hTagList, function (index, el) {
				var data = {
					lineNumber: el.lineNumber,
					positionTop: el.y,
					headTitle: el.text,
					headingTagId: el.headingTagId
				};
				// if the new heading does not exists
				if (target.find("#" + el.headingTagId).length <= 0) {
					var box = $("#wertc_roomBox").tmpl(data);
					target.find("#comments").append(box);
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
			var padOuter = $('iframe[name="ace_outer"]').contents();
			var padInner = padOuter.find('iframe[name="ace_inner"]');

			var _self = this;
			console.log("activeEventListenr");

			padInner.contents().on("updateCommentLinePosition", function (e) {
				console.log("comment position change");
			});

			_self.$body_ace_outer().on("mouseover", ".wbrtc_roomBox", function () {
				$(this).addClass("active").find(".wbrtc_roomBoxFooter, .wbrtc_roomBoxBody, .wbrtc_roomBoxHeader b").show();
			});

			_self.$body_ace_outer().on("mouseleave", ".wbrtc_roomBox", function () {
				$(this).removeClass("active").find(".wbrtc_roomBoxFooter, .wbrtc_roomBoxBody, .wbrtc_roomBoxHeader b").hide();
			});

			_self.$body_ace_outer().on("click", ".wbrtc_roomBoxFooter > button", function () {
				var parent = $(this).parent().parent();
				var headingId = parent.attr("id");
				var actions = $(this).attr("data-action");
				var data = {
					padId: clientVars.padId,
					userId: clientVars.userId,
					userName: clientVars.userName || "anonymous",
					headingId: headingId
				};

				if (actions === "JOIN") {
					socket.emit("userJoin", data, function (_data) {
						_self.addUserToRoom(_data);
					});
				} else {
					socket.emit("userLeave", data, function (_data) {
						_self.removeUserFromRoom(_data);
					});
				}
			});
		}
	};

	return WRTC_Room;
})();