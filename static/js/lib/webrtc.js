/**
 * Copyright 2013 j <j@mailb.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Helper from './helpers';
import videoChat from './videoChat';
import getStats from 'getstats';
import WRTC from './webrtc';

import * as CodecsHandler from './codecsHandler';

const logError = (error) => {
  // if (error && error.message.includes("Failed to set remote answer sdp")) {
  self.attemptToReconnect();
  // } else {
  // socket.emit('acceptNewCall', padId, window.headerId);
  console.error('[wrtc]: LogError:', error);
  // }
  $('#wrtc_modal #networkError').show()
      .addClass('active')
      .text(`[wrtc]: Error: ${error} ,Reload the session.`);
};

// Normalize RTC implementation between browsers
// var getUserMedia = window.navigator.mediaDevices.getUserMedia
const attachMediaStream = (element, stream) => {
  if (typeof element.srcObject !== 'undefined') {
    element.srcObject = stream;
  } else if (typeof element.mozSrcObject !== 'undefined') {
    element.mozSrcObject = stream;
  } else if (typeof element.src !== 'undefined') {
    element.src = URL.createObjectURL(stream);
  } else {
    console.error('Error attaching stream to element.', element);
  }
};

const webrtcDetectedBrowser = 'chrome';

const cleanupSdp = (sdp) => {
  const bandwidth = {
    screen: 300, // 300kbits minimum
    audio: 256, // 64kbits  minimum
    video: 500,
    minVideo: 128, // 125kbits  min
    maxVideo: 2048, // 125kbits  max
    videoCodec: clientVars.webrtc.video.codec,
  };

  const isScreenSharing = false;

  sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, bandwidth, isScreenSharing);
  sdp = CodecsHandler.setVideoBitrates(sdp, {
    min: bandwidth.minVideo,
    max: bandwidth.maxVideo,
    codec: bandwidth.videoCodec,
  });
  sdp = CodecsHandler.setOpusAttributes(sdp);
  sdp = CodecsHandler.preferCodec(sdp, bandwidth.videoCodec);

  return sdp;
};

const mergeConstraints = (cons1, cons2) => {
  const merged = cons1;
  for (const name in cons2.mandatory) {
    merged.mandatory[name] = cons2.mandatory[name];
  }
  merged.optional.concat(cons2.optional);
  return merged;
};

const randomIntFromInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export default (() => {
  const attemptReconnect = 60;
  let reconnected = 0;
  const videoSizes = {large: '260px', small: '160px'};
  const pcConfig = {};
  const audioInputSelect = null;
  const videoSelect = null;
  const audioOutputSelect = null;
  const pcConstraints = {
    optional: [{
      DtlsSrtpKeyAgreement: true,
    }],
  };
  const sdpConstraints = {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
    },
  };

  const remoteStream = {};
  const pc = {};
  const enlargedVideos = new Set();
  let localVideoElement = null;
  let padId = null;
  let socket = null;

  const self = {
    // API HOOKS
    postAceInit: (hookName, context, webSocket, docId) => {
      padId = docId;
      socket = webSocket;

      if (!clientVars.webrtc) throw new Error('[wrtc]: webrtc settings not found');

      pcConfig.iceServers = clientVars.webrtc.iceServers;

      if (clientVars.webrtc.video.sizes.large) {
        videoSizes.large = `${clientVars.webrtc.video.sizes.large}px`;
      }
      if (clientVars.webrtc.video.sizes.small) {
        videoSizes.small = `${clientVars.webrtc.video.sizes.small}px`;
      }

      self._pad = context.pad || window.pad;

      $(document).on('change', '.select.audioSource select', self.audioVideoInputChange);
      $(document).on('change', '.select.videoSource select', self.audioVideoInputChange);
      $(document).on('change', '.select.audioOutputSec select', self.changeAudioDestination);

      $(window).on('unload', () => {
        console.info('[wrtc]: window unloaded, now hangupAll');
        self.hangupAll();
      });
      socket.on('RTC_MESSAGE', (context) => {
        // filter RTC_message just for how is in headerId room
        const payload = context.data.payload;
        if (payload.to !== Helper.getUserId()) return;
        if (payload.data.headerId === window.headerId) {
          self.receiveMessage(context.data.payload);
        }
      });
    },
    appendVideoModalToBody: () => {
      const $wrtcVideoModal = $('#wrtcVideoModal').tmpl({
        videoChatLimit: clientVars.webrtc.videoChatLimit,
        headerId: '',
      });

      $('body').prepend($wrtcVideoModal);

      $(document).on('click', '#wrtc_modal .btn_toggle_modal', function () {
        const $parent = $(this).parent()
            .parent();
        const action = $(this).attr('data-action');
        const videoBox = $('#wrtc_modal .videoWrapper').innerHeight();

        $(this).find('.fa_arrow-from-top')
            .toggle();
        $(this).find('.fa_arrow-to-top')
            .toggle();

        if (action === 'collapse') {
          $(this).attr({'data-action': 'expand'});
          $parent.find('.btn_enlarge').removeAttr('active');
          $('#wrtc_modal').css({
            transform: `translate(-50%, -${videoBox}px)`,
          });
        } else {
          $(this).attr({'data-action': 'collapse'});
          $parent.find('.btn_enlarge').attr({active: true});
          $('#wrtc_modal').css({
            transform: 'translate(-50%, 0)',
          });
        }
      });

      $(document).on('click', '#wrtc_settings .btn_info', function click() {
        const userID = Object.keys(pc);
        const $this = $(this);
        const isActive = $this.attr('data-active');
        const $modal = $(document).find('#wrtc_settings .wrtc_info');

        if (isActive) {
          $modal.hide();
          if (pc[userID[0]]) {
            getStats(pc[userID[0]], (result) => {
              result.nomore();
            });
          }
          $this.removeAttr('data-active');
          return true;
        } else {
          $this.attr({'data-active': true});
          $modal.show();
        }

        if (pc[userID[0]] && !isActive) {
          const bytesToSize = (bytes) => {
            const k = 1000;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes <= 0) {
              return '0 Bytes';
            }
            const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);

            if (!sizes[i]) {
              return '0 Bytes';
            }

            return `${(bytes / k ** i).toPrecision(3)} ${sizes[i]}`;
          };

          (pc[userID[0]], (result) => {
            const {video, audio, bandwidth, resolutions: {send, recv}} = result;
            const statistic = {
              speed: bytesToSize(bandwidth.speed),
              systemNetworkType: result.connectionType.systemNetworkType,
              availableSendBandwidth: bytesToSize(bandwidth.availableSendBandwidth),
              video: {
                'send.codecs': video.send.codecs.join(', '),
                'resolutionsSend': `width ${send.width}, height ${send.height}`,
                'resolutionsReceive': `width ${recv.width}, height ${recv.height}`,
                'bytesSent': bytesToSize(video.bytesSent),
                'bytesReceived': bytesToSize(video.bytesReceived),
              },
              audio: {
                'send.codecs': audio.send.codecs.join(', '),
                // "recv.codecs": result.audio.recv.codecs.join(", "),
                'bytesSent': bytesToSize(audio.bytesSent),
                'bytesReceived': bytesToSize(audio.bytesReceived),
              },
            };
            $(document).find('#wrtc_settings .wrtc_info')
                .html(`<pre>${JSON.stringify(statistic, undefined, 2)}</pre>`);
          }, 1000);
        }
      });

      $(document).on('click', '#wrtc_settings .btn_close', () => {
        $('#wrtc_settings').toggleClass('active');
        const $btnInfo = $('#wrtc_settings .btn_info');
        if ($btnInfo.attr('data-active')) $btnInfo.trigger('click');
      });
    },
    userLeave: (userId, context, callback) => {
      userId = userId || context.userInfo.userId;
      if (userId && pc[userId]) {
        // gState = 'LEAVING';
        self.hide(userId);
        self.hangup(userId, true);
      }
      Helper.wrtcStore.userInRoom = false;
      if (callback) callback();
    },
    // deprecated function
    handleClientMessage_RTC_MESSAGE: (hook, context) => {
      if (context.payload.data.headerId === window.headerId) {
        self.receiveMessage(context.payload);
      }
    },
    // END OF API HOOKS
    show: () => {
      $('#pad_title').addClass('f_wrtcActive');
      videoChat.mediaDevices();
    },
    showUserMediaError: (err, userId, headerId) => {
      // show an error returned from getUserMedia
      let reason;
      // For reference on standard errors returned by getUserMedia:
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
      // However keep in mind that we add our own errors in getUserMediaPolyfill
      console.error(`[wrtc]: mediaError, ${err}`);
      switch (err.name) {
        case 'CustomNotSupportedError':
          reason = 'Sorry, your browser does not support WebRTC. (or you have it disabled in your settings).<br><br>' + 'To participate in this audio/video chat you have to user a browser with WebRTC support like Chrome, Firefox or Opera.' + '<a href="http://www.webrtc.org/" target="_new">Find out more</a>';
          self.sendErrorStat('NotSupported');
          break;
        case 'CustomSecureConnectionError':
          reason = 'Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC';
          self.sendErrorStat('SecureConnection');
          break;
        case 'NotAllowedError':
        // For certain (I suspect older) browsers, `NotAllowedError` indicates either an insecure connection or the user rejecting camera permissions.
        // The error for both cases appears to be identical, so our best guess at telling them apart is to guess whether we are in a secure context.
        // (webrtc is considered secure for https connections or on localhost)
          if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            reason = 'Sorry, you need to give us permission to use your camera and microphone';
            self.sendErrorStat('Permission');
          } else {
            reason = 'Sorry, you need to install SSL certificates for your Etherpad instance to use WebRTC';
            self.sendErrorStat('SecureConnection');
          }
          break;
        case 'NotFoundError':
          reason = "Sorry, we couldn't find a suitable camera on your device. If you have a camera, make sure it set up correctly and refresh this website to retry.";
          self.sendErrorStat('NotFound');
          break;
        case 'NotReadableError':
        // `err.message` might give useful info to the user (not necessarily useful for other error messages)
          reason = `Sorry, a hardware error occurred that prevented access to your camera and/or microphone:<br><br>${err.message}`;
          self.sendErrorStat('Hardware');
          break;
        case 'AbortError':
        // `err.message` might give useful info to the user (not necessarily useful for other error messages)
          reason = `Sorry, an error occurred (probably not hardware related) that prevented access to your camera and/or microphone:<br><br>${err.message}`;
          self.sendErrorStat('Abort');
          break;
        default:
        // `err` as a string might give useful info to the user (not necessarily useful for other error messages)
          reason = `Sorry, there was an unknown Error:<br><br>${err}`;
          self.sendErrorStat('Unknown');
      }
      $.gritter.add({
        title: 'Error',
        text: `${reason}; try again!`,
        time: 4000,
        sticky: false,
        class_name: 'error',
      });
      userId = userId || clientVars.userId;
      headerId = headerId || window.headerId;
      videoChat.userLeave(headerId,
          {
            headerId,
            padId,
            userId,
          }
      );
    },
    hide: (userId) => {
      if (!userId) return false;
      userId = userId.split('.')[1];
      $('#rtcbox').find(`#video_a_${userId}`)
          .parent()
          .remove();
    },
    activate: (headerId) => {
      self.show();
      self.hangupAll();
      self.getUserMedia(headerId);
      Helper.wrtcStore.userInRoom = true;
    },
    deactivate: async (userId, headerId) => {
      if (!userId) return false;
      self.hide(userId);
      self.hangupAll(headerId);
      self.hangup(userId, true, headerId);
      if (Helper.wrtcStore.localstream) await Helper.stopStreaming();
      Helper.wrtcStore.userInRoom = false;
    },
    toggleMuted: () => {
      const audioTrack = Helper.wrtcStore.localstream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returning "Muted" state, which is !enabled
      }
      return true; // if there's no audio track, it's muted
    },
    toggleVideo: () => {
      const videoTrack = Helper.wrtcStore.localstream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    },
    setStream: (userId, stream) => {
      if (!userId) return false;
      const isLocal = userId === Helper.getUserId();
      const videoId = `video_${userId.replace(/\./g, '_')}`;
      let video = $(`#${videoId}`)[0];

      const user = Helper.getUserFromId(userId);

      if (!video && stream) {
        const videoContainer = $("<div class='video-container'>").css({
          'width': videoSizes.small,
          'max-height': videoSizes.small,
        })
            .appendTo($('#wrtc_modal .videoWrapper'));
        const userName = user.name || 'anonymous';
        videoContainer.append($('<div class="user-name">').text(userName));

        video = $('<video playsinline>').attr('id', videoId)
            .css({
              'border-color': user.colorId,
              'width': videoSizes.small,
              'max-height': videoSizes.small,
            })
            .on({
              loadedmetadata: () => {
                self.addInterface(userId);
              },
            })
            .appendTo(videoContainer)[0];

        video.autoplay = true;
        if (isLocal) {
          videoContainer.addClass('local-user');
          video.muted = true;
        }
        self.addInterface(userId);
      }
      if (stream) {
        attachMediaStream(video, stream);
      } else if (video) {
        $(video).parent()
            .remove();
      }
    },
    addInterface: (userId) => {
      if (!userId) return false;
      const isLocal = userId === Helper.getUserId();
      const videoId = `video_${userId.replace(/\./g, '_')}`;
      const $video = $(`#${videoId}`);

      const $mute = $("<span class='interface-btn audio-btn buttonicon'>")
          .attr('title', 'Mute')
          .on({
            click: () => {
              let muted;
              if (isLocal) {
                muted = self.toggleMuted();
              } else {
                $video[0].muted = !$video[0].muted;
                muted = $video[0].muted;
              }
              $mute.attr('title', muted ? 'Unmute' : 'Mute').toggleClass('muted', muted);
            },
          });

      let videoEnabled = true;
      let $disableVideo;
      if (isLocal) {
        $disableVideo = $("<span class='interface-btn video-btn buttonicon'>")
            .attr('title', 'Disable video')
            .on('click', function () {
              self.toggleVideo();
              videoEnabled = !videoEnabled;
              const title = videoEnabled ? 'Disable video' : 'Enable video';
              $(this).attr('title', title)
                  .toggleClass('off', !videoEnabled);
            });
      }

      let videoEnlarged = false;
      const $largeVideo = $("<span class='interface-btn enlarge-btn buttonicon'>")
          .attr('title', 'Make video larger')
          .on('click', function () {
            videoEnlarged = !videoEnlarged;

            if (videoEnlarged) {
              enlargedVideos.add(userId);
            } else {
              enlargedVideos.delete(userId);
            }

            const title = videoEnlarged ? 'Make video smaller' : 'Make video larger';
            $(this).attr('title', title)
                .toggleClass('large', videoEnlarged);

            const videoSize = $(document).find('#wrtc_modal .ndbtn.btn_enlarge')
                .hasClass('large') ? videoSizes.large : videoSizes.small;

            $video.parent().css({'width': videoSize, 'max-height': videoSize});
            $video.css({'width': videoSize, 'max-height': videoSize});
          });

      if ($(document).find('#wrtc_modal .ndbtn.btn_enlarge')
          .hasClass('large')) {
        $video.parent().css({
          'width': videoSizes.large, 'max-height': videoSizes.large,
        });
        $video.css({'width': videoSizes.large, 'max-height': videoSizes.large});
      }

      if (isLocal) localVideoElement = $video;

      const $networkLatency = $("<div class='latency'></div>");

      $(`#interface_${videoId}`).remove();
      $("<div class='interface-container'>").attr('id', `interface_${videoId}`)
          .append($mute)
          .append($disableVideo)
          .append($largeVideo)
          .append($networkLatency)
          .insertAfter($video);
      self.changeAudioDestination();
    },
    // Sends a stat to the back end. `statName` must be in the
    // approved list on the server side.
    sendErrorStat: (statName) => {
      const msg = {component: 'pad', type: 'STATS', data: {statName, type: 'RTC_MESSAGE'}};
      socket.emit('acceptNewCall', padId, window.headerId);
      socket.emit('message', msg);
    },
    sendMessage: (to, data, socketIdTo) => {
      socket.emit('RTC_MESSAGE', {
        type: 'RTC_MESSAGE',
        payload: {data, to, padId, from: Helper.getUserId(), socket: {from: socket.id, to: socketIdTo}},
      }, (data) => {
        // console.log('coming data', data);
      });
      // deprecated function
      // self._pad.collabClient.sendMessage({
      // type: 'RTC_MESSAGE',
      //   payload: {data, to},
      // });
    },
    receiveMessage: (msg) => {
      const peer = msg.from; // userId
      const data = msg.data;
      const type = data.type;
      if (peer === Helper.getUserId()) {
        // console.info('ignore own messages');
        return;
      }
      /*
      if (type != 'icecandidate')
        console.info('receivedMessage', 'peer', peer, 'type', type, 'data', data);
      */
      if (type === 'hangup') {
        self.hangup(peer, true);
      } else if (type === 'offer') {
        if (pc[peer]) {
          self.hangup(peer, true);
          self.createPeerConnection(peer, data.headerId);
        } else {
          self.createPeerConnection(peer, data.headerId);
        }
        if (Helper.wrtcStore.localstream) {
          if (pc[peer].getLocalStreams) {
            if (!pc[peer].getLocalStreams().length) {
              Helper.wrtcStore.localstream.getTracks().forEach((track) => {
                pc[peer].addTrack(track, Helper.wrtcStore.localstream);
              });

              // pc[peer].addStream(localStream);
            }
          } else if (pc[peer].localStreams) {
            if (!pc[peer].localStreams.length) {
              Helper.wrtcStore.localstream.getTracks().forEach((track) => {
                pc[peer].addTrack(track, Helper.wrtcStore.localstream);
              });
              // pc[peer].addStream(localStream);
            }
          }
        }
        const offer = new RTCSessionDescription(data.offer);
        pc[peer].setRemoteDescription(offer, () => {
          pc[peer].createAnswer((desc) => {
            desc.sdp = cleanupSdp(desc.sdp);
            pc[peer].setLocalDescription(desc, () => {
              self.sendMessage(peer, {type: 'answer', answer: desc, headerId: data.headerId});
            }, logError);
          }, logError, sdpConstraints);
        }, logError);
      } else if (type === 'answer') {
        if (pc[peer]) {
          const answer = new RTCSessionDescription(data.answer);
          pc[peer].setRemoteDescription(answer, () => {
            // console.log("call setRemoteDescription", new Date().getSeconds())
          }, logError);
        }
      } else if (type === 'icecandidate') {
        if (pc[peer]) {
          const candidate = new RTCIceCandidate(data.candidate);
          const p = pc[peer].addIceCandidate(candidate);
          if (p) {
            p.then(() => {
              // Do stuff when the candidate is successfully passed to the ICE agent
            }).catch(() => {
              console.error('[wrtc]: Failure during addIceCandidate()', data);
            });
          }
        }
      } else {
        console.error('[wrtc]: unknown message', data);
      }
    },
    hangupAll: (_headerId) => {
      Object.keys(pc).forEach((userId) => {
        self.hangup(userId, true, _headerId);
      });
    },
    hangup: (userId, notify = false, headerId) => {
      notify = userId ? true : notify;
      if (pc[userId] && userId !== Helper.getUserId()) {
        self.setStream(userId, '');
        pc[userId].close();
        delete pc[userId];
        if (notify) self.sendMessage(userId, {type: 'hangup', headerId});
      }
    },
    call: (userId, headerId) => {
      if (!Helper.wrtcStore.localstream) {
        // callQueue.push(userId);
        return;
      }
      let constraints = {optional: [], mandatory: {}};
      // temporary measure to remove Moz* constraints in Chrome
      if (webrtcDetectedBrowser === 'chrome') {
        for (const prop in constraints.mandatory) {
          if (prop.indexOf('Moz') !== -1) {
            delete constraints.mandatory[prop];
          }
        }
      }
      constraints = mergeConstraints(constraints, sdpConstraints);

      if (!pc[userId]) self.createPeerConnection(userId, headerId);

      // pc[userId].addStream(localStream);

      Helper.wrtcStore.localstream.getTracks().forEach((track) => {
        pc[userId].addTrack(track, Helper.wrtcStore.localstream);
      });

      pc[userId].createOffer((desc) => {
        desc.sdp = cleanupSdp(desc.sdp);
        pc[userId].setLocalDescription(desc, () => {
          self.sendMessage(userId, {type: 'offer', offer: desc, headerId});
        }, logError);
      }, logError, constraints);
    },
    createPeerConnection: (userId, headerId) => {
      if (pc[userId]) {
        console.warn('WARNING creating PC connection even though one exists', userId);
      }
      pc[userId] = new RTCPeerConnection(pcConfig, pcConstraints);
      pc[userId].onicecandidate = (event) => {
        if (event.candidate) {
          self.sendMessage(userId, {
            type: 'icecandidate',
            headerId,
            candidate: event.candidate,
          });
        } else {
          reconnected = 0;
          socket.emit('acceptNewCall', padId, window.headerId);
        }
      };

      pc[userId].oniceconnectionstatechange = () => {
        console.info('[wrtc]: ICE state: ', pc[userId], pc[userId].iceConnectionState);
      };

      pc[userId].ontrack = (event) => {
        console.info(event, 'ontrack');
        remoteStream[userId] = event.streams[0];
        self.setStream(userId, event.streams[0]);
      };

      pc[userId].onremovestream = () => {
        self.setStream(userId, '');
      };
    },
    audioVideoInputChange: async () => {
      await Helper.stopStreaming();
      self.getUserMedia(window.headerId);
    },
    attachSinkId: (element, sinkId) => {
      // Attach audio output device to video element using device/sink ID.
      if (element && element[0] && typeof element[0].sinkId !== 'undefined') {
        element[0].setSinkId(sinkId).then(() => {
          // console.info(`Success, audio output device attached: ${sinkId}`);
        }).catch((error) => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `
                You need to use HTTPS for selecting audio output device: ${error}
              `;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          audioOutputSelect.selectedIndex = 0;
        });
      } else {
        console.warn('Browser does not support output device selection.');
        $(document).find('.select.audioOutputSec')
            .hide();
      }
    },
    changeAudioDestination: () => {
      const cls = '.select.audioOutputSec select';
      const audioOutputSelect = document.querySelector(cls);
      if (!audioOutputSelect) return;
      const audioDestination = audioOutputSelect.value;
      const videoElement = localVideoElement;
      self.attachSinkId(videoElement, audioDestination);
    },
    getUserMedia: async (headerId) => {
      $('#wrtc_modal #networkError')
          .removeClass('active')
          .hide();

      // window.navigator.mediaDevices
      //     .getUserMedia(mediaConstraints)
      //     .then((stream) => {
      //       Helper.wrtcStore.localstream = stream;
      //       self.setStream(Helper.getUserId(), stream);
      //       self._pad.collabClient.getConnectedUsers().forEach((user) => {
      //         if (user.userId !== Helper.getUserId()) {
      //           if (pc[user.userId]) {
      //             self.hangup(user.userId, false, headerId);
      //           }
      //           self.call(user.userId, headerId);
      //         }
      //       });
      //     })
      //     .catch((err) => {
      //       self.showUserMediaError(err, Helper.getUserId(), headerId);
      //     });

      const stream = await videoChat.isUserMediaAvailable()
          .catch(async (err) => {
            console.error(err);
            Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', 'VIDEO');
            Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', false);
            await Helper.stopStreaming();
            // socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
            //   gatewayUserLeave(_userData, roomInfo);
            // });
            WRTC.showUserMediaError(err, Helper.getUserId(), headerId);
          });


      Helper.wrtcStore.localstream = stream;
      // if (!stream) {
      //   stream = await videoChat.isUserMediaAvailable()
      //   Helper.wrtcStore.localstream = stream
      // }
      self.setStream(Helper.getUserId(), stream);
      self._pad.collabClient.getConnectedUsers().forEach((user) => {
        if (user.userId !== Helper.getUserId()) {
          if (pc[user.userId]) {
            self.hangup(user.userId, false, headerId);
          }
          self.call(user.userId, headerId);
        }
      });
    },
    attemptToReconnect: () => {
      reconnected++;
      console.info('[wrtc]: Try reconnecting', reconnected, attemptReconnect);
      if (attemptReconnect <= reconnected) {
        socket.emit('acceptNewCall', padId, window.headerId);
        throw new Error('[wrtc]: please reload the video chat and try again to connect!');
      }
      setTimeout(() => {
        console.info('[wrtc]: reconnecting...');
        self.getUserMedia(window.headerId);
      }, randomIntFromInterval(200, 1000));
    },
  };

  self.pc = pc;
  return self;
})();
