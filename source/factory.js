'use strict';

module.exports = function (options) {
    return {
        fetchAPI: function (email, callback) {
            var matched = true,
                domain = email.split('@')[1];

            switch (domain) {
                case 'gmail.com':
                case 'googlemail.com':
                    require('./google')(options.google || {}, (function (_this) {
                        return function () {
                            _this.Api = this;
                            if (typeof callback === 'function') {
                                callback.call(_this);
                            }
                        };
                    })(this));
                    break;
                //case 'live.com':
                //case 'hotmail.com':
                //case 'outlook.com':
                //    this.Api = {};
                //    if (typeof callback === 'function') {
                //        callback.call(this);
                //    }
                //    break;
                default:
                    matched = false;
            }

            return matched;
        },
        checkEmails: function (options, callback, email) {
            for (var i = 0; i < arguments.length; i++) {
                var argument = arguments[i];
                switch (typeof argument) {
                    case 'function':
                        callback = argument;
                        break;
                    case 'string':
                        email = argument;
                        break;
                    case 'object':
                        options = argument;
                        break;
                }
            }

            if (!this.Api) {
                return this.fetchAPI(email, function () {
                    this.Api.init(options, callback);
                });
            }
            return this.Api.init(options, callback);
        }
    };
};
