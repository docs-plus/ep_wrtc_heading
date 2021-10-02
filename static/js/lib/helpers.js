'use strict';

const Helper = (() => {
  const avatarUrl = '../static/plugins/ep_profile_modal/static/img/user.png';
  const hElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];
  let ace = null;

  const init = (context) => ace = context.ace;

  const getAvatarUrl = (userId) => {
    if (!userId) return avatarUrl;
    return `/static/getUserProfileImage/${userId}/${window.pad.getPadId()}?t=${new Date().getTime()}`;
  };

  const getValidUrl = function () {
    const url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    if (url === '') return '';
    let newUrl = window.decodeURIComponent(url);
    newUrl = newUrl.trim().replace(/\s/g, '');

    if (/^(:\/\/)/.test(newUrl)) {
      return `http${newUrl}`;
    }
    if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
      return `http://${newUrl}`;
    }

    return newUrl;
  };

  const getUserId = () => clientVars.userId || window.pad.getUserId();

  const stopStreaming = (callback) => {
    const stream = wrtcStore.localstream;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
      wrtcStore.localstream = null;
      if (callback) callback();
    }
  };

  const scrollDownToLastChatText = (selector) => {
    const $element = $(selector);
    if ($element.length <= 0 || !$element[0]) return true;
    $element.animate({scrollTop: $element[0].scrollHeight}, {duration: 400, queue: false});
  };

  const getUserFromId = (userId) => {
    const anonymousUser = {name: 'anonymous', userId, colorId: '#FFF'};
    if (!window.pad || !window.pad.collabClient) return anonymousUser;
    const result = window.pad.collabClient.getConnectedUsers().filter((user) => user.userId === userId);
    const user = result.length > 0 ? result[0] : anonymousUser;
    return user;
  };

  const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  ;

  const $body_ace_outer = () => $(document).find('iframe[name="ace_outer"]').contents();

  const createShareLink = (headerId, headerText = 'headerText') => `${window.location.origin + window.location.pathname}?header=${slugify(headerText)}&id=${headerId}&target=video&join=true`;

  const addTextChatMessage = (msg) => {
    const authorClass = `author-${msg.userId.replace(/[^a-y0-9]/g, (c) => {
      if (c === '.') return '-';
      return `z${c.charCodeAt(0)}z`;
    })}`;

    // create the time string
    let minutes = `${new Date(msg.time).getMinutes()}`;
    let hours = `${new Date(msg.time).getHours()}`;
    if (minutes.length === 1) minutes = `0${minutes}`;
    if (hours.length === 1) hours = `0${hours}`;
    const timeStr = `${hours}:${minutes}`;

    const html = `<p id="wrtcNotifMessage" data-target='${msg.target}' data-id='${msg.headerId}' data-authorId='${msg.userId}' class='wrtc_text ${msg.headId} ${authorClass}'><span class='time ${authorClass}'>${timeStr}</span> ${msg.text}</p>`;

    $(document).find('#chatbox #chattext').append(html);
    scrollDownToLastChatText('#chatbox #chattext');
  };

  const notifyNewUserJoined = (target, msg, action) => {
    const videoIcon = '<span class="videoIcon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-video fa-w-18 fa-2x"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" class=""></path></svg></span>';
    const textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
    const btnJoin = `<span class='wrtc_roomLink btn_roomHandler' href="${createShareLink(msg.headerId)}" data-join='PLUS' data-action='JOINBYQUERY' data-id='${msg.headerId}' title='Join'>${msg.headerTitle}</span>`;

    const text = ''; // action === 'JOIN' ? 'joins' : 'leaves';
    const userName = `<b>${msg.userName}</b>`;

    if (target === 'PLUS' && action === 'JOIN') {
      if (msg.userCount === 1) {
        msg.text = `${userName} wants to talk about ${videoIcon}${btnJoin}`;
      } else {
        const roomSize = +msg.userCount === 0 ? '(JOIN)' : `(${msg.userCount}/${msg.VIDEOCHATLIMIT})`;
        const roomCounter = `<span class='userCount'>${roomSize}</span>`;
        msg.text = `${userName} joins ${videoIcon}${btnJoin}${roomCounter}`;
      }
    } else if (target === 'TEXT') {
      msg.text = `<span>${text}</span>${textIcon}${btnJoin}${userName}`;
    }

    if (!msg.text) return false;

    msg.target = target;

    addTextChatMessage(msg);
  };

  const appendUserList = (roomInfo, selector) => {
    if (!roomInfo.list) return true;
    const $element = typeof selector === 'string' ? $(document).find(selector) : selector;
    $element.empty();
    roomInfo.list.forEach((el) => {
      const userInList = getUserFromId(el.userId) || {colorId: '', name: 'anonymous', userId: '0000000'};
      const userName = userInList.name || 'anonymous';
      $element.append(`<li data-id=${el.userId} style='border-color: ${userInList.colorId}'><div class='avatar'><div title='${userName}' style="background: url('${getAvatarUrl(el.userId)}') no-repeat 50% 50% ; background-size : cover;"></div></div>${userName}</li>`);
    });
  };

  // socketState: 'CLOSED', 'OPEND', 'DISCONNECTED'
  // enable: plugin active/deactivate
  const wrtcStore = {
    enable: true,
    userInRoom: false,
    currentOpenRoom: null,
    socketState: 'CLOSED',
    localstream: null,
    components: {
      text: {init: false, open: false},
      video: {init: false, open: false},
      room: {init: false, open: false},
      wrtc: {init: false, open: false},
    },
    rooms: new Map(),
  };

  const wrtcPubsub = {
    events: {},
    on: function on(eventName, fn) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push(fn);
    },
    off: function off(eventName, fn) {
      if (this.events[eventName]) {
        for (let i = 0; i < this.events[eventName].length; i++) {
          if (this.events[eventName][i] === fn) {
            this.events[eventName].splice(i, 1);
            break;
          }
        }
      }
    },
    emit: function emit(eventName) {
      for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      if (this.events[eventName]) {
        this.events[eventName].forEach((fn) => {
          fn.apply(undefined, data);
        });
      }
    },
  };

  // search the inlineAvatar in all over

  /**
	 * @property ROOM
	 * @property TEXT
	 * @property VIDEO
	 * @property update
	 */
  const inlineAvatar = {
    ROOM: (headerId, room) => {
      if (!clientVars.webrtc.displayInlineAvatar) return;

      const inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
      let $element = $body_ace_outer().find(`#wbrtc_avatarCol .${headerId}.wrtcIconLine .wrtc_inlineAvatars`);

      const offsetTop = findAceHeaderElement(headerId).offset.top() - 16;

      if (!$element.length) {
        const avatarBox = $('#wrtcLinesIcons').tmpl({headerId, offsetTop});
        $element = $body_ace_outer().find('#wbrtc_avatarCol').append(avatarBox);
        $element = $element.find(`.${headerId}.wrtcIconLine .wrtc_inlineAvatars`);
      }

      const $videoInlineAvatarIcons = $body_ace_outer().find('#wbrtc_avatarCol .wrtc_inlineAvatars');

      $element.find('.avatar').remove();
      Object.keys(room).forEach((key, index) => {
        const userInList = getUserFromId(room[key].userId) || {colorId: '', name: 'anonymous'};
        if (userInList.userId) {
          // if user avatar find in other room remove it
          $videoInlineAvatarIcons.find(`.avatar[data-id="${userInList.userId}"]`).remove();

          if (index < inlineAvatarLimit) {
            const userName = userInList.name || 'anonymous';
            $element.find('.avatarMore').hide();
            $element.append(`<div class="avatar btn_roomHandler" data-join="null" data-action="USERPROFILEMODAL" data-id="${userInList.userId}"><div title='${userName}' style="background: url('${getAvatarUrl(userInList.userId)}') no-repeat 50% 50% ; background-size : cover;"></div></div>`);
          } else {
            $element.find('.avatarMore').show().text(`+${index + 1 - inlineAvatarLimit}`);
          }
        }
      });
    },
    TEXT(headerId, room) {
      const $element = $(document).find('#wrtc_textChatWrapper .wrtc_inlineAvatars');
      if (!clientVars.webrtc.displayInlineAvatar) {
        $element.hide();
        return;
      }
      $element.show();
      $element.find('.avatar').remove();
      this._append(room.list, $element);
    },
    VIDEO(headerId, room) {
      const $element = $(document).find('#werc_toolbar .wrtc_inlineAvatars');
      if (!clientVars.webrtc.displayInlineAvatar) {
        $element.hide();
        return;
      }
      $element.show();
      $element.find('.avatar').remove();
      this._append(room.list, $element);
    },
    _append(list, $element) {
      const inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
      list.forEach((el, index) => {
        const userInList = getUserFromId(el.userId) || {colorId: '', name: 'anonymous'};
        if (userInList.userId) {
          if (index < inlineAvatarLimit) {
            const userName = userInList.name || 'anonymous';
            $element.find('.avatarMore').hide();
            $element.append(`<div class="avatar btn_roomHandler" data-join="null" data-action="USERPROFILEMODAL" data-id="${userInList.userId}"><div title='${userName}' style="background: url('${getAvatarUrl(userInList.userId)}') no-repeat 50% 50% ; background-size : cover;"></div></div>`);
          } else {
            $element.find('.avatarMore').show().text(`+${index + 1 - inlineAvatarLimit}`);
          }
        }
      });
    },
    update(userId, data) {
      if (!clientVars.webrtc.displayInlineAvatar) return;

      const $roomBox = $body_ace_outer().find('#wrtcVideoIcons .wrtcIconLine .wrtc_inlineAvatars');
      const $textBox = $(document).find('#wrtc_textChatWrapper .wrtc_inlineAvatars');
      const $videoBox = $(document).find('#werc_toolbar .wrtc_inlineAvatars');

      if ($roomBox) {
        $roomBox.find(`.avatar[data-id="${userId}"] img`).attr({
          src: data.imageUrl,
          title: data.userName,
        });
      }

      if ($videoBox) {
        $videoBox.find('.avatar img').attr({
          src: data.imageUrl,
          title: data.userName,
        });
      }

      if ($textBox) {
        $textBox.find('.avatar img').attr({
          src: data.imageUrl,
          title: data.userName,
        });
      }
    },
  };


  /**
	 * @param {boolean} state
	 */
  wrtcPubsub.on('plugin enable', (state) => {
    $body_ace_outer().find('iframe').contents()
        .find('#innerdocbody').find('.videoHeader wrt-inline-icon').each((i, el) => {
          el.shadowRoot.querySelector('.btn_roomHandler').style.display = state ? 'flex' : 'none';
        });

    Helper.$body_ace_outer().find('#outerdocbody')
        .find('#wbrtc_avatarCol')[0].style.display = state ? 'flex' : 'none';

    // deactive
    if (!state) {
      videoChat.userLeave(window.headerId, wrtcPubsub.currentOpenRoom, 'PLUS');
      wrtcPubsub.currentOpenRoom = null;
    }
    wrtcStore.enable = state;
  });

  wrtcPubsub.on('update network information', () => {});

  /**
	 * state (DISCONNECTED|OPEND)
	 */
  wrtcPubsub.on('socket state', (state) => {
    wrtcStore.socketState = state;
    console.info('[wrtc]: socket state has been change, new state:', state, wrtcStore.userInRoom, window.headerId);
    if (state === 'OPEND' && wrtcStore.userInRoom) {
      console.info('Try reconnecting...');
      WRTC.attemptToReconnect();
    }
  });

  /**
	 * @param {string}	name 		@enum	(text|video|room|wrtc)
	 * @param {string}	flow 		@enum	(init|open)
	 * @param {boolean}	status 	@enum (true|false)
	 */
  wrtcPubsub.on('componentsFlow', (name, flow, status) => {
    wrtcStore.components[name][flow] = status;
  });

  wrtcPubsub.on('update inlineAvater info', (userId, data) => {
    if (clientVars.webrtc.displayInlineAvatar) inlineAvatar.update(userId, data);
  });

  wrtcPubsub.on('update store', (requestUser, headerId, action, target, roomInfo, callback) => {
    if (!requestUser || !headerId || !action || !roomInfo || !target) return false;

    if (!wrtcStore.rooms.has(headerId)) { wrtcStore.rooms.set(headerId, {VIDEO: {list: []}, TEXT: {list: []}, USERS: {}, headerCount: 0}); }

    const room = wrtcStore.rooms.get(headerId);
    let users = room.USERS;

    room[target] = roomInfo;

    // remove all users
    users = {};

    if (room.TEXT.list) {
      room.TEXT.list.forEach((el) => {
        if (!users[el.userId]) users[el.userId] = {};
        users[el.userId] = el;
      });
    }

    if (room.VIDEO.list) {
      room.VIDEO.list.forEach((el) => {
        if (!users[el.userId]) users[el.userId] = {};
        users[el.userId] = el;
      });
    }

    inlineAvatar[target](headerId, room[target]);
    inlineAvatar.ROOM(headerId, users);

    wrtcStore.rooms.set(headerId, room);

    if (callback) callback(room);
  });

  wrtcPubsub.on('disable room buttons', (headerId, actions, target) => {
    let btn = findAceHeaderElement(headerId).$inlineIcon();
    if (!btn) return;
    btn = btn.querySelector('.btn_roomHandler');
    btn.classList.add('activeLoader');
    btn.setAttribute('disabled', true);
  });

  wrtcPubsub.on('enable room buttons', (headerId, action, target) => {
    let btn = findAceHeaderElement(headerId).$inlineIcon();
    if (!btn) return;
    btn = btn.querySelector('.btn_roomHandler');
    const newAction = action === 'JOIN' ? 'LEAVE' : 'JOIN';
    btn.removeAttribute('disabled');
    btn.setAttribute('data-action', newAction);
    btn.classList.remove('activeLoader');
    // btn.classList.add('activeLoader');
  });

  wrtcPubsub.on('updateWrtcToolbarModal', (headerId, roomInfo) => {
    // find toolbar attribute and update all of thems.
    // update toolbar title
    // update inlineAvatar

    const headerTile = findAceHeaderElement(headerId).text;

    $('#wrtc_modal #werc_toolbar .nd_title .title').html(headerTile);
    $(document).find('#wrtc_textChatWrapper .textChatToolbar b').text(headerTile);

    $(document).find('#wrtc_textChatWrapper  [data-id], #wrtc_modal [data-id]')
        .each(function () {
          $(this).attr({'data-id': headerId});
        });
  });

  wrtcPubsub.on('updateWrtcToolbarTitleModal', (headerTile, headerId) => {
    if (headerId === window.headerId) {
      $(`#wrtc_modal #werc_toolbar .nd_title .titleb[data-id='${headerId}'`).html(headerTile);
      $(document).find(`#wrtc_textChatWrapper .textChatToolbar b[data-id='${headerId}']`).text(headerTile);
      $(document).find(`.wrtc_roomLink[data-id='${headerId}']`).text(headerTile);
    }
  });

  const getHeaderRoomY = ($element) => {
    if (!$element.length) return;
    const height = $element.outerHeight();
    const paddingTop = Helper.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
    const aceOuterPadding = parseInt(paddingTop, 10);
    const offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
    return offsetTop + height / 2;
  };

  const getHeaderRoomX = ($element) => {
    if (!$element.length) return;
    const width = $element.outerWidth();
    const paddingLeft = Helper.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-left');
    const aceOuterPadding = parseInt(paddingLeft, 10);
    const offsetLeft = Math.ceil(Helper.$body_ace_outer().find('iframe[name="ace_inner"]').offset().left - aceOuterPadding);
    return offsetLeft - width - 6;
  };

  const findAceHeaderElement = (headerId) => {
    const $el = $body_ace_outer().find('iframe').contents()
        .find('#innerdocbody').find(`.heading.${headerId}`);
    return {
      exist: $el.length,
      $el,
      text: $el.text(),
      tag: $el.attr('data-htag'),
      offset: {
        top: () => getHeaderRoomY($el),
        left: () => getHeaderRoomX($el),
      },
      $inlineIcon: () => $el.find('wrt-inline-icon').length ? $el.find('wrt-inline-icon')[0].shadowRoot : null,
    };
  };

  return {
    init,
    hElements,
    scrollDownToLastChatText,
    getUserFromId,
    slugify,
    $body_ace_outer,
    createShareLink,
    notifyNewUserJoined,
    appendUserList,
    wrtcStore,
    wrtcPubsub,
    getUserId,
    stopStreaming,
    getValidUrl,
    findAceHeaderElement,
    inlineAvatar,
    getHeaderRoomY,

  };
})();
