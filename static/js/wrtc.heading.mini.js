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
	
	var adapter = (0, _adapter_factory.adapterFactory)({ window: window });
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
	
	var _edge_shim = require('./edge/edge_shim');
	
	var edgeShim = _interopRequireWildcard(_edge_shim);
	
	var _firefox_shim = require('./firefox/firefox_shim');
	
	var firefoxShim = _interopRequireWildcard(_firefox_shim);
	
	var _safari_shim = require('./safari/safari_shim');
	
	var safariShim = _interopRequireWildcard(_safari_shim);
	
	var _common_shim = require('./common_shim');
	
	var commonShim = _interopRequireWildcard(_common_shim);
	
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
			shimEdge: true,
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
			disableWarnings: utils.disableWarnings
		};
	
		// Shim browser if found.
		switch (browserDetails.browser) {
			case 'chrome':
				if (!chromeShim || !chromeShim.shimPeerConnection || !options.shimChrome) {
					logging('Chrome shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming chrome.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = chromeShim;
	
				chromeShim.shimGetUserMedia(window);
				chromeShim.shimMediaStream(window);
				chromeShim.shimPeerConnection(window);
				chromeShim.shimOnTrack(window);
				chromeShim.shimAddTrackRemoveTrack(window);
				chromeShim.shimGetSendersWithDtmf(window);
				chromeShim.shimGetStats(window);
				chromeShim.shimSenderReceiverGetStats(window);
				chromeShim.fixNegotiationNeeded(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimConnectionState(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				commonShim.removeAllowExtmapMixed(window);
				break;
			case 'firefox':
				if (!firefoxShim || !firefoxShim.shimPeerConnection || !options.shimFirefox) {
					logging('Firefox shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming firefox.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = firefoxShim;
	
				firefoxShim.shimGetUserMedia(window);
				firefoxShim.shimPeerConnection(window);
				firefoxShim.shimOnTrack(window);
				firefoxShim.shimRemoveStream(window);
				firefoxShim.shimSenderGetStats(window);
				firefoxShim.shimReceiverGetStats(window);
				firefoxShim.shimRTCDataChannel(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimConnectionState(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				break;
			case 'edge':
				if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
					logging('MS edge shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming edge.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = edgeShim;
	
				edgeShim.shimGetUserMedia(window);
				edgeShim.shimGetDisplayMedia(window);
				edgeShim.shimPeerConnection(window);
				edgeShim.shimReplaceTrack(window);
	
				// the edge shim implements the full RTCIceCandidate object.
	
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				break;
			case 'safari':
				if (!safariShim || !options.shimSafari) {
					logging('Safari shim is not included in this adapter release.');
					return adapter;
				}
				logging('adapter.js shimming safari.');
				// Export to the adapter global object visible in the browser.
				adapter.browserShim = safariShim;
	
				safariShim.shimRTCIceServerUrls(window);
				safariShim.shimCreateOfferLegacy(window);
				safariShim.shimCallbacksAPI(window);
				safariShim.shimLocalStreamsAPI(window);
				safariShim.shimRemoteStreamsAPI(window);
				safariShim.shimTrackEventTransceiver(window);
				safariShim.shimGetUserMedia(window);
	
				commonShim.shimRTCIceCandidate(window);
				commonShim.shimMaxMessageSize(window);
				commonShim.shimSendThrowTypeError(window);
				commonShim.removeAllowExtmapMixed(window);
				break;
			default:
				logging('Unsupported browser!');
				break;
		}
	
		return adapter;
	}
	
	// Browser shims.
	
	},{"./chrome/chrome_shim":3,"./common_shim":6,"./edge/edge_shim":7,"./firefox/firefox_shim":11,"./safari/safari_shim":14,"./utils":15}],3:[function(require,module,exports){
	
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
	
	function shimAddTrackRemoveTrack(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
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
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
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
	
		// support for addIceCandidate(null or undefined)
		var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
		window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
			if (!arguments[0]) {
				if (arguments[1]) {
					arguments[1].apply(null);
				}
				return Promise.resolve();
			}
			// Firefox 68+ emits and processes {candidate: "", ...}, ignore
			// in older versions. Native support planned for Chrome M77.
			if (browserDetails.version < 78 && arguments[0] && arguments[0].candidate === '') {
				return Promise.resolve();
			}
			return nativeAddIceCandidate.apply(this, arguments);
		};
	}
	
	function fixNegotiationNeeded(window) {
		utils.wrapPeerConnectionEvent(window, 'negotiationneeded', function (e) {
			var pc = e.target;
			if (pc.signalingState !== 'stable') {
				return;
			}
			return e;
		});
	}
	
	},{"../utils.js":15,"./getdisplaymedia":4,"./getusermedia":5}],4:[function(require,module,exports){
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
	
	function shimGetUserMedia(window) {
		var navigator = window && window.navigator;
	
		if (!navigator.mediaDevices) {
			return;
		}
	
		var browserDetails = utils.detectBrowser(window);
	
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
	
	},{"../utils.js":15}],6:[function(require,module,exports){
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
	exports.removeAllowExtmapMixed = removeAllowExtmapMixed;
	
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
	
	function shimMaxMessageSize(window) {
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
	
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
	
	function removeAllowExtmapMixed(window) {
		/* remove a=extmap-allow-mixed for Chrome < M71 */
		if (!window.RTCPeerConnection) {
			return;
		}
		var browserDetails = utils.detectBrowser(window);
		if (browserDetails.browser === 'chrome' && browserDetails.version >= 71) {
			return;
		}
		var nativeSRD = window.RTCPeerConnection.prototype.setRemoteDescription;
		window.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
			if (desc && desc.sdp && desc.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
				desc.sdp = desc.sdp.split('\n').filter(function (line) {
					return line.trim() !== 'a=extmap-allow-mixed';
				}).join('\n');
			}
			return nativeSRD.apply(this, arguments);
		};
	}
	
	},{"./utils":15,"sdp":17}],7:[function(require,module,exports){
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
	exports.shimPeerConnection = shimPeerConnection;
	exports.shimReplaceTrack = shimReplaceTrack;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	var _filtericeservers = require('./filtericeservers');
	
	var _rtcpeerconnectionShim = require('rtcpeerconnection-shim');
	
	var _rtcpeerconnectionShim2 = _interopRequireDefault(_rtcpeerconnectionShim);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
		if (window.RTCIceGatherer) {
			if (!window.RTCIceCandidate) {
				window.RTCIceCandidate = function RTCIceCandidate(args) {
					return args;
				};
			}
			if (!window.RTCSessionDescription) {
				window.RTCSessionDescription = function RTCSessionDescription(args) {
					return args;
				};
			}
			// this adds an additional event listener to MediaStrackTrack that signals
			// when a tracks enabled property was changed. Workaround for a bug in
			// addStream, see below. No longer required in 15025+
			if (browserDetails.version < 15025) {
				var origMSTEnabled = Object.getOwnPropertyDescriptor(window.MediaStreamTrack.prototype, 'enabled');
				Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
					set: function set(value) {
						origMSTEnabled.set.call(this, value);
						var ev = new Event('enabled');
						ev.enabled = value;
						this.dispatchEvent(ev);
					}
				});
			}
		}
	
		// ORTC defines the DTMF sender a bit different.
		// https://github.com/w3c/ortc/issues/714
		if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
			Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
				get: function get() {
					if (this._dtmf === undefined) {
						if (this.track.kind === 'audio') {
							this._dtmf = new window.RTCDtmfSender(this);
						} else if (this.track.kind === 'video') {
							this._dtmf = null;
						}
					}
					return this._dtmf;
				}
			});
		}
		// Edge currently only implements the RTCDtmfSender, not the
		// RTCDTMFSender alias. See http://draft.ortc.org/#rtcdtmfsender2*
		if (window.RTCDtmfSender && !window.RTCDTMFSender) {
			window.RTCDTMFSender = window.RTCDtmfSender;
		}
	
		var RTCPeerConnectionShim = (0, _rtcpeerconnectionShim2.default)(window, browserDetails.version);
		window.RTCPeerConnection = function RTCPeerConnection(config) {
			if (config && config.iceServers) {
				config.iceServers = (0, _filtericeservers.filterIceServers)(config.iceServers, browserDetails.version);
				utils.log('ICE servers after filtering:', config.iceServers);
			}
			return new RTCPeerConnectionShim(config);
		};
		window.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
	}
	
	function shimReplaceTrack(window) {
		// ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
		if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
			window.RTCRtpSender.prototype.replaceTrack = window.RTCRtpSender.prototype.setTrack;
		}
	}
	
	},{"../utils":15,"./filtericeservers":8,"./getdisplaymedia":9,"./getusermedia":10,"rtcpeerconnection-shim":16}],8:[function(require,module,exports){
	/*
	 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
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
	exports.filterIceServers = filterIceServers;
	
	var _utils = require('../utils');
	
	var utils = _interopRequireWildcard(_utils);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	// Edge does not like
	// 1) stun: filtered after 14393 unless ?transport=udp is present
	// 2) turn: that does not have all of turn:host:port?transport=udp
	// 3) turn: with ipv6 addresses
	// 4) turn: occurring muliple times
	function filterIceServers(iceServers, edgeVersion) {
		var hasTurn = false;
		iceServers = JSON.parse(JSON.stringify(iceServers));
		return iceServers.filter(function (server) {
			if (server && (server.urls || server.url)) {
				var urls = server.urls || server.url;
				if (server.url && !server.urls) {
					utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
				}
				var isString = typeof urls === 'string';
				if (isString) {
					urls = [urls];
				}
				urls = urls.filter(function (url) {
					// filter STUN unconditionally.
					if (url.indexOf('stun:') === 0) {
						return false;
					}
	
					var validTurn = url.startsWith('turn') && !url.startsWith('turn:[') && url.includes('transport=udp');
					if (validTurn && !hasTurn) {
						hasTurn = true;
						return true;
					}
					return validTurn && !hasTurn;
				});
	
				delete server.url;
				server.urls = isString ? urls[0] : urls;
				return !!urls.length;
			}
		});
	}
	
	},{"../utils":15}],9:[function(require,module,exports){
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
	function shimGetDisplayMedia(window) {
		if (!('getDisplayMedia' in window.navigator)) {
			return;
		}
		if (!window.navigator.mediaDevices) {
			return;
		}
		if (window.navigator.mediaDevices && 'getDisplayMedia' in window.navigator.mediaDevices) {
			return;
		}
		window.navigator.mediaDevices.getDisplayMedia = window.navigator.getDisplayMedia.bind(window.navigator);
	}
	
	},{}],10:[function(require,module,exports){
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
	exports.shimGetUserMedia = shimGetUserMedia;
	function shimGetUserMedia(window) {
		var navigator = window && window.navigator;
	
		var shimError_ = function shimError_(e) {
			return {
				name: { PermissionDeniedError: 'NotAllowedError' }[e.name] || e.name,
				message: e.message,
				constraint: e.constraint,
				toString: function toString() {
					return this.name;
				}
			};
		};
	
		// getUserMedia error shim.
		var origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
		navigator.mediaDevices.getUserMedia = function (c) {
			return origGetUserMedia(c).catch(function (e) {
				return Promise.reject(shimError_(e));
			});
		};
	}
	
	},{}],11:[function(require,module,exports){
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
	
	function shimPeerConnection(window) {
		var browserDetails = utils.detectBrowser(window);
	
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
	
		// support for addIceCandidate(null or undefined)
		var nativeAddIceCandidate = window.RTCPeerConnection.prototype.addIceCandidate;
		window.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
			if (!arguments[0]) {
				if (arguments[1]) {
					arguments[1].apply(null);
				}
				return Promise.resolve();
			}
			// Firefox 68+ emits and processes {candidate: "", ...}, ignore
			// in older versions.
			if (browserDetails.version < 68 && arguments[0] && arguments[0].candidate === '') {
				return Promise.resolve();
			}
			return nativeAddIceCandidate.apply(this, arguments);
		};
	
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
	
	},{"../utils":15,"./getdisplaymedia":12,"./getusermedia":13}],12:[function(require,module,exports){
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
	
	},{}],13:[function(require,module,exports){
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
	
	function shimGetUserMedia(window) {
		var browserDetails = utils.detectBrowser(window);
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
	
	},{"../utils":15}],14:[function(require,module,exports){
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
				var stream = arguments[1];
				if (stream) {
					if (!this._localStreams) {
						this._localStreams = [stream];
					} else if (!this._localStreams.includes(stream)) {
						this._localStreams.push(stream);
					}
				}
				return _addTrack.apply(this, arguments);
			};
		}
		if (!('removeStream' in window.RTCPeerConnection.prototype)) {
			window.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
				var _this2 = this;
	
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
						_this2.removeTrack(sender);
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
					var _this3 = this;
	
					if (this._onaddstream) {
						this.removeEventListener('addstream', this._onaddstream);
						this.removeEventListener('track', this._onaddstreampoly);
					}
					this.addEventListener('addstream', this._onaddstream = f);
					this.addEventListener('track', this._onaddstreampoly = function (e) {
						e.streams.forEach(function (stream) {
							if (!_this3._remoteStreams) {
								_this3._remoteStreams = [];
							}
							if (_this3._remoteStreams.includes(stream)) {
								return;
							}
							_this3._remoteStreams.push(stream);
							var event = new Event('addstream');
							event.stream = stream;
							_this3.dispatchEvent(event);
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
		if ('generateCertificate' in window.RTCPeerConnection) {
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
					this.addTransceiver('audio');
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
					this.addTransceiver('video');
				}
			}
			return origCreateOffer.apply(this, arguments);
		};
	}
	
	},{"../utils":15}],15:[function(require,module,exports){
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
					cb(modifiedEvent);
				}
			};
			this._eventMap = this._eventMap || {};
			this._eventMap[cb] = wrappedCallback;
			return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
		};
	
		var nativeRemoveEventListener = proto.removeEventListener;
		proto.removeEventListener = function (nativeEventName, cb) {
			if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[cb]) {
				return nativeRemoveEventListener.apply(this, arguments);
			}
			var unwrappedCb = this._eventMap[cb];
			delete this._eventMap[cb];
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
		var navigator = window.navigator;
	
		// Returned result object.
	
		var result = { browser: null, version: null };
	
		// Fail early if it's not a browser
		if (typeof window === 'undefined' || !window.navigator) {
			result.browser = 'Not a browser.';
			return result;
		}
	
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
		} else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
			// Edge.
			result.browser = 'edge';
			result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);
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
	
	},{}],16:[function(require,module,exports){
	/*
	 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
	 *
	 *  Use of this source code is governed by a BSD-style license
	 *  that can be found in the LICENSE file in the root of the source
	 *  tree.
	 */
	 /* eslint-env node */
	'use strict';
	
	var SDPUtils = require('sdp');
	
	function fixStatsType(stat) {
		return {
			inboundrtp: 'inbound-rtp',
			outboundrtp: 'outbound-rtp',
			candidatepair: 'candidate-pair',
			localcandidate: 'local-candidate',
			remotecandidate: 'remote-candidate'
		}[stat.type] || stat.type;
	}
	
	function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
		var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);
	
		// Map ICE parameters (ufrag, pwd) to SDP.
		sdp += SDPUtils.writeIceParameters(
				transceiver.iceGatherer.getLocalParameters());
	
		// Map DTLS parameters to SDP.
		sdp += SDPUtils.writeDtlsParameters(
				transceiver.dtlsTransport.getLocalParameters(),
				type === 'offer' ? 'actpass' : dtlsRole || 'active');
	
		sdp += 'a=mid:' + transceiver.mid + '\r\n';
	
		if (transceiver.rtpSender && transceiver.rtpReceiver) {
			sdp += 'a=sendrecv\r\n';
		} else if (transceiver.rtpSender) {
			sdp += 'a=sendonly\r\n';
		} else if (transceiver.rtpReceiver) {
			sdp += 'a=recvonly\r\n';
		} else {
			sdp += 'a=inactive\r\n';
		}
	
		if (transceiver.rtpSender) {
			var trackId = transceiver.rtpSender._initialTrackId ||
					transceiver.rtpSender.track.id;
			transceiver.rtpSender._initialTrackId = trackId;
			// spec.
			var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
					trackId + '\r\n';
			sdp += 'a=' + msid;
			// for Chrome. Legacy should no longer be required.
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
					' ' + msid;
	
			// RTX
			if (transceiver.sendEncodingParameters[0].rtx) {
				sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
						' ' + msid;
				sdp += 'a=ssrc-group:FID ' +
						transceiver.sendEncodingParameters[0].ssrc + ' ' +
						transceiver.sendEncodingParameters[0].rtx.ssrc +
						'\r\n';
			}
		}
		// FIXME: this should be written by writeRtpDescription.
		sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
				' cname:' + SDPUtils.localCName + '\r\n';
		if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
					' cname:' + SDPUtils.localCName + '\r\n';
		}
		return sdp;
	}
	
	// Edge does not like
	// 1) stun: filtered after 14393 unless ?transport=udp is present
	// 2) turn: that does not have all of turn:host:port?transport=udp
	// 3) turn: with ipv6 addresses
	// 4) turn: occurring muliple times
	function filterIceServers(iceServers, edgeVersion) {
		var hasTurn = false;
		iceServers = JSON.parse(JSON.stringify(iceServers));
		return iceServers.filter(function(server) {
			if (server && (server.urls || server.url)) {
				var urls = server.urls || server.url;
				if (server.url && !server.urls) {
					console.warn('RTCIceServer.url is deprecated! Use urls instead.');
				}
				var isString = typeof urls === 'string';
				if (isString) {
					urls = [urls];
				}
				urls = urls.filter(function(url) {
					var validTurn = url.indexOf('turn:') === 0 &&
							url.indexOf('transport=udp') !== -1 &&
							url.indexOf('turn:[') === -1 &&
							!hasTurn;
	
					if (validTurn) {
						hasTurn = true;
						return true;
					}
					return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
							url.indexOf('?transport=udp') === -1;
				});
	
				delete server.url;
				server.urls = isString ? urls[0] : urls;
				return !!urls.length;
			}
		});
	}
	
	// Determines the intersection of local and remote capabilities.
	function getCommonCapabilities(localCapabilities, remoteCapabilities) {
		var commonCapabilities = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		};
	
		var findCodecByPayloadType = function(pt, codecs) {
			pt = parseInt(pt, 10);
			for (var i = 0; i < codecs.length; i++) {
				if (codecs[i].payloadType === pt ||
						codecs[i].preferredPayloadType === pt) {
					return codecs[i];
				}
			}
		};
	
		var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
			var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
			var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
			return lCodec && rCodec &&
					lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
		};
	
		localCapabilities.codecs.forEach(function(lCodec) {
			for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
				var rCodec = remoteCapabilities.codecs[i];
				if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
						lCodec.clockRate === rCodec.clockRate) {
					if (lCodec.name.toLowerCase() === 'rtx' &&
							lCodec.parameters && rCodec.parameters.apt) {
						// for RTX we need to find the local rtx that has a apt
						// which points to the same local codec as the remote one.
						if (!rtxCapabilityMatches(lCodec, rCodec,
								localCapabilities.codecs, remoteCapabilities.codecs)) {
							continue;
						}
					}
					rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
					// number of channels is the highest common number of channels
					rCodec.numChannels = Math.min(lCodec.numChannels,
							rCodec.numChannels);
					// push rCodec so we reply with offerer payload type
					commonCapabilities.codecs.push(rCodec);
	
					// determine common feedback mechanisms
					rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
						for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
							if (lCodec.rtcpFeedback[j].type === fb.type &&
									lCodec.rtcpFeedback[j].parameter === fb.parameter) {
								return true;
							}
						}
						return false;
					});
					// FIXME: also need to determine .parameters
					//  see https://github.com/openpeer/ortc/issues/569
					break;
				}
			}
		});
	
		localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
			for (var i = 0; i < remoteCapabilities.headerExtensions.length;
					 i++) {
				var rHeaderExtension = remoteCapabilities.headerExtensions[i];
				if (lHeaderExtension.uri === rHeaderExtension.uri) {
					commonCapabilities.headerExtensions.push(rHeaderExtension);
					break;
				}
			}
		});
	
		// FIXME: fecMechanisms
		return commonCapabilities;
	}
	
	// is action=setLocalDescription with type allowed in signalingState
	function isActionAllowedInSignalingState(action, type, signalingState) {
		return {
			offer: {
				setLocalDescription: ['stable', 'have-local-offer'],
				setRemoteDescription: ['stable', 'have-remote-offer']
			},
			answer: {
				setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
				setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
			}
		}[type][action].indexOf(signalingState) !== -1;
	}
	
	function maybeAddCandidate(iceTransport, candidate) {
		// Edge's internal representation adds some fields therefore
		// not all fieldѕ are taken into account.
		var alreadyAdded = iceTransport.getRemoteCandidates()
				.find(function(remoteCandidate) {
					return candidate.foundation === remoteCandidate.foundation &&
							candidate.ip === remoteCandidate.ip &&
							candidate.port === remoteCandidate.port &&
							candidate.priority === remoteCandidate.priority &&
							candidate.protocol === remoteCandidate.protocol &&
							candidate.type === remoteCandidate.type;
				});
		if (!alreadyAdded) {
			iceTransport.addRemoteCandidate(candidate);
		}
		return !alreadyAdded;
	}
	
	
	function makeError(name, description) {
		var e = new Error(description);
		e.name = name;
		// legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
		e.code = {
			NotSupportedError: 9,
			InvalidStateError: 11,
			InvalidAccessError: 15,
			TypeError: undefined,
			OperationError: undefined
		}[name];
		return e;
	}
	
	module.exports = function(window, edgeVersion) {
		// https://w3c.github.io/mediacapture-main/#mediastream
		// Helper function to add the track to the stream and
		// dispatch the event ourselves.
		function addTrackToStreamAndFireEvent(track, stream) {
			stream.addTrack(track);
			stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
					{track: track}));
		}
	
		function removeTrackFromStreamAndFireEvent(track, stream) {
			stream.removeTrack(track);
			stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
					{track: track}));
		}
	
		function fireAddTrack(pc, track, receiver, streams) {
			var trackEvent = new Event('track');
			trackEvent.track = track;
			trackEvent.receiver = receiver;
			trackEvent.transceiver = {receiver: receiver};
			trackEvent.streams = streams;
			window.setTimeout(function() {
				pc._dispatchEvent('track', trackEvent);
			});
		}
	
		var RTCPeerConnection = function(config) {
			var pc = this;
	
			var _eventTarget = document.createDocumentFragment();
			['addEventListener', 'removeEventListener', 'dispatchEvent']
					.forEach(function(method) {
						pc[method] = _eventTarget[method].bind(_eventTarget);
					});
	
			this.canTrickleIceCandidates = null;
	
			this.needNegotiation = false;
	
			this.localStreams = [];
			this.remoteStreams = [];
	
			this._localDescription = null;
			this._remoteDescription = null;
	
			this.signalingState = 'stable';
			this.iceConnectionState = 'new';
			this.connectionState = 'new';
			this.iceGatheringState = 'new';
	
			config = JSON.parse(JSON.stringify(config || {}));
	
			this.usingBundle = config.bundlePolicy === 'max-bundle';
			if (config.rtcpMuxPolicy === 'negotiate') {
				throw(makeError('NotSupportedError',
						'rtcpMuxPolicy \'negotiate\' is not supported'));
			} else if (!config.rtcpMuxPolicy) {
				config.rtcpMuxPolicy = 'require';
			}
	
			switch (config.iceTransportPolicy) {
				case 'all':
				case 'relay':
					break;
				default:
					config.iceTransportPolicy = 'all';
					break;
			}
	
			switch (config.bundlePolicy) {
				case 'balanced':
				case 'max-compat':
				case 'max-bundle':
					break;
				default:
					config.bundlePolicy = 'balanced';
					break;
			}
	
			config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);
	
			this._iceGatherers = [];
			if (config.iceCandidatePoolSize) {
				for (var i = config.iceCandidatePoolSize; i > 0; i--) {
					this._iceGatherers.push(new window.RTCIceGatherer({
						iceServers: config.iceServers,
						gatherPolicy: config.iceTransportPolicy
					}));
				}
			} else {
				config.iceCandidatePoolSize = 0;
			}
	
			this._config = config;
	
			// per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
			// everything that is needed to describe a SDP m-line.
			this.transceivers = [];
	
			this._sdpSessionId = SDPUtils.generateSessionId();
			this._sdpSessionVersion = 0;
	
			this._dtlsRole = undefined; // role for a=setup to use in answers.
	
			this._isClosed = false;
		};
	
		Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
			configurable: true,
			get: function() {
				return this._localDescription;
			}
		});
		Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
			configurable: true,
			get: function() {
				return this._remoteDescription;
			}
		});
	
		// set up event handlers on prototype
		RTCPeerConnection.prototype.onicecandidate = null;
		RTCPeerConnection.prototype.onaddstream = null;
		RTCPeerConnection.prototype.ontrack = null;
		RTCPeerConnection.prototype.onremovestream = null;
		RTCPeerConnection.prototype.onsignalingstatechange = null;
		RTCPeerConnection.prototype.oniceconnectionstatechange = null;
		RTCPeerConnection.prototype.onconnectionstatechange = null;
		RTCPeerConnection.prototype.onicegatheringstatechange = null;
		RTCPeerConnection.prototype.onnegotiationneeded = null;
		RTCPeerConnection.prototype.ondatachannel = null;
	
		RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
			if (this._isClosed) {
				return;
			}
			this.dispatchEvent(event);
			if (typeof this['on' + name] === 'function') {
				this['on' + name](event);
			}
		};
	
		RTCPeerConnection.prototype._emitGatheringStateChange = function() {
			var event = new Event('icegatheringstatechange');
			this._dispatchEvent('icegatheringstatechange', event);
		};
	
		RTCPeerConnection.prototype.getConfiguration = function() {
			return this._config;
		};
	
		RTCPeerConnection.prototype.getLocalStreams = function() {
			return this.localStreams;
		};
	
		RTCPeerConnection.prototype.getRemoteStreams = function() {
			return this.remoteStreams;
		};
	
		// internal helper to create a transceiver object.
		// (which is not yet the same as the WebRTC 1.0 transceiver)
		RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
			var hasBundleTransport = this.transceivers.length > 0;
			var transceiver = {
				track: null,
				iceGatherer: null,
				iceTransport: null,
				dtlsTransport: null,
				localCapabilities: null,
				remoteCapabilities: null,
				rtpSender: null,
				rtpReceiver: null,
				kind: kind,
				mid: null,
				sendEncodingParameters: null,
				recvEncodingParameters: null,
				stream: null,
				associatedRemoteMediaStreams: [],
				wantReceive: true
			};
			if (this.usingBundle && hasBundleTransport) {
				transceiver.iceTransport = this.transceivers[0].iceTransport;
				transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
			} else {
				var transports = this._createIceAndDtlsTransports();
				transceiver.iceTransport = transports.iceTransport;
				transceiver.dtlsTransport = transports.dtlsTransport;
			}
			if (!doNotAdd) {
				this.transceivers.push(transceiver);
			}
			return transceiver;
		};
	
		RTCPeerConnection.prototype.addTrack = function(track, stream) {
			if (this._isClosed) {
				throw makeError('InvalidStateError',
						'Attempted to call addTrack on a closed peerconnection.');
			}
	
			var alreadyExists = this.transceivers.find(function(s) {
				return s.track === track;
			});
	
			if (alreadyExists) {
				throw makeError('InvalidAccessError', 'Track already exists.');
			}
	
			var transceiver;
			for (var i = 0; i < this.transceivers.length; i++) {
				if (!this.transceivers[i].track &&
						this.transceivers[i].kind === track.kind) {
					transceiver = this.transceivers[i];
				}
			}
			if (!transceiver) {
				transceiver = this._createTransceiver(track.kind);
			}
	
			this._maybeFireNegotiationNeeded();
	
			if (this.localStreams.indexOf(stream) === -1) {
				this.localStreams.push(stream);
			}
	
			transceiver.track = track;
			transceiver.stream = stream;
			transceiver.rtpSender = new window.RTCRtpSender(track,
					transceiver.dtlsTransport);
			return transceiver.rtpSender;
		};
	
		RTCPeerConnection.prototype.addStream = function(stream) {
			var pc = this;
			if (edgeVersion >= 15025) {
				stream.getTracks().forEach(function(track) {
					pc.addTrack(track, stream);
				});
			} else {
				// Clone is necessary for local demos mostly, attaching directly
				// to two different senders does not work (build 10547).
				// Fixed in 15025 (or earlier)
				var clonedStream = stream.clone();
				stream.getTracks().forEach(function(track, idx) {
					var clonedTrack = clonedStream.getTracks()[idx];
					track.addEventListener('enabled', function(event) {
						clonedTrack.enabled = event.enabled;
					});
				});
				clonedStream.getTracks().forEach(function(track) {
					pc.addTrack(track, clonedStream);
				});
			}
		};
	
		RTCPeerConnection.prototype.removeTrack = function(sender) {
			if (this._isClosed) {
				throw makeError('InvalidStateError',
						'Attempted to call removeTrack on a closed peerconnection.');
			}
	
			if (!(sender instanceof window.RTCRtpSender)) {
				throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
						'does not implement interface RTCRtpSender.');
			}
	
			var transceiver = this.transceivers.find(function(t) {
				return t.rtpSender === sender;
			});
	
			if (!transceiver) {
				throw makeError('InvalidAccessError',
						'Sender was not created by this connection.');
			}
			var stream = transceiver.stream;
	
			transceiver.rtpSender.stop();
			transceiver.rtpSender = null;
			transceiver.track = null;
			transceiver.stream = null;
	
			// remove the stream from the set of local streams
			var localStreams = this.transceivers.map(function(t) {
				return t.stream;
			});
			if (localStreams.indexOf(stream) === -1 &&
					this.localStreams.indexOf(stream) > -1) {
				this.localStreams.splice(this.localStreams.indexOf(stream), 1);
			}
	
			this._maybeFireNegotiationNeeded();
		};
	
		RTCPeerConnection.prototype.removeStream = function(stream) {
			var pc = this;
			stream.getTracks().forEach(function(track) {
				var sender = pc.getSenders().find(function(s) {
					return s.track === track;
				});
				if (sender) {
					pc.removeTrack(sender);
				}
			});
		};
	
		RTCPeerConnection.prototype.getSenders = function() {
			return this.transceivers.filter(function(transceiver) {
				return !!transceiver.rtpSender;
			})
			.map(function(transceiver) {
				return transceiver.rtpSender;
			});
		};
	
		RTCPeerConnection.prototype.getReceivers = function() {
			return this.transceivers.filter(function(transceiver) {
				return !!transceiver.rtpReceiver;
			})
			.map(function(transceiver) {
				return transceiver.rtpReceiver;
			});
		};
	
	
		RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
				usingBundle) {
			var pc = this;
			if (usingBundle && sdpMLineIndex > 0) {
				return this.transceivers[0].iceGatherer;
			} else if (this._iceGatherers.length) {
				return this._iceGatherers.shift();
			}
			var iceGatherer = new window.RTCIceGatherer({
				iceServers: this._config.iceServers,
				gatherPolicy: this._config.iceTransportPolicy
			});
			Object.defineProperty(iceGatherer, 'state',
					{value: 'new', writable: true}
			);
	
			this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
			this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
				var end = !event.candidate || Object.keys(event.candidate).length === 0;
				// polyfill since RTCIceGatherer.state is not implemented in
				// Edge 10547 yet.
				iceGatherer.state = end ? 'completed' : 'gathering';
				if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
					pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
				}
			};
			iceGatherer.addEventListener('localcandidate',
				this.transceivers[sdpMLineIndex].bufferCandidates);
			return iceGatherer;
		};
	
		// start gathering from an RTCIceGatherer.
		RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
			var pc = this;
			var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
			if (iceGatherer.onlocalcandidate) {
				return;
			}
			var bufferedCandidateEvents =
				this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
			this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
			iceGatherer.removeEventListener('localcandidate',
				this.transceivers[sdpMLineIndex].bufferCandidates);
			iceGatherer.onlocalcandidate = function(evt) {
				if (pc.usingBundle && sdpMLineIndex > 0) {
					// if we know that we use bundle we can drop candidates with
					// ѕdpMLineIndex > 0. If we don't do this then our state gets
					// confused since we dispose the extra ice gatherer.
					return;
				}
				var event = new Event('icecandidate');
				event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};
	
				var cand = evt.candidate;
				// Edge emits an empty object for RTCIceCandidateComplete‥
				var end = !cand || Object.keys(cand).length === 0;
				if (end) {
					// polyfill since RTCIceGatherer.state is not implemented in
					// Edge 10547 yet.
					if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
						iceGatherer.state = 'completed';
					}
				} else {
					if (iceGatherer.state === 'new') {
						iceGatherer.state = 'gathering';
					}
					// RTCIceCandidate doesn't have a component, needs to be added
					cand.component = 1;
					// also the usernameFragment. TODO: update SDP to take both variants.
					cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;
	
					var serializedCandidate = SDPUtils.writeCandidate(cand);
					event.candidate = Object.assign(event.candidate,
							SDPUtils.parseCandidate(serializedCandidate));
	
					event.candidate.candidate = serializedCandidate;
					event.candidate.toJSON = function() {
						return {
							candidate: event.candidate.candidate,
							sdpMid: event.candidate.sdpMid,
							sdpMLineIndex: event.candidate.sdpMLineIndex,
							usernameFragment: event.candidate.usernameFragment
						};
					};
				}
	
				// update local description.
				var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
				if (!end) {
					sections[event.candidate.sdpMLineIndex] +=
							'a=' + event.candidate.candidate + '\r\n';
				} else {
					sections[event.candidate.sdpMLineIndex] +=
							'a=end-of-candidates\r\n';
				}
				pc._localDescription.sdp =
						SDPUtils.getDescription(pc._localDescription.sdp) +
						sections.join('');
				var complete = pc.transceivers.every(function(transceiver) {
					return transceiver.iceGatherer &&
							transceiver.iceGatherer.state === 'completed';
				});
	
				if (pc.iceGatheringState !== 'gathering') {
					pc.iceGatheringState = 'gathering';
					pc._emitGatheringStateChange();
				}
	
				// Emit candidate. Also emit null candidate when all gatherers are
				// complete.
				if (!end) {
					pc._dispatchEvent('icecandidate', event);
				}
				if (complete) {
					pc._dispatchEvent('icecandidate', new Event('icecandidate'));
					pc.iceGatheringState = 'complete';
					pc._emitGatheringStateChange();
				}
			};
	
			// emit already gathered candidates.
			window.setTimeout(function() {
				bufferedCandidateEvents.forEach(function(e) {
					iceGatherer.onlocalcandidate(e);
				});
			}, 0);
		};
	
		// Create ICE transport and DTLS transport.
		RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
			var pc = this;
			var iceTransport = new window.RTCIceTransport(null);
			iceTransport.onicestatechange = function() {
				pc._updateIceConnectionState();
				pc._updateConnectionState();
			};
	
			var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
			dtlsTransport.ondtlsstatechange = function() {
				pc._updateConnectionState();
			};
			dtlsTransport.onerror = function() {
				// onerror does not set state to failed by itself.
				Object.defineProperty(dtlsTransport, 'state',
						{value: 'failed', writable: true});
				pc._updateConnectionState();
			};
	
			return {
				iceTransport: iceTransport,
				dtlsTransport: dtlsTransport
			};
		};
	
		// Destroy ICE gatherer, ICE transport and DTLS transport.
		// Without triggering the callbacks.
		RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
				sdpMLineIndex) {
			var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
			if (iceGatherer) {
				delete iceGatherer.onlocalcandidate;
				delete this.transceivers[sdpMLineIndex].iceGatherer;
			}
			var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
			if (iceTransport) {
				delete iceTransport.onicestatechange;
				delete this.transceivers[sdpMLineIndex].iceTransport;
			}
			var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
			if (dtlsTransport) {
				delete dtlsTransport.ondtlsstatechange;
				delete dtlsTransport.onerror;
				delete this.transceivers[sdpMLineIndex].dtlsTransport;
			}
		};
	
		// Start the RTP Sender and Receiver for a transceiver.
		RTCPeerConnection.prototype._transceive = function(transceiver,
				send, recv) {
			var params = getCommonCapabilities(transceiver.localCapabilities,
					transceiver.remoteCapabilities);
			if (send && transceiver.rtpSender) {
				params.encodings = transceiver.sendEncodingParameters;
				params.rtcp = {
					cname: SDPUtils.localCName,
					compound: transceiver.rtcpParameters.compound
				};
				if (transceiver.recvEncodingParameters.length) {
					params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
				}
				transceiver.rtpSender.send(params);
			}
			if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
				// remove RTX field in Edge 14942
				if (transceiver.kind === 'video'
						&& transceiver.recvEncodingParameters
						&& edgeVersion < 15019) {
					transceiver.recvEncodingParameters.forEach(function(p) {
						delete p.rtx;
					});
				}
				if (transceiver.recvEncodingParameters.length) {
					params.encodings = transceiver.recvEncodingParameters;
				} else {
					params.encodings = [{}];
				}
				params.rtcp = {
					compound: transceiver.rtcpParameters.compound
				};
				if (transceiver.rtcpParameters.cname) {
					params.rtcp.cname = transceiver.rtcpParameters.cname;
				}
				if (transceiver.sendEncodingParameters.length) {
					params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
				}
				transceiver.rtpReceiver.receive(params);
			}
		};
	
		RTCPeerConnection.prototype.setLocalDescription = function(description) {
			var pc = this;
	
			// Note: pranswer is not supported.
			if (['offer', 'answer'].indexOf(description.type) === -1) {
				return Promise.reject(makeError('TypeError',
						'Unsupported type "' + description.type + '"'));
			}
	
			if (!isActionAllowedInSignalingState('setLocalDescription',
					description.type, pc.signalingState) || pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not set local ' + description.type +
						' in state ' + pc.signalingState));
			}
	
			var sections;
			var sessionpart;
			if (description.type === 'offer') {
				// VERY limited support for SDP munging. Limited to:
				// * changing the order of codecs
				sections = SDPUtils.splitSections(description.sdp);
				sessionpart = sections.shift();
				sections.forEach(function(mediaSection, sdpMLineIndex) {
					var caps = SDPUtils.parseRtpParameters(mediaSection);
					pc.transceivers[sdpMLineIndex].localCapabilities = caps;
				});
	
				pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
					pc._gather(transceiver.mid, sdpMLineIndex);
				});
			} else if (description.type === 'answer') {
				sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
				sessionpart = sections.shift();
				var isIceLite = SDPUtils.matchPrefix(sessionpart,
						'a=ice-lite').length > 0;
				sections.forEach(function(mediaSection, sdpMLineIndex) {
					var transceiver = pc.transceivers[sdpMLineIndex];
					var iceGatherer = transceiver.iceGatherer;
					var iceTransport = transceiver.iceTransport;
					var dtlsTransport = transceiver.dtlsTransport;
					var localCapabilities = transceiver.localCapabilities;
					var remoteCapabilities = transceiver.remoteCapabilities;
	
					// treat bundle-only as not-rejected.
					var rejected = SDPUtils.isRejected(mediaSection) &&
							SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
	
					if (!rejected && !transceiver.rejected) {
						var remoteIceParameters = SDPUtils.getIceParameters(
								mediaSection, sessionpart);
						var remoteDtlsParameters = SDPUtils.getDtlsParameters(
								mediaSection, sessionpart);
						if (isIceLite) {
							remoteDtlsParameters.role = 'server';
						}
	
						if (!pc.usingBundle || sdpMLineIndex === 0) {
							pc._gather(transceiver.mid, sdpMLineIndex);
							if (iceTransport.state === 'new') {
								iceTransport.start(iceGatherer, remoteIceParameters,
										isIceLite ? 'controlling' : 'controlled');
							}
							if (dtlsTransport.state === 'new') {
								dtlsTransport.start(remoteDtlsParameters);
							}
						}
	
						// Calculate intersection of capabilities.
						var params = getCommonCapabilities(localCapabilities,
								remoteCapabilities);
	
						// Start the RTCRtpSender. The RTCRtpReceiver for this
						// transceiver has already been started in setRemoteDescription.
						pc._transceive(transceiver,
								params.codecs.length > 0,
								false);
					}
				});
			}
	
			pc._localDescription = {
				type: description.type,
				sdp: description.sdp
			};
			if (description.type === 'offer') {
				pc._updateSignalingState('have-local-offer');
			} else {
				pc._updateSignalingState('stable');
			}
	
			return Promise.resolve();
		};
	
		RTCPeerConnection.prototype.setRemoteDescription = function(description) {
			var pc = this;
	
			// Note: pranswer is not supported.
			if (['offer', 'answer'].indexOf(description.type) === -1) {
				return Promise.reject(makeError('TypeError',
						'Unsupported type "' + description.type + '"'));
			}
	
			if (!isActionAllowedInSignalingState('setRemoteDescription',
					description.type, pc.signalingState) || pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not set remote ' + description.type +
						' in state ' + pc.signalingState));
			}
	
			var streams = {};
			pc.remoteStreams.forEach(function(stream) {
				streams[stream.id] = stream;
			});
			var receiverList = [];
			var sections = SDPUtils.splitSections(description.sdp);
			var sessionpart = sections.shift();
			var isIceLite = SDPUtils.matchPrefix(sessionpart,
					'a=ice-lite').length > 0;
			var usingBundle = SDPUtils.matchPrefix(sessionpart,
					'a=group:BUNDLE ').length > 0;
			pc.usingBundle = usingBundle;
			var iceOptions = SDPUtils.matchPrefix(sessionpart,
					'a=ice-options:')[0];
			if (iceOptions) {
				pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
						.indexOf('trickle') >= 0;
			} else {
				pc.canTrickleIceCandidates = false;
			}
	
			sections.forEach(function(mediaSection, sdpMLineIndex) {
				var lines = SDPUtils.splitLines(mediaSection);
				var kind = SDPUtils.getKind(mediaSection);
				// treat bundle-only as not-rejected.
				var rejected = SDPUtils.isRejected(mediaSection) &&
						SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
				var protocol = lines[0].substr(2).split(' ')[2];
	
				var direction = SDPUtils.getDirection(mediaSection, sessionpart);
				var remoteMsid = SDPUtils.parseMsid(mediaSection);
	
				var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();
	
				// Reject datachannels which are not implemented yet.
				if (rejected || (kind === 'application' && (protocol === 'DTLS/SCTP' ||
						protocol === 'UDP/DTLS/SCTP'))) {
					// TODO: this is dangerous in the case where a non-rejected m-line
					//     becomes rejected.
					pc.transceivers[sdpMLineIndex] = {
						mid: mid,
						kind: kind,
						protocol: protocol,
						rejected: true
					};
					return;
				}
	
				if (!rejected && pc.transceivers[sdpMLineIndex] &&
						pc.transceivers[sdpMLineIndex].rejected) {
					// recycle a rejected transceiver.
					pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
				}
	
				var transceiver;
				var iceGatherer;
				var iceTransport;
				var dtlsTransport;
				var rtpReceiver;
				var sendEncodingParameters;
				var recvEncodingParameters;
				var localCapabilities;
	
				var track;
				// FIXME: ensure the mediaSection has rtcp-mux set.
				var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
				var remoteIceParameters;
				var remoteDtlsParameters;
				if (!rejected) {
					remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
							sessionpart);
					remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
							sessionpart);
					remoteDtlsParameters.role = 'client';
				}
				recvEncodingParameters =
						SDPUtils.parseRtpEncodingParameters(mediaSection);
	
				var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);
	
				var isComplete = SDPUtils.matchPrefix(mediaSection,
						'a=end-of-candidates', sessionpart).length > 0;
				var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
						.map(function(cand) {
							return SDPUtils.parseCandidate(cand);
						})
						.filter(function(cand) {
							return cand.component === 1;
						});
	
				// Check if we can use BUNDLE and dispose transports.
				if ((description.type === 'offer' || description.type === 'answer') &&
						!rejected && usingBundle && sdpMLineIndex > 0 &&
						pc.transceivers[sdpMLineIndex]) {
					pc._disposeIceAndDtlsTransports(sdpMLineIndex);
					pc.transceivers[sdpMLineIndex].iceGatherer =
							pc.transceivers[0].iceGatherer;
					pc.transceivers[sdpMLineIndex].iceTransport =
							pc.transceivers[0].iceTransport;
					pc.transceivers[sdpMLineIndex].dtlsTransport =
							pc.transceivers[0].dtlsTransport;
					if (pc.transceivers[sdpMLineIndex].rtpSender) {
						pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
								pc.transceivers[0].dtlsTransport);
					}
					if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
						pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
								pc.transceivers[0].dtlsTransport);
					}
				}
				if (description.type === 'offer' && !rejected) {
					transceiver = pc.transceivers[sdpMLineIndex] ||
							pc._createTransceiver(kind);
					transceiver.mid = mid;
	
					if (!transceiver.iceGatherer) {
						transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
								usingBundle);
					}
	
					if (cands.length && transceiver.iceTransport.state === 'new') {
						if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
							transceiver.iceTransport.setRemoteCandidates(cands);
						} else {
							cands.forEach(function(candidate) {
								maybeAddCandidate(transceiver.iceTransport, candidate);
							});
						}
					}
	
					localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);
	
					// filter RTX until additional stuff needed for RTX is implemented
					// in adapter.js
					if (edgeVersion < 15019) {
						localCapabilities.codecs = localCapabilities.codecs.filter(
								function(codec) {
									return codec.name !== 'rtx';
								});
					}
	
					sendEncodingParameters = transceiver.sendEncodingParameters || [{
						ssrc: (2 * sdpMLineIndex + 2) * 1001
					}];
	
					// TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
					var isNewTrack = false;
					if (direction === 'sendrecv' || direction === 'sendonly') {
						isNewTrack = !transceiver.rtpReceiver;
						rtpReceiver = transceiver.rtpReceiver ||
								new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);
	
						if (isNewTrack) {
							var stream;
							track = rtpReceiver.track;
							// FIXME: does not work with Plan B.
							if (remoteMsid && remoteMsid.stream === '-') {
								// no-op. a stream id of '-' means: no associated stream.
							} else if (remoteMsid) {
								if (!streams[remoteMsid.stream]) {
									streams[remoteMsid.stream] = new window.MediaStream();
									Object.defineProperty(streams[remoteMsid.stream], 'id', {
										get: function() {
											return remoteMsid.stream;
										}
									});
								}
								Object.defineProperty(track, 'id', {
									get: function() {
										return remoteMsid.track;
									}
								});
								stream = streams[remoteMsid.stream];
							} else {
								if (!streams.default) {
									streams.default = new window.MediaStream();
								}
								stream = streams.default;
							}
							if (stream) {
								addTrackToStreamAndFireEvent(track, stream);
								transceiver.associatedRemoteMediaStreams.push(stream);
							}
							receiverList.push([track, rtpReceiver, stream]);
						}
					} else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
						transceiver.associatedRemoteMediaStreams.forEach(function(s) {
							var nativeTrack = s.getTracks().find(function(t) {
								return t.id === transceiver.rtpReceiver.track.id;
							});
							if (nativeTrack) {
								removeTrackFromStreamAndFireEvent(nativeTrack, s);
							}
						});
						transceiver.associatedRemoteMediaStreams = [];
					}
	
					transceiver.localCapabilities = localCapabilities;
					transceiver.remoteCapabilities = remoteCapabilities;
					transceiver.rtpReceiver = rtpReceiver;
					transceiver.rtcpParameters = rtcpParameters;
					transceiver.sendEncodingParameters = sendEncodingParameters;
					transceiver.recvEncodingParameters = recvEncodingParameters;
	
					// Start the RTCRtpReceiver now. The RTPSender is started in
					// setLocalDescription.
					pc._transceive(pc.transceivers[sdpMLineIndex],
							false,
							isNewTrack);
				} else if (description.type === 'answer' && !rejected) {
					transceiver = pc.transceivers[sdpMLineIndex];
					iceGatherer = transceiver.iceGatherer;
					iceTransport = transceiver.iceTransport;
					dtlsTransport = transceiver.dtlsTransport;
					rtpReceiver = transceiver.rtpReceiver;
					sendEncodingParameters = transceiver.sendEncodingParameters;
					localCapabilities = transceiver.localCapabilities;
	
					pc.transceivers[sdpMLineIndex].recvEncodingParameters =
							recvEncodingParameters;
					pc.transceivers[sdpMLineIndex].remoteCapabilities =
							remoteCapabilities;
					pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;
	
					if (cands.length && iceTransport.state === 'new') {
						if ((isIceLite || isComplete) &&
								(!usingBundle || sdpMLineIndex === 0)) {
							iceTransport.setRemoteCandidates(cands);
						} else {
							cands.forEach(function(candidate) {
								maybeAddCandidate(transceiver.iceTransport, candidate);
							});
						}
					}
	
					if (!usingBundle || sdpMLineIndex === 0) {
						if (iceTransport.state === 'new') {
							iceTransport.start(iceGatherer, remoteIceParameters,
									'controlling');
						}
						if (dtlsTransport.state === 'new') {
							dtlsTransport.start(remoteDtlsParameters);
						}
					}
	
					// If the offer contained RTX but the answer did not,
					// remove RTX from sendEncodingParameters.
					var commonCapabilities = getCommonCapabilities(
						transceiver.localCapabilities,
						transceiver.remoteCapabilities);
	
					var hasRtx = commonCapabilities.codecs.filter(function(c) {
						return c.name.toLowerCase() === 'rtx';
					}).length;
					if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
						delete transceiver.sendEncodingParameters[0].rtx;
					}
	
					pc._transceive(transceiver,
							direction === 'sendrecv' || direction === 'recvonly',
							direction === 'sendrecv' || direction === 'sendonly');
	
					// TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
					if (rtpReceiver &&
							(direction === 'sendrecv' || direction === 'sendonly')) {
						track = rtpReceiver.track;
						if (remoteMsid) {
							if (!streams[remoteMsid.stream]) {
								streams[remoteMsid.stream] = new window.MediaStream();
							}
							addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
							receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
						} else {
							if (!streams.default) {
								streams.default = new window.MediaStream();
							}
							addTrackToStreamAndFireEvent(track, streams.default);
							receiverList.push([track, rtpReceiver, streams.default]);
						}
					} else {
						// FIXME: actually the receiver should be created later.
						delete transceiver.rtpReceiver;
					}
				}
			});
	
			if (pc._dtlsRole === undefined) {
				pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
			}
	
			pc._remoteDescription = {
				type: description.type,
				sdp: description.sdp
			};
			if (description.type === 'offer') {
				pc._updateSignalingState('have-remote-offer');
			} else {
				pc._updateSignalingState('stable');
			}
			Object.keys(streams).forEach(function(sid) {
				var stream = streams[sid];
				if (stream.getTracks().length) {
					if (pc.remoteStreams.indexOf(stream) === -1) {
						pc.remoteStreams.push(stream);
						var event = new Event('addstream');
						event.stream = stream;
						window.setTimeout(function() {
							pc._dispatchEvent('addstream', event);
						});
					}
	
					receiverList.forEach(function(item) {
						var track = item[0];
						var receiver = item[1];
						if (stream.id !== item[2].id) {
							return;
						}
						fireAddTrack(pc, track, receiver, [stream]);
					});
				}
			});
			receiverList.forEach(function(item) {
				if (item[2]) {
					return;
				}
				fireAddTrack(pc, item[0], item[1], []);
			});
	
			// check whether addIceCandidate({}) was called within four seconds after
			// setRemoteDescription.
			window.setTimeout(function() {
				if (!(pc && pc.transceivers)) {
					return;
				}
				pc.transceivers.forEach(function(transceiver) {
					if (transceiver.iceTransport &&
							transceiver.iceTransport.state === 'new' &&
							transceiver.iceTransport.getRemoteCandidates().length > 0) {
						console.warn('Timeout for addRemoteCandidate. Consider sending ' +
								'an end-of-candidates notification');
						transceiver.iceTransport.addRemoteCandidate({});
					}
				});
			}, 4000);
	
			return Promise.resolve();
		};
	
		RTCPeerConnection.prototype.close = function() {
			this.transceivers.forEach(function(transceiver) {
				/* not yet
				if (transceiver.iceGatherer) {
					transceiver.iceGatherer.close();
				}
				*/
				if (transceiver.iceTransport) {
					transceiver.iceTransport.stop();
				}
				if (transceiver.dtlsTransport) {
					transceiver.dtlsTransport.stop();
				}
				if (transceiver.rtpSender) {
					transceiver.rtpSender.stop();
				}
				if (transceiver.rtpReceiver) {
					transceiver.rtpReceiver.stop();
				}
			});
			// FIXME: clean up tracks, local streams, remote streams, etc
			this._isClosed = true;
			this._updateSignalingState('closed');
		};
	
		// Update the signaling state.
		RTCPeerConnection.prototype._updateSignalingState = function(newState) {
			this.signalingState = newState;
			var event = new Event('signalingstatechange');
			this._dispatchEvent('signalingstatechange', event);
		};
	
		// Determine whether to fire the negotiationneeded event.
		RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
			var pc = this;
			if (this.signalingState !== 'stable' || this.needNegotiation === true) {
				return;
			}
			this.needNegotiation = true;
			window.setTimeout(function() {
				if (pc.needNegotiation) {
					pc.needNegotiation = false;
					var event = new Event('negotiationneeded');
					pc._dispatchEvent('negotiationneeded', event);
				}
			}, 0);
		};
	
		// Update the ice connection state.
		RTCPeerConnection.prototype._updateIceConnectionState = function() {
			var newState;
			var states = {
				'new': 0,
				closed: 0,
				checking: 0,
				connected: 0,
				completed: 0,
				disconnected: 0,
				failed: 0
			};
			this.transceivers.forEach(function(transceiver) {
				if (transceiver.iceTransport && !transceiver.rejected) {
					states[transceiver.iceTransport.state]++;
				}
			});
	
			newState = 'new';
			if (states.failed > 0) {
				newState = 'failed';
			} else if (states.checking > 0) {
				newState = 'checking';
			} else if (states.disconnected > 0) {
				newState = 'disconnected';
			} else if (states.new > 0) {
				newState = 'new';
			} else if (states.connected > 0) {
				newState = 'connected';
			} else if (states.completed > 0) {
				newState = 'completed';
			}
	
			if (newState !== this.iceConnectionState) {
				this.iceConnectionState = newState;
				var event = new Event('iceconnectionstatechange');
				this._dispatchEvent('iceconnectionstatechange', event);
			}
		};
	
		// Update the connection state.
		RTCPeerConnection.prototype._updateConnectionState = function() {
			var newState;
			var states = {
				'new': 0,
				closed: 0,
				connecting: 0,
				connected: 0,
				completed: 0,
				disconnected: 0,
				failed: 0
			};
			this.transceivers.forEach(function(transceiver) {
				if (transceiver.iceTransport && transceiver.dtlsTransport &&
						!transceiver.rejected) {
					states[transceiver.iceTransport.state]++;
					states[transceiver.dtlsTransport.state]++;
				}
			});
			// ICETransport.completed and connected are the same for this purpose.
			states.connected += states.completed;
	
			newState = 'new';
			if (states.failed > 0) {
				newState = 'failed';
			} else if (states.connecting > 0) {
				newState = 'connecting';
			} else if (states.disconnected > 0) {
				newState = 'disconnected';
			} else if (states.new > 0) {
				newState = 'new';
			} else if (states.connected > 0) {
				newState = 'connected';
			}
	
			if (newState !== this.connectionState) {
				this.connectionState = newState;
				var event = new Event('connectionstatechange');
				this._dispatchEvent('connectionstatechange', event);
			}
		};
	
		RTCPeerConnection.prototype.createOffer = function() {
			var pc = this;
	
			if (pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createOffer after close'));
			}
	
			var numAudioTracks = pc.transceivers.filter(function(t) {
				return t.kind === 'audio';
			}).length;
			var numVideoTracks = pc.transceivers.filter(function(t) {
				return t.kind === 'video';
			}).length;
	
			// Determine number of audio and video tracks we need to send/recv.
			var offerOptions = arguments[0];
			if (offerOptions) {
				// Reject Chrome legacy constraints.
				if (offerOptions.mandatory || offerOptions.optional) {
					throw new TypeError(
							'Legacy mandatory/optional constraints not supported.');
				}
				if (offerOptions.offerToReceiveAudio !== undefined) {
					if (offerOptions.offerToReceiveAudio === true) {
						numAudioTracks = 1;
					} else if (offerOptions.offerToReceiveAudio === false) {
						numAudioTracks = 0;
					} else {
						numAudioTracks = offerOptions.offerToReceiveAudio;
					}
				}
				if (offerOptions.offerToReceiveVideo !== undefined) {
					if (offerOptions.offerToReceiveVideo === true) {
						numVideoTracks = 1;
					} else if (offerOptions.offerToReceiveVideo === false) {
						numVideoTracks = 0;
					} else {
						numVideoTracks = offerOptions.offerToReceiveVideo;
					}
				}
			}
	
			pc.transceivers.forEach(function(transceiver) {
				if (transceiver.kind === 'audio') {
					numAudioTracks--;
					if (numAudioTracks < 0) {
						transceiver.wantReceive = false;
					}
				} else if (transceiver.kind === 'video') {
					numVideoTracks--;
					if (numVideoTracks < 0) {
						transceiver.wantReceive = false;
					}
				}
			});
	
			// Create M-lines for recvonly streams.
			while (numAudioTracks > 0 || numVideoTracks > 0) {
				if (numAudioTracks > 0) {
					pc._createTransceiver('audio');
					numAudioTracks--;
				}
				if (numVideoTracks > 0) {
					pc._createTransceiver('video');
					numVideoTracks--;
				}
			}
	
			var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
					pc._sdpSessionVersion++);
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				// For each track, create an ice gatherer, ice transport,
				// dtls transport, potentially rtpsender and rtpreceiver.
				var track = transceiver.track;
				var kind = transceiver.kind;
				var mid = transceiver.mid || SDPUtils.generateIdentifier();
				transceiver.mid = mid;
	
				if (!transceiver.iceGatherer) {
					transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
							pc.usingBundle);
				}
	
				var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
				// filter RTX until additional stuff needed for RTX is implemented
				// in adapter.js
				if (edgeVersion < 15019) {
					localCapabilities.codecs = localCapabilities.codecs.filter(
							function(codec) {
								return codec.name !== 'rtx';
							});
				}
				localCapabilities.codecs.forEach(function(codec) {
					// work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
					// by adding level-asymmetry-allowed=1
					if (codec.name === 'H264' &&
							codec.parameters['level-asymmetry-allowed'] === undefined) {
						codec.parameters['level-asymmetry-allowed'] = '1';
					}
	
					// for subsequent offers, we might have to re-use the payload
					// type of the last offer.
					if (transceiver.remoteCapabilities &&
							transceiver.remoteCapabilities.codecs) {
						transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
							if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
									codec.clockRate === remoteCodec.clockRate) {
								codec.preferredPayloadType = remoteCodec.payloadType;
							}
						});
					}
				});
				localCapabilities.headerExtensions.forEach(function(hdrExt) {
					var remoteExtensions = transceiver.remoteCapabilities &&
							transceiver.remoteCapabilities.headerExtensions || [];
					remoteExtensions.forEach(function(rHdrExt) {
						if (hdrExt.uri === rHdrExt.uri) {
							hdrExt.id = rHdrExt.id;
						}
					});
				});
	
				// generate an ssrc now, to be used later in rtpSender.send
				var sendEncodingParameters = transceiver.sendEncodingParameters || [{
					ssrc: (2 * sdpMLineIndex + 1) * 1001
				}];
				if (track) {
					// add RTX
					if (edgeVersion >= 15019 && kind === 'video' &&
							!sendEncodingParameters[0].rtx) {
						sendEncodingParameters[0].rtx = {
							ssrc: sendEncodingParameters[0].ssrc + 1
						};
					}
				}
	
				if (transceiver.wantReceive) {
					transceiver.rtpReceiver = new window.RTCRtpReceiver(
							transceiver.dtlsTransport, kind);
				}
	
				transceiver.localCapabilities = localCapabilities;
				transceiver.sendEncodingParameters = sendEncodingParameters;
			});
	
			// always offer BUNDLE and dispose on return if not supported.
			if (pc._config.bundlePolicy !== 'max-compat') {
				sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
					return t.mid;
				}).join(' ') + '\r\n';
			}
			sdp += 'a=ice-options:trickle\r\n';
	
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
						'offer', transceiver.stream, pc._dtlsRole);
				sdp += 'a=rtcp-rsize\r\n';
	
				if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
						(sdpMLineIndex === 0 || !pc.usingBundle)) {
					transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
						cand.component = 1;
						sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
					});
	
					if (transceiver.iceGatherer.state === 'completed') {
						sdp += 'a=end-of-candidates\r\n';
					}
				}
			});
	
			var desc = new window.RTCSessionDescription({
				type: 'offer',
				sdp: sdp
			});
			return Promise.resolve(desc);
		};
	
		RTCPeerConnection.prototype.createAnswer = function() {
			var pc = this;
	
			if (pc._isClosed) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createAnswer after close'));
			}
	
			if (!(pc.signalingState === 'have-remote-offer' ||
					pc.signalingState === 'have-local-pranswer')) {
				return Promise.reject(makeError('InvalidStateError',
						'Can not call createAnswer in signalingState ' + pc.signalingState));
			}
	
			var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
					pc._sdpSessionVersion++);
			if (pc.usingBundle) {
				sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
					return t.mid;
				}).join(' ') + '\r\n';
			}
			sdp += 'a=ice-options:trickle\r\n';
	
			var mediaSectionsInOffer = SDPUtils.getMediaSections(
					pc._remoteDescription.sdp).length;
			pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
				if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
					return;
				}
				if (transceiver.rejected) {
					if (transceiver.kind === 'application') {
						if (transceiver.protocol === 'DTLS/SCTP') { // legacy fmt
							sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
						} else {
							sdp += 'm=application 0 ' + transceiver.protocol +
									' webrtc-datachannel\r\n';
						}
					} else if (transceiver.kind === 'audio') {
						sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
								'a=rtpmap:0 PCMU/8000\r\n';
					} else if (transceiver.kind === 'video') {
						sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
								'a=rtpmap:120 VP8/90000\r\n';
					}
					sdp += 'c=IN IP4 0.0.0.0\r\n' +
							'a=inactive\r\n' +
							'a=mid:' + transceiver.mid + '\r\n';
					return;
				}
	
				// FIXME: look at direction.
				if (transceiver.stream) {
					var localTrack;
					if (transceiver.kind === 'audio') {
						localTrack = transceiver.stream.getAudioTracks()[0];
					} else if (transceiver.kind === 'video') {
						localTrack = transceiver.stream.getVideoTracks()[0];
					}
					if (localTrack) {
						// add RTX
						if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
								!transceiver.sendEncodingParameters[0].rtx) {
							transceiver.sendEncodingParameters[0].rtx = {
								ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
							};
						}
					}
				}
	
				// Calculate intersection of capabilities.
				var commonCapabilities = getCommonCapabilities(
						transceiver.localCapabilities,
						transceiver.remoteCapabilities);
	
				var hasRtx = commonCapabilities.codecs.filter(function(c) {
					return c.name.toLowerCase() === 'rtx';
				}).length;
				if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
					delete transceiver.sendEncodingParameters[0].rtx;
				}
	
				sdp += writeMediaSection(transceiver, commonCapabilities,
						'answer', transceiver.stream, pc._dtlsRole);
				if (transceiver.rtcpParameters &&
						transceiver.rtcpParameters.reducedSize) {
					sdp += 'a=rtcp-rsize\r\n';
				}
			});
	
			var desc = new window.RTCSessionDescription({
				type: 'answer',
				sdp: sdp
			});
			return Promise.resolve(desc);
		};
	
		RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
			var pc = this;
			var sections;
			if (candidate && !(candidate.sdpMLineIndex !== undefined ||
					candidate.sdpMid)) {
				return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
			}
	
			// TODO: needs to go into ops queue.
			return new Promise(function(resolve, reject) {
				if (!pc._remoteDescription) {
					return reject(makeError('InvalidStateError',
							'Can not add ICE candidate without a remote description'));
				} else if (!candidate || candidate.candidate === '') {
					for (var j = 0; j < pc.transceivers.length; j++) {
						if (pc.transceivers[j].rejected) {
							continue;
						}
						pc.transceivers[j].iceTransport.addRemoteCandidate({});
						sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
						sections[j] += 'a=end-of-candidates\r\n';
						pc._remoteDescription.sdp =
								SDPUtils.getDescription(pc._remoteDescription.sdp) +
								sections.join('');
						if (pc.usingBundle) {
							break;
						}
					}
				} else {
					var sdpMLineIndex = candidate.sdpMLineIndex;
					if (candidate.sdpMid) {
						for (var i = 0; i < pc.transceivers.length; i++) {
							if (pc.transceivers[i].mid === candidate.sdpMid) {
								sdpMLineIndex = i;
								break;
							}
						}
					}
					var transceiver = pc.transceivers[sdpMLineIndex];
					if (transceiver) {
						if (transceiver.rejected) {
							return resolve();
						}
						var cand = Object.keys(candidate.candidate).length > 0 ?
								SDPUtils.parseCandidate(candidate.candidate) : {};
						// Ignore Chrome's invalid candidates since Edge does not like them.
						if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
							return resolve();
						}
						// Ignore RTCP candidates, we assume RTCP-MUX.
						if (cand.component && cand.component !== 1) {
							return resolve();
						}
						// when using bundle, avoid adding candidates to the wrong
						// ice transport. And avoid adding candidates added in the SDP.
						if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
								transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
							if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
								return reject(makeError('OperationError',
										'Can not add ICE candidate'));
							}
						}
	
						// update the remoteDescription.
						var candidateString = candidate.candidate.trim();
						if (candidateString.indexOf('a=') === 0) {
							candidateString = candidateString.substr(2);
						}
						sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
						sections[sdpMLineIndex] += 'a=' +
								(cand.type ? candidateString : 'end-of-candidates')
								+ '\r\n';
						pc._remoteDescription.sdp =
								SDPUtils.getDescription(pc._remoteDescription.sdp) +
								sections.join('');
					} else {
						return reject(makeError('OperationError',
								'Can not add ICE candidate'));
					}
				}
				resolve();
			});
		};
	
		RTCPeerConnection.prototype.getStats = function(selector) {
			if (selector && selector instanceof window.MediaStreamTrack) {
				var senderOrReceiver = null;
				this.transceivers.forEach(function(transceiver) {
					if (transceiver.rtpSender &&
							transceiver.rtpSender.track === selector) {
						senderOrReceiver = transceiver.rtpSender;
					} else if (transceiver.rtpReceiver &&
							transceiver.rtpReceiver.track === selector) {
						senderOrReceiver = transceiver.rtpReceiver;
					}
				});
				if (!senderOrReceiver) {
					throw makeError('InvalidAccessError', 'Invalid selector.');
				}
				return senderOrReceiver.getStats();
			}
	
			var promises = [];
			this.transceivers.forEach(function(transceiver) {
				['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
						'dtlsTransport'].forEach(function(method) {
							if (transceiver[method]) {
								promises.push(transceiver[method].getStats());
							}
						});
			});
			return Promise.all(promises).then(function(allStats) {
				var results = new Map();
				allStats.forEach(function(stats) {
					stats.forEach(function(stat) {
						results.set(stat.id, stat);
					});
				});
				return results;
			});
		};
	
		// fix low-level stat names and return Map instead of object.
		var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
			'RTCIceTransport', 'RTCDtlsTransport'];
		ortcObjects.forEach(function(ortcObjectName) {
			var obj = window[ortcObjectName];
			if (obj && obj.prototype && obj.prototype.getStats) {
				var nativeGetstats = obj.prototype.getStats;
				obj.prototype.getStats = function() {
					return nativeGetstats.apply(this)
					.then(function(nativeStats) {
						var mapStats = new Map();
						Object.keys(nativeStats).forEach(function(id) {
							nativeStats[id].type = fixStatsType(nativeStats[id]);
							mapStats.set(id, nativeStats[id]);
						});
						return mapStats;
					});
				};
			}
		});
	
		// legacy callback shims. Should be moved to adapter.js some days.
		var methods = ['createOffer', 'createAnswer'];
		methods.forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[0] === 'function' ||
						typeof args[1] === 'function') { // legacy
					return nativeMethod.apply(this, [arguments[2]])
					.then(function(description) {
						if (typeof args[0] === 'function') {
							args[0].apply(null, [description]);
						}
					}, function(error) {
						if (typeof args[1] === 'function') {
							args[1].apply(null, [error]);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
		methods.forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[1] === 'function' ||
						typeof args[2] === 'function') { // legacy
					return nativeMethod.apply(this, arguments)
					.then(function() {
						if (typeof args[1] === 'function') {
							args[1].apply(null);
						}
					}, function(error) {
						if (typeof args[2] === 'function') {
							args[2].apply(null, [error]);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		// getStats is special. It doesn't have a spec legacy method yet we support
		// getStats(something, cb) without error callbacks.
		['getStats'].forEach(function(method) {
			var nativeMethod = RTCPeerConnection.prototype[method];
			RTCPeerConnection.prototype[method] = function() {
				var args = arguments;
				if (typeof args[1] === 'function') {
					return nativeMethod.apply(this, arguments)
					.then(function() {
						if (typeof args[1] === 'function') {
							args[1].apply(null);
						}
					});
				}
				return nativeMethod.apply(this, arguments);
			};
		});
	
		return RTCPeerConnection;
	};
	
	},{"sdp":17}],17:[function(require,module,exports){
	 /* eslint-env node */
	'use strict';
	
	// SDP helpers.
	var SDPUtils = {};
	
	// Generate an alphanumeric identifier for cname or mids.
	// TODO: use UUIDs instead? https://gist.github.com/jed/982883
	SDPUtils.generateIdentifier = function() {
		return Math.random().toString(36).substr(2, 10);
	};
	
	// The RTCP CNAME used by all peerconnections from the same JS.
	SDPUtils.localCName = SDPUtils.generateIdentifier();
	
	// Splits SDP into lines, dealing with both CRLF and LF.
	SDPUtils.splitLines = function(blob) {
		return blob.trim().split('\n').map(function(line) {
			return line.trim();
		});
	};
	// Splits SDP into sessionpart and mediasections. Ensures CRLF.
	SDPUtils.splitSections = function(blob) {
		var parts = blob.split('\nm=');
		return parts.map(function(part, index) {
			return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
		});
	};
	
	// returns the session description.
	SDPUtils.getDescription = function(blob) {
		var sections = SDPUtils.splitSections(blob);
		return sections && sections[0];
	};
	
	// returns the individual media sections.
	SDPUtils.getMediaSections = function(blob) {
		var sections = SDPUtils.splitSections(blob);
		sections.shift();
		return sections;
	};
	
	// Returns lines that start with a certain prefix.
	SDPUtils.matchPrefix = function(blob, prefix) {
		return SDPUtils.splitLines(blob).filter(function(line) {
			return line.indexOf(prefix) === 0;
		});
	};
	
	// Parses an ICE candidate line. Sample input:
	// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
	// rport 55996"
	SDPUtils.parseCandidate = function(line) {
		var parts;
		// Parse both variants.
		if (line.indexOf('a=candidate:') === 0) {
			parts = line.substring(12).split(' ');
		} else {
			parts = line.substring(10).split(' ');
		}
	
		var candidate = {
			foundation: parts[0],
			component: parseInt(parts[1], 10),
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
					candidate.ufrag = parts[i + 1]; // for backward compability.
					candidate.usernameFragment = parts[i + 1];
					break;
				default: // extension handling, in particular ufrag
					candidate[parts[i]] = parts[i + 1];
					break;
			}
		}
		return candidate;
	};
	
	// Translates a candidate object into SDP candidate attribute.
	SDPUtils.writeCandidate = function(candidate) {
		var sdp = [];
		sdp.push(candidate.foundation);
		sdp.push(candidate.component);
		sdp.push(candidate.protocol.toUpperCase());
		sdp.push(candidate.priority);
		sdp.push(candidate.address || candidate.ip);
		sdp.push(candidate.port);
	
		var type = candidate.type;
		sdp.push('typ');
		sdp.push(type);
		if (type !== 'host' && candidate.relatedAddress &&
				candidate.relatedPort) {
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
	// a=ice-options:foo bar
	SDPUtils.parseIceOptions = function(line) {
		return line.substr(14).split(' ');
	};
	
	// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
	// a=rtpmap:111 opus/48000/2
	SDPUtils.parseRtpMap = function(line) {
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
	
	// Generate an a=rtpmap line from RTCRtpCodecCapability or
	// RTCRtpCodecParameters.
	SDPUtils.writeRtpMap = function(codec) {
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		var channels = codec.channels || codec.numChannels || 1;
		return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
				(channels !== 1 ? '/' + channels : '') + '\r\n';
	};
	
	// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
	// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
	// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
	SDPUtils.parseExtmap = function(line) {
		var parts = line.substr(9).split(' ');
		return {
			id: parseInt(parts[0], 10),
			direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
			uri: parts[1]
		};
	};
	
	// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
	// RTCRtpHeaderExtension.
	SDPUtils.writeExtmap = function(headerExtension) {
		return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
				(headerExtension.direction && headerExtension.direction !== 'sendrecv'
						? '/' + headerExtension.direction
						: '') +
				' ' + headerExtension.uri + '\r\n';
	};
	
	// Parses an ftmp line, returns dictionary. Sample input:
	// a=fmtp:96 vbr=on;cng=on
	// Also deals with vbr=on; cng=on
	SDPUtils.parseFmtp = function(line) {
		var parsed = {};
		var kv;
		var parts = line.substr(line.indexOf(' ') + 1).split(';');
		for (var j = 0; j < parts.length; j++) {
			kv = parts[j].trim().split('=');
			parsed[kv[0].trim()] = kv[1];
		}
		return parsed;
	};
	
	// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
	SDPUtils.writeFmtp = function(codec) {
		var line = '';
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		if (codec.parameters && Object.keys(codec.parameters).length) {
			var params = [];
			Object.keys(codec.parameters).forEach(function(param) {
				if (codec.parameters[param]) {
					params.push(param + '=' + codec.parameters[param]);
				} else {
					params.push(param);
				}
			});
			line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
		}
		return line;
	};
	
	// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
	// a=rtcp-fb:98 nack rpsi
	SDPUtils.parseRtcpFb = function(line) {
		var parts = line.substr(line.indexOf(' ') + 1).split(' ');
		return {
			type: parts.shift(),
			parameter: parts.join(' ')
		};
	};
	// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
	SDPUtils.writeRtcpFb = function(codec) {
		var lines = '';
		var pt = codec.payloadType;
		if (codec.preferredPayloadType !== undefined) {
			pt = codec.preferredPayloadType;
		}
		if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
			// FIXME: special handling for trr-int?
			codec.rtcpFeedback.forEach(function(fb) {
				lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
				(fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
						'\r\n';
			});
		}
		return lines;
	};
	
	// Parses an RFC 5576 ssrc media attribute. Sample input:
	// a=ssrc:3735928559 cname:something
	SDPUtils.parseSsrcMedia = function(line) {
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
	
	SDPUtils.parseSsrcGroup = function(line) {
		var parts = line.substr(13).split(' ');
		return {
			semantics: parts.shift(),
			ssrcs: parts.map(function(ssrc) {
				return parseInt(ssrc, 10);
			})
		};
	};
	
	// Extracts the MID (RFC 5888) from a media section.
	// returns the MID or undefined if no mid line was found.
	SDPUtils.getMid = function(mediaSection) {
		var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
		if (mid) {
			return mid.substr(6);
		}
	};
	
	SDPUtils.parseFingerprint = function(line) {
		var parts = line.substr(14).split(' ');
		return {
			algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
			value: parts[1]
		};
	};
	
	// Extracts DTLS parameters from SDP media section or sessionpart.
	// FIXME: for consistency with other functions this should only
	//   get the fingerprint line as input. See also getIceParameters.
	SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
		var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
				'a=fingerprint:');
		// Note: a=setup line is ignored since we use the 'auto' role.
		// Note2: 'algorithm' is not case sensitive except in Edge.
		return {
			role: 'auto',
			fingerprints: lines.map(SDPUtils.parseFingerprint)
		};
	};
	
	// Serializes DTLS parameters to SDP.
	SDPUtils.writeDtlsParameters = function(params, setupType) {
		var sdp = 'a=setup:' + setupType + '\r\n';
		params.fingerprints.forEach(function(fp) {
			sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
		});
		return sdp;
	};
	// Parses ICE information from SDP media section or sessionpart.
	// FIXME: for consistency with other functions this should only
	//   get the ice-ufrag and ice-pwd lines as input.
	SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
		var lines = SDPUtils.splitLines(mediaSection);
		// Search in session part, too.
		lines = lines.concat(SDPUtils.splitLines(sessionpart));
		var iceParameters = {
			usernameFragment: lines.filter(function(line) {
				return line.indexOf('a=ice-ufrag:') === 0;
			})[0].substr(12),
			password: lines.filter(function(line) {
				return line.indexOf('a=ice-pwd:') === 0;
			})[0].substr(10)
		};
		return iceParameters;
	};
	
	// Serializes ICE parameters to SDP.
	SDPUtils.writeIceParameters = function(params) {
		return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
				'a=ice-pwd:' + params.password + '\r\n';
	};
	
	// Parses the SDP media section and returns RTCRtpParameters.
	SDPUtils.parseRtpParameters = function(mediaSection) {
		var description = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: [],
			rtcp: []
		};
		var lines = SDPUtils.splitLines(mediaSection);
		var mline = lines[0].split(' ');
		for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
			var pt = mline[i];
			var rtpmapline = SDPUtils.matchPrefix(
					mediaSection, 'a=rtpmap:' + pt + ' ')[0];
			if (rtpmapline) {
				var codec = SDPUtils.parseRtpMap(rtpmapline);
				var fmtps = SDPUtils.matchPrefix(
						mediaSection, 'a=fmtp:' + pt + ' ');
				// Only the first a=fmtp:<pt> is considered.
				codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
				codec.rtcpFeedback = SDPUtils.matchPrefix(
						mediaSection, 'a=rtcp-fb:' + pt + ' ')
					.map(SDPUtils.parseRtcpFb);
				description.codecs.push(codec);
				// parse FEC mechanisms from rtpmap lines.
				switch (codec.name.toUpperCase()) {
					case 'RED':
					case 'ULPFEC':
						description.fecMechanisms.push(codec.name.toUpperCase());
						break;
					default: // only RED and ULPFEC are recognized as FEC mechanisms.
						break;
				}
			}
		}
		SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
			description.headerExtensions.push(SDPUtils.parseExtmap(line));
		});
		// FIXME: parse rtcp.
		return description;
	};
	
	// Generates parts of the SDP media section describing the capabilities /
	// parameters.
	SDPUtils.writeRtpDescription = function(kind, caps) {
		var sdp = '';
	
		// Build the mline.
		sdp += 'm=' + kind + ' ';
		sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
		sdp += ' UDP/TLS/RTP/SAVPF ';
		sdp += caps.codecs.map(function(codec) {
			if (codec.preferredPayloadType !== undefined) {
				return codec.preferredPayloadType;
			}
			return codec.payloadType;
		}).join(' ') + '\r\n';
	
		sdp += 'c=IN IP4 0.0.0.0\r\n';
		sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';
	
		// Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
		caps.codecs.forEach(function(codec) {
			sdp += SDPUtils.writeRtpMap(codec);
			sdp += SDPUtils.writeFmtp(codec);
			sdp += SDPUtils.writeRtcpFb(codec);
		});
		var maxptime = 0;
		caps.codecs.forEach(function(codec) {
			if (codec.maxptime > maxptime) {
				maxptime = codec.maxptime;
			}
		});
		if (maxptime > 0) {
			sdp += 'a=maxptime:' + maxptime + '\r\n';
		}
		sdp += 'a=rtcp-mux\r\n';
	
		if (caps.headerExtensions) {
			caps.headerExtensions.forEach(function(extension) {
				sdp += SDPUtils.writeExtmap(extension);
			});
		}
		// FIXME: write fecMechanisms.
		return sdp;
	};
	
	// Parses the SDP media section and returns an array of
	// RTCRtpEncodingParameters.
	SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
		var encodingParameters = [];
		var description = SDPUtils.parseRtpParameters(mediaSection);
		var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
		var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;
	
		// filter a=ssrc:... cname:, ignore PlanB-msid
		var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
		.map(function(line) {
			return SDPUtils.parseSsrcMedia(line);
		})
		.filter(function(parts) {
			return parts.attribute === 'cname';
		});
		var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
		var secondarySsrc;
	
		var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
		.map(function(line) {
			var parts = line.substr(17).split(' ');
			return parts.map(function(part) {
				return parseInt(part, 10);
			});
		});
		if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
			secondarySsrc = flows[0][1];
		}
	
		description.codecs.forEach(function(codec) {
			if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
				var encParam = {
					ssrc: primarySsrc,
					codecPayloadType: parseInt(codec.parameters.apt, 10)
				};
				if (primarySsrc && secondarySsrc) {
					encParam.rtx = {ssrc: secondarySsrc};
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
				bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
						- (50 * 40 * 8);
			} else {
				bandwidth = undefined;
			}
			encodingParameters.forEach(function(params) {
				params.maxBitrate = bandwidth;
			});
		}
		return encodingParameters;
	};
	
	// parses http://draft.ortc.org/#rtcrtcpparameters*
	SDPUtils.parseRtcpParameters = function(mediaSection) {
		var rtcpParameters = {};
	
		// Gets the first SSRC. Note tha with RTX there might be multiple
		// SSRCs.
		var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
				.map(function(line) {
					return SDPUtils.parseSsrcMedia(line);
				})
				.filter(function(obj) {
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
	
	// parses either a=msid: or a=ssrc:... msid lines and returns
	// the id of the MediaStream and MediaStreamTrack.
	SDPUtils.parseMsid = function(mediaSection) {
		var parts;
		var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
		if (spec.length === 1) {
			parts = spec[0].substr(7).split(' ');
			return {stream: parts[0], track: parts[1]};
		}
		var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
		.map(function(line) {
			return SDPUtils.parseSsrcMedia(line);
		})
		.filter(function(msidParts) {
			return msidParts.attribute === 'msid';
		});
		if (planB.length > 0) {
			parts = planB[0].value.split(' ');
			return {stream: parts[0], track: parts[1]};
		}
	};
	
	// Generate a session ID for SDP.
	// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
	// recommends using a cryptographically random +ve 64-bit value
	// but right now this should be acceptable and within the right range
	SDPUtils.generateSessionId = function() {
		return Math.random().toString().substr(2, 21);
	};
	
	// Write boilder plate for start of SDP
	// sessId argument is optional - if not supplied it will
	// be generated randomly
	// sessVersion is optional and defaults to 2
	// sessUser is optional and defaults to 'thisisadapterortc'
	SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
		var sessionId;
		var version = sessVer !== undefined ? sessVer : 2;
		if (sessId) {
			sessionId = sessId;
		} else {
			sessionId = SDPUtils.generateSessionId();
		}
		var user = sessUser || 'thisisadapterortc';
		// FIXME: sess-id should be an NTP timestamp.
		return 'v=0\r\n' +
				'o=' + user + ' ' + sessionId + ' ' + version +
					' IN IP4 127.0.0.1\r\n' +
				's=-\r\n' +
				't=0 0\r\n';
	};
	
	SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
		var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);
	
		// Map ICE parameters (ufrag, pwd) to SDP.
		sdp += SDPUtils.writeIceParameters(
				transceiver.iceGatherer.getLocalParameters());
	
		// Map DTLS parameters to SDP.
		sdp += SDPUtils.writeDtlsParameters(
				transceiver.dtlsTransport.getLocalParameters(),
				type === 'offer' ? 'actpass' : 'active');
	
		sdp += 'a=mid:' + transceiver.mid + '\r\n';
	
		if (transceiver.direction) {
			sdp += 'a=' + transceiver.direction + '\r\n';
		} else if (transceiver.rtpSender && transceiver.rtpReceiver) {
			sdp += 'a=sendrecv\r\n';
		} else if (transceiver.rtpSender) {
			sdp += 'a=sendonly\r\n';
		} else if (transceiver.rtpReceiver) {
			sdp += 'a=recvonly\r\n';
		} else {
			sdp += 'a=inactive\r\n';
		}
	
		if (transceiver.rtpSender) {
			// spec.
			var msid = 'msid:' + stream.id + ' ' +
					transceiver.rtpSender.track.id + '\r\n';
			sdp += 'a=' + msid;
	
			// for Chrome.
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
					' ' + msid;
			if (transceiver.sendEncodingParameters[0].rtx) {
				sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
						' ' + msid;
				sdp += 'a=ssrc-group:FID ' +
						transceiver.sendEncodingParameters[0].ssrc + ' ' +
						transceiver.sendEncodingParameters[0].rtx.ssrc +
						'\r\n';
			}
		}
		// FIXME: this should be written by writeRtpDescription.
		sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
				' cname:' + SDPUtils.localCName + '\r\n';
		if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
			sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
					' cname:' + SDPUtils.localCName + '\r\n';
		}
		return sdp;
	};
	
	// Gets the direction from the mediaSection or the sessionpart.
	SDPUtils.getDirection = function(mediaSection, sessionpart) {
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
	
	SDPUtils.getKind = function(mediaSection) {
		var lines = SDPUtils.splitLines(mediaSection);
		var mline = lines[0].split(' ');
		return mline[0].substr(2);
	};
	
	SDPUtils.isRejected = function(mediaSection) {
		return mediaSection.split(' ', 2)[1] === '0';
	};
	
	SDPUtils.parseMLine = function(mediaSection) {
		var lines = SDPUtils.splitLines(mediaSection);
		var parts = lines[0].substr(2).split(' ');
		return {
			kind: parts[0],
			port: parseInt(parts[1], 10),
			protocol: parts[2],
			fmt: parts.slice(3).join(' ')
		};
	};
	
	SDPUtils.parseOLine = function(mediaSection) {
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
	SDPUtils.isValidSDP = function(blob) {
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
	if (typeof module === 'object') {
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

var share = (function share() {

	var avatarUrl = '../static/plugins/ep_profile_modal/static/img/user.png';
	var getAvatarUrl = function (userId) {
		if(!userId) return avatarUrl;

		return '/p/getUserProfileImage/'+userId+"/"+window.pad.getPadId()+"?t=" + new Date().getTime();
	}

	var getValidUrl = function(url = ""){
		if(url=="") return "";
		let newUrl = window.decodeURIComponent(url);
		newUrl = newUrl.trim().replace(/\s/g, "");

		if(/^(:\/\/)/.test(newUrl)){
				return `http${newUrl}`;
		}
		if(!/^(f|ht)tps?:\/\//i.test(newUrl)){
				return `http://${newUrl}`;
		}

		return newUrl;
	};

	var getUserId = function getUserId() {
		return clientVars.userId || window.pad.getUserId();
	}

	function stopStreaming(stream) {
		if (stream) {
			stream.getTracks().forEach(function stopStream(track) {
				track.stop();
				stream.removeTrack(track);
			});
			stream = null;
		}
	}

	var scrollDownToLastChatText = function scrollDownToLastChatText(selector) {
		var $element = $(selector);
		if ($element.length <= 0 || !$element[0]) return true;
		$element.animate({ scrollTop: $element[0].scrollHeight }, { duration: 400, queue: false });
	};

	var getUserFromId = function getUserFromId(userId) {
		if (!window.pad || !window.pad.collabClient) return null;
		var result = window.pad.collabClient.getConnectedUsers().filter(function getUser(user) {
			return user.userId === userId;
		});
		var user = result.length > 0 ? result[0] : null;
		return user;
	};

	var slugify = function slugify(text) {
		return text.toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
	};

	var $body_ace_outer = function $body_ace_outer() {
		return $(document).find('iframe[name="ace_outer"]').contents();
	};

	var createShareLink = function createShareLink(headingTagId, headerText) {
		return window.location.origin + window.location.pathname + '?header=' + slugify(headerText) + '&headerId=' + headingTagId + '&joinvideo=true';
	};

	function addTextChatMessage(msg) {
		var authorClass = 'author-' + msg.userId.replace(/[^a-y0-9]/g, function replace(c) {
			if (c === '.') return '-';
			return 'z' + c.charCodeAt(0) + 'z';
		});

		// create the time string
		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var html = "<p data-target='" + msg.target + "' data-id='" + msg.headerId + "' data-authorId='" + msg.userId + "' class='wrtc_text " + msg.headId + ' ' + authorClass + "'><b>" + msg.userName + "</b><span class='time " + authorClass + "'>" + timeStr + '</span> ' + msg.text + '</p>';

		$(document).find('#chatbox #chattext').append(html);
		scrollDownToLastChatText('#chatbox #chattext');
	}

	var notifyNewUserJoined = function notifyNewUserJoined(target, msg, action) {
		var videoIcon = '<span class="videoIcon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-video fa-w-18 fa-2x"><path fill="currentColor" d="M336.2 64H47.8C21.4 64 0 85.4 0 111.8v288.4C0 426.6 21.4 448 47.8 448h288.4c26.4 0 47.8-21.4 47.8-47.8V111.8c0-26.4-21.4-47.8-47.8-47.8zm189.4 37.7L416 177.3v157.4l109.6 75.5c21.2 14.6 50.4-.3 50.4-25.8V127.5c0-25.4-29.1-40.4-50.4-25.8z" class=""></path></svg></span>';
		var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
		var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';

		var text = action === 'JOIN' ? 'joins' : 'leaves';

		if (target === 'VIDEO') {
			var roomCounter = "<span class='userCount'>(" + msg.userCount + '/' + msg.VIDEOCHATLIMIT + ')</span>';
			msg.text = '<span>' + text + '</span>' + videoIcon + btnJoin + roomCounter;
		} else if (target === 'TEXT') {
			msg.text = '<span>' + text + '</span>' + textIcon + btnJoin;
		}

		msg.target = target;

		addTextChatMessage(msg);
	};

	var roomBoxIconActive = function roomBoxIconActive() {
		$body_ace_outer().find('.wbrtc_roomBox').each(function (index, val) {
			var textActive = $(val).attr('data-text');
			var videoActive = $(val).attr('data-video');
			if (textActive || videoActive) {
				$(val).find('.btn_joinChat_chatRoom').addClass('active');
			} else {
				$(val).find('.btn_joinChat_chatRoom').removeClass('active');
			}
		});
	};

	var appendUserList = function appendUserList(roomInfo, selector) {
		if (!roomInfo.list) return true;
		var $element = typeof selector === 'string' ? $(document).find(selector) : selector;
		$element.empty();
		roomInfo.list.forEach(function reOrderUserList(el) {
			var userInList = getUserFromId(el.userId) || { colorId: '', name: 'anonymous', userId: '0000000' };
			$element.append('<li data-id=' + el.userId + " style='border-color: " + userInList.colorId + "'><div class='avatar'><img title='" + userInList.name + "' src='" + getAvatarUrl(el.userId) + "'></div>" + userInList.name + '</li>');
		});
	};

	// socketState: 'CLOSED', 'OPEND', 'DISCONNECTED'
	var wrtcStore = {
		socketState: 'CLOSED',
		components: {
			text: {active: false},
			video: {active: false},
			room: {active: false}
		}
	};

	var wrtcPubsub = {
		events: {},
		on: function on(eventName, fn) {
			this.events[eventName] = this.events[eventName] || [];
			this.events[eventName].push(fn);
		},
		off: function off(eventName, fn) {
			if (this.events[eventName]) {
				for (var i = 0; i < this.events[eventName].length; i++) {
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
				this.events[eventName].forEach(function (fn) {
					fn.apply(undefined, data);
				});
			}
		}
	};

	var inlineAvatar = {
		ROOM: function ROOM(headerId, room) {
			var inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
			var $element = $body_ace_outer().find('#wbrtc_avatarCol .' + headerId + ' .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			$element.parent().css({ left: WRTC_Room.getHeaderRoomX($element.parent()) + 'px' });
			Object.keys(room).forEach(function reOrderUserList(key, index) {
				var userInList = getUserFromId(room[key].userId) || { colorId: '', name: 'anonymous'};
				if(userInList.userId){
					if (index < inlineAvatarLimit) {
						$element.find('.avatarMore').hide();
						$element.append('<div class="avatar" data-id="' + userInList.userId + '"><img title="' + userInList.name + '" src="' + getAvatarUrl(userInList.userId) + '"></div>');
					} else {
						$element.find('.avatarMore').show().text('+' + (index + 1 - inlineAvatarLimit));
					}
				}
			});
		},
		TEXT: function TEXT(headerId, room) {
			var $element = $(document).find('#wrtc_textChatWrapper .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			this.append(room.list, $element);
		},
		VIDEO: function VIDEO(headerId, room) {
			var $element = $(document).find('#werc_toolbar .wrtc_inlineAvatars');
			$element.find('.avatar').remove();
			this.append(room.list, $element);
		},
		append: function appendAvatart(list, $element) {
			var inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
			list.forEach(function reOrderUserList(el, index) {
				var userInList = getUserFromId(el.userId) || { colorId: '', name: 'anonymous'};
				if(userInList.userId){
					if (index < inlineAvatarLimit) {
						$element.find('.avatarMore').hide();
						$element.append('<div class="avatar" data-id="' + userInList.userId + '"><img title="' + userInList.name + '" src="' + getAvatarUrl(userInList.userId) + '"></div>');
					} else {
						$element.find('.avatarMore').show().text('+' + (index + 1 - inlineAvatarLimit));
					}
				}
			});
		},
		update: function updateInfo(userId, data){
			var $roomBox = $body_ace_outer().find('#wbrtc_avatarCol .wrtc_inlineAvatars');
			var $textBox = $(document).find('#wrtc_textChatWrapper .wrtc_inlineAvatars');
			var $videoBox = $(document).find('#werc_toolbar .wrtc_inlineAvatars');

			if($roomBox)
				$roomBox.find('.avatar[data-id="' + userId + '"] img').attr({
					'src': data.imageUrl,
					'title': data.userName
				});

			if($videoBox)
				$videoBox.find('.avatar img').attr({
					'src': data.imageUrl,
					'title': data.userName
				});

			if($textBox)
				$textBox.find('.avatar img').attr({
					'src': data.imageUrl,
					'title': data.userName
				});

		}
	};

	wrtcPubsub.on('update network information', function(){

	});

	wrtcPubsub.on('socket state', function(state){
		wrtcStore.socketState = state
		console.info('[wrtc]: socket state has been change, new state:', state);
	});

	wrtcPubsub.on('component status', function(componentName, status) {
		wrtcStore.components[componentName].active = status;
	})

	wrtcPubsub.on('update inlineAvater info', function(userId, data) {
		inlineAvatar.update(userId, data);
	})

	wrtcPubsub.on('update store', function (requestUser, headerId, action, target, roomInfo, callback) {
		if (!requestUser || !headerId || !action || !roomInfo || !target) return false;

		if(!wrtcStore[headerId]) wrtcStore[headerId] = {};
		if(!wrtcStore[headerId].USERS) wrtcStore[headerId].USERS = {};

		var users = wrtcStore[headerId].USERS;
		wrtcStore[headerId][target] = roomInfo;
		// if(action === "JOIN"){}
		// if(action === "LEAVE"){}
		// remove all users
		users = {};

		wrtcStore[headerId].TEXT.list.forEach(function (el) {
			if (!users[el.userId]) users[el.userId] = {};
			users[el.userId] = el;
		});

		wrtcStore[headerId].VIDEO.list.forEach(function (el) {
			if (!users[el.userId]) users[el.userId] = {};
			users[el.userId] = el;
		});

		inlineAvatar[target](headerId, wrtcStore[headerId][target]);
		inlineAvatar.ROOM(headerId, users);

		if (callback) callback(wrtcStore[headerId]);
	});

	wrtcPubsub.on('disable room buttons', function disableRoomButtons(headerId, actions, target) {
		var $headingRoom = $body_ace_outer().find('#' + headerId);

		var $btnVideo = $headingRoom.find('.btn_icon[data-join="VIDEO"]');
		var $btnText = $headingRoom.find('.btn_icon[data-join="TEXT"]');
		var $btnPlus = $headingRoom.find('.btn_icon[data-join="PLUS"]');
		
		$btnPlus.find('.loader').remove();
		$btnPlus.append('<div class="loader"></div>');

		if (target === 'TEXT' || target === 'VIDEO') {
			// disable target and plus buttton
			$headingRoom.find('.btn_icon[data-join="' + target + '"]').prop('disabled', true);
			$btnPlus.prop('disabled', true);
		}

		if (target === 'PLUS') {
			// disable all buttons
			$btnText.prop('disabled', true);
			$btnVideo.prop('disabled', true);
			$btnPlus.prop('disabled', true);
		}
	});

	wrtcPubsub.on('enable room buttons', function enableRoomButtons(headerId, action, target) {
		var $headingRoom = $body_ace_outer().find('#' + headerId);
		var newAction = action === 'JOIN' ? 'LEAVE' : 'JOIN';

		var $btnVideo = $headingRoom.find('.btn_icon[data-join="VIDEO"]');
		var $btnText = $headingRoom.find('.btn_icon[data-join="TEXT"]');
		var $btnPlus = $headingRoom.find('.btn_icon[data-join="PLUS"]');

		$btnPlus.find('.loader').remove();

		if (target === 'TEXT' || target === 'VIDEO') {
			// enable target and plus buttton
			$headingRoom.find('.btn_icon[data-join="' + target + '"]').attr({ 'data-action': newAction }).prop('disabled', false);

			$btnPlus.attr({ 'data-action': newAction }).prop('disabled', false);
		}

		if (target === 'TEXTPLUS') {
			// enable text button
			$btnText.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnVideo.attr({ 'data-action': newAction });
		}

		if (target === 'PLUS') {
			// make enable and action toggle all buttons
			$btnText.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnVideo.attr({ 'data-action': newAction }).prop('disabled', false);
			$btnPlus.attr({ 'data-action': newAction }).prop('disabled', false);
		}
	});

	return {
		scrollDownToLastChatText,
		getUserFromId,
		slugify,
		$body_ace_outer,
		createShareLink,
		notifyNewUserJoined,
		roomBoxIconActive,
		appendUserList,
		wrtcStore,
		wrtcPubsub,
		getUserId,
		stopStreaming,
		getValidUrl
		
	}

})();


// inspired by ep_comments_page plugin, used and modified copyPasteEvents.js

'use strict';
var _ = require('ep_etherpad-lite/static/js/underscore');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

var events = (function(){
	var padInner = null;

	var getFirstColumnOfSelection = function getFirstColumnOfSelection(line, rep, firstLineOfSelection) {
		return line !== firstLineOfSelection ? 0 : rep.selStart[1];
	};

	var getLength = function getLength(line, rep) {
		var nextLine = line + 1;
		var startLineOffset = rep.lines.offsetOfIndex(line);
		var endLineOffset = rep.lines.offsetOfIndex(nextLine);

		// lineLength without \n
		var lineLength = endLineOffset - startLineOffset - 1;

		return lineLength;
	};

	var getLastColumnOfSelection = function getLastColumnOfSelection(line, rep, lastLineOfSelection) {
		var lastColumnOfSelection;
		if (line !== lastLineOfSelection) {
			lastColumnOfSelection = getLength(line, rep); // length of line
		} else {
			lastColumnOfSelection = rep.selEnd[1] - 1; // position of last character selected
		}
		return lastColumnOfSelection;
	};

	var hasCommentOnLine = function hasCommentOnLine(lineNumber, firstColumn, lastColumn, attributeManager) {
		var foundHeadOnLine = false;
		var headId = null;
		for (var column = firstColumn; column <= lastColumn && !foundHeadOnLine; column++) {
			headId = _.object(attributeManager.getAttributesOnPosition(lineNumber, column)).headingTagId;
			if (headId) {
				foundHeadOnLine = true;
			}
		}
		return { foundHeadOnLine: foundHeadOnLine, headId: headId };
	};

	var hasCommentOnMultipleLineSelection = function hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager) {
		var foundLineWithComment = false;
		for (var line = firstLineOfSelection; line <= lastLineOfSelection && !foundLineWithComment; line++) {
			var firstColumn = getFirstColumnOfSelection(line, rep, firstLineOfSelection);
			var lastColumn = getLastColumnOfSelection(line, rep, lastLineOfSelection);
			var hasComment = hasCommentOnLine(line, firstColumn, lastColumn, attributeManager);
			if (hasComment) {
				foundLineWithComment = true;
			}
		}
		return foundLineWithComment;
	};

	var hasMultipleLineSelected = function hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection) {
		return firstLineOfSelection !== lastLineOfSelection;
	};

	var hasHeaderOnSelection = function hasHeaderOnSelection() {
		var hasVideoHeader;
		var attributeManager = this.documentAttributeManager;
		var rep = this.rep;
		var firstLineOfSelection = rep.selStart[0];
		var firstColumn = rep.selStart[1];
		var lastColumn = rep.selEnd[1];
		var lastLineOfSelection = rep.selEnd[0];
		var selectionOfMultipleLine = hasMultipleLineSelected(firstLineOfSelection, lastLineOfSelection);
		if (selectionOfMultipleLine) {
			hasVideoHeader = hasCommentOnMultipleLineSelection(firstLineOfSelection, lastLineOfSelection, rep, attributeManager);
		} else {
			hasVideoHeader = hasCommentOnLine(firstLineOfSelection, firstColumn, lastColumn, attributeManager);
		}
		return { hasVideoHeader: hasVideoHeader.foundHeadOnLine, headId: hasVideoHeader.headId, hasMultipleLine: selectionOfMultipleLine };
	};

	function getSelectionHtml() {
		var html = '';
		if (typeof window.getSelection !== 'undefined') {
			var sel = padInner.contents()[0].getSelection();
			if (sel.rangeCount) {
				var container = document.createElement('div');
				for (var i = 0, len = sel.rangeCount; i < len; ++i) {
					container.appendChild(sel.getRangeAt(i).cloneContents());
				}
				html = container.innerHTML;
			}
		} else if (typeof document.selection !== 'undefined') {
			if (document.selection.type === 'Text') {
				html = document.selection.createRange().htmlText;
			}
		}
		return html;
	}

	function selectionMultipleLine() {
		var rawHtml = getSelectionHtml();
		rawHtml = $('<div></div>').append(rawHtml);
		rawHtml.find(':header span').removeClass(function removeClass(index, css) {
			return (css.match(/\headingTagId_\S+/g) || []).join(' ');
		}).addClass(function addClass(index, css) {
			return 'headingTagId_' + randomString(16) + ' ' + css;
		});
		return rawHtml.html();
	}

	function selectionOneLine(headerId) {
		var hTag = padInner.contents().find('.headingTagId_' + headerId).closest(':header').eq(0).prop("tagName").toLowerCase();
		var content = padInner.contents().find('.headingTagId_' + headerId).closest(':header span').removeClass(function(index, css) {
			return (css.match(/\headingTagId_\S+/g) || []).join(' ');
		}).html();
		if(!hTag && !content) return false;
		var rawHtml = $('<div></div>').append('<' + hTag + "><span class='headingTagId_" + randomString(16) + "'>" + content + '</span></' + hTag + '>');
		return rawHtml.html();
	}

	var addTextOnClipboard = function addTextOnClipboard(e, aces, inner, removeSelection) {
		padInner = inner;

		var selection;
		aces.callWithAce(function callWithAce(ace) {
			selection = ace.ace_hasHeaderOnSelection();
		});

		if (selection.hasVideoHeader || selection.hasMultipleLine) {
			var rawHtml;
			if (selection.hasMultipleLine) {
				var htmlSelection = getSelectionHtml();
				rawHtml = selectionMultipleLine(htmlSelection);
			} else {
				if(!selection.headId) return false;
				rawHtml = selectionOneLine(selection.headId);
			}

			if (rawHtml) {
				e.originalEvent.clipboardData.setData('text/html', rawHtml);
				e.preventDefault();
				return false;
			}

			// if it is a cut event we have to remove the selection
			if (removeSelection) {
				padInner.contents()[0].execCommand('delete');
			}
		}
	};

	return {
		hasHeaderOnSelection,
		addTextOnClipboard,
	}

})();


// CodecsHandler.js
var CodecsHandler = (function() {
	function preferCodec(sdp, codecName) {
			var info = splitLines(sdp);

			codecName = codecName.toLowerCase()

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
			var preferCodecNumber = '';

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

			var newLine = info.videoCodecNumbersOriginal.split('SAVPF')[0] + 'SAVPF ';

			var newOrder = [preferCodecNumber];

			if (ignore) {
					newOrder = [];
			}

			info.videoCodecNumbers.forEach(function(codecNumber) {
					if (codecNumber === preferCodecNumber) return;
					newOrder.push(codecNumber);
			});

			newLine += newOrder.join(' ');

			sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine);
			return sdp;
	}

	function splitLines(sdp) {
			var info = {};
			sdp.split('\n').forEach(function(line) {
					if (line.indexOf('m=video') === 0) {
							info.videoCodecNumbers = [];
							line.split('SAVPF')[1].split(' ').forEach(function(codecNumber) {
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
			var info = splitLines(sdp);

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

			peer.getSenders().forEach(function(sender) {
					var params = sender.getParameters();
					for (var i = 0; i < params.codecs.length; i++) {
							if (params.codecs[i].mimeType == codecMimeType) {
									params.codecs.unshift(params.codecs.splice(i, 1));
									break;
							}
					}
					sender.setParameters(params);
			});
	}

	function removeNonG722(sdp) {
			return sdp.replace(/m=audio ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, 'm=audio $1 RTP\/SAVPF 9');
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
			sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + bandwidth.screen + '\r\n');
		}

		// remove existing bandwidth lines
		if (bandwidth.audio || bandwidth.video || bandwidth.data) {
			sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
		}

		if (bandwidth.audio) {
			sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
		}

		if (bandwidth.video) {
			sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (isScreen ? bandwidth.screen : bandwidth.video) + '\r\n');
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
			var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
			for (var i = startLine; i < realEndLine; ++i) {
					if (sdpLines[i].indexOf(prefix) === 0) {
							if (!substr ||
									sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
									return i;
							}
					}
			}
			return null;
	}

	// Gets the codec payload type from an a=rtpmap:X line.
	function getCodecPayloadType(sdpLine) {
			var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
			var result = sdpLine.match(pattern);
			return (result && result.length === 2) ? result[1] : null;
	}

	function setVideoBitrates(sdp, params) {
			params = params || {};
			var xgoogle_min_bitrate = params.min;
			var xgoogle_max_bitrate = params.max;
			var videoCodec = params.codec.toUpperCase() || "VP8";
			


			var sdpLines = sdp.split('\r\n');

			// VP8
			var vp8Index = findLine(sdpLines, 'a=rtpmap', videoCodec+'/90000');
			var vp8Payload;
			if (vp8Index) {
					vp8Payload = getCodecPayloadType(sdpLines[vp8Index]);
			}

			if (!vp8Payload) {
					return sdp;
			}

			var rtxIndex = findLine(sdpLines, 'a=rtpmap', 'rtx/90000');
			var rtxPayload;
			if (rtxIndex) {
					rtxPayload = getCodecPayloadType(sdpLines[rtxIndex]);
			}

			if (!rtxIndex) {
					return sdp;
			}

			var rtxFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + rtxPayload.toString());
			if (rtxFmtpLineIndex !== null) {
					var appendrtxNext = '\r\n';
					appendrtxNext += 'a=fmtp:' + vp8Payload + ' x-google-min-bitrate=' + (xgoogle_min_bitrate || '228') + '; x-google-max-bitrate=' + (xgoogle_max_bitrate || '228');
					sdpLines[rtxFmtpLineIndex] = sdpLines[rtxFmtpLineIndex].concat(appendrtxNext);
					sdp = sdpLines.join('\r\n');
			}


			return sdp;
	}

	function setOpusAttributes(sdp, params) {
			params = params || {};

			var sdpLines = sdp.split('\r\n');

			// Opus
			var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000');
			var opusPayload;
			if (opusIndex) {
					opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
			}

			if (!opusPayload) {
					return sdp;
			}

			var opusFmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
			if (opusFmtpLineIndex === null) {
					return sdp;
			}

			var appendOpusNext = '';
			appendOpusNext += '; stereo=' + (typeof params.stereo != 'undefined' ? params.stereo : '1');
			appendOpusNext += '; sprop-stereo=' + (typeof params['sprop-stereo'] != 'undefined' ? params['sprop-stereo'] : '1');

			if (typeof params.maxaveragebitrate != 'undefined') {
					appendOpusNext += '; maxaveragebitrate=' + (params.maxaveragebitrate || 128 * 1024 * 8);
			}

			if (typeof params.maxplaybackrate != 'undefined') {
					appendOpusNext += '; maxplaybackrate=' + (params.maxplaybackrate || 128 * 1024 * 8);
			}

			if (typeof params.cbr != 'undefined') {
					appendOpusNext += '; cbr=' + (typeof params.cbr != 'undefined' ? params.cbr : '1');
			}

			if (typeof params.useinbandfec != 'undefined') {
					appendOpusNext += '; useinbandfec=' + params.useinbandfec;
			}

			if (typeof params.usedtx != 'undefined') {
					appendOpusNext += '; usedtx=' + params.usedtx;
			}

			if (typeof params.maxptime != 'undefined') {
					appendOpusNext += '\r\na=maxptime:' + params.maxptime;
			}

			sdpLines[opusFmtpLineIndex] = sdpLines[opusFmtpLineIndex].concat(appendOpusNext);

			sdp = sdpLines.join('\r\n');
			return sdp;
	}

	// forceStereoAudio => via webrtcexample.com
	// requires getUserMedia => echoCancellation:false
	function forceStereoAudio(sdp) {
			var sdpLines = sdp.split('\r\n');
			var fmtpLineIndex = null;
			for (var i = 0; i < sdpLines.length; i++) {
					if (sdpLines[i].search('opus/48000') !== -1) {
							var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
							break;
					}
			}
			for (var i = 0; i < sdpLines.length; i++) {
					if (sdpLines[i].search('a=fmtp') !== -1) {
							var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/);
							if (payload === opusPayload) {
									fmtpLineIndex = i;
									break;
							}
					}
			}
			if (fmtpLineIndex === null) return sdp;
			sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1; sprop-stereo=1');
			sdp = sdpLines.join('\r\n');
			return sdp;
	}

	return {
			removeVPX: removeVPX,
			disableNACK: disableNACK,
			prioritize: prioritize,
			removeNonG722: removeNonG722,
			setApplicationSpecificBandwidth: function(sdp, bandwidth, isScreen) {
					return setBAS(sdp, bandwidth, isScreen);
			},
			setVideoBitrates: function(sdp, params) {
					return setVideoBitrates(sdp, params);
			},
			setOpusAttributes: function(sdp, params) {
					return setOpusAttributes(sdp, params);
			},
			preferVP9: function(sdp) {
					return preferCodec(sdp, 'vp9');
			},
			preferCodec: preferCodec,
			forceStereoAudio: forceStereoAudio
	};
})();

'use strict';
var padutils = require('ep_etherpad-lite/static/js/pad_utils').padutils;

var textChat = (function textChat() {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var $joinBtn = null;

	function createAndAppendMessage(msg) {
		if (!msg || !currentRoom.userId) return true;

		// correct the time
		// msg.time += window.clientTimeOffset;

		var minutes = '' + new Date(msg.time).getMinutes();
		var hours = '' + new Date(msg.time).getHours();
		if (minutes.length === 1) minutes = '0' + minutes;
		if (hours.length === 1) hours = '0' + hours;
		var timeStr = hours + ':' + minutes;

		var userName = $('<b>').text(msg.userName + ': ');
		var tim = $('<span>').attr({ 'class': 'time' }).text(timeStr);

		var text = padutils.escapeHtmlWithClickableLinks(msg.text, "_blank");

		// var urlParams = new URLSearchParams(msg.text.split("?")[1]);

		// if(urlParams.get('id')) {
		// 	var headerId = urlParams.get('id');
		// 	var target = urlParams.get('target');
		// 	var join = urlParams.get('join');
		// 	text = $(text).attr({
		// 		"data-join": join,
		// 		"data-action":"JOIN",
		// 		"data-id": headerId
		// 	}).addClass('btn_roomHandler')
		// }


		var message = $('<p>').attr({
			'data-authorid': msg.author
		}).append(userName).append(tim).append(text);

		$('#wrtc_textChat').append(message);
		share.scrollDownToLastChatText('#wrtc_textChat');
	}

	// function privateNotifyNewUserJoined(target, msg, action) {
	// 	var textIcon = '<span class="textIcon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M416 224V64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64v160c0 35.3 28.7 64 64 64v54.2c0 8 9.1 12.6 15.5 7.8l82.8-62.1H352c35.3.1 64-28.6 64-63.9zm96-64h-64v64c0 52.9-43.1 96-96 96H192v64c0 35.3 28.7 64 64 64h125.7l82.8 62.1c6.4 4.8 15.5.2 15.5-7.8V448h32c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64z"></path></svg></span>';
	// 	var btnJoin = "<span class='wrtc_roomLink' data-join='" + target + "' data-action='JOIN' data-id='" + msg.headerId + "' title='Join'>" + msg.headerTitle + '</span>';

	// 	var text = action === 'JOIN' ? 'joins' : 'leaves';

	// 	msg.text = '<span>' + text + '</span>' + textIcon + btnJoin;

	// 	msg.target = target;

	// 	createAndAppendMessage(msg);
	// }

	function eventTextChatInput() {
		var keycode = event.keyCode || event.which;
		// when press Enter key
		if (keycode === 13) {
			var textMessage = $(this).val();
			if (!textMessage) return true;
			$(this).val('');
			var user = share.getUserFromId(clientVars.userId);
			if(!user) return true;
			var msg = { text: textMessage, userName: user.name, author: user.userId, time: new Date().getTime() };
			socket.emit('sendTextMessage', padId, currentRoom.headerId, msg, function sendTextMessage(incomMsg) {
				createAndAppendMessage(incomMsg);
			});
		}
	}

	function eventListers() {
		$(document).on('keypress', '#wrtc_textChatInputBox input', eventTextChatInput);

		$(document).on('click', '#wrtc_textChatWrapper .btn_toggle_modal', function click() {
			var action = $(this).attr('data-action');
			var chatBox = $('#wrtc_textChat').innerHeight() + $('#wrtc_textChatInputBox').innerHeight() + 1;

			$(this).find('.fa_arrow-from-top').toggle();
			$(this).find('.fa_arrow-to-top').toggle();

			if (action === 'collapse') {
				$(this).attr({ 'data-action': 'expand' });
				$('#wrtc_textChatWrapper').css({
					transform: 'translate(-50%, ' + chatBox + 'px)'
				});
			} else {
				$(this).attr({ 'data-action': 'collapse' });
				$('#wrtc_textChatWrapper').css({
					transform: 'translate(-50%, 0)'
				});
			}
		});
	}

	function deactivateModal(headerId, roomInfo) {
		var $TextChatWrapper = $(document).find('#wrtc_textChatWrapper');

		$TextChatWrapper.removeClass('active').removeAttr('style');
		$TextChatWrapper.find('#wrtc_textChat p').remove();
		// socket.removeListener('receiveTextMessage:' + headerId);

		var $btn = $(document).find('#wrtc_textChatWrapper .btn_toggle_modal');
		$btn.attr({ 'data-action': 'collapse' });
		$btn.find('.fa_arrow-from-top').toggle();
		$btn.find('.fa_arrow-to-top').toggle();
	}

	function activateModal(headerId, headTitle, userCount, roomInfo) {
		if (!headerId) return false;
		var existTextChat = $(document).find('#wrtc_textChatWrapper');
		if (!existTextChat.length) {
			var textChatBox = $('#wrtc_textChatBox').tmpl({
				headerId: headerId,
				headTitle: headTitle
			});
			$('body').append(textChatBox);
		} else {
			// TODO: change this to template
			existTextChat.attr({ 'data-id': headerId }).find('.textChatToolbar b, .btn_leave').attr({ 'data-id': headerId });
			existTextChat.find('.nd_title b').text(headTitle);
		}

		// for animation pop up
		setTimeout(function setTimeout() {
			$(document).find('#wrtc_textChatWrapper').addClass('active');
		}, 250);

		socket.on('receiveTextMessage:' + headerId, function receiveTextMessage(headingId, msg) {
			if (headingId === headerId) {
				createAndAppendMessage(msg);
			}
		});

		socket.emit('getTextMessages', padId, headerId, {}, function getTextMessages(data) {
			data.forEach(function (el) {
				createAndAppendMessage(el);
			});
		});

		share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');
	}

	function addUserToRoom(data, roomInfo) {
		if (!data || !data.userId) return true;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// TODO: this is not good idea, use global state
		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.textChat ul'));
		share.appendUserList(roomInfo, '#wrtc_textChatWrapper  #textChatUserModal ul');

		// notify, a user join the video-chat room
		// var msg = {
		// 	time: new Date(),
		// 	userId: data.userId || user.userId,
		// 	userName: user.name || data.name || 'anonymous',
		// 	headerId: data.headerId,
		// 	userCount: userCount,
		// 	headerTitle: headTitle
		// };
		// share.notifyNewUserJoined('TEXT', msg, 'JOIN');

		// if (data.headerId === currentRoom.headerId) {
		// 	var privateMsg = {
		// 		userName: user.name,
		// 		author: user.userId,
		// 		headerTitle: headTitle,
		// 		time: new Date().getTime()
		// 	};
		// 	privateNotifyNewUserJoined('TEXT', privateMsg, 'JOIN');
		// }

		// if (data.headerId === currentRoom.headerId && data.userId !== clientVars.userId) {
		// 	$.gritter.add({
		// 		text: '<span class="author-name">' + user.name + '</span>' + 'has joined the text-chat, <b><i> "' + headTitle + '"</b></i>',
		// 		sticky: false,
		// 		time: 3000,
		// 		position: 'center',
		// 		class_name: 'chat-gritter-msg'
		// 	});
		// }

		if (data.userId === clientVars.userId) {
			currentRoom = data;
			$headingRoom.attr({ 'data-text': true });
			share.roomBoxIconActive();
			activateModal(headerId, headTitle, userCount, roomInfo);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
		}

		share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'TEXT', roomInfo, function updateStore() {});
	}

	function removeUserFromRoom(data, roomInfo, target, cb) {
		if (!data || !data.userId) return true;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var userCount = roomInfo.present;
		$headingRoom.find('.textChatCount').text(userCount);

		var $textChatUserList = $headingRoom.find('.wrtc_content.textChat ul');

		share.appendUserList(roomInfo, $textChatUserList);
		share.appendUserList(roomInfo, '#wrtc_textChatWrapper #textChatUserModal ul');

		if (userCount === 0) {
			$textChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_text" data-action="JOIN" data-id="' + headerId + '" data-join="TEXT"><b>text-chat</b></button></li>');
		}

		// var user = share.getUserFromId(data.userId);

		// notify, a user join the text-chat room
		// var msg = {
		// 	time: new Date(),
		// 	userId: user.userId || data.userId,
		// 	userName: user.name || data.name || 'anonymous',
		// 	headerId: data.headerId,
		// 	userCount: userCount,
		// 	headerTitle: headTitle
		// };
		// share.notifyNewUserJoined('TEXT', msg, 'LEAVE');

		// if (data.headerId === currentRoom.headerId) {
		// 	var privateMsg = {
		// 		userName: user.name,
		// 		author: user.userId,
		// 		headerTitle: headTitle,
		// 		time: new Date().getTime()
		// 	};
		// 	privateNotifyNewUserJoined('TEXT', privateMsg, 'LEAVE');
		// }

		if (data.userId === clientVars.userId) {
			$headingRoom.removeAttr('data-text');
			share.roomBoxIconActive();
			currentRoom = {};
			deactivateModal(data.headerId, roomInfo);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
		}

		share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'TEXT', roomInfo, function () {});

		if (cb && typeof cb === 'function') cb();
	}

	function userJoin(headerId, userData, $joinButton) {
		if (!userData || !userData.userId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		// check if user already in that room
		if (currentRoom && currentRoom.headerId === headerId) {
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			return false;
		}

		$joinBtn = $joinButton;

		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');

		if (!currentRoom.userId) {
			socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
		} else {
			socket.emit('userLeave', padId, currentRoom, 'text', function userLeave(data, roomInfo, target) {
				removeUserFromRoom(data, roomInfo, 'text', function join2newOne() {
					socket.emit('userJoin', padId, userData, 'text', addUserToRoom);
				});
			});
		}
	}

	function userLeave(headerId, userData, $joinButton) {
		$joinBtn = $joinButton;
		socket.emit('userLeave', padId, userData, 'text', removeUserFromRoom);
	}

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function (headerId) {
			var roomInfo = {
				present: rooms[headerId].length,
				list: rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
				addUserToRoom(user, roomsInfo[headerId], 'text');
			});
		});
	}

	function bulkUpdateRooms(hTagList) {
		socket.emit('bulkUpdateRooms', padId, hTagList, 'text', socketBulkUpdateRooms);
	}

	function postAceInit(hook, context, webSocket, docId) {
		socket = webSocket;
		padId = docId;
		share.wrtcPubsub.emit('component status', 'text', true)
		eventListers();
	}

	return {
		postAceInit: postAceInit,
		activateModal: activateModal,
		deactivateModal: deactivateModal,
		userJoin: userJoin,
		userLeave: userLeave,
		removeUserFromRoom: removeUserFromRoom,
		addUserToRoom: addUserToRoom,
		bulkUpdateRooms: bulkUpdateRooms
	};
})();

'use strict';

var videoChat = (function videoChat() {
	var socket = null;
	var padId = null;
	var currentRoom = {};
	var localStream = null;
	var VIDEOCHATLIMIT = 0;
	var $joinBtn = null;
	var networkInterval = null;
	var pingos = {
		startTime: 0,
		latency: 0,
		LMin: 0,
		LMax: 0,
		avg: 0,
		LineAvg: [],
		interavCheck: 1000
	}

	var startWatchNetwork = function startWatchNetwork() {
		networkInterval = setInterval(function() {
			pingos.startTime = Date.now();
			socket.emit('pingil');
		}, pingos.interavCheck);
	}

	var stopWatchNetwork = function stopWatchNetwork() {
		clearInterval(networkInterval);
	}

	function mediaDevices() {
		navigator.mediaDevices.enumerateDevices().then(function enumerateDevices(data) {
			var videoSettings = localStorage.getItem('videoSettings') || { microphone: null, speaker: null, camera: null };

			if (typeof videoSettings === 'string') {
				videoSettings = JSON.parse(videoSettings);
			}

			var audioInputSelect = document.querySelector('select#audioSource');
			var audioOutputSelect = document.querySelector('select#audioOutput');
			var videoSelect = document.querySelector('select#videoSource');

			for (var i = 0; i !== data.length; ++i) {
				var deviceInfo = data[i];
				var option = document.createElement('option');
				option.value = deviceInfo.deviceId;
				if (deviceInfo.kind === 'audioinput') {
					option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
					if (videoSettings.microphone === deviceInfo.deviceId) option.selected = true;
					audioInputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'audiooutput') {
					option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
					if (videoSettings.speaker === deviceInfo.deviceId) option.selected = true;
					audioOutputSelect.appendChild(option);
				} else if (deviceInfo.kind === 'videoinput') {
					option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
					if (videoSettings.camera === deviceInfo.deviceId) option.selected = true;
					videoSelect.appendChild(option);
				}
			}
		});
	}

	function isUserMediaAvailable() {
		return window.navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	}

	function removeUserFromRoom(data, roomInfo, cb) {
		if (!data || !roomInfo || !data.userId) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();
		var $videoChatUserList = $headingRoom.find('.wrtc_content.videoChat ul');

		share.appendUserList(roomInfo, $videoChatUserList);

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		if (userCount === 0) {
			$videoChatUserList.append('<li class="empty">Be the first to join the <button class="btn_joinChat_video" data-action="JOIN" data-id="' + headerId + '" data-join="VIDEO"><b>video-chat</b></button></li>');
		}

		var user = share.getUserFromId(data.userId);

		if(user && data.action !== 'JOIN' && data.action !== 'RELOAD' ){
			// notify, a user join the video-chat room
			var msg = {
				time: new Date(),
				userId: data.userId || user.userId,
				userName: data.name || user.name || 'anonymous',
				headerId: data.headerId,
				userCount: userCount,
				headerTitle: headerTitle,
				VIDEOCHATLIMIT: VIDEOCHATLIMIT
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
				opacity: 0
			}).attr({ 'data-active': false });


			// WRTC.deactivate(data.userId, data.headerId);
			share.stopStreaming(localStream);
			localStream = null;
			socket.removeListener('receiveTextMessage:' + data.headerId);
		}

		if (cb && typeof cb === 'function') cb();

		share.wrtcPubsub.emit('update store', data, headerId, 'LEAVE', 'VIDEO', roomInfo, function updateStore() {});

		share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);

		WRTC.userLeave(data.userId);
	}

	function addUserToRoom(data, roomInfo) {
		if (!data || !data.userId) return false;
		var headerId = data.headerId;
		var $headingRoom = share.$body_ace_outer().find('#' + headerId);
		var headerTitle = $headingRoom.find('.wrtc_header b.titleRoom').text();

		var user = share.getUserFromId(data.userId);
		// some user may session does exist but the user info does not available in all over the current pad
		if (!user) return true;

		// TODO: this is not good idea, use global state
		// if incoming user has already in the room don't persuade the request
		var IsUserInRooms = $headingRoom.find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").text();
		if (IsUserInRooms) return false;

		var userCount = roomInfo.present;
		$headingRoom.find('.videoChatCount').text(userCount);

		$(document).find('#wrtc_textChatWrapper .textChatToolbar .userCount').text(userCount);

		share.appendUserList(roomInfo, $headingRoom.find('.wrtc_content.videoChat ul'));

		if(data.action == 'JOIN'){
			// notify, a user join the video-chat room
			var msg = {
				time: new Date(),
				userId: data.userId,
				userName: user.name || data.name || 'anonymous',
				headerId: data.headerId,
				userCount: userCount,
				headerTitle: headerTitle,
				VIDEOCHATLIMIT: VIDEOCHATLIMIT
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
			$headingRoom.attr({ 'data-video': true });
			share.roomBoxIconActive();
			startWatchNetwork();

			$('#werc_toolbar p').attr({ 'data-id': data.headerId }).text(headerTitle);
			$("#werc_toolbar .btn_roomHandler").attr({ 'data-id': data.headerId });

			window.headerId = data.headerId;
			WRTC.activate(data.headerId, user.userId);
			currentRoom = data;

			$('#rtcbox').prepend('<h4 class="chatTitle">' + headerTitle + '</h4>');

			$('#wrtc_modal').css({
				transform: 'translate(-50%, 0)',
				opacity: 1
			}).attr({ 'data-active': true });

			share.wrtcPubsub.emit('enable room buttons', headerId, 'JOIN', $joinBtn);
			socket.emit('acceptNewCall', padId, window.headerId)

			socket.on('receiveTextMessage:' + headerId, function receiveTextMessage(headingId, msg) {
				var active = $(document).find('#wrtc_textChatWrapper').hasClass('active');
				if (headingId === headerId && !active) {
					textChat.userJoin(headerId, data, 'TEXT');
				}
			});

		}

		share.wrtcPubsub.emit('update store', data, headerId, 'JOIN', 'VIDEO', roomInfo, function updateStore() {});
	}
	
	function createSession(headerId, userInfo, $joinButton) {
		share.$body_ace_outer().find('button.btn_joinChat_chatRoom').removeClass('active');
		$joinBtn = $joinButton;
		isUserMediaAvailable().then(function joining(stream) {
			localStream = stream;

			if (!currentRoom.userId) {
				return socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
			}
			// If the user has already joined the video chat, make suer leave that room then join to the new chat room
			socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
				gateway_userLeave(_userData, roomInfo, function join2newOne() {
					socket.emit('userJoin', padId, userInfo, 'video', gateway_userJoin);
				});
			});
		})['catch'](function (err) {
			console.error(err);
			share.wrtcPubsub.emit('enable room buttons', headerId, 'LEAVE', $joinBtn);
			socket.emit('userLeave', padId, currentRoom, 'video', function userLeave(_userData, roomInfo) {
				gateway_userLeave(_userData, roomInfo);
			});
			WRTC.showUserMediaError(err);
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

	function reloadSession(headerId, userInfo, $joinButton){
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
				text: 'The video-chat room has been reached its limitation. \r\n <br> The size of this video-chat room is ' + VIDEOCHATLIMIT + '.',
				sticky: false,
				class_name: 'error',
				time: '5000'
			});
		}

		return false;
	}

	function socketBulkUpdateRooms(rooms, info, target) {
		var roomsInfo = {};
		// create a roomInfo for each individual room
		Object.keys(rooms).forEach(function makeRoomInfo(headerId) {
			var roomInfo = {
				present: rooms[headerId].length,
				list: rooms[headerId]
			};
			roomsInfo[headerId] = roomInfo;
		});

		// bind roomInfo and send user to gateway_userJoin
		Object.keys(rooms).forEach(function (headerId) {
			rooms[headerId].forEach(function (user) {
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
		share.wrtcPubsub.emit('component status', 'video', true)
		mediaDevices();

		socket.on('pongol', function() {
			pingos.latency = Date.now() - pingos.startTime;

			if(pingos.LMin <= pingos.latency && pingos.latency >= pingos.LMax ) pingos.LMax = pingos.latency
			else pingos.LMin = pingos.latency;
			
			// console.log( 'Websocket RTT: ' + pingos.latency + ' ms', "min:", pingos.LMin, "max", pingos.LMax, "avg:", pingos.avg );
			
			if(pingos.LineAvg.length < 4) pingos.LineAvg.push( ((pingos.LMax + pingos.LMin) / 2) )
			else {
				pingos.avg = pingos.LineAvg.reduce(function(a, b){return a + b}) / pingos.LineAvg.length
				console.log(pingos.LineAvg)
				pingos.LineAvg = []
				pingos.LMax=0;
			}

			$(document).find('.video-container.local-user .latency').text( Math.ceil(pingos.avg) + 'ms');
			$(document).find('#networkStatus').html("Websocket RTT: " + pingos.latency + "ms, min: "+ pingos.LMin + "ms, max: " + pingos.LMax +"ms, avg:" + pingos.avg + "ms");

			// share.wrtcPubsub.emit('update network information', pingos);
		});
	}

	return {
		postAceInit: postAceInit,
		userJoin: userJoin,
		userLeave: userLeave,
		gateway_userJoin: gateway_userJoin,
		gateway_userLeave: gateway_userLeave,
		bulkUpdateRooms: bulkUpdateRooms,
		reloadSession: reloadSession
	};
})();

'use strict';

var WRTC_Room = (function WRTC_Room() {
	var socket = null;
	var padId = null;
	var VIDEOCHATLIMIT = 0;
	// var $lastJoinButton = null;
	var prefixHeaderId = 'headingTagId_';
	var hElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '.h1', '.h2', '.h3', '.h4', '.h5', '.h6'];

	/** --------- Helper --------- */

	function link2Clipboard(text) {
		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(text).select();
		document.execCommand('copy');
		$temp.remove();
		$.gritter.add({
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function scroll2Header(headerId) {
		var padContainer = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody');
		padContainer.find('.' + prefixHeaderId + headerId).each(function scrolling() {
			this.scrollIntoView({
				behavior: 'smooth'
			});
		});
	}

	function closeTextChat () {
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
  * @param {string} actions @enum (JOIN|LEAVE)
  * @param {string} headerId
  * @param {string} target @enum (chatRoom|video|text)
  */
	function roomBtnHandler(actions, headerId, target) {
		if(typeof actions !== 'string') {
			actions.preventDefault();
			// actions.stopPropagation();
		}
		headerId = $(this).attr('data-id') || headerId;
		actions = $(this).attr('data-action') || actions;
		target = $(this).attr('data-join') || target;

		if (!headerId || !target ) return true;

		var userInfo = {
			padId: clientVars.padId || window.pad.getPadId(),
			userId: clientVars.userId || window.pad.getUserId(),
			userName: clientVars.userName || 'anonymous',
			headerId: headerId,
			target: target,
			action: actions
		};

		// Before handel request, check socket state
		if(share.wrtcStore.socketState !== 'OPEND') {
			// show the alert that user must reload the page
			$.gritter.add({
				title: 'Video chat no longer responds',
				text: 'The socket was disconnected and we can no longer make a stable call, please go to the stable internet and then reload the page then try again.',
				sticky: false,
				class_name: 'error',
				time: '15000'
			});

			return false;
		}

		share.wrtcPubsub.emit('disable room buttons', headerId, actions, target);

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
		} else if(actions === 'RELOAD') {
			videoChat.reloadSession(headerId, userInfo, target, actions);
		} else if(actions === 'SHARELINK') {
			shareRoomsLink(headerId, target);
		}
	}

	function joinByQueryString() {
		var urlParams = new URLSearchParams(window.location.search);
		var headerId = urlParams.get('id');
		var target = urlParams.get('target');
		var join = urlParams.get('join');

		if(!headerId) return true;

		var isHeading = share.$body_ace_outer().find('#' + headerId);

		if(!isHeading.length){
			$.gritter.add({
				title: 'Error',
				text: "The header seems not to exist anymore!",
				time: 3000,
				sticky: false,
				class_name: 'error'
			});
			return false;
		}

		if (headerId) {
			scroll2Header(headerId);
		}
		if (join === 'true') {
			target = target.toUpperCase();
			setTimeout(function makeSureHeadingReady() {
				roomBtnHandler('JOIN', headerId, target);
			}, 700);
		}
	}

	function shareRoomsLink(headId, target) {
		headId = $(this).attr('data-id') || headId;
		target = $(this).attr('data-join') || target;
		var title = share.$body_ace_outer().find('.wbrtc_roomBox.' + headId + ' .titleRoom').text();

		var origin = window.location.origin;
		var pathName = window.location.pathname;
		var link = origin + pathName + '?header=' + share.slugify(title) + '&id=' + headId + '&target=' + target + '&join=true';

		var $temp = $('<input>');
		$('body').append($temp);
		$temp.val(link).select();
		document.execCommand('copy');
		$temp.remove();

		$.gritter.add({
			title: 'Copied',
			text: 'Join link copied to clip board',
			sticky: false,
			class_name: 'copyLinkToClipboard',
			time: '3000'
		});
	}

	function getHeaderRoomY($element) {
		var height = $element.outerHeight();
		var paddingTop = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-top');
		var aceOuterPadding = parseInt(paddingTop, 10);
		var offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
		return offsetTop + height / 2 - 31;
	}

	function getHeaderRoomX($element) {
		var width = $element.outerWidth();
		var paddingLeft = share.$body_ace_outer().find('iframe[name="ace_inner"]').css('padding-left');
		var aceOuterPadding = parseInt(paddingLeft, 10);
		var offsetLeft = Math.ceil(share.$body_ace_outer().find('iframe[name="ace_inner"]').offset().left - aceOuterPadding);
		return offsetLeft - width - 10;
	}

	function showUserProfileModal () {
		var userId = $(this).attr('data-id');
		var user = window.clientVars.ep_profile_list[userId];
		var imageUrl = user.imageUrl || '/p/getUserProfileImage/'+userId+"/"+padId +"?t=" + new Date().getTime();
		if(!user) return false;
		$("#ep_profile_users_profile_name").text(user.userName);
		$("#ep_profile_users_profile_desc").text(user.about);
		$("#ep_profile_users_profile_homepage").attr({
			"href":share.getValidUrl(user.homepage),
			target:"_blank"
		});
		
		$("#ep_profile_users_profile_homepage").text(user.homepage);

		// shared.showGeneralOverlay()
		$('#ep_profile_users_profile').addClass('ep_profile_formModal_show');
		$('#ep_profile_general_overlay').addClass('ep_profile_formModal_overlay_show');
		$('#ep_profile_general_overlay').css({"display":"block"});

		$("#ep_profile_users_profile_userImage").css({
			"background-position":"50% 50%",
			"background-image":"url("+imageUrl+")" ,
			"background-repeat":"no-repeat",
			"background-size": "128px",
			"background-color":"#485365"
		});
	}

	function activeEventListener() {
		var $wbrtc_roomBox = share.$body_ace_outer();

		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_text', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_video', roomBtnHandler);
		$wbrtc_roomBox.on('click', '.wbrtc_roomBox .btn_joinChat_chatRoom', roomBtnHandler);

		$wbrtc_roomBox.on('click', '#wbrtc_avatarCol .wrtc_roomInlineAvatar .avatar', showUserProfileModal);
		$(document).on('click', '.wrtc_inlineAvatars > .avatar, .wrtc_inlineAvatars > .avatarMore', showUserProfileModal);

		$(document).on('click', '#chattext .wrtc_roomLink', roomBtnHandler);

		$(document).on('click', '#werc_toolbar .btn_roomHandler, .btn_controllers .btn_roomHandler', roomBtnHandler);

		// ep_full_hyperlinks link listner
		$wbrtc_roomBox.on('click', 'a.btn_roomHandler', roomBtnHandler)
		$(document).on('click', 'a.btn_roomHandler', roomBtnHandler)
		// share.$body_ace_outer().on('mouseenter', '.wbrtc_roomBox', function mouseenter() {
		// 	$(this).parent().css({ overflow: 'initial' });
		// 	$(this).addClass('active').find('.wrtc_contentBody').css({ display: 'block' });
		// }).on('mouseleave', '.wbrtc_roomBox', function mouseleave() {
		// 	$(this).parent().css({ overflow: 'hidden' });
		// 	$(this).removeClass('active').find('.wrtc_contentBody').css({ display: 'none' });
		// });


		$(document).on('mouseenter', '.video-container.local-user', function mouseenter() {
			$(document).find('#wrtc_modal #networkStatus').addClass('active');
		}).on('mouseleave', '.video-container.local-user', function mouseleave() {
			$(document).find('#wrtc_modal #networkStatus').removeClass('active');
		});

		share.$body_ace_outer().on('click', '.wbrtc_roomBoxFooter > button.btn_share', function click() {
			var headerURI = $(this).find('input').val();
			link2Clipboard(headerURI);
		});

		// share.$body_ace_outer().on('mouseenter', '.wrtc_roomInlineAvatar .avatar', function mouseenter() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseenter');
		// }).on('mouseleave', '.wrtc_roomInlineAvatar .avatar', function mouseleave() {
		// 	var id = $(this).parent().parent().attr('id');
		// 	share.$body_ace_outer().find('#' + id + '.wbrtc_roomBox').trigger('mouseleave');
		// });

		$(document).on('click', '#werc_toolbar p, .textChatToolbar b', function click() {
			var headerId = $(this).attr('data-id');
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
			var offset = $(this).position();
			var $box = $(document).find('#wrtc_settings');
			var width = $box.outerWidth();
			$box.css({left: offset.left - width  + 'px',top: offset.top + 4 + 'px'}).toggleClass('active');
		});
	}

	var self = {
		getHeaderRoomX: getHeaderRoomX,
		aceSetAuthorStyle: function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = share.getUserFromId(context.author);
				if (user) {
					// sync user info
					share.$body_ace_outer().find(".wrtc_content.textChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
					share.$body_ace_outer().find(".wrtc_content.videoChat ul li[data-id='" + user.userId + "']").css({ 'border-color': user.colorId }).text(user.name);
				}
			}
		},
		userLeave: function userLeave(context, callback) {
			// Deprecated, we use socket disconnect

			callback();
		},
		bulkUpdateRooms: function bulkUpdateRooms(hTagList) {
			videoChat.bulkUpdateRooms(hTagList);
			textChat.bulkUpdateRooms(hTagList);
		},
		postAceInit: function postAceInit(hook, context, webSocket, docId) {
			socket = webSocket;
			padId = docId;
			VIDEOCHATLIMIT = clientVars.webrtc.videoChatLimit;
			share.wrtcPubsub.emit('component status', 'room', true)

			socket.on('userJoin', function (data, roomInfo, target) {
				if (target === 'video') {
					videoChat.gateway_userJoin(data, roomInfo, false);
				} else {
					textChat.addUserToRoom(data, roomInfo, target);
				}
			});

			socket.on('userLeave', function (data, roomInfo, target) {
				if (target === 'video') {
					videoChat.gateway_userLeave(data, roomInfo, target);
				} else {
					textChat.removeUserFromRoom(data, roomInfo, target);
				}
			});

			activeEventListener();

			// check if there is a join request in URI queryString
			setTimeout(function () {
				joinByQueryString();
			}, 500);
		},
		adoptHeaderYRoom: function adoptHeaderYRoom() {
			// Set all video_heading to be inline with their target REP
			var $padOuter = share.$body_ace_outer();
			if (!$padOuter) return;

			$padOuter.find('.wbrtc_roomBox, .wrtc_roomInlineAvatar ').each(function adjustHeaderIconPosition() {
				var $el = $(this);
				var $boxId = $el.attr('id');
				var hClassId = 'headingTagId_' + $boxId;
				var $headingEl = $padOuter.find('iframe').contents().find('#innerdocbody').find('.' + hClassId);

				// if the H tags does not find, remove chatBox
				// TODO: and kick out the user form the chatBox
				if ($headingEl.length <= 0) {
					$el.remove();
					return false;
				}

				if ($el.attr('data-box') === 'avatar') $el.css({ left: getHeaderRoomX($el) + 'px' });
				$el.css({ top: getHeaderRoomY($headingEl) + 'px' });
			});
		},
		findTags: function findTags() {
			var components = share.wrtcStore.components;
			if(!components.text.active && !components.video.active && !components.room.active) return false;
			var hTagList = [];
			var hTagElements = hElements;
			var hTags = share.$body_ace_outer().find('iframe').contents().find('#innerdocbody').children('div').children(hTagElements);
			var aceInnerOffset = share.$body_ace_outer().find('iframe[name="ace_inner"]').offset();
			var target = share.$body_ace_outer().find('#outerdocbody');
			var newHTagAdded = false;

			$(hTags).each(function createWrtcRoomBox() {
				var $el = $(this);
				// var lineNumber = $el.parent().prevAll().length;
				// var tag = $("#title")[0].tagName.toLowerCase();
				var newY = getHeaderRoomY($el);
				var newX = Math.ceil(aceInnerOffset.left);
				var headingTagId = $el.find('span').attr('class');
				headingTagId = /(?:^| )headingTagId_([A-Za-z0-9]*)/.exec(headingTagId);

				if (!headingTagId) {
					console.warn("[wrtc]: couldn't find headingTagId.")
					return true;
				}

				var data = {
					headingTagId: headingTagId[1],
					// tag: tag,
					positionTop: newY,
					positionLeft: newX,
					headTitle: $el.text(),
					// lineNumber: lineNumber,
					videoChatLimit: VIDEOCHATLIMIT
				};

				if (!share.wrtcStore[data.headingTagId]) share.wrtcStore[data.headingTagId] = { VIDEO: { list: [] }, TEXT: { list: [] }, USERS: {} };

				// if the header does not exists then adde to list
				// otherwise update textHeader
				// TODO: performance issue
				if (target.find('#' + data.headingTagId).length <= 0) {
					var box = $('#wertc_roomBox').tmpl(data);
					target.find('#wbrtc_chatBox').append(box);
					var avatarBox = $('#wertc_inlineAvatar').tmpl(data);
					target.find('#wbrtc_avatarCol').append(avatarBox);
					newHTagAdded = true;
				} else {
					$(document).find('[data-headid=' + data.headingTagId + '].wrtc_text .wrtc_roomLink, #werc_toolbar p[data-id=' + data.headingTagId + ']').text(data.headTitle);
					target.find('.wbrtc_roomBox[id=' + data.headingTagId + '] .titleRoom').text(data.headTitle);
					$(document).find('#wrtc_textChatWrapper[data-id=' + data.headingTagId + '] .nd_title b').text(data.headTitle);
				}

				hTagList.push(data);
			});
			// if a new h tag addedd check all heading again!
			if (newHTagAdded) {
				self.bulkUpdateRooms(hTagList);
				newHTagAdded = false;
			}
		}
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

var WRTC = (function WRTC() {
	var attemptRonnect = 50;
	var reconnected = 0;
	var videoSizes = { large: '260px', small: '160px' };
	var pcConfig = {};
	var audioInputSelect = null;
	var videoSelect = null;
	var audioOutputSelect = null;
	var pcConstraints = {
		optional: [{
			DtlsSrtpKeyAgreement: true
		}]
	};
	var sdpConstraints = {
		mandatory: {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		}
	};
	var localStream = null;
	var remoteStream = {};
	var pc = {};
	var callQueue = [];
	var enlargedVideos = new Set();
	var localVideoElement = null;
	var padId = null;
	var socket = null;

	var self = {
		// API HOOKS
		postAceInit: function postAceInit(hook, context, webSocket,docId) {
			padId = docId;
			socket = webSocket;

			pcConfig.iceServers = clientVars.webrtc && clientVars.webrtc.iceServers ? clientVars.webrtc.iceServers : [{
				url: 'stun:stun.l.google.com:19302'
			}];
			if (clientVars.webrtc.video.sizes.large) {
				videoSizes.large = clientVars.webrtc.video.sizes.large + 'px';
			}
			if (clientVars.webrtc.video.sizes.small) {
				videoSizes.small = clientVars.webrtc.video.sizes.small + 'px';
			}

			self._pad = context.pad || window.pad;

			$(document).on('change', 'select#audioSource', self.audioVideoInputChange);
			$(document).on('change', 'select#videoSource', self.audioVideoInputChange);
			$(document).on('change', 'select#audioOutput', self.changeAudioDestination);

			$(window).on('unload', function () {
				console.info("[wrtc]: windos unloaded, now hangupAll")
				self.hangupAll();
			});

		},
		appendInterfaceLayout: function appendInterfaceLayout() {
			// TODO: legacy code, move it to template
			var werc_toolbar = $('#wertc_modal_toolbar').tmpl({
				videoChatLimit: clientVars.webrtc.videoChatLimit,
				headerId: ''
			});
			var $wrtc_modal = $('<div id="wrtc_modal"><div id="networkStatus"></div><div class="videoWrapper" class="thin-scrollbar"></div></div');
			$wrtc_modal.append(werc_toolbar);
			$('body').prepend($wrtc_modal);
			$(document).on('click', '#wrtc_modal .btn_toggle_modal', function () {
				var $parent = $(this).parent().parent();
				var action = $(this).attr('data-action');
				var videoBox = $('#wrtc_modal .videoWrapper').innerHeight();

				$(this).find('.fa_arrow-from-top').toggle();
				$(this).find('.fa_arrow-to-top').toggle();

				if (action === 'collapse') {
					$(this).attr({ 'data-action': 'expand' });
					$parent.find('.btn_enlarge').removeAttr('active');
					$('#wrtc_modal').css({
						transform: 'translate(-50%, -' + videoBox + 'px)'
					});
				} else {
					$(this).attr({ 'data-action': 'collapse' });
					$parent.find('.btn_enlarge').attr({ active: true });
					$('#wrtc_modal').css({
						transform: 'translate(-50%, 0)'
					});
				}
			});
			$(document).on('click', '#wrtc_settings .btn_info', function click() {
				var userID = Object.keys(pc)
				var $this =  $(this)
				var isActive = $this.attr('data-active')
				var $modal = $(document).find("#wrtc_settings .wrtc_info")

				if(isActive){
					$modal.hide();
					if(pc[userID[0]]){
						getStats(pc[userID[0]], function(result) {
							result.nomore();
						})
					}
					$this.removeAttr("data-active")
					return true;
				} else {
					$this.attr({'data-active': true})
					$modal.show()
				}

				if(pc[userID[0]] && !isActive){
					function bytesToSize(bytes) {
							var k = 1000;
							var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
							if (bytes <= 0) {
									return '0 Bytes';
							}
							var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
							
							if(!sizes[i]) {
									return '0 Bytes';
							}
		
							return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
					}
					getStats(pc[userID[0]], function(result) {
							const statistic ={
								"speed": bytesToSize(result.bandwidth.speed),
								"systemNetworkType": result.connectionType.systemNetworkType,
								"availableSendBandwidth": bytesToSize(result.bandwidth.availableSendBandwidth),
								"video": {
									"send.codecs": result.video.send.codecs.join(", "),
									"resolutions": "width " + result.resolutions.send.width + ", height " + result.resolutions.send.height,
									"resolutions": "width " + result.resolutions.recv.width + ", height " + result.resolutions.recv.height,
									"bytesSent": bytesToSize(result.video.bytesSent),
									"bytesReceived": bytesToSize(result.video.bytesReceived)
								},
								"audio":{
									"send.codecs": result.audio.send.codecs.join(", "),
									// "recv.codecs": result.audio.recv.codecs.join(", "),
									"bytesSent": bytesToSize(result.audio.bytesSent),
									"bytesReceived": bytesToSize(result.audio.bytesReceived)
								}
							}
							$(document).find("#wrtc_settings .wrtc_info").html(`<pre>${JSON.stringify(statistic, undefined, 2)}</pre>`)
					}, 1000);
				}
			})
			$(document).on('click', '#wrtc_settings .btn_close', function click() {
				$('#wrtc_settings').toggleClass('active');
				var $btnInfo = $("#wrtc_settings .btn_info")
				if($btnInfo.attr('data-active')) $btnInfo.trigger("click")
			});
		},
		aceSetAuthorStyle: function aceSetAuthorStyle(context) {
			if (context.author) {
				var user = self.getUserFromId(context.author);
				if (user) {
					$('#video_' + user.userId.replace(/\./g, '_')).css({
						'border-color': user.colorId
					}).siblings('.user-name').text(user.name);
				}
			}
		},
		userLeave: function userLeave(userId, context, callback) {
			userId = userId || context.userInfo.userId;
			if (userId && pc[userId]) {
				gState = "LEAVING"
				self.hide(userId)
				self.hangup(userId, true);
			}
			if(callback) callback();
		},
		handleClientMessage_RTC_MESSAGE: function handleClientMessage_RTC_MESSAGE(hook, context) {
			if (context.payload.data.headerId === window.headerId) self.receiveMessage(context.payload);
		},
		// END OF API HOOKS
		show: function show() {
			$('#pad_title').addClass('f_wrtcActive');
		},
		showUserMediaError: function showUserMediaError(err) {
			// show an error returned from getUserMedia
			var reason;
			// For reference on standard errors returned by getUserMedia:
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
			// However keep in mind that we add our own errors in getUserMediaPolyfill
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
					reason = 'Sorry, a hardware error occurred that prevented access to your camera and/or microphone:<br><br>' + err.message;
					self.sendErrorStat('Hardware');
					break;
				case 'AbortError':
					// `err.message` might give useful info to the user (not necessarily useful for other error messages)
					reason = 'Sorry, an error occurred (probably not hardware related) that prevented access to your camera and/or microphone:<br><br>' + err.message;
					self.sendErrorStat('Abort');
					break;
				default:
					// `err` as a string might give useful info to the user (not necessarily useful for other error messages)
					reason = 'Sorry, there was an unknown Error:<br><br>' + err;
					self.sendErrorStat('Unknown');
			}
			$.gritter.add({
				title: 'Error',
				text: reason,
				sticky: true,
				class_name: 'error'
			});
			self.hide();
		},
		hide: function hide(userId) {
			if (!userId) return false;
			userId = userId.split('.')[1];
			$('#rtcbox').find('#video_a_' + userId).parent().remove();
		},
		activate: function activate(headerId) {
			self.show();
			self.hangupAll();
			self.getUserMedia(headerId);
		},
		deactivate: function deactivate(userId, headerId) {
			if (!userId) return false;
			self.hide(userId);
			self.hangupAll(headerId);
			self.hangup(userId, true, headerId);
			if (localStream) {
				share.stopStreaming(localStream);
				localStream = null;
			}
		},
		toggleMuted: function toggleMuted() {
			var audioTrack = localStream.getAudioTracks();
			if (audioTrack) {
				audioTrack.enabled = !audioTrack.enabled;
				return !audioTrack.enabled;
			}
		},
		toggleVideo: function toggleVideo() {
			var videoTrack = localStream.getVideoTracks()[0];
			if (videoTrack) {
				videoTrack.enabled = !videoTrack.enabled;
				return !videoTrack.enabled;
			}
		},
		getUserFromId: function getUserFromId(userId) {
			if (!self._pad || !self._pad.collabClient) return null;
			var result = self._pad.collabClient.getConnectedUsers().filter(function (user) {
				return user.userId === userId;
			});
			var user = result.length > 0 ? result[0] : null;
			return user;
		},
		setStream: function setStream(userId, stream) {
			if (!userId) return false;
			var isLocal = userId === share.getUserId();
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var video = $('#' + videoId)[0];

			var user = self.getUserFromId(userId);

			if (!video && stream) {
				var videoContainer = $("<div class='video-container'>").css({
					width: videoSizes.small,
					'max-height': videoSizes.small
				}).appendTo($('#wrtc_modal .videoWrapper'));

				videoContainer.append($('<div class="user-name">').text(user.name));

				video = $('<video playsinline>').attr('id', videoId).css({
					'border-color': user.colorId,
					width: videoSizes.small,
					'max-height': videoSizes.small
				}).on({
					loadedmetadata: function loadedmetadata() {
						self.addInterface(userId);
					}
				}).appendTo(videoContainer)[0];

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
				$(video).parent().remove();
			}
		},
		addInterface: function addInterface(userId) {
			if (!userId) return false;
			var isLocal = userId === share.getUserId();
			var videoId = 'video_' + userId.replace(/\./g, '_');
			var $video = $('#' + videoId);

			var $mute = $("<span class='interface-btn audio-btn buttonicon'>").attr('title', 'Mute').on({
				click: function click() {
					var muted;
					if (isLocal) {
						muted = self.toggleMuted();
					} else {
						$video[0].muted = !$video[0].muted;
						muted = $video[0].muted;
					}
					$mute.attr('title', muted ? 'Unmute' : 'Mute').toggleClass('muted', muted);
				}
			});
			var videoEnabled = true;
			var $disableVideo = isLocal ? $("<span class='interface-btn video-btn buttonicon'>").attr('title', 'Disable video').on({
				click: function click() {
					self.toggleVideo();
					videoEnabled = !videoEnabled;
					$disableVideo.attr('title', videoEnabled ? 'Disable video' : 'Enable video').toggleClass('off', !videoEnabled);
				}
			}) : null;

			var videoEnlarged = false;
			var $largeVideo = $("<span class='interface-btn enlarge-btn buttonicon'>").attr('title', 'Make video larger').on({
				click: function click() {
					videoEnlarged = !videoEnlarged;

					if (videoEnlarged) {
						enlargedVideos.add(userId);
					} else {
						enlargedVideos['delete'](userId);
					}

					$largeVideo.attr('title', videoEnlarged ? 'Make video smaller' : 'Make video larger').toggleClass('large', videoEnlarged);

					var videoSize = $(document).find('#wrtc_modal .ndbtn.btn_enlarge').hasClass('large') ? videoSizes.large : videoSizes.small;
					$video.parent().css({ width: videoSize, 'max-height': videoSize });
					$video.css({ width: videoSize, 'max-height': videoSize });
				}
			});

			if($(document).find('#wrtc_modal .ndbtn.btn_enlarge').hasClass('large')){
				$video.parent().css({ width: videoSizes.large, 'max-height': videoSizes.large });
				$video.css({ width: videoSizes.large, 'max-height': videoSizes.large });
			}

			if(isLocal) localVideoElement = $video;

			var $networkLatancy = $("<div class='latency'></div>");

			$('#interface_' + videoId).remove();
			$("<div class='interface-container'>").attr('id', 'interface_' + videoId)
			.append($mute)
			.append($disableVideo)
			.append($largeVideo)
			.append($networkLatancy)
			.insertAfter($video);
			self.changeAudioDestination();
		},
		// Sends a stat to the back end. `statName` must be in the
		// approved list on the server side.
		sendErrorStat: function sendErrorStat(statName) {
			var msg = { component: 'pad', type: 'STATS', data: { statName: statName, type: 'RTC_MESSAGE' } };
			socket.emit('acceptNewCall', padId, window.headerId)
			self._pad.socket.json.send(msg);
		},
		sendMessage: function sendMessage(to, data) {
			self._pad.collabClient.sendMessage({
				type: 'RTC_MESSAGE',
				payload: { data: data, to: to }
			});
		},
		receiveMessage: function receiveMessage(msg) {
			var peer = msg.from;
			var data = msg.data;
			var type = data.type;
			if (peer === share.getUserId()) {
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
				if (localStream) {
					if (pc[peer].getLocalStreams) {
						if (!pc[peer].getLocalStreams().length) {
							pc[peer].addStream(localStream);
						}
					} else if (pc[peer].localStreams) {
						if (!pc[peer].localStreams.length) {
							pc[peer].addStream(localStream);
						}
					}
				}
				var offer = new RTCSessionDescription(data.offer);
				pc[peer].setRemoteDescription(offer, function () {
					pc[peer].createAnswer(function (desc) {
						desc.sdp = cleanupSdp(desc.sdp);
						pc[peer].setLocalDescription(desc, function () {
							self.sendMessage(peer, { type: 'answer', answer: desc, headerId: data.headerId });
						}, logError);
					}, logError, sdpConstraints);
				}, logError);
			} else if (type === 'answer') {
				if (pc[peer]) {
					var answer = new RTCSessionDescription(data.answer);
					pc[peer].setRemoteDescription(answer, function () {}, logError);
				}
			} else if (type === 'icecandidate') {
				if (pc[peer]) {
					var candidate = new RTCIceCandidate(data.candidate);
					var p = pc[peer].addIceCandidate(candidate);
					if (p) {
						p.then(function () {
							// Do stuff when the candidate is successfully passed to the ICE agent
						})['catch'](function () {
							console.error('Error: Failure during addIceCandidate()', data);
						});
					}
				}
			} else {
				console.error('unknown message', data);
			}
		},
		hangupAll: function hangupAll(_headerId) {
			Object.keys(pc).forEach(function (userId) {
				self.hangup(userId, true, _headerId);
			});
		},
		getUserId: function getUserId() {
			return self._pad && share.getUserId();
		},
		hangup: function hangup(userId, notify, headerId) {
			notify = arguments.length === 1 ? true : notify;
			if (pc[userId] && userId !== share.getUserId()) {
				self.setStream(userId, '');
				pc[userId].close();
				delete pc[userId];
				if (notify) self.sendMessage(userId, { type: 'hangup', headerId: headerId });
			}
		},
		call: function call(userId, headerId) {
			if (!localStream) {
				callQueue.push(userId);
				return;
			}
			var constraints = { optional: [], mandatory: {} };
			// temporary measure to remove Moz* constraints in Chrome
			if (webrtcDetectedBrowser === 'chrome') {
				for (var prop in constraints.mandatory) {
					if (prop.indexOf('Moz') !== -1) {
						delete constraints.mandatory[prop];
					}
				}
			}
			constraints = mergeConstraints(constraints, sdpConstraints);

			if (!pc[userId]) {
				self.createPeerConnection(userId, headerId);
			}
			pc[userId].addStream(localStream);
			pc[userId].createOffer(function (desc) {
				desc.sdp = cleanupSdp(desc.sdp);
				pc[userId].setLocalDescription(desc, function () {
					self.sendMessage(userId, { type: 'offer', offer: desc, headerId: headerId });
				}, logError);
			}, logError, constraints);
		},
		createPeerConnection: function createPeerConnection(userId, headerId) {
			if (pc[userId]) {
				console.warn('WARNING creating PC connection even though one exists', userId);
			}
			pc[userId] = new RTCPeerConnection(pcConfig, pcConstraints);
			pc[userId].onicecandidate = function (event) {
				if (event.candidate) {
					self.sendMessage(userId, {
						type: 'icecandidate',
						headerId: headerId,
						candidate: event.candidate
					});
				}else{
					attemptRonnect = 0;
					socket.emit('acceptNewCall', padId, window.headerId)
				}
			};
			pc[userId].onaddstream = function (event) {
				remoteStream[userId] = event.stream;
				self.setStream(userId, event.stream);
			};
			pc[userId].onremovestream = function () {
				self.setStream(userId, '');
			};
		},
		audioVideoInputChange: function audioVideoInputChange() {
			share.stopStreaming(localStream);
			localStream = null

			self.getUserMedia(window.headerId);
		},
		attachSinkId: function attachSinkId(element, sinkId) {
			// Attach audio output device to video element using device/sink ID.
			if (element && element[0] && typeof element[0].sinkId !== 'undefined') {
				element[0].setSinkId(sinkId)
						.then(() => {
							// console.info(`Success, audio output device attached: ${sinkId}`);
						})['catch'](error => {
							var errorMessage = error;
							if (error.name === 'SecurityError') {
								errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
							}
							console.error(errorMessage);
							// Jump back to first output device in the list as it's the default.
							audioOutputSelect.selectedIndex = 0;
						});
			} else {
				console.warn('Browser does not support output device selection.');
			}
		},
		changeAudioDestination: function changeAudioDestination() {
			var audioOutputSelect = document.querySelector('select#audioOutput');
			var audioDestination = audioOutputSelect.value;
			var videoElement = localVideoElement
			self.attachSinkId(videoElement, audioDestination);
		},
		getUserMedia: function getUserMedia(headerId) {
			audioInputSelect = document.querySelector('select#audioSource');
			videoSelect = document.querySelector('select#videoSource');
			audioOutputSelect = document.querySelector('select#audioOutput');
			
			var audioSource = audioInputSelect.value;
			var videoSource = videoSelect.value;
			var audioOutput = audioOutputSelect.value;

			var mediaConstraints = {
				audio: true,
				video: {
					width: {exact: 320},
					height: {exact: 240},
					frameRate: { ideal: 15, max: 30 },
					facingMode: "user" 
				}
			};

			if (audioSource) {
				mediaConstraints.audio.deviceId = { exact: audioSource };
			}
			if (videoSource) {
				mediaConstraints.video.deviceId = { exact: videoSource };
			}
			
			localStorage.setItem('videoSettings', JSON.stringify({ microphone: audioSource, speaker: audioOutput, camera: videoSource }));

			window.navigator.mediaDevices.getUserMedia(mediaConstraints).then(function (stream) {
				localStream = stream;
				self.setStream(share.getUserId(), stream);
				self._pad.collabClient.getConnectedUsers().forEach(function (user) {
					if (user.userId !== share.getUserId()) {
						if (pc[user.userId]) {
							self.hangup(user.userId, false, headerId);
						}
						self.call(user.userId, headerId);
					}
				});
			})['catch'](function (err) {
				self.showUserMediaError(err);
			});
		}
	};

	// Normalize RTC implementation between browsers
	// var getUserMedia = window.navigator.mediaDevices.getUserMedia
	var attachMediaStream = function attachMediaStream(element, stream) {
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
	var webrtcDetectedBrowser = 'chrome';

	function cleanupSdp(sdp) {
		var bandwidth = {
			screen: 300, // 300kbits minimum
			audio: 256,   // 64kbits  minimum
			video: 500,
			minVideo: 128, // 125kbits  min
			maxVideo: 2048, // 125kbits  max
			videoCodec: clientVars.webrtc.video.codec
		};

		var isScreenSharing = false;

		sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, bandwidth, isScreenSharing);
		sdp = CodecsHandler.setVideoBitrates(sdp, {
			min: bandwidth.minVideo,
			max: bandwidth.maxVideo,
			codec: bandwidth.videoCodec
		});
		sdp = CodecsHandler.setOpusAttributes(sdp);
		sdp = CodecsHandler.preferCodec(sdp, bandwidth.videoCodec)

		return sdp;
	}

	function mergeConstraints(cons1, cons2) {
		var merged = cons1;
		for (var name in cons2.mandatory) {
			merged.mandatory[name] = cons2.mandatory[name];
		}
		merged.optional.concat(cons2.optional);
		return merged;
	}

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function logError(error) {

		if(error && error.message.includes("Failed to set remote answer sdp")){
			reconnected++;
			console.log("[wrtc]: Try reconnecting", reconnected, attemptRonnect);
			if(attemptRonnect <= reconnected)
				throw new Error("[wrtc]: please reload the video chat and try again to connect!");
			setTimeout(() => {
				console.log("[wrtc]: reconnecting...")
				self.getUserMedia(window.headerId)
			}, randomIntFromInterval(200, 1000));
		}else {
			console.error("[wrtc]: LogError", error)
			socket.emit('acceptNewCall', padId, window.headerId)
		}
		console.error('[wrtc]: WebRTC ERROR:', error);
	} 

	self.pc = pc;
	return self;
})();
