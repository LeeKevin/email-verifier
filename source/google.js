'use strict';

module.exports = function (options, callback) {
    var gapi;
    options = options || {};

    var checkEmails = function (options, callback) {
        var query = '';
        if (options) {
            if (options.subject) {
                query += ' subject:\"' + options.subject + '\"';
            }
            if (options.sender) {
                query += ' from:' + options.sender;
            }
        }

        var request = gapi.client.gmail.users.messages.list({
            userId: 'me',
            includeSpamTrash: true,
            q: query
        });

        var confirmed = false;
        request.execute(function (resp) {
            var messages = resp.messages;
            if (messages.length == 0) {
                callback(null, confirmed);
            }
            for (var i = 0; i < messages.length && !confirmed; i++) {
                var request = gapi.client.gmail.users.messages.get({
                    'userId': 'me',
                    'id': messages[i]['id']
                });

                (function loop (i) {
                    request.execute(function (resp) {
                        if (confirmed) return;

                        if (typeof options.verify === 'function') {
                            confirmed = options.verify(resp);
                        } else {
                            confirmed = true;
                        }
                        if (confirmed || i == messages.length - 1) {
                            callback(null, confirmed);
                        }
                    });
                })(i);
            }

        });
    };

    var obj = {
        init: function (opts, callback) {
            gapi.auth.authorize({
                'client_id': options.client_id,
                'scope': 'https://www.googleapis.com/auth/gmail.readonly'
            }, function (authResult) {
                if (authResult.error) {
                    callback(authResult.error);
                    return;
                }
                if (authResult) {
                    return gapi.client.load('gmail', 'v1', function () {
                        checkEmails(opts, callback);
                    });
                } else {
                    callback(new Error("Authorization Failed!"));
                }
            });
        }
    };

    require('google-client-api')(function (api) {
        gapi = api;
        callback.call(obj);
    });
};