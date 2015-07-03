/*
    (c) 2015 Brayden Strasen
    https://creativecommons.org/licenses/by-nc-sa/4.0/
*/
var players = [],
	joined = 0,
	track = 5,
	scale = 1,
	anit = 400,
	currentGame = "HaloOnline",
	currentType = "Slayer",
	selectedserver,
	loopPlayers,
	host = 1,
	forge = 0,
	servers,
	network = "offline";

function isset(val, other) {
	return (val !== undefined) ? val : other;
}

function randomNum(n) {
	return Math.floor(Math.random() * n);
}

function getServers() {
	servers = [];
	$.getJSON("http://192.99.124.162/list", function(data) {
		if (data.result.code !== 0) {
			alert("Error received from master: " + data.result.msg);
			return;
		}
		console.log(data);
		for (var i = 0; i < data.result.servers.length; i++) {
			var serverIP = data.result.servers[i];
			queryServer(serverIP, i);
		}
	});
}

function queryServer(serverIP, i) {
	console.log(serverIP);
	$.getJSON("http://" + serverIP, function(serverInfo) {
		var startTime = (new Date()).getTime(),
			endTime;

		$.ajax({
			type: "GET",
			url: "http://" + serverIP + "/",
			async: false,
			success: function() {
				endTime = (new Date()).getTime();
			}
		});
		var isPassworded = serverInfo.passworded !== undefined;
		if (serverInfo.map !== "") {
			if (isPassworded) {
				servers[i] = {
					"ip": serverIP,
					"name": "[PASSWORDED] " + serverInfo.name.toString().replace(/<(?:.|\n)*?>/gm, ''),
					"gametype": serverInfo.variant,
					"map": getMapName(serverInfo.mapFile),
					"players": {
						"max": serverInfo.maxPlayers,
						"current": serverInfo.numPlayers
					},
					"password": true
				};
			} else {
				servers[i] = {
					"ip": serverIP,
					"name": serverInfo.name.toString().replace(/<(?:.|\n)*?>/gm, ''),
					"gametype": serverInfo.variant,
					"map": getMapName(serverInfo.mapFile),
					"players": {
						"max": serverInfo.maxPlayers,
						"current": serverInfo.numPlayers
					}
				};
			}
		}
		ip = serverIP.substring(0, serverIP.indexOf(':'));
		$('#browser').append("<div class='server' id='server" + i + "' data-server=" + i + "><div class='thumb'><img src='img/maps/" + servers[i].map.toString().replace("Default", "").toUpperCase() + ".png'></div><div class='info'><span class='name'>" + servers[i].name + " (" + serverInfo.hostPlayer + ")  [" + (endTime - startTime) + "ms]</span><span class='settings'>" + serverInfo.variant + " on " + servers[i].map + "</span></div><div class='players'>" + servers[i].players.current + "/" + servers[i].players.max + "</div></div>");
		$('#server' + i).css("display", "none");
		$('#server' + i).fadeIn(anit);
		$('.server').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$('.server').click(function() {
			changeMenu("serverbrowser-custom", $(this).attr('data-server'));
			selectedserver = $(this).attr('data-server');
		});
	});
}

function getMapName(filename) {
	switch (filename) {
		case "guardian":
			return "Guardian";
		case "riverworld":
			return "Valhalla";
		case "s3d_avalanche":
			return "Diamondback";
		case "s3d_edge":
			return "Edge";
		case "s3d_reactor":
			return "Reactor";
		case "s3d_turf":
			return "Icebox";
	}
}

String.prototype.capitalizeFirstLetter = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};

function promptPassword(i) {
	var password = prompt(servers[i].name + " has a password, enter the password to join", "");
	if (password !== null) {
		window.open("dorito:" + servers[i].ip + "/" + password);
	}
}

function addServer(ip, isPassworded, name, host, map, mapfile, gamemode, status, numplayers, maxplayers) {
	var servName = "<td><a href=\"dorito:" + ip + "\">" + name + " (" + host + ")</a></td>";
	if (isPassworded)
		servName = "<td><a href=\"#\" onclick=\"promptPassword('" + ip + "');\">[PASSWORDED] " + name + " (" + host + ")</a></td>";

	var servMap = "<td>" + map + " (" + mapfile + ")</td>";
	var servType = "<td>" + gamemode + "</td>";
	var servStatus = "<td>" + status + "</td>";
	var servPlayers = "<td>" + numplayers + "/" + maxplayers + "</td>";

	$('#serverlist tr:last').after("<tr>" + servName + servMap + servType + servStatus + servPlayers + "</tr>");
}

function initalize() {
	if (window.location.protocol == "https:") {
		alert("The server browser doesn't work over HTTPS, switch to HTTP if possible.");
	}
	var set, b, g, i, e;
	for (i = 0; i < Object.keys(settings).length; i++) {
		set = Object.keys(settings)[i];
		if (settings[set].typeof == "select") {
			$('#dewrito-options').children('.options-select').append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='left'></span><span class='value'>...</span><span class='right'></span></div>");
		}
		if (settings[set].typeof == "input") {
			$('#dewrito-options').children('.options-select').append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input type='text' maxlength=24 /></span></div>");
		}
		if (settings[set].typeof == "color") {
			$('#dewrito-options').children('.options-select').append("<div data-option='" + set + "' class='selection'><span class='label'>" + settings[set].name + "</span><span class='input'><input id='option-" + set + "'/></span></div>");
			$('#option-' + set).spectrum({
				color: settings[set].current,
				preferredFormat: "hex",
				showInput: true,
				showPalette: true,
				showSelectionPalette: false,
				palette: [
					["#fb8b9f", "#cf3e3e", "#e97339"],
					["#ffdb41", "#2f703d", "#375799"],
					["#41aaa9", "#d4d4d4", "#5a5a5a"]
				],
				change: function(color) {
					changeSetting(set, color.toHexString());
					console.log(color.toHexString());
				}
			});
		}
		settings[set].update();
	}
	for (i = 0; i < Object.keys(maps).length; i++) {
		b = Object.keys(maps)[i];
		$('#choosemap').children('.map-select').append("<div data-game='" + b + "' class='selection'><span class='label'>" + maps[b].name + "</span></div>");
		$('#choosemap').append("<div class='map-select2 animated' id='maps-" + b + "'></div>");
		$(".map-select2").mousewheel(function(event, delta) {
			this.scrollTop -= (delta * 5);
			event.preventDefault();
		});
		for (e = 1; e < Object.keys(maps[b]).length; e++) {
			g = Object.keys(maps[b])[e];
			$('#maps-' + b).append("<div data-map='" + g + "' class='selection'><span class='label'>" + g + "</span></div>");
		}
	}
	for (i = 0; i < Object.keys(gametypes).length; i++) {
		b = Object.keys(gametypes)[i];
		$('#choosetype').children('.type-select').append("<div data-maintype='" + b + "' class='selection'><span class='label'>" + b.toUpperCase() + "</span></div>");
		$('#choosetype').append("<div class='type-select2 animated' id='types-" + b.replace(/\s/g, "") + "'></div>");
		$(".type-select2").mousewheel(function(event, delta) {
			this.scrollTop -= (delta * 5);
			event.preventDefault();
		});
		for (e = 0; e < Object.keys(gametypes[b]).length; e++) {
			g = Object.keys(gametypes[b])[e];
			$('#types-' + b.replace(/\s/g, "")).append("<div data-type='" + g + "' class='selection'><span class='label'>" + g.toUpperCase() + "</span></div>");
		}
	}
}

function changeSetting(s, by) {
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
	var e = settings[s];
	if (e.typeof == "select") {
		if (by == 1) {
			if (e.current < e.max) {
				e.current += e.increment;
			} else {
				e.current = e.min;
			}
		} else if (by === 0) {
			if (e.current > e.min) {
				e.current -= e.increment;
			} else {
				e.current = e.max;
			}
		}
	}
	if (e.typeof == "input" || e.typeof == "color") {
		e.current = by;
	}
	settings[s] = e;
	e.update();
	$.cookie(s, e.current);
}

function toggleNetwork() {
	if(network == "offline") network = "online";
	else network = "offline";
	$('#network').text(network.toUpperCase());
	$('#click')[0].currentTime = 0;
	$('#click')[0].play();
}

$(document).ready(function() {
	initalize();
	$('#refresh').click(function() {
		loadServers();
	});
	$('#network-toggle').click(function() {
		toggleNetwork();
	});
	$('#version').click(function() {
		clearAllCookies();
	});
	var e = ((window.innerHeight - $('#menu').height()) / 2) - 40;
	$('#music')[0].volume = settings.musicvolume.current;
	$('#click')[0].volume = settings.sfxvolume.current;
	$('#start').click(function() {
		startgame(servers[selectedserver].ip);
	});
	$('.selection').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$('.map-select .selection').click(function() {
		changeMap1($(this).attr('data-game'));
	});
	$('.map-select2 .selection').click(function() {
		changeMap2($(this).attr('data-map'), 0);
		changeMenu("options-custom");
	});
	$('.map-select2 .selection').hover(function() {
		changeMap2($(this).attr('data-map'));
	});
	$('.type-select .selection').click(function() {
		changeType1($(this).attr('data-maintype'));
	});
	$('.type-select2 .selection').click(function() {
		changeType2($(this).attr('data-type'), 0);
		changeMenu("options-custom");
	});
	$('.type-select2 .selection').hover(function() {
		changeType2($(this).attr('data-type'));
	});
	$('.right').click(function() {
		var c = $(this).parent('.selection').attr('data-option');
		changeSetting(c, 1);
	});
	$('.left').click(function() {
		var c = $(this).parent('.selection').attr('data-option');
		changeSetting(c, 0);
	});
	$('input').focusout(function() {
		var c = $(this).parent('.input').parent('.selection').attr('data-option'),
			val = $(this).val();
		changeSetting(c, val);
	});
	$("[data-action='menu']").click(function() {
		changeMenu($(this).attr('data-menu'));
	});
	$('#back').click(function() {
		changeMenu($(this).attr('data-action'));
	});
	$("#lobby-container").mousewheel(function(event, delta) {
		this.scrollTop -= (delta * 34);
		event.preventDefault();
	});
	$("#browser").mousewheel(function(event, delta) {
		this.scrollTop -= (delta * 70);
		event.preventDefault();
	});
});

String.prototype.toTitleCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

function acr(s) {
	var words, acronym, nextWord;
	words = s.split(' ');
	acronym = "";
	index = 0;
	while (index < words.length) {
		nextWord = words[index];
		acronym = acronym + nextWord.charAt(0);
		index = index + 1;
	}
	return acronym.toUpperCase();
}

function loadServers() {
	$('#browser').empty();
	getServers();
	$('.server').hover(function() {
		$('#click')[0].currentTime = 0;
		$('#click')[0].play();
	});
	$('.server').click(function() {
		changeMenu("serverbrowser-custom", $(this).attr('data-server'));
		selectedserver = $(this).attr('data-server');
	});
}

function hexToRgb(hex, opacity) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return "rgba(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + "," + opacity + ")";
}

function brighter(color) {
	var colorhex = (color.split("#")[1]).match(/.{2}/g);
	for (var i = 0; i < 3; i++) {
		var e = parseInt(colorhex[i], 16);
		e += 30;
		colorhex[i] = ((e > 255) ? 255 : e).toString(16);
	}
	return "#" + colorhex[0] + colorhex[1] + colorhex[2];
}

function playerLoop()
{
	delay(function() {
		$.getJSON("http://" + servers[selectedserver].ip, function(serverInfo) {
			players = serverInfo.players;
			$('#lobby').empty();
			$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
			$('#joined').text(serverInfo.numPlayers);
			$('#maxplayers').text(serverInfo.maxPlayers);
			for (var i = 0; i < serverInfo.numPlayers; i++) {
				if(typeof players[i] !== 'undefined') {
					$('#lobby').append("<tr id='player" + i + "' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
				}
			}
			$('#lobby tr').hover(function() {
				$('#click')[0].currentTime = 0;
				$('#click')[0].play();
			});
			$("#lobby tr").mouseover(function() {
				var n = $(this).attr('id'),
					hexes = (n == "user") ? "#000000" : "#000000",
					bright = brighter(hexes);
				$(this).css("background-color", hexToRgb(bright, 0.75));
			}).mouseout(function() {
				var n = $(this).attr('id');
				$(this).css("background-color", (n == "user") ? hexToRgb("#000000", 0.5) : hexToRgb("#000000", 0.5));
			});
			$('#lobby tr').click(function() {
				var e = $(this).children('.name').text(),
					n = $(this).attr('id'),
					nn = "user",
					hexes = (n == "user") ? "#000000" : "#000000",
					bright = brighter(hexes);
				changeMenu("custom-player", e);
				$('#lobby tr').each(function() {
					var color = $(this).attr('data-color');
					$(this).css('background', color);
				});
				$(this).css("background-color", hexToRgb(bright, 0.75));
			});

			if (loopPlayers)
				playerLoop();
		});
	}, 3000);
}

function playersJoin(number, max, time, ip) {
	$.getJSON("http://" + ip, function(serverInfo) {
		players = serverInfo.players;
		console.log(players);
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>0</span>/<span id='maxplayers'>0</span></td></tr>");
		$('#maxplayers').text(serverInfo.maxPlayers);
		$('#joined').text(serverInfo.numPlayers);
		for (var i = 0; i < serverInfo.numPlayers; i++) {
			if (players[i].name !== undefined)
			$('#lobby').append("<tr id='player" + i + "' data-color='" + hexToRgb("#000000", 0.5) + "' style='background:" + hexToRgb("#000000", 0.5) + ";'><td class='name'>" + players[i].name + "</td><td class='rank'><img src='img/ranks/38.png'</td></tr>");
			$('#player' + i).css("display", "none");
			$('#player' + i).fadeIn(anit);
		}
		$('#lobby tr').hover(function() {
			$('#click')[0].currentTime = 0;
			$('#click')[0].play();
		});
		$("#lobby tr").mouseover(function() {
			var n = $(this).attr('id'),
				hexes = (n == "user") ? "#000000" : "#000000",
				bright = brighter(hexes);
			$(this).css("background-color", hexToRgb(bright, 0.75));
		}).mouseout(function() {
			var n = $(this).attr('id');
			$(this).css("background-color", (n == "user") ? hexToRgb("#000000", 0.5) : hexToRgb("#000000", 0.5));
		});
		$('#lobby tr').click(function() {
			var e = $(this).children('.name').text(),
				n = $(this).attr('id'),
				nn = "user",
				hexes = (n == "user") ? "#000000" : "#000000",
				bright = brighter(hexes);
			changeMenu("custom-player", e);
			$('#lobby tr').each(function() {
				var color = $(this).attr('data-color');
				$(this).css('background', color);
			});
			$(this).css("background-color", hexToRgb(bright, 0.75));
		});
	});
}

function changeMenu(menu, details) {
	var f;
	if (menu == "main-custom") {
		host = 1; forge = 0;
		$('#title').text('CUSTOM GAME');
		$('#subtitle').text('');
		$('#network-toggle').hide();
		$('#type-selection').show();
		currentType = "Slayer";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START GAME");
		loopServers = false;
	}
	if (menu == "main-forge") {
		host = 1; forge = 1;
		$('#title').text('FORGE');
		$('#subtitle').text('');
		$('#network-toggle').show();
		$('#type-selection').hide();
		currentType = "Forge";
		$('#gametype-icon').css({
			"background-image": "url('img/gametypes/" + currentType + ".png')"
		});
		$('#customgame').attr('data-from', 'main');
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'custom-main');
		$('#customgame').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>16</span></td></tr>");
		$('#start').children('.label').text("START FORGE");
		loopServers = false;
	}
	if (menu == "custom-main") {
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#customgame').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');
		loopServers = false;
	}
	if (menu == "serverbrowser-custom" && details) {
		host = 0;
		$('#lobby').empty();
		$('#lobby').append("<tr class='top'><td class='info' colspan='2'>Current Lobby <span id='joined'>1</span>/<span id='maxplayers'>0</span></td></tr>");
		var d = servers[details];
		if (d.players.current != d.players.max) {
			changeMap2(d.map);
			$('#subtitle').text(d.name + " : " + d.ip);
			if (d.gametype === "") {
				d.gametype = "Slayer";
			}
			$('#gametype-display').text(d.gametype.toUpperCase());
			$('#gametype-icon').css('background', "url('img/gametypes/" + d.gametype + ".png') no-repeat 0 0/cover");
			$('#serverbrowser').css({
				"top": "720px"
			});
			$('#customgame').css({
				"top": "0px"
			});
			$('#back').attr('data-action', 'custom-serverbrowser');
			$('#customgame').attr('data-from', 'serverbrowser');
			playersJoin(d.players.current, d.players.max, 20, d.ip);
			playerLoop();
			loopPlayers = true;
			loopServers = false;
		}
		$('#start').children('.label').text("JOIN GAME");
	}
	if (menu == "custom-serverbrowser") {
		$('#customgame').css({
			"top": "-720px"
		});
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#browser').empty();
		loadServers();
		loopPlayers = false;
	}
	if (menu == "main-serverbrowser") {
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px"
		});
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'serverbrowser-main');
		$('#serverbrowser').css({
			"top": "0px"
		});
		$('#main').css({
			"top": "720px"
		});
		$('#browser').empty();
		loadServers();
		loopPlayers = false;
	}
	if (menu == "serverbrowser-main") {
		$('#dewrito').css({
			"opacity": 0.95,
			"top": "240px",
			"-webkit-transition-timing-function": "400ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#serverbrowser').css({
			"top": "-720px"
		});
		$('#main').css({
			"top": "0px"
		});
		$('#back').attr('data-action', 'main-main2');
		loopServers = false;
	}
	if (menu == "main2-main") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'main-main2');
		$('#main').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		loopServers = false;
	}
	if (menu == "main2-credits") {
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'credits-main2');
		$('#credits').css({
			"top": "0px"
		});
		$('#main2').css({
			"top": "720px"
		});
		$('#dewrito').css({
			"top": "50px",
			"left": "265px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#bg-cover').css({
			"background": "rgba(0,0,0,0.5)"
		});
		$('#dewrito').css({
			'background': "url('img/Halo 3 CE.png') no-repeat 0 0/cover"
		});
		loopServers = false;
	}
	if (menu == "credits-main2") {
		$('#back').fadeOut(anit);
		$('#credits').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		$('#dewrito').css({
			"top": "240px",
			"left": "-10px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		$('#bg-cover').css({
			"background": "rgba(0,0,0,0.25)"
		});
		var c = settings.logo.current;
		$('#dewrito').css({
			'background': "url('img/" + settings.logo.labels[c] + ".png') no-repeat 0 0/cover"
		});
		loopServers = false;
	}
	if (menu == "main-main2") {
		$('#back').fadeOut(anit);
		$('#main').css({
			"top": "-720px"
		});
		$('#main2').css({
			"top": "0px"
		});
		loopServers = false;
	}
	if (menu == "custom-options") {
		if(host === 1) {
			$('#customgame-options').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			loopServers = false;
		}
	}
	if (menu == "custom-map") {
		if(host === 1) {
			$('#choosemap').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			loopServers = false;
		}
	}
	if (menu == "custom-type") {
		if(host === 1 && forge === 0) {
			$('#choosetype').show();
			$('#back').attr('data-action', 'options-custom');
			$('#customgame').fadeOut(anit);
			$('#options').fadeIn(anit);
			$('#dewrito').css('top', '400px');
			$('#dewrito').css({
				"opacity": 0.9,
				"top": "400px",
				"-webkit-transition-timing-function": "200ms",
				"-webkit-transition-delay": "200ms"
			});
			loopServers = false;
		}
	}
	if (menu == "options-custom") {
		$('.options-section').hide();
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);
		$('#customgame').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"opacity": 0,
			"top": "920px",
			"-webkit-transition-timing-function": "200ms",
			"-webkit-transition-delay": "0ms"
		});
		loopServers = false;
	}
	if (menu == "main-options") {
		$('#dewrito-options').show();
		$('#back').fadeIn(anit);
		$('#back').attr('data-action', 'options-main');
		$('#main2').fadeOut(anit);
		$('#options').fadeIn(anit);
		$('#dewrito').css({
			"top": "400px"
		});
	}
	if (menu == "options-main") {
		$('.options-section').hide();
		$('#back').fadeOut(anit);
		$('#main2').fadeIn(anit);
		$('#options').fadeOut(anit);
		$('#dewrito').css({
			"top": "240px",
			"-webkit-transition-delay": "0ms"
		});
		loopServers = false;
	}
	if (menu == "custom-player") {
		$('#customgame').css({
			"left": "-800px"
		});
		$('#playerinfo').css({
			"right": "100px"
		});
		$('#back').attr('data-action', 'player-custom');
		$('#playermodel').css('background-image', "url('img/players/" + details + ".png')");
		playerInfo(details);
		loopServers = false;
	}
	if (menu == "player-custom") {
		$('#customgame').css({
			"left": "0px"
		});
		$('#playerinfo').css({
			"right": "-700px"
		});
		f = $('#customgame').attr('data-from');
		$('#back').attr('data-action', 'custom-' + f);
		loopServers = false;
	}
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

var KDdata = [{
		value: 1,
		color: "#cf3e3e",
		highlight: "#ed5c5c",
		label: "Deaths"
	}, {
		value: 1,
		color: "#375799",
		highlight: "#5575b7",
		label: "Kills"
	}],
	ctx = $("#player-kd-chart")[0].getContext("2d"),
	KDchart = new Chart(ctx).Doughnut(KDdata, {
		segmentShowStroke: false,
		percentageInnerCutout: 75,
		animationEasing: "easeInQuad"
	});

function playerInfo(name) {
	if (name != "user") {
		$.getJSON("http://" + servers[selectedserver].ip, function(info) {
			for (var i = 0; i < info.players.length; i++)
			{
				if (info.players[i].name == name)
				{
					console.log(info.players[i]);
					KDchart.segments[0].value = info.players[i].deaths > 0 ? info.players[i].deaths : 1;
					KDchart.segments[1].value = info.players[i].kills > 0 ? info.players[i].kills : 1;
					KDchart.update();
					var kdr = info.players[i].kills / info.players[i].deaths;

					if (kdr === "Infinity")
						kdr = info.players[i].kills;
					if (isNaN(kdr))
						kdr = 0;
					console.log(isNaN(kdr));
					$('#player-kd-display').text(kdr.toFixed(2));
					$('#player-name').text(name);
					$('#player-level-display').text("Level 39");
					$('#player-rank-display').css('background', "url('img/ranks/39.png') no-repeat center center/72px 72px");
					$('#player-armor').css('background', "url('img/players/user.png') no-repeat 0 -50px/320px 704px");
					if (info.nameplate) {
						$('#player-title').css('background-image', "");
					} else {
						$('#player-title').css('background-image', "");
					}
				}
			}
		});
	} else {
		KDchart.segments[0].value = 1;
		KDchart.segments[1].value = 1;
		KDchart.update();
		$('#player-kd-display').text("0.00");
		$('#player-name').text(user.name);
		$('#player-level-display').text("Level " + user.rank);
		$('#player-rank-display').css('background', "url('img/ranks/" + user.rank + ".png') no-repeat center center/72px 72px");
		$('#player-armor').css('background', "url('img/players/user.png') no-repeat 0 -50px/320px 704px");
		$('#player-title').css('background-image', "");
	}
}

function startgame(ip) {
	if (servers[selectedserver].password !== undefined) {
		var password = prompt(servers[selectedserver].name + " has a password, enter the password to join", "");
		if (password !== null) {
			/*$('#beep')[0].play();
			$('#music')[0].pause();
			$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
			delay(function(){
				window.open("dorito:" + servers[$(".server").data("server")].ip + "/" + password);
			}, 3500);*/
		}
	} else {
		/*$('#beep')[0].play();
		$('#music')[0].pause();
		$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {$('#music')[0].play();});
		delay(function(){
			window.open("dorito:" + ip);
		}, 3500);*/
	}
	$('#beep')[0].play();
	$('#music')[0].pause();
	$('#black').fadeIn(3500).delay(5000).fadeOut(1000, function() {
		$('#music')[0].play();
	});
	delay(function() {
		callbacks.connect(ip);
		loopPlayers = true;
		playerLoop();
	}, 3700);
}

var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout(timer);
		timer = setTimeout(callback, ms);
	};
})();

function changeMap1(game) {
	$('.map-select .selection').removeClass('selected');
	$("[data-game='" + game + "']").addClass('selected');
	$('.map-select').css({
		"left": "100px"
	});
	$('#maps-' + currentGame).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#maps-' + game).css('display', 'block');
	$('#maps-' + game).animate({
		"left": "360px",
		"opacity": 1
	}, anit / 8);
	currentGame = game;
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function changeMap2(map) {
	$('#map-thumb').css({
		"background-image": "url('img/maps/" + map.toString().replace("Default", "").toUpperCase() + ".png')"
	});
	$('#map-thumb-options').css({
		"background-image": "url('img/maps/" + map.toString().replace("Default", "").toUpperCase() + ".png')"
	});
	$('#currentmap').text(map);
	$('#map-name-options').text(map);
	$('#map-info-options').text(maps[currentGame][map]);
	$('.map-select2 .selection').removeClass('selected');
	$("[data-map='" + map + "']").addClass('selected');
}

function changeType1(maintype) {
	$('.type-select .selection').removeClass('selected');
	$("[data-maintype='" + maintype + "']").addClass('selected');
	$('.type-select').css({
		"left": "100px"
	});
	$('#types-' + currentType.replace(/\s/g, "")).hide().css({
		"left": "310px",
		"opacity": 0
	});
	$('#types-' + maintype.replace(/\s/g, "")).css('display', 'block');
	$('#types-' + maintype.replace(/\s/g, "")).animate({
		"left": "360px",
		"opacity": 1
	}, anit / 8);
	currentType = maintype;
	$('#slide')[0].currentTime = 0;
	$('#slide')[0].play();
}

function changeType2(type) {
	$('#gametype-icon').css({
		"background-image": "url('img/gametypes/" + currentType + ".png')"
	});
	$('#type-icon-options').css({
		"background-image": "url('img/gametypes/" + currentType + ".png')"
	});
	$('#gametype-display').text(type.toUpperCase());
	$('#type-name-options').text(type.toUpperCase());
	$('#type-info-options').text(gametypes[currentType][type]);
	$('.type-select2 .selection').removeClass('selected');
	$("[data-type='" + type + "']").addClass('selected');
}

function clearAllCookies() {
	for (var i = 0; i < Object.keys(settings).length; i++) {
		var set = Object.keys(settings)[i];
		$.removeCookie(set);
	}
	alert("All cookies reset.");
}
