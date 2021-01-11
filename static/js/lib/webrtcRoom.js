'use strict';

const WrtcRoom = (() => {
  let socket = null;
  let padId = null;
  let VIDEOCHATLIMIT = 0;

  /** --------- Helper --------- */

  function scroll2Header(headerId) {
    const padContainer = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody');
    padContainer.find(`.videoHeader.${headerId}`).each(function scrolling() {
      this.scrollIntoView({
        behavior: 'smooth',
      });
    });
  }

  function closeTextChat() {
    $('#wrtc_textChatWrapper .btn_leave').trigger('click');
  }

  function joinChatRoom(headerId, userInfo, target) {
    // textChat.userJoin(headerId, userInfo, 'TEXTPLUS');
    videoChat.userJoin(headerId, userInfo, 'PLUS');
    closeTextChat();
  }

  function leaveChatRoom(headerId, userInfo, target) {
    // textChat.userLeave(headerId, userInfo, 'TEXTPLUS');
    videoChat.userLeave(headerId, userInfo, 'PLUS');
    closeTextChat();
  }

  /**
	 *
	 * @param {string} actions @enum (JOIN|LEAVE|RELOAD|SHARELINK|USERPROFILEMODAL|JOINBYQUERY)
	 * @param {string} headerId
	 * @param {string} target @enum (chatRoom|video|text)
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
    if (share.wrtcStore.socketState !== 'OPEND') {
      // show the alert that user must reload the page
      $.gritter.add({
        title: 'Video chat no longer responds',
        text: 'The socket is disconnected and we can no longer make a stable call, please go to stable internet and then reload the page.',
        sticky: false,
        class_name: 'error',
        time: '15000',
      });
      return false;
    }

    if (actions !== 'SHARELINK' && actions !== 'USERPROFILEMODAL' && actions !== 'JOINBYQUERY') { share.wrtcPubsub.emit('disable room buttons', headerId, actions, target); }

    if (actions === 'JOIN') {
      switch (target) {
        case 'PLUS':
          joinChatRoom(headerId, userInfo, target);
          break;
        case 'VIDEO':
          videoChat.userJoin(headerId, userInfo, target);
          break;
        case 'TEXT':
          textChat.userJoin(headerId, userInfo, target);
          break;
        default:
          return false;
      }
    } else if (actions === 'LEAVE') {
      switch (target) {
        case 'PLUS':
          leaveChatRoom(headerId, userInfo, target);
          break;
        case 'VIDEO':
          videoChat.userLeave(headerId, userInfo, target);
          break;
        case 'TEXT':
          textChat.userLeave(headerId, userInfo, target);
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
			const href = $(this).attr("href");
			joinByQueryString(href);
		}
  }

  function joinByQueryString(url) {
    url = url || window.location.href;
    const urlParams = new URLSearchParams(url);
    const headerId = urlParams.get('id');
    let target = urlParams.get('target');
    const join = urlParams.get('join');

		if (!headerId) return true;
		
		const inComeURL = new URL(url);
		const inComePadName = inComeURL.pathname.split('/').pop()
		const currentPadName = location.pathname.split('/').pop()

		// check if header id belong to this pad
		// then if it's not check padName
    if (!share.wrtcStore.rooms.get(headerId)) {
			if(inComePadName !== currentPadName) return window.location.href = url
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

    if (join === 'true') {
      target = target.toUpperCase();
      setTimeout(() => {
        roomBtnHandler('JOIN', headerId, target);
      }, 700);
    }
  }

  function shareRoomsLink(headId, target) {
    headId = $(this).attr('data-id') || headId;
    target = $(this).attr('data-join') || target;
    target = target.toLowerCase();
    const title = share.$body_ace_outer().find(`.wbrtc_roomBox.${headId} .titleRoom`).text();

    const origin = window.location.origin;
    const pathName = window.location.pathname;
    const link = `${origin + pathName}?header=${share.slugify(title)}&id=${headId}&target=${target}&join=true`;

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

  function getHeaderRoomY($element) {
    const height = $element.outerHeight();
    const paddingTop = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
    const aceOuterPadding = parseInt(paddingTop, 10);
    const offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
    return offsetTop + height / 2 - 22;
  }

  function showUserProfileModal(headerId) {
    const userId = $(this).attr('data-id') || headerId;
    const user = window.clientVars.ep_profile_list[userId];
    if (!user) return false;
    const imageUrl = user.imageUrl || `/p/getUserProfileImage/${userId}/${padId}?t=${new Date().getTime()}`;
    $('#ep_profile_users_profile_name').text(user.userName);
    $('#ep_profile_users_profile_desc').text(user.about);
    $('#ep_profile_users_profile_homepage').attr({
      href: share.getValidUrl(user.homepage),
      target: '_blank',
    });

    $('#ep_profile_users_profile').addClass('ep_profile_formModal_show');
    $('#ep_profile_general_overlay').addClass('ep_profile_formModal_overlay_show');
    $('#ep_profile_general_overlay').css({display: 'block'});

    $('#ep_profile_users_profile_userImage').css({
      'background-position': '50% 50%',
      'background-image': `url(${imageUrl})`,
      'background-repeat': 'no-repeat',
      'background-size': '69px',
      'background-color': '#485365',
    });
  }

  function activeEventListener() {
    const $AceOuter = share.$body_ace_outer();

    $AceOuter.on('click', '.btn_roomHandler', roomBtnHandler);

    $(document).on('click', '.btn_roomHandler', roomBtnHandler);

    $(document).on('mouseenter', '.video-container.local-user', () => {
      $(document).find('#wrtc_modal #networkStatus').addClass('active');
    }).on('mouseleave', '.video-container.local-user', () => {
      $(document).find('#wrtc_modal #networkStatus').removeClass('active');
    });

    $(document).on('click', '#werc_toolbar p, .textChatToolbar b', function click() {
      const headerId = $(this).attr('data-id');
      scroll2Header(headerId);
    });

    $(document).on('click', '#werc_toolbar .btn_enlarge', function click() {
      if (!$(this).attr('active')) return true;

      $(this).toggleClass('large');

      $('#wrtc_modal .video-container .enlarge-btn').each(function trigger() {
        $(this).trigger('click');
      });
    });

    // video interface settings
    $(document).on('click', '#werc_toolbar .btn_videoSetting', function click() {
      const offset = $(this).position();
      const $box = $(document).find('#wrtc_settings');
      const width = $box.outerWidth();
      $box.css({left: `${offset.left - width}px`, top: `${offset.top + 4}px`}).toggleClass('active');
    });
  }

  var self = {
    joinByQueryString,
    roomBtnHandler,
    aceSetAuthorStyle: function aceSetAuthorStyle(context) {
      if (context.author) {
        const user = share.getUserFromId(context.author);
        if (user) {
          // sync user info
          share.$body_ace_outer().find(`.wrtc_content.textChat ul li[data-id='${user.userId}']`).css({'border-color': user.colorId}).text(user.name);
          share.$body_ace_outer().find(`.wrtc_content.videoChat ul li[data-id='${user.userId}']`).css({'border-color': user.colorId}).text(user.name);
        }
      }
    },
    userLeave: function userLeave(context, callback) {
      // Deprecated, we use socket disconnect

      callback();
    },
    postAceInit: function postAceInit(hook, context, webSocket, docId) {
      socket = webSocket;
      padId = docId;
      VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
      share.wrtcPubsub.emit('componentsFlow', 'room', 'init', true);

      socket.on('userJoin', (data, roomInfo, target) => {
        if (target === 'video') {
          videoChat.gateway_userJoin(data, roomInfo, false);
        } else {
          textChat.addUserToRoom(data, roomInfo, target);
        }
      });

      socket.on('userLeave', (data, roomInfo, target) => {
        if (target === 'video') {
          videoChat.gateway_userLeave(data, roomInfo, target);
        } else {
          textChat.removeUserFromRoom(data, roomInfo, target);
        }
      });

      activeEventListener();

      // check if there is a join request in URI queryString
      setTimeout(() => {
        joinByQueryString();
      }, 500);
    },
    adoptHeaderYRoom: function adoptHeaderYRoom() {
      // Set all video_heading to be inline with their target REP
      const $padOuter = share.$body_ace_outer();
      if (!$padOuter) return;

      // TODO: performance issue
      $padOuter.find('.wrtcIconLine').each(function adjustHeaderIconPosition() {
        const $el = $(this);
        const $boxId = $el.attr('id');
        const hClassId = `.videoHeader.${$boxId}`;
        const $headingEl = $padOuter.find('iframe').contents().find('#innerdocbody').find(hClassId);

        // if the H tags does not find, remove chatBox
        // TODO: and kick out the user form the chatBox
        if ($headingEl.length <= 0) {
          $el.remove();
          return false;
        }

        $el.css({top: `${getHeaderRoomY($headingEl)}px`});
      });
    },
    appendVideoIcon: function appendVideoIcon(headerId, options = {createAgain: false}) {
      if (!headerId) return false;

      const roomExist = share.wrtcStore.rooms.has(headerId);
      if (!options.createAgain && roomExist) return false;

      if (!roomExist) {
        const $el = share.$body_ace_outer().find('iframe')
            .contents()
            .find('#innerdocbody')
            .children('div')
            .find(`.videoHeader.${headerId}`);

        const aceInnerOffset = share.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
        const target = share.$body_ace_outer().find('#outerdocbody');
        const newY = getHeaderRoomY($el);
        const newX = Math.ceil(aceInnerOffset.left);
        const lineNumber = $el.parent().parent().prevAll().length;

        const data = {
          headingTagId: headerId,
          positionTop: newY,
          positionLeft: newX,
          headTitle: $el.text(),
          lineNumber,
          videoChatLimit: VIDEOCHATLIMIT,
        };

        share.wrtcStore.rooms.set(headerId, {VIDEO: {list: []}, TEXT: {list: []}, USERS: {}, headerCount: 0});

        const box = $('#wrtcLinesIcons').tmpl(data);
        target.find('#wrtcVideoIcons').append(box);
        // check the room that has user in there
        // padId, headerId
        socket.emit('getVideoRoomInfo', padId, headerId, (result) => {
          if (result) share.inlineAvatar.ROOM(headerId, result);
        });
      }

      self.adoptHeaderYRoom();
    },
  };

  return self;
})();
