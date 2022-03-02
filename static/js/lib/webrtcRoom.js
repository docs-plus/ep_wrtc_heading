'use strict';

const WrtcRoom = (() => {
  let socket = null;
  let padId = null;
  let VIDEOCHATLIMIT = 0;
  let tryToJoinByQueryString = 0;

  /** --------- Helper --------- */

  const scroll2Header = (headerId) => {
    const padContainer = $('iframe[name="ace_outer"]')
      .contents()
      .find('iframe')
      .contents();
    const header = padContainer.find(`.${headerId}`);
    if (header.length === 0) return false;
    header[0].scrollIntoView({
      behavior: 'smooth',
    });
  };

  const joinChatRoom = (headerId, userInfo, target) => {
    videoChat.userJoin(headerId, userInfo, 'PLUS');
  };

  const leaveChatRoom = (headerId, userInfo, target) => {
    videoChat.userLeave(headerId, userInfo, 'PLUS');
  };

  /**
   *
   * @param {string} actions @enum (JOIN|LEAVE|RELOAD|SHARELINK|USERPROFILEMODAL|JOINBYQUERY)
   * @param {string} headerId
   * @param {string} target @enum (chatRoom|video|text)
   */
  function roomBtnHandler(actions, headerId, target) {
    if (typeof actions !== 'string') {
      actions.preventDefault();
      // no idea! but in some cases! this function fire twice!
      // the first one has selector, but the second one has not any selector
      if (!actions.handleObj.selector) return false;
    }

    headerId = $(this).attr('data-id') || headerId;
    actions = $(this).attr('data-action') || actions;
    target = $(this).attr('data-join') || target;

    if (!headerId || !target) return true;

    // If the plugin is disabled
    if (!Helper.wrtcStore.enable) {
      console.info('[wrtc]: Plugin disabled');
      return;
    }

    const hasHref = $(this).attr('href');
    // if the link belong to the other pad.
    // navigate to the new pad
    // TODO: URL should be sanitize and then decided to navigate
    if (hasHref) {
      const url = new URL(hasHref);
      if (url.pathname !== location.pathname) window.location = hasHref;
    }

    const userInfo = {
      padId: clientVars.padId || window.pad.getPadId(),
      userId: clientVars.userId || window.pad.getUserId(),
      userName: clientVars.userName || 'anonymous',
      headerId,
      target,
      action: actions,
    };
    // Before handel request, check socket state
    if (Helper.wrtcStore.socketState !== 'OPENED') {
      // show the alert that user must reload the page
      $.gritter.add({
        title: 'Video chat no longer responds',
        text: `
          The socket is disconnected and we can no longer make a stable call,
          please go to stable internet and then reload the page.
        `,
        sticky: false,
        class_name: 'error',
        time: '15000',
      });
      return false;
    }

    if (actions === 'JOIN') {
      Helper.wrtcPubsub.currentOpenRoom = userInfo;
      switch (target) {
      case 'PLUS':
        Helper.wrtcPubsub.emit(
          'disable room buttons',
          headerId,
          actions,
          target,
        );
        joinChatRoom(headerId, userInfo, target);
        break;
      case 'VIDEO':
        Helper.wrtcPubsub.emit(
          'disable room buttons',
          headerId,
          actions,
          target,
        );
        videoChat.userJoin(headerId, userInfo, target);
        break;
      default:
        return false;
      }
    } else if (actions === 'LEAVE') {
      Helper.wrtcPubsub.currentOpenRoom = null;
      switch (target) {
      case 'PLUS':
        leaveChatRoom(headerId, userInfo, target);
        break;
      case 'VIDEO':
        videoChat.userLeave(headerId, userInfo, target);
        break;
      default:
        return false;
      }
    } else if (actions === 'RELOAD') {
      videoChat.reloadSession(headerId, userInfo, target, actions);
    } else if (actions === 'SHARELINK') {
      shareRoomsLink(headerId, target);
    } else if (actions === 'USERPROFILEMODAL') {
      showUserProfileModal(headerId);
    } else if (actions === 'JOINBYQUERY') {
      const href = $(this).attr('href');
      joinByQueryString(href);
    }
  }

  const joinByQueryString = (url) => {
    url = url || window.location.href;
    const urlParams = new URLSearchParams(url);
    const headerId = urlParams.get('id');
    let target = urlParams.get('target');
    const join = urlParams.get('join');

    if (!headerId) return true;

    const inComeURL = new URL(url);
    const inComePadName = inComeURL.pathname.split('/').pop();
    const currentPadName = location.pathname.split('/').pop();

    // check if header id belong to this pad
    // then if it's not check padName

    if (!Helper.wrtcStore.rooms.get(headerId)) {
      if (inComePadName !== currentPadName) return (window.location.href = url);
      $.gritter.add({
        title: 'Error',
        text: 'The header seems not to exist anymore!',
        time: 3000,
        sticky: false,
        class_name: 'error',
      });
      return false;
    }

    if (headerId) scroll2Header(headerId);

    if (join === 'true' && target) {
      target = target.toUpperCase();

      if (
        Helper.wrtcStore.socketState === 'CLOSED' &&
        tryToJoinByQueryString <= 4
      ) {
        setTimeout(() => {
          console.warn(
            `[wrtc]: socket state is ${Helper.wrtcStore.socketState}, try to join again!`,
          );
          tryToJoinByQueryString++;
          joinByQueryString();
        }, 1500);
      } else if (Helper.wrtcStore.socketState === 'OPENED') {
        setTimeout(() => roomBtnHandler('JOIN', headerId, target), 1000);
      } else {
        console.error(`
          [wrtc]: We try to join ${tryToJoinByQueryString}th,
          Joining by query string has problem!
        `,
        Helper.wrtcStore.socketState,
        tryToJoinByQueryString,
        );
      }
    }
  };

  // if history state has change fire joinQueryString
  document.addEventListener('onPushState', (event) => {
    const { state } = event.detail;
    if (state.type === 'hyperLink') {
      const href = state.href;
      joinByQueryString(href);
    }
  });

  function shareRoomsLink(headId, target) {
    headId = $(this).attr('data-id') || headId;
    target = $(this).attr('data-join') || target;
    target = target.toLowerCase();

    const title = Helper.$bodyAceOuter()
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .find(`.heading.${headerId}`)
      .text();

    const origin = window.location.origin;
    const pathName = window.location.pathname;
    const queryString = `header=${Helper.slugify(
      title,
    )}&id=${headId}&target=${target}&join=true`;
    const link = `${origin + pathName}?${queryString}`;

    const $temp = $('<input>');
    $('body').append($temp);
    $temp.val(link).select();
    document.execCommand('copy');
    $temp.remove();

    $.gritter.add({
      title: 'Copied',
      text: 'Join link copied to clip board',
      sticky: false,
      class_name: 'copyLinkToClipboard',
      time: '3000',
    });
  }

  const getHeaderRoomY = ($element) => {
    const height = $element.outerHeight();
    const paddingTop = Helper.$bodyAceOuter()
      .find('iframe[name="ace_inner"]')
      .css('padding-top');
    const aceOuterPadding = parseInt(paddingTop, 10);
    const offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
    return offsetTop + height / 2 - 22;
  };

  function showUserProfileModal(headerId) {
    const userId = $(this).attr('data-id') || headerId;
    const user = window.clientVars.ep_profile_list[userId];
    if (!user) return false;
    const staticImageURL = `/static/getUserProfileImage/${userId}/${padId}`;
    const imageUrl = user.imageUrl || staticImageURL;
    $('#ep_profile_users_profile_name').text(user.userName);
    $('#ep_profile_users_profile_desc').text(user.about);
    $('#ep_profile_users_profile_homepage').attr({
      href: Helper.getValidUrl(user.homepage),
      target: '_blank',
    });

    $('#ep_profile_users_profile').addClass('ep_profile_formModal_show');
    $('#ep_profile_general_overlay').addClass(
      'ep_profile_formModal_overlay_show',
    );
    $('#ep_profile_general_overlay').css({ display: 'block' });

    $('#ep_profile_users_profile_userImage').css({
      'background-position': '50% 50%',
      'background-image': `url(${imageUrl})`,
      'background-repeat': 'no-repeat',
      'background-size': '69px',
      'background-color': '#485365',
    });
  }

  const activeEventListener = () => {
    const $AceOuter = Helper.$bodyAceOuter();

    $AceOuter.on('click', '.btn_roomHandler', roomBtnHandler);

    $AceOuter
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .on('click', 'chat-inline-icon', function () {
        const headerId = $(this).attr('data-headerid');
        $(document)
          .find('#header_videochat_icon')
          .attr({
            'data-action': 'JOIN',
            'data-id': headerId,
          });

        $(document)
          .find(`#tocItems .itemRow.tocItem[sectionid='${headerId}']`)
          .trigger('click');
      });

    // integration with ep_rocketChat
    $(document).on('click', '#toc .itemRow.tocItem', function () {
      const headerId = $(this).attr('sectionid');
      const room = Helper.wrtcStore.rooms.get(headerId);

      if (!room) {
        console.error(`[wrtc]: room does not founded!`, headerId, room);
        return false;
      }

      // clear the button
      $('.header_videochat_icon').attr('data-id', headerId);
      $('.header_videochat_icon .icon').removeClass('active');
      $('.header_videochat_icon .icon .userCount').text('');

      // check wrtc store
      const userPresent = room.VIDEO.present === 0 ? '' : room.VIDEO.present;
      $('.header_videochat_icon .icon .userCount').text(userPresent);
      // does the current user present in this room
      const currentUserPresent = room.VIDEO.list.find(
        (x) => x.userId === clientVars.userId,
      );

      if (currentUserPresent) $('.header_videochat_icon .icon').addClass('active');
    });

    $(document).on('click', '.btn_roomHandler, .wrtc_roomLink', roomBtnHandler);

    $(document)
      .on('mouseenter', '.video-container.local-user', () => {
        $(document).find('#wrtc_modal #networkStatus')
          .addClass('active');
      })
      .on('mouseleave', '.video-container.local-user', () => {
        $(document).find('#wrtc_modal #networkStatus')
          .removeClass('active');
      });

    $(document).on('click', '#werc_toolbar p',
      function click() {
        const headerId = $(this).attr('data-id');
        scroll2Header(headerId);
      },
    );

    $(document).on('click', '#werc_toolbar .btn_enlarge', function click() {
      if (!$(this).attr('active')) return true;

      $(this).toggleClass('large');

      $('#wrtc_modal .video-container .enlarge-btn').each(function trigger() {
        $(this).trigger('click');
      });
    });

    // video interface settings
    $(document).on('click', '#werc_toolbar .btn_videoSetting',
      function click() {
        const offset = $(this).position();
        const $box = $(document).find('#wrtc_settings');
        const width = $box.outerWidth();
        $box
          .css({ left: `${offset.left - width}px`, top: `${offset.top + 4}px` })
          .toggleClass('active');
      },
    );
  };

  const self = {
    joinByQueryString,
    roomBtnHandler,
    userLeave: (context, callback) => {
      // Deprecated, we use socket disconnect
    },
    postAceInit: (hookName, context, webSocket, docId) => {
      socket = webSocket;
      padId = docId;
      VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
      Helper.wrtcPubsub.emit('componentsFlow', 'room', 'init', true);

      socket.on('userJoin', (data, roomInfo, target) => {
        videoChat.gateway_userJoin(data, roomInfo, false);
      });

      socket.on('userLeave', (data, roomInfo, target) => {
        videoChat.gateway_userLeave(data, roomInfo, target);
      });

      activeEventListener();

      // check if there is a join request in URI queryString
      setTimeout(() => {
        joinByQueryString();
      }, 500);
    },
    adoptHeaderYRoom: () => {
      // Set all video_heading to be inline with their target REP
      const $padOuter = Helper.$bodyAceOuter();
      if (!$padOuter) return;

      // TODO: performance issue
      $padOuter
        .find('#wbrtc_avatarCol .wrtcIconLine')
        .each(function adjustHeaderIconPosition() {
          const $el = $(this);
          const $headerId = $el.attr('id');
          const $headingEl = Helper.findAceHeaderElement($headerId).$el;

          // if the H tags does not find, remove chatBox
          // TODO: and kick out the user form the chatBox
          if ($headingEl.length <= 0) {
            $el.remove();
            return false;
          }

          $el.css({ top: `${Helper.getHeaderRoomY($headingEl) - 16}px` });
        });
    },
    appendVideoIcon: (headerId, options = { createAgain: false }) => {
      if (!headerId) return false;

      const roomExist = Helper.wrtcStore.rooms.has(headerId);
      if (!options.createAgain && roomExist) return false;

      const $elRoomExist = Helper.findAceHeaderElement(headerId);

      if (!roomExist && $elRoomExist.exist) {
        const $el = Helper.$bodyAceOuter()
          .find('iframe')
          .contents()
          .find('#innerdocbody')
          .children('div')
          .find(`.heading.${headerId}`);

        const aceInnerOffset = Helper.$bodyAceOuter()
          .find('iframe[name="ace_inner"]')
          .offset();

        const target = Helper.$bodyAceOuter().find('#outerdocbody');
        const newY = getHeaderRoomY($el);
        const newX = Math.ceil(aceInnerOffset.left);
        const lineNumber = $el.parent().parent()
          .prevAll().length;

        const data = {
          headingTagId: headerId,
          positionTop: newY,
          positionLeft: newX,
          headTitle: $el.text(),
          lineNumber,
          videoChatLimit: VIDEOCHATLIMIT,
        };

        Helper.wrtcStore.rooms.set(headerId, {
          VIDEO: { list: [] },
          USERS: {},
          headerCount: 0,
        });

        const box = $('#wrtcLinesIcons').tmpl(data);
        target.find('#wrtcVideoIcons').append(box);
        // check the room that has user in there
        // padId, headerId
        socket.emit('getVideoRoomInfo', padId, headerId, (result) => {
          if (result) Helper.inlineAvatar.ROOM(headerId, result);
        });
      }

      self.adoptHeaderYRoom();
    },
    syncVideoAvatars: (headerId) => {
      if (!socket) return false;
      socket.emit('getVideoRoomInfo', padId, headerId, (result) => {
        if (result) Helper.inlineAvatar.ROOM(headerId, result);
      });
    },
  };

  return self;
})();
