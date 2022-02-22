(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */

  'use strict';

  var _adapter_factory = require('./adapter_factory.js');

  var adapter = (0, _adapter_factory.adapterFactory)({ window: typeof window === 'undefined' ? undefined : window });
  module.exports = adapter; // this is the difference from adapter_core.

  },{"./adapter_factory.js":2}],2:[function(require,module,exports){
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.adapterFactory = adapterFactory;

  var _utils = require('./utils');

  var utils = _interopRequireWildcard(_utils);

  var _chrome_shim = require('./chrome/chrome_shim');

  var chromeShim = _interopRequireWildcard(_chrome_shim);

  var _firefox_shim = require('./firefox/firefox_shim');

  var firefoxShim = _interopRequireWildcard(_firefox_shim);

  var _safari_shim = require('./safari/safari_shim');

  var safariShim = _interopRequireWildcard(_safari_shim);

  var _common_shim = require('./common_shim');

  var commonShim = _interopRequireWildcard(_common_shim);

  var _sdp = require('sdp');

  var sdp = _interopRequireWildcard(_sdp);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  // Shimming starts here.
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  function adapterFactory() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        window = _ref.window;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      shimChrome: true,
      shimFirefox: true,
      shimSafari: true
    };

    // Utils.
    var logging = utils.log;
    var browserDetails = utils.detectBrowser(window);

    var adapter = {
      browserDetails: browserDetails,
      commonShim: commonShim,
      extractVersion: utils.extractVersion,
      disableLog: utils.disableLog,
      disableWarnings: utils.disableWarnings,
      // Expose sdp as a convenience. For production apps include directly.
      sdp: sdp
    };

    // Shim browser if found.
    switch (browserDetails.browser) {
      case 'chrome':
        if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
          logging('Chrome shim is not included in this adapter release.');
          return adapter;
        }
        if (browserDetails.version === null) {
          logging('Chrome shim can not determine version, not shimming.');
          return adapter;
        }
        logging('adapter.js shimming chrome.');
        // Export to the adapter global object visible in the browser.
        adapter.browserShim = chromeShim;

        // Must be called before shimPeerConnection.
        commonShim.shimAddIceCandidateNullOrEmpty(window, browserDetails);
        commonShim.shimParameterlessSetLocalDescription(window, browserDetails);

        chromeShim.shimGetUserMedia(window, browserDetails);
        chromeShim.shimMediaStream(window, browserDetails);
        chromeShim.shimPeerConnection(window, browserDetails);
        chromeShim.shimOnTrack(window, browserDetails);
        chromeShim.shimAddTrackRemoveTrack(window, browserDetails);
        chromeShim.shimGetSendersWithDtmf(window, browserDetails);
        chromeShim.shimGetStats(window, browserDetails);
        chromeShim.shimSenderReceiverGetStats(window, browserDetails);
        chromeShim.fixNegotiationNeeded(window, browserDetails);

        commonShim.shimRTCIceCandidate(window, browserDetails);
        commonShim.shimConnectionState(window, browserDetails);
        commonShim.shimMaxMessageSize(window, browserDetails);
        commonShim.shimSendThrowTypeError(window, browserDetails);
        commonShim.removeExtmapAllowMixed(window, browserDetails);
        break;
      case 'firefox':
        if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
          logging('Firefox shim is not included in this adapter release.');
          return adapter;
        }
        logging('adapter.js shimming firefox.');
        // Export to the adapter global object visible in the browser.
        adapter.browserShim = firefoxShim;

        // Must be called before shimPeerConnection.
        commonShim.shimAddIceCandidateNullOrEmpty(window, browserDetails);
        commonShim.shimParameterlessSetLocalDescription(window, browserDetails);

        firefoxShim.shimGetUserMedia(window, browserDetails);
        firefoxShim.shimPeerConnection(window, browserDetails);
        firefoxShim.shimOnTrack(window, browserDetails);
        firefoxShim.shimRemoveStream(window, browserDetails);
        firefoxShim.shimSenderGetStats(window, browserDetails);
        firefoxShim.shimReceiverGetStats(window, browserDetails);
        firefoxShim.shimRTCDataChannel(window, browserDetails);
        firefoxShim.shimAddTransceiver(window, browserDetails);
        firefoxShim.shimGetParameters(window, browserDetails);
        firefoxShim.shimCreateOffer(window, browserDetails);
        firefoxShim.shimCreateAnswer(window, browserDetails);

        commonShim.shimRTCIceCandidate(window, browserDetails);
        commonShim.shimConnectionState(window, browserDetails);
        commonShim.shimMaxMessageSize(window, browserDetails);
        commonShim.shimSendThrowTypeError(window, browserDetails);
        break;
      case 'safari':
        if (!safariShim || !options.shimSafari) {
          logging('Safari shim is not included in this adapter release.');
          return adapter;
        }
        logging('adapter.js shimming safari.');
        // Export to the adapter global object visible in the browser.
        adapter.browserShim = safariShim;

        // Must be called before shimCallbackAPI.
        commonShim.shimAddIceCandidateNullOrEmpty(window, browserDetails);
        commonShim.shimParameterlessSetLocalDescription(window, browserDetails);

        safariShim.shimRTCIceServerUrls(window, browserDetails);
        safariShim.shimCreateOfferLegacy(window, browserDetails);
        safariShim.shimCallbacksAPI(window, browserDetails);
        safariShim.shimLocalStreamsAPI(window, browserDetails);
        safariShim.shimRemoteStreamsAPI(window, browserDetails);
        safariShim.shimTrackEventTransceiver(window, browserDetails);
        safariShim.shimGetUserMedia(window, browserDetails);
        safariShim.shimAudioContext(window, browserDetails);

        commonShim.shimRTCIceCandidate(window, browserDetails);
        commonShim.shimMaxMessageSize(window, browserDetails);
        commonShim.shimSendThrowTypeError(window, browserDetails);
        commonShim.removeExtmapAllowMixed(window, browserDetails);
        break;
      default:
        logging('Unsupported browser!');
        break;
    }

    return adapter;
  }

  // Browser shims.

  },{"./chrome/chrome_shim":3,"./common_shim":6,"./firefox/firefox_shim":7,"./safari/safari_shim":10,"./utils":11,"sdp":12}],3:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.shimGetDisplayMedia = exports.shimGetUserMedia = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _getusermedia = require('./getusermedia');

  Object.defineProperty(exports, 'shimGetUserMedia', {
    enumerable: true,
    get: function get() {
      return _getusermedia.shimGetUserMedia;
    }
  });

  var _getdisplaymedia = require('./getdisplaymedia');

  Object.defineProperty(exports, 'shimGetDisplayMedia', {
    enumerable: true,
    get: function get() {
      return _getdisplaymedia.shimGetDisplayMedia;
    }
  });
  exports.shimMediaStream = shimMediaStream;
  exports.shimOnTrack = shimOnTrack;
  exports.shimGetSendersWithDtmf = shimGetSendersWithDtmf;
  exports.shimGetStats = shimGetStats;
  exports.shimSenderReceiverGetStats = shimSenderReceiverGetStats;
  exports.shimAddTrackRemoveTrackWithNative = shimAddTrackRemoveTrackWithNative;
  exports.shimAddTrackRemoveTrack = shimAddTrackRemoveTrack;
  exports.shimPeerConnection = shimPeerConnection;
  exports.fixNegotiationNeeded = fixNegotiationNeeded;

  var _utils = require('../utils.js');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function shimMediaStream(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  }

  function shimOnTrack(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && !('ontrack' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function get() {
          return this._ontrack;
        },
        set: function set(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        },

        enumerable: true,
        configurable: true
      });
      var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        var _this = this;

        if (!this._ontrackpoly) {
          this._ontrackpoly = function (e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function (te) {
              var receiver = void 0;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = _this.getReceivers().find(function (r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = { track: te.track };
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = { receiver: receiver };
              event.streams = [e.stream];
              _this.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function (track) {
              var receiver = void 0;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = _this.getReceivers().find(function (r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = { track: track };
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = { receiver: receiver };
              event.streams = [e.stream];
              _this.dispatchEvent(event);
            });
          };
          this.addEventListener('addstream', this._ontrackpoly);
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
    } else {
      // even if RTCRtpTransceiver is in window, it is only used and
      // emitted in unified-plan. Unfortunately this means we need
      // to unconditionally wrap the event.
      utils.wrapPeerConnectionEvent(window, 'track', function (e) {
        if (!e.transceiver) {
          Object.defineProperty(e, 'transceiver', { value: { receiver: e.receiver } });
        }
        return e;
      });
    }
  }

  function shimGetSendersWithDtmf(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && !('getSenders' in window.RTCPeerConnection.prototype) && 'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function shimSenderWithDtmf(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
          var sender = origAddTrack.apply(this, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(this, track);
            this._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
          origRemoveTrack.apply(this, arguments);
          var idx = this._senders.indexOf(sender);
          if (idx !== -1) {
            this._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        var _this2 = this;

        this._senders = this._senders || [];
        origAddStream.apply(this, [stream]);
        stream.getTracks().forEach(function (track) {
          _this2._senders.push(shimSenderWithDtmf(_this2, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        var _this3 = this;

        this._senders = this._senders || [];
        origRemoveStream.apply(this, [stream]);

        stream.getTracks().forEach(function (track) {
          var sender = _this3._senders.find(function (s) {
            return s.track === track;
          });
          if (sender) {
            // remove sender
            _this3._senders.splice(_this3._senders.indexOf(sender), 1);
          }
        });
      };
    } else if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && 'getSenders' in window.RTCPeerConnection.prototype && 'createDTMFSender' in window.RTCPeerConnection.prototype && window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        var _this4 = this;

        var senders = origGetSenders.apply(this, []);
        senders.forEach(function (sender) {
          return sender._pc = _this4;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function get() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  }

  function shimGetStats(window) {
    if (!window.RTCPeerConnection) {
      return;
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function getStats() {
      var _this5 = this;

      var _arguments = Array.prototype.slice.call(arguments),
          selector = _arguments[0],
          onSucc = _arguments[1],
          onErr = _arguments[2];

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.


      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function fixChromeStats_(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function (report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function (name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function makeMapStats(stats) {
        return new Map(Object.keys(stats).map(function (key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function successCallbackWrapper_(response) {
          onSucc(makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_, selector]);
      }

      // promise-support
      return new Promise(function (resolve, reject) {
        origGetStats.apply(_this5, [function (response) {
          resolve(makeMapStats(fixChromeStats_(response)));
        }, reject]);
      }).then(onSucc, onErr);
    };
  }

  function shimSenderReceiverGetStats(window) {
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender && window.RTCRtpReceiver)) {
      return;
    }

    // shim sender stats.
    if (!('getStats' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window.RTCPeerConnection.prototype.getSenders = function getSenders() {
          var _this6 = this;

          var senders = origGetSenders.apply(this, []);
          senders.forEach(function (sender) {
            return sender._pc = _this6;
          });
          return senders;
        };
      }

      var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window.RTCPeerConnection.prototype.addTrack = function addTrack() {
          var sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window.RTCRtpSender.prototype.getStats = function getStats() {
        var sender = this;
        return this._pc.getStats().then(function (result) {
          return (
            /* Note: this will include stats of all senders that
             *   send a track with the same id as sender.track as
             *   it is not possible to identify the RTCRtpSender.
             */
            utils.filterStats(result, sender.track, true)
          );
        });
      };
    }

    // shim receiver stats.
    if (!('getStats' in window.RTCRtpReceiver.prototype)) {
      var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
          var _this7 = this;

          var receivers = origGetReceivers.apply(this, []);
          receivers.forEach(function (receiver) {
            return receiver._pc = _this7;
          });
          return receivers;
        };
      }
      utils.wrapPeerConnectionEvent(window, 'track', function (e) {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window.RTCRtpReceiver.prototype.getStats = function getStats() {
        var receiver = this;
        return this._pc.getStats().then(function (result) {
          return utils.filterStats(result, receiver.track, false);
        });
      };
    }

    if (!('getStats' in window.RTCRtpSender.prototype && 'getStats' in window.RTCRtpReceiver.prototype)) {
      return;
    }

    // shim RTCPeerConnection.getStats(track).
    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function getStats() {
      if (arguments.length > 0 && arguments[0] instanceof window.MediaStreamTrack) {
        var track = arguments[0];
        var sender = void 0;
        var receiver = void 0;
        var err = void 0;
        this.getSenders().forEach(function (s) {
          if (s.track === track) {
            if (sender) {
              err = true;
            } else {
              sender = s;
            }
          }
        });
        this.getReceivers().forEach(function (r) {
          if (r.track === track) {
            if (receiver) {
              err = true;
            } else {
              receiver = r;
            }
          }
          return r.track === track;
        });
        if (err || sender && receiver) {
          return Promise.reject(new DOMException('There are more than one sender or receiver for the track.', 'InvalidAccessError'));
        } else if (sender) {
          return sender.getStats();
        } else if (receiver) {
          return receiver.getStats();
        }
        return Promise.reject(new DOMException('There is no sender or receiver for the track.', 'InvalidAccessError'));
      }
      return origGetStats.apply(this, arguments);
    };
  }

  function shimAddTrackRemoveTrackWithNative(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      var _this8 = this;

      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function (streamId) {
        return _this8._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      var _this9 = this;

      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function (track) {
        var alreadyExists = _this9.getSenders().find(function (s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.', 'InvalidAccessError');
        }
      });
      var existingSenders = this.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = this.getSenders().filter(function (newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      var _this10 = this;

      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function (streamId) {
          var idx = _this10._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            _this10._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (_this10._shimmedLocalStreams[streamId].length === 1) {
            delete _this10._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  }

  function shimAddTrackRemoveTrack(window, browserDetails) {
    if (!window.RTCPeerConnection) {
      return;
    }
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
      return shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype.getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      var _this11 = this;

      var nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map(function (stream) {
        return _this11._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      var _this12 = this;

      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};

      stream.getTracks().forEach(function (track) {
        var alreadyExists = _this12.getSenders().find(function (s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.', 'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!this._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(this, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};

      origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
      delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
      delete this._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      var _this13 = this;

      if (this.signalingState === 'closed') {
        throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 || !streams[0].getTracks().find(function (t) {
        return t === track;
      })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException('The adapter.js addTrack polyfill only supports a single ' + ' stream which is associated with the specified track.', 'NotSupportedError');
      }

      var alreadyExists = this.getSenders().find(function (s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.', 'InvalidAccessError');
      }

      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      var oldStream = this._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function () {
          _this13.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        this.addStream(newStream);
      }
      return this.getSenders().find(function (s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'), externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function (internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'), internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function (method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      var methodObj = _defineProperty({}, method, function () {
        var _this14 = this;

        var args = arguments;
        var isLegacyCall = arguments.length && typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(this, [function (description) {
            var desc = replaceInternalStreamId(_this14, description);
            args[0].apply(null, [desc]);
          }, function (err) {
            if (args[1]) {
              args[1].apply(null, err);
            }
          }, arguments[2]]);
        }
        return nativeMethod.apply(this, arguments).then(function (description) {
          return replaceInternalStreamId(_this14, description);
        });
      });
      window.RTCPeerConnection.prototype[method] = methodObj[method];
    });

    var origSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }
      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype, 'localDescription', {
      get: function get() {
        var description = origLocalDescription.get.apply(this);
        if (description.type === '') {
          return description;
        }
        return replaceInternalStreamId(this, description);
      }
    });

    window.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      var _this15 = this;

      if (this.signalingState === 'closed') {
        throw new DOMException('The RTCPeerConnection\'s signalingState is \'closed\'.', 'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' + 'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === this;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.', 'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      this._streams = this._streams || {};
      var stream = void 0;
      Object.keys(this._streams).forEach(function (streamid) {
        var hasTrack = _this15._streams[streamid].getTracks().find(function (track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = _this15._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          this.removeStream(this._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        this.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  }

  function shimPeerConnection(window, browserDetails) {
    if (!window.RTCPeerConnection && window.webkitRTCPeerConnection) {
      // very basic support for old versions.
      window.RTCPeerConnection = window.webkitRTCPeerConnection;
    }
    if (!window.RTCPeerConnection) {
      return;
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    if (browserDetails.version < 53) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        var methodObj = _defineProperty({}, method, function () {
          arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        });
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }
  }

  // Attempt to fix ONN in plan-b mode.
  function fixNegotiationNeeded(window, browserDetails) {
    utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function (e) {
      var pc = e.target;
      if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === 'plan-b') {
        if (pc.signalingState !== 'stable') {
          return;
        }
      }
      return e;
    });
  }

  },{"../utils.js":11,"./getdisplaymedia":4,"./getusermedia":5}],4:[function(require,module,exports){
  /*
   *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.shimGetDisplayMedia = shimGetDisplayMedia;
  function shimGetDisplayMedia(window, getSourceId) {
    if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }
    if (!window.navigator.mediaDevices) {
      return;
    }
    // getSourceId is a function that returns a promise resolving with
    // the sourceId of the screen/window/tab to be shared.
    if (typeof getSourceId !== 'function') {
      console.error('shimGetDisplayMedia: getSourceId argument is not ' + 'a function');
      return;
    }
    window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      return getSourceId(constraints).then(function (sourceId) {
        var widthSpecified = constraints.video && constraints.video.width;
        var heightSpecified = constraints.video && constraints.video.height;
        var frameRateSpecified = constraints.video && constraints.video.frameRate;
        constraints.video = {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxFrameRate: frameRateSpecified || 3
          }
        };
        if (widthSpecified) {
          constraints.video.mandatory.maxWidth = widthSpecified;
        }
        if (heightSpecified) {
          constraints.video.mandatory.maxHeight = heightSpecified;
        }
        return window.navigator.mediaDevices.getUserMedia(constraints);
      });
    };
  }

  },{}],5:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  exports.shimGetUserMedia = shimGetUserMedia;

  var _utils = require('../utils.js');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  var logging = utils.log;

  function shimGetUserMedia(window, browserDetails) {
    var navigator = window && window.navigator;

    if (!navigator.mediaDevices) {
      return;
    }

    var constraintsToChrome_ = function constraintsToChrome_(c) {
      if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) !== 'object' || c.mandatory || c.optional) {
        return c;
      }
      var cc = {};
      Object.keys(c).forEach(function (key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = _typeof(c[key]) === 'object' ? c[key] : { ideal: c[key] };
        if (r.exact !== undefined && typeof r.exact === 'number') {
          r.min = r.max = r.exact;
        }
        var oldname_ = function oldname_(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }
          return name === 'deviceId' ? 'sourceId' : name;
        };
        if (r.ideal !== undefined) {
          cc.optional = cc.optional || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[oldname_('min', key)] = r.ideal;
            cc.optional.push(oc);
            oc = {};
            oc[oldname_('max', key)] = r.ideal;
            cc.optional.push(oc);
          } else {
            oc[oldname_('', key)] = r.ideal;
            cc.optional.push(oc);
          }
        }
        if (r.exact !== undefined && typeof r.exact !== 'number') {
          cc.mandatory = cc.mandatory || {};
          cc.mandatory[oldname_('', key)] = r.exact;
        } else {
          ['min', 'max'].forEach(function (mix) {
            if (r[mix] !== undefined) {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_(mix, key)] = r[mix];
            }
          });
        }
      });
      if (c.advanced) {
        cc.optional = (cc.optional || []).concat(c.advanced);
      }
      return cc;
    };

    var shimConstraints_ = function shimConstraints_(constraints, func) {
      if (browserDetails.version >= 61) {
        return func(constraints);
      }
      constraints = JSON.parse(JSON.stringify(constraints));
      if (constraints && _typeof(constraints.audio) === 'object') {
        var remap = function remap(obj, a, b) {
          if (a in obj && !(b in obj)) {
            obj[b] = obj[a];
            delete obj[a];
          }
        };
        constraints = JSON.parse(JSON.stringify(constraints));
        remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
        remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
        constraints.audio = constraintsToChrome_(constraints.audio);
      }
      if (constraints && _typeof(constraints.video) === 'object') {
        // Shim facingMode for mobile & surface pro.
        var face = constraints.video.facingMode;
        face = face && ((typeof face === 'undefined' ? 'undefined' : _typeof(face)) === 'object' ? face : { ideal: face });
        var getSupportedFacingModeLies = browserDetails.version < 66;

        if (face && (face.exact === 'user' || face.exact === 'environment' || face.ideal === 'user' || face.ideal === 'environment') && !(navigator.mediaDevices.getSupportedConstraints && navigator.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
          delete constraints.video.facingMode;
          var matches = void 0;
          if (face.exact === 'environment' || face.ideal === 'environment') {
            matches = ['back', 'rear'];
          } else if (face.exact === 'user' || face.ideal === 'user') {
            matches = ['front'];
          }
          if (matches) {
            // Look for matches in label, or use last cam for back (typical).
            return navigator.mediaDevices.enumerateDevices().then(function (devices) {
              devices = devices.filter(function (d) {
                return d.kind === 'videoinput';
              });
              var dev = devices.find(function (d) {
                return matches.some(function (match) {
                  return d.label.toLowerCase().includes(match);
                });
              });
              if (!dev && devices.length && matches.includes('back')) {
                dev = devices[devices.length - 1]; // more likely the back cam
              }
              if (dev) {
                constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
              }
              constraints.video = constraintsToChrome_(constraints.video);
              logging('chrome: ' + JSON.stringify(constraints));
              return func(constraints);
            });
          }
        }
        constraints.video = constraintsToChrome_(constraints.video);
      }
      logging('chrome: ' + JSON.stringify(constraints));
      return func(constraints);
    };

    var shimError_ = function shimError_(e) {
      if (browserDetails.version >= 64) {
        return e;
      }
      return {
        name: {
          PermissionDeniedError: 'NotAllowedError',
          PermissionDismissedError: 'NotAllowedError',
          InvalidStateError: 'NotAllowedError',
          DevicesNotFoundError: 'NotFoundError',
          ConstraintNotSatisfiedError: 'OverconstrainedError',
          TrackStartError: 'NotReadableError',
          MediaDeviceFailedDueToShutdown: 'NotAllowedError',
          MediaDeviceKillSwitchOn: 'NotAllowedError',
          TabCaptureError: 'AbortError',
          ScreenCaptureError: 'AbortError',
          DeviceCaptureError: 'AbortError'
        }[e.name] || e.name,
        message: e.message,
        constraint: e.constraint || e.constraintName,
        toString: function toString() {
          return this.name + (this.message && ': ') + this.message;
        }
      };
    };

    var getUserMedia_ = function getUserMedia_(constraints, onSuccess, onError) {
      shimConstraints_(constraints, function (c) {
        navigator.webkitGetUserMedia(c, onSuccess, function (e) {
          if (onError) {
            onError(shimError_(e));
          }
        });
      });
    };
    navigator.getUserMedia = getUserMedia_.bind(navigator);

    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    if (navigator.mediaDevices.getUserMedia) {
      var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function (cs) {
        return shimConstraints_(cs, function (c) {
          return origGetUserMedia(c).then(function (stream) {
            if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
              stream.getTracks().forEach(function (track) {
                track.stop();
              });
              throw new DOMException('', 'NotFoundError');
            }
            return stream;
          }, function (e) {
            return Promise.reject(shimError_(e));
          });
        });
      };
    }
  }

  },{"../utils.js":11}],6:[function(require,module,exports){
  /*
   *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  exports.shimRTCIceCandidate = shimRTCIceCandidate;
  exports.shimMaxMessageSize = shimMaxMessageSize;
  exports.shimSendThrowTypeError = shimSendThrowTypeError;
  exports.shimConnectionState = shimConnectionState;
  exports.removeExtmapAllowMixed = removeExtmapAllowMixed;
  exports.shimAddIceCandidateNullOrEmpty = shimAddIceCandidateNullOrEmpty;
  exports.shimParameterlessSetLocalDescription = shimParameterlessSetLocalDescription;

  var _sdp = require('sdp');

  var _sdp2 = _interopRequireDefault(_sdp);

  var _utils = require('./utils');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  function shimRTCIceCandidate(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (!window.RTCIceCandidate || window.RTCIceCandidate && 'foundation' in window.RTCIceCandidate.prototype) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function RTCIceCandidate(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object' && args.candidate && args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
        var nativeCandidate = new NativeRTCIceCandidate(args);
        var parsedCandidate = _sdp2.default.parseCandidate(args.candidate);
        var augmentedCandidate = Object.assign(nativeCandidate, parsedCandidate);

        // Add a serializer that does not serialize the extra attributes.
        augmentedCandidate.toJSON = function toJSON() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment
          };
        };
        return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    utils.wrapPeerConnectionEvent(window, 'icecandidate', function (e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  }

  function shimMaxMessageSize(window, browserDetails) {
    if (!window.RTCPeerConnection) {
      return;
    }

    if (!('sctp' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
        get: function get() {
          return typeof this._sctp === 'undefined' ? null : this._sctp;
        }
      });
    }

    var sctpInDescription = function sctpInDescription(description) {
      if (!description || !description.sdp) {
        return false;
      }
      var sections = _sdp2.default.splitSections(description.sdp);
      sections.shift();
      return sections.some(function (mediaSection) {
        var mLine = _sdp2.default.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application' && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function getRemoteFirefoxVersion(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      var version = parseInt(match[1], 10);
      // Test for NaN (yes, this is ugly)
      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function getCanSendMaxMessageSize(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;
      if (browserDetails.browser === 'firefox') {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            // FF < 57 will send in 16 KiB chunks using the deprecated PPID
            // fragmentation.
            canSendMaxMessageSize = 16384;
          } else {
            // However, other FF (and RAWRTC) can reassemble PPID-fragmented
            // messages. Thus, supporting ~2 GiB when sending.
            canSendMaxMessageSize = 2147483637;
          }
        } else if (browserDetails.version < 60) {
          // Currently, all FF >= 57 will reset the remote maximum message size
          // to the default value when a data channel is created at a later
          // stage. :(
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
          canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
        } else {
          // FF >= 60 supports sending ~2 GiB
          canSendMaxMessageSize = 2147483637;
        }
      }
      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function getMaxMessageSize(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536;

      // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
      if (browserDetails.browser === 'firefox' && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = _sdp2.default.matchPrefix(description.sdp, 'a=max-message-size:');
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' && remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };

    var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      this._sctp = null;
      // Chrome decided to not expose .sctp in plan-b mode.
      // As usual, adapter.js has to do an 'ugly worakaround'
      // to cover up the mess.
      if (browserDetails.browser === 'chrome' && browserDetails.version >= 76) {
        var _getConfiguration = this.getConfiguration(),
            sdpSemantics = _getConfiguration.sdpSemantics;

        if (sdpSemantics === 'plan-b') {
          Object.defineProperty(this, 'sctp', {
            get: function get() {
              return typeof this._sctp === 'undefined' ? null : this._sctp;
            },

            enumerable: true,
            configurable: true
          });
        }
      }

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        var canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        var maxMessageSize = void 0;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        var sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get: function get() {
            return maxMessageSize;
          }
        });
        this._sctp = sctp;
      }

      return origSetRemoteDescription.apply(this, arguments);
    };
  }

  function shimSendThrowTypeError(window) {
    if (!(window.RTCPeerConnection && 'createDataChannel' in window.RTCPeerConnection.prototype)) {
      return;
    }

    // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

    function wrapDcSend(dc, pc) {
      var origDataChannelSend = dc.send;
      dc.send = function send() {
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;
        if (dc.readyState === 'open' && pc.sctp && length > pc.sctp.maxMessageSize) {
          throw new TypeError('Message too large (can send a maximum of ' + pc.sctp.maxMessageSize + ' bytes)');
        }
        return origDataChannelSend.apply(dc, arguments);
      };
    }
    var origCreateDataChannel = window.RTCPeerConnection.prototype.createDataChannel;
    window.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
      var dataChannel = origCreateDataChannel.apply(this, arguments);
      wrapDcSend(dataChannel, this);
      return dataChannel;
    };
    utils.wrapPeerConnectionEvent(window, 'datachannel', function (e) {
      wrapDcSend(e.channel, e.target);
      return e;
    });
  }

  /* shims RTCConnectionState by pretending it is the same as iceConnectionState.
   * See https://bugs.chromium.org/p/webrtc/issues/detail?id=6145#c12
   * for why this is a valid hack in Chrome. In Firefox it is slightly incorrect
   * since DTLS failures would be hidden. See
   * https://bugzilla.mozilla.org/show_bug.cgi?id=1265827
   * for the Firefox tracking bug.
   */
  function shimConnectionState(window) {
    if (!window.RTCPeerConnection || 'connectionState' in window.RTCPeerConnection.prototype) {
      return;
    }
    var proto = window.RTCPeerConnection.prototype;
    Object.defineProperty(proto, 'connectionState', {
      get: function get() {
        return {
          completed: 'connected',
          checking: 'connecting'
        }[this.iceConnectionState] || this.iceConnectionState;
      },

      enumerable: true,
      configurable: true
    });
    Object.defineProperty(proto, 'onconnectionstatechange', {
      get: function get() {
        return this._onconnectionstatechange || null;
      },
      set: function set(cb) {
        if (this._onconnectionstatechange) {
          this.removeEventListener('connectionstatechange', this._onconnectionstatechange);
          delete this._onconnectionstatechange;
        }
        if (cb) {
          this.addEventListener('connectionstatechange', this._onconnectionstatechange = cb);
        }
      },

      enumerable: true,
      configurable: true
    });

    ['setLocalDescription', 'setRemoteDescription'].forEach(function (method) {
      var origMethod = proto[method];
      proto[method] = function () {
        if (!this._connectionstatechangepoly) {
          this._connectionstatechangepoly = function (e) {
            var pc = e.target;
            if (pc._lastConnectionState !== pc.connectionState) {
              pc._lastConnectionState = pc.connectionState;
              var newEvent = new Event('connectionstatechange', e);
              pc.dispatchEvent(newEvent);
            }
            return e;
          };
          this.addEventListener('iceconnectionstatechange', this._connectionstatechangepoly);
        }
        return origMethod.apply(this, arguments);
      };
    });
  }

  function removeExtmapAllowMixed(window, browserDetails) {
    /* remove a=extmap-allow-mixed for webrtc.org < M71 */
    if (!window.RTCPeerConnection) {
      return;
    }
    if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
      return;
    }
    if (browserDetails.browser === 'safari' && browserDetails.version >= 605) {
      return;
    }
    var nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
      if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
        var sdp = desc.sdp.split('\n').filter(function (line) {
          return line.trim() !== 'a=extmap-allow-mixed';
        }).join('\n');
        // Safari enforces read-only-ness of RTCSessionDescription fields.
        if (window.RTCSessionDescription && desc instanceof window.RTCSessionDescription) {
          arguments[0] = new window.RTCSessionDescription({
            type: desc.type,
            sdp: sdp
          });
        } else {
          desc.sdp = sdp;
        }
      }
      return nativeSRD.apply(this, arguments);
    };
  }

  function shimAddIceCandidateNullOrEmpty(window, browserDetails) {
    // Support for addIceCandidate(null or undefined)
    // as well as addIceCandidate({candidate: "", ...})
    // https://bugs.chromium.org/p/chromium/issues/detail?id=978582
    // Note: must be called before other polyfills which change the signature.
    if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
      return;
    }
    var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
    if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
      return;
    }
    window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      // Firefox 68+ emits and processes {candidate: "", ...}, ignore
      // in older versions.
      // Native support for ignoring exists for Chrome M77+.
      // Safari ignores as well, exact version unknown but works in the same
      // version that also ignores addIceCandidate(null).
      if ((browserDetails.browser === 'chrome' && browserDetails.version < 78 || browserDetails.browser === 'firefox' && browserDetails.version < 68 || browserDetails.browser === 'safari') && arguments[0] && arguments[0].candidate === '') {
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }

  // Note: Make sure to call this ahead of APIs that modify
  // setLocalDescription.length
  function shimParameterlessSetLocalDescription(window, browserDetails) {
    if (!(window.RTCPeerConnection && window.RTCPeerConnection.prototype)) {
      return;
    }
    var nativeSetLocalDescription = window.RTCPeerConnection.prototype.setLocalDescription;
    if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
      return;
    }
    window.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
      var _this = this;

      var desc = arguments[0] || {};
      if ((typeof desc === 'undefined' ? 'undefined' : _typeof(desc)) !== 'object' || desc.type && desc.sdp) {
        return nativeSetLocalDescription.apply(this, arguments);
      }
      // The remaining steps should technically happen when SLD comes off the
      // RTCPeerConnection's operations chain (not ahead of going on it), but
      // this is too difficult to shim. Instead, this shim only covers the
      // common case where the operations chain is empty. This is imperfect, but
      // should cover many cases. Rationale: Even if we can't reduce the glare
      // window to zero on imperfect implementations, there's value in tapping
      // into the perfect negotiation pattern that several browsers support.
      desc = { type: desc.type, sdp: desc.sdp };
      if (!desc.type) {
        switch (this.signalingState) {
          case 'stable':
          case 'have-local-offer':
          case 'have-remote-pranswer':
            desc.type = 'offer';
            break;
          default:
            desc.type = 'answer';
            break;
        }
      }
      if (desc.sdp || desc.type !== 'offer' && desc.type !== 'answer') {
        return nativeSetLocalDescription.apply(this, [desc]);
      }
      var func = desc.type === 'offer' ? this.createOffer : this.createAnswer;
      return func.apply(this).then(function (d) {
        return nativeSetLocalDescription.apply(_this, [d]);
      });
    };
  }

  },{"./utils":11,"sdp":12}],7:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.shimGetDisplayMedia = exports.shimGetUserMedia = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var _getusermedia = require('./getusermedia');

  Object.defineProperty(exports, 'shimGetUserMedia', {
    enumerable: true,
    get: function get() {
      return _getusermedia.shimGetUserMedia;
    }
  });

  var _getdisplaymedia = require('./getdisplaymedia');

  Object.defineProperty(exports, 'shimGetDisplayMedia', {
    enumerable: true,
    get: function get() {
      return _getdisplaymedia.shimGetDisplayMedia;
    }
  });
  exports.shimOnTrack = shimOnTrack;
  exports.shimPeerConnection = shimPeerConnection;
  exports.shimSenderGetStats = shimSenderGetStats;
  exports.shimReceiverGetStats = shimReceiverGetStats;
  exports.shimRemoveStream = shimRemoveStream;
  exports.shimRTCDataChannel = shimRTCDataChannel;
  exports.shimAddTransceiver = shimAddTransceiver;
  exports.shimGetParameters = shimGetParameters;
  exports.shimCreateOffer = shimCreateOffer;
  exports.shimCreateAnswer = shimCreateAnswer;

  var _utils = require('../utils');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function shimOnTrack(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function get() {
          return { receiver: this.receiver };
        }
      });
    }
  }

  function shimPeerConnection(window, browserDetails) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !(window.RTCPeerConnection || window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    if (!window.RTCPeerConnection && window.mozRTCPeerConnection) {
      // very basic support for old versions.
      window.RTCPeerConnection = window.mozRTCPeerConnection;
    }

    if (browserDetails.version < 53) {
      // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'].forEach(function (method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        var methodObj = _defineProperty({}, method, function () {
          arguments[0] = new (method === 'addIceCandidate' ? window.RTCIceCandidate : window.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        });
        window.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function getStats() {
      var _arguments = Array.prototype.slice.call(arguments),
          selector = _arguments[0],
          onSucc = _arguments[1],
          onErr = _arguments[2];

      return nativeGetStats.apply(this, [selector || null]).then(function (stats) {
        if (browserDetails.version < 53 && !onSucc) {
          // Shim only promise getStats with spec-hyphens in type names
          // Leave callback version alone; misc old uses of forEach before Map
          try {
            stats.forEach(function (stat) {
              stat.type = modernStatsTypes[stat.type] || stat.type;
            });
          } catch (e) {
            if (e.name !== 'TypeError') {
              throw e;
            }
            // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
            stats.forEach(function (stat, i) {
              stats.set(i, Object.assign({}, stat, {
                type: modernStatsTypes[stat.type] || stat.type
              }));
            });
          }
        }
        return stats;
      }).then(onSucc, onErr);
    };
  }

  function shimSenderGetStats(window) {
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpSender.prototype) {
      return;
    }
    var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window.RTCPeerConnection.prototype.getSenders = function getSenders() {
        var _this = this;

        var senders = origGetSenders.apply(this, []);
        senders.forEach(function (sender) {
          return sender._pc = _this;
        });
        return senders;
      };
    }

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window.RTCPeerConnection.prototype.addTrack = function addTrack() {
        var sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window.RTCRtpSender.prototype.getStats = function getStats() {
      return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
    };
  }

  function shimReceiverGetStats(window) {
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection && window.RTCRtpSender)) {
      return;
    }
    if (window.RTCRtpSender && 'getStats' in window.RTCRtpReceiver.prototype) {
      return;
    }
    var origGetReceivers = window.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        var _this2 = this;

        var receivers = origGetReceivers.apply(this, []);
        receivers.forEach(function (receiver) {
          return receiver._pc = _this2;
        });
        return receivers;
      };
    }
    utils.wrapPeerConnectionEvent(window, 'track', function (e) {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window.RTCRtpReceiver.prototype.getStats = function getStats() {
      return this._pc.getStats(this.track);
    };
  }

  function shimRemoveStream(window) {
    if (!window.RTCPeerConnection || 'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      var _this3 = this;

      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function (sender) {
        if (sender.track && stream.getTracks().includes(sender.track)) {
          _this3.removeTrack(sender);
        }
      });
    };
  }

  function shimRTCDataChannel(window) {
    // rename DataChannel to RTCDataChannel (native fix in FF60):
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1173851
    if (window.DataChannel && !window.RTCDataChannel) {
      window.RTCDataChannel = window.DataChannel;
    }
  }

  function shimAddTransceiver(window) {
    // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
    // Firefox ignores the init sendEncodings options passed to addTransceiver
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
      return;
    }
    var origAddTransceiver = window.RTCPeerConnection.prototype.addTransceiver;
    if (origAddTransceiver) {
      window.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
        this.setParametersPromises = [];
        var initParameters = arguments[1];
        var shouldPerformCheck = initParameters && 'sendEncodings' in initParameters;
        if (shouldPerformCheck) {
          // If sendEncodings params are provided, validate grammar
          initParameters.sendEncodings.forEach(function (encodingParam) {
            if ('rid' in encodingParam) {
              var ridRegex = /^[a-z0-9]{0,16}$/i;
              if (!ridRegex.test(encodingParam.rid)) {
                throw new TypeError('Invalid RID value provided.');
              }
            }
            if ('scaleResolutionDownBy' in encodingParam) {
              if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1.0)) {
                throw new RangeError('scale_resolution_down_by must be >= 1.0');
              }
            }
            if ('maxFramerate' in encodingParam) {
              if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                throw new RangeError('max_framerate must be >= 0.0');
              }
            }
          });
        }
        var transceiver = origAddTransceiver.apply(this, arguments);
        if (shouldPerformCheck) {
          // Check if the init options were applied. If not we do this in an
          // asynchronous way and save the promise reference in a global object.
          // This is an ugly hack, but at the same time is way more robust than
          // checking the sender parameters before and after the createOffer
          // Also note that after the createoffer we are not 100% sure that
          // the params were asynchronously applied so we might miss the
          // opportunity to recreate offer.
          var sender = transceiver.sender;

          var params = sender.getParameters();
          if (!('encodings' in params) ||
          // Avoid being fooled by patched getParameters() below.
          params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
            params.encodings = initParameters.sendEncodings;
            sender.sendEncodings = initParameters.sendEncodings;
            this.setParametersPromises.push(sender.setParameters(params).then(function () {
              delete sender.sendEncodings;
            }).catch(function () {
              delete sender.sendEncodings;
            }));
          }
        }
        return transceiver;
      };
    }
  }

  function shimGetParameters(window) {
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCRtpSender)) {
      return;
    }
    var origGetParameters = window.RTCRtpSender.prototype.getParameters;
    if (origGetParameters) {
      window.RTCRtpSender.prototype.getParameters = function getParameters() {
        var params = origGetParameters.apply(this, arguments);
        if (!('encodings' in params)) {
          params.encodings = [].concat(this.sendEncodings || [{}]);
        }
        return params;
      };
    }
  }

  function shimCreateOffer(window) {
    // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
    // Firefox ignores the init sendEncodings options passed to addTransceiver
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
      return;
    }
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function createOffer() {
      var _this4 = this,
          _arguments2 = arguments;

      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(function () {
          return origCreateOffer.apply(_this4, _arguments2);
        }).finally(function () {
          _this4.setParametersPromises = [];
        });
      }
      return origCreateOffer.apply(this, arguments);
    };
  }

  function shimCreateAnswer(window) {
    // https://github.com/webrtcHacks/adapter/issues/998#issuecomment-516921647
    // Firefox ignores the init sendEncodings options passed to addTransceiver
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1396918
    if (!((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCPeerConnection)) {
      return;
    }
    var origCreateAnswer = window.RTCPeerConnection.prototype.createAnswer;
    window.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
      var _this5 = this,
          _arguments3 = arguments;

      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(function () {
          return origCreateAnswer.apply(_this5, _arguments3);
        }).finally(function () {
          _this5.setParametersPromises = [];
        });
      }
      return origCreateAnswer.apply(this, arguments);
    };
  }

  },{"../utils":11,"./getdisplaymedia":8,"./getusermedia":9}],8:[function(require,module,exports){
  /*
   *  Copyright (c) 2018 The adapter.js project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.shimGetDisplayMedia = shimGetDisplayMedia;
  function shimGetDisplayMedia(window, preferredMediaSource) {
    if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
      return;
    }
    if (!window.navigator.mediaDevices) {
      return;
    }
    window.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      if (!(constraints && constraints.video)) {
        var err = new DOMException('getDisplayMedia without video ' + 'constraints is undefined');
        err.name = 'NotFoundError';
        // from https://heycam.github.io/webidl/#idl-DOMException-error-names
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = { mediaSource: preferredMediaSource };
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return window.navigator.mediaDevices.getUserMedia(constraints);
    };
  }

  },{}],9:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  exports.shimGetUserMedia = shimGetUserMedia;

  var _utils = require('../utils');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  function shimGetUserMedia(window, browserDetails) {
    var navigator = window && window.navigator;
    var MediaStreamTrack = window && window.MediaStreamTrack;

    navigator.getUserMedia = function (constraints, onSuccess, onError) {
      // Replace Firefox 44+'s deprecation warning with unprefixed version.
      utils.deprecated('navigator.getUserMedia', 'navigator.mediaDevices.getUserMedia');
      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    };

    if (!(browserDetails.version > 55 && 'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
      var remap = function remap(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };

      var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function (c) {
        if ((typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object' && _typeof(c.audio) === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
          remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeGetUserMedia(c);
      };

      if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
        var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
        MediaStreamTrack.prototype.getSettings = function () {
          var obj = nativeGetSettings.apply(this, arguments);
          remap(obj, 'mozAutoGainControl', 'autoGainControl');
          remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
          return obj;
        };
      }

      if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
        var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
        MediaStreamTrack.prototype.applyConstraints = function (c) {
          if (this.kind === 'audio' && (typeof c === 'undefined' ? 'undefined' : _typeof(c)) === 'object') {
            c = JSON.parse(JSON.stringify(c));
            remap(c, 'autoGainControl', 'mozAutoGainControl');
            remap(c, 'noiseSuppression', 'mozNoiseSuppression');
          }
          return nativeApplyConstraints.apply(this, [c]);
        };
      }
    }
  }

  },{"../utils":11}],10:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  exports.shimLocalStreamsAPI = shimLocalStreamsAPI;
  exports.shimRemoteStreamsAPI = shimRemoteStreamsAPI;
  exports.shimCallbacksAPI = shimCallbacksAPI;
  exports.shimGetUserMedia = shimGetUserMedia;
  exports.shimConstraints = shimConstraints;
  exports.shimRTCIceServerUrls = shimRTCIceServerUrls;
  exports.shimTrackEventTransceiver = shimTrackEventTransceiver;
  exports.shimCreateOfferLegacy = shimCreateOfferLegacy;
  exports.shimAudioContext = shimAudioContext;

  var _utils = require('../utils');

  var utils = _interopRequireWildcard(_utils);

  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

  function shimLocalStreamsAPI(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        var _this = this;

        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (!this._localStreams.includes(stream)) {
          this._localStreams.push(stream);
        }
        // Try to emulate Chrome's behaviour of adding in audio-video order.
        // Safari orders by track id.
        stream.getAudioTracks().forEach(function (track) {
          return _addTrack.call(_this, track, stream);
        });
        stream.getVideoTracks().forEach(function (track) {
          return _addTrack.call(_this, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function addTrack(track) {
        var _this2 = this;

        for (var _len = arguments.length, streams = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          streams[_key - 1] = arguments[_key];
        }

        if (streams) {
          streams.forEach(function (stream) {
            if (!_this2._localStreams) {
              _this2._localStreams = [stream];
            } else if (!_this2._localStreams.includes(stream)) {
              _this2._localStreams.push(stream);
            }
          });
        }
        return _addTrack.apply(this, arguments);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        var _this3 = this;

        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var tracks = stream.getTracks();
        this.getSenders().forEach(function (sender) {
          if (tracks.includes(sender.track)) {
            _this3.removeTrack(sender);
          }
        });
      };
    }
  }

  function shimRemoteStreamsAPI(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function get() {
          return this._onaddstream;
        },
        set: function set(f) {
          var _this4 = this;

          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function (e) {
            e.streams.forEach(function (stream) {
              if (!_this4._remoteStreams) {
                _this4._remoteStreams = [];
              }
              if (_this4._remoteStreams.includes(stream)) {
                return;
              }
              _this4._remoteStreams.push(stream);
              var event = new Event('addstream');
              event.stream = stream;
              _this4.dispatchEvent(event);
            });
          });
        }
      });
      var origSetRemoteDescription = window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        var pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener('track', this._onaddstreampoly = function (e) {
            e.streams.forEach(function (stream) {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              var event = new Event('addstream');
              event.stream = stream;
              pc.dispatchEvent(event);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  }

  function shimCallbacksAPI(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var origCreateOffer = prototype.createOffer;
    var origCreateAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function createOffer(successCallback, failureCallback) {
      var options = arguments.length >= 2 ? arguments[2] : arguments[0];
      var promise = origCreateOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
      var options = arguments.length >= 2 ? arguments[2] : arguments[0];
      var promise = origCreateAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function withCallback(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function withCallback(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function withCallback(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  }

  function shimGetUserMedia(window) {
    var navigator = window && window.navigator;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // shim not needed in Safari 12.1
      var mediaDevices = navigator.mediaDevices;
      var _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
      navigator.mediaDevices.getUserMedia = function (constraints) {
        return _getUserMedia(shimConstraints(constraints));
      };
    }

    if (!navigator.getUserMedia && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.getUserMedia = function getUserMedia(constraints, cb, errcb) {
        navigator.mediaDevices.getUserMedia(constraints).then(cb, errcb);
      }.bind(navigator);
    }
  }

  function shimConstraints(constraints) {
    if (constraints && constraints.video !== undefined) {
      return Object.assign({}, constraints, { video: utils.compactObject(constraints.video) });
    }

    return constraints;
  }

  function shimRTCIceServerUrls(window) {
    if (!window.RTCPeerConnection) {
      return;
    }
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function RTCPeerConnection(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') && server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in OrigPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function get() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  }

  function shimTrackEventTransceiver(window) {
    // Add event.transceiver member over deprecated event.receiver
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.RTCTrackEvent && 'receiver' in window.RTCTrackEvent.prototype && !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function get() {
          return { receiver: this.receiver };
        }
      });
    }
  }

  function shimCreateOfferLegacy(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }
        var audioTransceiver = this.getTransceivers().find(function (transceiver) {
          return transceiver.receiver.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
          this.addTransceiver('audio', { direction: 'recvonly' });
        }

        if (typeof offerOptions.offerToReceiveVideo !== 'undefined') {
          // support bit values
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }
        var videoTransceiver = this.getTransceivers().find(function (transceiver) {
          return transceiver.receiver.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('sendonly');
            } else {
              videoTransceiver.direction = 'sendonly';
            }
          } else if (videoTransceiver.direction === 'recvonly') {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection('inactive');
            } else {
              videoTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
          this.addTransceiver('video', { direction: 'recvonly' });
        }
      }
      return origCreateOffer.apply(this, arguments);
    };
  }

  function shimAudioContext(window) {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== 'object' || window.AudioContext) {
      return;
    }
    window.AudioContext = window.webkitAudioContext;
  }

  },{"../utils":11}],11:[function(require,module,exports){
  /*
   *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
   *
   *  Use of this source code is governed by a BSD-style license
   *  that can be found in the LICENSE file in the root of the source
   *  tree.
   */
  /* eslint-env node */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  exports.extractVersion = extractVersion;
  exports.wrapPeerConnectionEvent = wrapPeerConnectionEvent;
  exports.disableLog = disableLog;
  exports.disableWarnings = disableWarnings;
  exports.log = log;
  exports.deprecated = deprecated;
  exports.detectBrowser = detectBrowser;
  exports.compactObject = compactObject;
  exports.walkStats = walkStats;
  exports.filterStats = filterStats;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var logDisabled_ = true;
  var deprecationWarnings_ = true;

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  function extractVersion(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  }

  // Wraps the peerconnection event eventNameToWrap in a function
  // which returns the modified event object (or false to prevent
  // the event).
  function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
    if (!window.RTCPeerConnection) {
      return;
    }
    var proto = window.RTCPeerConnection.prototype;
    var nativeAddEventListener = proto.addEventListener;
    proto.addEventListener = function (nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap) {
        return nativeAddEventListener.apply(this, arguments);
      }
      var wrappedCallback = function wrappedCallback(e) {
        var modifiedEvent = wrapper(e);
        if (modifiedEvent) {
          if (cb.handleEvent) {
            cb.handleEvent(modifiedEvent);
          } else {
            cb(modifiedEvent);
          }
        }
      };
      this._eventMap = this._eventMap || {};
      if (!this._eventMap[eventNameToWrap]) {
        this._eventMap[eventNameToWrap] = new Map();
      }
      this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
      return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
    };

    var nativeRemoveEventListener = proto.removeEventListener;
    proto.removeEventListener = function (nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
        return nativeRemoveEventListener.apply(this, arguments);
      }
      if (!this._eventMap[eventNameToWrap].has(cb)) {
        return nativeRemoveEventListener.apply(this, arguments);
      }
      var unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
      this._eventMap[eventNameToWrap].delete(cb);
      if (this._eventMap[eventNameToWrap].size === 0) {
        delete this._eventMap[eventNameToWrap];
      }
      if (Object.keys(this._eventMap).length === 0) {
        delete this._eventMap;
      }
      return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
    };

    Object.defineProperty(proto, 'on' + eventNameToWrap, {
      get: function get() {
        return this['_on' + eventNameToWrap];
      },
      set: function set(cb) {
        if (this['_on' + eventNameToWrap]) {
          this.removeEventListener(eventNameToWrap, this['_on' + eventNameToWrap]);
          delete this['_on' + eventNameToWrap];
        }
        if (cb) {
          this.addEventListener(eventNameToWrap, this['_on' + eventNameToWrap] = cb);
        }
      },

      enumerable: true,
      configurable: true
    });
  }

  function disableLog(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + (typeof bool === 'undefined' ? 'undefined' : _typeof(bool)) + '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return bool ? 'adapter.js logging disabled' : 'adapter.js logging enabled';
  }

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  function disableWarnings(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + (typeof bool === 'undefined' ? 'undefined' : _typeof(bool)) + '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  }

  function log() {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  }

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  function deprecated(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod + ' instead.');
  }

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  function detectBrowser(window) {
    // Returned result object.
    var result = { browser: null, version: null };

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    var navigator = window.navigator;


    if (navigator.mozGetUserMedia) {
      // Firefox.
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia || window.isSecureContext === false && window.webkitRTCPeerConnection && !window.RTCIceGatherer) {
      // Chrome, Chromium, Webview, Opera.
      // Version matches Chrome/WebRTC version.
      // Chrome 74 removed webkitGetUserMedia on http as well so we need the
      // more complicated fallback to webkitRTCPeerConnection.
      result.browser = 'chrome';
      result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
    } else if (window.RTCPeerConnection && navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
      // Safari.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1);
      result.supportsUnifiedPlan = window.RTCRtpTransceiver && 'currentDirection' in window.RTCRtpTransceiver.prototype;
    } else {
      // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }

  /**
   * Checks if something is an object.
   *
   * @param {*} val The something you want to check.
   * @return true if val is an object, false otherwise.
   */
  function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  /**
   * Remove all empty objects and undefined values
   * from a nested object -- an enhanced and vanilla version
   * of Lodash's `compact`.
   */
  function compactObject(data) {
    if (!isObject(data)) {
      return data;
    }

    return Object.keys(data).reduce(function (accumulator, key) {
      var isObj = isObject(data[key]);
      var value = isObj ? compactObject(data[key]) : data[key];
      var isEmptyObject = isObj && !Object.keys(value).length;
      if (value === undefined || isEmptyObject) {
        return accumulator;
      }
      return Object.assign(accumulator, _defineProperty({}, key, value));
    }, {});
  }

  /* iterates the stats graph recursively. */
  function walkStats(stats, base, resultSet) {
    if (!base || resultSet.has(base.id)) {
      return;
    }
    resultSet.set(base.id, base);
    Object.keys(base).forEach(function (name) {
      if (name.endsWith('Id')) {
        walkStats(stats, stats.get(base[name]), resultSet);
      } else if (name.endsWith('Ids')) {
        base[name].forEach(function (id) {
          walkStats(stats, stats.get(id), resultSet);
        });
      }
    });
  }

  /* filter getStats for a sender/receiver track. */
  function filterStats(result, track, outbound) {
    var streamStatsType = outbound ? 'outbound-rtp' : 'inbound-rtp';
    var filteredResult = new Map();
    if (track === null) {
      return filteredResult;
    }
    var trackStats = [];
    result.forEach(function (value) {
      if (value.type === 'track' && value.trackIdentifier === track.id) {
        trackStats.push(value);
      }
    });
    trackStats.forEach(function (trackStat) {
      result.forEach(function (stats) {
        if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
          walkStats(result, stats, filteredResult);
        }
      });
    });
    return filteredResult;
  }

  },{}],12:[function(require,module,exports){
  /* eslint-env node */
  'use strict';

  // SDP helpers.

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  var SDPUtils = {};

  // Generate an alphanumeric identifier for cname or mids.
  // TODO: use UUIDs instead? https://gist.github.com/jed/982883
  SDPUtils.generateIdentifier = function () {
    return Math.random().toString(36).substr(2, 10);
  };

  // The RTCP CNAME used by all peerconnections from the same JS.
  SDPUtils.localCName = SDPUtils.generateIdentifier();

  // Splits SDP into lines, dealing with both CRLF and LF.
  SDPUtils.splitLines = function (blob) {
    return blob.trim().split('\n').map(function (line) {
      return line.trim();
    });
  };
  // Splits SDP into sessionpart and mediasections. Ensures CRLF.
  SDPUtils.splitSections = function (blob) {
    var parts = blob.split('\nm=');
    return parts.map(function (part, index) {
      return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
    });
  };

  // Returns the session description.
  SDPUtils.getDescription = function (blob) {
    var sections = SDPUtils.splitSections(blob);
    return sections && sections[0];
  };

  // Returns the individual media sections.
  SDPUtils.getMediaSections = function (blob) {
    var sections = SDPUtils.splitSections(blob);
    sections.shift();
    return sections;
  };

  // Returns lines that start with a certain prefix.
  SDPUtils.matchPrefix = function (blob, prefix) {
    return SDPUtils.splitLines(blob).filter(function (line) {
      return line.indexOf(prefix) === 0;
    });
  };

  // Parses an ICE candidate line. Sample input:
  // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
  // rport 55996"
  // Input can be prefixed with a=.
  SDPUtils.parseCandidate = function (line) {
    var parts = void 0;
    // Parse both variants.
    if (line.indexOf('a=candidate:') === 0) {
      parts = line.substring(12).split(' ');
    } else {
      parts = line.substring(10).split(' ');
    }

    var candidate = {
      foundation: parts[0],
      component: { 1: 'rtp', 2: 'rtcp' }[parts[1]] || parts[1],
      protocol: parts[2].toLowerCase(),
      priority: parseInt(parts[3], 10),
      ip: parts[4],
      address: parts[4], // address is an alias for ip.
      port: parseInt(parts[5], 10),
      // skip parts[6] == 'typ'
      type: parts[7]
    };

    for (var i = 8; i < parts.length; i += 2) {
      switch (parts[i]) {
        case 'raddr':
          candidate.relatedAddress = parts[i + 1];
          break;
        case 'rport':
          candidate.relatedPort = parseInt(parts[i + 1], 10);
          break;
        case 'tcptype':
          candidate.tcpType = parts[i + 1];
          break;
        case 'ufrag':
          candidate.ufrag = parts[i + 1]; // for backward compatibility.
          candidate.usernameFragment = parts[i + 1];
          break;
        default:
          // extension handling, in particular ufrag. Don't overwrite.
          if (candidate[parts[i]] === undefined) {
            candidate[parts[i]] = parts[i + 1];
          }
          break;
      }
    }
    return candidate;
  };

  // Translates a candidate object into SDP candidate attribute.
  // This does not include the a= prefix!
  SDPUtils.writeCandidate = function (candidate) {
    var sdp = [];
    sdp.push(candidate.foundation);

    var component = candidate.component;
    if (component === 'rtp') {
      sdp.push(1);
    } else if (component === 'rtcp') {
      sdp.push(2);
    } else {
      sdp.push(component);
    }
    sdp.push(candidate.protocol.toUpperCase());
    sdp.push(candidate.priority);
    sdp.push(candidate.address || candidate.ip);
    sdp.push(candidate.port);

    var type = candidate.type;
    sdp.push('typ');
    sdp.push(type);
    if (type !== 'host' && candidate.relatedAddress && candidate.relatedPort) {
      sdp.push('raddr');
      sdp.push(candidate.relatedAddress);
      sdp.push('rport');
      sdp.push(candidate.relatedPort);
    }
    if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
      sdp.push('tcptype');
      sdp.push(candidate.tcpType);
    }
    if (candidate.usernameFragment || candidate.ufrag) {
      sdp.push('ufrag');
      sdp.push(candidate.usernameFragment || candidate.ufrag);
    }
    return 'candidate:' + sdp.join(' ');
  };

  // Parses an ice-options line, returns an array of option tags.
  // Sample input:
  // a=ice-options:foo bar
  SDPUtils.parseIceOptions = function (line) {
    return line.substr(14).split(' ');
  };

  // Parses a rtpmap line, returns RTCRtpCoddecParameters. Sample input:
  // a=rtpmap:111 opus/48000/2
  SDPUtils.parseRtpMap = function (line) {
    var parts = line.substr(9).split(' ');
    var parsed = {
      payloadType: parseInt(parts.shift(), 10) // was: id
    };

    parts = parts[0].split('/');

    parsed.name = parts[0];
    parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
    parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
    // legacy alias, got renamed back to channels in ORTC.
    parsed.numChannels = parsed.channels;
    return parsed;
  };

  // Generates a rtpmap line from RTCRtpCodecCapability or
  // RTCRtpCodecParameters.
  SDPUtils.writeRtpMap = function (codec) {
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    var channels = codec.channels || codec.numChannels || 1;
    return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate + (channels !== 1 ? '/' + channels : '') + '\r\n';
  };

  // Parses a extmap line (headerextension from RFC 5285). Sample input:
  // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
  // a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
  SDPUtils.parseExtmap = function (line) {
    var parts = line.substr(9).split(' ');
    return {
      id: parseInt(parts[0], 10),
      direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
      uri: parts[1]
    };
  };

  // Generates an extmap line from RTCRtpHeaderExtensionParameters or
  // RTCRtpHeaderExtension.
  SDPUtils.writeExtmap = function (headerExtension) {
    return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== 'sendrecv' ? '/' + headerExtension.direction : '') + ' ' + headerExtension.uri + '\r\n';
  };

  // Parses a fmtp line, returns dictionary. Sample input:
  // a=fmtp:96 vbr=on;cng=on
  // Also deals with vbr=on; cng=on
  SDPUtils.parseFmtp = function (line) {
    var parsed = {};
    var kv = void 0;
    var parts = line.substr(line.indexOf(' ') + 1).split(';');
    for (var j = 0; j < parts.length; j++) {
      kv = parts[j].trim().split('=');
      parsed[kv[0].trim()] = kv[1];
    }
    return parsed;
  };

  // Generates a fmtp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeFmtp = function (codec) {
    var line = '';
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.parameters && Object.keys(codec.parameters).length) {
      var params = [];
      Object.keys(codec.parameters).forEach(function (param) {
        if (codec.parameters[param] !== undefined) {
          params.push(param + '=' + codec.parameters[param]);
        } else {
          params.push(param);
        }
      });
      line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
    }
    return line;
  };

  // Parses a rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
  // a=rtcp-fb:98 nack rpsi
  SDPUtils.parseRtcpFb = function (line) {
    var parts = line.substr(line.indexOf(' ') + 1).split(' ');
    return {
      type: parts.shift(),
      parameter: parts.join(' ')
    };
  };

  // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
  SDPUtils.writeRtcpFb = function (codec) {
    var lines = '';
    var pt = codec.payloadType;
    if (codec.preferredPayloadType !== undefined) {
      pt = codec.preferredPayloadType;
    }
    if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
      // FIXME: special handling for trr-int?
      codec.rtcpFeedback.forEach(function (fb) {
        lines += 'a=rtcp-fb:' + pt + ' ' + fb.type + (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') + '\r\n';
      });
    }
    return lines;
  };

  // Parses a RFC 5576 ssrc media attribute. Sample input:
  // a=ssrc:3735928559 cname:something
  SDPUtils.parseSsrcMedia = function (line) {
    var sp = line.indexOf(' ');
    var parts = {
      ssrc: parseInt(line.substr(7, sp - 7), 10)
    };
    var colon = line.indexOf(':', sp);
    if (colon > -1) {
      parts.attribute = line.substr(sp + 1, colon - sp - 1);
      parts.value = line.substr(colon + 1);
    } else {
      parts.attribute = line.substr(sp + 1);
    }
    return parts;
  };

  // Parse a ssrc-group line (see RFC 5576). Sample input:
  // a=ssrc-group:semantics 12 34
  SDPUtils.parseSsrcGroup = function (line) {
    var parts = line.substr(13).split(' ');
    return {
      semantics: parts.shift(),
      ssrcs: parts.map(function (ssrc) {
        return parseInt(ssrc, 10);
      })
    };
  };

  // Extracts the MID (RFC 5888) from a media section.
  // Returns the MID or undefined if no mid line was found.
  SDPUtils.getMid = function (mediaSection) {
    var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
    if (mid) {
      return mid.substr(6);
    }
  };

  // Parses a fingerprint line for DTLS-SRTP.
  SDPUtils.parseFingerprint = function (line) {
    var parts = line.substr(14).split(' ');
    return {
      algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
      value: parts[1].toUpperCase() // the definition is upper-case in RFC 4572.
    };
  };

  // Extracts DTLS parameters from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the fingerprint line as input. See also getIceParameters.
  SDPUtils.getDtlsParameters = function (mediaSection, sessionpart) {
    var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=fingerprint:');
    // Note: a=setup line is ignored since we use the 'auto' role in Edge.
    return {
      role: 'auto',
      fingerprints: lines.map(SDPUtils.parseFingerprint)
    };
  };

  // Serializes DTLS parameters to SDP.
  SDPUtils.writeDtlsParameters = function (params, setupType) {
    var sdp = 'a=setup:' + setupType + '\r\n';
    params.fingerprints.forEach(function (fp) {
      sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
    });
    return sdp;
  };

  // Parses a=crypto lines into
  //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#dictionary-rtcsrtpsdesparameters-members
  SDPUtils.parseCryptoLine = function (line) {
    var parts = line.substr(9).split(' ');
    return {
      tag: parseInt(parts[0], 10),
      cryptoSuite: parts[1],
      keyParams: parts[2],
      sessionParams: parts.slice(3)
    };
  };

  SDPUtils.writeCryptoLine = function (parameters) {
    return 'a=crypto:' + parameters.tag + ' ' + parameters.cryptoSuite + ' ' + (_typeof(parameters.keyParams) === 'object' ? SDPUtils.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? ' ' + parameters.sessionParams.join(' ') : '') + '\r\n';
  };

  // Parses the crypto key parameters into
  //   https://rawgit.com/aboba/edgertc/master/msortc-rs4.html#rtcsrtpkeyparam*
  SDPUtils.parseCryptoKeyParams = function (keyParams) {
    if (keyParams.indexOf('inline:') !== 0) {
      return null;
    }
    var parts = keyParams.substr(7).split('|');
    return {
      keyMethod: 'inline',
      keySalt: parts[0],
      lifeTime: parts[1],
      mkiValue: parts[2] ? parts[2].split(':')[0] : undefined,
      mkiLength: parts[2] ? parts[2].split(':')[1] : undefined
    };
  };

  SDPUtils.writeCryptoKeyParams = function (keyParams) {
    return keyParams.keyMethod + ':' + keyParams.keySalt + (keyParams.lifeTime ? '|' + keyParams.lifeTime : '') + (keyParams.mkiValue && keyParams.mkiLength ? '|' + keyParams.mkiValue + ':' + keyParams.mkiLength : '');
  };

  // Extracts all SDES parameters.
  SDPUtils.getCryptoParameters = function (mediaSection, sessionpart) {
    var lines = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=crypto:');
    return lines.map(SDPUtils.parseCryptoLine);
  };

  // Parses ICE information from SDP media section or sessionpart.
  // FIXME: for consistency with other functions this should only
  //   get the ice-ufrag and ice-pwd lines as input.
  SDPUtils.getIceParameters = function (mediaSection, sessionpart) {
    var ufrag = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=ice-ufrag:')[0];
    var pwd = SDPUtils.matchPrefix(mediaSection + sessionpart, 'a=ice-pwd:')[0];
    if (!(ufrag && pwd)) {
      return null;
    }
    return {
      usernameFragment: ufrag.substr(12),
      password: pwd.substr(10)
    };
  };

  // Serializes ICE parameters to SDP.
  SDPUtils.writeIceParameters = function (params) {
    var sdp = 'a=ice-ufrag:' + params.usernameFragment + '\r\n' + 'a=ice-pwd:' + params.password + '\r\n';
    if (params.iceLite) {
      sdp += 'a=ice-lite\r\n';
    }
    return sdp;
  };

  // Parses the SDP media section and returns RTCRtpParameters.
  SDPUtils.parseRtpParameters = function (mediaSection) {
    var description = {
      codecs: [],
      headerExtensions: [],
      fecMechanisms: [],
      rtcp: []
    };
    var lines = SDPUtils.splitLines(mediaSection);
    var mline = lines[0].split(' ');
    for (var i = 3; i < mline.length; i++) {
      // find all codecs from mline[3..]
      var pt = mline[i];
      var rtpmapline = SDPUtils.matchPrefix(mediaSection, 'a=rtpmap:' + pt + ' ')[0];
      if (rtpmapline) {
        var codec = SDPUtils.parseRtpMap(rtpmapline);
        var fmtps = SDPUtils.matchPrefix(mediaSection, 'a=fmtp:' + pt + ' ');
        // Only the first a=fmtp:<pt> is considered.
        codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
        codec.rtcpFeedback = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-fb:' + pt + ' ').map(SDPUtils.parseRtcpFb);
        description.codecs.push(codec);
        // parse FEC mechanisms from rtpmap lines.
        switch (codec.name.toUpperCase()) {
          case 'RED':
          case 'ULPFEC':
            description.fecMechanisms.push(codec.name.toUpperCase());
            break;
          default:
            // only RED and ULPFEC are recognized as FEC mechanisms.
            break;
        }
      }
    }
    SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function (line) {
      description.headerExtensions.push(SDPUtils.parseExtmap(line));
    });
    // FIXME: parse rtcp.
    return description;
  };

  // Generates parts of the SDP media section describing the capabilities /
  // parameters.
  SDPUtils.writeRtpDescription = function (kind, caps) {
    var sdp = '';

    // Build the mline.
    sdp += 'm=' + kind + ' ';
    sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
    sdp += ' UDP/TLS/RTP/SAVPF ';
    sdp += caps.codecs.map(function (codec) {
      if (codec.preferredPayloadType !== undefined) {
        return codec.preferredPayloadType;
      }
      return codec.payloadType;
    }).join(' ') + '\r\n';

    sdp += 'c=IN IP4 0.0.0.0\r\n';
    sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

    // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
    caps.codecs.forEach(function (codec) {
      sdp += SDPUtils.writeRtpMap(codec);
      sdp += SDPUtils.writeFmtp(codec);
      sdp += SDPUtils.writeRtcpFb(codec);
    });
    var maxptime = 0;
    caps.codecs.forEach(function (codec) {
      if (codec.maxptime > maxptime) {
        maxptime = codec.maxptime;
      }
    });
    if (maxptime > 0) {
      sdp += 'a=maxptime:' + maxptime + '\r\n';
    }

    if (caps.headerExtensions) {
      caps.headerExtensions.forEach(function (extension) {
        sdp += SDPUtils.writeExtmap(extension);
      });
    }
    // FIXME: write fecMechanisms.
    return sdp;
  };

  // Parses the SDP media section and returns an array of
  // RTCRtpEncodingParameters.
  SDPUtils.parseRtpEncodingParameters = function (mediaSection) {
    var encodingParameters = [];
    var description = SDPUtils.parseRtpParameters(mediaSection);
    var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
    var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

    // filter a=ssrc:... cname:, ignore PlanB-msid
    var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
      return SDPUtils.parseSsrcMedia(line);
    }).filter(function (parts) {
      return parts.attribute === 'cname';
    });
    var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
    var secondarySsrc = void 0;

    var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID').map(function (line) {
      var parts = line.substr(17).split(' ');
      return parts.map(function (part) {
        return parseInt(part, 10);
      });
    });
    if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
      secondarySsrc = flows[0][1];
    }

    description.codecs.forEach(function (codec) {
      if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
        var encParam = {
          ssrc: primarySsrc,
          codecPayloadType: parseInt(codec.parameters.apt, 10)
        };
        if (primarySsrc && secondarySsrc) {
          encParam.rtx = { ssrc: secondarySsrc };
        }
        encodingParameters.push(encParam);
        if (hasRed) {
          encParam = JSON.parse(JSON.stringify(encParam));
          encParam.fec = {
            ssrc: primarySsrc,
            mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
          };
          encodingParameters.push(encParam);
        }
      }
    });
    if (encodingParameters.length === 0 && primarySsrc) {
      encodingParameters.push({
        ssrc: primarySsrc
      });
    }

    // we support both b=AS and b=TIAS but interpret AS as TIAS.
    var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
    if (bandwidth.length) {
      if (bandwidth[0].indexOf('b=TIAS:') === 0) {
        bandwidth = parseInt(bandwidth[0].substr(7), 10);
      } else if (bandwidth[0].indexOf('b=AS:') === 0) {
        // use formula from JSEP to convert b=AS to TIAS value.
        bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95 - 50 * 40 * 8;
      } else {
        bandwidth = undefined;
      }
      encodingParameters.forEach(function (params) {
        params.maxBitrate = bandwidth;
      });
    }
    return encodingParameters;
  };

  // parses http://draft.ortc.org/#rtcrtcpparameters*
  SDPUtils.parseRtcpParameters = function (mediaSection) {
    var rtcpParameters = {};

    // Gets the first SSRC. Note that with RTX there might be multiple
    // SSRCs.
    var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
      return SDPUtils.parseSsrcMedia(line);
    }).filter(function (obj) {
      return obj.attribute === 'cname';
    })[0];
    if (remoteSsrc) {
      rtcpParameters.cname = remoteSsrc.value;
      rtcpParameters.ssrc = remoteSsrc.ssrc;
    }

    // Edge uses the compound attribute instead of reducedSize
    // compound is !reducedSize
    var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
    rtcpParameters.reducedSize = rsize.length > 0;
    rtcpParameters.compound = rsize.length === 0;

    // parses the rtcp-mux attrіbute.
    // Note that Edge does not support unmuxed RTCP.
    var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
    rtcpParameters.mux = mux.length > 0;

    return rtcpParameters;
  };

  SDPUtils.writeRtcpParameters = function (rtcpParameters) {
    var sdp = '';
    if (rtcpParameters.reducedSize) {
      sdp += 'a=rtcp-rsize\r\n';
    }
    if (rtcpParameters.mux) {
      sdp += 'a=rtcp-mux\r\n';
    }
    if (rtcpParameters.ssrc !== undefined && rtcpParameters.cname) {
      sdp += 'a=ssrc:' + rtcpParameters.ssrc + ' cname:' + rtcpParameters.cname + '\r\n';
    }
    return sdp;
  };

  // parses either a=msid: or a=ssrc:... msid lines and returns
  // the id of the MediaStream and MediaStreamTrack.
  SDPUtils.parseMsid = function (mediaSection) {
    var parts = void 0;
    var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
    if (spec.length === 1) {
      parts = spec[0].substr(7).split(' ');
      return { stream: parts[0], track: parts[1] };
    }
    var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:').map(function (line) {
      return SDPUtils.parseSsrcMedia(line);
    }).filter(function (msidParts) {
      return msidParts.attribute === 'msid';
    });
    if (planB.length > 0) {
      parts = planB[0].value.split(' ');
      return { stream: parts[0], track: parts[1] };
    }
  };

  // SCTP
  // parses draft-ietf-mmusic-sctp-sdp-26 first and falls back
  // to draft-ietf-mmusic-sctp-sdp-05
  SDPUtils.parseSctpDescription = function (mediaSection) {
    var mline = SDPUtils.parseMLine(mediaSection);
    var maxSizeLine = SDPUtils.matchPrefix(mediaSection, 'a=max-message-size:');
    var maxMessageSize = void 0;
    if (maxSizeLine.length > 0) {
      maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
    }
    if (isNaN(maxMessageSize)) {
      maxMessageSize = 65536;
    }
    var sctpPort = SDPUtils.matchPrefix(mediaSection, 'a=sctp-port:');
    if (sctpPort.length > 0) {
      return {
        port: parseInt(sctpPort[0].substr(12), 10),
        protocol: mline.fmt,
        maxMessageSize: maxMessageSize
      };
    }
    var sctpMapLines = SDPUtils.matchPrefix(mediaSection, 'a=sctpmap:');
    if (sctpMapLines.length > 0) {
      var parts = sctpMapLines[0].substr(10).split(' ');
      return {
        port: parseInt(parts[0], 10),
        protocol: parts[1],
        maxMessageSize: maxMessageSize
      };
    }
  };

  // SCTP
  // outputs the draft-ietf-mmusic-sctp-sdp-26 version that all browsers
  // support by now receiving in this format, unless we originally parsed
  // as the draft-ietf-mmusic-sctp-sdp-05 format (indicated by the m-line
  // protocol of DTLS/SCTP -- without UDP/ or TCP/)
  SDPUtils.writeSctpDescription = function (media, sctp) {
    var output = [];
    if (media.protocol !== 'DTLS/SCTP') {
      output = ['m=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.protocol + '\r\n', 'c=IN IP4 0.0.0.0\r\n', 'a=sctp-port:' + sctp.port + '\r\n'];
    } else {
      output = ['m=' + media.kind + ' 9 ' + media.protocol + ' ' + sctp.port + '\r\n', 'c=IN IP4 0.0.0.0\r\n', 'a=sctpmap:' + sctp.port + ' ' + sctp.protocol + ' 65535\r\n'];
    }
    if (sctp.maxMessageSize !== undefined) {
      output.push('a=max-message-size:' + sctp.maxMessageSize + '\r\n');
    }
    return output.join('');
  };

  // Generate a session ID for SDP.
  // https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
  // recommends using a cryptographically random +ve 64-bit value
  // but right now this should be acceptable and within the right range
  SDPUtils.generateSessionId = function () {
    return Math.random().toString().substr(2, 21);
  };

  // Write boiler plate for start of SDP
  // sessId argument is optional - if not supplied it will
  // be generated randomly
  // sessVersion is optional and defaults to 2
  // sessUser is optional and defaults to 'thisisadapterortc'
  SDPUtils.writeSessionBoilerplate = function (sessId, sessVer, sessUser) {
    var sessionId = void 0;
    var version = sessVer !== undefined ? sessVer : 2;
    if (sessId) {
      sessionId = sessId;
    } else {
      sessionId = SDPUtils.generateSessionId();
    }
    var user = sessUser || 'thisisadapterortc';
    // FIXME: sess-id should be an NTP timestamp.
    return 'v=0\r\n' + 'o=' + user + ' ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' + 's=-\r\n' + 't=0 0\r\n';
  };

  // Gets the direction from the mediaSection or the sessionpart.
  SDPUtils.getDirection = function (mediaSection, sessionpart) {
    // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
    var lines = SDPUtils.splitLines(mediaSection);
    for (var i = 0; i < lines.length; i++) {
      switch (lines[i]) {
        case 'a=sendrecv':
        case 'a=sendonly':
        case 'a=recvonly':
        case 'a=inactive':
          return lines[i].substr(2);
        default:
        // FIXME: What should happen here?
      }
    }
    if (sessionpart) {
      return SDPUtils.getDirection(sessionpart);
    }
    return 'sendrecv';
  };

  SDPUtils.getKind = function (mediaSection) {
    var lines = SDPUtils.splitLines(mediaSection);
    var mline = lines[0].split(' ');
    return mline[0].substr(2);
  };

  SDPUtils.isRejected = function (mediaSection) {
    return mediaSection.split(' ', 2)[1] === '0';
  };

  SDPUtils.parseMLine = function (mediaSection) {
    var lines = SDPUtils.splitLines(mediaSection);
    var parts = lines[0].substr(2).split(' ');
    return {
      kind: parts[0],
      port: parseInt(parts[1], 10),
      protocol: parts[2],
      fmt: parts.slice(3).join(' ')
    };
  };

  SDPUtils.parseOLine = function (mediaSection) {
    var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
    var parts = line.substr(2).split(' ');
    return {
      username: parts[0],
      sessionId: parts[1],
      sessionVersion: parseInt(parts[2], 10),
      netType: parts[3],
      addressType: parts[4],
      address: parts[5]
    };
  };

  // a very naive interpretation of a valid SDP.
  SDPUtils.isValidSDP = function (blob) {
    if (typeof blob !== 'string' || blob.length === 0) {
      return false;
    }
    var lines = SDPUtils.splitLines(blob);
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
        return false;
      }
      // TODO: check the modifier a bit more.
    }
    return true;
  };

  // Expose public methods.
  if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
    module.exports = SDPUtils;
  }
  },{}]},{},[1])(1)
  });

(function() {
  if (!navigator.mediaDevices) navigator.mediaDevices = {};
  if (!navigator.mediaDevices.getUserMedia) {
    var getUserMedia =
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia ||
      navigator.getUserMedia;

    if (getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        return new Promise(function(resolve, reject) {
          getUserMedia(
            constraints,
            function(stream) {
              resolve(stream);
            },
            function(error) {
              reject(error);
            }
          );
        });
      };
    } else {
      navigator.mediaDevices.getUserMedia = function() {
        // A missing `getUserMedia` seemingly can mean one of two things:
        //
        // 1) WebRTC is unsupported or disabled on this browser
        // 2) This is an insecure connection
        //   * This handling of insecure connections happens only on certain browsers.
        //     It was observed in Chromium 80 and Firefox 75, but not Firefox 68. I suspect it's the new behavior.
        //   * In other browsers, it handles insecure connections by throwing `NotAllowedError`.
        //     We still handle this case in the calling function.
        //   * See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        //     As of this writing, this claims that the browser does *both* of these things for
        //     insecure connections, which is of course impossible and thus confusing.
        //
        // We will attempt to distinguish these two cases by checking for various webrtc-related fields on
        // `window` (inspired by github.com/muaz-khan/DetectRTC). If none of those fields exist, we assume
        // that WebRTC is not supported on this browser.
        return new Promise(function(resolve, reject) {
          if (!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCIceGatherer)) {
            var e = new Error("getUserMedia is not supported in this browser.");
            // I'd use NotSupportedError but I'm afraid they'll change the spec on us again
            e.name = 'CustomNotSupportedError';
            reject(e);
          } else {
            var e = new Error("insecure connection");
            // I'd use NotAllowedError but I'm afraid they'll change the spec on us again
            e.name = 'CustomSecureConnectionError';
            reject(e);
          }
        });
      };
    }
  }
})();
(function(a){var r=a.fn.domManip,d="_tmplitem",q=/^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,b={},f={},e,p={key:0,data:{}},h=0,c=0,l=[];function g(e,d,g,i){var c={data:i||(d?d.data:{}),_wrap:d?d._wrap:null,tmpl:null,parent:d||null,nodes:[],calls:u,nest:w,wrap:x,html:v,update:t};e&&a.extend(c,e,{nodes:[],parent:d});if(g){c.tmpl=g;c._ctnt=c._ctnt||c.tmpl(a,c);c.key=++h;(l.length?f:b)[h]=c}return c}a.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(f,d){a.fn[f]=function(n){var g=[],i=a(n),k,h,m,l,j=this.length===1&&this[0].parentNode;e=b||{};if(j&&j.nodeType===11&&j.childNodes.length===1&&i.length===1){i[d](this[0]);g=this}else{for(h=0,m=i.length;h<m;h++){c=h;k=(h>0?this.clone(true):this).get();a.fn[d].apply(a(i[h]),k);g=g.concat(k)}c=0;g=this.pushStack(g,f,i.selector)}l=e;e=null;a.tmpl.complete(l);return g}});a.fn.extend({tmpl:function(d,c,b){return a.tmpl(this[0],d,c,b)},tmplItem:function(){return a.tmplItem(this[0])},template:function(b){return a.template(b,this[0])},domManip:function(d,l,j){if(d[0]&&d[0].nodeType){var f=a.makeArray(arguments),g=d.length,i=0,h;while(i<g&&!(h=a.data(d[i++],"tmplItem")));if(g>1)f[0]=[a.makeArray(d)];if(h&&c)f[2]=function(b){a.tmpl.afterManip(this,b,j)};r.apply(this,f)}else r.apply(this,arguments);c=0;!e&&a.tmpl.complete(b);return this}});a.extend({tmpl:function(d,h,e,c){var j,k=!c;if(k){c=p;d=a.template[d]||a.template(null,d);f={}}else if(!d){d=c.tmpl;b[c.key]=c;c.nodes=[];c.wrapped&&n(c,c.wrapped);return a(i(c,null,c.tmpl(a,c)))}if(!d)return[];if(typeof h==="function")h=h.call(c||{});e&&e.wrapped&&n(e,e.wrapped);j=a.isArray(h)?a.map(h,function(a){return a?g(e,c,d,a):null}):[g(e,c,d,h)];return k?a(i(c,null,j)):j},tmplItem:function(b){var c;if(b instanceof a)b=b[0];while(b&&b.nodeType===1&&!(c=a.data(b,"tmplItem"))&&(b=b.parentNode));return c||p},template:function(c,b){if(b){if(typeof b==="string")b=o(b);else if(b instanceof a)b=b[0]||{};if(b.nodeType)b=a.data(b,"tmpl")||a.data(b,"tmpl",o(b.innerHTML));return typeof c==="string"?(a.template[c]=b):b}return c?typeof c!=="string"?a.template(null,c):a.template[c]||a.template(null,q.test(c)?c:a(c)):null},encode:function(a){return(""+a).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")}});a.extend(a.tmpl,{tag:{tmpl:{_default:{$2:"null"},open:"if($notnull_1){_=_.concat($item.nest($1,$2));}"},wrap:{_default:{$2:"null"},open:"$item.calls(_,$1,$2);_=[];",close:"call=$item.calls();_=call._.concat($item.wrap(call,_));"},each:{_default:{$2:"$index, $value"},open:"if($notnull_1){$.each($1a,function($2){with(this){",close:"}});}"},"if":{open:"if(($notnull_1) && $1a){",close:"}"},"else":{_default:{$1:"true"},open:"}else if(($notnull_1) && $1a){"},html:{open:"if($notnull_1){_.push($1a);}"},"=":{_default:{$1:"$data"},open:"if($notnull_1){_.push($.encode($1a));}"},"!":{open:""}},complete:function(){b={}},afterManip:function(f,b,d){var e=b.nodeType===11?a.makeArray(b.childNodes):b.nodeType===1?[b]:[];d.call(f,b);m(e);c++}});function i(e,g,f){var b,c=f?a.map(f,function(a){return typeof a==="string"?e.key?a.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,"$1 "+d+'="'+e.key+'" $2'):a:i(a,e,a._ctnt)}):e;if(g)return c;c=c.join("");c.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,function(f,c,e,d){b=a(e).get();m(b);if(c)b=j(c).concat(b);if(d)b=b.concat(j(d))});return b?b:j(c)}function j(c){var b=document.createElement("div");b.innerHTML=c;return a.makeArray(b.childNodes)}function o(b){return new Function("jQuery","$item","var $=jQuery,call,_=[],$data=$item.data;with($data){_.push('"+a.trim(b).replace(/([\\'])/g,"\\$1").replace(/[\r\t\n]/g," ").replace(/\$\{([^\}]*)\}/g,"{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,function(m,l,j,d,b,c,e){var i=a.tmpl.tag[j],h,f,g;if(!i)throw"Template command not found: "+j;h=i._default||[];if(c&&!/\w$/.test(b)){b+=c;c=""}if(b){b=k(b);e=e?","+k(e)+")":c?")":"";f=c?b.indexOf(".")>-1?b+c:"("+b+").call($item"+e:b;g=c?f:"(typeof("+b+")==='function'?("+b+").call($item):("+b+"))"}else g=f=h.$1||"null";d=k(d);return"');"+i[l?"close":"open"].split("$notnull_1").join(b?"typeof("+b+")!=='undefined' && ("+b+")!=null":"true").split("$1a").join(g).split("$1").join(f).split("$2").join(d?d.replace(/\s*([^\(]+)\s*(\((.*?)\))?/g,function(d,c,b,a){a=a?","+a+")":b?")":"";return a?"("+c+").call($item"+a:d}):h.$2||"")+"_.push('"})+"');}return _;")}function n(c,b){c._wrap=i(c,true,a.isArray(b)?b:[q.test(b)?b:a(b).html()]).join("")}function k(a){return a?a.replace(/\\'/g,"'").replace(/\\\\/g,"\\"):null}function s(b){var a=document.createElement("div");a.appendChild(b.cloneNode(true));return a.innerHTML}function m(o){var n="_"+c,k,j,l={},e,p,i;for(e=0,p=o.length;e<p;e++){if((k=o[e]).nodeType!==1)continue;j=k.getElementsByTagName("*");for(i=j.length-1;i>=0;i--)m(j[i]);m(k)}function m(j){var p,i=j,k,e,m;if(m=j.getAttribute(d)){while(i.parentNode&&(i=i.parentNode).nodeType===1&&!(p=i.getAttribute(d)));if(p!==m){i=i.parentNode?i.nodeType===11?0:i.getAttribute(d)||0:0;if(!(e=b[m])){e=f[m];e=g(e,b[i]||f[i],null,true);e.key=++h;b[h]=e}c&&o(m)}j.removeAttribute(d)}else if(c&&(e=a.data(j,"tmplItem"))){o(e.key);b[e.key]=e;i=a.data(j.parentNode,"tmplItem");i=i?i.key:0}if(e){k=e;while(k&&k.key!=i){k.nodes.push(j);k=k.parent}delete e._ctnt;delete e._wrap;a.data(j,"tmplItem",e)}function o(a){a=a+n;e=l[a]=l[a]||g(e,b[e.parent.key+n]||e.parent,null,true)}}}function u(a,d,c,b){if(!a)return l.pop();l.push({_:a,tmpl:d,item:this,data:c,options:b})}function w(d,c,b){return a.tmpl(a.template(d),c,b,this)}function x(b,d){var c=b.options||{};c.wrapped=d;return a.tmpl(a.template(b.tmpl),b.data,c,b.item)}function v(d,c){var b=this._wrap;return a.map(a(a.isArray(b)?b.join(""):b).filter(d||"*"),function(a){return c?a.innerText||a.textContent:a.outerHTML||s(a)})}function t(){var b=this.nodes;a.tmpl(null,null,null,this).insertBefore(b[0]);a(b).remove()}})(jQuery)
'use strict';

// Last time updated: 2019-02-20 3:31:30 PM UTC

// _______________
// getStats v1.2.0

// Open-Sourced: https://github.com/muaz-khan/getStats

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

"use strict";var getStats=function(mediaStreamTrack,callback,interval){function getStatsLooper(){getStatsWrapper(function(results){if(results&&results.forEach){results.forEach(function(result){Object.keys(getStatsParser).forEach(function(key){if("function"==typeof getStatsParser[key])try{getStatsParser[key](result)}catch(e){console.error(e.message,e.stack,e)}})});try{peer.iceConnectionState.search(/failed|closed|disconnected/gi)!==-1&&(nomore=!0)}catch(e){nomore=!0}nomore===!0&&(getStatsResult.datachannel&&(getStatsResult.datachannel.state="close"),getStatsResult.ended=!0),getStatsResult.results=results,getStatsResult.audio&&getStatsResult.video&&(getStatsResult.bandwidth.speed=getStatsResult.audio.bytesSent-getStatsResult.bandwidth.helper.audioBytesSent+(getStatsResult.video.bytesSent-getStatsResult.bandwidth.helper.videoBytesSent),getStatsResult.bandwidth.helper.audioBytesSent=getStatsResult.audio.bytesSent,getStatsResult.bandwidth.helper.videoBytesSent=getStatsResult.video.bytesSent),callback(getStatsResult),nomore||void 0!=typeof interval&&interval&&setTimeout(getStatsLooper,interval||1e3)}})}function getStatsWrapper(cb){"undefined"!=typeof window.InstallTrigger||isSafari?peer.getStats(window.mediaStreamTrack||null).then(function(res){var items=[];res.forEach(function(r){items.push(r)}),cb(items)})["catch"](cb):peer.getStats(function(res){var items=[];res.result().forEach(function(res){var item={};res.names().forEach(function(name){item[name]=res.stat(name)}),item.id=res.id,item.type=res.type,item.timestamp=res.timestamp,items.push(item)}),cb(items)})}var browserFakeUserAgent="Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45";!function(that){that&&"undefined"==typeof window&&"undefined"!=typeof global&&(global.navigator={userAgent:browserFakeUserAgent,getUserMedia:function(){}},global.console||(global.console={}),"undefined"!=typeof global.console.log&&"undefined"!=typeof global.console.error||(global.console.error=global.console.log=global.console.log||function(){console.log(arguments)}),"undefined"==typeof document&&(that.document={documentElement:{appendChild:function(){return""}}},document.createElement=document.captureStream=document.mozCaptureStream=function(){var obj={getContext:function(){return obj},play:function(){},pause:function(){},drawImage:function(){},toDataURL:function(){return""}};return obj},that.HTMLVideoElement=function(){}),"undefined"==typeof location&&(that.location={protocol:"file:",href:"",hash:""}),"undefined"==typeof screen&&(that.screen={width:0,height:0}),"undefined"==typeof URL&&(that.URL={createObjectURL:function(){return""},revokeObjectURL:function(){return""}}),"undefined"==typeof MediaStreamTrack&&(that.MediaStreamTrack=function(){}),"undefined"==typeof RTCPeerConnection&&(that.RTCPeerConnection=function(){}),that.window=global)}("undefined"!=typeof global?global:null);var RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection;"undefined"==typeof MediaStreamTrack&&(MediaStreamTrack={});var systemNetworkType=((navigator.connection||{}).type||"unknown").toString().toLowerCase(),getStatsResult={encryption:"sha-256",audio:{send:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},recv:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},bytesSent:0,bytesReceived:0,latency:0,packetsLost:0},video:{send:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},recv:{tracks:[],codecs:[],availableBandwidth:0,streams:0,framerateMean:0,bitrateMean:0},bytesSent:0,bytesReceived:0,latency:0,packetsLost:0},bandwidth:{systemBandwidth:0,sentPerSecond:0,encodedPerSecond:0,helper:{audioBytesSent:0,videoBytestSent:0},speed:0},results:{},connectionType:{systemNetworkType:systemNetworkType,systemIpAddress:"192.168.1.2",local:{candidateType:[],transport:[],ipAddress:[],networkType:[]},remote:{candidateType:[],transport:[],ipAddress:[],networkType:[]}},resolutions:{send:{width:0,height:0},recv:{width:0,height:0}},internal:{audio:{send:{},recv:{}},video:{send:{},recv:{}},candidates:{}},nomore:function(){nomore=!0}},getStatsParser={checkIfOfferer:function(result){"googLibjingleSession"===result.type&&(getStatsResult.isOfferer=result.googInitiator)}},isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),peer=this;if(!(arguments[0]instanceof RTCPeerConnection))throw"1st argument is not instance of RTCPeerConnection.";peer=arguments[0],arguments[1]instanceof MediaStreamTrack&&(mediaStreamTrack=arguments[1],callback=arguments[2],interval=arguments[3]);var nomore=!1;getStatsParser.datachannel=function(result){"datachannel"===result.type&&(getStatsResult.datachannel={state:result.state})},getStatsParser.googCertificate=function(result){"googCertificate"==result.type&&(getStatsResult.encryption=result.googFingerprintAlgorithm),"certificate"==result.type&&(getStatsResult.encryption=result.fingerprintAlgorithm)},getStatsParser.checkAudioTracks=function(result){if("audio"===result.mediaType){var sendrecvType=result.id.split("_").pop();if(result.isRemote===!0&&(sendrecvType="recv"),result.isRemote===!1&&(sendrecvType="send"),sendrecvType){if(getStatsResult.audio[sendrecvType].codecs.indexOf(result.googCodecName||"opus")===-1&&getStatsResult.audio[sendrecvType].codecs.push(result.googCodecName||"opus"),result.bytesSent){var kilobytes=0;getStatsResult.internal.audio[sendrecvType].prevBytesSent||(getStatsResult.internal.audio[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.audio[sendrecvType].prevBytesSent;getStatsResult.internal.audio[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.audio[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.audio.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.audio[sendrecvType].prevBytesReceived||(getStatsResult.internal.audio[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.audio[sendrecvType].prevBytesReceived;getStatsResult.internal.audio[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.audio.bytesReceived=kilobytes.toFixed(1)}if(result.googTrackId&&getStatsResult.audio[sendrecvType].tracks.indexOf(result.googTrackId)===-1&&getStatsResult.audio[sendrecvType].tracks.push(result.googTrackId),result.googCurrentDelayMs){var kilobytes=0;getStatsResult.internal.audio.prevGoogCurrentDelayMs||(getStatsResult.internal.audio.prevGoogCurrentDelayMs=result.googCurrentDelayMs);var bytes=result.googCurrentDelayMs-getStatsResult.internal.audio.prevGoogCurrentDelayMs;getStatsResult.internal.audio.prevGoogCurrentDelayMs=result.googCurrentDelayMs,getStatsResult.audio.latency=bytes.toFixed(1),getStatsResult.audio.latency<0&&(getStatsResult.audio.latency=0)}if(result.packetsLost){var kilobytes=0;getStatsResult.internal.audio.prevPacketsLost||(getStatsResult.internal.audio.prevPacketsLost=result.packetsLost);var bytes=result.packetsLost-getStatsResult.internal.audio.prevPacketsLost;getStatsResult.internal.audio.prevPacketsLost=result.packetsLost,getStatsResult.audio.packetsLost=bytes.toFixed(1),getStatsResult.audio.packetsLost<0&&(getStatsResult.audio.packetsLost=0)}}}},getStatsParser.checkVideoTracks=function(result){if("video"===result.mediaType){var sendrecvType=result.id.split("_").pop();if(result.isRemote===!0&&(sendrecvType="recv"),result.isRemote===!1&&(sendrecvType="send"),sendrecvType){if(getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName||"VP8")===-1&&getStatsResult.video[sendrecvType].codecs.push(result.googCodecName||"VP8"),result.bytesSent){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesSent||(getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBytesSent;getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.video.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesReceived||(getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.video[sendrecvType].prevBytesReceived;getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.video.bytesReceived=kilobytes.toFixed(1)}if(result.googFrameHeightReceived&&result.googFrameWidthReceived&&(getStatsResult.resolutions[sendrecvType].width=result.googFrameWidthReceived,getStatsResult.resolutions[sendrecvType].height=result.googFrameHeightReceived),result.googFrameHeightSent&&result.googFrameWidthSent&&(getStatsResult.resolutions[sendrecvType].width=result.googFrameWidthSent,getStatsResult.resolutions[sendrecvType].height=result.googFrameHeightSent),result.googTrackId&&getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId)===-1&&getStatsResult.video[sendrecvType].tracks.push(result.googTrackId),result.framerateMean){getStatsResult.bandwidth.framerateMean=result.framerateMean;var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevFramerateMean||(getStatsResult.internal.video[sendrecvType].prevFramerateMean=result.bitrateMean);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevFramerateMean;getStatsResult.internal.video[sendrecvType].prevFramerateMean=result.framerateMean,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].framerateMean=bytes.toFixed(1)}if(result.bitrateMean){getStatsResult.bandwidth.bitrateMean=result.bitrateMean;var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBitrateMean||(getStatsResult.internal.video[sendrecvType].prevBitrateMean=result.bitrateMean);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBitrateMean;getStatsResult.internal.video[sendrecvType].prevBitrateMean=result.bitrateMean,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].bitrateMean=bytes.toFixed(1)}if(result.googCurrentDelayMs){var kilobytes=0;getStatsResult.internal.video.prevGoogCurrentDelayMs||(getStatsResult.internal.video.prevGoogCurrentDelayMs=result.googCurrentDelayMs);var bytes=result.googCurrentDelayMs-getStatsResult.internal.video.prevGoogCurrentDelayMs;getStatsResult.internal.video.prevGoogCurrentDelayMs=result.googCurrentDelayMs,getStatsResult.video.latency=bytes.toFixed(1),getStatsResult.video.latency<0&&(getStatsResult.video.latency=0)}if(result.packetsLost){var kilobytes=0;getStatsResult.internal.video.prevPacketsLost||(getStatsResult.internal.video.prevPacketsLost=result.packetsLost);var bytes=result.packetsLost-getStatsResult.internal.video.prevPacketsLost;getStatsResult.internal.video.prevPacketsLost=result.packetsLost,getStatsResult.video.packetsLost=bytes.toFixed(1),getStatsResult.video.packetsLost<0&&(getStatsResult.video.packetsLost=0)}}}},getStatsParser.bweforvideo=function(result){"VideoBwe"===result.type&&(getStatsResult.bandwidth.availableSendBandwidth=result.googAvailableSendBandwidth,getStatsResult.bandwidth.googActualEncBitrate=result.googActualEncBitrate,getStatsResult.bandwidth.googAvailableSendBandwidth=result.googAvailableSendBandwidth,getStatsResult.bandwidth.googAvailableReceiveBandwidth=result.googAvailableReceiveBandwidth,getStatsResult.bandwidth.googRetransmitBitrate=result.googRetransmitBitrate,getStatsResult.bandwidth.googTargetEncBitrate=result.googTargetEncBitrate,getStatsResult.bandwidth.googBucketDelay=result.googBucketDelay,getStatsResult.bandwidth.googTransmitBitrate=result.googTransmitBitrate)},getStatsParser.candidatePair=function(result){if("googCandidatePair"===result.type||"candidate-pair"===result.type||"local-candidate"===result.type||"remote-candidate"===result.type){if("true"==result.googActiveConnection){Object.keys(getStatsResult.internal.candidates).forEach(function(cid){var candidate=getStatsResult.internal.candidates[cid];candidate.ipAddress.indexOf(result.googLocalAddress)!==-1&&(getStatsResult.connectionType.local.candidateType=candidate.candidateType,getStatsResult.connectionType.local.ipAddress=candidate.ipAddress,getStatsResult.connectionType.local.networkType=candidate.networkType,getStatsResult.connectionType.local.transport=candidate.transport),candidate.ipAddress.indexOf(result.googRemoteAddress)!==-1&&(getStatsResult.connectionType.remote.candidateType=candidate.candidateType,getStatsResult.connectionType.remote.ipAddress=candidate.ipAddress,getStatsResult.connectionType.remote.networkType=candidate.networkType,getStatsResult.connectionType.remote.transport=candidate.transport)}),getStatsResult.connectionType.transport=result.googTransportType;var localCandidate=getStatsResult.internal.candidates[result.localCandidateId];localCandidate&&localCandidate.ipAddress&&(getStatsResult.connectionType.systemIpAddress=localCandidate.ipAddress);var remoteCandidate=getStatsResult.internal.candidates[result.remoteCandidateId];remoteCandidate&&remoteCandidate.ipAddress&&(getStatsResult.connectionType.systemIpAddress=remoteCandidate.ipAddress)}if("candidate-pair"===result.type&&result.selected===!0&&result.nominated===!0&&"succeeded"===result.state)var localCandidate=getStatsResult.internal.candidates[result.remoteCandidateId],remoteCandidate=getStatsResult.internal.candidates[result.remoteCandidateId];if("local-candidate"===result.type&&(getStatsResult.connectionType.local.candidateType=result.candidateType,getStatsResult.connectionType.local.ipAddress=result.ipAddress,getStatsResult.connectionType.local.networkType=result.networkType,getStatsResult.connectionType.local.transport=result.mozLocalTransport||result.transport),"remote-candidate"===result.type&&(getStatsResult.connectionType.remote.candidateType=result.candidateType,getStatsResult.connectionType.remote.ipAddress=result.ipAddress,getStatsResult.connectionType.remote.networkType=result.networkType,getStatsResult.connectionType.remote.transport=result.mozRemoteTransport||result.transport),isSafari){var sendrecvType=result.localCandidateId?"send":"recv";if(!sendrecvType)return;if(result.bytesSent){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesSent||(getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal.video[sendrecvType].prevBytesSent;getStatsResult.internal.video[sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult.video[sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult.video.bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevBytesReceived||(getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal.video[sendrecvType].prevBytesReceived;getStatsResult.internal.video[sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult.video.bytesReceived=kilobytes.toFixed(1)}if(result.availableOutgoingBitrate){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate||(getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate=result.availableOutgoingBitrate);var bytes=result.availableOutgoingBitrate-getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate;getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate=result.availableOutgoingBitrate,kilobytes=bytes/1024,getStatsResult.video.availableOutgoingBitrate=kilobytes.toFixed(1)}if(result.availableIncomingBitrate){var kilobytes=0;getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate||(getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate=result.availableIncomingBitrate);var bytes=result.availableIncomingBitrate-getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate;getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate=result.availableIncomingBitrate,kilobytes=bytes/1024,getStatsResult.video.availableIncomingBitrate=kilobytes.toFixed(1)}}}};var LOCAL_candidateType={},LOCAL_transport={},LOCAL_ipAddress={},LOCAL_networkType={};getStatsParser.localcandidate=function(result){"localcandidate"!==result.type&&"local-candidate"!==result.type||result.id&&(LOCAL_candidateType[result.id]||(LOCAL_candidateType[result.id]=[]),LOCAL_transport[result.id]||(LOCAL_transport[result.id]=[]),LOCAL_ipAddress[result.id]||(LOCAL_ipAddress[result.id]=[]),LOCAL_networkType[result.id]||(LOCAL_networkType[result.id]=[]),result.candidateType&&LOCAL_candidateType[result.id].indexOf(result.candidateType)===-1&&LOCAL_candidateType[result.id].push(result.candidateType),result.transport&&LOCAL_transport[result.id].indexOf(result.transport)===-1&&LOCAL_transport[result.id].push(result.transport),result.ipAddress&&LOCAL_ipAddress[result.id].indexOf(result.ipAddress+":"+result.portNumber)===-1&&LOCAL_ipAddress[result.id].push(result.ipAddress+":"+result.portNumber),result.networkType&&LOCAL_networkType[result.id].indexOf(result.networkType)===-1&&LOCAL_networkType[result.id].push(result.networkType),getStatsResult.internal.candidates[result.id]={candidateType:LOCAL_candidateType[result.id],ipAddress:LOCAL_ipAddress[result.id],portNumber:result.portNumber,networkType:LOCAL_networkType[result.id],priority:result.priority,transport:LOCAL_transport[result.id],timestamp:result.timestamp,id:result.id,type:result.type},getStatsResult.connectionType.local.candidateType=LOCAL_candidateType[result.id],getStatsResult.connectionType.local.ipAddress=LOCAL_ipAddress[result.id],getStatsResult.connectionType.local.networkType=LOCAL_networkType[result.id],getStatsResult.connectionType.local.transport=LOCAL_transport[result.id])};var REMOTE_candidateType={},REMOTE_transport={},REMOTE_ipAddress={},REMOTE_networkType={};getStatsParser.remotecandidate=function(result){"remotecandidate"!==result.type&&"remote-candidate"!==result.type||result.id&&(REMOTE_candidateType[result.id]||(REMOTE_candidateType[result.id]=[]),REMOTE_transport[result.id]||(REMOTE_transport[result.id]=[]),REMOTE_ipAddress[result.id]||(REMOTE_ipAddress[result.id]=[]),REMOTE_networkType[result.id]||(REMOTE_networkType[result.id]=[]),result.candidateType&&REMOTE_candidateType[result.id].indexOf(result.candidateType)===-1&&REMOTE_candidateType[result.id].push(result.candidateType),result.transport&&REMOTE_transport[result.id].indexOf(result.transport)===-1&&REMOTE_transport[result.id].push(result.transport),result.ipAddress&&REMOTE_ipAddress[result.id].indexOf(result.ipAddress+":"+result.portNumber)===-1&&REMOTE_ipAddress[result.id].push(result.ipAddress+":"+result.portNumber),result.networkType&&REMOTE_networkType[result.id].indexOf(result.networkType)===-1&&REMOTE_networkType[result.id].push(result.networkType),getStatsResult.internal.candidates[result.id]={candidateType:REMOTE_candidateType[result.id],ipAddress:REMOTE_ipAddress[result.id],portNumber:result.portNumber,networkType:REMOTE_networkType[result.id],priority:result.priority,transport:REMOTE_transport[result.id],timestamp:result.timestamp,id:result.id,type:result.type},getStatsResult.connectionType.remote.candidateType=REMOTE_candidateType[result.id],getStatsResult.connectionType.remote.ipAddress=REMOTE_ipAddress[result.id],getStatsResult.connectionType.remote.networkType=REMOTE_networkType[result.id],getStatsResult.connectionType.remote.transport=REMOTE_transport[result.id])},getStatsParser.dataSentReceived=function(result){!result.googCodecName||"video"!==result.mediaType&&"audio"!==result.mediaType||(result.bytesSent&&(getStatsResult[result.mediaType].bytesSent=parseInt(result.bytesSent)),result.bytesReceived&&(getStatsResult[result.mediaType].bytesReceived=parseInt(result.bytesReceived)))},getStatsParser.inboundrtp=function(result){if(isSafari&&"inbound-rtp"===result.type){var mediaType=result.mediaType||"audio",sendrecvType=result.isRemote?"recv":"send";if(sendrecvType){if(result.bytesSent){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent||(getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult[mediaType][sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult[mediaType].bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived||(getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult[mediaType].bytesReceived=kilobytes.toFixed(1)}}}},getStatsParser.outboundrtp=function(result){if(isSafari&&"outbound-rtp"===result.type){var mediaType=result.mediaType||"audio",sendrecvType=result.isRemote?"recv":"send";if(sendrecvType){if(result.bytesSent){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent||(getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent);var bytes=result.bytesSent-getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;getStatsResult.internal[mediaType][sendrecvType].prevBytesSent=result.bytesSent,kilobytes=bytes/1024,getStatsResult[mediaType][sendrecvType].availableBandwidth=kilobytes.toFixed(1),getStatsResult[mediaType].bytesSent=kilobytes.toFixed(1)}if(result.bytesReceived){var kilobytes=0;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived||(getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived);var bytes=result.bytesReceived-getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived=result.bytesReceived,kilobytes=bytes/1024,getStatsResult[mediaType].bytesReceived=kilobytes.toFixed(1)}}}},getStatsParser.track=function(result){if(isSafari&&"track"===result.type){var sendrecvType=result.remoteSource===!0?"send":"recv";result.frameWidth&&result.frameHeight&&(getStatsResult.resolutions[sendrecvType].width=result.frameWidth,getStatsResult.resolutions[sendrecvType].height=result.frameHeight)}};var SSRC={audio:{send:[],recv:[]},video:{send:[],recv:[]}};getStatsParser.ssrc=function(result){if(result.googCodecName&&("video"===result.mediaType||"audio"===result.mediaType)&&"ssrc"===result.type){var sendrecvType=result.id.split("_").pop();SSRC[result.mediaType][sendrecvType].indexOf(result.ssrc)===-1&&SSRC[result.mediaType][sendrecvType].push(result.ssrc),getStatsResult[result.mediaType][sendrecvType].streams=SSRC[result.mediaType][sendrecvType].length}},getStatsLooper()};"undefined"!=typeof module&&(module.exports=getStats),"function"==typeof define&&define.amd&&define("getStats",[],function(){return getStats});
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

// CodecsHandler.js
'use strict';

var CodecsHandler = (function () {
  function preferCodec(sdp, codecName) {
    const info = splitLines(sdp);

    codecName = codecName.toLowerCase();

    if (!info.videoCodecNumbers) {
      return sdp;
    }

    if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
      return sdp;
    }

    sdp = preferCodecHelper(sdp, codecName, info);

    return sdp;
  }

  function preferCodecHelper(sdp, codec, info, ignore) {
    let preferCodecNumber = '';

    if (codec === 'vp8') {
      if (!info.vp8LineNumber) {
        return sdp;
      }
      preferCodecNumber = info.vp8LineNumber;
    }

    if (codec === 'vp9') {
      if (!info.vp9LineNumber) {
        return sdp;
      }
      preferCodecNumber = info.vp9LineNumber;
    }

    if (codec === 'h264') {
      if (!info.h264LineNumber) {
        return sdp;
      }

      preferCodecNumber = info.h264LineNumber;
    }

    let newLine = `${info.videoCodecNumbersOriginal.split('SAVPF')[0]}SAVPF `;

    let newOrder = [preferCodecNumber];

    if (ignore) {
      newOrder = [];
    }

    info.videoCodecNumbers.forEach((codecNumber) => {
      if (codecNumber === preferCodecNumber) return;
      newOrder.push(codecNumber);
    });

    newLine += newOrder.join(' ');

    sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
    return sdp;
  }

  function splitLines(sdp) {
    const info = {};
    sdp.split('\n').forEach((line) => {
      if (line.indexOf('m=video') === 0) {
        info.videoCodecNumbers = [];
        line.split('SAVPF')[1].split(' ').forEach((codecNumber) => {
          codecNumber = codecNumber.trim();
          if (!codecNumber || !codecNumber.length) return;
          info.videoCodecNumbers.push(codecNumber);
          info.videoCodecNumbersOriginal = line;
        });
      }

      if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
        info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }

      if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
        info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }

      if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
        info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0];
      }
    });

    return info;
  }

  function removeVPX(sdp) {
    const info = splitLines(sdp);

    // last parameter below means: ignore these codecs
    sdp = preferCodecHelper(sdp, 'vp9', info, true);
    sdp = preferCodecHelper(sdp, 'vp8', info, true);

    return sdp;
  }

  function disableNACK(sdp) {
    if (!sdp || typeof sdp !== 'string') {
      throw 'Invalid arguments.';
    }

    sdp = sdp.replace('a=rtcp-fb:126 nack\r\n', '');
    sdp = sdp.replace('a=rtcp-fb:126 nack pli\r\n', 'a=rtcp-fb:126 pli\r\n');
    sdp = sdp.replace('a=rtcp-fb:97 nack\r\n', '');
    sdp = sdp.replace('a=rtcp-fb:97 nack pli\r\n', 'a=rtcp-fb:97 pli\r\n');

    return sdp;
  }

  function prioritize(codecMimeType, peer) {
    if (!peer || !peer.getSenders || !peer.getSenders().length) {
      return;
    }

    if (!codecMimeType || typeof codecMimeType !== 'string') {
      throw 'Invalid arguments.';
    }

    peer.getSenders().forEach((sender) => {
      const params = sender.getParameters();
      for (let i = 0; i < params.codecs.length; i++) {
        if (params.codecs[i].mimeType === codecMimeType) {
          params.codecs.unshift(params.codecs.splice(i, 1));
          break;
        }
      }
      sender.setParameters(params);
    });
  }

  function removeNonG722(sdp) {
    return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, 'm=audio $1 RTP/SAVPF 9');
  }

  function setBAS(sdp, bandwidth, isScreen) {
    if (!!navigator.mozGetUserMedia || !bandwidth) {
      return sdp;
    }

    if (isScreen) {
      if (!bandwidth.screen) {
        console.warn('It seems that you are not using bandwidth for screen. Screen sharing is expected to fail.');
      } else if (bandwidth.screen < 300) {
        console.warn('It seems that you are using wrong bandwidth value for screen. Screen sharing is expected to fail.');
      }
    }

    // if screen; must use at least 300kbs
    if (bandwidth.screen && isScreen) {
      sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
      sdp = sdp.replace(/a=mid:video\r\n/g, `a=mid:video\r\nb=AS:${bandwidth.screen}\r\n`);
    }

    // remove existing bandwidth lines
    if (bandwidth.audio || bandwidth.video || bandwidth.data) {
      sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
    }

    if (bandwidth.audio) {
      sdp = sdp.replace(/a=mid:audio\r\n/g, `a=mid:audio\r\nb=AS:${bandwidth.audio}\r\n`);
    }

    if (bandwidth.video) {
      sdp = sdp.replace(/a=mid:video\r\n/g, `a=mid:video\r\nb=AS:${isScreen ? bandwidth.screen : bandwidth.video}\r\n`);
    }

    return sdp;
  }

  // Find the line in sdpLines that starts with |prefix|, and, if specified,
  // contains |substr| (case-insensitive search).
  function findLine(sdpLines, prefix, substr) {
    return findLineInRange(sdpLines, 0, -1, prefix, substr);
  }

  // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
  // and, if specified, contains |substr| (case-insensitive search).
  function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    const realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (let i = startLine; i < realEndLine; ++i) {
      if (sdpLines[i].indexOf(prefix) === 0) {
        if (!substr || sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          return i;
        }
      }
    }
    return null;
  }

  // Gets the codec payload type from an a=rtpmap:X line.
  function getCodecPayloadType(sdpLine) {
    const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    const result = sdpLine.match(pattern);
    return result && result.length === 2 ? result[1] : null;
  }

  function _setVideoBitrates(sdp, params) {
    params = params || {};
    const xgoogle_min_bitrate = params.min;
    const xgoogle_max_bitrate = params.max;
    const videoCodec = params.codec.toUpperCase() || 'VP8';

    const sdpLines = sdp.split('\r\n');

    // VP8
    const vp8Index = findLine(sdpLines, 'a=rtpmap', `${videoCodec}/90000`);
    let vp8Payload;
    if (vp8Index) {
      vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
    }

    if (!vp8Payload) {
      return sdp;
    }

    const rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
    let rtxPayload;
    if (rtxIndex) {
      rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
    }

    if (!rtxIndex) {
      return sdp;
    }

    const rtxFmtpLineIndex = findLine(sdpLines, `a=fmtp:${rtxPayload.toString()}`);
    if (rtxFmtpLineIndex !== null) {
      let appendrtxNext = '\r\n';
      appendrtxNext += `a=fmtp:${vp8Payload} x-google-min-bitrate=${xgoogle_min_bitrate || '228'}; x-google-max-bitrate=${xgoogle_max_bitrate || '228'}`;
      sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
      sdp = sdpLines.join('\r\n');
    }

    return sdp;
  }

  function _setOpusAttributes(sdp, params) {
    params = params || {};

    const sdpLines = sdp.split('\r\n');

    // Opus
    const opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
    let opusPayload;
    if (opusIndex) {
      opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
    }

    if (!opusPayload) {
      return sdp;
    }

    const opusFmtpLineIndex = findLine(sdpLines, `a=fmtp:${opusPayload.toString()}`);
    if (opusFmtpLineIndex == null) {
      return sdp;
    }

    let appendOpusNext = '';
    appendOpusNext += `; stereo=${typeof params.stereo !== 'undefined' ? params.stereo : '1'}`;
    appendOpusNext += `; sprop-stereo=${typeof params['sprop-stereo'] !== 'undefined' ? params['sprop-stereo'] : '1'}`;

    if (typeof params.maxaveragebitrate !== 'undefined') {
      appendOpusNext += `; maxaveragebitrate=${params.maxaveragebitrate || 128 * 1024 * 8}`;
    }

    if (typeof params.maxplaybackrate !== 'undefined') {
      appendOpusNext += `; maxplaybackrate=${params.maxplaybackrate || 128 * 1024 * 8}`;
    }

    if (typeof params.cbr !== 'undefined') {
      appendOpusNext += `; cbr=${typeof params.cbr !== 'undefined' ? params.cbr : '1'}`;
    }

    if (typeof params.useinbandfec !== 'undefined') {
      appendOpusNext += `; useinbandfec=${params.useinbandfec}`;
    }

    if (typeof params.usedtx !== 'undefined') {
      appendOpusNext += `; usedtx=${params.usedtx}`;
    }

    if (typeof params.maxptime !== 'undefined') {
      appendOpusNext += `\r\na=maxptime:${params.maxptime}`;
    }

    sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

    sdp = sdpLines.join('\r\n');
    return sdp;
  }

  // forceStereoAudio => via webrtcexample.com
  // requires getUserMedia => echoCancellation:false
  function forceStereoAudio(sdp) {
    const sdpLines = sdp.split('\r\n');
    let fmtpLineIndex = null;
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('opus/48000') !== -1) {
        var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
        break;
      }
    }
    for (var i = 0; i < sdpLines.length; i++) {
      if (sdpLines[i].search('a=fmtp') !== -1) {
        const payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
        if (payload === opusPayload) {
          fmtpLineIndex = i;
          break;
        }
      }
    }
    if (fmtpLineIndex == null) return sdp;
    sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');
    sdp = sdpLines.join('\r\n');
    return sdp;
  }

  return {
    removeVPX,
    disableNACK,
    prioritize,
    removeNonG722,
    setApplicationSpecificBandwidth: function setApplicationSpecificBandwidth(sdp, bandwidth, isScreen) {
      return setBAS(sdp, bandwidth, isScreen);
    },
    setVideoBitrates: function setVideoBitrates(sdp, params) {
      return _setVideoBitrates(sdp, params);
    },
    setOpusAttributes: function setOpusAttributes(sdp, params) {
      return _setOpusAttributes(sdp, params);
    },
    preferVP9: function preferVP9(sdp) {
      return preferCodec(sdp, 'vp9');
    },
    preferCodec,
    forceStereoAudio,
  };
})();

'use strict';

const videoChat = (() => {
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

  const startWatchNetwork = () => {
    networkInterval = setInterval(() => {
      pingos.startTime = Date.now();
      socket.emit('pingil', padId, window.headerId, Helper.getUserId(), pingos.avg);
    }, pingos.interavCheck);
  };

  const stopWatchNetwork = () => clearInterval(networkInterval);

  const mediaDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((deviceInputs) => {
      const videoSettings = localStorage.getItem('videoSettings');
      const { microphone, speaker, camera } = JSON.parse(videoSettings);

      const audioInputSection = document.querySelector('.select.audioSource select');
      const audioOutputSection = document.querySelector('.select.audioOutputSec select');
      const videoSection = document.querySelector('.select.videoSource select');

      const audioInputElement = document.createElement('select');
      const audioOutputElement = document.createElement('select');
      const videoElement = document.createElement('select');

      for (const deviceInfo of deviceInputs) {
        const option = document.createElement('option');
        const { deviceId, label, kind } = deviceInfo;
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

  const isUserMediaAvailable = () => window.navigator.mediaDevices
    .getUserMedia({ audio: true, video: true });

  const removeUserFromRoom = (data, roomInfo, cb) => {
    if (!data || !roomInfo || !data.userId) return false;
    const headerId = data.headerId;
    const headerTitle = Helper.findAceHeaderElement(headerId).text;

    const userCount = roomInfo.present;
    $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text(userCount);

    if (userCount === 0) $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text('');

    const user = Helper.getUserFromId(data.userId);

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
      $(`.header_videochat_icon[data-id='${headerId}'] .icon`).removeClass('active');
    }

    if (data.userId === clientVars.userId) {
      Helper.$bodyAceOuter().find(`#wrtcVideoIcons #${headerId}`)
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
      })
        .attr({ 'data-active': false });

      WRTC.deactivate(data.userId, data.headerId);

      Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', false);

      Helper.stopStreaming();
      socket.removeListener(`receiveTextMessage:${data.headerId}`);
    }

    if (cb && typeof cb === 'function') cb();

    Helper.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo);

    Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);

    WRTC.userLeave(data.userId);
  };

  const addUserToRoom = (data, roomInfo) => {
    if (!data || !data.userId) return false;
    const headerId = data.headerId;

    const user = Helper.getUserFromId(data.userId);
    // some user may session does exist but the user info does not available in all over the current pad
    if (!user) return true;

    // TODO: this is not good idea, use global state
    // if incoming user has already in the room don't persuade the request
    // if (IsUserInRooms) return false;
    const userCount = roomInfo.present;

    $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text(userCount);
    if (userCount === 0) $(`.header_videochat_icon[data-id='${headerId}'] .icon .userCount`).text('');

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
      })
        .attr({ 'data-active': true });

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

  const createSession = (headerId, userInfo, $joinButton) => {
    Helper.$bodyAceOuter().find('button.btn_joinChat_chatRoom')
      .removeClass('active');
    $joinBtn = $joinButton;
    isUserMediaAvailable().then((stream) => {
      // stop last stream
      Helper.stopStreaming(() => {
        Helper.wrtcStore.localstream = stream;
      });

      const participators = window.pad.collabClient.getConnectedUsers().map((x) => x.userId);

      if (!currentRoom.userId) {
        return socket.emit('userJoin', padId, participators, userInfo, 'video', gateway_userJoin);
      }
      // If the user has already joined the video chat, make suer leave that room then join to the new chat room
      socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
        gateway_userLeave(_userData, roomInfo, () => {
          socket.emit('userJoin', padId, participators, userInfo, 'video', gateway_userJoin);
        });
      });
    })
      .catch((err) => {
        console.error(err);
        Helper.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
        Helper.wrtcPubsub.emit('componentsFlow', 'video', 'open', false);
        Helper.stopStreaming();
        socket.emit('userLeave', padId, currentRoom, 'video', (_userData, roomInfo) => {
          gateway_userLeave(_userData, roomInfo);
        });
        WRTC.showUserMediaError(err, Helper.getUserId(), headerId);
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
    socket.emit('userLeave', padId, data, 'video', gateway_userLeave);
  };

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
  const gateway_userJoin = (data, roomInfo, showAlert = true, bulkUpdate = false) => {
    console.info('[wrtc]: gateway user joining,', data, roomInfo, showAlert);
    // If user data does not exist return false
    if (!data) return reachedVideoRoomSize(null, false, false);

    // if user data exist then check room size
    if (data && reachedVideoRoomSize(roomInfo, showAlert, bulkUpdate)) {
      return addUserToRoom(data, roomInfo);
    } else if (bulkUpdate) {
      return addUserToRoom(data, roomInfo);
    }
    Helper.stopStreaming();
    return false;
  };

  const gateway_userLeave = (data, roomInfo, cb) => {
    removeUserFromRoom(data, roomInfo, cb);
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
          .css({ color })
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
        .css({ color })
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
    gateway_userJoin,
    gateway_userLeave,
    reloadSession,
    reloadCurrentSession,
    mediaDevices,

  };
})();

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
      socket.emit('getVideoRoomInfo', padId, headerId, (result) => {
        if (result) Helper.inlineAvatar.ROOM(headerId, result);
      });
    },
  };

  return self;
})();

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
'use strict';

const WRTC = (() => {
  const attemptReconnect = 60;
  let reconnected = 0;
  const videoSizes = { large: '260px', small: '160px' };
  const pcConfig = {};
  let audioInputSelect = null;
  let videoSelect = null;
  let audioOutputSelect = null;
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
  const callQueue = [];
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

      $(document).on('change', 'select#audioSource', self.audioVideoInputChange);
      $(document).on('change', 'select#videoSource', self.audioVideoInputChange);
      $(document).on('change', 'select#audioOutput', self.changeAudioDestination);

      $(window).on('unload', () => {
        console.info('[wrtc]: windos unloaded, now hangupAll');
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
          $(this).attr({ 'data-action': 'expand' });
          $parent.find('.btn_enlarge').removeAttr('active');
          $('#wrtc_modal').css({
            transform: `translate(-50%, -${videoBox}px)`,
          });
        } else {
          $(this).attr({ 'data-action': 'collapse' });
          $parent.find('.btn_enlarge').attr({ active: true });
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
          $this.attr({ 'data-active': true });
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

          const getStats = (pc[userID[0]], (result) => {
            const { video, audio, bandwidth, resolutions: { send, recv } } = result;
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
        gState = 'LEAVING';
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
        },
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
    deactivate: (userId, headerId) => {
      if (!userId) return false;
      self.hide(userId);
      self.hangupAll(headerId);
      self.hangup(userId, true, headerId);
      if (Helper.wrtcStore.localstream) Helper.stopStreaming();
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

          $video.parent().css({ 'width': videoSize, 'max-height': videoSize });
          $video.css({ 'width': videoSize, 'max-height': videoSize });
        });

      if ($(document).find('#wrtc_modal .ndbtn.btn_enlarge')
        .hasClass('large')) {
        $video.parent().css({
          'width': videoSizes.large, 'max-height': videoSizes.large,
        });
        $video.css({ 'width': videoSizes.large, 'max-height': videoSizes.large });
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
      const msg = { component: 'pad', type: 'STATS', data: { statName, type: 'RTC_MESSAGE' } };
      socket.emit('acceptNewCall', padId, window.headerId);
      socket.emit('message', msg);
    },
    sendMessage: (to, data, socketIdTo) => {
      socket.emit('RTC_MESSAGE', {
        type: 'RTC_MESSAGE',
        payload: { data, to, padId, from: Helper.getUserId(), socket: { from: socket.id, to: socketIdTo } },
      }, (data) => {
        // console.log('coming data', data);
      });
      // deprecated function
      // self._pad.collabClient.sendMessage({
      // 	type: 'RTC_MESSAGE',
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
              self.sendMessage(peer, { type: 'answer', answer: desc, headerId: data.headerId });
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
    hangup(userId, notify, headerId) {
      notify = arguments.length === 1 ? true : notify;
      if (pc[userId] && userId !== Helper.getUserId()) {
        self.setStream(userId, '');
        pc[userId].close();
        delete pc[userId];
        if (notify) self.sendMessage(userId, { type: 'hangup', headerId });
      }
    },
    call: (userId, headerId) => {
      // if (!localStream) {
      //   callQueue.push(userId);
      //   return;
      // }
      let constraints = { optional: [], mandatory: {} };
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
          self.sendMessage(userId, { type: 'offer', offer: desc, headerId });
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
    audioVideoInputChange: () => {
      Helper.stopStreaming(() => {
        self.getUserMedia(window.headerId);
      });
    },
    attachSinkId: (element, sinkId) => {
      // Attach audio output device to video element using device/sink ID.
      if (element && element[0] && typeof element[0].sinkId !== 'undefined') {
        element[0].setSinkId(sinkId).then(() => {
          // console.info(`Success, audio output device attached: ${sinkId}`);
        })
          .catch((error) => {
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
        $(document).find('#wrtc_settings .select.audioOutputSec')
          .hide();
      }
    },
    changeAudioDestination: () => {
      const cls = '#wrtc_settings .select.audioOutputSec';
      const audioOutputSelect = document.querySelector(cls);
      const audioDestination = audioOutputSelect.value;
      const videoElement = localVideoElement;
      self.attachSinkId(videoElement, audioDestination);
    },
    getUserMedia: (headerId) => {
      audioInputSelect = document.querySelector('#wrtc_settings .select.audioSource');
      audioOutputSelect = document.querySelector('#wrtc_settings .select.audioOutputSec');
      videoSelect = document.querySelector('#wrtc_settings .select.videoSource');

      const audioSource = audioInputSelect ? audioInputSelect.value : undefined;
      const videoSource = videoSelect ? videoSelect.value : undefined;
      const audioOutput = audioOutputSelect ? audioOutputSelect.value : undefined;

      const mediaConstraints = {
        audio: true,
        video: {
          width: 320,
          height: 240,
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user',
        },
      };

      if (audioSource) {
        mediaConstraints.audio.deviceId = { exact: audioSource };
      }
      if (videoSource) {
        mediaConstraints.video.deviceId = { exact: videoSource };
      }

      const newSettings = {
        microphone: audioSource,
        speaker: audioOutput,
        camera: videoSource,
      };

      localStorage.setItem('videoSettings', JSON.stringify(newSettings));
      $('#wrtc_modal #networkError').removeClass('active')
        .hide();

      window.navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((stream) => {
          Helper.wrtcStore.localstream = stream;
          self.setStream(Helper.getUserId(), stream);
          self._pad.collabClient.getConnectedUsers().forEach((user) => {
            if (user.userId !== Helper.getUserId()) {
              if (pc[user.userId]) {
                self.hangup(user.userId, false, headerId);
              }
              self.call(user.userId, headerId);
            }
          });
        })
        .catch((err) => {
          self.showUserMediaError(err, Helper.getUserId(), headerId);
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

  const logError = (error) => {
    // if (error && error.message.includes("Failed to set remote answer sdp")) {
    self.attemptToReconnect();
    // } else {
    // socket.emit('acceptNewCall', padId, window.headerId);
    // }
    console.error('[wrtc]: LogError:', error);
    $('#wrtc_modal #networkError').show()
      .addClass('active')
      .text(`[wrtc]: Error: ${error} ,Reload the session.`);
  };

  self.pc = pc;
  return self;
})();
