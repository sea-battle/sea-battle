var express = require('express');
var router = express.Router();
var jade = require('jade');

router.get('/tutorial', function (req, res) {
	res.render(__dirname + '/../views/tutorial', {
		bodyClass: 'tutorial'
	});
});

router.get('*', function (req, res) {
	res.render(__dirname + '/../views/404', {
		bodyClass: '404'
	});
});

module.exports = router;