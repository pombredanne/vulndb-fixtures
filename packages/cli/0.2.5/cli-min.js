/**
 * Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var cli=exports,argv,curr_opt,curr_val,full_opt,is_long,short_tags=[],opt_list,parsed={},usage,argv_parsed,command_list,daemon,daemon_arg,no_color,show_debug;cli.app=null,cli.version=null,cli.argv=[],cli.argc=0,cli.options={},cli.args=[],cli.command,cli.native={};var define_native=function(a){Object.defineProperty(cli.native,a,{enumerable:!0,configurable:!0,get:function(){delete cli.native[a];return cli.native[a]=require(a)}})},natives=process.binding("natives");for(var module in natives)define_native(module);cli.output=cli.native.util.print,cli.exit=process.exit;var enable={help:!0,version:!1,daemon:!1,status:!1,timeout:!1,catchall:!1,glob:!1};cli.enable=function(){Array.prototype.slice.call(arguments).forEach(function(a){switch(a){case"daemon":try{daemon=require("daemon");if(typeof daemon.start!=="function")throw"Invalid module"}catch(b){cli.fatal("daemon.node not installed. Please run `npm install daemon`")}break;case"catchall":process.on("uncaughtException",function(a){cli.error("Uncaught exception: "+(a.msg||a))});break;case"help":case"version":case"status":case"autocomplete":case"timeout":break;case"glob":try{glob=require("glob");if(typeof glob.glob!=="function")throw"Invalid module"}catch(b){cli.fatal("glob not installed. Please run `npm install glob`")}cli.glob=glob.glob,cli.globSync=glob.globSync;break;default:cli.fatal('Unknown plugin "'+a+'"')}enable[a]=!0});return cli},cli.disable=function(){Array.prototype.slice.call(arguments).forEach(function(a){enable[a]&&(enable[a]=!1)});return cli},cli.setArgv=function(a,b){a instanceof Array||(a=a.split(" ")),cli.app=a.shift(),!b&&"node"===cli.app&&(cli.app=a.shift()),cli.app=cli.native.path.basename(cli.app),argv_parsed=!1,cli.args=cli.argv=argv=a,cli.argc=argv.length},cli.setArgv(process.argv),cli.next=function(){argv_parsed||(cli.args=[],argv_parsed=!0),curr_val=null;if(short_tags.length){curr_opt=short_tags.shift(),full_opt="-"+curr_opt;return curr_opt}if(!argv.length)return!1;curr_opt=argv.shift();if(curr_opt==="-"||curr_opt==="--"){while(argv.length)cli.args.push(argv.shift());return!1}if(curr_opt[0]!=="-"){cli.args.push(curr_opt);return cli.next()}is_long=curr_opt[1]==="-",curr_opt=curr_opt.substr(is_long?2:1);if(!is_long&&curr_opt.length>1){short_tags=curr_opt.split("");return cli.next()}var a,b;if(is_long&&(a=curr_opt.indexOf("="))>=0){curr_val=curr_opt.substr(a+1),curr_opt=curr_opt.substr(0,a),b=curr_val.length;if(curr_val[0]==='"'&&curr_val[b-1]==='"'||curr_val[0]==="'"&&curr_val[b-1]==="'")curr_val=curr_val.substr(1,b-2);curr_val.match(/^[0-9]+$/)&&(curr_val=parseInt(curr_val,10))}full_opt=(is_long?"--":"-")+curr_opt;return curr_opt},cli.parse=function(a,b){var c,d,e=cli.options,f,g=!a;opt_list=a||{},command_list=b||[];while(o=cli.next()){f=!1;for(opt in opt_list){if(!(opt_list[opt]instanceof Array))continue;opt_list[opt][0]===!1&&(opt_list[opt][0]=opt);if(o===opt||o===opt_list[opt][0]){f=!0;if(opt_list[opt].length===2){e[opt]=!0;break}c=null,opt_list[opt].length===4&&(c=opt_list[opt][3]);if(opt_list[opt][2]instanceof Array){for(d=0,l=opt_list[opt][2].length;d<l;d++)typeof opt_list[opt][2][d]==="number"&&(opt_list[opt][2][d]+="");e[opt]=cli.getArrayValue(opt_list[opt][2],is_long?null:c);break}opt_list[opt][2].toLowerCase&&(opt_list[opt][2]=opt_list[opt][2].toLowerCase());switch(opt_list[opt][2]){case"string":case 1:case!0:e[opt]=cli.getValue(c);break;case"int":case"number":case"num":case"time":case"seconds":case"secs":case"minutes":case"mins":case"x":case"n":e[opt]=cli.getInt(c);break;case"float":case"decimal":e[opt]=cli.getFloat(c);break;case"path":case"file":case"directory":case"dir":e[opt]=cli.getPath(c,opt_list[opt][2]);break;case"email":e[opt]=cli.getEmail(c);break;case"url":case"uri":case"domain":case"host":e[opt]=cli.getUrl(c,opt_list[opt][2]);break;case"ip":e[opt]=cli.getIp(c);break;case"bool":case"boolean":case"on":e[opt]=!0;case"false":case"off":case!1:case 0:e[opt]=!1;default:cli.fatal('Unknown opt type "'+opt_list[opt][2]+'"')}break}}if(!f){if(!enable.help||o!=="h"&&o!=="help")if(!enable.version||o!=="v"&&o!=="version"){if(enable.daemon&&(o==="d"||o==="daemon")){daemon_arg=cli.getArrayValue(["start","stop","restart","pid","log"],is_long?null:"start");continue}if(enable.catchall&&(o==="c"||o==="catch"))continue;if(enable.status&&(o==="k"||o==="no-color"||o==="debug")){no_color=o==="k"||o==="no-color",show_debug=o==="debug";continue}if(enable.timeout&&(o==="t"||o==="timeout")){var h=cli.getInt();setTimeout(function(){cli.fatal("Process timed out after "+h+"s")},h*1e3);continue}if(g){e[o]=curr_val||!0;continue}}else typeof cli.version==="undefined"&&cli.parsePackageJson(),console.log(cli.app+" v"+cli.version),process.exit();else cli.getUsage(),process.exit();cli.fatal("Unknown option "+full_opt)}}for(opt in opt_list){c=opt_list[opt].length===4?opt_list[opt][3]:null;if(opt_list[opt]instanceof Array)typeof e[opt]==="undefined"&&(e[opt]=c);else{e[opt]=opt_list[opt];continue}}command_list.length&&(cli.args.length===0?cli.fatal("A command is required"+(enable.help?". Please see --help for more information":"")):cli.command=cli.autocompleteCommand(cli.args.shift())),cli.argc=cli.args.length;return e},cli.autocompleteCommand=function(a){var b;command_list instanceof Array?b=command_list:b=Object.keys(command_list);var c,d=0,e=a.length,f;if(b.length===0||b.indexOf(a)!==-1)return a;for(c=0;c<e;c++){f=[],l=b.length;if(l<=1)break;for(d=0;d<l;d++)b[d].length>=c&&b[d][c]===a[c]&&f.push(b[d]);b=f}l=b.length;if(l===1)return b[0];l===0?cli.fatal('Unknown command "'+a+'"'+(enable.help?". Please see --help for more information":"")):(b.sort(),cli.fatal('The command "'+a+'" is ambiguous and could mean "'+b.join('", "')+'"'))},cli.status=function(a,b){var c;switch(b){case"info":c=no_color?"INFO:":"[33mINFO[0m:";break;case"debug":c=no_color?"DEBUG:":"[36mDEBUG[0m:";break;case"error":case"fatal":c=no_color?"ERROR:":"[31mERROR[0m:";break;case"ok":c=no_color?"OK:":"[32mOK[0m:"}a=c+" "+a,b==="fatal"&&(console.error(a),process.exit(1));(!enable.status||show_debug||b!=="debug")&&console.error(a)},["info","error","ok","debug","fatal"].forEach(function(a){cli[a]=function(b){cli.status(b,a)}}),cli.setApp=function(a,b){a.indexOf("package.json")!==-1?cli.parsePackageJson(a):(cli.app=a,cli.version=b);return cli},cli.parsePackageJson=function(a){var b=function(a){var b=JSON.parse(cli.native.fs.readFileSync(a,"utf8"));cli.version=b.version,cli.app=b.name},c=function(a,b,c){for(var d=0,e=a.length;d<e;d++)try{b(a[d]);return}catch(f){d===e-1&&cli.fatal(c)}};try{if(a)return b(a);c([__dirname+"/package.json",__dirname+"/../package.json",__dirname+"/../../package.json"],b)}catch(d){cli.fatal("Could not detect "+cli.app+" version")}},cli.setUsage=function(a){usage=a;return cli};var pad=function(a,b){typeof b==="undefined"&&(b=a,a="");if(a.length<b){b-=a.length;while(b--)a+=" "}return a};cli.getUsage=function(){var a,b,c,d,e=[],f=25,g=function(a,b,c){var d=a.length,e=65-d,f="";if(b.length<=e)return b;var g=b.split(" "),h=0,i;while(g.length)f+=(i=g.shift())+" ",h+=i.length,g.length&&h+g[0].length>e&&(f+="\n"+pad(d),h=0);return f};usage=usage||cli.app+" [OPTIONS]"+(command_list?" <command>":"")+" [ARGS]",console.log("[1mUsage[0m:\n  "+usage),console.log("\n[1mOptions[0m: ");for(opt in opt_list){opt.length===1?(long=opt_list[opt][0],a=opt):(long=opt,a=opt_list[opt][0]),b=opt_list[opt][1].trim(),type=opt_list[opt].length>=3?opt_list[opt][2]:null,c=opt_list[opt].length===4?opt_list[opt][3]:null,a===long?a.length===1?d="  -"+a:d="      --"+long:d="  -"+a+", --"+long,d+=" ";if(type){type instanceof Array&&(b+=". VALUE must be either ["+type.join("|")+"]",type="VALUE");if(type===!0||type===1)type=long.toUpperCase();type=type.toUpperCase();if(type==="FLOAT"||type==="INT")type="NUMBER";d+=c?"["+type+"]":type}d=pad(d,f),d+=g(d,b),d+=c?" (Default is "+c+")":"",console.log(d),e.push(a),e.push(long)}enable.timeout&&e.indexOf("t")===-1&&e.indexOf("timeout")===-1&&console.log(pad("  -t, --timeout N",f)+"Exit if the process takes longer than N seconds"),enable.status&&(e.indexOf("k")===-1&&e.indexOf("no-color")===-1&&console.log(pad("  -k, --no-color",f)+"Omit color from output"),e.indexOf("debug")===-1&&console.log(pad("      --debug",f)+"Show debug information")),enable.catchall&&e.indexOf("c")===-1&&e.indexOf("catch")===-1&&console.log(pad("  -c, --catch",f)+"Catch unanticipated errors"),enable.daemon&&e.indexOf("d")===-1&&e.indexOf("daemon")===-1&&console.log(pad("  -d, --daemon [ARG]",f)+"Daemonize the process. Control the daemon using [start, stop, restart, log, pid]"),enable.version&&e.indexOf("v")===-1&&e.indexOf("version")===-1&&console.log(pad("  -v, --version",f)+"Display the current version"),enable.help&&e.indexOf("h")===-1&&e.indexOf("help")===-1&&console.log(pad("  -h, --help",f)+"Display help and usage details");if(command_list.length){console.log("\n[1mCommands[0m: ");var h;command_list instanceof Array?h=command_list:h=Object.keys(command_list),command_list.sort(),console.log("  "+g("  ",command_list.join(", ")))}process.exit()},cli.getOptError=function(a,b){var c=full_opt+" expects "+a+". Use `"+cli.app+" "+full_opt+(is_long?"=":" ")+b+"`";return c},cli.getValue=function(a,b,c){c=c||cli.getOptError("a value","VALUE");var d;try{if(curr_val){b&&(curr_val=b(curr_val));return curr_val}if(short_tags.length)throw"Short tags";if(!argv.length||argv[0][0]==="-")throw"No value";d=argv.shift(),d.match(/^[0-9]+$/)&&(d=parseInt(d,10)),b&&(d=b(d))}catch(e){d&&argv.unshift(d);return a||cli.fatal(c)}return d},cli.getInt=function(a){return cli.getValue(a,function(a){if(typeof a==="number")return a;if(!a.match(/^(?:-?(?:0|[1-9][0-9]*))$/))throw"Invalid int";return parseInt(a)},cli.getOptError("a number","NUMBER"))},cli.getFloat=function(a){return cli.getValue(a,function(a){if(!a.match(/^(?:-?(?:0|[1-9][0-9]*))?(?:\.[0-9]*)?$/))throw"Invalid float";return parseFloat(a,10)},cli.getOptError("a number","NUMBER"))},cli.getUrl=function(a,b){b=b||"url";return cli.getValue(a,function(a){if(!a.match(/^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/))throw"Invalid URL";return a},cli.getOptError("a "+b,b.toUpperCase()))},cli.getEmail=function(a){return cli.getValue(a,function(a){if(!a.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/))throw"Invalid email";return a},cli.getOptError("an email","EMAIL"))},cli.getIp=function(a){return cli.getValue(a,function(a){if(!a.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))throw"Invalid IP";return a},cli.getOptError("an IP","IP"))},cli.getPath=function(a,b){b=b||"path";return cli.getValue(a,function(a){if(a.match(/[?*:;{}]/))throw"Invalid path";return a},cli.getOptError("a "+b,b.toUpperCase()))},cli.getArrayValue=function(a,b){return cli.getValue(b,function(b){if(a.indexOf(b)===-1)throw"Unexpected value";return b},cli.getOptError("either ["+a.join("|")+"]","VALUE"))},cli.withStdin=function(a,b){typeof a==="function"&&(b=a,a="utf8");var c=process.openStdin(),d="";c.setEncoding(a),c.on("data",function(a){d+=a}),c.on("end",function(){b.apply(cli,[d])})},cli.withStdinLines=function(a){cli.withStdin(function(b){var c=b.indexOf("\r\n")!==-1?"\r\n":"\n";a.apply(cli,[b.split(c),c])})},cli.withInput=function(a,b,c){typeof b==="function"?(c=b,b="utf8"):typeof a==="function"&&(c=a,b="utf8",a="stdin");if(a==="stdin")a=process.openStdin();else try{a=cli.native.fs.createReadStream(a),a.on("error",cli.fatal)}catch(d){return cli.fatal(d)}a.setEncoding(b);var e=[],f="",g,h;a.on("data",function(a){if(!g){f+=a;if(!h)if(f.indexOf("\r\n")!==-1)h="\r\n";else if(f.indexOf("\n")!==-1)h="\n";else{last_line=f;return}e=f.split(h),f=g?null:e.pop();while(e.length)c.apply(cli,[e.shift(),h,!1])}}),a.on("end",function(){g=!0,f.length&&c.apply(cli,[f,h||"",!1]),c.apply(cli,[null,null,!0])})},cli.daemon=function(a,b){typeof daemon==="undefined"&&cli.fatal("Daemon is not initialized"),typeof a==="function"&&(b=a,a="start");var c="/tmp/"+cli.app+".pid",d="/tmp/"+cli.app+".log",e=function(){daemon.run(d,c,function(a){if(a)return cli.error("Error starting daemon: "+a);b()})},f=function(){try{cli.native.fs.readFileSync(c)}catch(a){return cli.error("Daemon is not running")}daemon.stop(c,function(a,b){if(a&&a.errno===3)return cli.error("Daemon is not running");if(a)return cli.error("Error stopping daemon: "+a.errno);cli.ok("Successfully stopped daemon with pid: "+b)})};switch(a){case"stop":f();break;case"restart":daemon.stop(c,function(){e()});break;case"log":try{console.log(cli.native.fs.readFileSync(d,"utf8"))}catch(g){return cli.error("No daemon log file")}break;case"pid":try{var h=cli.native.fs.readFileSync(c,"utf8");cli.native.fs.statSync("/proc/"+h),cli.info(h)}catch(g){return cli.error("Daemon is not running")}break;default:e()}},cli.main=function(a){var b=function(){a.apply(cli,[cli.args,cli.options])};enable.daemon&&daemon_arg?cli.daemon(daemon_arg,b):b()},cli.createServer=function(){var a=function(a,b,c){if(c){console.error(c.stack),b.writeHead(500,{"Content-Type":"text/plain"});return b.end(c.stack+"\n")}b.writeHead(404,{"Content-Type":"text/plain"}),b.end("Not Found\n")},b=error=a,c=Array.prototype.slice.call(arguments);c.length&&c[0]instanceof Array&&(c=c[0]),c.reverse().forEach(function(a){var c=b;b=function(b,d){try{a(b,d,function(a){if(a)return error(b,d,a);c(b,d)})}catch(e){error(b,d,e)}}});return cli.native.http.createServer(b)},cli.exec=function(a,b,c){cli.native.child_process.exec(a,function(a,d,e){a=a||e;if(a){if(c)return c(a);return cli.fatal("exec() failed\n"+a)}b&&b(d.split("\n"))})};var last_progress_call,progress_len=74;cli.progress=function(a){if(a>=0&&a<=1){var b=(new Date).getTime();if(last_progress_call&&b-last_progress_call<100&&a!==1)return;last_progress_call=b;var c=function(){if(a===1)return" 100%\n";var b=Math.floor(a*100)+"%";a<.1&&(b=" "+b);return"  "+b},d=Math.floor(progress_len*a),e="";while(d--)e+="#";cli.native.util.print(pad(e,progress_len)+c()+"\r")}};var spinnerInterval;cli.spinner=function(a,b){if(b){cli.native.util.print("\r"+a);return clearInterval(spinnerInterval)}a=a+" ";var c=["-","\\","|","/"],d=0,e=c.length;spinnerInterval=setInterval(function(){cli.native.util.print("\r"+a+c[d++]),d==e&&(d=0)},200)}
