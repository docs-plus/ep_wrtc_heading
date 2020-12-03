'use strict';

var videoChat = (function videoChat() {
  let socket = null;
  let padId = null;
  let currentRoom = {};
  let localStream = null;
  let VIDEOCHATLIMIT = 0;
  let $joinBtn = null;
  let networkInterval = null;
  const pingos = {
    startTime: 0,
    latency: 0,
    LMin: 0,
    LMax: 0,
    avg: 0,
    LineAvg: [],
    colors: {
      normal: '#fff',
      warning: '#ffcc00',
      danger: '#cc3300',
    },
    interavCheck: 1000,
  };

  const startWatchNetwork = function startWatchNetwork() {
    networkInterval = setInterval(() => {
      pingos.startTime = Date.now();
      socket.emit('pingil', padId, window.headerId, share.getUserId(), pingos.avg);
    }, pingos.interavCheck);
  };

  const stopWatchNetwork = function stopWatchNetwork() {
    clearInterval(networkInterval);
  };

  function mediaDevices() {
    navigator.mediaDevices.enumerateDevices().then((data) => {
      let videoSettings = localStorage.getItem('videoSettings') || {microphone: null, speaker: null, camera: null};

      if (typeof videoSettings === 'string') {
        videoSettings = JSON.parse(videoSettings);
      }

      const audioInputSelect = document.querySelector('select#audioSource');
      const audioOutputSelect = document.querySelector('select#audioOutput');
      const videoSelect = document.querySelector('select#videoSource');

      for (let i = 0; i !== data.length; ++i) {
        const deviceInfo = data[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
          option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
          if (videoSettings.microphone === deviceInfo.deviceId) option.selected = true;
          audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
          option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
          if (videoSettings.speaker === deviceInfo.deviceId) option.selected = true;
          audioOutputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
          if (videoSettings.camera === deviceInfo.deviceId) option.selected = true;
          videoSelect.appendChild(option);
        }
      }
    });
  }

  function isUserMediaAvailable() {
    return window.navigator.mediaDevices.getUserMedia({audio: true, video: true});
  }

  function removeUserFromRoom(data, roomInfo, cb) {
    if (!data || !roomInfo || !data.userId) return false;
    const headerId = data.headerId;
    const $headingRoom = share.$body_ace_outer().find(`#${headerId}`);
    const headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
    const $videoChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

    share.appendUserList(roomInfo, $videoChatUserList);

    const userCount = roomInfo.present;
    $headingRoom.find('.videoChatCount').text(userCount);

    if (userCount === 0) {
      $videoChatUserList.append(`<li class="empty">Be the first to join the <button class="btn_joinChat_video" data-action="JOIN" data-id="${headerId}" data-join="VIDEO"><b>video-chat</b></button></li>`);
    }

    const user = share.getUserFromId(data.userId);

    if (user && data.action !== 'JOIN' && data.action !== 'RELOAD') {
      // notify, a user join the video-chat room
      const msg = {
        time: new Date(),
        userId: data.userId || user.userId,
        userName: data.name || user.name || 'anonymous',
        headerId: data.headerId,
        userCount,
        headerTitle,
        VIDEOCHATLIMIT,
      };
      share.notifyNewUserJoined('VIDEO', msg, 'LEAVE');
    }

    if (data.userId === clientVars.userId) {
      $headingRoom.removeAttr('data-video');
      share.roomBoxIconActive();
      WRTC.deactivate(data.userId, data.headerId);
      stopWatchNetwork();
      window.headerId = null;

      currentRoom = {};

      $('#wrtc_modal').css({
        transform: 'translate(-50%, -100%)',
        opacity: 0,
      }).attr({'data-active': false});

      // WRTC.deactivate(data.userId, data.headerId);
      share.stopStreaming(localStream);
      localStream = null;
      socket.removeListener(`receiveTextMessage:${data.headerId}`);
    }

    if (cb && typeof cb === 'function') cb();

    share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo, () => {});

    share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);

    WRTC.userLeave(data.userId);
  }

  function addUserToRoom(data, roomInfo) {
    if (!data || !data.userId) return false;
    const headerId = data.headerId;
    const $headingRoom = share.$body_ace_outer().find(`#${headerId}`);
    const headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

    const user = share.getUserFromId(data.userId);
    // some user may session does exist but the user info does not available in all over the current pad
    if (!user) return true;

    // TODO: this is not good idea, use global state
    // if incoming user has already in the room don't persuade the request
    const IsUserInRooms = $headingRoom.find(`.wrtc_content.videoChat ul li[data-id='${user.userId}']`).text();
    if (IsUserInRooms) return false;

    const userCount = roomInfo.present;
    $headingRoom.find('.videoChatCount').text(userCount);

    $(document).find('#wrtc_textChatWrapper .textChatToolbar .userCount').text(userCount);

    share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.videoChat ul'));

    if (data.action == 'JOIN') {
      // notify, a user join the video-chat room
      const msg = {
        time: new Date(),
        userId: data.userId,
        userName: user.name || data.name || 'anonymous',
        headerId: data.headerId,
        userCount,
        headerTitle,
        VIDEOCHATLIMIT,
      };

      share.notifyNewUserJoined('VIDEO', msg, 'JOIN');

      // if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
      // 	$.gritter.add({
      // 		text: '<span class="author-name">' + user.name + '</span>' + 'has joined the video-chat, <b><i> "' + headerTitle + '"</b></i>',
      // 		sticky: false,
      // 		time: 3000,
      // 		position: 'center',
      // 		class_name: 'chat-gritter-msg'
      // 	});
      // }
    }

    if (data.userId === clientVars.userId) {
      $headingRoom.attr({'data-video': true});
      share.roomBoxIconActive();
      startWatchNetwork();

      $('#werc_toolbar p').attr({'data-id': data.headerId}).text(headerTitle);
      $('#werc_toolbar .btn_roomHandler').attr({'data-id': data.headerId});

      window.headerId = data.headerId;
      WRTC.activate(data.headerId, user.userId);
      currentRoom = data;

      $('#rtcbox').prepend(`<h4 class="chatTitle">${headerTitle}</h4>`);

      $('#wrtc_modal').css({
        transform: 'translate(-50%, 0)',
        opacity: 1,
      }).attr({'data-active': true});

      share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
      socket.emit('acceptNewCall', padId, window.headerId);

      socket.on(`receiveTextMessage:${headerId}`, (headingId, msg) => {
        const active = $(document).find('#wrtc_textChatWrapper').hasClass('active');
        if (headingId === headerId && !active) {
          textChat.userJoin(headerId, data, 'TEXT');
        }
      });
    }

    share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'VIDEO', roomInfo, () => {});
  }

  function createSession(headerId, userInfo, $joinButton) {
    share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');
    $joinBtn = $joinButton;
    isUserMediaAvailable().then((stream) => {
      localStream = stream;

      if (!currentRoom.userId) {
        return socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
      }
      // If the user has already joined the video chat, make suer leave that room then join to the new chat room
      socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
        gateway_userLeave(_userData, roomInfo, () => {
          socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
        });
      });
    }).catch((err) => {
      console.error(err);
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
        gateway_userLeave(_userData, roomInfo);
      });
			WRTC.showUserMediaError(err, share.getUserId(), headerId);
    });
  }

  function userJoin(headerId, userInfo, $joinButton) {
    if (!userInfo || !userInfo.userId) {
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    // check if has user already in that room
    if (currentRoom && currentRoom.headerId === headerId) {
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    createSession(headerId, userInfo, $joinButton);
  }

  function reloadSession(headerId, userInfo, $joinButton) {
    if (!userInfo || !userInfo.userId) {
      share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    createSession(headerId, userInfo, $joinButton, 'RELOAD');
  }

  function userLeave(headerId, data, $joinButton) {
    $joinBtn = $joinButton;
    socket.emit('userLeave', padId, data, 'video', gateway_userLeave);
  }

  function reachedVideoRoomSize(roomInfo, showAlert, isBulkUpdate) {
    if (roomInfo && roomInfo.present <= VIDEOCHATLIMIT) return true;

    showAlert = showAlert || true;
    if (showAlert && !isBulkUpdate) {
      $.gritter.add({
        title: 'Video chat Limitation',
        text: `The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is ${VIDEOCHATLIMIT}.`,
        sticky: false,
        class_name: 'error',
        time: '5000',
      });
    }

    return false;
  }

  function socketBulkUpdateRooms(rooms, info, target) {
    const roomsInfo = {};
    // create a roomInfo for each individual room
    Object.keys(rooms).forEach((headerId) => {
      const roomInfo = {
        present: rooms[headerId].length,
        list: rooms[headerId],
      };
      roomsInfo[headerId] = roomInfo;
    });

    // bind roomInfo and send user to gateway_userJoin
    Object.keys(rooms).forEach((headerId) => {
      rooms[headerId].forEach((user) => {
        gateway_userJoin(user, roomsInfo[headerId], true);
      });
    });
  }

  function bulkUpdateRooms(hTagList) {
    socket.emit('bulkUpdateRooms', padId, hTagList, 'video', socketBulkUpdateRooms);
  }

  /**
  *
  * @param {Object} data @requires
  * @param {String} data.padId @requires
  * @param {String} data.userId @requires
  * @param {String} data.userName @requires
  * @param {String} data.headerId
  *
  * @param {Object} roomInfo
  * @param {Boolean} showAlert
  * @param {Boolean} bulkUpdate
 *
 *	@returns
  */
  function gateway_userJoin(data, roomInfo, showAlert, bulkUpdate) {
    if (!data) return reachedVideoRoomSize(null, true, false);

    if (data && reachedVideoRoomSize(roomInfo, showAlert, bulkUpdate)) {
      return addUserToRoom(data, roomInfo);
    } else if (bulkUpdate) {
      return addUserToRoom(data, roomInfo);
    }
    share.stopStreaming(localStream);
    localStream = null;
    return false;
  }

  function gateway_userLeave(data, roomInfo, cb) {
    removeUserFromRoom(data, roomInfo, cb);
  }

  function postAceInit(hook, context, webSocket, docId) {
    socket = webSocket;
    padId = docId;
    VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
    share.wrtcPubsub.emit('component status', 'video', true);
    // mediaDevices();

    socket.on('userLatancy', (data) => {
      if (share.getUserId() !== data.userId) {
        const videoId = `interface_video_${data.userId.replace(/\./g, '_')}`;

        let color = pingos.colors.normal;
        if (data.latency > 200 && data.latency < 300) color = pingos.colors.warning;
        if (data.latency > 300) color = pingos.colors.danger;

        $(document)
            .find(`#${videoId} .latency`)
            .css({color})
            .text(`${Math.ceil(data.latency)}ms`);
      }
    });
    socket.on('pongol', (data) => {
      pingos.latency = Date.now() - pingos.startTime;

      if (pingos.LMin <= pingos.latency && pingos.latency >= pingos.LMax) pingos.LMax = pingos.latency; else pingos.LMin = pingos.latency;

      // console.log( 'Websocket RTT: ' + pingos.latency + ' ms', "min:", pingos.LMin, "max", pingos.LMax, "avg:", pingos.avg );

      if (pingos.LineAvg.length < 4) { pingos.LineAvg.push((pingos.LMax + pingos.LMin) / 2); } else {
        pingos.avg = pingos.LineAvg.reduce((a, b) => a + b) / pingos.LineAvg.length;
        // console.log(pingos.LineAvg)
        pingos.LineAvg = [];
        pingos.LMax = 0;
      }

      let color = pingos.colors.normal;
      if (pingos.avg > 200 && pingos.avg < 300) color = pingos.colors.warning;
      if (pingos.avg > 300) color = pingos.colors.danger;

      $(document)
          .find('.video-container.local-user .latency')
          .css({color})
          .text(`${Math.ceil(pingos.avg)}ms`);
      $(document).find('#networkStatus').html(`RTT: ${pingos.latency}ms, min: ${pingos.LMin}ms, max: ${pingos.LMax}ms, avg:${pingos.avg}ms`);

      // share.wrtcPubsub.emit('update network information', pingos);
    });
  }

  return {
    postAceInit,
    userJoin,
    userLeave,
    gateway_userJoin,
    gateway_userLeave,
    bulkUpdateRooms,
		reloadSession,
		mediaDevices,
  };
})();
