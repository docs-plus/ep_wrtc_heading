const WRoom = (() => {
  let socket = null;
  let padId = null;
  let VIDEOCHATLIMIT = 0;
  let tryTojoinWithQueryString = 0;

  /**
   *
   * @param {string} actions @enum (JOIN|LEAVE|RELOAD|SHARELINK|USERPROFILEMODAL|JOINBYQUERY)
   * @param {string} headerId
   * @param {string} target @enum (chatRoom|video)
   */
  function roomBtnHandler(actions, headerId, target) {
    if (typeof actions !== 'string') {
      actions.preventDefault();
      // no idea! but in somecases! this function fire twice!
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
    if (Helper.wrtcStore.socketState !== 'OPEND') {
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
      Helper.wrtcPubsub.emit('disable room buttons', headerId, actions, target);
      videoChat.userJoin(headerId, userInfo, target);
    } else if (actions === 'LEAVE') {
      Helper.wrtcPubsub.currentOpenRoom = null;
      videoChat.userLeave(headerId, userInfo, target);
    } else if (actions === 'RELOAD') {
      videoChat.reloadSession(headerId, userInfo, target, actions);
    } else if (actions === 'SHARELINK') {
      shareRoomsLink(headerId, target);
    } else if (actions === 'USERPROFILEMODAL') {
      showUserProfileModal(headerId);
    } else if (actions === 'JOINBYQUERY') {
      const href = $(this).attr('href');
      joinWithQueryString(href);
    }
  }

  const joinWithQueryString = (url) => {
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

    // FIXME: this function move to helper and refactor
    // if (headerId) scroll2Header(headerId);

    if (join === 'true' && target) {
      target = target.toUpperCase();

      if (
        Helper.wrtcStore.socketState === 'CLOSED' &&
        tryTojoinWithQueryString <= 4
      ) {
        setTimeout(() => {
          console.warn(`
            [wrtc]: socket state is ${Helper.wrtcStore.socketState}, try to join again!
          `);
          tryTojoinWithQueryString++;
          joinWithQueryString();
        }, 1500);
      } else if (Helper.wrtcStore.socketState === 'OPEND') {
        setTimeout(() => roomBtnHandler('JOIN', headerId, target), 1000);
      } else {
        console.error(
          `
          [wrtc]: We try to join ${tryTojoinWithQueryString}th,
          Joining by query string has problem!
        `,
          Helper.wrtcStore.socketState,
          tryTojoinWithQueryString,
        );
      }
    }
  };

  // TODO: need refactor with helper and native create share link
  const shareRoomsLink = (headId, target) => {
    headId = $(this).attr('data-id') || headId;
    target = $(this).attr('data-join') || target;
    target = target.toLowerCase();

    const title = Helper.$body_ace_outer()
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .find(`.heading.${headId}`)
      .text();

    const origin = window.location.origin;
    const pathName = window.location.pathname;
    const link = `${origin + pathName}?header=${Helper.slugify(
      title,
    )}&id=${headId}&target=${target}&join=true`;
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
  };

  // TODO: need refactore and use bridge strategy
  function showUserProfileModal(headerId) {
    const userId = $(this).attr('data-id') || headerId;
    const user = window.clientVars.ep_profile_list[userId];
    if (!user) return false;
    const staticImage = `/static/getUserProfileImage/${userId}/${padId}?t=${new Date().getTime()}`;
    const imageUrl = user.imageUrl || staticImage;
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
    const $AceOuter = Helper.$body_ace_outer();

    $AceOuter.on('click', '.btn_roomHandler', roomBtnHandler);
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

    // $AceOuter.find('iframe').contents()
    // .find('#innerdocbody').on('click', 'wrt-inline-icon', function () {
    //   const $btn = this.shadowRoot.querySelector('.btn_roomHandler');
    //   const headerId = $btn.getAttribute('data-id');
    //   const action = $btn.getAttribute('data-action');
    //   const target = $btn.getAttribute('data-join');
    //   roomBtnHandler(action, headerId, target);
    // });

    // TODO: refactore, this need to change and use paddInner variable
    $AceOuter
      .find('iframe')
      .contents()
      .find('#innerdocbody')
      .on('click', 'chat-inline-icon', function () {
        const headerId = $(this).attr('data-headerid');
        $(document)
          .find(`#tocItems .itemRow.tocItem[sectionid='${headerId}']`)
          .trigger('click');
      });

    // integration with ep_rocketChat
    $(document).on('click', '#toc .itemRow.tocItem', function () {
      const headerId = $(this).attr('sectionid');
      const room = Helper.wrtcStore.rooms.get(headerId);

      // clear the button
      $('.header_videochat_icon').attr('data-id', headerId);
      $('.header_videochat_icon .icon').removeClass('active');
      $('.header_videochat_icon .icon .userCount').text('');

      // check wrtc store
      const userPresent =
        room.VIDEO.present === 0 ? '' : room && room.VIDEO.present && 0;
      $('.header_videochat_icon .icon .userCount').text(userPresent);
      // does the current user present in this room
      const currentUserPresent = room.VIDEO.list.find(
        (x) => x.userId === clientVars.userId,
      );

      if (currentUserPresent) $('.header_videochat_icon .icon').addClass('active');
    });

    // FIXME: this function move to helper and refactor
    // $(document).on('click', '#werc_toolbar p, .textChatToolbar b', function click() {
    //   const headerId = $(this).attr('data-id');
    //   scroll2Header(headerId);
    // });

    $(document).on('click', '#werc_toolbar .btn_enlarge', function click() {
      if (!$(this).attr('active')) return true;
      $(this).toggleClass('large');
      $('#wrtc_modal .video-container .enlarge-btn').each(function trigger() {
        $(this).trigger('click');
      });
    });

    // video interface settings
    $(document).on(
      'click',
      '#werc_toolbar .btn_videoSetting',
      function click() {
        const offset = $(this).position();
        const $box = $(document).find('#wrtc_settings');
        const width = $box.outerWidth();
        $box
          .css({
            left: `${offset.left - width}px`,
            top: `${offset.top + 4}px`,
          })
          .toggleClass('active');
      },
    );
  };

  const self = {
    joinWithQueryString,
    roomBtnHandler,
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
      // TODO: refactore check if the plugin is ready to use then try to join
      setTimeout(() => {
        joinWithQueryString();
      }, 500);
    },
    appendVideoIcon: (headerId, options = { createAgain: false }) => {
      if (!headerId) return false;

      const roomExist = Helper.wrtcStore.rooms.has(headerId);
      if (!options.createAgain && roomExist) return false;

      const $elRoomExist = Helper.findAceHeaderElement(headerId);

      if (!roomExist && $elRoomExist.exist) {
        const $el = Helper.$body_ace_outer()
          .find('iframe')
          .contents()
          .find('#innerdocbody')
          .children('div')
          .find(`.videoHeader.${headerId}`);

        const aceInnerOffset = Helper.$body_ace_outer()
          .find('iframe[name="ace_inner"]')
          .offset();
        const target = Helper.$body_ace_outer().find('#outerdocbody');
        const newY = Helper.getHeaderRoomY($el);
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

      Helper.adjustAvatarAlignMent();
    },
    syncVideoAvatart: (headerId) => {
      socket.emit('getVideoRoomInfo', padId, headerId, (result) => {
        if (result) Helper.inlineAvatar.ROOM(headerId, result);
      });
    },
  };

  return self;
})();
