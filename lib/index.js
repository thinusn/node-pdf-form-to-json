'use strict';

var exec = require('child_process').exec;

module.exports = {
    dumpDataFields: dumpDataFields,
    getDataFieldsSerialized: getDataFieldsSerialized,
    getDataFields: getDataFields,
    flatten: flatten
};

/**
 * Helper function to build the json
 * @param data
 * @param sterilize
 * @returns {{}}
 */
function buildJSON(data, sterilize) {
    if (!sterilize)
        sterilize = false;

    var endOfLine = require('os').EOL;

    var arr = (sterilize) ? [] : {};

    var all = data.split('---' + endOfLine);

    all.forEach(function (item, index) {
        var bundle = item.split(endOfLine);
        var res = null;
        bundle.forEach(function (item, index) {
            var keyvals = item.split(':');
            var key = keyvals[0];
            var val = keyvals[1];
            if (key) {
                key = key.trim();
                if (val) {
                    if (!res)
                        res = {};
                    val = val.trim().replace('\'', '');
                    res[key] = val;

                }
            }
        });
        if (res && res.FieldValue !== undefined) {
          
             if(res.FieldValue === 'true')
                res.FieldValue = true; 
              
              if(res.FieldValue === 'false')
                res.FieldValue = false;
    
            if (sterilize) {
                arr.push(
                    {
                        name: res.FieldName,
                        value: res.FieldValue
                    }
                )
            } else {
                arr[res.FieldName] = res.FieldValue;
            }
        }
    });
    if (sterilize)
        return serializeJSON({}, arr);
    else
        return arr;
}

//Taken from https://github.com/marioizquierdo/jquery.serializeJSON
//Needs refactoring
function serializeJSON(options, dataArray) {
    var f, opts, serializedObject, name, value, _obj, nameWithNoType, type, keys;

    f = $.serializeJSON;
    opts = f.setupOpts(options);
    // Convert the formAsArray into a serializedObject with nested keys
    serializedObject = {};
    dataArray.forEach(function (obj, i) {
        name = obj.name; // original input name
        value = obj.value; // input value
        _obj = f.extractTypeAndNameWithNoType(name);
        nameWithNoType = _obj.nameWithNoType; // input name with no type (i.e. "foo:string" => "foo")
        type = _obj.type; // type defined from the input name in :type colon notation

        f.validateType(name, type, opts); // make sure that the type is one of the valid types if defined

        if (type !== 'skip') { // ignore elements with type 'skip'
            keys = f.splitInputNameIntoKeysArray(nameWithNoType);
            value = f.parseValue(value, name, type, opts); // convert to string, number, boolean, null or customType
            f.deepSet(serializedObject, keys, value, opts);
        }
    });
    return serializedObject;
}

/**
 * Returns the data from the pdf file as json
 * @param file
 * @param callback
 */
function getDataFields(file, callback) {

    dumpDataFields(file, function (data) {
        if (callback) {
            callback(buildJSON(data))
        }
    });
}

/**
 * Returns the data from the pdf file as json
 * @param file
 * @param callback
 */
function getDataFieldsSerialized(file, callback) {

    dumpDataFields(file, function (data) {
        if (callback) {
            callback(buildJSON(data, true))
        }
    });
}

/**
 * Returns the raw pdftk data from the pdf
 * @param file
 * @param callback
 */
function dumpDataFields(file, callback) {

    var commandBuilder = [
        'pdftk',
        file,
        'dump_data_fields'
    ];

    exec(commandBuilder.join(' '), function (err, out, code) {
        if (err instanceof Error)
            throw err;

        if (callback) {
            callback(out);
        }
        else {
            throw new Error('No callback passed');
        }
    });

}

//http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
function flatten(data) {
    var result = {};

    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }

    recurse(data, "");

    for (var key in result) {

        if (result.hasOwnProperty(key)) {
            var newKey = key;
            var oldKey = key;

            if (newKey.indexOf('.') !== -1) {
                newKey = newKey.replace('.', '[');
            }
            newKey = newKey.replace(/\./g, "][");

            if (newKey.indexOf('[') !== -1) {
                newKey += ']';
            }

            if (oldKey !== newKey) {
                result[newKey] = result[oldKey];
                delete result[oldKey];
            }

            if (result[newKey] == undefined) {
                delete result[newKey];
            }

        }
    }

    return result;
}

var $ = $ || {};
//Taken from https://github.com/marioizquierdo/jquery.serializeJSON
//Needs refactoring
$.serializeJSON = {

    defaultOptions: {
        checkboxUncheckedValue: undefined, // to include that value for unchecked checkboxes (instead of ignoring them)

        parseNumbers: false, // convert values like "1", "-2.33" to 1, -2.33
        parseBooleans: false, // convert "true", "false" to true, false
        parseNulls: false, // convert "null" to null
        parseAll: false, // all of the above
        parseWithFunction: null, // to use custom parser, a function like: function(val){ return parsed_val; }

        customTypes: {}, // override defaultTypes
        defaultTypes: {
            "string": function (str) {
                return String(str);
            },
            "number": function (str) {
                return Number(str);
            },
            "boolean": function (str) {
                var falses = ["false", "null", "undefined", "", "0"];
                return falses.indexOf(str) === -1;
            },
            "null": function (str) {
                var falses = ["false", "null", "undefined", "", "0"];
                return falses.indexOf(str) === -1 ? str : null;
            },
            "array": function (str) {
                return JSON.parse(str);
            },
            "object": function (str) {
                return JSON.parse(str);
            },
            "auto": function (str) {
                return $.serializeJSON.parseValue(str, null, null, {
                    parseNumbers: true,
                    parseBooleans: true,
                    parseNulls: true
                });
            }, // try again with something like "parseAll"
            "skip": null // skip is a special type that makes it easy to ignore elements
        },

        useIntKeysAsArrayIndex: false // name="foo[2]" value="v" => {foo: [null, null, "v"]}, instead of {foo: ["2": "v"]}
    },

    // Merge option defaults into the options
    setupOpts: function (options) {
        var opt, validOpts, defaultOptions, optWithDefault, parseAll, f;
        f = $.serializeJSON;

        if (options == null) {
            options = {};
        }   // options ||= {}
        defaultOptions = f.defaultOptions || {}; // defaultOptions

        // Make sure that the user didn't misspell an option
        validOpts = ['checkboxUncheckedValue', 'parseNumbers', 'parseBooleans', 'parseNulls', 'parseAll', 'parseWithFunction', 'customTypes', 'defaultTypes', 'useIntKeysAsArrayIndex']; // re-define because the user may override the defaultOptions
        for (opt in options) {
            if (validOpts.indexOf(opt) === -1) {
                throw new Error("serializeJSON ERROR: invalid option '" + opt + "'. Please use one of " + validOpts.join(', '));
            }
        }

        // Helper to get the default value for this option if none is specified by the user
        optWithDefault = function (key) {
            return (options[key] !== false) && (options[key] !== '') && (options[key] || defaultOptions[key]);
        };

        // Return computed options (opts to be used in the rest of the script)
        parseAll = optWithDefault('parseAll');
        return {
            checkboxUncheckedValue: optWithDefault('checkboxUncheckedValue'),

            parseNumbers: parseAll || optWithDefault('parseNumbers'),
            parseBooleans: parseAll || optWithDefault('parseBooleans'),
            parseNulls: parseAll || optWithDefault('parseNulls'),
            parseWithFunction: optWithDefault('parseWithFunction'),

            typeFunctions: optWithDefault('defaultTypes'),

            useIntKeysAsArrayIndex: optWithDefault('useIntKeysAsArrayIndex')
        };
    },

    // Given a string, apply the type or the relevant "parse" options, to return the parsed value
    parseValue: function (valStr, inputName, type, opts) {
        var f, parsedVal;
        f = $.serializeJSON;
        parsedVal = valStr; // if no parsing is needed, the returned value will be the same

        if (opts.typeFunctions && type && opts.typeFunctions[type]) { // use a type if available
            parsedVal = opts.typeFunctions[type](valStr);
        } else if (opts.parseNumbers && f.isNumeric(valStr)) { // auto: number
            parsedVal = Number(valStr);
        } else if (opts.parseBooleans && (valStr === "true" || valStr === "false")) { // auto: boolean
            parsedVal = (valStr === "true");
        } else if (opts.parseNulls && valStr == "null") { // auto: null
            parsedVal = null;
        }
        if (opts.parseWithFunction && !type) { // custom parse function (apply after previous parsing options, but not if there's a specific type)
            parsedVal = opts.parseWithFunction(parsedVal, inputName);
        }

        return parsedVal;
    },

    isObject: function (obj) {
        return obj === Object(obj);
    }, // is it an Object?
    isUndefined: function (obj) {
        return obj === void 0;
    }, // safe check for undefined values
    isValidArrayIndex: function (val) {
        return /^[0-9]+$/.test(String(val));
    }, // 1,2,3,4 ... are valid array indexes
    isNumeric: function (obj) {
        return obj - parseFloat(obj) >= 0;
    }, // taken from jQuery.isNumeric implementation. Not using jQuery.isNumeric to support old jQuery and Zepto versions

    optionKeys: function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        } else {
            var key, keys = [];
            for (key in obj) {
                keys.push(key);
            }
            return keys;
        }
    }, // polyfill Object.keys to get option keys in IE<9

    // Returns and object with properties {name_without_type, type} from a given name.
    // The type is null if none specified. Example:
    //   "foo"           =>  {nameWithNoType: "foo",      type:  null}
    //   "foo:boolean"   =>  {nameWithNoType: "foo",      type: "boolean"}
    //   "foo[bar]:null" =>  {nameWithNoType: "foo[bar]", type: "null"}
    extractTypeAndNameWithNoType: function (name) {
        var match;
        if (match = name.match(/(.*):([^:]+)$/)) {
            return {nameWithNoType: match[1], type: match[2]};
        } else {
            return {nameWithNoType: name, type: null};
        }
    },

    // Raise an error if the type is not recognized.
    validateType: function (name, type, opts) {
        var validTypes, f;
        f = $.serializeJSON;
        validTypes = f.optionKeys(opts ? opts.typeFunctions : f.defaultOptions.defaultTypes);
        if (!type || validTypes.indexOf(type) !== -1) {
            return true;
        } else {
            throw new Error("serializeJSON ERROR: Invalid type " + type + " found in input name '" + name + "', please use one of " + validTypes.join(', '));
        }
    },


    // Split the input name in programatically readable keys.
    // Examples:
    // "foo"              => ['foo']
    // "[foo]"            => ['foo']
    // "foo[inn][bar]"    => ['foo', 'inn', 'bar']
    // "foo[inn[bar]]"    => ['foo', 'inn', 'bar']
    // "foo[inn][arr][0]" => ['foo', 'inn', 'arr', '0']
    // "arr[][val]"       => ['arr', '', 'val']
    splitInputNameIntoKeysArray: function (nameWithNoType) {
        var keys, f;
        f = $.serializeJSON;
        keys = nameWithNoType.split('['); // split string into array
        keys = keys.map(function (key) {
            return key.replace(/\]/g, '');
        }); // remove closing brackets
        if (keys[0] === '') {
            keys.shift();
        } // ensure no opening bracket ("[foo][inn]" should be same as "foo[inn]")
        return keys;
    },

    // Set a value in an object or array, using multiple keys to set in a nested object or array:
    //
    // deepSet(obj, ['foo'], v)               // obj['foo'] = v
    // deepSet(obj, ['foo', 'inn'], v)        // obj['foo']['inn'] = v // Create the inner obj['foo'] object, if needed
    // deepSet(obj, ['foo', 'inn', '123'], v) // obj['foo']['arr']['123'] = v //
    //
    // deepSet(obj, ['0'], v)                                   // obj['0'] = v
    // deepSet(arr, ['0'], v, {useIntKeysAsArrayIndex: true})   // arr[0] = v
    // deepSet(arr, [''], v)                                    // arr.push(v)
    // deepSet(obj, ['arr', ''], v)                             // obj['arr'].push(v)
    //
    // arr = [];
    // deepSet(arr, ['', v]          // arr => [v]
    // deepSet(arr, ['', 'foo'], v)  // arr => [v, {foo: v}]
    // deepSet(arr, ['', 'bar'], v)  // arr => [v, {foo: v, bar: v}]
    // deepSet(arr, ['', 'bar'], v)  // arr => [v, {foo: v, bar: v}, {bar: v}]
    //
    deepSet: function (o, keys, value, opts) {
        var key, nextKey, tail, lastIdx, lastVal, f;
        if (opts == null) {
            opts = {};
        }
        f = $.serializeJSON;
        if (f.isUndefined(o)) {
            throw new Error("ArgumentError: param 'o' expected to be an object or array, found undefined");
        }
        if (!keys || keys.length === 0) {
            throw new Error("ArgumentError: param 'keys' expected to be an array with least one element");
        }

        key = keys[0];

        // Only one key, then it's not a deepSet, just assign the value.
        if (keys.length === 1) {
            if (key === '') {
                o.push(value); // '' is used to push values into the array (assume o is an array)
            } else {
                o[key] = value; // other keys can be used as object keys or array indexes
            }

            // With more keys is a deepSet. Apply recursively.
        } else {
            nextKey = keys[1];

            // '' is used to push values into the array,
            // with nextKey, set the value into the same object, in object[nextKey].
            // Covers the case of ['', 'foo'] and ['', 'var'] to push the object {foo, var}, and the case of nested arrays.
            if (key === '') {
                lastIdx = o.length - 1; // asume o is array
                lastVal = o[lastIdx];
                if (f.isObject(lastVal) && (f.isUndefined(lastVal[nextKey]) || keys.length > 2)) { // if nextKey is not present in the last object element, or there are more keys to deep set
                    key = lastIdx; // then set the new value in the same object element
                } else {
                    key = lastIdx + 1; // otherwise, point to set the next index in the array
                }
            }

            // '' is used to push values into the array "array[]"
            if (nextKey === '') {
                if (f.isUndefined(o[key]) || !$.isArray(o[key])) {
                    o[key] = []; // define (or override) as array to push values
                }
            } else {
                if (opts.useIntKeysAsArrayIndex && f.isValidArrayIndex(nextKey)) { // if 1, 2, 3 ... then use an array, where nextKey is the index
                    if (f.isUndefined(o[key]) || !$.isArray(o[key])) {
                        o[key] = []; // define (or override) as array, to insert values using int keys as array indexes
                    }
                } else { // for anything else, use an object, where nextKey is going to be the attribute name
                    if (f.isUndefined(o[key]) || !f.isObject(o[key])) {
                        o[key] = {}; // define (or override) as object, to set nested properties
                    }
                }
            }

            // Recursively set the inner object
            tail = keys.slice(1);
            f.deepSet(o[key], tail, value, opts);
        }
    }

};
