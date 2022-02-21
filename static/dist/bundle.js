'use strict';Object.defineProperty(exports,'__esModule',{value:true});/* eslint-disable no-undef */
const avatarUrl = '../static/plugins/ep_profile_modal/static/img/user.png';

const getAvatarUrl = (userId) => {
  if (!userId) return avatarUrl;
  return `/static/getUserProfileImage/${userId}/${window.pad.getPadId()}?t=${new Date().getTime()}`;
};

// export const clientVarReady = () => {
//   return new Promise((resolve, reject) => {
//     if(clientVars.padId && clientVars.userId)
//   });
// };

clientVars.padId || window.pad.getPadId();
clientVars.userId || window.pad.getUserId();

const getUserFromId = (userId) => {
  const anonymousUser = { name: 'anonymous', userId, colorId: '#FFF' };
  if (!window.pad || !window.pad.collabClient) return anonymousUser;
  const result = window.pad.collabClient
    .getConnectedUsers()
    .filter((user) => user.userId === userId);

  const user = result.length > 0 ? result[0] : anonymousUser;
  return user;
};

const $body_ace_outer = () => $(document)
  .find('iframe[name="ace_outer"]')
  .contents();

// socketState: 'CLOSED', 'OPENED', 'DISCONNECTED'
// enable: plugin active/deactivate
const wrtcStore = {
  enable: true,
  epProfileState: true,
  userInRoom: false,
  currentOpenRoom: null,
  socketState: 'CLOSED',
  socket: null,
  localstream: null,
  components: {
    video: { init: false, open: false },
    room: { init: false, open: false },
    wrtc: { init: false, open: false },
  },
  rooms: new Map(),
  globalVar: {},
  staticVar: {
    webSocket: {
      DISCONNECTED: 'DISCONNECTED',
      OPENED: 'OPENED',
    },
  },
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
    const _len = arguments.length;
    for (data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      data[_key - 1] = arguments[_key];
    }

    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => {
        fn.apply(undefined, data);
      });
    }
  },
};

const findAceHeaderElement = (headerId) => {
  const $el = $body_ace_outer().find('iframe')
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
      ? $el.find('wrt-inline-icon')[0].shadowRoot : null,
  };
};

/**
  * @property ROOM
  * @property VIDEO
  * @property update
  */
const inlineAvatar = {
  ROOM: (headerId, room) => {
    if (!clientVars.webrtc.displayInlineAvatar) return;

    const inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
    let $element = $body_ace_outer()
      .find(`#wbrtc_avatarCol .${headerId}.wrtcIconLine .wrtc_inlineAvatars`);

    const offsetTop = findAceHeaderElement(headerId).offset.top() - 16;

    if (!$element.length) {
      const avatarBox = $('#wrtcLinesIcons').tmpl({ headerId, offsetTop });
      $element = $body_ace_outer().find('#wbrtc_avatarCol')
        .append(avatarBox);
      $element = $element.find(`.${headerId}.wrtcIconLine .wrtc_inlineAvatars`);
    }

    const $videoInlineAvatarIcons = $body_ace_outer()
      .find('#wbrtc_avatarCol .wrtc_inlineAvatars');

    $element.find('.avatar').remove();
    Object.keys(room).forEach((key, index) => {
      const userInList = getUserFromId(room[key].userId) ||
        { colorId: '', name: 'anonymous' };

      if (userInList.userId) {
        // if user avatar find in other room remove it
        $videoInlineAvatarIcons.find(`.avatar[data-id="${userInList.userId}"]`).remove();

        if (index < inlineAvatarLimit) {
          const userName = userInList.name || 'anonymous';
          $element.find('.avatarMore').hide();
          $element.append(`
            <div
              class="avatar btn_roomHandler"
              data-join="null"
              data-action="USERPROFILEMODAL"
              data-id="${userInList.userId}"
            >
              <div
                title='${userName}'
                style="
                  background: url('${getAvatarUrl(userInList.userId)}') no-repeat 50% 50%;
                  background-size : cover;"
              >
              </div>
            </div>`);
        } else {
          $element.find('.avatarMore').show()
            .text(`+${index + 1 - inlineAvatarLimit}`);
        }
      }
    });
  },
  VIDEO: function VIDEO(headerId, room) {
    const $element = $(document).find('#werc_toolbar .wrtc_inlineAvatars');
    if (!clientVars.webrtc.displayInlineAvatar) {
      $element.hide();
      return;
    }
    $element.show();
    $element.find('.avatar').remove();
    this._append(room.list, $element);
  },
  _append: (list, $element) => {
    const inlineAvatarLimit = clientVars.webrtc.inlineAvatarLimit || 4;
    list.forEach((el, index) => {
      const userInList = getUserFromId(el.userId) || { colorId: '', name: 'anonymous' };
      if (userInList.userId) {
        if (index < inlineAvatarLimit) {
          const userName = userInList.name || 'anonymous';
          $element.find('.avatarMore').hide();
          $element.append(`
          <div
            class="avatar btn_roomHandler"
            data-join="null" data-action="USERPROFILEMODAL"
            data-id="${userInList.userId}"
          >
            <div
              title='${userName}'
              style="
                background: url('${getAvatarUrl(userInList.userId)}') no-repeat 50% 50%;
                background-size : cover;
              "
            >
              </div>
          </div>`);
        } else {
          $element.find('.avatarMore').show()
            .text(`+${index + 1 - inlineAvatarLimit}`);
        }
      }
    });
  },
  update: (userId, data) => {
    if (!clientVars.webrtc.displayInlineAvatar) return;

    const $roomBox = $body_ace_outer()
      .find('#wrtcVideoIcons .wrtcIconLine .wrtc_inlineAvatars');
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

const getHeaderRoomY = ($element) => {
  if (!$element.length) return;
  const height = $element.outerHeight();
  const paddingTop = Helper.$body_ace_outer()
    .find('iframe[name="ace_inner"]')
    .css('padding-top');
  const aceOuterPadding = parseInt(paddingTop, 10);
  const offsetTop = Math.ceil($element.offset().top + aceOuterPadding);
  return offsetTop + height / 2;
};

const getHeaderRoomX = ($element) => {
  if (!$element.length) return;
  const width = $element.outerWidth();
  const aceInner = Helper.$body_ace_outer().find('iframe[name="ace_inner"]');
  const paddingLeft = aceInner.css('padding-left');
  const aceOuterPadding = parseInt(paddingLeft, 10);
  const offsetLeft = Math.ceil(aceInner.offset().left - aceOuterPadding);
  return offsetLeft - width - 6;
};

const adjustAvatarAlignMent = () => {
  // Set all video_heading to be inline with their target REP
  const $padOuter = $body_ace_outer();

  // TODO: performance issue
  $padOuter.find('#wbrtc_avatarCol .wrtcIconLine')
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
};

wrtcPubsub.on('globalVar', (newVar) => {
  wrtcStore.globalVar = {
    ...wrtcStore.globalVar,
    ...newVar,
  };
});

/**
    * @param {boolean} state
  */
wrtcPubsub.on('plugin enable', (state) => {
  $body_ace_outer().find('iframe')
    .contents()
    .find('#innerdocbody')
    .find('.videoHeader wrt-inline-icon')
    .each((i, el) => {
      el.shadowRoot
        .querySelector('.btn_roomHandler')
        .style.display = state ? 'flex' : 'none';
    });

  Helper.$body_ace_outer()
    .find('#outerdocbody #wbrtc_avatarCol')[0]
    .style.display = state ? 'flex' : 'none';

  // deactive
  if (!state) {
    videoChat.userLeave(window.headerId, wrtcPubsub.currentOpenRoom, 'VIDEO');
    wrtcPubsub.currentOpenRoom = null;
  }
  wrtcStore.enable = state;
});

wrtcPubsub.on('update network information', () => {});

/*
  * @param state (DISCONNECTED|OPENED)
  */
wrtcPubsub.on('socket state', (state, socket) => {
  wrtcStore.socketState = state;
  if (socket) wrtcStore.socket = socket;

  console.info(`
    [wrtc]: socket state has been change, new state:
    ${window.headerId}
  `);

  if (state === 'OPENED' && wrtcStore.userInRoom) {
    console.info('Try reconnecting...');
    WRTC.attemptToReconnect();
  }
});

/**
    * @param {string} flow  @enum (init|open)
    * @param {boolean}  status  @enum (true|false)
  */
wrtcPubsub.on('componentsFlow', (name, flow, status) => {
  wrtcStore.components[name][flow] = status;
});

wrtcPubsub.on('update inlineAvatar info', (userId, data) => {
  if (clientVars.webrtc.displayInlineAvatar) inlineAvatar.update(userId, data);
});

wrtcPubsub.on('update store',
  (requestUser, headerId, action, target, roomInfo, callback) => {
    if (!requestUser || !headerId || !action || !roomInfo || !target) return false;

    if (!wrtcStore.rooms.has(headerId)) {
      wrtcStore.rooms.set(
        headerId,
        {
          VIDEO: { list: [] },
          TEXT: { list: [] },
          USERS: {},
          headerCount: 0,
        },
      );
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
  });

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
  const headerTile = findAceHeaderElement(headerId).text;

  $('#wrtc_modal .nd_title .title').html(headerTile);

  $(document)
    .find('#wrtc_modal')
    .find('.btn_leave, .btn_reload, .btn_shareRoom, .btn_videoSetting')
    .attr('data-id', headerId);
});

wrtcPubsub.on('updateWrtcToolbarTitleModal', (headerTile, headerId) => {
  if (headerId === window.headerId) {
    const selector = `#wrtc_modal #werc_toolbar .nd_title .titleb[data-id='${headerId}'`;
    $(selector).html(headerTile);
    $(document).find(`.wrtc_roomLink[data-id='${headerId}']`)
      .text(headerTile);
  }
});function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}// Current version.
var VERSION = '1.13.1'; // Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.

var root = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self.self === self && self || (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global.global === global && global || Function('return this')() || {}; // Save bytes in the minified (but not gzipped) version:

var ArrayProto = Array.prototype,
    ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null; // Create quick reference variables for speed access to core prototypes.

var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty; // Modern feature detection.

var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined'; // All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.

var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView; // Create references to these builtin functions because we override them.

var _isNaN = isNaN,
    _isFinite = isFinite; // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.

var hasEnumBug = !{
  toString: null
}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // The largest integer that can be represented exactly.

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function () {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;

    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }

    switch (startIndex) {
      case 0:
        return func.call(this, rest);

      case 1:
        return func.call(this, arguments[0], rest);

      case 2:
        return func.call(this, arguments[0], arguments[1], rest);
    }

    var args = Array(startIndex + 1);

    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }

    args[startIndex] = rest;
    return func.apply(this, args);
  };
}// Is a given variable an object?
function isObject(obj) {
  var type = _typeof(obj);

  return type === 'function' || type === 'object' && !!obj;
}// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}function isBoolean(obj) {
  return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
}// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function (obj) {
    return toString.call(obj) === tag;
  };
}var isString = tagTester('String');var isNumber = tagTester('Number');var isDate = tagTester('Date');var isRegExp = tagTester('RegExp');var isError = tagTester('Error');var isSymbol = tagTester('Symbol');var isArrayBuffer = tagTester('ArrayBuffer');var isFunction = tagTester('Function'); // Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).

var nodelist = root.document && root.document.childNodes;

if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object' && typeof nodelist != 'function') {
  isFunction = function isFunction(obj) {
    return typeof obj == 'function' || false;
  };
}

var isFunction$1 = isFunction;var hasObjectTag = tagTester('Object');// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.

var hasStringTagBug = supportsDataView && hasObjectTag(new DataView(new ArrayBuffer(8))),
    isIE11 = typeof Map !== 'undefined' && hasObjectTag(new Map());var isDataView = tagTester('DataView'); // In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.

function ie10IsDataView(obj) {
  return obj != null && isFunction$1(obj.getInt8) && isArrayBuffer(obj.buffer);
}

var isDataView$1 = hasStringTagBug ? ie10IsDataView : isDataView;// Delegates to ECMA5's native `Array.isArray`.

var isArray = nativeIsArray || tagTester('Array');function has$1(obj, key) {
  return obj != null && hasOwnProperty.call(obj, key);
}var isArguments = tagTester('Arguments'); // Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.

(function () {
  if (!isArguments(arguments)) {
    isArguments = function isArguments(obj) {
      return has$1(obj, 'callee');
    };
  }
})();

var isArguments$1 = isArguments;function isFinite$1(obj) {
  return !isSymbol(obj) && _isFinite(obj) && !isNaN(parseFloat(obj));
}function isNaN$1(obj) {
  return isNumber(obj) && _isNaN(obj);
}// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function () {
    return value;
  };
}function createSizePropertyCheck(getSizeProperty) {
  return function (collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= MAX_ARRAY_INDEX;
  };
}// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function (obj) {
    return obj == null ? void 0 : obj[key];
  };
}var getByteLength = shallowProperty('byteLength');// `ArrayBuffer` et al.

var isBufferLike = createSizePropertyCheck(getByteLength);var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;

function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return nativeIsView ? nativeIsView(obj) && !isDataView$1(obj) : isBufferLike(obj) && typedArrayPattern.test(toString.call(obj));
}

var isTypedArray$1 = supportsArrayBuffer ? isTypedArray : constant(false);var getLength = shallowProperty('length');// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.

function emulatedSet(keys) {
  var hash = {};

  for (var l = keys.length, i = 0; i < l; ++i) {
    hash[keys[i]] = true;
  }

  return {
    contains: function contains(key) {
      return hash[key];
    },
    push: function push(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
} // Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.


function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = isFunction$1(constructor) && constructor.prototype || ObjProto; // Constructor is a special case.

  var prop = 'constructor';
  if (has$1(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = nonEnumerableProps[nonEnumIdx];

    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}// Delegates to **ECMAScript 5**'s native `Object.keys`.

function keys(obj) {
  if (!isObject(obj)) return [];
  if (nativeKeys) return nativeKeys(obj);
  var keys = [];

  for (var key in obj) {
    if (has$1(obj, key)) keys.push(key);
  } // Ahem, IE < 9.


  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}// An "empty" object has no enumerable own-properties.

function isEmpty(obj) {
  if (obj == null) return true; // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.

  var length = getLength(obj);
  if (typeof length == 'number' && (isArray(obj) || isString(obj) || isArguments$1(obj))) return length === 0;
  return getLength(keys(obj)) === 0;
}function isMatch(object, attrs) {
  var _keys = keys(attrs),
      length = _keys.length;

  if (object == null) return !length;
  var obj = Object(object);

  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }

  return true;
}// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.

function _$1(obj) {
  if (obj instanceof _$1) return obj;
  if (!(this instanceof _$1)) return new _$1(obj);
  this._wrapped = obj;
}
_$1.VERSION = VERSION; // Extracts the result from a wrapped and chained object.

_$1.prototype.value = function () {
  return this._wrapped;
}; // Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.


_$1.prototype.valueOf = _$1.prototype.toJSON = _$1.prototype.value;

_$1.prototype.toString = function () {
  return String(this._wrapped);
};// typed array or DataView to a new view, reusing the buffer.

function toBufferView(bufferSource) {
  return new Uint8Array(bufferSource.buffer || bufferSource, bufferSource.byteOffset || 0, getByteLength(bufferSource));
}var tagDataView = '[object DataView]'; // Internal recursive comparison function for `_.isEqual`.

function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

  if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

  if (a !== a) return b !== b; // Exhaust primitive checks

  var type = _typeof(a);

  if (type !== 'function' && type !== 'object' && _typeof(b) != 'object') return false;
  return deepEq(a, b, aStack, bStack);
} // Internal recursive comparison function for `_.isEqual`.


function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _$1) a = a._wrapped;
  if (b instanceof _$1) b = b._wrapped; // Compare `[[Class]]` names.

  var className = toString.call(a);
  if (className !== toString.call(b)) return false; // Work around a bug in IE 10 - Edge 13.

  if (hasStringTagBug && className == '[object Object]' && isDataView$1(a)) {
    if (!isDataView$1(b)) return false;
    className = tagDataView;
  }

  switch (className) {
    // These types are compared by value.
    case '[object RegExp]': // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;

    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

      return +a === 0 ? 1 / +a === 1 / b : +a === +b;

    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;

    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);

    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq(toBufferView(a), toBufferView(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';

  if (!areArrays && isTypedArray$1(a)) {
    var byteLength = getByteLength(a);
    if (byteLength !== getByteLength(b)) return false;
    if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
    areArrays = true;
  }

  if (!areArrays) {
    if (_typeof(a) != 'object' || _typeof(b) != 'object') return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.

    var aCtor = a.constructor,
        bCtor = b.constructor;

    if (aCtor !== bCtor && !(isFunction$1(aCtor) && aCtor instanceof aCtor && isFunction$1(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
      return false;
    }
  } // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.


  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;

  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  } // Add the first object to the stack of traversed objects.


  aStack.push(a);
  bStack.push(b); // Recursively compare objects and arrays.

  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = keys(a),
        key;

    length = _keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

    if (keys(b).length !== length) return false;

    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  } // Remove the first object from the stack of traversed objects.


  aStack.pop();
  bStack.pop();
  return true;
} // Perform a deep comparison to check if two objects are equal.


function isEqual(a, b) {
  return eq(a, b);
}function allKeys(obj) {
  if (!isObject(obj)) return [];
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  } // Ahem, IE < 9.


  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
}// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.

function ie11fingerprint(methods) {
  var length = getLength(methods);
  return function (obj) {
    if (obj == null) return false; // `Map`, `WeakMap` and `Set` have no enumerable keys.

    var keys = allKeys(obj);
    if (getLength(keys)) return false;

    for (var i = 0; i < length; i++) {
      if (!isFunction$1(obj[methods[i]])) return false;
    } // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.


    return methods !== weakMapMethods || !isFunction$1(obj[forEachName]);
  };
} // In the interest of compact minification, we write
// each string in the fingerprints only once.

var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set']; // `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.

var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);var isMap = isIE11 ? ie11fingerprint(mapMethods) : tagTester('Map');var isWeakMap = isIE11 ? ie11fingerprint(weakMapMethods) : tagTester('WeakMap');var isSet = isIE11 ? ie11fingerprint(setMethods) : tagTester('Set');var isWeakSet = tagTester('WeakSet');function values(obj) {
  var _keys = keys(obj);

  var length = _keys.length;
  var values = Array(length);

  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }

  return values;
}// The opposite of `_.object` with one argument.

function pairs(obj) {
  var _keys = keys(obj);

  var length = _keys.length;
  var pairs = Array(length);

  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }

  return pairs;
}function invert(obj) {
  var result = {};

  var _keys = keys(obj);

  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }

  return result;
}function functions(obj) {
  var names = [];

  for (var key in obj) {
    if (isFunction$1(obj[key])) names.push(key);
  }

  return names.sort();
}// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function (obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;

    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;

      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }

    return obj;
  };
}var extend = createAssigner(allKeys);// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)

var extendOwn = createAssigner(keys);var defaults = createAssigner(allKeys, true);function ctor() {
  return function () {};
} // An internal function for creating a new object that inherits from another.


function baseCreate(prototype) {
  if (!isObject(prototype)) return {};
  if (nativeCreate) return nativeCreate(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor();
  Ctor.prototype = null;
  return result;
}// If additional properties are provided then they will be added to the
// created object.

function create(prototype, props) {
  var result = baseCreate(prototype);
  if (props) extendOwn(result, props);
  return result;
}function clone(obj) {
  if (!isObject(obj)) return obj;
  return isArray(obj) ? obj.slice() : extend({}, obj);
}// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}// Like `_.iteratee`, this function can be customized.

function toPath$1(path) {
  return isArray(path) ? path : [path];
}
_$1.toPath = toPath$1;// Similar to `cb` for `_.iteratee`.

function toPath(path) {
  return _$1.toPath(path);
}// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;

  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }

  return length ? obj : void 0;
}// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.

function get(object, path, defaultValue) {
  var value = deepGet(object, toPath(path));
  return isUndefined(value) ? defaultValue : value;
}// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.

function has(obj, path) {
  path = toPath(path);
  var length = path.length;

  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!has$1(obj, key)) return false;
    obj = obj[key];
  }

  return !!length;
}// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}// `key:value` pairs.

function matcher(attrs) {
  attrs = extendOwn({}, attrs);
  return function (obj) {
    return isMatch(obj, attrs);
  };
}// properties down the given `path`, specified as an array of keys or indices.

function property(path) {
  path = toPath(path);
  return function (obj) {
    return deepGet(obj, path);
  };
}// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;

  switch (argCount == null ? 3 : argCount) {
    case 1:
      return function (value) {
        return func.call(context, value);
      };
    // The 2-argument case is omitted because we’re not using it.

    case 3:
      return function (value, index, collection) {
        return func.call(context, value, index, collection);
      };

    case 4:
      return function (accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
  }

  return function () {
    return func.apply(context, arguments);
  };
}// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.

function baseIteratee(value, context, argCount) {
  if (value == null) return identity;
  if (isFunction$1(value)) return optimizeCb(value, context, argCount);
  if (isObject(value) && !isArray(value)) return matcher(value);
  return property(value);
}// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.

function iteratee(value, context) {
  return baseIteratee(value, context, Infinity);
}
_$1.iteratee = iteratee;// `_.iteratee` if overridden, otherwise `baseIteratee`.

function cb(value, context, argCount) {
  if (_$1.iteratee !== iteratee) return _$1.iteratee(value, context);
  return baseIteratee(value, context, argCount);
}// In contrast to `_.map` it returns an object.

function mapObject(obj, iteratee, context) {
  iteratee = cb(iteratee, context);

  var _keys = keys(obj),
      length = _keys.length,
      results = {};

  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }

  return results;
}// Predicate-generating function. Often useful outside of Underscore.
function noop() {}function propertyOf(obj) {
  if (obj == null) return noop;
  return function (path) {
    return get(obj, path);
  };
}function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = optimizeCb(iteratee, context, 1);

  for (var i = 0; i < n; i++) {
    accum[i] = iteratee(i);
  }

  return accum;
}// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }

  return min + Math.floor(Math.random() * (max - min + 1));
}// A (possibly faster) way to get the current timestamp as an integer.
var now = Date.now || function () {
  return new Date().getTime();
};// to/from HTML interpolation.

function createEscaper(map) {
  var escaper = function escaper(match) {
    return map[match];
  }; // Regexes for identifying a key that needs to be escaped.


  var source = '(?:' + keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function (string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}// Internal list of HTML entities for escaping.
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};var escape = createEscaper(escapeMap);var unescapeMap = invert(escapeMap);var unescape = createEscaper(unescapeMap);// following template settings to use alternative delimiters.

var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.

var noMatch = /(.)^/; // Certain characters need to be escaped so that they can be put into a
// string literal.

var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  "\u2028": 'u2028',
  "\u2029": 'u2029'
};
var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
} // In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.


var bareIdentifier = /^\s*(\w|\$)+\s*$/; // JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.

function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = defaults({}, settings, _$1.templateSettings); // Combine delimiters into one regular expression via alternation.

  var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); // Compile the template source, escaping string literals appropriately.

  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    } // Adobe VMs need the match returned to produce the correct offset.


    return match;
  });
  source += "';\n";
  var argument = settings.variable;

  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error('variable is not a bare identifier: ' + argument);
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
  var render;

  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function template(data) {
    return render.call(this, data, _$1);
  }; // Provide the compiled source as a convenience for precompilation.


  template.source = 'function(' + argument + '){\n' + source + '}';
  return template;
}// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.

function result(obj, path, fallback) {
  path = toPath(path);
  var length = path.length;

  if (!length) {
    return isFunction$1(fallback) ? fallback.call(obj) : fallback;
  }

  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];

    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }

    obj = isFunction$1(prop) ? prop.call(obj) : prop;
  }

  return obj;
}// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}function chain(obj) {
  var instance = _$1(obj);

  instance._chain = true;
  return instance;
}// `args`. Determines whether to execute a function as a constructor or as a
// normal function.

function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = baseCreate(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if (isObject(result)) return result;
  return self;
}// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.

var partial = restArguments(function (func, boundArgs) {
  var placeholder = partial.placeholder;

  var bound = function bound() {
    var position = 0,
        length = boundArgs.length;
    var args = Array(length);

    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }

    while (position < arguments.length) {
      args.push(arguments[position++]);
    }

    return executeBound(func, bound, this, this, args);
  };

  return bound;
});
partial.placeholder = _$1;// optionally).

var bind = restArguments(function (func, context, args) {
  if (!isFunction$1(func)) throw new TypeError('Bind must be called on a function');
  var bound = restArguments(function (callArgs) {
    return executeBound(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
});// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094

var isArrayLike = createSizePropertyCheck(getLength);function flatten$1(input, depth, strict, output) {
  output = output || [];

  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }

  var idx = output.length;

  for (var i = 0, length = getLength(input); i < length; i++) {
    var value = input[i];

    if (isArrayLike(value) && (isArray(value) || isArguments$1(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten$1(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0,
            len = value.length;

        while (j < len) {
          output[idx++] = value[j++];
        }
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }

  return output;
}// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.

var bindAll = restArguments(function (obj, keys) {
  keys = flatten$1(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');

  while (index--) {
    var key = keys[index];
    obj[key] = bind(obj[key], obj);
  }

  return obj;
});function memoize(func, hasher) {
  var memoize = function memoize(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!has$1(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };

  memoize.cache = {};
  return memoize;
}// it with the arguments supplied.

var delay = restArguments(function (func, wait, args) {
  return setTimeout(function () {
    return func.apply(null, args);
  }, wait);
});// cleared.

var defer = partial(delay, _$1, 1);// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.

function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function later() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function throttled() {
    var _now = now();

    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.

function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function later() {
    var passed = now() - previous;

    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args); // This check is needed because `func` can recursively invoke `debounced`.

      if (!timeout) args = context = null;
    }
  };

  var debounced = restArguments(function (_args) {
    context = this;
    args = _args;
    previous = now();

    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }

    return result;
  });

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.

function wrap(func, wrapper) {
  return partial(wrapper, func);
}// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function () {
    var i = start;
    var result = args[start].apply(this, arguments);

    while (i--) {
      result = args[i].call(this, result);
    }

    return result;
  };
}// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function () {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function () {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }

    if (times <= 1) func = null;
    return memo;
  };
}// often you call it. Useful for lazy initialization.

var once = partial(before, 2);function findKey(obj, predicate, context) {
  predicate = cb(predicate, context);

  var _keys = keys(obj),
      key;

  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}function createPredicateIndexFinder(dir) {
  return function (array, predicate, context) {
    predicate = cb(predicate, context);
    var length = getLength(array);
    var index = dir > 0 ? 0 : length - 1;

    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }

    return -1;
  };
}var findIndex = createPredicateIndexFinder(1);var findLastIndex = createPredicateIndexFinder(-1);// an object should be inserted so as to maintain order. Uses binary search.

function sortedIndex(array, obj, iteratee, context) {
  iteratee = cb(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0,
      high = getLength(array);

  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
  }

  return low;
}function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function (array, item, idx) {
    var i = 0,
        length = getLength(array);

    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }

    if (item !== item) {
      idx = predicateFind(slice.call(array, i, length), isNaN$1);
      return idx >= 0 ? idx + i : -1;
    }

    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }

    return -1;
  };
}// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.

var indexOf = createIndexFinder(1, findIndex, sortedIndex);// or -1 if the item is not included in the array.

var lastIndexOf = createIndexFinder(-1, findLastIndex);function find(obj, predicate, context) {
  var keyFinder = isArrayLike(obj) ? findIndex : findKey;
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}// object containing specific `key:value` pairs.

function findWhere(obj, attrs) {
  return find(obj, matcher(attrs));
}// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.

function each(obj, iteratee, context) {
  iteratee = optimizeCb(iteratee, context);
  var i, length;

  if (isArrayLike(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = keys(obj);

    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }

  return obj;
}function map(obj, iteratee, context) {
  iteratee = cb(iteratee, context);

  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length,
      results = Array(length);

  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }

  return results;
}function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function reducer(obj, iteratee, memo, initial) {
    var _keys = !isArrayLike(obj) && keys(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;

    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }

    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }

    return memo;
  };

  return function (obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
  };
}// or `foldl`.

var reduce = createReduce(1);var reduceRight = createReduce(-1);function filter(obj, predicate, context) {
  var results = [];
  predicate = cb(predicate, context);
  each(obj, function (value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}function reject(obj, predicate, context) {
  return filter(obj, negate(cb(predicate)), context);
}function every(obj, predicate, context) {
  predicate = cb(predicate, context);

  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;

  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }

  return true;
}function some(obj, predicate, context) {
  predicate = cb(predicate, context);

  var _keys = !isArrayLike(obj) && keys(obj),
      length = (_keys || obj).length;

  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }

  return false;
}function contains(obj, item, fromIndex, guard) {
  if (!isArrayLike(obj)) obj = values(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return indexOf(obj, item, fromIndex) >= 0;
}var invoke = restArguments(function (obj, path, args) {
  var contextPath, func;

  if (isFunction$1(path)) {
    func = path;
  } else {
    path = toPath(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }

  return map(obj, function (context) {
    var method = func;

    if (!method) {
      if (contextPath && contextPath.length) {
        context = deepGet(context, contextPath);
      }

      if (context == null) return void 0;
      method = context[path];
    }

    return method == null ? method : method.apply(context, args);
  });
});function pluck(obj, key) {
  return map(obj, property(key));
}// objects containing specific `key:value` pairs.

function where(obj, attrs) {
  return filter(obj, matcher(attrs));
}function max(obj, iteratee, context) {
  var result = -Infinity,
      lastComputed = -Infinity,
      value,
      computed;

  if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);

    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];

      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function (v, index, list) {
      computed = iteratee(v, index, list);

      if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }

  return result;
}function min(obj, iteratee, context) {
  var result = Infinity,
      lastComputed = Infinity,
      value,
      computed;

  if (iteratee == null || typeof iteratee == 'number' && _typeof(obj[0]) != 'object' && obj != null) {
    obj = isArrayLike(obj) ? obj : values(obj);

    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];

      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = cb(iteratee, context);
    each(obj, function (v, index, list) {
      computed = iteratee(v, index, list);

      if (computed < lastComputed || computed === Infinity && result === Infinity) {
        result = v;
        lastComputed = computed;
      }
    });
  }

  return result;
}// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.

function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!isArrayLike(obj)) obj = values(obj);
    return obj[random(obj.length - 1)];
  }

  var sample = isArrayLike(obj) ? clone(obj) : values(obj);
  var length = getLength(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;

  for (var index = 0; index < n; index++) {
    var rand = random(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }

  return sample.slice(0, n);
}function shuffle(obj) {
  return sample(obj, Infinity);
}function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = cb(iteratee, context);
  return pluck(map(obj, function (value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function (left, right) {
    var a = left.criteria;
    var b = right.criteria;

    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }

    return left.index - right.index;
  }), 'value');
}function group(behavior, partition) {
  return function (obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = cb(iteratee, context);
    each(obj, function (value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}// to group by, or a function that returns the criterion.

var groupBy = group(function (result, value, key) {
  if (has$1(result, key)) result[key].push(value);else result[key] = [value];
});// when you know that your index values will be unique.

var indexBy = group(function (result, value, key) {
  result[key] = value;
});// either a string attribute to count by, or a function that returns the
// criterion.

var countBy = group(function (result, value, key) {
  if (has$1(result, key)) result[key]++;else result[key] = 1;
});// truth test, and one whose elements all do not pass the truth test.

var partition = group(function (result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true);var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if (isArray(obj)) return slice.call(obj);

  if (isString(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }

  if (isArrayLike(obj)) return map(obj, identity);
  return values(obj);
}function size(obj) {
  if (obj == null) return 0;
  return isArrayLike(obj) ? obj.length : keys(obj).length;
}// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}var pick = restArguments(function (obj, keys) {
  var result = {},
      iteratee = keys[0];
  if (obj == null) return result;

  if (isFunction$1(iteratee)) {
    if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
    keys = allKeys(obj);
  } else {
    iteratee = keyInObj;
    keys = flatten$1(keys, false, false);
    obj = Object(obj);
  }

  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }

  return result;
});var omit = restArguments(function (obj, keys) {
  var iteratee = keys[0],
      context;

  if (isFunction$1(iteratee)) {
    iteratee = negate(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = map(flatten$1(keys, false, false), String);

    iteratee = function iteratee(value, key) {
      return !contains(keys, key);
    };
  }

  return pick(obj, iteratee, context);
});// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.

function initial(array, n, guard) {
  return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}// values in the array. The **guard** check allows it to work with `_.map`.

function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return initial(array, array.length - n);
}// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.

function rest(array, n, guard) {
  return slice.call(array, n == null || guard ? 1 : n);
}// values in the array.

function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return rest(array, Math.max(0, array.length - n));
}function compact(array) {
  return filter(array, Boolean);
}// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.

function flatten(array, depth) {
  return flatten$1(array, depth, false);
}// Only the elements present in just the first array will remain.

var difference = restArguments(function (array, rest) {
  rest = flatten$1(rest, true, true);
  return filter(array, function (value) {
    return !contains(rest, value);
  });
});var without = restArguments(function (array, otherArrays) {
  return difference(array, otherArrays);
});// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.

function uniq(array, isSorted, iteratee, context) {
  if (!isBoolean(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }

  if (iteratee != null) iteratee = cb(iteratee, context);
  var result = [];
  var seen = [];

  for (var i = 0, length = getLength(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;

    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!contains(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!contains(result, value)) {
      result.push(value);
    }
  }

  return result;
}// the passed-in arrays.

var union = restArguments(function (arrays) {
  return uniq(flatten$1(arrays, true, true));
});// passed-in arrays.

function intersection(array) {
  var result = [];
  var argsLength = arguments.length;

  for (var i = 0, length = getLength(array); i < length; i++) {
    var item = array[i];
    if (contains(result, item)) continue;
    var j;

    for (j = 1; j < argsLength; j++) {
      if (!contains(arguments[j], item)) break;
    }

    if (j === argsLength) result.push(item);
  }

  return result;
}// each array's elements on shared indices.

function unzip(array) {
  var length = array && max(array, getLength).length || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = pluck(array, index);
  }

  return result;
}// an index go together.

var zip = restArguments(unzip);// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.

function object(list, values) {
  var result = {};

  for (var i = 0, length = getLength(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }

  return result;
}// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }

  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}// items.

function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0,
      length = array.length;

  while (i < length) {
    result.push(slice.call(array, i, i += count));
  }

  return result;
}function chainResult(instance, obj) {
  return instance._chain ? _$1(obj).chain() : obj;
}function mixin(obj) {
  each(functions(obj), function (name) {
    var func = _$1[name] = obj[name];

    _$1.prototype[name] = function () {
      var args = [this._wrapped];
      push.apply(args, arguments);
      return chainResult(this, func.apply(_$1, args));
    };
  });
  return _$1;
}each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
  var method = ArrayProto[name];

  _$1.prototype[name] = function () {
    var obj = this._wrapped;

    if (obj != null) {
      method.apply(obj, arguments);

      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }

    return chainResult(this, obj);
  };
}); // Add all accessor `Array` functions to the wrapper.

each(['concat', 'join', 'slice'], function (name) {
  var method = ArrayProto[name];

  _$1.prototype[name] = function () {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return chainResult(this, obj);
  };
});// Named Exports
var allExports=/*#__PURE__*/Object.freeze({__proto__:null,VERSION:VERSION,restArguments:restArguments,isObject:isObject,isNull:isNull,isUndefined:isUndefined,isBoolean:isBoolean,isElement:isElement,isString:isString,isNumber:isNumber,isDate:isDate,isRegExp:isRegExp,isError:isError,isSymbol:isSymbol,isArrayBuffer:isArrayBuffer,isDataView:isDataView$1,isArray:isArray,isFunction:isFunction$1,isArguments:isArguments$1,isFinite:isFinite$1,isNaN:isNaN$1,isTypedArray:isTypedArray$1,isEmpty:isEmpty,isMatch:isMatch,isEqual:isEqual,isMap:isMap,isWeakMap:isWeakMap,isSet:isSet,isWeakSet:isWeakSet,keys:keys,allKeys:allKeys,values:values,pairs:pairs,invert:invert,functions:functions,methods:functions,extend:extend,extendOwn:extendOwn,assign:extendOwn,defaults:defaults,create:create,clone:clone,tap:tap,get:get,has:has,mapObject:mapObject,identity:identity,constant:constant,noop:noop,toPath:toPath$1,property:property,propertyOf:propertyOf,matcher:matcher,matches:matcher,times:times,random:random,now:now,escape:escape,unescape:unescape,templateSettings:templateSettings,template:template,result:result,uniqueId:uniqueId,chain:chain,iteratee:iteratee,partial:partial,bind:bind,bindAll:bindAll,memoize:memoize,delay:delay,defer:defer,throttle:throttle,debounce:debounce,wrap:wrap,negate:negate,compose:compose,after:after,before:before,once:once,findKey:findKey,findIndex:findIndex,findLastIndex:findLastIndex,sortedIndex:sortedIndex,indexOf:indexOf,lastIndexOf:lastIndexOf,find:find,detect:find,findWhere:findWhere,each:each,forEach:each,map:map,collect:map,reduce:reduce,foldl:reduce,inject:reduce,reduceRight:reduceRight,foldr:reduceRight,filter:filter,select:filter,reject:reject,every:every,all:every,some:some,any:some,contains:contains,includes:contains,include:contains,invoke:invoke,pluck:pluck,where:where,max:max,min:min,shuffle:shuffle,sample:sample,sortBy:sortBy,groupBy:groupBy,indexBy:indexBy,countBy:countBy,partition:partition,toArray:toArray,size:size,pick:pick,omit:omit,first:first,head:first,take:first,initial:initial,last:last,rest:rest,tail:rest,drop:rest,compact:compact,flatten:flatten,without:without,uniq:uniq,unique:uniq,union:union,intersection:intersection,difference:difference,unzip:unzip,transpose:unzip,zip:zip,object:object,range:range,chunk:chunk,mixin:mixin,'default':_$1});// Default Export

var _ = mixin(allExports); // Legacy Node.js API.


_._ = _; // Export the Underscore API.
const ignoreEvent =
  'handleClick,idleWorkTimer,setup,importText,setBaseText,setWraps';

const aceEditorCSS = () => {
  const version = clientVars.webrtc.version || 1;
  return [`ep_wrtc_heading/static/dist/css/innerLayer.css?v=${version}`];
};

const aceEditEvent = (hookName, context) => {
  const eventType = context.callstack.editEvent.eventType;
  console.log(eventType);
  // ignore these types
  if (ignoreEvent.includes(eventType)) return;

  // TODO: refactor needed
  // when a new line create
  if (context.callstack.domClean) adjustAvatarAlignMent();
};

const userLeave = (hookName, context) => {
  // WRTC.userLeave(null, context);
};

const handleClientMessage_RTC_MESSAGE = (hookName, context) => {
  // WRTC.handleClientMessage_RTC_MESSAGE(hookName, context);
};

// TODO: refactore needed
const acePostWriteDomLineHTML = (hookName, context) => {
  const hasHeader = $(context.node).find(':header');
  if (hasHeader.length) {
    hasHeader.find('.videoHeader').attr('data-id');
    // FIXME: performance issue
    setTimeout(() => {
      // WRoom.syncVideoAvatart(headerId);
    }, 250);
  }
};

// TODO: refactor needed
const aceDomLineProcessLineAttributes = (hookName, context) => {
  // const cls = context.cls;
  // const headingType = /(?:^| )headerId:([A-Za-z0-9]*)/.exec(cls);
  const result = [];

  // if (typeof Helper === 'undefined') return result;

  // if (headingType) {
  //   const headerType = /(?:^| )heading:([A-Za-z0-9]*)/.exec(cls);
  //   const headerId = headingType[1];
  //   const htagNum = headerType && headerType[1];

  //   // if video or textChat modal is open! update modal title
  //   if (Helper.wrtcStore.components.video.open) {
  //     const $header = Helper.findAceHeaderElement(headerId);
  //     Helper.wrtcPubsub.emit('updateWrtcToolbarTitleModal', $header.text, headerId);
  //   }

  //   const modifier = {
  //     preHtml: '',
  //     postHtml: `<chat-inline-icon data-headerid="${headerId}"></chat-inline-icon>`,
  //     processedMarker: true,
  //   };

  //   Helper.wrtcStore.rooms.set(
  //     headerId,
  //     {
  //       VIDEO: { list: [] },
  //       TEXT: { list: [] },
  //       USERS: {},
  //       headerCount: 0,
  //     },
  //   );
  //   if (htagNum && Helper.hTags.includes(htagNum)) result.push(modifier);
  // }

  return result;
};exports.aceDomLineProcessLineAttributes=aceDomLineProcessLineAttributes;exports.aceEditEvent=aceEditEvent;exports.aceEditorCSS=aceEditorCSS;exports.acePostWriteDomLineHTML=acePostWriteDomLineHTML;exports.handleClientMessage_RTC_MESSAGE=handleClientMessage_RTC_MESSAGE;exports.userLeave=userLeave;//# sourceMappingURL=bundle.js.map
