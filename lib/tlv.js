/**
 * Created by qiangxl on 16/9/20.
 */
var tlvspec = require("./tlv-spec.js");
var _ = require('lodash');
var commandHelper = require('./command-helper');

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
var json2hex4tlv = function json2hex4tlv(jsonStringOrObject, commandSpec, deviceType) {

  //var hexCmdBuf = new Buffer(bufferTemplate);
  var head = new Buffer([0xAA, 0xFF, 0xDB, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xCA]);
  head[2] = deviceType;
  var body = new Buffer(0);
  var all = {};
  var jsonObj = null;
  if (typeof jsonStringOrObject === 'string') {
    jsonObj = JSON.parse(jsonStringOrObject);
  } else {
    jsonObj = JSON.parse(JSON.stringify(jsonStringOrObject));
  }


  for (var prop in jsonObj) {
    if (commandSpec[prop]) {

      if (commandSpec[prop].valueCalcFunc) {
        var value = commandSpec[prop].valueCalcFunc(jsonObj[prop]);
        //console.log("test1:" + value);
        var tempArray = [commandSpec[prop].type, commandSpec[prop].len];
        if (value == 1) {
          //console.log("test111:" + value);
          console.log('value len:', value);
          tempArray = [commandSpec[prop].type, value, value];
        }
        else if (value.length > 1) {
          console.log('value len:', value.length);
          for (var a = 0; a < value.length; a++) {
            tempArray.push(value[a]);
          }
        }
        //console.log("111:" + tempArray)
        var tlv = new Buffer(tempArray);
        //console.log(tlv)
        body = Buffer.concat([body, tlv]);
      }
    }
  }
  var ca_len = head.length + body.length;
  //console.log(ca_len);

  head[1] = ca_len;

  all = Buffer.concat([head, body]);
  console.log('all:', all);
  var checkSum = 0;
  for (var i = 1; i < (all.length ); i++) {

    checkSum = checkSum + all[i];
  }
  checkSum = ~checkSum;
  checkSum = checkSum + 1;
  checkSum = checkSum & 0x00FF;

  //Logger.info(checkSum);
  //Logger.info(all);
  //var ll=serialPortHelper.cmdMakeup(all);
  var sum = new Buffer([checkSum]);
  var ll = Buffer.concat([all, sum]);
  //console.log(ll);
  //Logger.info(ll);
  //console.log(ll.length);
  return ll;


};
exports.json2hex4tlv = json2hex4tlv;


var hex2json4tlv = function hex2json4tlv(hexStatusString, statusSpec) {

  var jsonStatus = {};
  var body = hexStatusString.slice(11, hexStatusString.length - 1);
  console.log(body);

  for (var i = 0; i < body.length;) {
    var type = body[i];
    var len = body[i + 1];
    var value = [];

    if (len >= 1) {
      for (var x = 0; x < len; x++) {
        value.push(body[i + 2 + x]);
      }

    }

    for (var key in statusSpec) {
      if (type == statusSpec[key].type) {
        if (statusSpec[key].valueCalcFunc) {
          //console.log(value);
          jsonStatus[key] = statusSpec[key].valueCalcFunc(value);
          //console.log(jsonStatus);
        }
      }
    }
    i = i + 2 + len;
  }


  return jsonStatus;

};
exports.hex2json4tlv = hex2json4tlv;
//var command = {
//  ca_appointment_wash: 1,
//  ca_pay_result: 1,
//  ca_balance: 133.3,
//  ca_fee_price: 133.3,
//  ca_mode_price: '5_4.05',
//  ca_pwd: '1g.MimA'
//};
//
//var hex = commandHelper.buf2string(json2hex4tlv(command, tlvspec.commandSpec, '0xDB')).toLowerCase();
//console.log(hex);
//var json= hex2json4tlv(reportData, tlvspec.statusSpec('04CA'));
//console.log(json);