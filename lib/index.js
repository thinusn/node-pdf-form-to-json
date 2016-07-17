'use strict';

var exec = require('child_process').exec;

module.exports = {
  dumpDataFields: dumpDataFields,
  getDataFields: getDataFields
};

/**
 * Helper function to build the json
 * @param data
 * @returns {{}}
 */
function buildJSON(data) {
  var arr = {};
  var all = data.split('---\r\n');

  all.forEach(function (item, index) {
    var bundle = item.split('\r\n');
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
    if (res) {
      arr[res.FieldName] = res.FieldValue;
    }
  });
  return arr;
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
