// ==UserScript==
// @name       				DPCC-OCS-AI
// @version    				1.0.0
// @description				OCS AI answer assistant for arbitrary websites with manual region selection.
// @author     				enncy
// @license    				MIT
// @match      				*://*/*
// @grant      				GM_info
// @grant      				GM_getTab
// @grant      				GM_saveTab
// @grant      				GM_setValue
// @grant      				GM_getValue
// @grant      				unsafeWindow
// @grant      				GM_listValues
// @grant      				GM_deleteValue
// @grant      				GM_notification
// @grant      				GM_xmlhttpRequest
// @grant      				GM_getResourceText
// @grant      				GM_addValueChangeListener
// @grant      				GM_removeValueChangeListener
// @run-at     				document-start
// @namespace  				https://enncy.cn
// @homepage   				https://github.com/DUNHKpcc/ocs-ai-
// @source     				https://github.com/DUNHKpcc/ocs-ai-
// @downloadURL				https://raw.githubusercontent.com/DUNHKpcc/ocs-ai-/ai-answer-assistant/ocs.ai.user.js
// @updateURL  				https://raw.githubusercontent.com/DUNHKpcc/ocs-ai-/ai-answer-assistant/ocs.ai.user.js
// @icon       				https://cdn.ocsjs.com/logo.png
// @connect    				*
// @antifeature				payment
// ==/UserScript==

(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.OCS = {}));
})(this, function(exports2) {
  "use strict";
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  var lib = {};
  var start$1 = {};
  var customWindow = {};
  var interfaces = {};
  var common$1 = {};
  var events = { exports: {} };
  var R = typeof Reflect === "object" ? Reflect : null;
  var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };
  var ReflectOwnKeys;
  if (R && typeof R.ownKeys === "function") {
    ReflectOwnKeys = R.ownKeys;
  } else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys2(target) {
      return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
    };
  } else {
    ReflectOwnKeys = function ReflectOwnKeys2(target) {
      return Object.getOwnPropertyNames(target);
    };
  }
  function ProcessEmitWarning(warning) {
    if (console && console.warn)
      console.warn(warning);
  }
  var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
    return value !== value;
  };
  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  events.exports = EventEmitter;
  events.exports.once = once;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = void 0;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = void 0;
  var defaultMaxListeners = 10;
  function checkListener(listener) {
    if (typeof listener !== "function") {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
  }
  Object.defineProperty(EventEmitter, "defaultMaxListeners", {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
      }
      defaultMaxListeners = arg;
    }
  });
  EventEmitter.init = function() {
    if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || void 0;
  };
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
    }
    this._maxListeners = n;
    return this;
  };
  function _getMaxListeners(that) {
    if (that._maxListeners === void 0)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }
  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };
  EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i = 1; i < arguments.length; i++)
      args.push(arguments[i]);
    var doError = type === "error";
    var events2 = this._events;
    if (events2 !== void 0)
      doError = doError && events2.error === void 0;
    else if (!doError)
      return false;
    if (doError) {
      var er;
      if (args.length > 0)
        er = args[0];
      if (er instanceof Error) {
        throw er;
      }
      var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
      err.context = er;
      throw err;
    }
    var handler = events2[type];
    if (handler === void 0)
      return false;
    if (typeof handler === "function") {
      ReflectApply(handler, this, args);
    } else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        ReflectApply(listeners[i], this, args);
    }
    return true;
  };
  function _addListener(target, type, listener, prepend) {
    var m;
    var events2;
    var existing;
    checkListener(listener);
    events2 = target._events;
    if (events2 === void 0) {
      events2 = target._events = /* @__PURE__ */ Object.create(null);
      target._eventsCount = 0;
    } else {
      if (events2.newListener !== void 0) {
        target.emit(
          "newListener",
          type,
          listener.listener ? listener.listener : listener
        );
        events2 = target._events;
      }
      existing = events2[type];
    }
    if (existing === void 0) {
      existing = events2[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === "function") {
        existing = events2[type] = prepend ? [listener, existing] : [existing, listener];
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
      m = _getMaxListeners(target);
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
        w.name = "MaxListenersExceededWarning";
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }
    return target;
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.prependListener = function prependListener(type, listener) {
    return _addListener(this, type, listener, true);
  };
  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0)
        return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }
  function _onceWrap(target, type, listener) {
    var state2 = { fired: false, wrapFn: void 0, target, type, listener };
    var wrapped = onceWrapper.bind(state2);
    wrapped.listener = listener;
    state2.wrapFn = wrapped;
    return wrapped;
  }
  EventEmitter.prototype.once = function once2(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
    checkListener(listener);
    this.prependListener(type, _onceWrap(this, type, listener));
    return this;
  };
  EventEmitter.prototype.removeListener = function removeListener(type, listener) {
    var list, events2, position, i, originalListener;
    checkListener(listener);
    events2 = this._events;
    if (events2 === void 0)
      return this;
    list = events2[type];
    if (list === void 0)
      return this;
    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0)
        this._events = /* @__PURE__ */ Object.create(null);
      else {
        delete events2[type];
        if (events2.removeListener)
          this.emit("removeListener", type, list.listener || listener);
      }
    } else if (typeof list !== "function") {
      position = -1;
      for (i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener || list[i].listener === listener) {
          originalListener = list[i].listener;
          position = i;
          break;
        }
      }
      if (position < 0)
        return this;
      if (position === 0)
        list.shift();
      else {
        spliceOne(list, position);
      }
      if (list.length === 1)
        events2[type] = list[0];
      if (events2.removeListener !== void 0)
        this.emit("removeListener", type, originalListener || listener);
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
    var listeners, events2, i;
    events2 = this._events;
    if (events2 === void 0)
      return this;
    if (events2.removeListener === void 0) {
      if (arguments.length === 0) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      } else if (events2[type] !== void 0) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else
          delete events2[type];
      }
      return this;
    }
    if (arguments.length === 0) {
      var keys = Object.keys(events2);
      var key;
      for (i = 0; i < keys.length; ++i) {
        key = keys[i];
        if (key === "removeListener")
          continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners("removeListener");
      this._events = /* @__PURE__ */ Object.create(null);
      this._eventsCount = 0;
      return this;
    }
    listeners = events2[type];
    if (typeof listeners === "function") {
      this.removeListener(type, listeners);
    } else if (listeners !== void 0) {
      for (i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }
    return this;
  };
  function _listeners(target, type, unwrap) {
    var events2 = target._events;
    if (events2 === void 0)
      return [];
    var evlistener = events2[type];
    if (evlistener === void 0)
      return [];
    if (typeof evlistener === "function")
      return unwrap ? [evlistener.listener || evlistener] : [evlistener];
    return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }
  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };
  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };
  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === "function") {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };
  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events2 = this._events;
    if (events2 !== void 0) {
      var evlistener = events2[type];
      if (typeof evlistener === "function") {
        return 1;
      } else if (evlistener !== void 0) {
        return evlistener.length;
      }
    }
    return 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };
  function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
      copy[i] = arr[i];
    return copy;
  }
  function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
      list[index] = list[index + 1];
    list.pop();
  }
  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }
  function once(emitter, name) {
    return new Promise(function(resolve, reject) {
      function errorListener(err) {
        emitter.removeListener(name, resolver);
        reject(err);
      }
      function resolver() {
        if (typeof emitter.removeListener === "function") {
          emitter.removeListener("error", errorListener);
        }
        resolve([].slice.call(arguments));
      }
      eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
      if (name !== "error") {
        addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
      }
    });
  }
  function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
    if (typeof emitter.on === "function") {
      eventTargetAgnosticAddListener(emitter, "error", handler, flags);
    }
  }
  function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
    if (typeof emitter.on === "function") {
      if (flags.once) {
        emitter.once(name, listener);
      } else {
        emitter.on(name, listener);
      }
    } else if (typeof emitter.addEventListener === "function") {
      emitter.addEventListener(name, function wrapListener(arg) {
        if (flags.once) {
          emitter.removeEventListener(name, wrapListener);
        }
        listener(arg);
      });
    } else {
      throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
    }
  }
  var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(common$1, "__esModule", { value: true });
  common$1.CommonEventEmitter = void 0;
  const events_1$1 = __importDefault$2(events.exports);
  class CommonEventEmitter extends events_1$1.default {
    on(eventName, listener) {
      return super.on(eventName.toString(), listener);
    }
    once(eventName, listener) {
      return super.once(eventName.toString(), listener);
    }
    emit(eventName, ...args) {
      return super.emit(eventName.toString(), ...args);
    }
    off(eventName, listener) {
      return super.off(eventName.toString(), listener);
    }
  }
  common$1.CommonEventEmitter = CommonEventEmitter;
  var config$1 = {};
  Object.defineProperty(config$1, "__esModule", { value: true });
  var cors = {};
  var utils = {};
  var common = {};
  function isObject$2(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_1 = isObject$2;
  var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var _freeGlobal = freeGlobal$1;
  var freeGlobal = _freeGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root$2 = freeGlobal || freeSelf || Function("return this")();
  var _root = root$2;
  var root$1 = _root;
  var now$1 = function() {
    return root$1.Date.now();
  };
  var now_1 = now$1;
  var reWhitespace = /\s/;
  function trimmedEndIndex$1(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) {
    }
    return index;
  }
  var _trimmedEndIndex = trimmedEndIndex$1;
  var trimmedEndIndex = _trimmedEndIndex;
  var reTrimStart = /^\s+/;
  function baseTrim$1(string) {
    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
  }
  var _baseTrim = baseTrim$1;
  var root = _root;
  var Symbol$3 = root.Symbol;
  var _Symbol = Symbol$3;
  var Symbol$2 = _Symbol;
  var objectProto$1 = Object.prototype;
  var hasOwnProperty = objectProto$1.hasOwnProperty;
  var nativeObjectToString$1 = objectProto$1.toString;
  var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : void 0;
  function getRawTag$1(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
    try {
      value[symToStringTag$1] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }
  var _getRawTag = getRawTag$1;
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString$1(value) {
    return nativeObjectToString.call(value);
  }
  var _objectToString = objectToString$1;
  var Symbol$1 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
  var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
  function baseGetTag$1(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  var _baseGetTag = baseGetTag$1;
  function isObjectLike$1(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_1 = isObjectLike$1;
  var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
  var symbolTag = "[object Symbol]";
  function isSymbol$1(value) {
    return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  var isSymbol_1 = isSymbol$1;
  var baseTrim = _baseTrim, isObject$1 = isObject_1, isSymbol = isSymbol_1;
  var NAN = 0 / 0;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  function toNumber$1(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject$1(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject$1(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  var toNumber_1 = toNumber$1;
  var isObject = isObject_1, now = now_1, toNumber = toNumber_1;
  var FUNC_ERROR_TEXT = "Expected a function";
  var nativeMax = Math.max, nativeMin = Math.min;
  function debounce(func, wait, options) {
    var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
    if (typeof func != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = "maxWait" in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
      var args = lastArgs, thisArg = lastThis;
      lastArgs = lastThis = void 0;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }
    function leadingEdge(time) {
      lastInvokeTime = time;
      timerId = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
      return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }
    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
      return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
    }
    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
      timerId = void 0;
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = void 0;
      return result;
    }
    function cancel() {
      if (timerId !== void 0) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = void 0;
    }
    function flush() {
      return timerId === void 0 ? result : trailingEdge(now());
    }
    function debounced() {
      var time = now(), isInvoking = shouldInvoke(time);
      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;
      if (isInvoking) {
        if (timerId === void 0) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === void 0) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }
  var debounce_1$1 = debounce;
  var store = {};
  var store_provider = {};
  var _const = {};
  Object.defineProperty(_const, "__esModule", { value: true });
  _const.$const = void 0;
  _const.$const = {
    TAB_UID: "_uid_",
    TAB_URLS: "_urls_",
    TAB_CURRENT_PANEL_NAME: "_current_panel_name_"
  };
  var __awaiter$3 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(store_provider, "__esModule", { value: true });
  store_provider.GMStoreProvider = store_provider.MemoryStoreProvider = store_provider.LocalStoreChangeEvent = void 0;
  const const_1$1 = _const;
  class LocalStoreChangeEvent extends Event {
    constructor() {
      super(...arguments);
      this.key = "";
    }
  }
  store_provider.LocalStoreChangeEvent = LocalStoreChangeEvent;
  class MemoryStoreProvider {
    get(key, defaultValue) {
      var _a;
      return (_a = Reflect.get(MemoryStoreProvider._source.store, key)) !== null && _a !== void 0 ? _a : defaultValue;
    }
    set(key, value) {
      var _a;
      const pre = Reflect.get(MemoryStoreProvider._source.store, key);
      Reflect.set(MemoryStoreProvider._source.store, key, value);
      (_a = MemoryStoreProvider.storeListeners.get(key)) === null || _a === void 0 ? void 0 : _a.forEach((lis) => lis(value, pre));
    }
    delete(key) {
      Reflect.deleteProperty(MemoryStoreProvider._source.store, key);
    }
    list() {
      return Object.keys(MemoryStoreProvider._source.store);
    }
    getTab(key) {
      return __awaiter$3(this, void 0, void 0, function* () {
        return Reflect.get(MemoryStoreProvider._source.tab, key);
      });
    }
    setTab(key, value) {
      var _a;
      return __awaiter$3(this, void 0, void 0, function* () {
        Reflect.set(MemoryStoreProvider._source.tab, key, value);
        (_a = MemoryStoreProvider.tabListeners.get(key)) === null || _a === void 0 ? void 0 : _a.forEach((lis) => lis(value, this.getTab(key)));
      });
    }
    addChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.storeListeners.get(key) || [];
      listeners.push(listener);
      MemoryStoreProvider.storeListeners.set(key, listeners);
    }
    removeChangeListener(listener) {
      MemoryStoreProvider.tabListeners.forEach((lis, key) => {
        const index = lis.findIndex((l) => l === listener);
        if (index !== -1) {
          lis.splice(index, 1);
          MemoryStoreProvider.tabListeners.set(key, lis);
        }
      });
    }
    addTabChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.tabListeners.get(key) || [];
      listeners.push(listener);
      MemoryStoreProvider.tabListeners.set(key, listeners);
    }
    removeTabChangeListener(key, listener) {
      const listeners = MemoryStoreProvider.tabListeners.get(key) || [];
      const index = listeners.findIndex((l) => l === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        MemoryStoreProvider.tabListeners.set(key, listeners);
      }
    }
  }
  MemoryStoreProvider._source = { store: {}, tab: {} };
  MemoryStoreProvider.storeListeners = /* @__PURE__ */ new Map();
  MemoryStoreProvider.tabListeners = /* @__PURE__ */ new Map();
  store_provider.MemoryStoreProvider = MemoryStoreProvider;
  class GMStoreProvider {
    constructor() {
      if (self === top && typeof globalThis.GM_listValues !== "undefined") {
        for (const val of GM_listValues()) {
          if (val.startsWith("_tab_change_")) {
            GM_deleteValue(val);
          }
        }
      }
    }
    getTabChangeHandleKey(tabUid, key) {
      return `_tab_change_${tabUid}_${key}`;
    }
    get(key, defaultValue) {
      return GM_getValue(key, defaultValue);
    }
    set(key, value) {
      GM_setValue(key, value);
    }
    delete(key) {
      GM_deleteValue(key);
    }
    list() {
      return GM_listValues();
    }
    getTab(key) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => resolve(Reflect.get(tab, key)));
      });
    }
    setTab(key, value) {
      return new Promise((resolve, reject) => {
        GM_getTab((tab = {}) => {
          Reflect.set(tab, key, value);
          GM_saveTab(tab);
          this.set(this.getTabChangeHandleKey(Reflect.get(tab, const_1$1.$const.TAB_UID), key), value);
          resolve();
        });
      });
    }
    addChangeListener(key, listener) {
      return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
        listener(curr, pre, remote);
      });
    }
    removeChangeListener(listenerId) {
      if (typeof listenerId === "number") {
        GM_removeValueChangeListener(listenerId);
      }
    }
    addTabChangeListener(key, listener) {
      return __awaiter$3(this, void 0, void 0, function* () {
        const uid = yield this.getTab(const_1$1.$const.TAB_UID);
        return GM_addValueChangeListener(this.getTabChangeHandleKey(uid, key), (_, pre, curr) => {
          listener(curr, pre);
        });
      });
    }
    removeTabChangeListener(key, listener) {
      return this.removeChangeListener(listener);
    }
  }
  store_provider.GMStoreProvider = GMStoreProvider;
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$store = exports3.MemoryStoreProvider = exports3.GMStoreProvider = void 0;
    const store_provider_1 = store_provider;
    var store_provider_2 = store_provider;
    Object.defineProperty(exports3, "GMStoreProvider", { enumerable: true, get: function() {
      return store_provider_2.GMStoreProvider;
    } });
    Object.defineProperty(exports3, "MemoryStoreProvider", { enumerable: true, get: function() {
      return store_provider_2.MemoryStoreProvider;
    } });
    exports3.$store = typeof globalThis.unsafeWindow === "undefined" ? new store_provider_1.MemoryStoreProvider() : new store_provider_1.GMStoreProvider();
  })(store);
  (function(exports3) {
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __rest2 = commonjsGlobal && commonjsGlobal.__rest || function(s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    };
    var __importDefault2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.resolveCustomElementName = exports3.$ = void 0;
    const debounce_12 = __importDefault2(debounce_1$1);
    const store_12 = store;
    exports3.$ = {
      createConfigProxy(script2) {
        var _a, _b;
        const proxy = new Proxy(script2.cfg, {
          set(target, propertyKey, value) {
            const key = exports3.$.namespaceKey(script2.namespace, propertyKey);
            store_12.$store.set(key, value);
            return Reflect.set(target, propertyKey, value);
          },
          get(target, propertyKey) {
            const value = store_12.$store.get(exports3.$.namespaceKey(script2.namespace, propertyKey));
            Reflect.set(target, propertyKey, value);
            return value;
          }
        });
        for (const key in script2.configs) {
          if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
            const element = Reflect.get(script2.configs, key);
            Reflect.set(proxy, key, store_12.$store.get(exports3.$.namespaceKey(script2.namespace, key), element.defaultValue));
          }
        }
        if (script2.namespace) {
          proxy.notes = (_b = (_a = script2.configs) === null || _a === void 0 ? void 0 : _a.notes) === null || _b === void 0 ? void 0 : _b.defaultValue;
        }
        return proxy;
      },
      getAllRawConfigs(scripts) {
        const object = {};
        for (const script2 of scripts) {
          for (const key in script2.configs) {
            if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
              const _a = script2.configs[key], element = __rest2(_a, ["label"]);
              Reflect.set(object, exports3.$.namespaceKey(script2.namespace, key), Object.assign({ label: exports3.$.namespaceKey(script2.namespace, key) }, element));
            }
          }
        }
        return object;
      },
      getMatchedScripts(projects, urls) {
        const scripts = [];
        for (const project2 of projects) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              const script_matches_urls = script2.matches.map((u) => Array.isArray(u) ? u[1] : u);
              const script_excludes_urls = (script2.excludes || []).map((u) => Array.isArray(u) ? u[1] : u);
              if (project2.domains === void 0 || project2.domains.length === 0 || project2.domains.some((d) => urls.some((url) => new URL(url).origin.includes(d)))) {
                if (script_excludes_urls.some((u) => urls.some((url) => RegExp(u).test(url)))) {
                  continue;
                }
                if (script_matches_urls.some((u) => urls.some((url) => RegExp(u).test(url)))) {
                  scripts.push(script2);
                }
              }
            }
          }
        }
        return scripts;
      },
      namespaceKey(namespace, key) {
        return namespace ? namespace + "." + key.toString() : key.toString();
      },
      uuid() {
        return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : r & 3 | 8;
          return v.toString(16);
        });
      },
      random(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
      },
      sleep(period) {
        return __awaiter2(this, void 0, void 0, function* () {
          return new Promise((resolve) => {
            setTimeout(resolve, period);
          });
        });
      },
      isInBrowser() {
        return typeof window !== "undefined" && typeof window.document !== "undefined";
      },
      onresize(el, handler) {
        const resize = (0, debounce_12.default)(() => {
          if (el.parentNode === null) {
            window.removeEventListener("resize", resize);
          } else {
            handler(el);
          }
        }, 200);
        resize();
        window.addEventListener("resize", resize);
      },
      loadCustomElements(elements2) {
        for (const element of elements2) {
          const name = resolveCustomElementName(element, "-");
          if (customElements.get(name) === void 0) {
            customElements.define(name, element);
          }
        }
      },
      isInTopWindow() {
        return self === top;
      },
      createCenteredPopupWindow(url, winName, opts) {
        const { width, height, scrollbars, resizable } = opts;
        const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
        const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
        const settings = "height=" + height + ",width=" + width + ",top=" + TopPosition + ",left=" + LeftPosition + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",resizable=" + (resizable ? "yes" : "no");
        return window.open(url, winName, settings);
      }
    };
    function resolveCustomElementName(el, target) {
      return el.name.replace(/([A-Z])/g, target + "$1").toLowerCase().split(target).slice(1).join(target);
    }
    exports3.resolveCustomElementName = resolveCustomElementName;
  })(common);
  var ui = {};
  var dom = {};
  Object.defineProperty(dom, "__esModule", { value: true });
  dom.enableElementTouchDraggable = dom.enableElementDraggable = dom.$$el = dom.$el = dom.h = void 0;
  const common_1$5 = common;
  function h(element, attrsOrChildren, childrenOrHandler) {
    let name = "";
    if (typeof element === "function") {
      name = (0, common_1$5.resolveCustomElementName)(element, "-");
    } else {
      name = element;
    }
    const el = document.createElement(name);
    if (attrsOrChildren) {
      if (Array.isArray(attrsOrChildren)) {
        for (const child of attrsOrChildren) {
          if (typeof child === "function") {
            el.append(document.createElement(child.name));
          } else {
            el.append(child);
          }
        }
      } else if (typeof attrsOrChildren === "string") {
        el.append(attrsOrChildren);
      } else {
        const attrs = attrsOrChildren;
        for (const key in attrs) {
          if (Object.prototype.hasOwnProperty.call(attrs, key)) {
            if (key === "style") {
              Object.assign(el.style, attrs[key]);
            } else {
              const value = attrs[key];
              Reflect.set(el, key, value);
            }
          }
        }
      }
    }
    if (childrenOrHandler) {
      if (typeof childrenOrHandler === "function") {
        childrenOrHandler.call(el, el);
      } else if (Array.isArray(childrenOrHandler)) {
        for (const child of childrenOrHandler) {
          if (typeof child === "function") {
            el.append(document.createElement(child.name));
          } else {
            el.append(child);
          }
        }
      } else if (typeof childrenOrHandler === "string") {
        el.append(childrenOrHandler);
      }
    }
    return el;
  }
  dom.h = h;
  function $el(selector, root2 = window.document) {
    const el = root2.querySelector(selector);
    return el === null ? void 0 : el;
  }
  dom.$el = $el;
  function $$el(selector, root2 = window.document) {
    return Array.from(root2.querySelectorAll(selector));
  }
  dom.$$el = $$el;
  function enableElementDraggable(header2, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header2.addEventListener("mousedown", dragMouseDown);
    function dragMouseDown(e) {
      e = e || window.event;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener("mouseup", closeDragElement);
      document.addEventListener("mousemove", elementDrag);
    }
    function elementDrag(e) {
      e.stopPropagation();
      e = e || window.event;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag === null || ondrag === void 0 ? void 0 : ondrag();
      document.removeEventListener("mouseup", closeDragElement);
      document.removeEventListener("mousemove", elementDrag);
    }
  }
  dom.enableElementDraggable = enableElementDraggable;
  function enableElementTouchDraggable(header2, target, ondrag) {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    header2.addEventListener("touchstart", dragTouchStart);
    function dragTouchStart(e) {
      e = e || window.event;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.addEventListener("touchend", closeDragElement);
      document.addEventListener("touchmove", elementDrag);
    }
    function elementDrag(e) {
      e.stopPropagation();
      e = e || window.event;
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      target.style.top = Math.max(target.offsetTop - pos2, 10) + "px";
      target.style.left = target.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      ondrag === null || ondrag === void 0 ? void 0 : ondrag();
      document.removeEventListener("touchend", closeDragElement);
      document.removeEventListener("touchmove", elementDrag);
    }
  }
  dom.enableElementTouchDraggable = enableElementTouchDraggable;
  var elements$1 = {};
  Object.defineProperty(elements$1, "__esModule", { value: true });
  elements$1.$elements = void 0;
  elements$1.$elements = {
    tooltipContainer: void 0,
    root: void 0,
    currentScriptPanel: void 0,
    wrapper: void 0
  };
  var tampermonkey = {};
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$gm = void 0;
    exports3.$gm = {
      unsafeWindow: typeof globalThis.unsafeWindow === "undefined" ? globalThis.window : globalThis.unsafeWindow,
      isInGMContext() {
        return typeof GM_info !== "undefined";
      },
      getInfos() {
        return typeof GM_info === "undefined" ? void 0 : GM_info;
      },
      getTab(callback) {
        return typeof GM_getTab === "undefined" ? void 0 : GM_getTab(callback);
      },
      notification(content, options) {
        var _a;
        const { onclick, ondone, important, duration = 30, silent = true, extraTitle = "" } = options || {};
        const { icon, name } = ((_a = exports3.$gm.getInfos()) === null || _a === void 0 ? void 0 : _a.script) || {};
        GM_notification({
          title: name + (extraTitle ? "-" + extraTitle : ""),
          text: content,
          image: icon || "",
          highlight: important,
          onclick,
          ondone,
          silent,
          timeout: duration * 1e3
        });
      },
      getMetadataFromScriptHead(key) {
        var _a, _b;
        const metadataString = (_a = this.getInfos()) === null || _a === void 0 ? void 0 : _a.scriptMetaStr;
        if (!metadataString) {
          return [];
        } else {
          const metadata = ((_b = metadataString.match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)) === null || _b === void 0 ? void 0 : _b[1]) || "";
          const metadataList = (metadata.match(/\/\/\s+@(.+?)\s+(.*?)(?:\n|$)/g) || []).map((line) => {
            const words = line.match(/[\S]+/g) || [];
            return {
              key: (words[1] || "").replace("@", ""),
              value: words.slice(2).join(" ")
            };
          });
          return metadataList.filter((l) => l.key === key).map((l) => l.value);
        }
      }
    };
  })(tampermonkey);
  Object.defineProperty(ui, "__esModule", { value: true });
  ui.$ui = void 0;
  const common_1$4 = common;
  const dom_1$6 = dom;
  const elements_1$2 = elements$1;
  const tampermonkey_1$1 = tampermonkey;
  ui.$ui = {
    tooltip(target) {
      target.setAttribute("data-title", target.title);
      if (tampermonkey_1$1.$gm.isInGMContext()) {
        target.removeAttribute("title");
      }
      const onMouseMove = (e) => {
        if (elements_1$2.$elements.tooltipContainer && elements_1$2.$elements.tooltipContainer.style.display !== "none") {
          elements_1$2.$elements.tooltipContainer.style.top = e.y + "px";
          elements_1$2.$elements.tooltipContainer.style.left = e.x + "px";
        }
      };
      const onTouchMove = (e) => {
        if (elements_1$2.$elements.tooltipContainer && elements_1$2.$elements.tooltipContainer.style.display !== "none") {
          const touch = e.touches[0];
          elements_1$2.$elements.tooltipContainer.style.top = touch.clientY + "px";
          elements_1$2.$elements.tooltipContainer.style.left = touch.clientX + "px";
        }
      };
      const showTitle = (e) => {
        const dataTitle = target.getAttribute("data-title");
        if (elements_1$2.$elements.tooltipContainer) {
          if (dataTitle) {
            elements_1$2.$elements.tooltipContainer.innerHTML = dataTitle.split("\n").join("<br>") || "";
            if (e instanceof MouseEvent) {
              elements_1$2.$elements.tooltipContainer.style.top = e.y + "px";
              elements_1$2.$elements.tooltipContainer.style.left = e.x + "px";
            } else if (e instanceof TouchEvent) {
              const touch = e.touches[0];
              elements_1$2.$elements.tooltipContainer.style.top = touch.clientY + "px";
              elements_1$2.$elements.tooltipContainer.style.left = touch.clientX + "px";
            }
            elements_1$2.$elements.tooltipContainer.style.display = "block";
          } else {
            elements_1$2.$elements.tooltipContainer.style.display = "none";
          }
        }
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("touchmove", onTouchMove);
      };
      const hideTitle = () => {
        if (elements_1$2.$elements.tooltipContainer) {
          elements_1$2.$elements.tooltipContainer.style.display = "none";
        }
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
      };
      hideTitle();
      target.addEventListener("mouseenter", showTitle);
      target.addEventListener("click", showTitle);
      target.addEventListener("mouseout", hideTitle);
      target.addEventListener("mouseleave", hideTitle);
      target.addEventListener("touchstart", showTitle);
      target.addEventListener("touchend", hideTitle);
      target.addEventListener("touchcancel", hideTitle);
      target.addEventListener("blur", hideTitle);
      return target;
    },
    scriptPanel(script2, store2, opts) {
      var _a, _b;
      const scriptPanel = (0, dom_1$6.h)("script-panel-element", { name: script2.name });
      script2.onConfigChange("notes", (pre, curr) => {
        scriptPanel.notesContainer.innerHTML = script2.cfg.notes || "";
      });
      script2.panel = scriptPanel;
      scriptPanel.notesContainer.innerHTML = ((_b = (_a = script2.configs) === null || _a === void 0 ? void 0 : _a.notes) === null || _b === void 0 ? void 0 : _b.defaultValue) || "";
      let configs = /* @__PURE__ */ Object.create({});
      const elList = [];
      for (const key in script2.configs) {
        if (Object.prototype.hasOwnProperty.call(script2.configs, key)) {
          const cfg = script2.configs[key];
          if (cfg.separator) {
            elList.push(this.configsArea(this.configs(script2.namespace, store2, configs || {}, opts === null || opts === void 0 ? void 0 : opts.onload)));
            elList.push((0, dom_1$6.h)("div", { className: "separator", style: { margin: "0px 8px" } }, cfg.separator));
            configs = /* @__PURE__ */ Object.create({});
          }
          configs[key] = cfg;
        }
      }
      if (Object.keys(configs).length > 0) {
        elList.push(this.configsArea(this.configs(script2.namespace, store2, configs || {}, opts === null || opts === void 0 ? void 0 : opts.onload)));
      }
      scriptPanel.configsContainer.replaceChildren(...elList);
      return scriptPanel;
    },
    configsArea(configElements) {
      const configsContainer = (0, dom_1$6.h)("div", { className: "configs card" });
      const configsBody = (0, dom_1$6.h)("div", { className: "configs-body" });
      configsBody.append(...Object.entries(configElements).map(([key, el]) => el));
      configsContainer.append(configsBody);
      return configsContainer;
    },
    configs(namespace, store2, configs, onload) {
      const elements2 = /* @__PURE__ */ Object.create({});
      for (const key in configs) {
        if (Object.prototype.hasOwnProperty.call(configs, key)) {
          const config2 = configs[key];
          if (config2.label !== void 0) {
            const element = (0, dom_1$6.h)("config-element", {
              key: common_1$4.$.namespaceKey(namespace, key),
              tag: config2.tag,
              sync: config2.sync,
              attrs: config2.attrs,
              _onload: function(el) {
                var _a;
                (_a = config2.onload) === null || _a === void 0 ? void 0 : _a.call(this, el);
                onload === null || onload === void 0 ? void 0 : onload(el);
              },
              defaultValue: config2.defaultValue,
              options: config2.options,
              showIf: config2.showIf,
              elementClassName: config2.elementClassName,
              labelClassName: config2.labelClassName,
              providerClassName: config2.providerClassName,
              enableForAttribute: config2.enableForAttribute
            });
            element.store = store2;
            element.label.textContent = config2.label;
            elements2[key] = element;
          }
        }
      }
      return elements2;
    },
    notes(lines, tag = "ul") {
      return (0, dom_1$6.h)(tag, lines.map((line) => (0, dom_1$6.h)("li", Array.isArray(line) ? line.map((node) => typeof node === "string" ? (0, dom_1$6.h)("div", { innerHTML: node }) : node) : [typeof line === "string" ? (0, dom_1$6.h)("div", { innerHTML: line }) : line])));
    },
    copy(name, value) {
      return (0, dom_1$6.h)("span", "📄" + name, (btn) => {
        btn.className = "copy";
        btn.addEventListener("click", () => {
          btn.innerText = "已复制√";
          navigator.clipboard.writeText(value);
          setTimeout(() => {
            btn.innerText = "📄" + name;
          }, 500);
        });
      });
    },
    preventText(opts) {
      const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts;
      const span = (0, dom_1$6.h)("span", name);
      span.style.textDecoration = "underline";
      span.style.cursor = "pointer";
      span.onclick = () => {
        clearTimeout(id);
        if (autoRemove) {
          span.remove();
        }
        onprevent === null || onprevent === void 0 ? void 0 : onprevent(span);
      };
      const id = setTimeout(() => {
        if (autoRemove) {
          span.remove();
        }
        ondefault(span);
      }, delay * 1e3);
      return span;
    },
    space(children, options) {
      return (0, dom_1$6.h)("div", { className: "space" }, (div) => {
        var _a, _b, _c;
        for (let index = 0; index < children.length; index++) {
          const child = (0, dom_1$6.h)("span", { className: "space-item" }, [children[index]]);
          child.style.display = "inline-block";
          const x = (_a = options === null || options === void 0 ? void 0 : options.x) !== null && _a !== void 0 ? _a : 12;
          const y = (_b = options === null || options === void 0 ? void 0 : options.y) !== null && _b !== void 0 ? _b : 0;
          if (index > 0) {
            child.style.marginLeft = x / 2 + "px";
            child.style.marginRight = x / 2 + "px";
            child.style.marginTop = y / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          } else {
            child.style.marginRight = x / 2 + "px";
            child.style.marginBottom = y / 2 + "px";
          }
          div.append(child);
          if (index !== children.length - 1) {
            div.append((0, dom_1$6.h)("span", [(_c = options === null || options === void 0 ? void 0 : options.separator) !== null && _c !== void 0 ? _c : " "]));
          }
        }
      });
    },
    button(text, attrs, handler) {
      return (0, dom_1$6.h)("input", Object.assign({ type: "button" }, attrs), function(btn) {
        btn.value = text || "";
        btn.classList.add("base-style-button");
        handler === null || handler === void 0 ? void 0 : handler.apply(this, [btn]);
      });
    }
  };
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    __exportStar(common, exports3);
    __exportStar(ui, exports3);
    __exportStar(dom, exports3);
    __exportStar(elements$1, exports3);
    __exportStar(tampermonkey, exports3);
    __exportStar(store, exports3);
    __exportStar(_const, exports3);
  })(utils);
  (function(exports3) {
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.cors = exports3.CorsEventEmitter = void 0;
    const utils_12 = utils;
    const common_12 = common;
    const const_12 = _const;
    const store_12 = store;
    class CorsEventEmitter {
      constructor() {
        this.eventMap = /* @__PURE__ */ new Map();
      }
      eventKey(name) {
        return "cors.events." + name;
      }
      tempKey(...args) {
        return ["_temp_", ...args].join(".");
      }
      keyOfReturn(id) {
        return this.tempKey("event", id, "return");
      }
      keyOfArguments(id) {
        return this.tempKey("event", id, "arguments");
      }
      keyOfState(id) {
        return this.tempKey("event", id, "state");
      }
      emit(name, args = [], callback) {
        store_12.$store.getTab(const_12.$const.TAB_UID).then((uid) => {
          const id = common_12.$.uuid().replace(/-/g, "");
          const key = uid + "." + this.eventKey(name);
          store_12.$store.set(this.keyOfState(id), 0);
          store_12.$store.set(this.keyOfArguments(id), args);
          setTimeout(() => {
            const listenerId = store_12.$store.addChangeListener(this.keyOfState(id), () => {
              store_12.$store.removeChangeListener(listenerId);
              callback === null || callback === void 0 ? void 0 : callback(store_12.$store.get(this.keyOfReturn(id)));
              store_12.$store.delete(this.keyOfState(id));
              store_12.$store.delete(this.keyOfReturn(id));
              store_12.$store.delete(this.keyOfArguments(id));
            }) || 0;
            store_12.$store.set(key, (store_12.$store.get(key) ? String(store_12.$store.get(key)).split(",") : []).concat(id).join(","));
          }, 100);
        }).catch(console.error);
      }
      on(name, handler) {
        return new Promise((resolve) => {
          store_12.$store.getTab(const_12.$const.TAB_UID).then((uid) => {
            const key = uid + "." + this.eventKey(name);
            const originId = this.eventMap.get(key);
            if (originId) {
              resolve(originId);
            } else {
              const id = store_12.$store.addChangeListener(key, (curr, pre, remote) => __awaiter2(this, void 0, void 0, function* () {
                if (remote) {
                  if (curr === void 0) {
                    return;
                  }
                  const list = String(curr).split(",");
                  const id2 = list.pop();
                  if (id2) {
                    store_12.$store.set(this.keyOfReturn(id2), yield handler(store_12.$store.get(this.keyOfArguments(id2))));
                    setTimeout(() => {
                      store_12.$store.set(this.keyOfState(id2), 1);
                      store_12.$store.set(key, list.join(","));
                    }, 100);
                  }
                }
              })) || 0;
              this.eventMap.set(key, id);
              resolve(id);
            }
          }).catch(console.error);
        });
      }
      off(name) {
        const key = this.eventKey(name);
        const originId = this.eventMap.get(key);
        if (originId) {
          this.eventMap.delete(key);
          store_12.$store.removeChangeListener(originId);
        }
      }
      defineTopFunction(func) {
        if (utils_12.$gm.isInGMContext() === false) {
          return () => {
          };
        }
        const event_name = "_top_function_." + getFuncId(func);
        if (self === top) {
          exports3.cors.on(event_name, (args) => __awaiter2(this, void 0, void 0, function* () {
            return yield func(...args);
          }));
        }
        return (...args) => __awaiter2(this, void 0, void 0, function* () {
          if (self === top) {
            return yield func(...args);
          }
          const res = yield new Promise((resolve, reject) => {
            try {
              exports3.cors.emit(event_name, args, (val) => {
                resolve(val);
              });
            } catch (e) {
              reject(e);
            }
          });
          return res;
        });
      }
    }
    exports3.CorsEventEmitter = CorsEventEmitter;
    if (typeof GM_listValues !== "undefined" && self === top) {
      window.onload = () => {
        store_12.$store.list().forEach((key) => {
          if (/_temp_.event.[0-9a-z]{32}.(state|return|arguments)/.test(key)) {
            store_12.$store.delete(key);
          }
          if (/_top_function_.*/.test(key)) {
            store_12.$store.delete(key);
          }
          if (/[0-9a-z]{32}.cors.events/.test(key)) {
            store_12.$store.delete(key);
          }
        });
      };
    }
    exports3.cors = new CorsEventEmitter();
    function getFuncId(fn) {
      if (typeof fn !== "function") {
        throw new Error("first argument in defineTopFunction() is not Function!");
      }
      const str = fn.toString();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36).padStart(16, "0").slice(-16);
    }
  })(cors);
  var project = {};
  Object.defineProperty(project, "__esModule", { value: true });
  project.Project = void 0;
  class Project {
    constructor({ name, domains, scripts }) {
      this.name = name;
      this.domains = domains;
      for (const key in scripts) {
        if (Object.prototype.hasOwnProperty.call(scripts, key)) {
          const element = scripts[key];
          element.projectName = name;
        }
      }
      this.scripts = scripts;
    }
    static create(opts) {
      return new Project(opts);
    }
  }
  project.Project = Project;
  var script = {};
  var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(script, "__esModule", { value: true });
  script.Script = script.BaseScript = void 0;
  const common_1$3 = common;
  const store_1$1 = store;
  const common_2 = common$1;
  const events_1 = __importDefault$1(events.exports);
  class BaseScript extends common_2.CommonEventEmitter {
  }
  script.BaseScript = BaseScript;
  class Script extends BaseScript {
    get configs() {
      if (!this._resolvedConfigs) {
        this._resolvedConfigs = typeof this._configs === "function" ? this._configs() : this._configs;
      }
      return this._resolvedConfigs;
    }
    set configs(c) {
      this._configs = c;
    }
    constructor({ name, namespace, matches, excludes, configs, hideInPanel, onstart, onactive, oncomplete, onbeforeunload, onrender, onhistorychange, onhistorychanged, methods, priority }) {
      super();
      this.excludes = [];
      this.cfg = {};
      this.methods = /* @__PURE__ */ Object.create({});
      this.event = new events_1.default();
      this.name = name;
      this.namespace = namespace;
      this.matches = matches;
      this.excludes = excludes;
      this._configs = configs;
      this.hideInPanel = hideInPanel;
      this.onstart = this.errorHandler(onstart);
      this.onactive = this.errorHandler(onactive);
      this.oncomplete = this.errorHandler(oncomplete);
      this.onbeforeunload = this.errorHandler(onbeforeunload);
      this.onrender = this.errorHandler(onrender);
      this.onhistorychange = this.errorHandler(onhistorychange);
      this.onhistorychanged = this.errorHandler(onhistorychanged);
      this.methods = (methods === null || methods === void 0 ? void 0 : methods.bind(this)()) || /* @__PURE__ */ Object.create({});
      this.priority = priority !== null && priority !== void 0 ? priority : 0;
      if (this.methods) {
        for (const key in methods) {
          if (Reflect.has(this.methods, key) && typeof this.methods[key] !== "function") {
            Reflect.set(this.methods, key, this.errorHandler(this.methods[key]));
          }
        }
      }
    }
    onConfigChange(key, handler) {
      const _key = common_1$3.$.namespaceKey(this.namespace, key.toString());
      return store_1$1.$store.addChangeListener(_key, (curr, pre, remote) => {
        handler(curr, pre, !!remote);
      });
    }
    offConfigChange(listener) {
      store_1$1.$store.removeChangeListener(listener);
    }
    fullName() {
      return this.projectName ? `${this.projectName}-${this.name}` : this.name;
    }
    errorHandler(func) {
      return (...args) => {
        try {
          return func === null || func === void 0 ? void 0 : func.apply(this, args);
        } catch (err) {
          console.error(err);
          if (err instanceof Error) {
            this.emit("scripterror", err.message);
          } else {
            this.emit("scripterror", String(err));
          }
        }
      };
    }
  }
  script.Script = Script;
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    __exportStar(common$1, exports3);
    __exportStar(config$1, exports3);
    __exportStar(cors, exports3);
    __exportStar(project, exports3);
    __exportStar(script, exports3);
    __exportStar(store_provider, exports3);
  })(interfaces);
  var elements = {};
  var config = {};
  var _interface = {};
  Object.defineProperty(_interface, "__esModule", { value: true });
  _interface.IElement = void 0;
  class IElement extends HTMLElement {
    connectedCallback() {
    }
    disconnectedCallback() {
    }
    adoptedCallback() {
    }
    attributeChangedCallback(name, oldValue, newValue) {
    }
  }
  _interface.IElement = IElement;
  Object.defineProperty(config, "__esModule", { value: true });
  config.ConfigElement = void 0;
  const ui_1$1 = ui;
  const dom_1$5 = dom;
  const interface_1$6 = _interface;
  class ConfigElement extends interface_1$6.IElement {
    constructor(store2) {
      super();
      this.label = (0, dom_1$5.h)("label");
      this.wrapper = (0, dom_1$5.h)("div", { className: "config-wrapper" });
      this.key = "";
      this.store = store2;
    }
    get value() {
      return this.store.get(this.key, this.defaultValue);
    }
    set value(value) {
      this.provider.value = value;
      this.store.set(this.key, value);
    }
    connectedCallback() {
      var _a, _b, _c;
      switch (this.tag) {
        case "select": {
          this.provider = (0, dom_1$5.h)("select");
          const value = this.store.get(this.key, this.defaultValue);
          for (const item of this.options || []) {
            const option = ui_1$1.$ui.tooltip((0, dom_1$5.h)("option"));
            if (Array.isArray(item)) {
              option.value = item[0];
              option.textContent = (_a = item[1]) !== null && _a !== void 0 ? _a : item[0];
              if (item[2]) {
                option.title = item[2];
              }
              if (String(item[0]) === String(value)) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            } else {
              option.value = item.value;
              option.textContent = (_b = item.label) !== null && _b !== void 0 ? _b : item.value;
              if (item.title) {
                option.title = item.title;
              }
              if (String(item.value) === String(value)) {
                option.selected = true;
                option.toggleAttribute("selected");
              }
              this.provider.add(option);
            }
          }
          this.provider.onchange = () => {
            this.store.set(this.key, this.provider.value);
          };
          break;
        }
        case "textarea": {
          this.provider = (0, dom_1$5.h)("textarea");
          this.provider.value = this.store.get(this.key, this.defaultValue);
          this.provider.onchange = () => {
            this.store.set(this.key, this.provider.value);
          };
          break;
        }
        default: {
          this.provider = (0, dom_1$5.h)("input");
          if (["checkbox", "radio"].some((t) => {
            var _a2;
            return t === ((_a2 = this.attrs) === null || _a2 === void 0 ? void 0 : _a2.type);
          })) {
            this.provider.checked = this.store.get(this.key, this.defaultValue);
            const provider = this.provider;
            provider.onchange = () => {
              this.store.set(this.key, provider.checked);
            };
          } else {
            this.provider.value = this.store.get(this.key, this.defaultValue);
            this.provider.setAttribute("value", this.provider.value);
            this.provider.onchange = () => {
              const { min, max, type } = this.attrs || {};
              if (type === "number") {
                if (this.provider.value.trim() === "") {
                  this.provider.value = this.defaultValue;
                  this.store.set(this.key, this.defaultValue);
                  return;
                }
                const val = parseFloat(this.provider.value);
                const _min = min ? parseFloat(min) : void 0;
                const _max = max ? parseFloat(max) : void 0;
                if (_min && val < _min) {
                  this.provider.value = _min.toString();
                  this.store.set(this.key, parseFloat(this.provider.value));
                } else if (_max && val > _max) {
                  this.provider.value = _max.toString();
                  this.store.set(this.key, parseFloat(this.provider.value));
                } else {
                  this.store.set(this.key, val);
                }
              } else {
                this.store.set(this.key, this.provider.value);
              }
            };
          }
          break;
        }
      }
      if (this.enableForAttribute) {
        this.provider.setAttribute("id", this.key);
        this.label.setAttribute("for", this.key);
      }
      if (this.labelClassName) {
        this.label.className = this.labelClassName;
      }
      if (this.providerClassName) {
        this.provider.className = this.providerClassName;
      }
      if (this.elementClassName) {
        this.className = this.elementClassName;
      }
      this.wrapper.replaceChildren(this.provider);
      this.append(this.label, this.wrapper);
      for (const key in this.attrs) {
        if (key === "style") {
          Object.assign(this.provider.style, this.attrs[key]);
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(this.attrs, key)) {
          Reflect.set(this.provider, key, Reflect.get(this.attrs, key));
        }
      }
      if (this.sync) {
        this.store.addChangeListener(this.key, (curr) => {
          this.provider.value = curr;
        });
      }
      ui_1$1.$ui.tooltip(this.provider);
      if (this.showIf) {
        let show_if = false;
        if (Array.isArray(this.showIf)) {
          if (typeof this.showIf[0] !== "string") {
            throw new Error("EUS Config.showIf first element must be a string");
          }
          const val = this.store.get(this.showIf[0], false) || false;
          const res = this.showIf[1].call(null, val, val, this.store);
          show_if = Boolean(res);
        } else {
          show_if = this.store.get(this.showIf, false) || false;
        }
        if (show_if) {
          this.style.display = "";
        } else {
          this.style.display = "none";
        }
        if (Array.isArray(this.showIf)) {
          if (typeof this.showIf[1] !== "function") {
            throw new Error("EUS Config.showIf second element must be a function");
          }
          this.store.addChangeListener(this.showIf[0], (curr, pre) => {
            if (this.isConnected) {
              if (this.showIf && Array.isArray(this.showIf)) {
                const res = this.showIf[1].call(null, curr, pre, this.store);
                if (res) {
                  this.style.display = "";
                } else {
                  this.style.display = "none";
                }
              }
            }
          });
        } else {
          this.store.addChangeListener(this.showIf, (curr) => {
            if (this.isConnected) {
              const res = Boolean(curr);
              if (res) {
                this.style.display = "";
              } else {
                this.style.display = "none";
              }
            }
          });
        }
      }
      (_c = this._onload) === null || _c === void 0 ? void 0 : _c.call(this.provider, this);
    }
  }
  config.ConfigElement = ConfigElement;
  var container = {};
  Object.defineProperty(container, "__esModule", { value: true });
  container.ContainerElement = void 0;
  const common_1$2 = common;
  const ui_1 = ui;
  const dom_1$4 = dom;
  const interface_1$5 = _interface;
  class ContainerElement extends interface_1$5.IElement {
    constructor() {
      super(...arguments);
      this.header = ui_1.$ui.tooltip((0, dom_1$4.h)("header-element", { title: "菜单栏-可拖动区域" }));
      this.body = (0, dom_1$4.h)("div", { className: "body", clientHeight: window.innerHeight / 2 });
      this.footer = (0, dom_1$4.h)("div", { className: "footer" });
    }
    connectedCallback() {
      this.append(this.header, this.body, this.footer);
      common_1$2.$.onresize(this, (cont) => {
        cont.body.style.maxHeight = window.innerHeight - this.header.clientHeight - 100 + "px";
        cont.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  container.ContainerElement = ContainerElement;
  var dropdown = {};
  Object.defineProperty(dropdown, "__esModule", { value: true });
  dropdown.DropdownElement = void 0;
  const interface_1$4 = _interface;
  const dom_1$3 = dom;
  class DropdownElement extends interface_1$4.IElement {
    constructor() {
      super(...arguments);
      this.triggerElement = (0, dom_1$3.h)("button");
      this.content = (0, dom_1$3.h)("div", { className: "dropdown-content" });
      this.trigger = "hover";
    }
    connectedCallback() {
      this.append(this.triggerElement, this.content);
      this.classList.add("dropdown");
      if (this.trigger === "click") {
        this.triggerElement.onclick = () => {
          this.content.classList.toggle("show");
        };
      } else {
        this.triggerElement.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.triggerElement.onmouseout = () => {
          this.content.classList.remove("show");
        };
        this.content.onmouseover = () => {
          this.content.classList.add("show");
        };
        this.content.onmouseout = () => {
          this.content.classList.remove("show");
        };
      }
      this.content.onclick = () => {
        this.content.classList.remove("show");
      };
    }
  }
  dropdown.DropdownElement = DropdownElement;
  var header = {};
  Object.defineProperty(header, "__esModule", { value: true });
  header.HeaderElement = void 0;
  const interface_1$3 = _interface;
  class HeaderElement extends interface_1$3.IElement {
    connectedCallback() {
      this.append(this.visualSwitcher || "");
    }
  }
  header.HeaderElement = HeaderElement;
  var message = {};
  Object.defineProperty(message, "__esModule", { value: true });
  message.MessageElement = void 0;
  const dom_1$2 = dom;
  const interface_1$2 = _interface;
  class MessageElement extends interface_1$2.IElement {
    constructor() {
      super(...arguments);
      this.closer = (0, dom_1$2.h)("span", { className: "message-closer" }, "x");
      this.contentContainer = (0, dom_1$2.h)("span", { className: "message-content-container" });
      this.type = "info";
      this.content = "";
      this.closeable = true;
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      if (typeof this.content === "string") {
        this.contentContainer.innerHTML = this.content;
      } else {
        this.contentContainer.append(this.content);
      }
      this.duration = Math.max((_a = this.duration) !== null && _a !== void 0 ? _a : 5, 0);
      this.append(this.contentContainer);
      if (this.closeable) {
        this.append(this.closer);
        this.closer.addEventListener("click", () => {
          var _a2;
          (_a2 = this.onClose) === null || _a2 === void 0 ? void 0 : _a2.call(this);
          this.remove();
        });
      }
      if (this.duration) {
        setTimeout(() => {
          var _a2;
          (_a2 = this.onClose) === null || _a2 === void 0 ? void 0 : _a2.call(this);
          this.remove();
        }, this.duration * 1e3);
      }
    }
  }
  message.MessageElement = MessageElement;
  var modal$1 = {};
  var __awaiter$2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(modal$1, "__esModule", { value: true });
  modal$1.ModalElement = void 0;
  const common_1$1 = common;
  const dom_1$1 = dom;
  const tampermonkey_1 = tampermonkey;
  const interface_1$1 = _interface;
  class ModalElement extends interface_1$1.IElement {
    constructor() {
      super(...arguments);
      this._title = (0, dom_1$1.h)("div", { className: "modal-title" });
      this.body = (0, dom_1$1.h)("div", { className: "modal-body" });
      this.footerContainer = (0, dom_1$1.h)("div", { className: "modal-footer" });
      this.modalInput = (0, dom_1$1.h)("input", { className: "modal-input" });
      this.modalInputType = "input";
      this.type = "alert";
      this.content = "";
      this.inputDefaultValue = "";
      this.placeholder = "";
      this.modalStyle = {};
    }
    connectedCallback() {
      var _a;
      this.classList.add(this.type);
      Object.assign(this.style, this.modalStyle || {});
      const profile = (0, dom_1$1.h)("div", {
        innerText: this.profile || "弹窗来自: OCS " + (((_a = tampermonkey_1.$gm.getInfos()) === null || _a === void 0 ? void 0 : _a.script.version) || ""),
        className: "modal-profile"
      });
      this._title.innerText = this.title;
      this.body.append(typeof this.content === "string" ? (0, dom_1$1.h)("div", { innerHTML: this.content }) : this.content);
      if (this.modalInputType === "textarea") {
        this.modalInput = (0, dom_1$1.h)("textarea", { className: "modal-input", style: { height: "100px" } });
      }
      this.modalInput.placeholder = this.placeholder || "";
      this.modalInput.value = this.inputDefaultValue || "";
      this.append(profile, this._title, this.body, this.footerContainer);
      this.style.width = (this.width || 400) + "px";
      if (this.footer === void 0) {
        this.footerContainer.append(this.modalInput);
        if (this.cancelButton === void 0) {
          this.cancelButton = (0, dom_1$1.h)("button", { className: "modal-cancel-button" });
          this.cancelButton.innerText = this.cancelButtonText || "取消";
          this.cancelButton.onclick = () => {
            var _a2, _b;
            (_a2 = this.onCancel) === null || _a2 === void 0 ? void 0 : _a2.call(this);
            (_b = this.onClose) === null || _b === void 0 ? void 0 : _b.call(this);
            this.remove();
          };
        }
        if (this.confirmButton === void 0) {
          this.confirmButton = (0, dom_1$1.h)("button", { className: "modal-confirm-button" });
          this.confirmButton.innerText = this.confirmButtonText || "确定";
          this.confirmButton.onclick = () => __awaiter$2(this, void 0, void 0, function* () {
            var _b, _c;
            if ((yield (_b = this.onConfirm) === null || _b === void 0 ? void 0 : _b.call(this, this.modalInput.value)) !== false) {
              this.remove();
              (_c = this.onClose) === null || _c === void 0 ? void 0 : _c.call(this, this.modalInput.value);
            }
          });
        }
        this.cancelButton && this.footerContainer.append(this.cancelButton);
        this.confirmButton && this.footerContainer.append(this.confirmButton);
        if (this.type === "simple") {
          this.footerContainer.remove();
        } else if (this.type === "prompt") {
          this.modalInput.focus();
        }
      } else {
        this.footerContainer.append(this.footer);
      }
      common_1$1.$.onresize(this.body, (modal2) => {
        this.body.style.maxHeight = window.innerHeight - 100 + "px";
        this.body.style.maxWidth = window.innerWidth - 50 + "px";
      });
    }
  }
  modal$1.ModalElement = ModalElement;
  var script_panel = {};
  Object.defineProperty(script_panel, "__esModule", { value: true });
  script_panel.ScriptPanelElement = void 0;
  const dom_1 = dom;
  const interface_1 = _interface;
  class ScriptPanelElement extends interface_1.IElement {
    constructor() {
      super(...arguments);
      this.separator = (0, dom_1.h)("div", { className: "separator" });
      this.notesContainer = (0, dom_1.h)("div", { className: "notes card" });
      this.configsContainer = (0, dom_1.h)("div", { className: "configs-container card" });
      this.body = (0, dom_1.h)("div", { className: "script-panel-body" });
      this.lockWrapper = (0, dom_1.h)("div", { className: "lock-wrapper" });
    }
    connectedCallback() {
      this.separator.innerText = this.name || "";
      this.append(this.separator);
      this.append(this.notesContainer);
      this.append(this.configsContainer);
      this.append(this.body);
    }
  }
  script_panel.ScriptPanelElement = ScriptPanelElement;
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.definedCustomElements = exports3.ScriptPanelElement = exports3.ModalElement = exports3.MessageElement = exports3.HeaderElement = exports3.ContainerElement = exports3.ConfigElement = void 0;
    const config_1 = config;
    const container_1 = container;
    const dropdown_1 = dropdown;
    const header_1 = header;
    const message_1 = message;
    const modal_1 = modal$1;
    const script_panel_1 = script_panel;
    var config_2 = config;
    Object.defineProperty(exports3, "ConfigElement", { enumerable: true, get: function() {
      return config_2.ConfigElement;
    } });
    var container_2 = container;
    Object.defineProperty(exports3, "ContainerElement", { enumerable: true, get: function() {
      return container_2.ContainerElement;
    } });
    var header_2 = header;
    Object.defineProperty(exports3, "HeaderElement", { enumerable: true, get: function() {
      return header_2.HeaderElement;
    } });
    var message_2 = message;
    Object.defineProperty(exports3, "MessageElement", { enumerable: true, get: function() {
      return message_2.MessageElement;
    } });
    var modal_2 = modal$1;
    Object.defineProperty(exports3, "ModalElement", { enumerable: true, get: function() {
      return modal_2.ModalElement;
    } });
    var script_panel_2 = script_panel;
    Object.defineProperty(exports3, "ScriptPanelElement", { enumerable: true, get: function() {
      return script_panel_2.ScriptPanelElement;
    } });
    exports3.definedCustomElements = [
      config_1.ConfigElement,
      container_1.ContainerElement,
      header_1.HeaderElement,
      modal_1.ModalElement,
      message_1.MessageElement,
      script_panel_1.ScriptPanelElement,
      dropdown_1.DropdownElement
    ];
  })(elements);
  var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __rest = commonjsGlobal && commonjsGlobal.__rest || function(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
  Object.defineProperty(customWindow, "__esModule", { value: true });
  customWindow.modal = customWindow.CustomWindow = void 0;
  const _1 = interfaces;
  const elements_1$1 = elements;
  const utils_1 = utils;
  const start_1 = start$1;
  const minimizeSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>';
  const expandSvg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/></svg>';
  class CustomWindow {
    constructor(projects, inputStoreProvider, config2) {
      this.messageContainer = (0, utils_1.h)("div", { className: "message-container" });
      this.extraMenuBar = (0, utils_1.h)("div", { className: "extra-menu-bar" });
      this.defaults = {
        urls: (urls) => urls && urls.length ? urls : [location.href],
        panelName: (name) => name || this.config.render.defaultPanelName || ""
      };
      this.projects = projects;
      this.inputStoreProvider = inputStoreProvider;
      this.config = config2;
      handleLowLevelBrowser();
      utils_1.$.loadCustomElements(elements_1$1.definedCustomElements);
      this.wrapper = (0, utils_1.h)("div");
      utils_1.$elements.tooltipContainer = (0, utils_1.h)("div", { className: "tooltip-container" });
      utils_1.$elements.wrapper = this.wrapper;
      this.root = this.wrapper.attachShadow({ mode: "closed" });
      utils_1.$elements.root = this.root;
      this.container = (0, utils_1.h)("container-element");
      this.root.append(this.container);
      const styles = config2.render.styles.map((s) => (0, utils_1.h)("style", s));
      this.container.append(...styles, this.messageContainer);
      const handlePosition = () => {
        const pos = config2.store.getPosition();
        if (pos.x > document.documentElement.clientWidth || pos.x < 0) {
          config2.store.setPosition(10, 10);
        }
        if (pos.y > document.documentElement.clientHeight || pos.y < 0) {
          config2.store.setPosition(10, 10);
        }
        this.container.style.left = pos.x + "px";
        this.container.style.top = pos.y + "px";
        const positionHandler = () => {
          config2.store.setPosition(this.container.offsetLeft, this.container.offsetTop);
        };
        (0, utils_1.enableElementDraggable)(this.container.header, this.container, positionHandler);
        (0, utils_1.enableElementTouchDraggable)(this.container.header, this.container, positionHandler);
      };
      const handleVisible = () => {
        window.addEventListener("click", (e) => {
          if (e.detail === Math.max(config2.render.switchPoint, 3)) {
            this.container.style.top = e.y + "px";
            this.container.style.left = e.x + "px";
            config2.store.setPosition(e.x, e.y);
            this.setVisual("normal");
          }
        });
      };
      const initCorsModalSystem = () => {
        _1.cors.on("modal", (args) => __awaiter$1(this, void 0, void 0, function* () {
          const [type, _attrs] = args || [];
          return new Promise((resolve, reject) => {
            const attrs = _attrs;
            attrs.onCancel = () => resolve("");
            attrs.onConfirm = resolve;
            attrs.onClose = resolve;
            modal(type, attrs);
          });
        }));
      };
      const initCorsMessageSystem = () => {
        _1.cors.on("message", (args) => __awaiter$1(this, void 0, void 0, function* () {
          const [type, attrs] = args || [];
          console.log("message", type, attrs);
          this.message(type, attrs);
        }));
      };
      window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === config2.render.switchKey) {
          e.stopPropagation();
          e.preventDefault();
          this.setVisual(config2.store.getVisual() === "hidden" ? "normal" : "hidden");
        }
      }, { capture: true });
      handleVisible();
      this.setVisual(config2.store.getVisual());
      (() => __awaiter$1(this, void 0, void 0, function* () {
        const urls = yield config2.store.getRenderURLs();
        const currentPanelName = yield config2.store.getCurrentPanelName();
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      }))();
      initCorsModalSystem();
      initCorsMessageSystem();
      handlePosition();
      this.setFontSize(config2.render.fontsize);
    }
    rerender(urls, currentPanelName) {
      return __awaiter$1(this, void 0, void 0, function* () {
        this.initHeader(urls, currentPanelName);
        yield this.renderBody(currentPanelName);
      });
    }
    initHeader(urls, currentPanelName) {
      const profile = utils_1.$ui.tooltip((0, utils_1.h)("div", { className: "profile", title: "菜单栏（可拖动区域）" }, this.config.render.title || "无标题"));
      const scriptDropdowns = [];
      for (const project2 of this.projects) {
        const dropdown2 = (0, utils_1.h)("dropdown-element");
        let selected = false;
        const options = [];
        const scripts = utils_1.$.getMatchedScripts([project2], urls).filter((s) => !s.hideInPanel);
        if (scripts.length) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              if (!script2.hideInPanel) {
                const optionSelected = isCurrentPanel(project2.name, script2, currentPanelName);
                const option = (0, utils_1.h)("div", { className: "dropdown-option" }, script2.name);
                if (optionSelected) {
                  option.classList.add("active");
                }
                if (selected !== true && optionSelected) {
                  selected = true;
                }
                option.onclick = () => __awaiter$1(this, void 0, void 0, function* () {
                  yield this.config.store.setCurrentPanelName(project2.name + "-" + script2.name);
                });
                options.push(option);
              }
            }
          }
          if (selected) {
            dropdown2.classList.add("active");
          }
          dropdown2.triggerElement = (0, utils_1.h)("div", { className: "dropdown-trigger-element" }, project2.name);
          dropdown2.triggerElement.style.padding = "0px 8px";
          dropdown2.content.append(...options);
          scriptDropdowns.push(dropdown2);
        }
      }
      const isMinimize = () => this.config.store.getVisual() === "minimize";
      const visualSwitcher = utils_1.$ui.tooltip((0, utils_1.h)("div", {
        className: "switch ",
        title: isMinimize() ? "点击展开窗口" : "点击最小化窗口",
        innerHTML: isMinimize() ? expandSvg : minimizeSvg,
        onclick: () => {
          this.setVisual(isMinimize() ? "normal" : "minimize");
          visualSwitcher.title = isMinimize() ? "点击展开窗口" : "点击最小化窗口";
          visualSwitcher.innerHTML = isMinimize() ? expandSvg : minimizeSvg;
        }
      }));
      this.container.header.visualSwitcher = visualSwitcher;
      this.container.header.replaceChildren();
      this.container.header.append((0, utils_1.h)("div", { style: { width: "100%" } }, [
        (0, utils_1.h)("div", { style: { display: "flex", width: "100%" } }, [
          profile,
          ...scriptDropdowns,
          this.container.header.visualSwitcher || ""
        ]),
        (0, utils_1.h)("div", { style: { display: "flex", width: "100%" } }, [this.extraMenuBar])
      ]));
    }
    renderBody(currentPanelName) {
      var _a;
      return __awaiter$1(this, void 0, void 0, function* () {
        for (const project2 of this.projects) {
          for (const key in project2.scripts) {
            if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
              const script2 = project2.scripts[key];
              if (isCurrentPanel(project2.name, script2, currentPanelName)) {
                const panel = utils_1.$ui.scriptPanel(script2, this.inputStoreProvider);
                script2.projectName = project2.name;
                script2.panel = panel;
                script2.header = this.container.header;
                utils_1.$elements.currentScriptPanel = panel;
                this.container.body.replaceChildren(panel);
                (_a = script2.onrender) === null || _a === void 0 ? void 0 : _a.call(script2, { panel, header: this.container.header });
                script2.emit("render", { panel, header: this.container.header });
              }
            }
          }
        }
      });
    }
    setFontSize(fontsize) {
      this.container.style.font = `${fontsize}px  Menlo, Monaco, Consolas, 'Courier New', monospace`;
    }
    setVisual(value) {
      this.container.className = "";
      if (value === "minimize") {
        this.container.classList.add("minimize");
      } else if (value === "hidden") {
        this.container.classList.add("hidden");
      } else {
        this.container.classList.add("normal");
      }
      this.config.store.setVisual(value);
    }
    changeRenderURLs(urls) {
      return __awaiter$1(this, void 0, void 0, function* () {
        const currentPanelName = yield this.config.store.getCurrentPanelName();
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      });
    }
    changePanel(currentPanelName) {
      return __awaiter$1(this, void 0, void 0, function* () {
        const urls = (yield this.config.store.getRenderURLs()) || [location.href];
        yield this.rerender(this.defaults.urls(urls), this.defaults.panelName(currentPanelName));
      });
    }
    pin(script2) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (script2.projectName) {
          yield this.config.store.setCurrentPanelName(`${script2.projectName}-${script2.name}`);
        } else if (script2.namespace) {
          yield this.config.store.setCurrentPanelName(script2.namespace);
        } else {
          console.warn("[ERROR]", `${script2.name} 无法置顶， projectName 与 namespace 都为 undefined`);
        }
      });
    }
    minimize() {
      this.setVisual("minimize");
    }
    normal() {
      this.setVisual("normal");
    }
    hidden() {
      this.setVisual("hidden");
    }
    message(type, attrs) {
      if (typeof attrs === "string") {
        attrs = { content: attrs };
      }
      const message2 = (0, utils_1.h)("message-element", Object.assign({ type }, attrs));
      this.messageContainer.append(message2);
      return message2;
    }
    menu(label, config2) {
      return __awaiter$1(this, void 0, void 0, function* () {
        this.extraMenuBar.style.display = "flex";
        const btn = (0, utils_1.h)("button", label);
        btn.addEventListener("click", () => {
          if (config2.scriptPanelLink) {
            this.pin(config2.scriptPanelLink).then(() => {
              this.normal();
            }).catch(console.error);
          }
        });
        if (config2.scriptPanelLink) {
          const full_name = (config2.scriptPanelLink.projectName ? config2.scriptPanelLink.projectName + " -> " : "") + config2.scriptPanelLink.name;
          btn.title = "快捷跳转：" + full_name;
          btn.setAttribute("data-name", (config2.scriptPanelLink.projectName + "-" + config2.scriptPanelLink.name).replace(/\s/g, "_"));
          btn.classList.add("script-panel-link");
        }
        this.extraMenuBar.append(utils_1.$ui.tooltip(btn));
        const name = yield utils_1.$store.getTab(utils_1.$const.TAB_CURRENT_PANEL_NAME);
        if (config2.scriptPanelLink) {
          if (isCurrentPanel(config2.scriptPanelLink.projectName, config2.scriptPanelLink, name)) {
            this.extraMenuBar.querySelectorAll(".script-panel-link").forEach((el) => el.classList.remove("active"));
            btn.classList.add("active");
          }
        }
        return btn;
      });
    }
    mount(parent) {
      parent.children[utils_1.$.random(0, parent.children.length - 1)].after(this.wrapper);
    }
  }
  customWindow.CustomWindow = CustomWindow;
  function isCurrentPanel(projectName, script2, currentPanelName) {
    return projectName + "-" + script2.name === currentPanelName || script2.namespace === currentPanelName;
  }
  function handleLowLevelBrowser() {
    if (typeof Element.prototype.replaceChildren === "undefined") {
      Element.prototype.replaceChildren = function(...nodes) {
        this.innerHTML = "";
        for (const node of nodes) {
          this.append(node);
        }
      };
    }
  }
  function modal(type, attrs, parent = (start_1.$win === null || start_1.$win === void 0 ? void 0 : start_1.$win.container) || utils_1.$elements.root || document.body) {
    const { maskCloseable = true, onConfirm, onCancel, onClose, notification: notify, notificationOptions, duration } = attrs, _attrs = __rest(attrs, ["maskCloseable", "onConfirm", "onCancel", "onClose", "notification", "notificationOptions", "duration"]);
    if (notify) {
      utils_1.$gm.notification(typeof _attrs.content === "string" ? _attrs.content : _attrs.content.textContent || "", notificationOptions);
    }
    const wrapper = (0, utils_1.h)("div", { className: "modal-wrapper" }, (wrapper2) => {
      const modal2 = (0, utils_1.h)("modal-element", Object.assign({
        onConfirm(val) {
          return __awaiter$1(this, void 0, void 0, function* () {
            const isClose = yield onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm.apply(modal2, [val]);
            if (isClose !== false) {
              wrapper2.remove();
            }
            return isClose;
          });
        },
        onCancel() {
          onCancel === null || onCancel === void 0 ? void 0 : onCancel.apply(modal2);
          wrapper2.remove();
        },
        onClose(val) {
          onClose === null || onClose === void 0 ? void 0 : onClose.apply(modal2, [val]);
          wrapper2.remove();
        },
        type
      }, _attrs));
      wrapper2.append(modal2);
      modal2.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      if (maskCloseable) {
        wrapper2.addEventListener("click", () => {
          onClose === null || onClose === void 0 ? void 0 : onClose.apply(modal2);
          wrapper2.remove();
        });
      }
    });
    if (duration) {
      setTimeout(() => {
        wrapper.remove();
      }, duration * 1e3);
    }
    parent.append(wrapper);
    return wrapper;
  }
  customWindow.modal = modal;
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(start$1, "__esModule", { value: true });
  start$1.addFunctionEventListener = start$1.start = start$1.$win = void 0;
  const custom_window_1 = customWindow;
  const common_1 = common;
  const const_1 = _const;
  const elements_1 = elements$1;
  const store_1 = store;
  const debounce_1 = __importDefault(debounce_1$1);
  let mounted = false;
  function start(startConfig) {
    return __awaiter(this, void 0, void 0, function* () {
      startConfig.projects = startConfig.projects.map((p) => {
        for (const key in p.scripts) {
          if (Object.prototype.hasOwnProperty.call(p.scripts, key)) {
            p.scripts[key].cfg = common_1.$.createConfigProxy(p.scripts[key]);
          }
        }
        return p;
      });
      const scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
      scripts.forEach((script2) => {
        var _a;
        script2.startConfig = startConfig;
        script2.emit("start", startConfig);
        (_a = script2.onstart) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
      });
      const uid = yield store_1.$store.getTab(const_1.$const.TAB_UID);
      if (uid === void 0) {
        yield store_1.$store.setTab(const_1.$const.TAB_UID, common_1.$.uuid());
      }
      const urls = yield store_1.$store.getTab(const_1.$const.TAB_URLS);
      yield store_1.$store.setTab(const_1.$const.TAB_URLS, Array.from(new Set((urls || []).concat(location.href))));
      let active = false;
      if (document.readyState === "interactive") {
        active = true;
        mount(startConfig);
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      } else if (document.readyState === "complete") {
        mount(startConfig);
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
        scripts.forEach((script2) => {
          var _a;
          return (_a = script2.oncomplete) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      }
      document.addEventListener("readystatechange", () => {
        mount(startConfig);
        if (document.readyState === "interactive" && active === false) {
          scripts.forEach((script2) => {
            var _a;
            script2.emit("active", startConfig);
            (_a = script2.onactive) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
          });
        }
        if (document.readyState === "complete") {
          scripts.forEach((script2) => {
            var _a;
            script2.emit("complete");
            (_a = script2.oncomplete) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
          });
        }
      });
      window.addEventListener("hashchange", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("hashchange", startConfig);
          (_a = script2.onhashchange) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig);
        });
      });
      history.pushState = addFunctionEventListener(history, "pushState");
      history.replaceState = addFunctionEventListener(history, "replaceState");
      window.addEventListener("pushState", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("historychange", "push", startConfig);
          (_a = script2.onhistorychange) === null || _a === void 0 ? void 0 : _a.call(script2, "push", startConfig);
        });
        const new_scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
        new_scripts.forEach((ns) => {
          var _a;
          ns.emit("historychanged", "pushed", startConfig);
          (_a = ns.onhistorychanged) === null || _a === void 0 ? void 0 : _a.call(ns, "pushed", startConfig);
        });
      });
      window.addEventListener("replaceState", () => {
        scripts.forEach((script2) => {
          var _a;
          script2.emit("historychange", "replace", startConfig);
          (_a = script2.onhistorychange) === null || _a === void 0 ? void 0 : _a.call(script2, "replace", startConfig);
        });
        const new_scripts = common_1.$.getMatchedScripts(startConfig.projects, [location.href]).sort((a, b) => b.priority - a.priority);
        new_scripts.forEach((ns) => {
          var _a;
          ns.emit("historychanged", "replaced", startConfig);
          (_a = ns.onhistorychanged) === null || _a === void 0 ? void 0 : _a.call(ns, "replaced", startConfig);
        });
      });
      window.addEventListener("beforeunload", (e) => {
        var _a;
        let prevent;
        for (const script2 of scripts) {
          script2.emit("beforeunload");
          if ((_a = script2.onbeforeunload) === null || _a === void 0 ? void 0 : _a.call(script2, startConfig)) {
            prevent = true;
          }
        }
        if (prevent) {
          e.preventDefault();
          e.returnValue = true;
          return true;
        }
      });
    });
  }
  start$1.start = start;
  function addFunctionEventListener(obj, type) {
    const origin = obj[type];
    return function(...args) {
      const res = origin.apply(this, args);
      const e = new Event(type.toString());
      e.arguments = args;
      window.dispatchEvent(e);
      return res;
    };
  }
  start$1.addFunctionEventListener = addFunctionEventListener;
  function mount(startConfig) {
    return __awaiter(this, void 0, void 0, function* () {
      if (mounted === true) {
        return;
      }
      mounted = true;
      if (startConfig === void 0 || startConfig.renderConfig === void 0) {
        console.warn("the script will not have ui because the renderConfig is not defined.");
        return;
      }
      if (self === top) {
        const { projects, renderConfig } = startConfig;
        if (typeof renderConfig.renderScript === "undefined") {
          console.warn("the script will not have ui because the RenderScript is not defined.");
          return;
        }
        const scripts = common_1.$.getMatchedScripts(projects, [location.href]).filter((s) => !!s.hideInPanel === false);
        if (scripts.length <= 0) {
          return;
        }
        const RenderScript2 = renderConfig.renderScript;
        const win = new custom_window_1.CustomWindow(startConfig.projects, store_1.$store, {
          render: {
            title: renderConfig.title,
            styles: renderConfig.styles,
            defaultPanelName: renderConfig.defaultPanelName,
            fontsize: RenderScript2.cfg.fontsize,
            switchPoint: RenderScript2.cfg.switchPoint,
            switchKey: "o"
          },
          store: {
            getPosition: () => {
              return { x: RenderScript2.cfg.x, y: RenderScript2.cfg.y };
            },
            setPosition: (x, y) => {
              RenderScript2.cfg.x = x;
              RenderScript2.cfg.y = y;
            },
            getVisual: () => {
              return RenderScript2.cfg.visual;
            },
            setVisual: (size) => {
              RenderScript2.cfg.visual = size;
            },
            getRenderURLs() {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.getTab(const_1.$const.TAB_URLS);
              });
            },
            setRenderURLs(urls) {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.setTab(const_1.$const.TAB_URLS, urls);
              });
            },
            getCurrentPanelName() {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.getTab(const_1.$const.TAB_CURRENT_PANEL_NAME);
              });
            },
            setCurrentPanelName(name) {
              return __awaiter(this, void 0, void 0, function* () {
                return yield store_1.$store.setTab(const_1.$const.TAB_CURRENT_PANEL_NAME, name);
              });
            }
          }
        });
        RenderScript2.onConfigChange("fontsize", (fs) => {
          win.setFontSize(fs);
        });
        store_1.$store.addTabChangeListener(const_1.$const.TAB_URLS, (0, debounce_1.default)((curr, pre) => {
          if (JSON.stringify(curr) === JSON.stringify(pre)) {
            return;
          }
          win.changeRenderURLs(curr);
        }, 2e3));
        store_1.$store.addTabChangeListener(const_1.$const.TAB_CURRENT_PANEL_NAME, (curr, pre) => {
          if (curr === pre) {
            return;
          }
          win.changePanel(curr);
          updateMenusState(win, curr);
        });
        win.mount(startConfig.mountElement || document.body);
        elements_1.$elements.tooltipContainer && win.container.append(elements_1.$elements.tooltipContainer);
        start$1.$win = win;
      }
    });
  }
  function updateMenusState(win, name) {
    var _a;
    win.root.querySelectorAll(".extra-menu-bar .script-panel-link").forEach((el) => el.classList.remove("active"));
    (_a = win.root.querySelector('.extra-menu-bar [data-name="' + name.replace(/\s/g, "_") + '"]')) === null || _a === void 0 ? void 0 : _a.classList.add("active");
  }
  var render = {};
  (function(exports3) {
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.$menu = exports3.$message = exports3.$modal = exports3.createRenderScript = void 0;
    const script_1 = script;
    const ui_12 = ui;
    const dom_12 = dom;
    const custom_window_12 = customWindow;
    const start_12 = start$1;
    const interfaces_1 = interfaces;
    const createRenderScript = (config2) => new script_1.Script({
      name: (config2 === null || config2 === void 0 ? void 0 : config2.name) || "窗口设置",
      matches: (config2 === null || config2 === void 0 ? void 0 : config2.matches) || [["所有", /.*/]],
      namespace: "render.panel",
      configs: {
        notes: {
          defaultValue: ui_12.$ui.notes([
            [
              "如果需要隐藏整个窗口，可以点击下方隐藏按钮，",
              "隐藏后可以快速三击屏幕中的任意地方",
              "来重新在鼠标位置显示窗口。"
            ],
            "窗口连续点击显示的次数可以自定义，默认为三次",
            ["窗口快捷键列表：", "ctrl + o : 隐藏/打开 面板"]
          ]).outerHTML
        },
        x: { defaultValue: window.innerWidth * 0.1 },
        y: { defaultValue: window.innerWidth * 0.1 },
        visual: { defaultValue: "normal" },
        firstCloseAlert: {
          defaultValue: true
        },
        fontsize: {
          label: "字体大小（像素）",
          attrs: { type: "number", min: 12, max: 24, step: 1 },
          defaultValue: 14
        },
        switchPoint: {
          label: "窗口显示连点（次数）",
          attrs: {
            type: "number",
            min: 3,
            max: 10,
            step: 1,
            title: "设置当连续点击屏幕 N 次时，可以进行面板的 隐藏/显示 切换，默认连续点击屏幕三下"
          },
          defaultValue: 3
        }
      },
      methods() {
        return {
          pin: (script2) => start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.pin(script2),
          minimize: () => start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.minimize(),
          setPosition: (x, y) => {
            if (start_12.$win) {
              start_12.$win.config.store.setPosition(x, y);
              start_12.$win.container.style.left = x + "px";
              start_12.$win.container.style.top = y + "px";
            }
          },
          normal: () => {
            start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.normal();
          }
        };
      },
      onrender({ panel }) {
        const closeBtn = (0, dom_12.h)("button", { className: "base-style-button" }, "隐藏窗口");
        closeBtn.onclick = () => {
          if (this.cfg.firstCloseAlert) {
            exports3.$modal.confirm({
              content: ui_12.$ui.notes([
                "隐藏脚本页面后，快速点击页面三下（可以在悬浮窗设置中调整次数）即可重新显示脚本。如果三下无效，可以尝试删除脚本重新安装。",
                "请确认是否关闭。（此后不再显示此弹窗）"
              ]),
              onConfirm: () => {
                start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.hidden();
                this.cfg.firstCloseAlert = false;
              }
            });
          } else {
            start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.hidden();
          }
        };
        panel.body.replaceChildren((0, dom_12.h)("hr"), closeBtn);
      }
    });
    exports3.createRenderScript = createRenderScript;
    function _modal(type, attrs, parent) {
      if (self === top) {
        return (0, custom_window_12.modal)(type, attrs, parent);
      } else {
        interfaces_1.cors.emit("modal", [type, attrs], (args) => {
          var _a, _b, _c;
          if (args) {
            (_a = attrs.onConfirm) === null || _a === void 0 ? void 0 : _a.call(attrs, args);
          } else {
            (_b = attrs.onCancel) === null || _b === void 0 ? void 0 : _b.call(attrs);
          }
          (_c = attrs.onClose) === null || _c === void 0 ? void 0 : _c.call(attrs, args);
        });
      }
    }
    exports3.$modal = {
      confirm: (attrs, parent) => _modal("confirm", attrs, parent),
      alert: (attrs, parent) => _modal("alert", attrs, parent),
      prompt: (attrs, parent) => _modal("prompt", attrs, parent),
      simple: (attrs, parent) => _modal("simple", attrs, parent)
    };
    function _message(type, attrs) {
      if (self === top) {
        return start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.message(type, attrs);
      } else {
        if (typeof attrs === "string") {
          attrs = { content: attrs };
        } else if (typeof attrs.content !== "string") {
          attrs.content = attrs.content.innerHTML;
        }
        interfaces_1.cors.emit("message", [type, attrs]);
      }
    }
    exports3.$message = {
      info: (attrs) => _message("info", attrs),
      success: (attrs) => _message("success", attrs),
      warn: (attrs) => _message("warn", attrs),
      error: (attrs) => _message("error", attrs)
    };
    function $menu(label, config2) {
      if (self !== top) {
        return;
      }
      return start_12.$win === null || start_12.$win === void 0 ? void 0 : start_12.$win.menu(label, config2);
    }
    exports3.$menu = $menu;
  })(render);
  (function(exports3) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports4) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports4, p))
          __createBinding(exports4, m, p);
    };
    Object.defineProperty(exports3, "__esModule", { value: true });
    exports3.start = void 0;
    var start_12 = start$1;
    Object.defineProperty(exports3, "start", { enumerable: true, get: function() {
      return start_12.start;
    } });
    __exportStar(utils, exports3);
    __exportStar(render, exports3);
    __exportStar(elements, exports3);
    __exportStar(interfaces, exports3);
  })(lib);
  const RenderScript = lib.createRenderScript({
    name: "🖼️ 窗口设置"
  });
  let sharedStream;
  let pendingStream;
  function stopSharedStream() {
    if (sharedStream) {
      for (const track of sharedStream.getTracks()) {
        track.stop();
      }
      sharedStream = void 0;
    }
  }
  function isStreamActive(stream) {
    return !!stream && stream.getVideoTracks().some((track) => track.readyState === "live");
  }
  async function getDisplayStream() {
    if (isStreamActive(sharedStream)) {
      return sharedStream;
    }
    if (pendingStream) {
      return pendingStream;
    }
    stopSharedStream();
    const mediaDevices = navigator.mediaDevices;
    if (!(mediaDevices == null ? void 0 : mediaDevices.getDisplayMedia)) {
      throw new Error("当前浏览器不支持屏幕截图（getDisplayMedia）。");
    }
    pendingStream = (async () => {
      const stream = await mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
        video: {
          displaySurface: "browser"
        },
        audio: false
      });
      const [track] = stream.getVideoTracks();
      if (track) {
        track.addEventListener("ended", stopSharedStream);
      }
      sharedStream = stream;
      return stream;
    })();
    try {
      return await pendingStream;
    } finally {
      pendingStream = void 0;
    }
  }
  function withTimeout(promise, ms, message2) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message2)), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }
  async function grabFrame(stream) {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await withTimeout(
      new Promise((resolve, reject) => {
        video.addEventListener("loadedmetadata", () => resolve(), { once: true });
        video.addEventListener("error", () => reject(new Error("截图视频帧加载失败。")), { once: true });
      }),
      5e3,
      "截图加载超时，请重试。"
    );
    let played = true;
    try {
      await video.play();
    } catch (error) {
      played = false;
    }
    await withTimeout(
      new Promise((resolve) => {
        const anyVideo = video;
        if (played && typeof anyVideo.requestVideoFrameCallback === "function") {
          anyVideo.requestVideoFrameCallback(() => resolve());
        } else {
          requestAnimationFrame(() => resolve());
        }
      }),
      5e3,
      "截图取帧超时，请重试。"
    );
    return video;
  }
  async function captureViewportRect(rect) {
    if (rect.width < 1 || rect.height < 1) {
      throw new Error("框选区域太小，无法截图。");
    }
    const stream = await getDisplayStream();
    const video = await grabFrame(stream);
    try {
      const frameW = video.videoWidth;
      const frameH = video.videoHeight;
      if (!frameW || !frameH) {
        throw new Error("未能获取截图画面。");
      }
      const frameRatio = frameW / frameH;
      const viewRatio = window.innerWidth / window.innerHeight;
      if (Math.abs(frameRatio - viewRatio) > 0.1) {
        throw new Error("截图区域与页面不匹配，请在共享弹窗中选择“此标签页”后重试。");
      }
      const scaleX = frameW / window.innerWidth;
      const scaleY = frameH / window.innerHeight;
      const sx = Math.max(0, Math.round(rect.left * scaleX));
      const sy = Math.max(0, Math.round(rect.top * scaleY));
      const sw = Math.min(frameW - sx, Math.round(rect.width * scaleX));
      const sh = Math.min(frameH - sy, Math.round(rect.height * scaleY));
      if (sw < 1 || sh < 1) {
        throw new Error("框选区域超出可视范围，无法截图。");
      }
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("无法创建截图画布。");
      }
      context.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
      return canvas.toDataURL("image/jpeg", 0.92);
    } finally {
      video.pause();
      video.srcObject = null;
    }
  }
  function releaseCaptureStream() {
    stopSharedStream();
  }
  const $ = {
    uuid() {
      return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    },
    random(min, max) {
      return Math.round(Math.random() * (max - min)) + min;
    },
    async sleep(period) {
      return new Promise((resolve) => {
        setTimeout(resolve, period);
      });
    },
    isInBrowser() {
      return typeof window !== "undefined" && typeof window.document !== "undefined";
    },
    elementToRawObject(el) {
      return {
        innerText: el == null ? void 0 : el.innerText,
        innerHTML: el == null ? void 0 : el.innerHTML,
        textContent: el == null ? void 0 : el.textContent
      };
    },
    onresize(el, handler) {
      const resize = debounce_1$1(() => {
        if (el.parentNode === null) {
          window.removeEventListener("resize", resize);
        } else {
          handler(el);
        }
      }, 200);
      resize();
      window.addEventListener("resize", resize);
    },
    isInTopWindow() {
      return self === top;
    },
    createCenteredPopupWindow(url, winName, opts) {
      const { width, height, scrollbars, resizable } = opts;
      const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
      const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
      const settings = "height=" + height + ",width=" + width + ",top=" + TopPosition + ",left=" + LeftPosition + ",scrollbars=" + (scrollbars ? "yes" : "no") + ",resizable=" + (resizable ? "yes" : "no");
      return window.open(url, winName, settings);
    },
    transition: async (el, properties, duration_ms, val, options) => {
      return new Promise((resolve) => {
        const original_val = Reflect.get(el.style, properties) || "";
        el.style.transition = `${String(properties)} ${duration_ms}s ${(options == null ? void 0 : options.timing_function) || "ease-in-out"}`;
        Reflect.set(el.style, properties, val);
        el.addEventListener("transitionend", function handler() {
          el.removeEventListener("transitionend", handler);
          setTimeout(() => {
            Reflect.set(el.style, properties, original_val);
            setTimeout(() => {
              el.style.transition = "";
            }, duration_ms * 1e3);
          }, ((options == null ? void 0 : options.reset_ms) || 0) * 1e3);
          resolve();
        });
      });
    }
  };
  const $string = {
    humpToTarget(value, target) {
      return value.replace(/([A-Z])/g, target + "$1").toLowerCase().split(target).slice(1).join(target);
    }
  };
  class StringUtils {
    constructor(_text) {
      this._text = _text;
    }
    static nowrap(str, replace_str) {
      return (str == null ? void 0 : str.replace(/\n/g, replace_str)) || "";
    }
    nowrap(replace_str) {
      this._text = StringUtils.nowrap(this._text, replace_str);
      return this;
    }
    static nospace(str) {
      return (str == null ? void 0 : str.replace(/ +/g, " ")) || "";
    }
    nospace() {
      this._text = StringUtils.nospace(this._text);
      return this;
    }
    static noSpecialChar(str) {
      return (str == null ? void 0 : str.replace(/[^\w\s]/gi, "")) || "";
    }
    noSpecialChar() {
      this._text = StringUtils.noSpecialChar(this._text);
      return this;
    }
    static max(str, len) {
      return str.length > len ? str.substring(0, len) + "..." : str;
    }
    max(len) {
      this._text = StringUtils.max(this._text, len);
      return this;
    }
    static hide(str, start2, end, replacer = "*") {
      return str.substring(0, start2) + str.substring(start2, end).replace(/./g, replacer) + str.substring(end);
    }
    hide(start2, end, replacer = "*") {
      this._text = StringUtils.hide(this._text, start2, end, replacer);
      return this;
    }
    static of(text) {
      return new StringUtils(text);
    }
    toString() {
      return this._text;
    }
  }
  const $const = {
    TAB_UID: "_uid_",
    TAB_URLS: "_urls_",
    TAB_CURRENT_PANEL_NAME: "_current_panel_name_"
  };
  function domSearch(wrapper, root2 = window.document) {
    const obj = /* @__PURE__ */ Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
      const item = wrapper[key.toString()];
      Reflect.set(
        obj,
        key,
        typeof item === "string" ? root2.querySelector(item) : typeof item === "function" ? item(root2) : item.map((fun) => fun(root2))
      );
    });
    return obj;
  }
  function domSearchAll(wrapper, root2 = window.document) {
    const obj = /* @__PURE__ */ Object.create({});
    Reflect.ownKeys(wrapper).forEach((key) => {
      const item = wrapper[key.toString()];
      Reflect.set(
        obj,
        key,
        typeof item === "string" ? Array.from(root2.querySelectorAll(item)) : typeof item === "function" ? item(root2) : item.map((fun) => fun(root2))
      );
    });
    return obj;
  }
  var src = {
    compareTwoStrings,
    findBestMatch
  };
  function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");
    if (first === second)
      return 1;
    if (first.length < 2 || second.length < 2)
      return 0;
    let firstBigrams = /* @__PURE__ */ new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
      firstBigrams.set(bigram, count);
    }
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }
    return 2 * intersectionSize / (first.length + second.length - 2);
  }
  function findBestMatch(mainString, targetStrings) {
    if (!areArgsValid(mainString, targetStrings))
      throw new Error("Bad arguments: First argument should be a string, second should be an array of strings");
    const ratings = [];
    let bestMatchIndex = 0;
    for (let i = 0; i < targetStrings.length; i++) {
      const currentTargetString = targetStrings[i];
      const currentRating = compareTwoStrings(mainString, currentTargetString);
      ratings.push({ target: currentTargetString, rating: currentRating });
      if (currentRating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }
    const bestMatch = ratings[bestMatchIndex];
    return { ratings, bestMatch, bestMatchIndex };
  }
  function areArgsValid(mainString, targetStrings) {
    if (typeof mainString !== "string")
      return false;
    if (!Array.isArray(targetStrings))
      return false;
    if (!targetStrings.length)
      return false;
    if (targetStrings.find(function(s) {
      return typeof s !== "string";
    }))
      return false;
    return true;
  }
  function clearString(str, ...exclude) {
    exclude.push(...["①②③④⑤⑥⑦⑧⑨"]);
    return str.trim().toLocaleLowerCase().replace(RegExp(`[^\\u2E80-\\u9FFFA-Za-z0-9${exclude.join("")}]*`, "g"), "");
  }
  function answerSimilar(answers, options) {
    const _answers = answers.map(removeRedundant).map((a) => clearString(a));
    const _options = options.map(removeRedundant).map((o) => clearString(o));
    const similar = _answers.length !== 0 ? _options.map((option) => {
      if (option.trim() === "") {
        return { rating: 0, target: "" };
      }
      return src.findBestMatch(option, _answers).bestMatch;
    }) : _options.map(() => ({ rating: 0, target: "" }));
    return similar;
  }
  function answerExactMatch(answers, options) {
    const _answers = answers.map(removeRedundant);
    const _options = options.map(removeRedundant);
    const result = _answers.length !== 0 ? _options.filter((option) => {
      return _answers.find((answer) => answer.trim() === option.trim());
    }) : [];
    return result;
  }
  function removeRedundant(str) {
    return (str == null ? void 0 : str.trim().replace(/[A-Z]{1}[^A-Za-z0-9\u2E80-\u9FFF]+([A-Za-z0-9\u2E80-\u9FFF]+)/, "$1")) || "";
  }
  function request(url, opts) {
    return new Promise((resolve, reject) => {
      try {
        const { responseType = "json", method = "get", type = "fetch", data = {}, headers = {} } = opts || {};
        const env = $.isInBrowser() ? "browser" : "node";
        if (type === "GM_xmlhttpRequest" && env === "browser") {
          if (typeof GM_xmlhttpRequest !== "undefined") {
            const contentType = headers["Content-Type"] || headers["content-type"];
            const requestData = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(data).toString() : Object.keys(data).length ? JSON.stringify(data) : void 0;
            GM_xmlhttpRequest({
              url,
              method: method.toUpperCase(),
              data: requestData,
              headers: Object.keys(headers).length ? headers : void 0,
              responseType: responseType === "json" ? "json" : void 0,
              onload: (response) => {
                if (response.status === 200) {
                  if (responseType === "json") {
                    try {
                      resolve(JSON.parse(response.responseText));
                    } catch (error) {
                      reject(error);
                    }
                  } else {
                    resolve(response.responseText || "");
                  }
                } else {
                  reject(response.responseText);
                }
              },
              onerror: (err) => {
                console.error("GM_xmlhttpRequest error", err);
                reject(err);
              }
            });
          } else {
            reject(new Error("GM_xmlhttpRequest is not defined"));
          }
        } else {
          const fet = env === "node" ? require("node-fetch").default : fetch;
          fet(url, { body: method === "post" ? JSON.stringify(data) : void 0, method, headers }).then((response) => {
            if (responseType === "json") {
              response.json().then(resolve).catch(reject);
            } else {
              response.text().then(resolve).catch(reject);
            }
          }).catch((error) => {
            reject(new Error(error));
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  function defaultWorkTypeResolver(ctx) {
    function count(selector) {
      let c = 0;
      for (const option of ctx.elements.options || []) {
        if ((option == null ? void 0 : option.querySelector(selector)) !== null) {
          c++;
        }
      }
      return c;
    }
    return count('[type="radio"]') === 2 ? "judgement" : count('[type="radio"]') > 2 ? "single" : count('[type="checkbox"]') > 2 ? "multiple" : count("textarea") >= 1 ? "completion" : void 0;
  }
  function isPlainAnswer(answer) {
    answer = answer.trim();
    if (answer.length > 8 || !/[A-Z]/.test(answer)) {
      return false;
    }
    const counter = {};
    let min = 0;
    for (let i = 0; i < answer.length; i++) {
      if (answer.charCodeAt(i) < min) {
        return false;
      }
      min = answer.charCodeAt(i);
      counter[min] = (counter[min] || 0) + 1;
    }
    for (const key in counter) {
      if (counter[key] !== 1) {
        return false;
      }
    }
    return true;
  }
  function resolvePlainAnswer(answer) {
    const resolve = answer.trim().replace(/[,，、 #]/g, "").trim();
    if (isPlainAnswer(resolve)) {
      return resolve;
    }
  }
  function splitAnswer(answer, separators = ["===", "#", "---", "###", "|", ";", "；"]) {
    answer = answer.trim();
    if (answer.length === 0) {
      return [];
    }
    separators = separators.length === 0 ? ["===", "#", "---", "###", "|", ";", "；"] : separators;
    separators = separators.filter((el) => el.trim().length > 0);
    try {
      const json = JSON.parse(answer);
      if (Array.isArray(json)) {
        return json.map(String).filter((el) => el.trim().length > 0);
      }
    } catch {
      for (const sep of separators) {
        if (answer.split(sep).length > 1) {
          return answer.split(sep).filter((el) => el.trim().length > 0);
        }
      }
    }
    return [answer];
  }
  function parseAiAnswerContent(content) {
    const trimmed = content.trim();
    for (const candidate of createJsonCandidates(trimmed)) {
      const parsed = parseAiAnswerJson(candidate) || parseLooseAiAnswerJson(candidate);
      if (parsed) {
        return parsed;
      }
    }
    const answerMatch = trimmed.match(
      /(?:^|\n)\s*(?:答案|answer)\s*[:：]\s*([A-Ha-h]+(?![^\s#,，、])|正确|错误|对|错|是|否|.+?)(?:\n|$)/i
    );
    const explanationMatch = trimmed.match(/(?:^|\n)\s*(?:解析|explanation)\s*[:：]\s*([\s\S]*)/i);
    const answer = ((answerMatch == null ? void 0 : answerMatch[1]) || trimmed.split("\n")[0] || "").trim();
    return {
      answer,
      answers: answer ? answer.split(/[#,，、\s]+/).filter(Boolean) : [],
      explanation: ((explanationMatch == null ? void 0 : explanationMatch[1]) || "").trim()
    };
  }
  function parseAiAnswerJson(content) {
    try {
      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== "object") {
        return void 0;
      }
      const answers = Array.isArray(parsed.answers) ? parsed.answers.map(String).filter(Boolean) : parsed.answer ? [String(parsed.answer)] : [];
      return {
        answer: String(parsed.answer || answers.join("#")),
        answers,
        explanation: String(parsed.explanation || ""),
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : void 0
      };
    } catch (error) {
      return void 0;
    }
  }
  function parseLooseAiAnswerJson(content) {
    const source = extractFirstJsonObject(content);
    if (!source) {
      return void 0;
    }
    const answer = readLooseJsonStringField(source, "answer");
    const explanation = readLooseJsonStringField(source, "explanation") || "";
    const answerItems = readLooseJsonStringArrayField(source, "answers");
    const confidenceMatch = source.match(/"confidence"\s*:\s*(-?\d+(?:\.\d+)?)/i);
    const answers = answerItems.length ? answerItems : answer ? [answer] : [];
    if (!answer && !answers.length && !explanation) {
      return void 0;
    }
    return {
      answer: answer || answers.join("#"),
      answers,
      explanation,
      confidence: confidenceMatch ? Number(confidenceMatch[1]) : void 0
    };
  }
  function readLooseJsonStringField(source, key) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i");
    const match = source.match(pattern);
    return match ? decodeLooseJsonString(match[1]) : "";
  }
  function readLooseJsonStringArrayField(source, key) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, "i");
    const match = source.match(pattern);
    if (!match) {
      return [];
    }
    const items = [];
    const itemPattern = /"((?:\\.|[^"\\])*)"/g;
    let item;
    while (item = itemPattern.exec(match[1])) {
      const value = decodeLooseJsonString(item[1]);
      if (value) {
        items.push(value);
      }
    }
    return items;
  }
  function decodeLooseJsonString(value) {
    return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16))).replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "	").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  function createJsonCandidates(content) {
    const candidates = [content, unwrapMarkdownJsonFence(content)];
    for (const item of [...candidates]) {
      const jsonObject = extractFirstJsonObject(item);
      if (jsonObject) {
        candidates.push(jsonObject);
      }
    }
    return Array.from(new Set(candidates.map((item) => item.trim()).filter(Boolean)));
  }
  function unwrapMarkdownJsonFence(content) {
    const match = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return (match == null ? void 0 : match[1]) || content;
  }
  function extractFirstJsonObject(content) {
    const start2 = content.indexOf("{");
    if (start2 === -1) {
      return "";
    }
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start2; index < content.length; index++) {
      const char = content[index];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }
      if (char === '"') {
        inString = true;
      } else if (char === "{") {
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0) {
          return content.slice(start2, index + 1);
        }
      }
    }
    return "";
  }
  function createAiSearchInformation(ctx, parsed) {
    return {
      name: "AI",
      homepage: "#",
      results: [
        {
          question: ctx.question,
          answer: parsed.answers.length > 1 ? parsed.answers.join("#") : parsed.answer,
          extra_data: {
            ai: true,
            explanation: parsed.explanation,
            confidence: parsed.confidence
          }
        }
      ]
    };
  }
  function normalizeChatCompletionsURL(baseURL) {
    const trimmed = baseURL.trim().replace(/\/+$/, "");
    if (trimmed.endsWith("/chat/completions")) {
      return trimmed;
    }
    return `${trimmed}/chat/completions`;
  }
  function parseOpenAIStreamContent(content) {
    return content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith("data:")).map((line) => line.replace(/^data:\s*/, "")).filter((line) => line && line !== "[DONE]").map((line) => {
      var _a, _b, _c, _d, _e, _f;
      try {
        const parsed = JSON.parse(line);
        return ((_c = (_b = (_a = parsed == null ? void 0 : parsed.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content) || ((_f = (_e = (_d = parsed == null ? void 0 : parsed.choices) == null ? void 0 : _d[0]) == null ? void 0 : _e.message) == null ? void 0 : _f.content) || "";
      } catch (error) {
        return "";
      }
    }).join("");
  }
  function createAiPrompt(ctx, includeImageLinks) {
    const optionsText = ctx.options.map((option) => `${option.label}. ${option.text}`).join("\n");
    const imagesText = ctx.imageUrls.map((url, index) => `${index + 1}. ${url}`).join("\n");
    return [
      `Question type: ${ctx.type}`,
      `Question: ${ctx.question}`,
      optionsText ? `Options:
${optionsText}` : "",
      includeImageLinks && imagesText ? `Image URLs:
${imagesText}` : "",
      'Return JSON only: {"answer":"A","answers":["A"],"explanation":"short explanation","confidence":0.8}'
    ].filter(Boolean).join("\n\n");
  }
  function createAiChatMessages(config2, ctx) {
    const imageMode = config2.imageMode || "links";
    const includeImageLinks = imageMode === "links" || imageMode === "both";
    const prompt = createAiPrompt(ctx, includeImageLinks);
    const userContent = (imageMode === "vision" || imageMode === "both") && ctx.imageUrls.length ? [
      { type: "text", text: prompt },
      ...ctx.imageUrls.map((url) => ({ type: "image_url", image_url: { url } }))
    ] : prompt;
    return [
      { role: "system", content: config2.systemPrompt },
      { role: "user", content: userContent }
    ];
  }
  function extractChatContent(raw, stream) {
    var _a, _b, _c, _d, _e;
    if (stream) {
      return parseOpenAIStreamContent(typeof raw === "string" ? raw : String(raw != null ? raw : ""));
    }
    return ((_c = (_b = (_a = raw == null ? void 0 : raw.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content) || ((_e = (_d = raw == null ? void 0 : raw.choices) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) || "";
  }
  async function runChatCompletion(config2, messages) {
    const url = normalizeChatCompletionsURL(config2.baseURL);
    const timeoutMs = Math.max(5, Number(config2.timeout) || 60) * 1e3;
    const responsePromise = request(url, {
      type: "GM_xmlhttpRequest",
      method: "post",
      responseType: config2.streamResponse ? "text" : "json",
      headers: {
        Authorization: `Bearer ${config2.apiKey}`,
        "Content-Type": "application/json"
      },
      data: {
        model: config2.model,
        temperature: config2.temperature,
        stream: config2.streamResponse,
        messages
      }
    });
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("AI 请求超时，请增大“超时秒数”或检查网络/接口。")), timeoutMs);
    });
    try {
      const raw = await Promise.race([responsePromise, timeoutPromise]);
      return extractChatContent(raw, config2.streamResponse);
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
  async function requestAiAnswer(config2, ctx) {
    const raw = await runChatCompletion(config2, createAiChatMessages(config2, ctx));
    return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
  }
  function createScreenshotPrompt(questionType) {
    return [
      "The image is a screenshot of a quiz question (it may contain the question text, options, and figures).",
      questionType ? `Expected question type: ${questionType}.` : "",
      "Read the screenshot carefully and answer the question.",
      'Return JSON only: {"answer":"A","answers":["A"],"explanation":"short explanation","confidence":0.8}'
    ].filter(Boolean).join("\n\n");
  }
  async function requestAiAnswerFromScreenshot(config2, dataUrl, opts = {}) {
    const messages = [
      { role: "system", content: config2.systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: createScreenshotPrompt(opts.questionType) },
          { type: "image_url", image_url: { url: dataUrl } }
        ]
      }
    ];
    const raw = await runChatCompletion(config2, messages);
    const ctx = {
      question: "（截图识别）",
      options: [],
      imageUrls: [dataUrl],
      type: "unknown",
      fillTargets: []
    };
    return createAiSearchInformation(ctx, parseAiAnswerContent(raw));
  }
  function dispatchChange(element) {
    var _a;
    const EventConstructor = ((_a = element.ownerDocument.defaultView) == null ? void 0 : _a.Event) || Event;
    element.dispatchEvent(new EventConstructor("input", { bubbles: true }));
    element.dispatchEvent(new EventConstructor("change", { bubbles: true }));
  }
  function fillAiAnswer(ctx, answer) {
    const answers = answer.answers.length ? answer.answers : [answer.answer].filter(Boolean);
    if (ctx.type === "single" || ctx.type === "multiple" || ctx.type === "judgement") {
      let count = 0;
      for (const target of ctx.fillTargets.filter((target2) => target2.type === "radio" || target2.type === "checkbox")) {
        const matched = answers.some(
          (ans) => ans.toLowerCase() === String(target.label).toLowerCase() || ans === target.text
        );
        if (matched && target.element instanceof HTMLInputElement) {
          target.element.checked = true;
          dispatchChange(target.element);
          count++;
        } else if (matched && target.element instanceof HTMLElement) {
          target.element.click();
          dispatchChange(target.element);
          count++;
        }
      }
      return count ? { ok: true, message: `filled ${count} choice target(s)` } : { ok: false, message: "answer did not match choices" };
    }
    const textTarget = ctx.fillTargets.find((target) => ["text", "textarea", "contenteditable"].includes(target.type));
    if (!(textTarget == null ? void 0 : textTarget.element)) {
      return { ok: false, message: "no text target found" };
    }
    if (textTarget.type === "contenteditable") {
      textTarget.element.textContent = answers.join(" ");
    } else if (textTarget.element instanceof HTMLInputElement || textTarget.element instanceof HTMLTextAreaElement) {
      textTarget.element.value = answers.join(" ");
    }
    dispatchChange(textTarget.element);
    return { ok: true, message: "filled text target" };
  }
  function normalize(value) {
    return value.replace(/\s+/g, "").replace(/[，。！？；：、,.!?;:]/g, "").toLowerCase();
  }
  function createQuestionFingerprint(ctx) {
    const question = normalize(ctx.question);
    const options = ctx.options.map((option, index) => {
      if (typeof option === "string") {
        return `${index}=${normalize(option)}`;
      }
      return `${normalize(option.label)}=${normalize(option.text)}`;
    }).join("|");
    const images = (ctx.imageUrls || []).map(normalize).join("|");
    return `${ctx.type || "unknown"}::${question}::${options}::${images}`;
  }
  function createRegionQuestionObserver(elementOrResolver, onChange, debounceMs = 500, opts) {
    let timer;
    let interval;
    let lastElement;
    let lastSnapshot = "";
    const resolveElement = () => typeof elementOrResolver === "function" ? elementOrResolver() : elementOrResolver;
    const snapshot = (element) => (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
    const trigger = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        const element = resolveElement();
        if (!element) {
          return;
        }
        const currSnapshot = snapshot(element);
        if (element === lastElement && currSnapshot === lastSnapshot) {
          return;
        }
        lastElement = element;
        lastSnapshot = currSnapshot;
        onChange(element);
      }, debounceMs);
    };
    const observer = new MutationObserver(trigger);
    const observeRoot = (opts == null ? void 0 : opts.observeRoot) || (typeof elementOrResolver === "function" ? document.body || document.documentElement : elementOrResolver);
    observer.observe(observeRoot, { childList: true, subtree: true, characterData: true, attributes: true });
    if (opts == null ? void 0 : opts.intervalMs) {
      interval = setInterval(trigger, opts.intervalMs);
    }
    trigger();
    return {
      disconnect() {
        if (timer) {
          clearTimeout(timer);
        }
        if (interval) {
          clearInterval(interval);
        }
        observer.disconnect();
      }
    };
  }
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const imageAttributes = ["src", "data-src", "data-original", "data-lazy-src", "data-actualsrc", "data-url"];
  const imageExtensions = /\.(?:png|jpe?g|gif|webp|bmp|svg)(?:[?#].*)?$/i;
  function visibleText(element) {
    if (!element) {
      return "";
    }
    return (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
  }
  function resolveImageUrl(value, doc) {
    var _a;
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("blob:")) {
      return "";
    }
    try {
      const windowLocation = ((_a = doc.defaultView) == null ? void 0 : _a.location.href) || location.href;
      const baseURL = doc.baseURI && doc.baseURI !== "about:blank" ? doc.baseURI : windowLocation && windowLocation !== "about:blank" ? windowLocation : "http://localhost/";
      const url = new URL(trimmed, baseURL);
      return ["http:", "https:", "data:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }
  function parseSrcset(value) {
    return value.split(",").map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
  }
  function parseCssUrls(value) {
    const urls = [];
    const pattern = /url\(\s*(['"]?)(.*?)\1\s*\)/g;
    let match;
    while (match = pattern.exec(value)) {
      if (match[2]) {
        urls.push(match[2]);
      }
    }
    return urls;
  }
  function collectImageUrls(root2) {
    const doc = root2.ownerDocument || document;
    const urls = [];
    const seen = /* @__PURE__ */ new Set();
    const add = (value) => {
      if (!value) {
        return;
      }
      const url = resolveImageUrl(value, doc);
      if (url && !seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    };
    for (const element of [root2, ...Array.from(root2.querySelectorAll("*"))]) {
      if (element.tagName.toLowerCase() === "img") {
        for (const attr of imageAttributes) {
          add(element.getAttribute(attr));
        }
        add(element.currentSrc);
        for (const item of parseSrcset(element.getAttribute("srcset") || "")) {
          add(item);
        }
        for (const item of parseSrcset(element.getAttribute("data-srcset") || "")) {
          add(item);
        }
      }
      if (element.tagName.toLowerCase() === "source") {
        for (const item of parseSrcset(element.getAttribute("srcset") || "")) {
          add(item);
        }
      }
      if (element.tagName.toLowerCase() === "a" && imageExtensions.test(element.getAttribute("href") || "")) {
        add(element.getAttribute("href"));
      }
      for (const url of parseCssUrls(element.getAttribute("style") || "")) {
        add(url);
      }
    }
    return urls;
  }
  function inferQuestionText(root2, optionTexts) {
    const normalize2 = (text2) => text2.replace(/\s+/g, "").trim();
    const cleanQuestionMeta = (text2) => text2.replace(/^\s*\d+\s*[.、]\s*/, "").replace(
      /^\s*[（(]\s*(?:单选题|多选题|判断题|填空题|问答题|名词解释|完形填空|阅读理解)\s*[,，]?\s*\d+(?:\.\d+)?\s*分\s*[）)]\s*/,
      ""
    ).replace(/^\s*[[(【（]\s*(?:单选题|多选题|判断题|填空题|问答题|名词解释|完形填空|阅读理解)\s*[\])】）]\s*/, "").trim();
    const stripOptionLabel = (text2) => text2.replace(/\s*选择\s*$/g, "").replace(/^([A-Z])(?:[.、．]|\s)+/i, "").replace(/^([A-Z])(?:[.、．]|\s)+/i, "").trim();
    const optionSet = /* @__PURE__ */ new Set();
    for (const option of optionTexts) {
      [option, stripOptionLabel(option)].filter(Boolean).forEach((item) => optionSet.add(normalize2(item)));
    }
    const isMetaText = (text2) => /^\d+[.、]?$/.test(text2) || /^(?:\d+[.、]\s*)?[（(]?\s*(?:单选题|多选题|判断题|填空题|问答题)(?:\s*[,，]?\s*\d+\s*分)?\s*[）)]?$/.test(text2);
    const isOptionText = (text2) => {
      const normalized = normalize2(text2);
      const stripped = normalize2(stripOptionLabel(text2));
      return optionSet.has(normalized) || optionSet.has(stripped);
    };
    const chaoxingTitle = root2.querySelector("h3, .Zy_TItle .clearfix");
    if (chaoxingTitle && root2.closest(".questionLi, .TiMu")) {
      const cleaned = cleanQuestionMeta(visibleText(chaoxingTitle));
      if (cleaned && !isMetaText(cleaned) && !isOptionText(cleaned)) {
        return cleaned;
      }
    }
    const seen = /* @__PURE__ */ new Set();
    const elements2 = [root2, ...Array.from(root2.querySelectorAll("*"))];
    const candidates = elements2.map((element, index) => ({ element, index, text: cleanQuestionMeta(visibleText(element)) })).filter(Boolean).filter(({ text: text2 }) => {
      if (seen.has(text2) || isOptionText(text2) || isMetaText(text2)) {
        return false;
      }
      seen.add(text2);
      return true;
    }).map(({ element, index, text: text2 }) => ({
      text: text2,
      index,
      score: (/[？?]/.test(text2) ? 100 : 0) + (/[。.!！]$/.test(text2) && text2.length >= 6 ? 70 : 0) - (hasAnswerTargets(element) ? 60 : 0) + (/[=＝]$/.test(text2) ? 55 : 0) + (/设|则|求|计算|下列|以下|哪|什么|是否|判断/.test(text2) ? 30 : 0) - (text2.length < 3 ? 60 : 0)
    })).sort((a, b) => b.score - a.score || a.index - b.index).map((item) => item.text);
    if (candidates.length) {
      return candidates[0];
    }
    let text = visibleText(root2);
    for (const option of optionTexts) {
      text = text.replace(option, "");
    }
    return text.replace(/\s+/g, " ").trim();
  }
  function createNativeChoiceTargets(root2) {
    return Array.from(root2.querySelectorAll('input[type="radio"],input[type="checkbox"]')).map(
      (input) => ({
        type: input.type === "checkbox" ? "checkbox" : "radio",
        element: input,
        optionElement: resolveNativeOptionElement(input),
        value: input.value
      })
    );
  }
  function isChaoxingQuestionElement(element) {
    return !!element.closest(".questionLi,.TiMu");
  }
  function resolveNativeOptionElement(input) {
    var _a;
    const label = input.closest("label");
    if (label) {
      return label;
    }
    if (!isChaoxingQuestionElement(input)) {
      return resolveGenericOptionElement(input);
    }
    return ((_a = input.closest(".answerBg,li")) == null ? void 0 : _a.querySelector(".answer_p,.after,label:not(.before)")) || input.closest(".answerBg,li") || input;
  }
  function resolveGenericOptionElement(input) {
    let current = input.parentElement;
    let depth = 0;
    while (current && current !== document.body && current !== document.documentElement && depth < 4) {
      const choiceCount = current.querySelectorAll('input[type="radio"],input[type="checkbox"]').length;
      if (choiceCount <= 1 && visibleText(current)) {
        return current;
      }
      current = current.parentElement;
      depth++;
    }
    return input;
  }
  function createRoleChoiceTargets(root2) {
    return Array.from(root2.querySelectorAll('[role="radio"],[role="checkbox"]')).filter((element) => !element.querySelector('input[type="radio"],input[type="checkbox"]')).map((element) => ({
      type: element.getAttribute("role") === "checkbox" ? "checkbox" : "radio",
      element,
      optionElement: isChaoxingQuestionElement(element) ? element.querySelector(".answer_p,.textDIV,.eidtDiv,.after,label:not(.before)") || element : element,
      value: element.getAttribute("aria-label") || element.getAttribute("data-value") || ""
    }));
  }
  function createChoiceTargets(root2) {
    const nativeTargets = createNativeChoiceTargets(root2);
    return nativeTargets.length ? nativeTargets : createRoleChoiceTargets(root2);
  }
  function hasHiddenStyle(element) {
    let current = element;
    const win = element.ownerDocument.defaultView;
    while (current && current !== element.ownerDocument.documentElement) {
      if (current.hidden) {
        return true;
      }
      const style = win == null ? void 0 : win.getComputedStyle(current);
      if (style && (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || style.opacity === "0")) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  function hasLayoutBox(element) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return true;
    }
    return Array.from(element.getClientRects()).some((item) => item.width > 0 && item.height > 0);
  }
  function hasUsableLayout(root2) {
    return [root2, ...Array.from(root2.querySelectorAll("*"))].some(hasLayoutBox);
  }
  function isVisibleQuestionElement(element, layoutUsable) {
    if (hasHiddenStyle(element)) {
      return false;
    }
    return layoutUsable ? hasLayoutBox(element) : !!visibleText(element);
  }
  function hasAnswerTargets(element) {
    return createChoiceTargets(element).length > 0 || !!element.querySelector('input[type="text"],textarea,[contenteditable="true"]');
  }
  function hasQuestionSignal(element) {
    const text = visibleText(element);
    return /[？?]/.test(text) || /单选题|多选题|判断题|填空题|问答题|题目/.test(text) || !!element.querySelector(".question,[class*=question],[class*=title],h1,h2,h3,h4,p");
  }
  function countChoiceGroups(element) {
    const groups = /* @__PURE__ */ new Set();
    const nativeInputs = Array.from(
      element.querySelectorAll('input[type="radio"],input[type="checkbox"]')
    );
    nativeInputs.forEach((input, index) => groups.add(input.name || `${input.type}-${index}`));
    const roleGroups = element.querySelectorAll('[role="radiogroup"],[role="group"]');
    roleGroups.forEach((group, index) => {
      var _a;
      return groups.add(`role-${index}-${((_a = group.textContent) == null ? void 0 : _a.length) || 0}`);
    });
    return Math.max(groups.size, nativeInputs.length ? 1 : 0, roleGroups.length ? 1 : 0);
  }
  function questionCandidateScore(element, layoutUsable) {
    if (!isVisibleQuestionElement(element, layoutUsable) || !hasAnswerTargets(element)) {
      return -Infinity;
    }
    const text = visibleText(element);
    if (!text || text.length < 2 || text.length > 4e3) {
      return -Infinity;
    }
    const choiceCount = createChoiceTargets(element).length;
    const choiceGroupCount = countChoiceGroups(element);
    const textTargetCount = element.querySelectorAll('input[type="text"],textarea,[contenteditable="true"]').length;
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    let score = Math.min(choiceCount, 4) * 14 + textTargetCount * 12;
    if (hasQuestionSignal(element)) {
      score += 30;
    }
    if (/[？?]/.test(text)) {
      score += 20;
    }
    if (/question|题|card|item|subject/i.test(element.className || "")) {
      score += 8;
    }
    if (choiceCount >= 2 && choiceCount <= 8) {
      score += 16;
    }
    if (choiceGroupCount > 1) {
      score -= choiceGroupCount * 36;
    }
    if (layoutUsable && area > 0) {
      score -= Math.log(area);
    }
    score -= Math.min(text.length / 250, 16);
    return score;
  }
  function addCandidate(candidates, element, limitRoot) {
    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      candidates.add(current);
      if (current === limitRoot) {
        break;
      }
      current = current.parentElement;
    }
  }
  function collectQuestionCandidates(scope) {
    const candidates = /* @__PURE__ */ new Set([scope]);
    for (const target of createChoiceTargets(scope)) {
      addCandidate(candidates, target.optionElement, scope);
    }
    for (const element of Array.from(
      scope.querySelectorAll(
        'input[type="text"],textarea,[contenteditable="true"],.question,[class*=question],[class*=title],h1,h2,h3,h4,p'
      )
    )) {
      addCandidate(candidates, element, scope);
    }
    return candidates;
  }
  function createSearchScopes(root2) {
    const scopes = [];
    let current = root2;
    while (current && current !== document.body && current !== document.documentElement && scopes.length < 5) {
      scopes.push(current);
      current = current.parentElement;
    }
    if (document.body && !scopes.includes(document.body)) {
      scopes.push(document.body);
    }
    return scopes;
  }
  function resolveQuestionTextContainer(element, scope) {
    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      if (hasQuestionSignal(current) && hasAnswerTargets(current)) {
        return current;
      }
      if (current === scope) {
        break;
      }
      current = current.parentElement;
    }
    return element;
  }
  function compareDocumentOrder(a, b) {
    if (a === b) {
      return 0;
    }
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
  }
  function collectActiveQuestionElements(root2) {
    const layoutUsable = hasUsableLayout(root2);
    const candidates = /* @__PURE__ */ new Set();
    for (const target of createChoiceTargets(root2)) {
      const resolved = resolveQuestionTextContainer(target.optionElement, root2);
      if (Number.isFinite(questionCandidateScore(resolved, layoutUsable))) {
        candidates.add(resolved);
      }
    }
    for (const element of Array.from(
      root2.querySelectorAll('input[type="text"],textarea,[contenteditable="true"]')
    )) {
      const resolved = resolveQuestionTextContainer(element, root2);
      if (Number.isFinite(questionCandidateScore(resolved, layoutUsable))) {
        candidates.add(resolved);
      }
    }
    const items = Array.from(candidates).filter((element) => isVisibleQuestionElement(element, layoutUsable)).sort(compareDocumentOrder);
    return items.filter(
      (element) => !items.some(
        (other) => other !== element && element.contains(other) && countChoiceGroups(element) > countChoiceGroups(other)
      )
    );
  }
  function collectChaoxingQuestionElements(root2) {
    const closest = root2.closest(".questionLi,.TiMu");
    if (closest) {
      return [closest];
    }
    return Array.from(root2.querySelectorAll(".questionLi,.TiMu")).filter(hasAnswerTargets);
  }
  function isLikelyQuestionStemText(text) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length < 6 || /^[A-Z](?:[.、．]|\s)/i.test(normalized)) {
      return false;
    }
    return /[？?]/.test(normalized) || /下列|以下|哪|什么|是否|应|应该|使用|注解|正确|错误|设|则|求|计算|[。.!！]$/.test(normalized);
  }
  function hasPreviousQuestionStem(element) {
    var _a;
    let sibling = element.previousSibling;
    let checked = 0;
    while (sibling && checked < 8) {
      const text = sibling.nodeType === Node.ELEMENT_NODE ? visibleText(sibling) : ((_a = sibling.textContent) == null ? void 0 : _a.replace(/\s+/g, " ").trim()) || "";
      if (isLikelyQuestionStemText(text)) {
        return true;
      }
      sibling = sibling.previousSibling;
      checked++;
    }
    return false;
  }
  function resolveNearbyQuestionContainer(root2) {
    let current = root2;
    while (current && current !== document.body && current !== document.documentElement) {
      const parent = current.parentElement;
      if (parent && hasAnswerTargets(current) && hasPreviousQuestionStem(current)) {
        return parent;
      }
      current = parent;
    }
    return void 0;
  }
  function resolveActiveQuestionElement(root2) {
    const chaoxingQuestionElement = root2.closest(".questionLi,.TiMu");
    if (chaoxingQuestionElement && !hasHiddenStyle(chaoxingQuestionElement)) {
      return chaoxingQuestionElement;
    }
    const nearbyQuestionContainer = resolveNearbyQuestionContainer(root2);
    if (nearbyQuestionContainer && !hasHiddenStyle(nearbyQuestionContainer)) {
      return nearbyQuestionContainer;
    }
    let fallback;
    for (const scope of createSearchScopes(root2)) {
      const layoutUsable = hasUsableLayout(scope);
      const candidates = Array.from(collectQuestionCandidates(scope)).map((element) => ({
        element,
        score: questionCandidateScore(element, layoutUsable)
      })).filter((item) => Number.isFinite(item.score)).sort((a, b) => b.score - a.score);
      if (candidates[0]) {
        const resolved = resolveQuestionTextContainer(candidates[0].element, scope);
        if (!fallback) {
          fallback = resolved;
        }
        if (hasQuestionSignal(resolved)) {
          return resolved;
        }
      }
    }
    return fallback || root2;
  }
  function recognizeAiQuestionFromRoot(root2) {
    const choiceTargets = createChoiceTargets(root2);
    const textTargets = Array.from(
      root2.querySelectorAll('input[type="text"],textarea')
    );
    const editableTargets = Array.from(root2.querySelectorAll('[contenteditable="true"]'));
    const imageUrls = collectImageUrls(root2);
    const options = choiceTargets.map((target, index) => {
      const label = labels[index] || String(index + 1);
      const text = visibleText(target.optionElement) || target.value || label;
      return { label, text, element: target.optionElement };
    });
    const fillTargets = [
      ...choiceTargets.map((target, index) => {
        var _a;
        return {
          type: target.type,
          element: target.element,
          label: labels[index] || String(index + 1),
          text: ((_a = options[index]) == null ? void 0 : _a.text) || target.value
        };
      }),
      ...textTargets.map((element) => ({
        type: element.tagName.toLowerCase() === "textarea" ? "textarea" : "text",
        element
      })),
      ...editableTargets.map((element) => ({ type: "contenteditable", element }))
    ];
    const hasCheckbox = choiceTargets.some((target) => target.type === "checkbox");
    const type = choiceTargets.length ? hasCheckbox ? "multiple" : "single" : textTargets.length || editableTargets.length ? "completion" : "unknown";
    return {
      question: inferQuestionText(
        root2,
        options.map((option) => option.text)
      ),
      options,
      imageUrls,
      type,
      fillTargets
    };
  }
  function recognizeAiQuestions(root2) {
    const chaoxingQuestionElements = collectChaoxingQuestionElements(root2);
    if (chaoxingQuestionElements.length) {
      return chaoxingQuestionElements.map(recognizeAiQuestionFromRoot);
    }
    const questionElements = collectActiveQuestionElements(root2);
    if (questionElements.length > 1) {
      return questionElements.map(recognizeAiQuestionFromRoot);
    }
    return [recognizeAiQuestionFromRoot(questionElements[0] || resolveActiveQuestionElement(root2))];
  }
  function recognizeAiQuestion(root2) {
    return recognizeAiQuestionFromRoot(resolveActiveQuestionElement(root2));
  }
  function createElementSelectorPath(element) {
    const parts = [];
    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      const parent = current.parentElement;
      if (!parent) {
        break;
      }
      const index = Array.from(parent.children).indexOf(current) + 1;
      parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
      current = parent;
    }
    return parts.join(" > ");
  }
  function resolveElementSelectorPath(path, root2 = document) {
    if (!path) {
      return void 0;
    }
    return root2.querySelector(path) || void 0;
  }
  function applyStyle(element, styles) {
    Object.assign(element.style, styles);
  }
  function hasChoiceTargets(element) {
    return !!element.querySelector('input[type="radio"],input[type="checkbox"],[role="radio"],[role="checkbox"],label');
  }
  function hasQuestionText(element) {
    const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
    return /[？?]/.test(text) || !!element.querySelector(".question,[class*=question],[class*=title],h1,h2,h3,h4,p");
  }
  function resolveQuestionContainer(element) {
    let current = element;
    let best;
    while (current && current !== document.body && current !== document.documentElement) {
      if (hasQuestionText(current) && hasChoiceTargets(current)) {
        best = current;
        break;
      }
      current = current.parentElement;
    }
    return best || element;
  }
  function normalizeClientRect(startX, startY, endX, endY) {
    const left = Math.min(startX, endX);
    const top2 = Math.min(startY, endY);
    const right = Math.max(startX, endX);
    const bottom = Math.max(startY, endY);
    return {
      left,
      top: top2,
      right,
      bottom,
      x: left,
      y: top2,
      width: right - left,
      height: bottom - top2,
      toJSON() {
        return this;
      }
    };
  }
  function intersectionArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  }
  function isPickerElement(element) {
    return element.classList.contains("ocs-ai-region-overlay") || element.classList.contains("ocs-ai-region-box");
  }
  function commonAncestor(elements2) {
    const [first, ...rest] = elements2;
    if (!first) {
      return void 0;
    }
    let ancestor = first;
    while (ancestor && ancestor !== document.documentElement) {
      if (rest.every((element) => ancestor == null ? void 0 : ancestor.contains(element))) {
        return ancestor === document.body ? first : ancestor;
      }
      ancestor = ancestor.parentElement;
    }
    return first;
  }
  function resolveElementFromClientRect(rect, root2 = document) {
    var _a;
    if (rect.width < 4 || rect.height < 4) {
      return void 0;
    }
    const searchRoot = root2 instanceof Document ? root2.body : root2;
    const elements2 = [searchRoot, ...Array.from(searchRoot.querySelectorAll("*"))];
    const candidates = elements2.map((element) => {
      const bounds = element.getBoundingClientRect();
      const area = bounds.width * bounds.height;
      const intersection = intersectionArea(rect, bounds);
      return { element, bounds, area, intersection };
    }).filter(({ element, area, intersection }) => area > 0 && intersection > 0 && !isPickerElement(element));
    const contained = candidates.filter(({ area, intersection }) => intersection / area >= 0.85).sort((a, b) => b.area - a.area).map(({ element }) => element);
    if (contained.length) {
      const selected2 = commonAncestor(contained);
      return selected2 ? resolveQuestionContainer(selected2) : void 0;
    }
    const selected = (_a = candidates.sort((a, b) => b.intersection - a.intersection)[0]) == null ? void 0 : _a.element;
    return selected ? resolveQuestionContainer(selected) : void 0;
  }
  function startRegionPicker(onSelect) {
    const overlay = document.createElement("div");
    overlay.className = "ocs-ai-region-overlay";
    applyStyle(overlay, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "none"
    });
    document.documentElement.append(overlay);
    let current;
    let previousOutline = "";
    let previousOutlineOffset = "";
    const cleanup = () => {
      if (current) {
        current.style.outline = previousOutline;
        current.style.outlineOffset = previousOutlineOffset;
      }
      document.removeEventListener("mousemove", move, true);
      document.removeEventListener("click", click, true);
      overlay.remove();
    };
    const move = (event) => {
      const target = event.target;
      if (!target || target === overlay || target.closest(".ocs-ai-region-overlay")) {
        return;
      }
      if (current) {
        current.style.outline = previousOutline;
        current.style.outlineOffset = previousOutlineOffset;
      }
      current = target;
      previousOutline = current.style.outline;
      previousOutlineOffset = current.style.outlineOffset;
      current.style.outline = "2px solid #2563eb";
      current.style.outlineOffset = "2px";
    };
    const click = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (current) {
        const selected = resolveQuestionContainer(current);
        onSelect(selected, createElementSelectorPath(selected));
      }
      cleanup();
    };
    document.addEventListener("mousemove", move, true);
    document.addEventListener("click", click, true);
  }
  function startRectRegionPicker(onSelect) {
    const overlay = document.createElement("div");
    const box = document.createElement("div");
    overlay.className = "ocs-ai-region-overlay";
    box.className = "ocs-ai-region-box";
    applyStyle(overlay, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "auto",
      cursor: "crosshair"
    });
    applyStyle(box, {
      position: "fixed",
      display: "none",
      border: "2px solid #2563eb",
      background: "rgba(37, 99, 235, 0.12)",
      boxSizing: "border-box",
      pointerEvents: "none"
    });
    overlay.append(box);
    document.documentElement.append(overlay);
    let startX = 0;
    let startY = 0;
    let rect;
    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "crosshair";
    const cleanup = () => {
      document.documentElement.style.cursor = previousCursor;
      document.removeEventListener("mousedown", down, true);
      document.removeEventListener("mousemove", move, true);
      document.removeEventListener("mouseup", up, true);
      document.removeEventListener("keydown", keydown, true);
      overlay.remove();
    };
    const renderBox = () => {
      if (!rect) {
        return;
      }
      box.style.left = `${rect.left}px`;
      box.style.top = `${rect.top}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    };
    const down = (event) => {
      event.preventDefault();
      event.stopPropagation();
      startX = event.clientX;
      startY = event.clientY;
      rect = normalizeClientRect(startX, startY, startX, startY);
      box.style.display = "block";
      renderBox();
    };
    const move = (event) => {
      if (!rect) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
      renderBox();
    };
    const up = (event) => {
      if (!rect) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
      const selected = resolveElementFromClientRect(rect);
      if (selected) {
        onSelect(selected, createElementSelectorPath(selected));
      }
      cleanup();
    };
    const keydown = (event) => {
      if (event.key === "Escape") {
        cleanup();
      }
    };
    document.addEventListener("mousedown", down, true);
    document.addEventListener("mousemove", move, true);
    document.addEventListener("mouseup", up, true);
    document.addEventListener("keydown", keydown, true);
  }
  function startRectScreenshotPicker(onSelect) {
    const overlay = document.createElement("div");
    const box = document.createElement("div");
    overlay.className = "ocs-ai-region-overlay";
    box.className = "ocs-ai-region-box";
    applyStyle(overlay, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      pointerEvents: "auto",
      cursor: "crosshair"
    });
    applyStyle(box, {
      position: "fixed",
      display: "none",
      border: "2px solid #2563eb",
      background: "rgba(37, 99, 235, 0.12)",
      boxSizing: "border-box",
      pointerEvents: "none"
    });
    overlay.append(box);
    document.documentElement.append(overlay);
    let startX = 0;
    let startY = 0;
    let rect;
    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "crosshair";
    const cleanup = () => {
      document.documentElement.style.cursor = previousCursor;
      document.removeEventListener("mousedown", down, true);
      document.removeEventListener("mousemove", move, true);
      document.removeEventListener("mouseup", up, true);
      document.removeEventListener("keydown", keydown, true);
      overlay.remove();
    };
    const renderBox = () => {
      if (!rect) {
        return;
      }
      box.style.left = `${rect.left}px`;
      box.style.top = `${rect.top}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    };
    const down = (event) => {
      event.preventDefault();
      event.stopPropagation();
      startX = event.clientX;
      startY = event.clientY;
      rect = normalizeClientRect(startX, startY, startX, startY);
      box.style.display = "block";
      renderBox();
    };
    const move = (event) => {
      if (!rect) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
      renderBox();
    };
    const up = (event) => {
      if (!rect) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      rect = normalizeClientRect(startX, startY, event.clientX, event.clientY);
      const selected = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
      cleanup();
      if (selected.width >= 4 && selected.height >= 4) {
        onSelect(selected);
      }
    };
    const keydown = (event) => {
      if (event.key === "Escape") {
        cleanup();
      }
    };
    document.addEventListener("mousedown", down, true);
    document.addEventListener("mousemove", move, true);
    document.addEventListener("mouseup", up, true);
    document.addEventListener("keydown", keydown, true);
  }
  const DEFAULT_SYSTEM_PROMPT = "You answer quiz questions. Return compact JSON only. For choice questions, answer with visible option labels when possible.";
  const DEFAULT_SCREENSHOT_HOTKEY = "Alt+S";
  const DEFAULT_RECAPTURE_HOTKEY = "Alt+R";
  const PROVIDER_GROUP_COUNT = 3;
  function createDefaultGroups() {
    return Array.from({ length: PROVIDER_GROUP_COUNT }, (_, i) => ({
      name: `供应商 ${i + 1}`,
      baseURL: "",
      apiKey: "",
      model: ""
    }));
  }
  function normalizeGroup(raw, index) {
    const g = raw && typeof raw === "object" ? raw : {};
    return {
      name: typeof g.name === "string" && g.name ? g.name : `供应商 ${index + 1}`,
      baseURL: typeof g.baseURL === "string" ? g.baseURL : "",
      apiKey: typeof g.apiKey === "string" ? g.apiKey : "",
      model: typeof g.model === "string" ? g.model : ""
    };
  }
  function getProviderGroups(cfg) {
    try {
      const groups = typeof cfg.providerGroups === "string" ? JSON.parse(cfg.providerGroups) : cfg.providerGroups;
      if (Array.isArray(groups) && groups.length) {
        return Array.from({ length: PROVIDER_GROUP_COUNT }, (_, i) => normalizeGroup(groups[i], i));
      }
    } catch (_) {
    }
    return createDefaultGroups();
  }
  function setProviderGroups(cfg, groups) {
    cfg.providerGroups = JSON.stringify(groups);
  }
  function getActiveGroupIndex(cfg) {
    const idx = Number(cfg.activeGroup || 0);
    return idx >= 0 && idx < PROVIDER_GROUP_COUNT ? idx : 0;
  }
  function getActiveProvider(cfg) {
    return getProviderGroups(cfg)[getActiveGroupIndex(cfg)];
  }
  function normalizeHotkeyKey(key) {
    if (key === " " || key === "Spacebar") {
      return "Space";
    }
    return key.length === 1 ? key.toUpperCase() : key;
  }
  function hotkeyFromEvent(event) {
    const parts = [];
    if (event.ctrlKey)
      parts.push("Ctrl");
    if (event.altKey)
      parts.push("Alt");
    if (event.shiftKey)
      parts.push("Shift");
    if (event.metaKey)
      parts.push("Meta");
    parts.push(normalizeHotkeyKey(event.key));
    return parts.join("+");
  }
  function matchHotkey(event, hotkey) {
    const parts = hotkey.split("+").map((part) => part.trim()).filter(Boolean);
    const key = parts.pop();
    if (!key) {
      return false;
    }
    return event.ctrlKey === parts.includes("Ctrl") && event.altKey === parts.includes("Alt") && event.shiftKey === parts.includes("Shift") && event.metaKey === parts.includes("Meta") && normalizeHotkeyKey(event.key) === key;
  }
  const state$1 = {
    loading: false,
    requestVersion: 0,
    items: [],
    cache: /* @__PURE__ */ new Map()
  };
  function getRulePath(cfg) {
    return cfg.useUrlRule ? cfg.urlRegionPath : cfg.hostnameRegionPath;
  }
  function setRulePath(cfg, path) {
    if (cfg.useUrlRule) {
      cfg.urlRegionPath = path;
    } else {
      cfg.hostnameRegionPath = path;
    }
  }
  function createProviderConfig(cfg) {
    const provider = getActiveProvider(cfg);
    return {
      baseURL: provider.baseURL,
      apiKey: provider.apiKey,
      model: provider.model,
      temperature: Number(cfg.temperature || 0.2),
      timeout: Number(cfg.timeout || 60),
      systemPrompt: cfg.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      imageMode: cfg.imageMode || "links",
      streamResponse: cfg.streamResponse !== false
    };
  }
  function isMultipleQuestionMode(cfg) {
    return cfg.questionMode === "multiple";
  }
  function recognizeCurrentQuestions(root2, cfg) {
    return isMultipleQuestionMode(cfg) ? recognizeAiQuestions(root2) : [recognizeAiQuestion(root2)];
  }
  function createAnswerFromSearch(info) {
    const result = info.results[0];
    const extra = result.extra_data || {};
    return {
      answer: result.answer,
      answers: result.answer ? result.answer.split("#").filter(Boolean) : [],
      explanation: extra.explanation || "",
      confidence: extra.confidence
    };
  }
  function answerLabel(answer) {
    return (answer == null ? void 0 : answer.answers.length) ? answer.answers.join("、") : (answer == null ? void 0 : answer.answer) || "";
  }
  function applyPanelLayout(panel) {
    Object.assign(panel.style, {
      boxSizing: "border-box",
      maxWidth: "min(620px, calc(100vw - 64px))",
      overflowX: "hidden"
    });
    Object.assign(panel.configsContainer.style, {
      maxWidth: "100%",
      overflowX: "hidden"
    });
    const controls = Array.from(
      panel.configsContainer.querySelectorAll(
        'input:not([type="checkbox"]):not([type="radio"]),select,textarea'
      )
    );
    for (const element of controls) {
      Object.assign(element.style, {
        boxSizing: "border-box",
        maxWidth: "100%",
        minWidth: "0"
      });
    }
    const textareas = Array.from(panel.configsContainer.querySelectorAll("textarea"));
    for (const textarea of textareas) {
      Object.assign(textarea.style, {
        resize: "vertical",
        minHeight: "54px"
      });
    }
  }
  function createInputField(label, value, onChange, opts) {
    const input = lib.h("input", {
      value,
      type: (opts == null ? void 0 : opts.type) || "text",
      placeholder: (opts == null ? void 0 : opts.placeholder) || "",
      style: {
        boxSizing: "border-box",
        width: "100%",
        padding: "4px 6px",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        fontSize: "12px"
      }
    });
    input.addEventListener("input", () => onChange(input.value));
    return lib.h("div", { style: { marginBottom: "6px" } }, [
      lib.h("div", { style: { fontSize: "12px", color: "#374151", marginBottom: "2px" } }, label),
      input
    ]);
  }
  function renderProviderGroupEditor(cfg, script2, panel) {
    const groups = getProviderGroups(cfg);
    const activeIdx = getActiveGroupIndex(cfg);
    const saveGroups = () => {
      setProviderGroups(cfg, groups);
    };
    const tabs = groups.map((group2, idx) => {
      const isActive = idx === activeIdx;
      const tab = lib.h(
        "div",
        {
          style: {
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: "12px",
            borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
            color: isActive ? "#2563eb" : "#6b7280",
            fontWeight: isActive ? "bold" : "normal"
          }
        },
        group2.name || `供应商 ${idx + 1}`
      );
      tab.onclick = () => {
        cfg.activeGroup = String(idx);
        renderPanel(panel, script2);
      };
      return tab;
    });
    const group = groups[activeIdx];
    const nameField = createInputField("名称", group.name, (val) => {
      group.name = val;
      saveGroups();
      tabs[activeIdx].textContent = val || `供应商 ${activeIdx + 1}`;
    }, { placeholder: `供应商 ${activeIdx + 1}` });
    const urlField = createInputField("Base URL", group.baseURL, (val) => {
      group.baseURL = val;
      saveGroups();
    }, { placeholder: "https://api.openai.com/v1" });
    const keyField = createInputField("API Key", group.apiKey, (val) => {
      group.apiKey = val;
      saveGroups();
    }, { type: "password", placeholder: "sk-..." });
    const modelField = createInputField("模型", group.model, (val) => {
      group.model = val;
      saveGroups();
    }, { placeholder: "gpt-4o-mini" });
    const collapseSetting = cfg.providerCollapsed;
    const collapsed = collapseSetting === "" || collapseSetting === void 0 ? !!getRulePath(cfg) : collapseSetting === "1" || collapseSetting === true;
    const configured = !!(group.baseURL && group.apiKey && group.model);
    const header2 = lib.h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          marginBottom: "4px"
        }
      },
      [
        lib.h("span", { style: { fontSize: "12px", color: "#6b7280" } }, "API 供应商配置："),
        lib.h("span", { style: { fontSize: "12px", color: "#2563eb" } }, collapsed ? "展开 ▸" : "收起 ▾")
      ]
    );
    header2.onclick = () => {
      cfg.providerCollapsed = collapsed ? "0" : "1";
      renderPanel(panel, script2);
    };
    const tabsBar = lib.h(
      "div",
      { style: { display: "flex", gap: "0", borderBottom: "1px solid #e5e7eb", marginBottom: "8px" } },
      tabs
    );
    if (collapsed) {
      const summary = lib.h(
        "div",
        { style: { fontSize: "12px", color: "#374151", padding: "2px 0" } },
        `${configured ? "✅" : "⚠️"} 当前：${group.name || `供应商 ${activeIdx + 1}`}${group.model ? " · " + group.model : "（未配置）"}`
      );
      return lib.h("div", { style: { margin: "4px 0" } }, [header2, tabsBar, summary]);
    }
    return lib.h("div", { style: { margin: "4px 0" } }, [header2, tabsBar, nameField, urlField, keyField, modelField]);
  }
  function applySettingsCollapse(panel, script2) {
    const cfg = script2.cfg;
    const container2 = panel.configsContainer;
    if (!container2) {
      return;
    }
    const body = container2.querySelector(".configs-body");
    if (!body) {
      return;
    }
    const setting = cfg.settingsCollapsed;
    const collapsed = setting === "" || setting === void 0 ? !!getRulePath(cfg) : setting === "1" || setting === true;
    body.style.display = collapsed ? "none" : "";
    let bar = container2.querySelector(".ocs-ai-settings-toggle");
    if (!bar) {
      bar = lib.h("div", { className: "ocs-ai-settings-toggle" });
      Object.assign(bar.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        fontSize: "12px",
        color: "#6b7280",
        padding: "4px 2px"
      });
      container2.prepend(bar);
    }
    bar.replaceChildren(
      lib.h("span", "⚙️ 脚本设置"),
      lib.h("span", { style: { color: "#2563eb" } }, collapsed ? "展开 ▸" : "收起 ▾")
    );
    bar.onclick = () => {
      cfg.settingsCollapsed = collapsed ? "0" : "1";
      renderPanel(panel, script2);
    };
  }
  function renderPanel(panel, script2) {
    var _a, _b, _c, _d;
    applyPanelLayout(panel);
    applySettingsCollapse(panel, script2);
    const cfg = script2.cfg;
    const regionPath = getRulePath(cfg);
    const regionStatus = regionPath ? `已保存区域：${regionPath}` : "未选择题目区域";
    const answerText = state$1.items.length > 1 ? state$1.items.map((item, index) => `${index + 1}. ${item.loading ? "请求中..." : answerLabel(item.answer) || "暂无"}`).join("\n") : answerLabel(state$1.answer);
    const imageCount = ((_a = state$1.question) == null ? void 0 : _a.imageUrls.length) || 0;
    const optionText = ((_b = state$1.question) == null ? void 0 : _b.options.length) ? state$1.question.options.map((option) => `${option.label}. ${option.text}`).join("；") : "暂无";
    const renderScreenshotThumbs = (question) => {
      const shots = ((question == null ? void 0 : question.imageUrls) || []).filter((url) => url.startsWith("data:"));
      if (!shots.length) {
        return "";
      }
      return lib.h("div", { style: { margin: "4px 0" } }, [
        lib.h("b", "截图："),
        lib.h(
          "div",
          { style: { marginTop: "4px" } },
          shots.map(
            (url) => lib.h("img", {
              src: url,
              style: {
                maxWidth: "100%",
                maxHeight: "180px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                display: "block",
                marginTop: "4px"
              }
            })
          )
        )
      ]);
    };
    const renderAnswerItem = (item, index) => {
      var _a2;
      return lib.h("div", { style: { padding: "6px 0", borderTop: index ? "1px solid #e5e7eb" : "" } }, [
        lib.h("div", [lib.h("b", `题目 ${index + 1}：`), item.question.question || "等待识别"]),
        renderScreenshotThumbs(item.question),
        lib.h("div", [
          lib.h("b", "选项："),
          item.question.options.length ? item.question.options.map((option) => `${option.label}. ${option.text}`).join("；") : "暂无"
        ]),
        lib.h("div", [lib.h("b", "图片："), item.question.imageUrls.length ? `${item.question.imageUrls.length} 张` : "暂无"]),
        lib.h("div", [lib.h("b", "答案："), item.loading ? "请求中..." : answerLabel(item.answer) || "暂无"]),
        lib.h("div", [lib.h("b", "解析："), ((_a2 = item.answer) == null ? void 0 : _a2.explanation) || item.error || "暂无"])
      ]);
    };
    const selectButton = lib.$ui.button("框选题目区域");
    selectButton.onclick = () => {
      startRegionPicker((_, path) => {
        setRulePath(cfg, path);
        state$1.status = "已保存题目区域。";
        lib.$message.success({ content: "已保存 AI 答题区域。" });
        renderPanel(panel, script2);
      });
    };
    const rectSelectButton = lib.$ui.button("拖拽框选截图");
    rectSelectButton.onclick = () => {
      startRectScreenshotPicker(async (rect) => {
        state$1.screenshotRect = rect;
        state$1.status = "已框选区域，开始截图…（请在弹窗中选择共享“此标签页”）";
        renderPanel(panel, script2);
        await captureAndAsk(script2, () => renderPanel(panel, script2));
        renderPanel(panel, script2);
      });
    };
    const recaptureButton = lib.$ui.button("重新截图提问");
    recaptureButton.disabled = !state$1.screenshotRect;
    recaptureButton.onclick = async () => {
      if (!state$1.screenshotRect) {
        lib.$message.warn({ content: "请先用“拖拽框选截图”框选区域。" });
        return;
      }
      await captureAndAsk(script2, () => renderPanel(panel, script2));
      renderPanel(panel, script2);
    };
    const startButton = lib.$ui.button("开始监听");
    startButton.onclick = async () => {
      var _a2;
      const resolveSavedRoot = () => resolveElementSelectorPath(getRulePath(cfg));
      const resolveRoot = () => {
        const savedRoot = resolveSavedRoot();
        if (!savedRoot) {
          return void 0;
        }
        return isMultipleQuestionMode(cfg) ? savedRoot : resolveActiveQuestionElement(savedRoot);
      };
      const root2 = resolveRoot();
      if (!root2) {
        lib.$message.warn({ content: "未找到已保存的题目区域，请重新框选。" });
        return;
      }
      (_a2 = state$1.observer) == null ? void 0 : _a2.disconnect();
      state$1.observer = createRegionQuestionObserver(
        resolveRoot,
        async (root22) => {
          await updateCurrentAnswer(root22, script2, () => renderPanel(panel, script2));
          renderPanel(panel, script2);
        },
        500,
        {
          observeRoot: document.body || document.documentElement,
          intervalMs: 1e3
        }
      );
      state$1.status = "已开始监听当前区域。";
      await updateCurrentAnswer(root2, script2, () => renderPanel(panel, script2));
      lib.$message.success({ content: "AI 答题助手已开始监听当前区域。" });
      renderPanel(panel, script2);
    };
    const clearRegionButton = lib.$ui.button("清空所选区域");
    clearRegionButton.onclick = () => {
      var _a2;
      (_a2 = state$1.observer) == null ? void 0 : _a2.disconnect();
      state$1.observer = void 0;
      state$1.requestVersion += 1;
      state$1.fingerprint = void 0;
      state$1.question = void 0;
      state$1.answer = void 0;
      state$1.items = [];
      state$1.error = void 0;
      state$1.loading = false;
      state$1.screenshotRect = void 0;
      releaseCaptureStream();
      setRulePath(cfg, "");
      state$1.status = "已清空所选题目区域。";
      lib.$message.success({ content: "已清空 AI 答题区域。" });
      renderPanel(panel, script2);
    };
    const clearButton = lib.$ui.button("清空缓存");
    clearButton.onclick = () => {
      state$1.cache.clear();
      state$1.status = "AI 答案缓存已清空。";
      lib.$message.success({ content: "AI 答案缓存已清空。" });
      renderPanel(panel, script2);
    };
    const copyButton = lib.$ui.button("复制答案");
    copyButton.onclick = () => {
      navigator.clipboard.writeText(answerText || "暂无答案");
      lib.$message.success({ content: "答案已复制。" });
    };
    const fillButton = lib.$ui.button("填入答案");
    fillButton.disabled = !state$1.items.some((item) => item.answer) || cfg.mode !== "fill";
    fillButton.onclick = () => {
      var _a2;
      if (!state$1.items.length) {
        return;
      }
      const results = state$1.items.filter((item) => item.answer).map((item) => fillAiAnswer(item.question, item.answer));
      const okCount = results.filter((result) => result.ok).length;
      lib.$message[okCount ? "success" : "warn"]({
        content: state$1.items.length > 1 ? `已填入 ${okCount}/${results.length} 道题。` : ((_a2 = results[0]) == null ? void 0 : _a2.message) || "暂无答案"
      });
    };
    const actionButtons = [
      selectButton,
      rectSelectButton,
      recaptureButton,
      startButton,
      clearRegionButton,
      clearButton,
      copyButton,
      fillButton
    ];
    for (const btn of actionButtons) {
      Object.assign(btn.style, {
        width: "100%",
        margin: "0",
        padding: "5px 4px",
        fontSize: "12px",
        whiteSpace: "nowrap",
        boxSizing: "border-box"
      });
    }
    const detailNodes = state$1.items.length > 1 ? [
      lib.h("div", [
        lib.h("div", [lib.h("b", "识别："), `共 ${state$1.items.length} 道题`]),
        ...state$1.items.map(renderAnswerItem)
      ])
    ] : [
      lib.h("div", [lib.h("b", "题目："), ((_c = state$1.question) == null ? void 0 : _c.question) || "等待识别"]),
      renderScreenshotThumbs(state$1.question),
      lib.h("div", [lib.h("b", "选项："), optionText]),
      lib.h("div", [lib.h("b", "图片："), imageCount ? `${imageCount} 张` : "暂无"]),
      lib.h("div", [lib.h("b", "答案："), state$1.loading ? "请求中..." : answerText || "暂无"]),
      lib.h("div", [lib.h("b", "解析："), ((_d = state$1.answer) == null ? void 0 : _d.explanation) || "暂无"])
    ];
    panel.body.replaceChildren(
      lib.h("div", { className: "ocs-ai-answer-card", style: { overflowWrap: "anywhere", wordBreak: "break-word" } }, [
        lib.h("div", regionStatus),
        lib.h(
          "div",
          {
            style: {
              marginTop: "8px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
              gap: "6px"
            }
          },
          actionButtons
        ),
        lib.h("hr"),
        renderProviderGroupEditor(cfg, script2, panel),
        lib.h("hr"),
        ...detailNodes,
        state$1.status ? lib.h("div", { style: { color: "#047857" } }, state$1.status) : "",
        state$1.error ? lib.h("div", { className: "error" }, state$1.error) : ""
      ])
    );
  }
  async function updateCurrentAnswer(root2, script2, onStateChange) {
    var _a, _b, _c, _d;
    const cfg = script2.cfg;
    state$1.error = void 0;
    const questions = recognizeCurrentQuestions(root2, cfg);
    const fingerprints = questions.map(createQuestionFingerprint);
    const fingerprint = fingerprints.join("|");
    if (fingerprint === state$1.fingerprint && state$1.items.length && state$1.items.every((item) => item.answer)) {
      return;
    }
    state$1.fingerprint = fingerprint;
    state$1.items = questions.map((question, index) => {
      const itemFingerprint = fingerprints[index];
      return {
        question,
        fingerprint: itemFingerprint,
        answer: state$1.cache.get(itemFingerprint),
        loading: false
      };
    });
    state$1.question = (_a = state$1.items[0]) == null ? void 0 : _a.question;
    state$1.answer = (_b = state$1.items[0]) == null ? void 0 : _b.answer;
    const _activeProvider = getActiveProvider(cfg);
    if (!_activeProvider.baseURL || !_activeProvider.apiKey || !_activeProvider.model) {
      state$1.answer = void 0;
      state$1.loading = false;
      state$1.error = "请先配置当前供应商的 Base URL、API Key 和模型。";
      onStateChange == null ? void 0 : onStateChange();
      return;
    }
    const pendingItems = state$1.items.filter((item) => !item.answer);
    if (!pendingItems.length) {
      state$1.loading = false;
      onStateChange == null ? void 0 : onStateChange();
      return;
    }
    state$1.loading = true;
    pendingItems.forEach((item) => {
      item.loading = true;
    });
    const requestVersion = ++state$1.requestVersion;
    onStateChange == null ? void 0 : onStateChange();
    try {
      await Promise.all(
        pendingItems.map(async (item) => {
          try {
            const info = await requestAiAnswer(createProviderConfig(cfg), item.question);
            if (state$1.requestVersion !== requestVersion) {
              return;
            }
            item.answer = createAnswerFromSearch(info);
            state$1.cache.set(item.fingerprint, item.answer);
          } catch (error) {
            if (state$1.requestVersion !== requestVersion) {
              return;
            }
            item.error = (error == null ? void 0 : error.message) || String(error);
          } finally {
            if (state$1.requestVersion === requestVersion) {
              item.loading = false;
            }
          }
        })
      );
    } finally {
      if (state$1.requestVersion === requestVersion) {
        state$1.loading = false;
        state$1.answer = (_c = state$1.items[0]) == null ? void 0 : _c.answer;
        state$1.error = (_d = state$1.items.find((item) => item.error)) == null ? void 0 : _d.error;
      }
    }
  }
  async function captureAndAsk(script2, onStateChange) {
    var _a;
    const cfg = script2.cfg;
    if (!state$1.screenshotRect) {
      return;
    }
    const provider = getActiveProvider(cfg);
    if (!provider.baseURL || !provider.apiKey || !provider.model) {
      state$1.error = "请先配置当前供应商的 Base URL、API Key 和模型。";
      onStateChange == null ? void 0 : onStateChange();
      return;
    }
    (_a = state$1.observer) == null ? void 0 : _a.disconnect();
    state$1.observer = void 0;
    state$1.error = void 0;
    state$1.loading = true;
    const requestVersion = ++state$1.requestVersion;
    onStateChange == null ? void 0 : onStateChange();
    let dataUrl;
    try {
      dataUrl = await captureViewportRect(state$1.screenshotRect);
    } catch (error) {
      if (state$1.requestVersion === requestVersion) {
        state$1.loading = false;
        state$1.error = (error == null ? void 0 : error.message) || String(error);
        onStateChange == null ? void 0 : onStateChange();
      }
      return;
    }
    if (state$1.requestVersion !== requestVersion) {
      return;
    }
    const question = {
      question: "（截图识别）",
      options: [],
      imageUrls: [dataUrl],
      type: "unknown",
      fillTargets: []
    };
    const item = { question, fingerprint: "screenshot", loading: true };
    state$1.items = [item];
    state$1.fingerprint = void 0;
    state$1.question = question;
    state$1.answer = void 0;
    onStateChange == null ? void 0 : onStateChange();
    try {
      const info = await requestAiAnswerFromScreenshot(createProviderConfig(cfg), dataUrl, {
        questionType: cfg.questionMode === "multiple" ? "multiple" : "single"
      });
      if (state$1.requestVersion !== requestVersion) {
        return;
      }
      item.answer = createAnswerFromSearch(info);
      state$1.answer = item.answer;
    } catch (error) {
      if (state$1.requestVersion !== requestVersion) {
        return;
      }
      item.error = (error == null ? void 0 : error.message) || String(error);
      state$1.error = item.error;
    } finally {
      if (state$1.requestVersion === requestVersion) {
        item.loading = false;
        state$1.loading = false;
      }
    }
    onStateChange == null ? void 0 : onStateChange();
  }
  function createAiAnswerAssistantScript() {
    return new lib.Script({
      name: "🤖 AI答题助手",
      matches: [["所有页面", /.*/]],
      namespace: "common.aiAnswerAssistant",
      configs: {
        mode: {
          label: "模式",
          tag: "select",
          defaultValue: "display",
          options: [
            ["display", "仅展示答案"],
            ["fill", "允许手动填入"]
          ]
        },
        questionMode: {
          label: "识别模式",
          tag: "select",
          defaultValue: "single",
          options: [
            ["single", "单题识别"],
            ["multiple", "多题识别"]
          ]
        },
        screenshotHotkey: {
          label: "截图快捷键",
          defaultValue: DEFAULT_SCREENSHOT_HOTKEY,
          attrs: {
            placeholder: "点击后按下快捷键",
            readOnly: true,
            title: "点击此输入框，然后按下你想用的组合键（如 Alt+S、Ctrl+Shift+Q）。\n按 Esc / Backspace 清空（清空后关闭快捷键）。\n触发后进入拖拽框选，松手即自动截图提问。"
          },
          onload(config2) {
            const input = this;
            input.addEventListener("keydown", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (event.key === "Escape" || event.key === "Backspace" || event.key === "Delete") {
                config2.value = "";
                input.blur();
                return;
              }
              if (["Control", "Alt", "Shift", "Meta", "OS", "CapsLock"].includes(event.key)) {
                return;
              }
              config2.value = hotkeyFromEvent(event);
              input.blur();
            });
          }
        },
        recaptureHotkey: {
          label: "重新截图快捷键",
          defaultValue: DEFAULT_RECAPTURE_HOTKEY,
          attrs: {
            placeholder: "点击后按下快捷键",
            readOnly: true,
            title: "点击此输入框，然后按下你想用的组合键（如 Alt+R）。\n按 Esc / Backspace 清空（清空后关闭快捷键）。\n触发时：按上次框选过的区域重新截图提问（需先框选过一次）。"
          },
          onload(config2) {
            const input = this;
            input.addEventListener("keydown", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (event.key === "Escape" || event.key === "Backspace" || event.key === "Delete") {
                config2.value = "";
                input.blur();
                return;
              }
              if (["Control", "Alt", "Shift", "Meta", "OS", "CapsLock"].includes(event.key)) {
                return;
              }
              config2.value = hotkeyFromEvent(event);
              input.blur();
            });
          }
        },
        useUrlRule: {
          label: "按当前URL保存区域",
          attrs: { type: "checkbox" },
          defaultValue: false
        },
        hostnameRegionPath: {
          defaultValue: ""
        },
        urlRegionPath: {
          defaultValue: ""
        },
        activeGroup: {
          defaultValue: "0"
        },
        providerGroups: {
          defaultValue: JSON.stringify(createDefaultGroups())
        },
        providerCollapsed: {
          defaultValue: ""
        },
        settingsCollapsed: {
          defaultValue: ""
        },
        imageMode: {
          label: "图片发送方式",
          tag: "select",
          defaultValue: "links",
          options: [
            ["links", "仅发送图片链接"],
            ["vision", "多模态 image_url"],
            ["both", "链接 + image_url"]
          ]
        },
        streamResponse: {
          label: "流式响应",
          attrs: { type: "checkbox" },
          defaultValue: true
        },
        temperature: {
          label: "Temperature",
          attrs: { type: "number", min: 0, max: 2, step: 0.1 },
          defaultValue: 0.2
        },
        timeout: {
          label: "超时秒数",
          attrs: { type: "number", min: 5, step: 1 },
          defaultValue: 60
        },
        systemPrompt: {
          label: "系统提示词",
          tag: "textarea",
          defaultValue: DEFAULT_SYSTEM_PROMPT
        }
      },
      oncomplete() {
        if (window.top !== window.self) {
          return;
        }
        if (window.__ocsAiHotkeyBound) {
          return;
        }
        window.__ocsAiHotkeyBound = true;
        const script2 = this;
        const rerender = () => {
          const panel = script2.panel;
          if (panel) {
            renderPanel(panel, script2);
          }
        };
        const startPicker = () => {
          startRectScreenshotPicker(async (rect) => {
            state$1.screenshotRect = rect;
            rerender();
            await captureAndAsk(script2, rerender);
            rerender();
          });
        };
        const recapture = async () => {
          if (!state$1.screenshotRect) {
            lib.$message.warn({ content: "还没有框选过区域，请先用“拖拽框选截图”或截图快捷键框选一次。" });
            return;
          }
          await captureAndAsk(script2, rerender);
          rerender();
        };
        document.addEventListener("keydown", (event) => {
          const cfg = script2.cfg;
          const target = event.target;
          if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
            return;
          }
          if (cfg.screenshotHotkey && matchHotkey(event, cfg.screenshotHotkey)) {
            event.preventDefault();
            event.stopPropagation();
            startPicker();
          } else if (cfg.recaptureHotkey && matchHotkey(event, cfg.recaptureHotkey)) {
            event.preventDefault();
            event.stopPropagation();
            recapture();
          }
        });
      },
      onrender({ panel }) {
        renderPanel(panel, this);
      }
    });
  }
  const CommonProject = lib.Project.create({
    name: "通用",
    domains: [],
    scripts: {
      render: RenderScript,
      aiAnswerAssistant: createAiAnswerAssistantScript()
    }
  });
  const state = {
    console: {
      listenerIds: {
        logs: 0
      }
    }
  };
  const BackgroundProject = lib.Project.create({
    name: "后台",
    domains: [],
    scripts: {
      console: new lib.Script({
        name: "📄 日志输出",
        matches: [["所有", /.*/]],
        namespace: "render.console",
        configs: {
          logs: {
            defaultValue: []
          }
        },
        onrender({ panel }) {
          const getTypeDesc = (type) => type === "info" ? "信息" : type === "error" ? "错误" : type === "warn" ? "警告" : type === "debug" ? "调试" : "日志";
          const createLog = (log) => {
            const date = new Date(log.time);
            const item = lib.h(
              "div",
              {
                title: "双击复制日志信息",
                className: "item"
              },
              [
                lib.h(
                  "span",
                  { className: "time" },
                  `${date.getHours().toFixed(0).padStart(2, "0")}:${date.getMinutes().toFixed(0).padStart(2, "0")} `
                ),
                lib.h("span", { className: log.type }, `[${getTypeDesc(log.type)}]`),
                lib.h("span", ":" + log.content)
              ]
            );
            item.addEventListener("dblclick", () => {
              navigator.clipboard.writeText(
                Object.keys(log).map((k) => `${k}: ${log[k]}`).join("\n")
              );
            });
            return item;
          };
          const showLogs = () => {
            const div2 = lib.h("div", { className: "card console" });
            const logs2 = this.cfg.logs.map((log) => createLog(log));
            if (logs2.length) {
              div2.replaceChildren(...logs2);
            } else {
              div2.replaceChildren(
                lib.h("div", "暂无任何日志", (div3) => {
                  div3.style.textAlign = "center";
                })
              );
            }
            return { div: div2, logs: logs2 };
          };
          const isScrollBottom = (div2) => {
            const { scrollHeight, scrollTop, clientHeight } = div2;
            return scrollTop + clientHeight + 50 > scrollHeight;
          };
          const { div, logs } = showLogs();
          this.offConfigChange(state.console.listenerIds.logs);
          state.console.listenerIds.logs = this.onConfigChange("logs", (logs2) => {
            const log = createLog(logs2[logs2.length - 1]);
            div.append(log);
            setTimeout(() => {
              if (isScrollBottom(div)) {
                log.scrollIntoView();
              }
            }, 10);
          });
          const show = () => {
            panel.body.replaceChildren(div);
            setTimeout(() => {
              var _a;
              (_a = logs[logs.length - 1]) == null ? void 0 : _a.scrollIntoView();
            }, 10);
          };
          show();
        }
      }),
      errorHandle: new lib.Script({
        name: "全局错误捕获",
        matches: [["", /.*/]],
        hideInPanel: true,
        onstart() {
          const projects = definedProjects();
          for (const project2 of projects) {
            for (const key in project2.scripts) {
              if (Object.prototype.hasOwnProperty.call(project2.scripts, key)) {
                const script2 = project2.scripts[key];
                script2.on("scripterror", (err) => {
                  const msg = `[${project2.name} - ${script2.name}] : ${err}`;
                  console.error(msg);
                  $console.error(msg);
                });
              }
            }
          }
        }
      })
    }
  });
  const $console = new Proxy({}, {
    get(target, key) {
      return (...msg) => {
        var _a;
        let logs = BackgroundProject.scripts.console.cfg.logs;
        if (logs.length > 50) {
          logs = logs.slice(-50);
        }
        const stack_str = Error().stack || "";
        const stacks = (_a = stack_str.replace("Error", "").match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/g)) == null ? void 0 : _a.map((s) => {
          const match = s.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/) || [];
          return [match[1], match[2], match[3]];
        });
        logs = logs.concat({
          type: key.toString(),
          content: msg.join(" "),
          time: Date.now(),
          stack: JSON.stringify([stack_str.split("\n")[0], ...stacks || []])
        });
        BackgroundProject.scripts.console.cfg.logs = logs;
      };
    }
  });
  function definedProjects() {
    return [CommonProject, BackgroundProject];
  }
  exports2.$ = $;
  exports2.$const = $const;
  exports2.$elements = lib.$elements;
  exports2.$store = lib.$store;
  exports2.$string = $string;
  exports2.BackgroundProject = BackgroundProject;
  exports2.CommonProject = CommonProject;
  exports2.RenderScript = RenderScript;
  exports2.StringUtils = StringUtils;
  exports2.answerExactMatch = answerExactMatch;
  exports2.answerSimilar = answerSimilar;
  exports2.captureViewportRect = captureViewportRect;
  exports2.clearString = clearString;
  exports2.collectImageUrls = collectImageUrls;
  exports2.createAiAnswerAssistantScript = createAiAnswerAssistantScript;
  exports2.createAiChatMessages = createAiChatMessages;
  exports2.createAiSearchInformation = createAiSearchInformation;
  exports2.createElementSelectorPath = createElementSelectorPath;
  exports2.createQuestionFingerprint = createQuestionFingerprint;
  exports2.createRegionQuestionObserver = createRegionQuestionObserver;
  exports2.defaultWorkTypeResolver = defaultWorkTypeResolver;
  exports2.definedProjects = definedProjects;
  exports2.domSearch = domSearch;
  exports2.domSearchAll = domSearchAll;
  exports2.fillAiAnswer = fillAiAnswer;
  exports2.isPlainAnswer = isPlainAnswer;
  exports2.normalizeChatCompletionsURL = normalizeChatCompletionsURL;
  exports2.parseAiAnswerContent = parseAiAnswerContent;
  exports2.parseOpenAIStreamContent = parseOpenAIStreamContent;
  exports2.recognizeAiQuestion = recognizeAiQuestion;
  exports2.recognizeAiQuestions = recognizeAiQuestions;
  exports2.releaseCaptureStream = releaseCaptureStream;
  exports2.removeRedundant = removeRedundant;
  exports2.request = request;
  exports2.requestAiAnswer = requestAiAnswer;
  exports2.requestAiAnswerFromScreenshot = requestAiAnswerFromScreenshot;
  exports2.resolveActiveQuestionElement = resolveActiveQuestionElement;
  exports2.resolveElementFromClientRect = resolveElementFromClientRect;
  exports2.resolveElementSelectorPath = resolveElementSelectorPath;
  exports2.resolvePlainAnswer = resolvePlainAnswer;
  exports2.resolveQuestionContainer = resolveQuestionContainer;
  exports2.splitAnswer = splitAnswer;
  exports2.start = lib.start;
  exports2.startRectRegionPicker = startRectRegionPicker;
  exports2.startRectScreenshotPicker = startRectScreenshotPicker;
  exports2.startRegionPicker = startRegionPicker;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});


const STYLE = `/** 默认字体 */
/** 输入框默认边距 */
ul,
ol {
	line-height: 26px;
	padding-left: 22px;
	margin: 0px;
}
a {
	color: #1890ff;
}
hr {
	border-style: solid;
	border-color: #63636346;
	border-width: 0px;
	border-bottom: 1px solid #63636346;
	margin-block-start: 1em;
	margin-block-end: 1em;
}
.base-style-active-form-control {
	border: 1px solid #ffffff00;
}
.base-style-active-form-control:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.base-style-active-form-control:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.base-style-active-form-control:hover {
	background-color: #ebeef4;
}
.base-style-input {
	outline: none;
	border: 1px solid #ffffff00;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
}
.base-style-input::placeholder {
	color: #bababa;
}
.base-style-switch {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	width: fit-content;
	min-width: 36px;
	height: 20px;
	border-radius: 100px;
	display: flex;
	align-items: center;
	padding: 2px 4px;
	transition: all 0.2s ease-in-out;
	width: auto;
	background: gainsboro;
}
.base-style-switch:checked {
	background: #1890ff;
}
.base-style-switch:disabled {
	background-color: #f7f7f78b;
}
.base-style-switch:checked::before {
	transform: translate(100%, 0px);
}
.base-style-switch::before {
	background-color: #fff;
	border-radius: 9px;
	box-shadow: 0 2px 4px #00230b33;
	width: 14px;
	height: 14px;
	content: '';
}
.base-style-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
.base-style-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.base-style-button + .base-style-button {
	margin-left: 12px;
}
.base-style-button:hover {
	background-color: #7abbff24;
}
.base-style-button.danger:hover {
	background-color: #ffdede86;
}
.base-style-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.base-style-button.danger {
	color: #f36669;
	border-color: #dd5a5d;
}
.base-style-button:disabled:active {
	box-shadow: none;
}
.base-style-button-secondary {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
	color: gray;
	background-color: white;
	border: 1px solid #dcdcdc;
}
.base-style-button-secondary:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.base-style-button-secondary + .base-style-button-secondary {
	margin-left: 12px;
}
.base-style-button-secondary:hover {
	background-color: #7abbff24;
}
.base-style-button-secondary.danger:hover {
	background-color: #ffdede86;
}
.base-style-button-secondary:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.base-style-button-secondary.danger {
	color: #f36669;
	border-color: #dd5a5d;
}
.base-style-button-secondary:disabled:active {
	box-shadow: none;
}
container-element.hidden {
	display: none;
}
container-element.minimize {
	min-width: unset;
}
container-element {
	position: fixed;
	top: 10%;
	left: 10%;
	z-index: 99999;
	text-align: left;
	min-width: 300px;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #636363;
	box-shadow: 0 0 24px -12px #3f3f3f;
	border-radius: 8px;
	letter-spacing: 0.5px;
	border: 1px solid #c1c1c1;
}
header-element {
	display: flex;
	align-items: center;
	background-color: white;
	border-radius: 8px 8px 0px 0px;
	user-select: none;
	padding: 4px;
	padding-bottom: 0px;
}
header-element .extra-menu-bar {
	width: 100%;
	padding: 4px;
	padding-bottom: 0px;
	margin-top: 4px;
	border-top: 1px solid #e8e8e8;
	/** 默认隐藏，一直到需要激活的时候再更改 */
	display: none;
}
header-element .extra-menu-bar .script-panel-link {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
	color: gray;
	background-color: white;
	border: 1px solid #dcdcdc;
	padding-bottom: 2px;
	margin-bottom: 0px;
}
header-element .extra-menu-bar .script-panel-link:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
header-element .extra-menu-bar .script-panel-link + header-element .extra-menu-bar .script-panel-link {
	margin-left: 12px;
}
header-element .extra-menu-bar .script-panel-link:hover {
	background-color: #7abbff24;
}
header-element .extra-menu-bar .script-panel-link.danger:hover {
	background-color: #ffdede86;
}
header-element .extra-menu-bar .script-panel-link:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
header-element .extra-menu-bar .script-panel-link.danger {
	color: #f36669;
	border-color: #dd5a5d;
}
header-element .extra-menu-bar .script-panel-link:disabled:active {
	box-shadow: none;
}
header-element .extra-menu-bar .script-panel-link.active {
	background-color: #1890ff1a;
	border-color: #1890ff;
	color: #1890ff;
}
header-element .extra-menu-bar .script-panel-link + .script-panel-link {
	margin-left: 4px;
}
header-element .profile {
	flex: 1;
	cursor: move;
}
header-element .switch:hover,
header-element .dropdown:hover {
	background-color: #f3f3f3;
}
header-element .close:hover {
	background-color: #ff000038;
}
header-element .switch,
header-element .close {
	cursor: pointer;
}
header-element .dropdown {
	line-height: 24px;
	text-decoration: underline;
}
header-element .switch,
header-element .close,
header-element .profile {
	display: inline-flex;
	align-items: center;
	padding: 0px 8px;
}
.logo {
	width: 18px;
	height: 18px;
	cursor: pointer;
}
.project-selector {
	display: flex;
	align-items: center;
}
.project-selector select {
	background: #ffffff00;
	border-radius: 4px;
	border: 1px solid #63636346;
	padding: 4px;
}
.project-selector.expand-all {
	display: none;
}
.body {
	overflow: auto;
	width: auto;
	height: 100%;
}
script-panel-element {
	display: block;
	background-color: white;
	border-radius: 0px 0px 8px 8px;
	padding: 0px 8px 12px 8px;
	overflow: auto;
}
script-panel-element .script-panel-body {
	padding: 0px 8px;
}
script-panel-element + script-panel-element {
	margin-top: 12px;
}
.card + .card {
	margin-top: 12px;
}
.card {
	background-color: white;
	border-radius: 2px;
	padding: 0px 8px;
}
.notes {
	background: #0099ff0e;
	border-left: 4px solid #0099ff65;
	width: -webkit-fill-available;
	margin: 0px 8px;
	line-height: 26px;
	letter-spacing: 1px;
}
.secondary {
	font-size: 12px;
	color: #8b8b8b;
}
.tooltip-container {
	z-index: 99999999999999;
	margin: 12px 0px 0px 12px;
	padding: 4px;
	color: black;
	background: #f0f0f0;
	box-shadow: 0px 0px 4px #949494;
	position: fixed;
	white-space: normal;
	max-width: 200px;
	height: auto;
	border-radius: 2px;
	line-height: 18px;
}
.configs-container.lock {
	filter: blur(1px);
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
}
.configs-container .lock-wrapper {
	cursor: not-allowed !important;
	border-radius: 4px;
	position: absolute;
	left: 0px;
	z-index: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.configs-container .lock-message {
	background-color: #ffffff7d;
	border-radius: 4px;
	box-shadow: 0px 0px 12px #6a6a6a98;
	padding: 2px;
}
.configs {
	display: table;
	background: #e1e1e107;
	width: -webkit-fill-available;
}
.configs .configs-body {
	display: table-row-group;
}
.configs .configs-body config-element + config-element label {
	padding-top: 4px;
}
.configs .configs-body config-element + config-element .config-wrapper {
	padding-top: 4px;
}
.configs .configs-body config-element {
	width: 100%;
	display: table-row;
	line-height: 26px;
}
.configs .configs-body config-element label {
	white-space: nowrap;
	color: #4e5969;
	display: table-cell;
	padding-right: 12px;
	text-align: left;
	vertical-align: top;
	margin-right: 12px;
}
.configs .configs-body config-element .config-wrapper {
	display: table-cell;
	vertical-align: middle;
	/** check box 的样式 */
}
.configs .configs-body config-element .config-wrapper select {
	outline: none;
	border: none;
	border: 1px solid #e4e4e4;
	border-radius: 4px;
	padding: 2px 8px;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper select:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs .configs-body config-element .config-wrapper select:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper select:hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper textarea {
	padding: 2px 8px;
	outline: none;
	border: none;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper textarea:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs .configs-body config-element .config-wrapper textarea:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper textarea:hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']) {
	outline: none;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	border: 1px solid #ffffff00;
}
.configs .configs-body config-element .config-wrapper input:not([type='button'])::placeholder {
	color: #bababa;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
.configs
	.configs-body
	config-element
	.config-wrapper
	input:not([type='button']):focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
.configs .configs-body config-element .config-wrapper input:not([type='button']):hover {
	background-color: #ebeef4;
}
.configs .configs-body config-element .config-wrapper input[type='range'] {
	padding: 0px;
}
.configs .configs-body config-element .config-wrapper input[type='button'] {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
.configs
	.configs-body
	config-element
	.config-wrapper
	input[type='button']
	+ .configs
	.configs-body
	config-element
	.config-wrapper
	input[type='button'] {
	margin-left: 12px;
}
.configs .configs-body config-element .config-wrapper input[type='button']:hover {
	background-color: #7abbff24;
}
.configs .configs-body config-element .config-wrapper input[type='button'].danger:hover {
	background-color: #ffdede86;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
.configs .configs-body config-element .config-wrapper input[type='button'].danger {
	color: #f36669;
	border-color: #dd5a5d;
}
.configs .configs-body config-element .config-wrapper input[type='button']:disabled:active {
	box-shadow: none;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'] {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	width: fit-content;
	min-width: 36px;
	height: 20px;
	border-radius: 100px;
	display: flex;
	align-items: center;
	padding: 2px 4px;
	transition: all 0.2s ease-in-out;
	width: auto;
	background: gainsboro;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked {
	background: #1890ff;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:disabled {
	background-color: #f7f7f78b;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']:checked::before {
	transform: translate(100%, 0px);
}
.configs .configs-body config-element .config-wrapper input[type='checkbox']::before {
	background-color: #fff;
	border-radius: 9px;
	box-shadow: 0 2px 4px #00230b33;
	width: 14px;
	height: 14px;
	content: '';
}
.configs .configs-body config-element .config-wrapper input:not([type='checkbox'], [type='radio']),
.configs .configs-body config-element .config-wrapper textarea,
.configs .configs-body config-element .config-wrapper select {
	width: -webkit-fill-available;
	font-size: inherit;
}
.configs .configs-body config-element .config-wrapper input[type='checkbox'],
.configs .configs-body config-element .config-wrapper input[type='radio'],
.configs .configs-body config-element .config-wrapper input[type='range'] {
	accent-color: #0e8ee2;
}
.configs .configs-body config-element .config-wrapper > *:not(.tooltip) {
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	float: right;
}
.configs .configs-body config-element .config-wrapper > *:disabled {
	cursor: not-allowed;
	background-color: #f7f7f78b;
}
.message-container {
	margin-bottom: 4px;
	position: absolute;
	bottom: 100%;
	left: 50%;
	width: 100%;
	transform: translate(-50%, 0px);
	min-width: 300px;
}
.message-container message-element {
	display: flex;
	border-radius: 4px;
	padding: 4px 12px;
	margin-bottom: 4px;
}
.message-container message-element .message-content-container {
	margin-right: 8px;
	flex: auto;
}
.message-container message-element .message-text {
	letter-spacing: 1px;
	font-weight: bold;
}
.message-container message-element .message-closer {
	width: 18px;
	min-width: 18px;
	cursor: pointer;
	background-color: #ffffffb3;
	color: #a1a1a1;
	border-radius: 100%;
	text-align: center;
	height: 18px;
	vertical-align: middle;
	font-size: 12px;
}
.message-container message-element.error {
	background-color: #ffe6e6;
	color: #c70208;
	border: 1px solid #ff6b6ded;
}
.message-container message-element.info {
	background-color: #c9e7ff;
	color: #004d95;
	border: 1px solid #1890ff69;
}
.message-container message-element.success {
	background-color: #e8ffe0;
	color: #3e8d0d;
	border: 1px solid #6fd91d;
}
.message-container message-element.warn {
	background-color: #ffefc8;
	color: #9b7400;
	border: 1px solid #ffc107;
}
modal-element {
	position: absolute;
	top: 50%;
	left: 50%;
	background-color: white;
	border-radius: 4px;
	box-shadow: 0px 0px 24px -12px black;
	border: 1px solid #929292;
	height: fit-content;
	transform: translate(-50%, -50%);
	padding: 12px 18px 18px 18px;
	font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
	z-index: 99999999999;
	line-height: 24px;
}
modal-element .modal-profile {
	zoom: 0.9;
	color: #969696;
	user-select: none;
	margin-bottom: 4px;
}
modal-element .modal-title {
	font-size: 18px;
	font-weight: bold;
	user-select: none;
}
modal-element .modal-body {
	margin: 12px 0px;
	overflow: auto;
}
modal-element .modal-footer {
	display: flex;
	white-space: nowrap;
	justify-content: end;
	align-items: end;
}
modal-element .modal-footer > * + * {
	margin-left: 12px;
}
modal-element .modal-input {
	outline: none;
	padding: 2px 8px;
	margin: 0px;
	background-color: #eef2f7;
	border-radius: 2px;
	color: black;
	border: 1px solid #ffffff00;
	width: -webkit-fill-available;
}
modal-element .modal-input::placeholder {
	color: #bababa;
}
modal-element .modal-input:focus {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
}
modal-element .modal-input:focus:not([type='checkbox'], [type='radio']) {
	border: 1px solid #0e8de290;
	box-shadow: 0px 0px 4px #0e8de252;
	background-color: white !important;
}
modal-element .modal-input:hover {
	background-color: #ebeef4;
}
modal-element .modal-cancel-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
	color: gray;
	background-color: white;
	border: 1px solid #dcdcdc;
}
modal-element .modal-cancel-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
modal-element .modal-cancel-button + modal-element .modal-cancel-button {
	margin-left: 12px;
}
modal-element .modal-cancel-button:hover {
	background-color: #7abbff24;
}
modal-element .modal-cancel-button.danger:hover {
	background-color: #ffdede86;
}
modal-element .modal-cancel-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
modal-element .modal-cancel-button.danger {
	color: #f36669;
	border-color: #dd5a5d;
}
modal-element .modal-cancel-button:disabled:active {
	box-shadow: none;
}
modal-element .modal-confirm-button {
	appearance: none;
	-moz-appearance: none;
	-webkit-appearance: none;
	border-radius: 4px;
	background-color: white;
	border: 1px solid #2c92ff;
	color: #409eff;
	cursor: pointer !important;
	margin-bottom: 4px;
}
modal-element .modal-confirm-button:active {
	box-shadow: 0px 0px 8px #0e8de2a5;
}
modal-element .modal-confirm-button + modal-element .modal-confirm-button {
	margin-left: 12px;
}
modal-element .modal-confirm-button:hover {
	background-color: #7abbff24;
}
modal-element .modal-confirm-button.danger:hover {
	background-color: #ffdede86;
}
modal-element .modal-confirm-button:disabled {
	background-color: white;
	border: 1px solid #c0c0c0;
	color: #aeaeae;
	cursor: not-allowed;
}
modal-element .modal-confirm-button.danger {
	color: #f36669;
	border-color: #dd5a5d;
}
modal-element .modal-confirm-button:disabled:active {
	box-shadow: none;
}
modal-element.alert .modal-input,
modal-element.alert .modal-cancel-button {
	display: none;
}
modal-element.alert .modal-confirm-button {
	margin: 0;
}
modal-element.prompt .modal-input,
modal-element.prompt .modal-cancel-button,
modal-element.prompt .modal-confirm-button {
	display: block;
}
modal-element.confirm .modal-input {
	display: none;
}
.modal-wrapper {
	width: 100%;
	height: 100%;
	z-index: 9999;
	position: fixed;
	top: 0px;
	left: 0px;
	z-index: 9999999;
	background-color: rgba(0, 0, 0, 0.265);
	color: #636363;
	font: 14px Menlo, Monaco, Consolas, 'Courier New', monospace;
}
.pointer {
	cursor: pointer;
}
.separator {
	display: flex;
	align-items: center;
	text-align: center;
	padding: 4px 0px 8px 0px;
}
.separator::before,
.separator::after {
	content: '';
	flex: 1;
	border-bottom: 1px solid #63636346;
}
.separator:not(:empty)::before {
	margin-right: 0.25em;
}
.separator:not(:empty)::after {
	margin-left: 0.25em;
}
container-element.minimize .body,
container-element.minimize header-element .dropdown,
container-element.minimize .footer {
	display: none;
}
container-element.minimize header-element {
	padding: 8px;
	border-radius: 8px;
	box-shadow: 0px 0px 24px -12px black;
}
.user-guide > li {
	padding: 4px 0px;
}
.search-infos-num {
	width: 26px;
	margin: 2px;
	height: 20px;
	border-radius: 4px;
	display: inline-block;
	background-color: white;
	text-align: center;
	cursor: pointer;
	border: 1px solid #b6b6b6;
}
.search-infos-num.requested {
	border: 1px solid #63b4ff;
	color: #63b4ff;
}
.search-infos-num.active {
	background-color: #127de1 !important;
	color: white;
}
.search-infos-num.error {
	border: 1px solid #ff8789ed;
	background-color: #ff6b6ded;
	color: white;
}
.search-infos-num.finish {
	background-color: #63b4ff;
	border: 1px solid #63b4ff;
	color: white;
}
search-infos-element {
	display: block;
	overflow: auto;
}
search-infos-element .search-result {
	margin-bottom: 12px;
	padding-left: 12px;
}
search-infos-element .search-result .question {
	font-weight: bold;
	max-height: 200px;
	overflow: auto;
}
search-infos-element .search-result .answer {
	color: #7c7c7c;
}
search-infos-element .search-result .answer code {
	border-bottom: 1px solid #dcdcdc;
	padding: 2px 0px;
	border-radius: 2px;
	margin: 4px;
	line-height: 22px;
}
search-infos-element .search-result .answer code + code {
	margin-left: 4px;
}
search-infos-element .search-result .search-result-answer-tag {
	padding: 2px 6px;
	border-radius: 2px;
	font-size: 12px;
	cursor: pointer;
	margin-right: 6px;
}
search-infos-element .search-result .search-result-answer-tag + .search-result-answer-tag {
	margin-left: 4px;
}
search-infos-element .search-result .search-result-answer-tag.blue {
	background-color: #e6f7ff;
	border: 1px solid #91d5ff;
	color: #1890ff;
}
search-infos-element .search-result .search-result-answer-tag.green {
	background-color: #f6ffed;
	border: 1px solid #b7eb8f;
	color: #52c41a;
}
search-infos-element .search-result .search-result-answer-tag.gray {
	background-color: #fafafa;
	border: 1px solid #d9d9d9;
	color: #595959;
}
search-infos-element .search-result .search-result-answer-tag.red {
	background-color: #fff1f0;
	border: 1px solid #ffa39e;
	color: #ff4d4f;
}
search-infos-element .search-result .search-result-answer-tag.yellow {
	background-color: #fffbe6;
	border: 1px solid #ffe58f;
	color: #faad14;
}
search-infos-element .search-result-question-type {
	background-color: #e6f7ff;
	border: 1px solid #91d5ff;
	color: #1890ff;
	margin-right: 8px;
	padding: 0px 4px;
	border-radius: 4px;
}
search-infos-element .error {
	color: #ff6b6ded;
	display: inline-block;
	padding-left: 12px;
}
.copy,
.question-title-extra-btn {
	margin-left: 4px;
	padding: 2px 4px;
	border-radius: 2px;
	box-shadow: 0 0 4px #b1b1b1;
	cursor: pointer !important;
	font-weight: normal;
	font-size: 12px;
}
.work-result-question-container {
	position: absolute;
	width: 400px;
	left: -100%;
	top: 0px;
	background: white;
	border: 1px solid #cbcbcb;
	border-radius: 4px;
	box-shadow: 0px 0px 12px #d1cfcf;
	padding: 12px;
}
.work-result-question-container .close-search-result {
	font-size: 12px;
	margin-left: 8px;
	text-decoration: underline;
	color: gray;
	cursor: pointer;
}
.work-result-list {
	max-height: 400px;
	overflow: auto;
	margin: 12px 0px;
	padding: 6px;
	border: 1px solid #e1e1e1;
	border-radius: 4px;
}
.search-info-title {
	border: 1px solid #e1e1e1;
	border-radius: 4px;
	padding: 8px 12px;
	margin-bottom: 12px;
	line-height: 20px;
	max-height: 400px;
	overflow: auto;
}
.search-info-details {
	margin-left: 4px;
}
.console {
	max-height: 300px;
	max-width: 400px;
	overflow: auto;
	background-color: #292929;
	padding: 12px 6px;
	color: #ececec;
	font-size: 12px;
}
.console .item {
	padding: 3px 0px;
	border-radius: 2px;
}
.console .item .time {
	color: #757575;
}
.console .item .info {
	background-color: #2196f3a3;
}
.console .item .warn {
	background-color: #ffc107db;
}
.console .item .error {
	background-color: #f36c71cc;
}
.console .item .debug,
.console .item .log {
	background-color: #9e9e9ec4;
}
.console *::selection {
	background-color: #ffffff6b;
}
.markdown {
	max-width: 400px;
	max-height: 50vh;
	overflow: auto;
}
.markdown code {
	padding: 2px 4px;
	background-color: #f0f0f0;
	border-radius: 6px;
	font-size: 12px;
}
.markdown blockquote {
	padding: 4px 4px 4px 12px;
	margin: 0px;
	color: #b5b5b5;
	border-left: #ababab 2px solid;
}
.markdown blockquote p {
	margin: 0px;
}
.markdown h1,
.markdown h2,
.markdown h3,
.markdown h4,
.markdown h5,
.markdown h6,
.markdown p {
	margin: 8px 0px;
}
.dropdown {
	position: relative;
	display: inline-block;
}
.dropdown.active .dropdown-trigger-element {
	color: #1890ff;
}
.dropdown-trigger-element {
	cursor: pointer;
}
.dropdown-content {
	display: none;
	position: absolute;
	background-color: #ffffff;
	overflow: auto;
	box-shadow: 0px 8px 16px 0px #00000033;
	z-index: 1;
	border-radius: 4px;
	padding: 8px 12px;
	min-width: 120px;
}
.dropdown-content.show {
	display: block;
}
.dropdown-content {
	cursor: pointer;
	z-index: 999;
}
.dropdown-content .dropdown-option {
	padding-left: 4px;
	white-space: nowrap;
}
.dropdown-content .dropdown-option:hover {
	background-color: #f3f3f3;
}
.dropdown-content .dropdown-option.active {
	background-color: #1890ff1a;
	color: #1890ff;
}
.space {
	display: inline-flex;
}
.config-details {
	animation: fade-in 0.5s;
}
.config-details label {
	padding-left: 12px;
}
.alert-info-wrapper {
	margin-bottom: 8px;
}
.alert-info-wrapper .result-info {
	padding: 12px;
	text-align: center;
	border-radius: 6px;
}
.alert-info-wrapper .unresolved {
	color: #a1a1a1;
	background-color: #f7f7f7;
}
.alert-info-wrapper .no-answer {
	color: #a1a1a1;
	background-color: #f7f7f7;
}
.alert-info-wrapper .error {
	color: #ff4d4f;
	background-color: #fff1f0;
}
message-element {
	animation: show 0.5s;
}
script-panel-element > div,
script-panel-link,
container-element,
modal-element {
	animation: fade-in 0.3s;
}
@keyframes show {
	0% {
		transform: translateY(20px);
		opacity: 0;
	}
	100% {
		transform: translateY(0);
		opacity: 1;
	}
}
@keyframes fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
@keyframes fade-out {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
.checkbox-label {
	display: inline-block !important;
	position: relative;
	cursor: pointer;
	font-size: 16px;
	color: #2c3e50;
}
/* 隐藏原始复选框 */
.checkbox-input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}
/* 自定义按钮样式 */
.checkbox-label::after {
	content: '';
	display: inline-block;
	border-radius: 50%;
	transition: all 0.1s ease;
	position: relative;
	margin-left: 4px;
	vertical-align: middle;
}
/* 向下箭头（未选中状态） */
.checkbox-label::before {
	content: '🔽';
	position: absolute;
	width: 0;
	height: 0;
	right: 8px;
	transition: all 0.1s ease;
	z-index: 2;
}
/* 向上箭头（选中状态） */
.checked .checkbox-label::before {
	content: '🔼';
}

.ocs-ai-region-overlay {
	position: fixed;
	inset: 0;
	z-index: 2147483647;
	pointer-events: none;
}

.ocs-ai-region-box {
	position: fixed;
	display: none;
	border: 2px solid #2563eb;
	background: rgba(37, 99, 235, 0.12);
	box-sizing: border-box;
}

.ocs-ai-region-hover {
	outline: 2px solid #2563eb !important;
	outline-offset: 2px !important;
}

.ocs-ai-answer-card {
	border: 1px solid #d8dee8;
	border-radius: 4px;
	padding: 8px;
	margin-top: 8px;
	background: #fff;
}
`;

/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

// 环境检测
if (
	[
		'GM_getTab',
		'GM_saveTab',
		'GM_setValue',
		'GM_getValue',
		'unsafeWindow',
		'GM_listValues',
		'GM_deleteValue',
		'GM_notification',
		'GM_xmlhttpRequest',
		'GM_getResourceText',
		'GM_addValueChangeListener',
		'GM_removeValueChangeListener'
	].some((api) => typeof Reflect.get(globalThis, api) === 'undefined')
) {
	const open = confirm(
		`DPCC-OCS-AI 不支持当前的脚本管理器（${GM_info.scriptHandler}）。` +
			'请使用支持 GM_xmlhttpRequest 的脚本管理器，例如 “Scriptcat 脚本猫” 或者 “Tampermonkey 油猴”'
	);

	if (open) {
		window.location.href = 'https://docs.ocsjs.com/docs/script';
	}
	return;
}

const { start, CommonProject, BackgroundProject, RenderScript } = OCS;

const infos = GM_info;

(function () {
	'use strict';

	start({
		projects: [CommonProject, BackgroundProject],
		renderConfig: {
			renderScript: RenderScript,
			styles: [STYLE],
			defaultPanelName: CommonProject.scripts.aiAnswerAssistant.namespace,
			title: `DPCC-OCS-AI-${infos.script.version}`
		},
		updatePage: 'https://github.com/DUNHKpcc/ocs-ai-'
	});
})();
