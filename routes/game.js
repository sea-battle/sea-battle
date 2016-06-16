var express = require('express');
var router = express.Router();
var jade = require('jade');
router.get('/rooms', function (req, res) {
	res.render(__dirname + '/../views/rooms', {
		bodyClass: 'rooms'
	});
});
router.post('/wait', function (req, res) {
	var fn = jade.compileFile(__dirname + '/../views/wait.jade');
	var html = fn(req.body);
	return res.json({
		bodyClass: 'wait',
		html: html,
		scriptsSrc: [
            '/javascripts/pages/wait.js',
            '/javascripts/chat.js'
        ],
		title: 'Prepare to fight',
	});
});
router.get('/game', function (req, res) {
	var fn = jade.compileFile(__dirname + '/../views/game.jade');
	var html = fn();
	return res.json({
		bodyClass: 'game',
		html: html,
		scriptsSrc: [
            '/javascripts/grid.js',
            '/javascripts/boat.js',
            '/javascripts/pages/game.js',
        ],
		title: 'Let\'s shoot'
	});
});
module.exports = router;