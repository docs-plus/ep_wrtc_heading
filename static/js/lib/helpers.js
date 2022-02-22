'use strict';

const Helper = (() => {
  const avatarUrl = '../static/plugins/ep_profile_modal/static/img/user.png';
  const hElements = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    '.h1',
    '.h2',
    '.h3',
    '.h4',
    '.h5',
    '.h6',
  ];

  let ace = null;

  const init = (context) => (ace = context.ace);

  const getAvatarUrl = (userId) => {
    if (!userId) return avatarUrl;
    return `/static/getUserProfileImage/${userId}/${window.pad.getPadId()}?t=${new Date().getTime()}`;
  };

  const getValidUrl = function () {
    const url =
      arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

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
    $element.animate(
      { scrollTop: $element[0].scrollHeight },
      { duration: 400, queue: false },
    );
  };

  const getUserFromId = (userId) => {
    const anonymousUser = { name: 'anonymous', userId, colorId: '#FFF' };
    if (!window.pad || !window.pad.collabClient) return anonymousUser;
    const result = window.pad.collabClient
      .getConnectedUsers()
      .filter((user) => user.userId === userId);
    const user = result.length > 0 ? result[0] : anonymousUser;
    return user;
  };

  const slugify = (text) => text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

  const $bodyAceOuter = () => $(document).find('iframe[name="ace_outer"]')
    .contents();

  const createShareLink = (headerId, headerText = 'headerText') => `${window.location.origin + window.location.pathname}?header=${slugify(
    headerText,
  )}&id=${headerId}&target=video&join=true`;

  const appendUserList = (roomInfo, selector) => {
    if (!roomInfo.list) return true;
    const $element =
      typeof selector === 'string' ? $(document).find(selector) : selector;
    $element.empty();
    roomInfo.list.forEach((el) => {
      const userInList = getUserFromId(el.userId) || {
        colorId: '',
        name: 'anonymous',
        userId: '0000000',
      };
      const userName = userInList.name || 'anonymous';
      $element.append(
        `<li data-id=${el.userId} style='border-color: ${
          userInList.colorId
        }'><div class='avatar'><div title='${userName}' style="background: url('${getAvatarUrl(
          el.userId,
        )}') no-repeat 50% 50% ; background-size : cover;"></div></div>${userName}</li>`,
      );
    });
  };

  // socketState: 'CLOSED', 'OPENED', 'DISCONNECTED'
  // enable: plugin active/deactivate
  const wrtcStore = {
    enable: true,
    userInRoom: false,
    currentOpenRoom: null,
    socketState: 'CLOSED',
    localstream: null,
    components: {
      text: { init: false, open: false },
      video: { init: false, open: false },
      room: { init: false, open: false },
      wrtc: { init: false, open: false },
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
      let $element = $bodyAceOuter().find(
        `#wbrtc_avatarCol .${headerId}.wrtcIconLine .wrtc_inlineAvatars`,
      );

      const offsetTop = findAceHeaderElement(headerId).offset.top() - 16;

      if (!$element.length) {
        const avatarBox = $('#wrtcLinesIcons').tmpl({ headerId, offsetTop });
        $element = $bodyAceOuter().find('#wbrtc_avatarCol')
          .append(avatarBox);
        $element = $element.find(
          `.${headerId}.wrtcIconLine .wrtc_inlineAvatars`,
        );
      }

      const $videoInlineAvatarIcons = $bodyAceOuter().find(
        '#wbrtc_avatarCol .wrtc_inlineAvatars',
      );

      $element.find('.avatar').remove();
      Object.keys(room).forEach((key, index) => {
        const userInList = getUserFromId(room[key].userId) || {
          colorId: '',
          name: 'anonymous',
        };
        if (userInList.userId) {
          // if user avatar find in other room remove it
          $videoInlineAvatarIcons
            .find(`.avatar[data-id="${userInList.userId}"]`)
            .remove();

          if (index < inlineAvatarLimit) {
            const userName = userInList.name || 'anonymous';
            const avatarURL = getAvatarUrl(userInList.userId);
            $element.find('.avatarMore').hide();
            $element.append(
              `<div
                class="avatar btn_roomHandler"
                data-join="null" data-action="USERPROFILEMODAL"
                data-id="${userInList.userId}"
              >
                <div
                  title='${userName}'
                  style="background: url('${avatarURL}') no-repeat 50% 50%;
                  background-size : cover;"
                ></div>
              </div>`,
            );
          } else {
            $element
              .find('.avatarMore')
              .show()
              .text(`+${index + 1 - inlineAvatarLimit}`);
          }
        }
      });
    },
    VIDEO: (headerId, room) => {
      const $element = $(document).find('#werc_toolbar .wrtc_inlineAvatars');
      if (!clientVars.webrtc.displayInlineAvatar) {
        $element.hide();
        return;
      }
      $element.show();
      $element.find('.avatar').remove();
      inlineAvatar._append(room.list, $element);
    },
    _append: (list, $element) => {
      const inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
      list.forEach((el, index) => {
        const userInList = getUserFromId(el.userId) || {
          colorId: '',
          name: 'anonymous',
        };
        if (userInList.userId) {
          if (index < inlineAvatarLimit) {
            const userName = userInList.name || 'anonymous';
            const avatarUrl = getAvatarUrl(userInList.userId);
            $element.find('.avatarMore').hide();
            $element.append(
              `
                <div
                  class="avatar btn_roomHandler"
                  data-join="null"
                  data-action="USERPROFILEMODAL"
                  data-id="${userInList.userId}"
                >
                  <div
                    title='${userName}'
                    style="background: url('${avatarUrl}') no-repeat 50% 50%;
                    background-size : cover;"
                  ></div>
                </div>`,
            );
          } else {
            $element
              .find('.avatarMore')
              .show()
              .text(`+${index + 1 - inlineAvatarLimit}`);
          }
        }
      });
    },
    update: (userId, data) => {
      if (!clientVars.webrtc.displayInlineAvatar) return;

      const $roomBox = $bodyAceOuter().find('#wrtcVideoIcons .wrtc_inlineAvatars');
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
    },
  };

  /**
   * @param {boolean} state
   */
  wrtcPubsub.on('plugin enable', (state) => {
    $bodyAceOuter()
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .find('.heading wrt-inline-icon')
      .each((i, el) => {
        el.shadowRoot.querySelector('.btn_roomHandler').style.display = state
          ? 'flex'
          : 'none';
      });

    Helper.$bodyAceOuter()
      .find('#outerdocbody')
      .find('#wbrtc_avatarCol')[0].style.display = state ? 'flex' : 'none';

    // deactivate
    if (!state) {
      videoChat.userLeave(window.headerId, wrtcPubsub.currentOpenRoom, 'PLUS');
      wrtcPubsub.currentOpenRoom = null;
    }
    wrtcStore.enable = state;
  });

  wrtcPubsub.on('update network information', () => {});

  /**
   * state (DISCONNECTED|OPENED)
   */
  wrtcPubsub.on('socket state', (state) => {
    wrtcStore.socketState = state;
    console.info(
      '[wrtc]: socket state has been change, new state:',
      state,
      wrtcStore.userInRoom,
      window.headerId,
    );
    if (state === 'OPENED' && wrtcStore.userInRoom) {
      console.info('Try reconnecting...');
      WRTC.attemptToReconnect();
    }
  });

  /**
   * @param {string}  name @enum(text|video|room|wrtc)
   * @param {string}  flow @enum(init|open)
   * @param {boolean} status @enum (true|false)
   */
  wrtcPubsub.on('componentsFlow', (name, flow, status) => {
    wrtcStore.components[name][flow] = status;
  });

  wrtcPubsub.on('update inlineAvatar info', (userId, data) => {
    if (clientVars.webrtc.displayInlineAvatar) inlineAvatar.update(userId, data);
  });

  wrtcPubsub.on('update store', (requestUser, headerId, action, target, roomInfo, callback) => {
    if (!requestUser || !headerId || !action || !roomInfo || !target) return false;

    if (!wrtcStore.rooms.has(headerId)) {
      wrtcStore.rooms.set(headerId, {
        VIDEO: { list: [] },
        TEXT: { list: [] },
        USERS: {},
        headerCount: 0,
      });
    }

    const room = wrtcStore.rooms.get(headerId);
    let users = room.USERS;

    room[target] = roomInfo;

    // remove all users
    users = {};

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
  },
  );

  wrtcPubsub.on('disable room buttons', (headerId, actions, target) => {
    const btn = $('#header_videochat_icon')[0];
    if (!btn) return;
    btn.classList.add('activeLoader');
    btn.setAttribute('disabled', true);
  });

  wrtcPubsub.on('enable room buttons', (headerId, action, target) => {
    const btn = $('#header_videochat_icon')[0];
    if (!btn) return;
    const newAction = action === 'JOIN' ? 'LEAVE' : 'JOIN';
    btn.removeAttribute('disabled');
    btn.setAttribute('data-action', newAction);
    btn.classList.remove('activeLoader');
  });

  wrtcPubsub.on('updateWrtcToolbarModal', (headerId, roomInfo) => {
    // find toolbar attribute and update all of them.
    // update toolbar title
    // update inlineAvatar

    const headerTile = findAceHeaderElement(headerId).text;

    $('#wrtc_modal .btn_roomHandler, #werc_toolbar p').attr('data-id', headerId);
    $('#wrtc_modal .nd_title .title').html(headerTile);
  });

  wrtcPubsub.on('updateWrtcToolbarTitleModal', (headerTile, headerId) => {
    if (headerId === window.headerId) {
      $(`#werc_toolbar .nd_title .titleb[data-id='${headerId}'`).html(headerTile);
      $(document)
        .find(`.wrtc_roomLink[data-id='${headerId}']`)
        .text(headerTile);
    }
  });

  const getHeaderRoomY = ($element) => {
    if (!$element.length) return;
    const height = $element.outerHeight();
    const paddingTop = Helper.$bodyAceOuter()
      .find('iframe[name="ace_inner"]')
      .css('padding-top');
    const aceOuterPadding = parseInt(paddingTop, 10);
    const offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
    return offsetTop + height / 2;
  };

  const getHeaderRoomX = ($element) => {
    if (!$element.length) return;
    const width = $element.outerWidth();
    const paddingLeft = Helper.$bodyAceOuter()
      .find('iframe[name="ace_inner"]')
      .css('padding-left');
    const aceOuterPadding = parseInt(paddingLeft, 10);
    const offsetLeft = Math.ceil(
      Helper.$bodyAceOuter().find('iframe[name="ace_inner"]')
        .offset().left -
        aceOuterPadding,
    );
    return offsetLeft - width - 6;
  };

  const findAceHeaderElement = (headerId) => {
    const $el = $bodyAceOuter()
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .find(`.heading.${headerId}`);

    return {
      exist: $el.length,
      $el,
      text: $el.text(),
      tag: $el.attr('data-htag'),
      offset: {
        top: () => getHeaderRoomY($el),
        left: () => getHeaderRoomX($el),
      },
      $inlineIcon: () => $el.find('wrt-inline-icon').length
        ? $el.find('wrt-inline-icon')[0].shadowRoot
        : null,
    };
  };

  return {
    init,
    hElements,
    scrollDownToLastChatText,
    getUserFromId,
    slugify,
    $bodyAceOuter,
    createShareLink,
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
