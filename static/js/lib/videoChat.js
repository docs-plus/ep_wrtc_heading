import * as Helper from './helpers';
import WRTC from './webrtc';

let socket = null;
let padId = null;
let currentRoom = {};
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


export default (() => {
  const reachedVideoRoomSize = (roomInfo, showAlert, isBulkUpdate) => {
    if (roomInfo && roomInfo.present <= VIDEOCHATLIMIT) return true;

    showAlert = showAlert || true;
    if (showAlert && !isBulkUpdate) {
      $.gritter.add({
        title: 'Video chat Limitation',
        text: `
          The video chat room has reached its limit. \r\n
          The size of this video chat room is ${VIDEOCHATLIMIT}.
          (If this seems wrong, please share the problem with the support team.)
        `,
        sticky: false,
        class_name: 'error',
        time: '5000',
      });
    }

    return false;
  };

  const startWatchNetwork = () => {
    networkInterval = setInterval(() => {
      pingos.startTime = Date.now();
      socket.emit('pingil', padId, window.headerId, Helper.getUserId(), pingos.avg);
    }, pingos.interavCheck);
  };

  const addUserToRoom = (data, roomInfo) => {
    if (!data || !data.userId) return false;
    const headerId = data.headerId;


    const user = Helper.getUserFromId(data.userId);
    // some user may session does exist but
    // the user info does not available in all over the current pad

    if (!user) return true;

    // TODO: this is not good idea, use global state
    // if incoming user has already in the room don't persuade the request
    // if (IsUserInRooms) return false;
    const userCount = roomInfo.present;

    $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text(userCount);
    if (userCount === 0) {
      $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text('');
    }

    $(`.header_videochat_icon[data-id='${headerId}'] .icon`).addClass('active');

    if (data.userId === clientVars.userId) {
      window.headerId = data.headerId;

      startWatchNetwork();

      const videoBtn = Helper.findAceHeaderElement(headerId).$inlineIcon();
      if (videoBtn) videoBtn.querySelector('.btn_roomHandler').classList.add('active');

      WRTC.activate(data.headerId, user.userId);

      $('#wrtc_modal').css({
        transform: 'translate(-50%, 0)',
        opacity: 1,
      }).attr({'data-active': true});

      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
      Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', true);

      // this request send once! and must be fire when the room is empty
      if (!currentRoom.userId && roomInfo.present === 1) {
        socket.emit('acceptNewCall', padId, window.headerId);
      }

      currentRoom = data;

      // update modal title, attributes and inline avatar
      Helper.wrtcPubsub.emit('updateWrtcToolbarModal', headerId, roomInfo);
    }

    Helper.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'VIDEO', roomInfo);
  };

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
  * @returns
  */
  const gatewayUserJoin = async (data, roomInfo, showAlert = true, bulkUpdate = false) => {
    console.info('[wrtc]: gateway user joining,', data, roomInfo, showAlert);
    // If user data does not exist return false
    if (!data) return reachedVideoRoomSize(null, false, false);

    // if user data exist then check room size
    if (data && reachedVideoRoomSize(roomInfo, showAlert, bulkUpdate)) {
      return addUserToRoom(data, roomInfo);
    } else if (bulkUpdate) {
      return addUserToRoom(data, roomInfo);
    }
    await Helper.stopStreaming();
    return false;
  };


  const stopWatchNetwork = () => clearInterval(networkInterval);

  const mediaDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((deviceInputs) => {
      const videoSettings = localStorage.getItem('videoSettings');
      const {microphone, speaker, camera} = JSON.parse(videoSettings);

      const audioInputSection = document.querySelector('.select.audioSource select');
      const audioOutputSection = document.querySelector('.select.audioOutputSec select');
      const videoSection = document.querySelector('.select.videoSource select');

      const audioInputElement = document.createElement('select');
      const audioOutputElement = document.createElement('select');
      const videoElement = document.createElement('select');

      for (const deviceInfo of deviceInputs) {
        const option = document.createElement('option');
        const {deviceId, label, kind} = deviceInfo;
        option.value = deviceId;
        if (kind === 'audioinput') {
          option.text = label || `microphone ${audioInputSection ? audioInputSection.length + 1 : '1'}`;
          if (microphone === deviceId) option.selected = true;
          audioInputElement.appendChild(option);
        } else if (kind === 'audiooutput') {
          option.text = label || `speaker ${audioOutputSection ? audioOutputSection.length + 1 : '1'}`;
          if (speaker === deviceId) option.selected = true;
          audioOutputElement.appendChild(option);
        } else if (kind === 'videoinput') {
          option.text = label || `camera ${videoSection ? videoSection.length + 1 : '1'}`;
          if (camera === deviceId) option.selected = true;
          videoElement.appendChild(option);
        }
      }

      $(audioInputSection).remove();
      $(audioOutputSection).remove();
      $(videoSection).remove();

      $('.select.audioSource').append(audioInputElement);
      $('.select.audioOutputSec').append(audioOutputElement);
      $('.select.videoSource').append(videoElement);
    });
  };

  const isUserMediaAvailable = () => {
    const audioInputSelect = document.querySelector('#wrtc_settings .select.audioSource');
    const audioOutputSelect = document.querySelector('#wrtc_settings .select.audioOutputSec');
    const videoSelect = document.querySelector('#wrtc_settings .select.videoSource');

    const audioSource = audioInputSelect ? audioInputSelect.value : undefined;
    const videoSource = videoSelect ? videoSelect.value : undefined;
    const audioOutput = audioOutputSelect ? audioOutputSelect.value : undefined;

    const mediaConstraints = {
      audio: true,
      video: {
        width: 320,
        height: 240,
        frameRate: {ideal: 15, max: 30},
        facingMode: 'user',
      },
    };

    if (audioSource) {
      mediaConstraints.audio.deviceId = {exact: audioSource};
    }
    if (videoSource) {
      mediaConstraints.video.deviceId = {exact: videoSource};
    }

    const newSettings = {
      microphone: audioSource,
      speaker: audioOutput,
      camera: videoSource,
    };

    localStorage.setItem('videoSettings', JSON.stringify(newSettings));

    return window.navigator.mediaDevices.getUserMedia(mediaConstraints);
  };

  const catchBrowserError = (userId, headerId) => {
    currentRoom = {};

    $('#wrtc_modal').css({
      transform: 'translate(-50%, -100%)',
      opacity: 0,
    }).attr({'data-active': false});

    Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', false);

    socket.removeListener(`receiveTextMessage:${headerId}`);
    WRTC.deactivate(userId, headerId);
    stopWatchNetwork();
    window.headerId = null;
    Helper.wrtcPubsub.emit('update store', {}, headerId, 'LEAVE', 'VIDEO', {});
    Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', 'VIDEO');
    WRTC.userLeave(userId);
    $('.header_videochat_icon .userCount').text('');
  };

  const removeUserFromRoom = async (data, roomInfo, cb) => {
    if (!data || !roomInfo || !data.userId) return false;
    const headerId = data.headerId;

    const userCount = roomInfo.present;
    $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text(userCount);

    if (userCount === 0) {
      $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text('');
    }

    if (data.userId === clientVars.userId) {
      Helper.$bodyAceOuter()
          .find(`#wrtcVideoIcons #${headerId}`)
          .removeClass('active');

      WRTC.deactivate(data.userId, data.headerId);
      stopWatchNetwork();
      window.headerId = null;

      const videoBtn = Helper.findAceHeaderElement(headerId).$inlineIcon();
      if (videoBtn) videoBtn.querySelector('.btn_roomHandler').classList.remove('active');

      currentRoom = {};

      $('#wrtc_modal').css({
        transform: 'translate(-50%, -100%)',
        opacity: 0,
      }).attr({'data-active': false});

      Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', false);

      // we don't need this remove later
      await Helper.stopStreaming();
      socket.removeListener(`receiveTextMessage:${data.headerId}`);
    }

    if (cb && typeof cb === 'function') cb();

    Helper.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo);

    Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);

    WRTC.userLeave(data.userId);
  };

  const gatewayUserLeave = (data, roomInfo, cb) => {
    removeUserFromRoom(data, roomInfo, cb);
  };


  const createSession = async (headerId, userInfo, $joinButton) => {
    Helper.$bodyAceOuter()
        .find('button.btn_joinChat_chatRoom')
        .removeClass('active');
    $joinBtn = $joinButton;

    const participators = window.pad.collabClient.getConnectedUsers().map((x) => x.userId);

    if (!currentRoom.userId) {
      return socket.emit('userJoin', padId, participators, userInfo, 'video', gatewayUserJoin);
    }
    // If the user has already joined the video chat,
    // make suer leave that room then join to the new chat room
    socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
      gatewayUserLeave(_userData, roomInfo, () => {
        socket.emit('userJoin', padId, participators, userInfo, 'video', gatewayUserJoin);
      });
    });
  };

  const userJoin = (headerId, userInfo, $joinButton) => {
    if (!userInfo || !userInfo.userId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    // check if has user already in the room
    if (currentRoom && currentRoom.headerId === headerId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    createSession(headerId, userInfo, $joinButton);
  };
  // deprecate
  const reloadCurrentSession = (headerId, userInfo, $joinButton) => {
    if (!userInfo || !userInfo.userId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }

    createSession(headerId, userInfo, $joinButton, 'RELOAD');
  };

  const reloadSession = (headerId, userInfo, $joinButton) => {
    if (!userInfo || !userInfo.userId) {
      Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
      return false;
    }
    socket.emit('reloadVideoSession', padId, headerId);
  };

  const userLeave = (headerId, data, $joinButton) => {
    $joinBtn = $joinButton;
    socket.emit('userLeave', padId, data, 'video', gatewayUserLeave);
  };


  const postAceInit = (hookName, context, webSocket, docId) => {
    socket = webSocket;
    padId = docId;
    VIDEOCHATLIMIT = 2000; // clientVars.webrtc.videoChatLimit;
    Helper.wrtcPubsub.emit('componentsFlow', 'video', 'init', true);
    // mediaDevices();

    socket.on('userLatency', (data) => {
      if (Helper.getUserId() !== data.userId) {
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

      if (pingos.LMin <= pingos.latency && pingos.latency >= pingos.LMax) { pingos.LMax = pingos.latency; } else { pingos.LMin = pingos.latency; }

      if (pingos.LineAvg.length < 4) {
        pingos.LineAvg.push((pingos.LMax + pingos.LMin) / 2);
      } else {
        pingos.avg = pingos.LineAvg.reduce((a, b) => a + b) / pingos.LineAvg.length;
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

      // Helper.wrtcPubsub.emit('update network information', pingos);
    });

    socket.on('reloadVideoSession', (headerId) => {
      if (currentRoom.headerId !== headerId) return false;
      const target = 'PLUS';
      const userInfo = {
        padId: clientVars.padId || window.pad.getPadId(),
        userId: clientVars.userId || window.pad.getUserId(),
        userName: clientVars.userName || 'anonymous',
        headerId,
        target,
        action: 'JOIN',
      };
      Helper.wrtcPubsub.emit('disable room buttons', headerId, 'JOIN', target);
      createSession(headerId, userInfo, target);
    });
  };

  return {
    postAceInit,
    userJoin,
    userLeave,
    gatewayUserJoin,
    gatewayUserLeave,
    reloadSession,
    reloadCurrentSession,
    mediaDevices,
    isUserMediaAvailable,
    catchBrowserError,

  };
})();
