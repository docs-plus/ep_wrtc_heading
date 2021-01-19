'use strict';
const padutils = require('ep_etherpad-lite/static/js/pad_utils').padutils;

const textChat = (() => {
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

    const message = $('<p>').attr({
      'data-authorid': msg.author,
    }).append(userName).append(tim).append(text);

    $('#wrtc_textChat').append(message);
    Helper.scrollDownToLastChatText('#wrtc_textChat');
  }

  function eventTextChatInput() {
    const keycode = event.keyCode || event.which;
    // when press Enter key
    if (keycode === 13) {
      const textMessage = $(this).val();
      if (!textMessage) return true;
      $(this).val('');
      const user = Helper.getUserFromId(clientVars.userId);
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

    } else {
      // TODO: change this to template
      // existTextChat.attr({'data-id': headerId}).find('.textChatToolbar b, .btn_leave').attr({'data-id': headerId});
      // existTextChat.find('.nd_title b').text(headTitle);
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

    Helper.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');
  }

  function addUserToRoom(data, roomInfo) {
    if (!data || !data.userId) return true;
    const headerId = data.headerId;
    const $headingRoom = Helper.$body_ace_outer().find(`#${headerId}`);
    const headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
    const userCount = roomInfo.present;
    $headingRoom.find('.textChatCount').text(userCount);

    const user = Helper.getUserFromId(data.userId);
    // some user may session does exist but the user info does not available in all over the current pad
    if (!user) return true;

    // TODO: this is not good idea, use global state
    // if incoming user has already in the room don't persuade the request
    const IsUserInRooms = $headingRoom.find(`.wrtc_content.textChat ul li[data-id='${user.userId}']`).text();
    if (IsUserInRooms) return false;

    Helper.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.textChat ul'));
    Helper.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');

    if (data.userId === clientVars.userId) {
      currentRoom = data;
      $headingRoom.attr({'data-text': true});
      activateModal(headerId, headTitle, userCount, roomInfo);
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
      Helper.wrtcPubsub.emit('componentsFlow', 'text', 'open', true);
    }

    Helper.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'TEXT', roomInfo, () => {});
  }

  function removeUserFromRoom(data, roomInfo, target, cb) {
    if (!data || !data.userId) return true;
    const headerId = data.headerId;
    const $headingRoom = Helper.$body_ace_outer().find(`#${headerId}`);
    const headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

    const userCount = roomInfo.present;
    $headingRoom.find('.textChatCount').text(userCount);

    const $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul');

    Helper.appendUserList(roomInfo, $textChatUserList);
    Helper.appendUserList(roomInfo, '#wrtc_textChatWrapper #textChatUserModal ul');

    if (userCount === 0) {
      $textChatUserList.append(`<li class="empty">Be the first to join the <button class="btn_joinChat_text" data-action="JOIN" data-id="${headerId}" data-join="TEXT"><b>text-chat</b></button></li>`);
    }

    if (data.userId === clientVars.userId) {
      $headingRoom.removeAttr('data-text');
      currentRoom = {};
      deactivateModal(data.headerId, roomInfo);
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      Helper.wrtcPubsub.emit('componentsFlow', 'text', 'open', false);
    }

    Helper.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'TEXT', roomInfo, () => {});

    if (cb && typeof cb === 'function') cb();
  }

  function userJoin(headerId, userData, $joinButton) {
    if (!userData || !userData.userId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    // check if user already in that room
    if (currentRoom && currentRoom.headerId === headerId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    $joinBtn = $joinButton;

    Helper.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

    const padparticipators = window.pad.collabClient.getConnectedUsers().map((x) => x.userId);

    if (!currentRoom.userId) {
      socket.emit('userJoin', padId, padparticipators, userData, 'text', addUserToRoom);
    } else {
      socket.emit('userLeave', padId, currentRoom, 'text', (data, roomInfo, target) => {
        removeUserFromRoom(data, roomInfo, 'text', () => {
          socket.emit('userJoin', padId, padparticipators, userData, 'text', addUserToRoom);
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
    Helper.wrtcPubsub.emit('componentsFlow', 'text', 'init', true);
    eventListers();
  }

  function appendTextChatModalToBody() {
    const textChatModal = $('#wrtcTextChatModal').tmpl({});
    $('body').append(textChatModal);
  }

  return {
    postAceInit,
    activateModal,
    deactivateModal,
    userJoin,
    userLeave,
    removeUserFromRoom,
    addUserToRoom,
    appendTextChatModalToBody,

  };
})();
