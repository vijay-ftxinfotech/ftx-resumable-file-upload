(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var isCordova = function isCordova() {
      return typeof window != "undefined" && (typeof window.PhoneGap != "undefined" || typeof window.Cordova != "undefined" || typeof window.cordova != "undefined");
    };
    
    exports.default = isCordova;
    
    },{}],2:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
    
    exports.default = isReactNative;
    
    },{}],3:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /**
     * readAsByteArray converts a File object to a Uint8Array.
     * This function is only used on the Apache Cordova platform.
     * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
     */
    function readAsByteArray(chunk, callback) {
      var reader = new FileReader();
      reader.onload = function () {
        callback(null, new Uint8Array(reader.result));
      };
      reader.onerror = function (err) {
        callback(err);
      };
      reader.readAsArrayBuffer(chunk);
    }
    
    exports.default = readAsByteArray;
    
    },{}],4:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.newRequest = newRequest;
    exports.resolveUrl = resolveUrl;
    
    var _urlParse = _dereq_("url-parse");
    
    var _urlParse2 = _interopRequireDefault(_urlParse);
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    function newRequest() {
      return new window.XMLHttpRequest();
    } /* global window */
    
    
    function resolveUrl(origin, link) {
      return new _urlParse2.default(link, origin).toString();
    }
    
    },{"url-parse":16}],5:[function(_dereq_,module,exports){
    "use strict";
    
    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getSource = getSource;
    
    var _isReactNative = _dereq_("./isReactNative");
    
    var _isReactNative2 = _interopRequireDefault(_isReactNative);
    
    var _uriToBlob = _dereq_("./uriToBlob");
    
    var _uriToBlob2 = _interopRequireDefault(_uriToBlob);
    
    var _isCordova = _dereq_("./isCordova");
    
    var _isCordova2 = _interopRequireDefault(_isCordova);
    
    var _readAsByteArray = _dereq_("./readAsByteArray");
    
    var _readAsByteArray2 = _interopRequireDefault(_readAsByteArray);
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    
    var FileSource = function () {
      function FileSource(file) {
        _classCallCheck(this, FileSource);
    
        this._file = file;
        this.size = file.size;
      }
    
      _createClass(FileSource, [{
        key: "slice",
        value: function slice(start, end, callback) {
          // In Apache Cordova applications, a File must be resolved using
          // FileReader instances, see
          // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
          if ((0, _isCordova2.default)()) {
            (0, _readAsByteArray2.default)(this._file.slice(start, end), function (err, chunk) {
              if (err) return callback(err);
    
              callback(null, chunk);
            });
            return;
          }
    
          callback(null, this._file.slice(start, end));
        }
      }, {
        key: "close",
        value: function close() {}
      }]);
    
      return FileSource;
    }();
    
    var StreamSource = function () {
      function StreamSource(reader, chunkSize) {
        _classCallCheck(this, StreamSource);
    
        this._chunkSize = chunkSize;
        this._buffer = undefined;
        this._bufferOffset = 0;
        this._reader = reader;
        this._done = false;
      }
    
      _createClass(StreamSource, [{
        key: "slice",
        value: function slice(start, end, callback) {
          if (start < this._bufferOffset) {
            callback(new Error("Requested data is before the reader's current offset"));
            return;
          }
    
          return this._readUntilEnoughDataOrDone(start, end, callback);
        }
      }, {
        key: "_readUntilEnoughDataOrDone",
        value: function _readUntilEnoughDataOrDone(start, end, callback) {
          var _this = this;
    
          var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
          if (this._done || hasEnoughData) {
            var value = this._getDataFromBuffer(start, end);
            callback(null, value);
            return;
          }
          this._reader.read().then(function (_ref) {
            var value = _ref.value;
            var done = _ref.done;
    
            if (done) {
              _this._done = true;
            } else if (_this._buffer === undefined) {
              _this._buffer = value;
            } else {
              _this._buffer = concat(_this._buffer, value);
            }
    
            _this._readUntilEnoughDataOrDone(start, end, callback);
          }).catch(function (err) {
            callback(new Error("Error during read: " + err));
          });
        }
      }, {
        key: "_getDataFromBuffer",
        value: function _getDataFromBuffer(start, end) {
          // Remove data from buffer before `start`.
          // Data might be reread from the buffer if an upload fails, so we can only
          // safely delete data when it comes *before* what is currently being read.
          if (start > this._bufferOffset) {
            this._buffer = this._buffer.slice(start - this._bufferOffset);
            this._bufferOffset = start;
          }
          // If the buffer is empty after removing old data, all data has been read.
          var hasAllDataBeenRead = len(this._buffer) === 0;
          if (this._done && hasAllDataBeenRead) {
            return null;
          }
          // We already removed data before `start`, so we just return the first
          // chunk from the buffer.
          return this._buffer.slice(0, end - start);
        }
      }, {
        key: "close",
        value: function close() {
          if (this._reader.cancel) {
            this._reader.cancel();
          }
        }
      }]);
    
      return StreamSource;
    }();
    
    function len(blobOrArray) {
      if (blobOrArray === undefined) return 0;
      if (blobOrArray.size !== undefined) return blobOrArray.size;
      return blobOrArray.length;
    }
    
    /*
      Typed arrays and blobs don't have a concat method.
      This function helps StreamSource accumulate data to reach chunkSize.
    */
    function concat(a, b) {
      if (a.concat) {
        // Is `a` an Array?
        return a.concat(b);
      }
      if (a instanceof Blob) {
        return new Blob([a, b], { type: a.type });
      }
      if (a.set) {
        // Is `a` a typed array?
        var c = new a.constructor(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
      }
      throw new Error("Unknown data type");
    }
    
    function getSource(input, chunkSize, callback) {
      // In React Native, when user selects a file, instead of a File or Blob,
      // you usually get a file object {} with a uri property that contains
      // a local path to the file. We use XMLHttpRequest to fetch
      // the file blob, before uploading with tus.
      // TODO: The __tus__forceReactNative property is currently used to force
      // a React Native environment during testing. This should be removed
      // once we move away from PhantomJS and can overwrite navigator.product
      // properly.
      if ((_isReactNative2.default || window.__tus__forceReactNative) && input && typeof input.uri !== "undefined") {
        (0, _uriToBlob2.default)(input.uri, function (err, blob) {
          if (err) {
            return callback(new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. " + err));
          }
          callback(null, new FileSource(blob));
        });
        return;
      }
    
      // Since we emulate the Blob type in our tests (not all target browsers
      // support it), we cannot use `instanceof` for testing whether the input value
      // can be handled. Instead, we simply check is the slice() function and the
      // size property are available.
      if (typeof input.slice === "function" && typeof input.size !== "undefined") {
        callback(null, new FileSource(input));
        return;
      }
    
      if (typeof input.read === "function") {
        chunkSize = +chunkSize;
        if (!isFinite(chunkSize)) {
          callback(new Error("cannot create source for stream without a finite value for the `chunkSize` option"));
          return;
        }
        callback(null, new StreamSource(input, chunkSize));
        return;
      }
    
      callback(new Error("source object may only be an instance of File, Blob, or Reader in this environment"));
    }
    
    },{"./isCordova":1,"./isReactNative":2,"./readAsByteArray":3,"./uriToBlob":7}],6:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.setItem = setItem;
    exports.getItem = getItem;
    exports.removeItem = removeItem;
    /* global window, localStorage */
    
    var hasStorage = false;
    try {
      hasStorage = "localStorage" in window;
    
      // Attempt to store and read entries from the local storage to detect Private
      // Mode on Safari on iOS (see #49)
      var key = "tusSupport";
      localStorage.setItem(key, localStorage.getItem(key));
    } catch (e) {
      // If we try to access localStorage inside a sandboxed iframe, a SecurityError
      // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
      // thrown (see #49)
      if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
        hasStorage = false;
      } else {
        throw e;
      }
    }
    
    var canStoreURLs = exports.canStoreURLs = hasStorage;
    
    function setItem(key, value) {
      if (!hasStorage) return;
      return localStorage.setItem(key, value);
    }
    
    function getItem(key) {
      if (!hasStorage) return;
      return localStorage.getItem(key);
    }
    
    function removeItem(key) {
      if (!hasStorage) return;
      return localStorage.removeItem(key);
    }
    
    },{}],7:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    /**
     * uriToBlob resolves a URI to a Blob object. This is used for
     * React Native to retrieve a file (identified by a file://
     * URI) as a blob.
     */
    function uriToBlob(uri, done) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = "blob";
      xhr.onload = function () {
        var blob = xhr.response;
        done(null, blob);
      };
      xhr.onerror = function (err) {
        done(err);
      };
      xhr.open("GET", uri);
      xhr.send();
    }
    
    exports.default = uriToBlob;
    
    },{}],8:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    
    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
    
    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
    
    var DetailedError = function (_Error) {
      _inherits(DetailedError, _Error);
    
      function DetailedError(error) {
        var causingErr = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
        var xhr = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
    
        _classCallCheck(this, DetailedError);
    
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DetailedError).call(this, error.message));
    
        _this.originalRequest = xhr;
        _this.causingError = causingErr;
    
        var message = error.message;
        if (causingErr != null) {
          message += ", caused by " + causingErr.toString();
        }
        if (xhr != null) {
          message += ", originated from request (response code: " + xhr.status + ", response text: " + xhr.responseText + ")";
        }
        _this.message = message;
        return _this;
      }
    
      return DetailedError;
    }(Error);
    
    exports.default = DetailedError;
    
    },{}],9:[function(_dereq_,module,exports){
    "use strict";
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = fingerprint;
    /**
     * Generate a fingerprint for a file which will be used the store the endpoint
     *
     * @param {File} file
     * @return {String}
     */
    function fingerprint(file, options) {
      return ["tus", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-");
    }
    
    },{}],10:[function(_dereq_,module,exports){
    "use strict";
    
    var _upload = _dereq_("./upload");
    
    var _upload2 = _interopRequireDefault(_upload);
    
    var _storage = _dereq_("./node/storage");
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    /* global window */
    var defaultOptions = _upload2.default.defaultOptions;
    
    var isSupported = void 0;
    
    if (typeof window !== "undefined") {
      // Browser environment using XMLHttpRequest
      var _window = window;
      var XMLHttpRequest = _window.XMLHttpRequest;
      var Blob = _window.Blob;
    
    
      isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === "function";
    } else {
      // Node.js environment using http module
      isSupported = true;
    }
    
    // The usage of the commonjs exporting syntax instead of the new ECMAScript
    // one is actually inteded and prevents weird behaviour if we are trying to
    // import this module in another module using Babel.
    module.exports = {
      Upload: _upload2.default,
      isSupported: isSupported,
      canStoreURLs: _storage.canStoreURLs,
      defaultOptions: defaultOptions
    };
    
    },{"./node/storage":6,"./upload":11}],11:[function(_dereq_,module,exports){
    "use strict";
    
    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */
    
    
    // We import the files used inside the Node environment which are rewritten
    // for browsers using the rules defined in the package.json
    
    
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    
    var _fingerprint = _dereq_("./fingerprint");
    
    var _fingerprint2 = _interopRequireDefault(_fingerprint);
    
    var _error = _dereq_("./error");
    
    var _error2 = _interopRequireDefault(_error);
    
    var _extend = _dereq_("extend");
    
    var _extend2 = _interopRequireDefault(_extend);
    
    var _jsBase = _dereq_("js-base64");
    
    var _request = _dereq_("./node/request");
    
    var _source = _dereq_("./node/source");
    
    var _storage = _dereq_("./node/storage");
    
    var Storage = _interopRequireWildcard(_storage);
    
    function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
    
    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    
    var defaultOptions = {
      endpoint: null,
      fingerprint: _fingerprint2.default,
      resume: true,
      onProgress: null,
      onChunkComplete: null,
      onSuccess: null,
      onError: null,
      headers: {},
      chunkSize: Infinity,
      withCredentials: false,
      uploadUrl: null,
      uploadSize: null,
      overridePatchMethod: false,
      retryDelays: null,
      removeFingerprintOnSuccess: false,
      uploadLengthDeferred: false
    };
    
    var Upload = function () {
      function Upload(file, options) {
        _classCallCheck(this, Upload);
    
        this.options = (0, _extend2.default)(true, {}, defaultOptions, options);
    
        // The underlying File/Blob object
        this.file = file;
    
        // The URL against which the file will be uploaded
        this.url = null;
    
        // The underlying XHR object for the current PATCH request
        this._xhr = null;
    
        // The fingerpinrt for the current file (set after start())
        this._fingerprint = null;
    
        // The offset used in the current PATCH request
        this._offset = null;
    
        // True if the current PATCH request has been aborted
        this._aborted = false;
    
        // The file's size in bytes
        this._size = null;
    
        // The Source object which will wrap around the given file and provides us
        // with a unified interface for getting its size and slice chunks from its
        // content allowing us to easily handle Files, Blobs, Buffers and Streams.
        this._source = null;
    
        // The current count of attempts which have been made. Null indicates none.
        this._retryAttempt = 0;
    
        // The timeout's ID which is used to delay the next retry
        this._retryTimeout = null;
    
        // The offset of the remote upload before the latest attempt was started.
        this._offsetBeforeRetry = 0;
      }
    
      _createClass(Upload, [{
        key: "start",
        value: function start() {
          var _this = this;
    
          var file = this.file;
    
          if (!file) {
            this._emitError(new Error("tus: no file or stream to upload provided"));
            return;
          }
    
          if (!this.options.endpoint && !this.options.uploadUrl) {
            this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));
            return;
          }
    
          if (this._source) {
            this._start(this._source);
          } else {
            (0, _source.getSource)(file, this.options.chunkSize, function (err, source) {
              if (err) {
                _this._emitError(err);
                return;
              }
    
              _this._source = source;
              _this._start(source);
            });
          }
        }
      }, {
        key: "_start",
        value: function _start(source) {
          var _this2 = this;
    
          var file = this.file;
    
          // First, we look at the uploadLengthDeferred option.
          // Next, we check if the caller has supplied a manual upload size.
          // Finally, we try to use the calculated size from the source object.
          if (this.options.uploadLengthDeferred) {
            this._size = null;
          } else if (this.options.uploadSize != null) {
            this._size = +this.options.uploadSize;
            if (isNaN(this._size)) {
              this._emitError(new Error("tus: cannot convert `uploadSize` option into a number"));
              return;
            }
          } else {
            this._size = source.size;
            if (this._size == null) {
              this._emitError(new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option"));
              return;
            }
          }
    
          var retryDelays = this.options.retryDelays;
          if (retryDelays != null) {
            if (Object.prototype.toString.call(retryDelays) !== "[object Array]") {
              this._emitError(new Error("tus: the `retryDelays` option must either be an array or null"));
              return;
            } else {
              (function () {
                var errorCallback = _this2.options.onError;
                _this2.options.onError = function (err) {
                  // Restore the original error callback which may have been set.
                  _this2.options.onError = errorCallback;
    
                  // We will reset the attempt counter if
                  // - we were already able to connect to the server (offset != null) and
                  // - we were able to upload a small chunk of data to the server
                  var shouldResetDelays = _this2._offset != null && _this2._offset > _this2._offsetBeforeRetry;
                  if (shouldResetDelays) {
                    _this2._retryAttempt = 0;
                  }
    
                  var isOnline = true;
                  if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
                    isOnline = false;
                  }
    
                  // We only attempt a retry if
                  // - we didn't exceed the maxium number of retries, yet, and
                  // - this error was caused by a request or it's response and
                  // - the error is not a client error (status 4xx) and
                  // - the browser does not indicate that we are offline
                  var shouldRetry = _this2._retryAttempt < retryDelays.length && err.originalRequest != null && !inStatusCategory(err.originalRequest.status, 400) && isOnline;
    
                  if (!shouldRetry) {
                    _this2._emitError(err);
                    return;
                  }
    
                  var delay = retryDelays[_this2._retryAttempt++];
    
                  _this2._offsetBeforeRetry = _this2._offset;
                  _this2.options.uploadUrl = _this2.url;
    
                  _this2._retryTimeout = setTimeout(function () {
                    _this2.start();
                  }, delay);
                };
              })();
            }
          }
    
          // Reset the aborted flag when the upload is started or else the
          // _startUpload will stop before sending a request if the upload has been
          // aborted previously.
          this._aborted = false;
    
          // The upload had been started previously and we should reuse this URL.
          if (this.url != null) {
            this._resumeUpload();
            return;
          }
    
          // A URL has manually been specified, so we try to resume
          if (this.options.uploadUrl != null) {
            this.url = this.options.uploadUrl;
            this._resumeUpload();
            return;
          }
    
          // Try to find the endpoint for the file in the storage
          if (this.options.resume) {
            this._fingerprint = this.options.fingerprint(file, this.options);
            var resumedUrl = Storage.getItem(this._fingerprint);
    
            if (resumedUrl != null) {
              this.url = resumedUrl;
              this._resumeUpload();
              return;
            }
          }
    
          // An upload has not started for the file yet, so we start a new one
          this._createUpload();
        }
      }, {
        key: "abort",
        value: function abort() {
          if (this._xhr !== null) {
            this._xhr.abort();
            this._source.close();
            this._aborted = true;
          }
    
          if (this._retryTimeout != null) {
            clearTimeout(this._retryTimeout);
            this._retryTimeout = null;
          }
        }
      }, {
        key: "_emitXhrError",
        value: function _emitXhrError(xhr, err, causingErr) {
          this._emitError(new _error2.default(err, causingErr, xhr));
        }
      }, {
        key: "_emitError",
        value: function _emitError(err) {
          if (typeof this.options.onError === "function") {
            this.options.onError(err);
          } else {
            throw err;
          }
        }
      }, {
        key: "_emitSuccess",
        value: function _emitSuccess() {
          if (typeof this.options.onSuccess === "function") {
            this.options.onSuccess();
          }
        }
    
        /**
         * Publishes notification when data has been sent to the server. This
         * data may not have been accepted by the server yet.
         * @param  {number} bytesSent  Number of bytes sent to the server.
         * @param  {number} bytesTotal Total number of bytes to be sent to the server.
         */
    
      }, {
        key: "_emitProgress",
        value: function _emitProgress(bytesSent, bytesTotal) {
          if (typeof this.options.onProgress === "function") {
            this.options.onProgress(bytesSent, bytesTotal);
          }
        }
    
        /**
         * Publishes notification when a chunk of data has been sent to the server
         * and accepted by the server.
         * @param  {number} chunkSize  Size of the chunk that was accepted by the
         *                             server.
         * @param  {number} bytesAccepted Total number of bytes that have been
         *                                accepted by the server.
         * @param  {number} bytesTotal Total number of bytes to be sent to the server.
         */
    
      }, {
        key: "_emitChunkComplete",
        value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
          if (typeof this.options.onChunkComplete === "function") {
            this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
          }
        }
    
        /**
         * Set the headers used in the request and the withCredentials property
         * as defined in the options
         *
         * @param {XMLHttpRequest} xhr
         */
    
      }, {
        key: "_setupXHR",
        value: function _setupXHR(xhr) {
          this._xhr = xhr;
    
          xhr.setRequestHeader("Tus-Resumable", "1.0.0");
          var headers = this.options.headers;
    
          for (var name in headers) {
            xhr.setRequestHeader(name, headers[name]);
          }
    
          xhr.withCredentials = this.options.withCredentials;
        }
    
        /**
         * Create a new upload using the creation extension by sending a POST
         * request to the endpoint. After successful creation the file will be
         * uploaded
         *
         * @api private
         */
    
      }, {
        key: "_createUpload",
        value: function _createUpload() {
          var _this3 = this;
    
          if (!this.options.endpoint) {
            this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));
            return;
          }
    
          var xhr = (0, _request.newRequest)();
          xhr.open("POST", this.options.endpoint, true);
    
          xhr.onload = function () {
            if (!inStatusCategory(xhr.status, 200)) {
              _this3._emitXhrError(xhr, new Error("tus: unexpected response while creating upload"));
              return;
            }
    
            var location = xhr.getResponseHeader("Location");
            if (location == null) {
              _this3._emitXhrError(xhr, new Error("tus: invalid or missing Location header"));
              return;
            }
    
            _this3.url = (0, _request.resolveUrl)(_this3.options.endpoint, location);
    
            if (_this3._size === 0) {
              // Nothing to upload and file was successfully created
              _this3._emitSuccess();
              _this3._source.close();
              return;
            }
    
            if (_this3.options.resume) {
              Storage.setItem(_this3._fingerprint, _this3.url);
            }
    
            _this3._offset = 0;
            _this3._startUpload();
          };
    
          xhr.onerror = function (err) {
            _this3._emitXhrError(xhr, new Error("tus: failed to create upload"), err);
          };
    
          this._setupXHR(xhr);
          if (this.options.uploadLengthDeferred) {
            xhr.setRequestHeader("Upload-Defer-Length", 1);
          } else {
            xhr.setRequestHeader("Upload-Length", this._size);
          }
    
          // Add metadata if values have been added
          var metadata = encodeMetadata(this.options.metadata);
          if (metadata !== "") {
            xhr.setRequestHeader("Upload-Metadata", metadata);
          }
    
          xhr.send(null);
        }
    
        /*
         * Try to resume an existing upload. First a HEAD request will be sent
         * to retrieve the offset. If the request fails a new upload will be
         * created. In the case of a successful response the file will be uploaded.
         *
         * @api private
         */
    
      }, {
        key: "_resumeUpload",
        value: function _resumeUpload() {
          var _this4 = this;
    
          var xhr = (0, _request.newRequest)();
          xhr.open("HEAD", this.url, true);
    
          xhr.onload = function () {
            if (!inStatusCategory(xhr.status, 200)) {
              if (_this4.options.resume && inStatusCategory(xhr.status, 400)) {
                // Remove stored fingerprint and corresponding endpoint,
                // on client errors since the file can not be found
                Storage.removeItem(_this4._fingerprint);
              }
    
              // If the upload is locked (indicated by the 423 Locked status code), we
              // emit an error instead of directly starting a new upload. This way the
              // retry logic can catch the error and will retry the upload. An upload
              // is usually locked for a short period of time and will be available
              // afterwards.
              if (xhr.status === 423) {
                _this4._emitXhrError(xhr, new Error("tus: upload is currently locked; retry later"));
                return;
              }
    
              if (!_this4.options.endpoint) {
                // Don't attempt to create a new upload if no endpoint is provided.
                _this4._emitXhrError(xhr, new Error("tus: unable to resume upload (new upload cannot be created without an endpoint)"));
                return;
              }
    
              // Try to create a new upload
              _this4.url = null;
              _this4._createUpload();
              return;
            }
    
            var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
            if (isNaN(offset)) {
              _this4._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
              return;
            }
    
            var length = parseInt(xhr.getResponseHeader("Upload-Length"), 10);
            if (isNaN(length) && !_this4.options.uploadLengthDeferred) {
              _this4._emitXhrError(xhr, new Error("tus: invalid or missing length value"));
              return;
            }
    
            // Upload has already been completed and we do not need to send additional
            // data to the server
            if (offset === length) {
              _this4._emitProgress(length, length);
              _this4._emitSuccess();
              return;
            }
    
            _this4._offset = offset;
            _this4._startUpload();
          };
    
          xhr.onerror = function (err) {
            _this4._emitXhrError(xhr, new Error("tus: failed to resume upload"), err);
          };
    
          this._setupXHR(xhr);
          xhr.send(null);
        }
    
        /**
         * Start uploading the file using PATCH requests. The file will be divided
         * into chunks as specified in the chunkSize option. During the upload
         * the onProgress event handler may be invoked multiple times.
         *
         * @api private
         */
    
      }, {
        key: "_startUpload",
        value: function _startUpload() {
          var _this5 = this;
    
          // If the upload has been aborted, we will not send the next PATCH request.
          // This is important if the abort method was called during a callback, such
          // as onChunkComplete or onProgress.
          if (this._aborted) {
            return;
          }
    
          var xhr = (0, _request.newRequest)();
    
          // Some browser and servers may not support the PATCH method. For those
          // cases, you can tell tus-js-client to use a POST request with the
          // X-HTTP-Method-Override header for simulating a PATCH request.
          if (this.options.overridePatchMethod) {
            xhr.open("POST", this.url, true);
            xhr.setRequestHeader("X-HTTP-Method-Override", "PATCH");
          } else {
            xhr.open("PATCH", this.url, true);
          }
    
          xhr.onload = function () {
            if (!inStatusCategory(xhr.status, 200)) {
              _this5._emitXhrError(xhr, new Error("tus: unexpected response while uploading chunk"));
              return;
            }
    
            var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
            if (isNaN(offset)) {
              _this5._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
              return;
            }
    
            _this5._emitProgress(offset, _this5._size);
            _this5._emitChunkComplete(offset - _this5._offset, offset, _this5._size);
    
            _this5._offset = offset;
    
            if (offset == _this5._size) {
              if (_this5.options.removeFingerprintOnSuccess && _this5.options.resume) {
                // Remove stored fingerprint and corresponding endpoint. This causes
                // new upload of the same file must be treated as a different file.
                Storage.removeItem(_this5._fingerprint);
              }
    
              // Yay, finally done :)
              _this5._emitSuccess();
              _this5._source.close();
              return;
            }
    
            _this5._startUpload();
          };
    
          xhr.onerror = function (err) {
            // Don't emit an error if the upload was aborted manually
            if (_this5._aborted) {
              return;
            }
    
            _this5._emitXhrError(xhr, new Error("tus: failed to upload chunk at offset " + _this5._offset), err);
          };
    
          // Test support for progress events before attaching an event listener
          if ("upload" in xhr) {
            xhr.upload.onprogress = function (e) {
              if (!e.lengthComputable) {
                return;
              }
    
              _this5._emitProgress(start + e.loaded, _this5._size);
            };
          }
    
          this._setupXHR(xhr);
    
          xhr.setRequestHeader("Upload-Offset", this._offset);
          xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");
    
          var start = this._offset;
          var end = this._offset + this.options.chunkSize;
    
          // The specified chunkSize may be Infinity or the calcluated end position
          // may exceed the file's size. In both cases, we limit the end position to
          // the input's total size for simpler calculations and correctness.
          if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
            end = this._size;
          }
    
          // A source's slice may return a value to send or a promise.
          // When we have the value we start to send it and emit progress.
          // TODO: merge these two branches
          if (this.options.uploadLengthDeferred) {
            this._source.slice(start, end, function (error, value) {
              if (error) {
                _this5._emitError(error);
              } else if (value === null) {
                _this5._size = _this5._offset;
                xhr.setRequestHeader("Upload-Length", _this5._offset);
                xhr.send();
              } else {
                xhr.send(value);
                _this5._emitProgress(_this5._offset, _this5._size);
              }
            });
          } else {
            this._source.slice(start, end, function (error, chunk) {
              if (error) {
                _this5._emitError(new _error2.default("tus: could not slice file or stream (from " + start + " to " + end + ")", error));
                return;
              }
    
              xhr.send(chunk);
            });
            this._emitProgress(this._offset, this._size);
          }
        }
      }]);
    
      return Upload;
    }();
    
    function encodeMetadata(metadata) {
      var encoded = [];
    
      for (var key in metadata) {
        encoded.push(key + " " + _jsBase.Base64.encode(metadata[key]));
      }
    
      return encoded.join(",");
    }
    
    /**
     * Checks whether a given status is in the range of the expected category.
     * For example, only a status between 200 and 299 will satisfy the category 200.
     *
     * @api private
     */
    function inStatusCategory(status, category) {
      return status >= category && status < category + 100;
    }
    
    Upload.defaultOptions = defaultOptions;
    
    exports.default = Upload;
    
    },{"./error":8,"./fingerprint":9,"./node/request":4,"./node/source":5,"./node/storage":6,"extend":12,"js-base64":13}],12:[function(_dereq_,module,exports){
    'use strict';
    
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    
    var isArray = function isArray(arr) {
        if (typeof Array.isArray === 'function') {
            return Array.isArray(arr);
        }
    
        return toStr.call(arr) === '[object Array]';
    };
    
    var isPlainObject = function isPlainObject(obj) {
        if (!obj || toStr.call(obj) !== '[object Object]') {
            return false;
        }
    
        var hasOwnConstructor = hasOwn.call(obj, 'constructor');
        var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
            return false;
        }
    
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for (key in obj) {/**/}
    
        return typeof key === 'undefined' || hasOwn.call(obj, key);
    };
    
    module.exports = function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0],
            i = 1,
            length = arguments.length,
            deep = false;
    
        // Handle a deep copy situation
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
            target = {};
        }
    
        for (; i < length; ++i) {
            options = arguments[i];
            // Only deal with non-null/undefined values
            if (options != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];
    
                    // Prevent never-ending loop
                    if (target !== copy) {
                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];
                            } else {
                                clone = src && isPlainObject(src) ? src : {};
                            }
    
                            // Never move original objects, clone them
                            target[name] = extend(deep, clone, copy);
    
                        // Don't bring in undefined values
                        } else if (typeof copy !== 'undefined') {
                            target[name] = copy;
                        }
                    }
                }
            }
        }
    
        // Return the modified object
        return target;
    };
    
    
    },{}],13:[function(_dereq_,module,exports){
    (function (global){
    /*
     *  base64.js
     *
     *  Licensed under the BSD 3-Clause License.
     *    http://opensource.org/licenses/BSD-3-Clause
     *
     *  References:
     *    http://en.wikipedia.org/wiki/Base64
     */
    ;(function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined'
            ? module.exports = factory(global)
            : typeof define === 'function' && define.amd
            ? define(factory) : factory(global)
    }((
        typeof self !== 'undefined' ? self
            : typeof window !== 'undefined' ? window
            : typeof global !== 'undefined' ? global
    : this
    ), function(global) {
        'use strict';
        // existing version for noConflict()
        var _Base64 = global.Base64;
        var version = "2.4.9";
        // if node.js and NOT React Native, we use Buffer
        var buffer;
        if (typeof module !== 'undefined' && module.exports) {
            try {
                buffer = eval("require('buffer').Buffer");
            } catch (err) {
                buffer = undefined;
            }
        }
        // constants
        var b64chars
            = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var b64tab = function(bin) {
            var t = {};
            for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
            return t;
        }(b64chars);
        var fromCharCode = String.fromCharCode;
        // encoder stuff
        var cb_utob = function(c) {
            if (c.length < 2) {
                var cc = c.charCodeAt(0);
                return cc < 0x80 ? c
                    : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                    + fromCharCode(0x80 | (cc & 0x3f)))
                    : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                       + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                       + fromCharCode(0x80 | ( cc         & 0x3f)));
            } else {
                var cc = 0x10000
                    + (c.charCodeAt(0) - 0xD800) * 0x400
                    + (c.charCodeAt(1) - 0xDC00);
                return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                        + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                        + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                        + fromCharCode(0x80 | ( cc         & 0x3f)));
            }
        };
        var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
        var utob = function(u) {
            return u.replace(re_utob, cb_utob);
        };
        var cb_encode = function(ccc) {
            var padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16
                | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
                | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
            chars = [
                b64chars.charAt( ord >>> 18),
                b64chars.charAt((ord >>> 12) & 63),
                padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
            ];
            return chars.join('');
        };
        var btoa = global.btoa ? function(b) {
            return global.btoa(b);
        } : function(b) {
            return b.replace(/[\s\S]{1,3}/g, cb_encode);
        };
        var _encode = buffer ?
            buffer.from && Uint8Array && buffer.from !== Uint8Array.from
            ? function (u) {
                return (u.constructor === buffer.constructor ? u : buffer.from(u))
                    .toString('base64')
            }
            :  function (u) {
                return (u.constructor === buffer.constructor ? u : new  buffer(u))
                    .toString('base64')
            }
            : function (u) { return btoa(utob(u)) }
        ;
        var encode = function(u, urisafe) {
            return !urisafe
                ? _encode(String(u))
                : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                    return m0 == '+' ? '-' : '_';
                }).replace(/=/g, '');
        };
        var encodeURI = function(u) { return encode(u, true) };
        // decoder stuff
        var re_btou = new RegExp([
            '[\xC0-\xDF][\x80-\xBF]',
            '[\xE0-\xEF][\x80-\xBF]{2}',
            '[\xF0-\xF7][\x80-\xBF]{3}'
        ].join('|'), 'g');
        var cb_btou = function(cccc) {
            switch(cccc.length) {
            case 4:
                var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                    |    ((0x3f & cccc.charCodeAt(1)) << 12)
                    |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                    |     (0x3f & cccc.charCodeAt(3)),
                offset = cp - 0x10000;
                return (fromCharCode((offset  >>> 10) + 0xD800)
                        + fromCharCode((offset & 0x3FF) + 0xDC00));
            case 3:
                return fromCharCode(
                    ((0x0f & cccc.charCodeAt(0)) << 12)
                        | ((0x3f & cccc.charCodeAt(1)) << 6)
                        |  (0x3f & cccc.charCodeAt(2))
                );
            default:
                return  fromCharCode(
                    ((0x1f & cccc.charCodeAt(0)) << 6)
                        |  (0x3f & cccc.charCodeAt(1))
                );
            }
        };
        var btou = function(b) {
            return b.replace(re_btou, cb_btou);
        };
        var cb_decode = function(cccc) {
            var len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
                | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
                | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
                | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
            chars = [
                fromCharCode( n >>> 16),
                fromCharCode((n >>>  8) & 0xff),
                fromCharCode( n         & 0xff)
            ];
            chars.length -= [0, 0, 2, 1][padlen];
            return chars.join('');
        };
        var atob = global.atob ? function(a) {
            return global.atob(a);
        } : function(a){
            return a.replace(/[\s\S]{1,4}/g, cb_decode);
        };
        var _decode = buffer ?
            buffer.from && Uint8Array && buffer.from !== Uint8Array.from
            ? function(a) {
                return (a.constructor === buffer.constructor
                        ? a : buffer.from(a, 'base64')).toString();
            }
            : function(a) {
                return (a.constructor === buffer.constructor
                        ? a : new buffer(a, 'base64')).toString();
            }
            : function(a) { return btou(atob(a)) };
        var decode = function(a){
            return _decode(
                String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                    .replace(/[^A-Za-z0-9\+\/]/g, '')
            );
        };
        var noConflict = function() {
            var Base64 = global.Base64;
            global.Base64 = _Base64;
            return Base64;
        };
        // export Base64
        global.Base64 = {
            VERSION: version,
            atob: atob,
            btoa: btoa,
            fromBase64: decode,
            toBase64: encode,
            utob: utob,
            encode: encode,
            encodeURI: encodeURI,
            btou: btou,
            decode: decode,
            noConflict: noConflict,
            __buffer__: buffer
        };
        // if ES5 is available, make Base64.extendString() available
        if (typeof Object.defineProperty === 'function') {
            var noEnum = function(v){
                return {value:v,enumerable:false,writable:true,configurable:true};
            };
            global.Base64.extendString = function () {
                Object.defineProperty(
                    String.prototype, 'fromBase64', noEnum(function () {
                        return decode(this)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64', noEnum(function (urisafe) {
                        return encode(this, urisafe)
                    }));
                Object.defineProperty(
                    String.prototype, 'toBase64URI', noEnum(function () {
                        return encode(this, true)
                    }));
            };
        }
        //
        // export Base64 to the namespace
        //
        if (global['Meteor']) { // Meteor.js
            Base64 = global.Base64;
        }
        // module.exports and AMD are mutually exclusive.
        // module.exports has precedence.
        if (typeof module !== 'undefined' && module.exports) {
            module.exports.Base64 = global.Base64;
        }
        else if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define([], function(){ return global.Base64 });
        }
        // that's it!
        return {Base64: global.Base64}
    }));
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{}],14:[function(_dereq_,module,exports){
    'use strict';
    
    var has = Object.prototype.hasOwnProperty;
    
    /**
     * Decode a URI encoded string.
     *
     * @param {String} input The URI encoded string.
     * @returns {String} The decoded string.
     * @api private
     */
    function decode(input) {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    }
    
    /**
     * Simple query string parser.
     *
     * @param {String} query The query string that needs to be parsed.
     * @returns {Object}
     * @api public
     */
    function querystring(query) {
      var parser = /([^=?&]+)=?([^&]*)/g
        , result = {}
        , part;
    
      while (part = parser.exec(query)) {
        var key = decode(part[1])
          , value = decode(part[2]);
    
        //
        // Prevent overriding of existing properties. This ensures that build-in
        // methods like `toString` or __proto__ are not overriden by malicious
        // querystrings.
        //
        if (key in result) continue;
        result[key] = value;
      }
    
      return result;
    }
    
    /**
     * Transform a query string to an object.
     *
     * @param {Object} obj Object that should be transformed.
     * @param {String} prefix Optional prefix.
     * @returns {String}
     * @api public
     */
    function querystringify(obj, prefix) {
      prefix = prefix || '';
    
      var pairs = [];
    
      //
      // Optionally prefix with a '?' if needed
      //
      if ('string' !== typeof prefix) prefix = '?';
    
      for (var key in obj) {
        if (has.call(obj, key)) {
          pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
        }
      }
    
      return pairs.length ? prefix + pairs.join('&') : '';
    }
    
    //
    // Expose the module.
    //
    exports.stringify = querystringify;
    exports.parse = querystring;
    
    },{}],15:[function(_dereq_,module,exports){
    'use strict';
    
    /**
     * Check if we're required to add a port number.
     *
     * @see https://url.spec.whatwg.org/#default-port
     * @param {Number|String} port Port number we need to check
     * @param {String} protocol Protocol we need to check against.
     * @returns {Boolean} Is it a default port for the given protocol
     * @api private
     */
    module.exports = function required(port, protocol) {
      protocol = protocol.split(':')[0];
      port = +port;
    
      if (!port) return false;
    
      switch (protocol) {
        case 'http':
        case 'ws':
        return port !== 80;
    
        case 'https':
        case 'wss':
        return port !== 443;
    
        case 'ftp':
        return port !== 21;
    
        case 'gopher':
        return port !== 70;
    
        case 'file':
        return false;
      }
    
      return port !== 0;
    };
    
    },{}],16:[function(_dereq_,module,exports){
    (function (global){
    'use strict';
    
    var required = _dereq_('requires-port')
      , qs = _dereq_('querystringify')
      , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
      , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//;
    
    /**
     * These are the parse rules for the URL parser, it informs the parser
     * about:
     *
     * 0. The char it Needs to parse, if it's a string it should be done using
     *    indexOf, RegExp using exec and NaN means set as current value.
     * 1. The property we should set when parsing this value.
     * 2. Indication if it's backwards or forward parsing, when set as number it's
     *    the value of extra chars that should be split off.
     * 3. Inherit from location if non existing in the parser.
     * 4. `toLowerCase` the resulting value.
     */
    var rules = [
      ['#', 'hash'],                        // Extract from the back.
      ['?', 'query'],                       // Extract from the back.
      function sanitize(address) {          // Sanitize what is left of the address
        return address.replace('\\', '/');
      },
      ['/', 'pathname'],                    // Extract from the back.
      ['@', 'auth', 1],                     // Extract from the front.
      [NaN, 'host', undefined, 1, 1],       // Set left over value.
      [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
      [NaN, 'hostname', undefined, 1, 1]    // Set left over.
    ];
    
    /**
     * These properties should not be copied or inherited from. This is only needed
     * for all non blob URL's as a blob URL does not include a hash, only the
     * origin.
     *
     * @type {Object}
     * @private
     */
    var ignore = { hash: 1, query: 1 };
    
    /**
     * The location object differs when your code is loaded through a normal page,
     * Worker or through a worker using a blob. And with the blobble begins the
     * trouble as the location object will contain the URL of the blob, not the
     * location of the page where our code is loaded in. The actual origin is
     * encoded in the `pathname` so we can thankfully generate a good "default"
     * location from it so we can generate proper relative URL's again.
     *
     * @param {Object|String} loc Optional default location object.
     * @returns {Object} lolcation object.
     * @public
     */
    function lolcation(loc) {
      var location = global && global.location || {};
      loc = loc || location;
    
      var finaldestination = {}
        , type = typeof loc
        , key;
    
      if ('blob:' === loc.protocol) {
        finaldestination = new Url(unescape(loc.pathname), {});
      } else if ('string' === type) {
        finaldestination = new Url(loc, {});
        for (key in ignore) delete finaldestination[key];
      } else if ('object' === type) {
        for (key in loc) {
          if (key in ignore) continue;
          finaldestination[key] = loc[key];
        }
    
        if (finaldestination.slashes === undefined) {
          finaldestination.slashes = slashes.test(loc.href);
        }
      }
    
      return finaldestination;
    }
    
    /**
     * @typedef ProtocolExtract
     * @type Object
     * @property {String} protocol Protocol matched in the URL, in lowercase.
     * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
     * @property {String} rest Rest of the URL that is not part of the protocol.
     */
    
    /**
     * Extract protocol information from a URL with/without double slash ("//").
     *
     * @param {String} address URL we want to extract from.
     * @return {ProtocolExtract} Extracted information.
     * @private
     */
    function extractProtocol(address) {
      var match = protocolre.exec(address);
    
      return {
        protocol: match[1] ? match[1].toLowerCase() : '',
        slashes: !!match[2],
        rest: match[3]
      };
    }
    
    /**
     * Resolve a relative URL pathname against a base URL pathname.
     *
     * @param {String} relative Pathname of the relative URL.
     * @param {String} base Pathname of the base URL.
     * @return {String} Resolved pathname.
     * @private
     */
    function resolve(relative, base) {
      var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
        , i = path.length
        , last = path[i - 1]
        , unshift = false
        , up = 0;
    
      while (i--) {
        if (path[i] === '.') {
          path.splice(i, 1);
        } else if (path[i] === '..') {
          path.splice(i, 1);
          up++;
        } else if (up) {
          if (i === 0) unshift = true;
          path.splice(i, 1);
          up--;
        }
      }
    
      if (unshift) path.unshift('');
      if (last === '.' || last === '..') path.push('');
    
      return path.join('/');
    }
    
    /**
     * The actual URL instance. Instead of returning an object we've opted-in to
     * create an actual constructor as it's much more memory efficient and
     * faster and it pleases my OCD.
     *
     * It is worth noting that we should not use `URL` as class name to prevent
     * clashes with the global URL instance that got introduced in browsers.
     *
     * @constructor
     * @param {String} address URL we want to parse.
     * @param {Object|String} location Location defaults for relative paths.
     * @param {Boolean|Function} parser Parser for the query string.
     * @private
     */
    function Url(address, location, parser) {
      if (!(this instanceof Url)) {
        return new Url(address, location, parser);
      }
    
      var relative, extracted, parse, instruction, index, key
        , instructions = rules.slice()
        , type = typeof location
        , url = this
        , i = 0;
    
      //
      // The following if statements allows this module two have compatibility with
      // 2 different API:
      //
      // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
      //    where the boolean indicates that the query string should also be parsed.
      //
      // 2. The `URL` interface of the browser which accepts a URL, object as
      //    arguments. The supplied object will be used as default values / fall-back
      //    for relative paths.
      //
      if ('object' !== type && 'string' !== type) {
        parser = location;
        location = null;
      }
    
      if (parser && 'function' !== typeof parser) parser = qs.parse;
    
      location = lolcation(location);
    
      //
      // Extract protocol information before running the instructions.
      //
      extracted = extractProtocol(address || '');
      relative = !extracted.protocol && !extracted.slashes;
      url.slashes = extracted.slashes || relative && location.slashes;
      url.protocol = extracted.protocol || location.protocol || '';
      address = extracted.rest;
    
      //
      // When the authority component is absent the URL starts with a path
      // component.
      //
      if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];
    
      for (; i < instructions.length; i++) {
        instruction = instructions[i];
    
        if (typeof instruction === 'function') {
          address = instruction(address);
          continue;
        }
    
        parse = instruction[0];
        key = instruction[1];
    
        if (parse !== parse) {
          url[key] = address;
        } else if ('string' === typeof parse) {
          if (~(index = address.indexOf(parse))) {
            if ('number' === typeof instruction[2]) {
              url[key] = address.slice(0, index);
              address = address.slice(index + instruction[2]);
            } else {
              url[key] = address.slice(index);
              address = address.slice(0, index);
            }
          }
        } else if ((index = parse.exec(address))) {
          url[key] = index[1];
          address = address.slice(0, index.index);
        }
    
        url[key] = url[key] || (
          relative && instruction[3] ? location[key] || '' : ''
        );
    
        //
        // Hostname, host and protocol should be lowercased so they can be used to
        // create a proper `origin`.
        //
        if (instruction[4]) url[key] = url[key].toLowerCase();
      }
    
      //
      // Also parse the supplied query string in to an object. If we're supplied
      // with a custom parser as function use that instead of the default build-in
      // parser.
      //
      if (parser) url.query = parser(url.query);
    
      //
      // If the URL is relative, resolve the pathname against the base URL.
      //
      if (
          relative
        && location.slashes
        && url.pathname.charAt(0) !== '/'
        && (url.pathname !== '' || location.pathname !== '')
      ) {
        url.pathname = resolve(url.pathname, location.pathname);
      }
    
      //
      // We should not add port numbers if they are already the default port number
      // for a given protocol. As the host also contains the port number we're going
      // override it with the hostname which contains no port number.
      //
      if (!required(url.port, url.protocol)) {
        url.host = url.hostname;
        url.port = '';
      }
    
      //
      // Parse down the `auth` for the username and password.
      //
      url.username = url.password = '';
      if (url.auth) {
        instruction = url.auth.split(':');
        url.username = instruction[0] || '';
        url.password = instruction[1] || '';
      }
    
      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';
    
      //
      // The href is just the compiled result.
      //
      url.href = url.toString();
    }
    
    /**
     * This is convenience method for changing properties in the URL instance to
     * insure that they all propagate correctly.
     *
     * @param {String} part          Property we need to adjust.
     * @param {Mixed} value          The newly assigned value.
     * @param {Boolean|Function} fn  When setting the query, it will be the function
     *                               used to parse the query.
     *                               When setting the protocol, double slash will be
     *                               removed from the final url if it is true.
     * @returns {URL} URL instance for chaining.
     * @public
     */
    function set(part, value, fn) {
      var url = this;
    
      switch (part) {
        case 'query':
          if ('string' === typeof value && value.length) {
            value = (fn || qs.parse)(value);
          }
    
          url[part] = value;
          break;
    
        case 'port':
          url[part] = value;
    
          if (!required(value, url.protocol)) {
            url.host = url.hostname;
            url[part] = '';
          } else if (value) {
            url.host = url.hostname +':'+ value;
          }
    
          break;
    
        case 'hostname':
          url[part] = value;
    
          if (url.port) value += ':'+ url.port;
          url.host = value;
          break;
    
        case 'host':
          url[part] = value;
    
          if (/:\d+$/.test(value)) {
            value = value.split(':');
            url.port = value.pop();
            url.hostname = value.join(':');
          } else {
            url.hostname = value;
            url.port = '';
          }
    
          break;
    
        case 'protocol':
          url.protocol = value.toLowerCase();
          url.slashes = !fn;
          break;
    
        case 'pathname':
        case 'hash':
          if (value) {
            var char = part === 'pathname' ? '/' : '#';
            url[part] = value.charAt(0) !== char ? char + value : value;
          } else {
            url[part] = value;
          }
          break;
    
        default:
          url[part] = value;
      }
    
      for (var i = 0; i < rules.length; i++) {
        var ins = rules[i];
    
        if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
      }
    
      url.origin = url.protocol && url.host && url.protocol !== 'file:'
        ? url.protocol +'//'+ url.host
        : 'null';
    
      url.href = url.toString();
    
      return url;
    }
    
    /**
     * Transform the properties back in to a valid and full URL string.
     *
     * @param {Function} stringify Optional query stringify function.
     * @returns {String} Compiled version of the URL.
     * @public
     */
    function toString(stringify) {
      if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
    
      var query
        , url = this
        , protocol = url.protocol;
    
      if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
    
      var result = protocol + (url.slashes ? '//' : '');
    
      if (url.username) {
        result += url.username;
        if (url.password) result += ':'+ url.password;
        result += '@';
      }
    
      result += url.host + url.pathname;
    
      query = 'object' === typeof url.query ? stringify(url.query) : url.query;
      if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
    
      if (url.hash) result += url.hash;
    
      return result;
    }
    
    Url.prototype = { set: set, toString: toString };
    
    //
    // Expose the URL parser and some additional properties that might be useful for
    // others or testing.
    //
    Url.extractProtocol = extractProtocol;
    Url.location = lolcation;
    Url.qs = qs;
    
    module.exports = Url;
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{"querystringify":14,"requires-port":15}]},{},[10])(10)
    });
    //# sourceMappingURL=tus.js.map