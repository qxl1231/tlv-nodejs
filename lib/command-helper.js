/**
 * Created by qiangxl on 16/9/20.
 */
// 将buffer转成接口所需要的逗号分隔字符串
var _ = require('lodash');
var buf2string = function (buf) {
  var result = '';
  for (var ii = 0; ii < buf.length; ii++) {
    result += buf.toString('hex', ii, ii + 1).toUpperCase() + ',';
  }
  return result.slice(0, -1);
};
exports.buf2string = buf2string;

// 将接口所提供的逗号分隔字符串转换成buffer
var string2buf = function (str) {
  var newStr = str.replace(/[,\s]/g, '');
  return new Buffer(newStr, 'hex');
};
exports.string2buf = string2buf;