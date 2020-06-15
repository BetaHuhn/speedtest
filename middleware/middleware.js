const log = require("../utils/log");

const sendResult = function(res, result, code) {
 res.status(code).json({
   status: code,
   time: new Date(),
   result: result,
 });
}

const routeLog = function(){
	return (req, res, next) => {
		const date_ob = new Date();
		const date = ('0' + date_ob.getDate()).slice(-2);
		const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
		const year = date_ob.getFullYear();
		const hours = date_ob.getHours();
		const minutes = date_ob.getMinutes();
		const seconds = date_ob.getSeconds();
		const time = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
		log.request(`${time} ${req.method} ${req.originalUrl}`)
		next()
	};
}

module.exports = {
    sendResult: sendResult,
    routeLog: routeLog
}