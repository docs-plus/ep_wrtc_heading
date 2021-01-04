'use strict';
var padutils = require('ep_etherpad-lite/static/js/pad_utils').padutils;

var textChat = (function textChat() {
  let socket = null;
  let padId = null;
  let currentRoom = {};
  let $joinBtn = null;

  function createAndAppendMessage(msg) {
    if (!msg || !currentRoom.userId) return true;

    // correct the time
    // msg.time += window.clientTimeOffset;

    let minutes = `${new Date(msg.time).getMinutes()}`;
    let hours = `${new Date(msg.time).getHours()}`;
    if (minutes.length === 1) minutes = `0${minutes}`;
    if (hours.length === 1) hours = `0${hours}`;
    const timeStr = `${hours}:${minutes}`;

    const userName = $('<b>').text(`${msg.userName}: `);
    const tim = $('<span>').attr({class: 'time'}).text(timeStr);

    const text = padutils.escapeHtmlWithClickableLinks(msg.text, '_blank');

    // var urlParams = new URLSearchParams(msg.text.split("?")[1]);

    // if(urlParams.get('id')) {
    // 	var headerId = urlParams.get('id');
    // 	var target = urlParams.get('target');
    // 	var join = urlParams.get('join');
    // 	text = $(text).attr({
    // 		"data-join": join,
    // 		"data-action":"JOIN",
    // 		"data-id": headerId
    // 	}).addClass('btn_roomHandler')
    // }

    const message = $('<p>').attr({
      'data-authorid': msg.author,
    }).append(userName).append(tim).append(text);

    $('#wrtc_textChat').append(message);
    share.scrollDownToLastChatText('#wrtc_textChat');
  }

  // function privateNotifyNewUserJoined(target, msg, action) {
  // 	var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
  // 	var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';

  // 	var text = action === 'JOIN' ? 'joins' : 'leaves';

  // 	msg.text = '<span>' + text + '</span>' + textIcon + btnJoin;

  // 	msg.target = target;

  // 	createAndAppendMessage(msg);
  // }

  function eventTextChatInput() {
    const keycode = event.keyCode || event.which;
    // when press Enter key
    if (keycode === 13) {
      const textMessage = $(this).val();
      if (!textMessage) return true;
      $(this).val('');
      const user = share.getUserFromId(clientVars.userId);
      if (!user) return true;
      const msg = {text: textMessage, userName: user.name, author: user.userId, time: new Date().getTime()};
      socket.emit('sendTextMessage', padId, currentRoom.headerId, msg, (incomMsg) => {
        createAndAppendMessage(incomMsg);
      });
    }
  }

  function eventListers() {
    $(document).on('keypress', '#wrtc_textChatInputBox input', eventTextChatInput);

    $(document).on('click', '#wrtc_textChatWrapper .btn_toggle_modal', function click() {
      const action = $(this).attr('data-action');
      const chatBox = $('#wrtc_textChat').innerHeight() + $('#wrtc_textChatInputBox').innerHeight() + 1;

      $(this).find('.fa_arrow-from-top').toggle();
      $(this).find('.fa_arrow-to-top').toggle();

      if (action === 'collapse') {
        $(this).attr({'data-action': 'expand'});
        $('#wrtc_textChatWrapper').css({
          transform: `translate(-50%, ${chatBox}px)`,
        });
      } else {
        $(this).attr({'data-action': 'collapse'});
        $('#wrtc_textChatWrapper').css({
          transform: 'translate(-50%, 0)',
        });
      }
    });
  }

  function deactivateModal(headerId, roomInfo) {
    const $TextChatWrapper = $(document).find('#wrtc_textChatWrapper');

    $TextChatWrapper.removeClass('active').removeAttr('style');
    $TextChatWrapper.find('#wrtc_textChat p').remove();
    // socket.removeListener('receiveTextMessage:' + headerId);

    const $btn = $(document).find('#wrtc_textChatWrapper .btn_toggle_modal');
    $btn.attr({'data-action': 'collapse'});
    $btn.find('.fa_arrow-from-top').toggle();
    $btn.find('.fa_arrow-to-top').toggle();
  }

  function activateModal(headerId, headTitle, userCount, roomInfo) {
    if (!headerId) return false;
    const existTextChat = $(document).find('#wrtc_textChatWrapper');
    if (!existTextChat.length) {
      const textChatBox = $('#wrtc_textChatBox').tmpl({
        headerId,
        headTitle,
      });
      $('body').append(textChatBox);
    } else {
      // TODO: change this to template
      existTextChat.attr({'data-id': headerId}).find('.textChatToolbar b, .btn_leave').attr({'data-id': headerId});
      existTextChat.find('.nd_title b').text(headTitle);
    }

    // for animation pop up
    setTimeout(() => {
      $(document).find('#wrtc_textChatWrapper').addClass('active');
    }, 250);

    socket.on(`receiveTextMessage:${headerId}`, (headingId, msg) => {
      if (headingId === headerId) {
        createAndAppendMessage(msg);
      }
    });

    socket.emit('getTextMessages', padId, headerId, {}, (data) => {
      data.forEach((el) => {
        createAndAppendMessage(el);
      });
    });

    share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');
  }

  function addUserToRoom(data, roomInfo) {
    if (!data || !data.userId) return true;
    const headerId = data.headerId;
    const $headingRoom = share.$body_ace_outer().find(`#${headerId}`);
    const headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
    const userCount = roomInfo.present;
    $headingRoom.find('.textChatCount').text(userCount);

    const user = share.getUserFromId(data.userId);
    // some user may session does exist but the user info does not available in all over the current pad
    if (!user) return true;

    // TODO: this is not good idea, use global state
    // if incoming user has already in the room don't persuade the request
    const IsUserInRooms = $headingRoom.find(`.wrtc_content.textChat ul li[data-id='${user.userId}']`).text();
    if (IsUserInRooms) return false;

    share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.textChat ul'));
    share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');

    // notify, a user join the video-chat room
    // var msg = {
    // 	time: new Date(),
    // 	userId: data.userId || user.userId,
    // 	userName: user.name || data.name || 'anonymous',
    // 	headerId: data.headerId,
    // 	userCount: userCount,
    // 	headerTitle: headTitle
    // };
    // share.notifyNewUserJoined('TEXT', msg, 'JOIN');

    // if (data.headerId === currentRoom.headerId) {
    // 	var privateMsg = {
    // 		userName: user.name,
    // 		author: user.userId,
    // 		headerTitle: headTitle,
    // 		time: new Date().getTime()
    // 	};
    // 	privateNotifyNewUserJoined('TEXT', privateMsg, 'JOIN');
    // }

    // if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
    // 	$.gritter.add({
    // 		text: '<span class="author-name">' + user.name + '</span>' + 'has joined the text-chat, <b><i> "' + headTitle + '"</b></i>',
    // 		sticky: false,
    // 		time: 3000,
    // 		position: 'center',
    // 		class_name: 'chat-gritter-msg'
    // 	});
    // }

    if (data.userId === clientVars.userId) {
      currentRoom = data;
      $headingRoom.attr({'data-text': true});
      share.roomBoxIconActive();
      activateModal(headerId, headTitle, userCount, roomInfo);
      share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
    }

    share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'TEXT', roomInfo, () => {});
  }

  function removeUserFromRoom(data, roomInfo, target, cb) {
    if (!data || !data.userId) return true;
    const headerId = data.headerId;
    const $headingRoom = share.$body_ace_outer().find(`#${headerId}`);
    const headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

    const userCount = roomInfo.present;
    $headingRoom.find('.textChatCount').text(userCount);

    const $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul');

    share.appendUserList(roomInfo, $textChatUserList);
    share.appendUserList(roomInfo, '#wrtc_textChatWrapper #textChatUserModal ul');

    if (userCount === 0) {
      $textChatUserList.append(`<li class="empty">Be the first to join the <button class="btn_joinChat_text" data-action="JOIN" data-id="${headerId}" data-join="TEXT"><b>text-chat</b></button></li>`);
    }

    // var user = share.getUserFromId(data.userId);

    // notify, a user join the text-chat room
    // var msg = {
    // 	time: new Date(),
    // 	userId: user.userId || data.userId,
    // 	userName: user.name || data.name || 'anonymous',
    // 	headerId: data.headerId,
    // 	userCount: userCount,
    // 	headerTitle: headTitle
    // };
    // share.notifyNewUserJoined('TEXT', msg, 'LEAVE');

    // if (data.headerId === currentRoom.headerId) {
    // 	var privateMsg = {
    // 		userName: user.name,
    // 		author: user.userId,
    // 		headerTitle: headTitle,
    // 		time: new Date().getTime()
    // 	};
    // 	privateNotifyNewUserJoined('TEXT', privateMsg, 'LEAVE');
    // }

    if (data.userId === clientVars.userId) {
      $headingRoom.removeAttr('data-text');
      share.roomBoxIconActive();
      currentRoom = {};
      deactivateModal(data.headerId, roomInfo);
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
    }

    share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'TEXT', roomInfo, () => {});

    if (cb && typeof cb === 'function') cb();
  }

  function userJoin(headerId, userData, $joinButton) {
    if (!userData || !userData.userId) {
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    // check if user already in that room
    if (currentRoom && currentRoom.headerId === headerId) {
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    $joinBtn = $joinButton;

    share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

    if (!currentRoom.userId) {
      socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
    } else {
      socket.emit('userLeave', padId, currentRoom, 'text', (data, roomInfo, target) => {
        removeUserFromRoom(data, roomInfo, 'text', () => {
          socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
        });
      });
    }
  }

  function userLeave(headerId, userData, $joinButton) {
    $joinBtn = $joinButton;
    socket.emit('userLeave', padId, userData, 'text', removeUserFromRoom);
  }


  function postAceInit(hook, context, webSocket, docId) {
    socket = webSocket;
    padId = docId;
    share.wrtcPubsub.emit('component status', 'text', true);
    eventListers();
  }

  return {
    postAceInit,
    activateModal,
    deactivateModal,
    userJoin,
    userLeave,
    removeUserFromRoom,
    addUserToRoom,
  };
})();
