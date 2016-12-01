// This is unminified!  If making changes, minify it as pip.min.js before moving to dev/qa/prod
// http://www.minifyjavascript.com/


$(document).click(function (e) { showHide(e); });

function showHide(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    // alert('showHide ' + target.id);
    // get the pa~rent div if a ddlchklst was clicked
    var rent = $(target).closest("div.ddlchklst, div.ddlchklst_hid");
    var rID = rent == null ? '' : rent.attr('id');

    $('.ddlchklst').each(function () {
        var rntID = $(this).attr('id');
        //  alert('rID=' + rID + 'rntID=' + rntID);
        if (rID != rntID) ddcbClose(rntID, rID);
        else if (target.tagName == 'DIV') { ddcbClose(rntID); rent = null } // close if open & clicked
    });

    if (rent != null && rent.attr('class') != 'ddlchklst_dis')
        $(rent).attr('class', 'ddlchklst');
}

function uD(li, event) { // Update Display: This handles select/unselect, it does not reload controls
    event = event || window.event;
    var target = event.target || event.srcElement;
    var rent = $(li).closest('div')[0]; // outer div
    var disp = $(rent).find('span')[0]; // The title span on top, seen when closed
    var cb = $(li).find('input')[0];

    var checkboxes = $(rent).find('input[type=checkbox]');

    var Multi = !checkboxes.first().hasClass('hid'); // This is a Multi select b/c checkboxes are displayed
    var cbAll = $('#' + rent.id + '_All'); // the All cb
    // if the All cb was clicked, make all the checkboxes match (Multi) or select All (Single)
    if (cbAll.length && cbAll[0].id == cb.id) {
        if (target.type != 'checkbox') cb.checked = !cb.checked || !Multi; // update checkbox for clicked parent
        checkboxes.each(function () { $(this).prop('checked', cb.checked || !Multi); });
        if (cb.checked) $(rent).find('li').addClass('sel');
        else $(rent).find('li').removeClass('sel');
    }
    else { // Not the "All"
        if (Multi) {
            if (target.type != 'checkbox') cb.checked = !cb.checked; // update checkbox for clicked parent
            if (cb.checked) $(li).addClass('sel');
            else $(li).removeClass('sel');
        }
        else {
            checkboxes.each(function () { $(this).prop('checked', false); });
            cb.checked = true;
            $(rent).find('li').removeClass('sel');
            $(li).addClass('sel');
        }
    }

    // selectedCount will be # checked not counting an All cb
    var selectedCount = 0;

    // Get selectedCount and set disp to first, will be overwritten if selectedCount > 1
    for (var i = cbAll.length; i < checkboxes.length; i++)
        if (checkboxes[i].checked && ++selectedCount == 1)
            disp.innerHTML = checkboxes[i].parentNode.getElementsByTagName('label')[0].innerHTML;

    if (cbAll.length)
        cbAll[0].checked = (selectedCount == checkboxes.length - 1);

    if (selectedCount == 0) disp.innerHTML = 'Nothing selected';
    else if (selectedCount > 1) {
        if (selectedCount + cbAll.length == checkboxes.length) disp.innerHTML = 'All ' + (checkboxes.length - cbAll.length) + ' selected';
        else disp.innerHTML = selectedCount + ' selected';

    }
}

// enable/disable CBLDropDown's: cbEnable/cbDisable are what to enable/disable
// can disable multiple, enable the highest and other will be as needed
function LvlCl(cbTop, cbEnable, cbDisable) {
    $('.ddlchklst').each(function () {
        ddcbClose($(this).attr('id'), null); // close first to update .chkd
    });
    if (typeof cbDisable != 'undefined') $(cbDisable).each(function () {
        var clss = $(this).attr('class');
        if (clss.length > 3 && clss.substring(clss.length - 3) != '_na') this.className = 'ddlchklst_dis'
    });

    var send = false;
    // first check for repopulating, then enable
    if (typeof cbEnable != 'undefined') {    // Need to get higher cbdd to repopulate cbEnable
        var tosend = cbTop;
        while ($('#' + tosend + '_hf').length > 0) {
            //  alert(tosend);
            hfo = JSON.parse($('#' + tosend + '_hf').val());
            if ($('#' + hfo.nextID).find('span').text() == 'Not available') {
                send = true;
                break;
            }
            tosend = hfo.nextID;
        }
        // enable before close so they get updated
        $(cbEnable).each(function () {
            var clss = $(this).attr('class');
            if (clss.length > 3 && clss.substring(clss.length - 3) != '_na') this.className = 'ddlchklst_hid'
        });

        // if an update (was 'Not available') is needed
        if (send) ddcbClose(tosend, 'forceClose');
    }
    //  alert( ', ' + cbEnable + ', ' + cbDisable);
}


function getAll(dta, rntID, forReport) {// dta= , if forReport is true, do not set disabled lists to "Not available"
    var updateFromSever = false;
    var data = {};
    data.ID = rntID;
    var hfo = JSON.parse($('#' + rntID + '_hf').val());
    data.chkd = hfo.chkd;
    dta.push(data);
    while ($('#' + hfo.nextID + '_hf').length > 0) {
        var data = {};
        data.ID = hfo.nextID;
        hfo = JSON.parse($('#' + hfo.nextID + '_hf').val());
        if ($('#' + data.ID).attr('class') == 'ddlchklst_dis') {
            //  alert('data.ID= ' + data.ID);
            if (!forReport) $('#' + data.ID + ' > span').html('Not available');
        }
        else { // not disabled, push data
            updateFromSever = true;
            data.chkd = hfo.chkd;
            dta.push(data);
        }
    }
    return updateFromSever;
}

function showReport(rntID) {
    document.body.style.cursor = 'wait';

    $('.ddlchklst').each(function () {
        ddcbClose($(this).attr('id'), null); // close first to update .chkd
    });

    // pass selected values (keys) at run level
    var hfo = JSON.parse($('#' + rntID + '_hf').val());
    var next = {};
    var dta = [];
    next.ID = rntID;
    next.chkd = hfo.chkd;
    dta.push(next);
    while ($('#' + hfo.nextID + '_hf').length > 0 && $('#' + hfo.nextID).attr('class') != 'ddlchklst_dis') {
        var next = {};
        next.ID = hfo.nextID;
        hfo = JSON.parse($('#' + hfo.nextID + '_hf').val());
        next.chkd = hfo.chkd;
        dta.push(next);
    }

    $.ajax({
        url: getURL(),
        data: JSON.stringify(dta),
        success: (function (result) {
            for (var key in result)
                $('#' + key).html(result[key]);
            document.body.style.cursor = '';
        })
    });
}

function ddcbClose(rntID, rID) {// rID is a ddcb to open
    var names = [];
    // alert('close(' + rntID+', '+ rID+')');
    var ul = $('#' + rntID + ' ul').first();
    $(ul).find('input:checked').each(function () {
        names.push(this.value);
    });

    $('#' + rntID).attr('class', 'ddlchklst_hid');
    var hiddenField = $('#' + rntID + '_hf');

    if (hiddenField.length) {
        var hfo = JSON.parse($(hiddenField).val());
        if (hfo.chkd != names.join(",") || rID == 'forceClose') {
            hfo.chkd = names;
            if (rID == 'forceClose') rID = '';
                // set this hf b/c it will not be in the response. Only children if needed.
            else $('#' + rntID + '_hf').val(JSON.stringify(hfo));

            if (hfo.nextID != undefined) {
                rID = hfo.nextID + ':' + rID; // send data from top, refresh from rntID 
                var topLevel = hfo.tl || rntID;
                // send hfo and all downstream fields to get updates
                var dta = [];
                if (getAll(dta, topLevel)) { // else there's nothing to update
                    document.body.style.cursor = 'wait';
                    $.ajax({
                        //	url: "pss.ashx?Update=" + rID + ":" + extraData,
                        url: getURL(rID + ''),
                        //data: JSON.stringify({ "cntrls": dta }),
                        data: JSON.stringify(dta),
                        success: (function (result) {
                            for (var key in result) {
                                var el = $('#' + key);
                                var clss = $(el).attr('class');
                                //  alert(key + ' ' + clss);
                                if (clss.length > 3 && clss.substring(clss.length - 3) == '_na') $(el).attr('class', clss.substring(0, clss.length - 3) + '_hid');
                                $(el).html(result[key]);
                            }
                            document.body.style.cursor = '';
                        })
                    });
                }
            }
        }
    }
}

$.ajaxSetup({
    type: "POST",
    data: "{}",
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    error: (function (XHR, exception) {
        alert(XHR.status + ', ' + exception + ', ' + XHR.responseText + ', ' + XHR.statusText);
        document.body.style.cursor = '';
    })
});

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

                // If the type is 'object', we might be dealing with an object or an array or
                // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', { '': value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({ '': j }, '')
                    : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
