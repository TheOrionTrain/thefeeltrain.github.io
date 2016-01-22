/**
 *
 *
 *
 *
 **/
 


var friendServer,
	friendServerConnected = false,
	snacking = 0,
	played = 0;
jQuery(function() {
	if(getURLParameter('offline') !== "1" && dewRconConnected) {
		StartConnection();
	}
});

StartConnection = function() {
    friendServer = new friendServerHelper();
    friendServer.friendsServerSocket.onopen = function() {
		dewRcon.send('player.name', function(res) {
			dewRcon.send('player.printUID', function(ret) {
				friendServer.send("{'type':'connection', 'message':'" + res + ":" + ret.split(' ')[2] + " has connected.'}");
			});
		});
        $.snackbar({content:'Connected to Friend Server!'});
		$('#notification')[0].currentTime = 0;
		$('#notification')[0].play();
        friendServerConnected = true;
    };
    friendServer.friendsServerSocket.onerror = function() {
		if(!snacking) {
			$.snackbar({content:'Connection to Friend Server failed, retrying.'});
			if(!played) {
				$('#notification')[0].currentTime = 0;
				$('#notification')[0].play();
				played = 1;
			}
			snacking = 1;
			setTimeout(function() {
				snacking = 0;
			},9000);
		}
        friendServerConnected = false;
        if(!friendServerConnected) {
    		setTimeout(StartConnection, 1000);
		}
    };
    friendServer.friendsServerSocket.onmessage = function(message) {
		try {
			var result = JSON.parse(JSON.stringify(eval('(' + message.data + ')')));
			switch (result.type) {
				case "pm":
					console.log(result.message);
				break;
				case "partyreq":
					dewAlert({
						title: "Party Invitation",
						content: result.player + " has invited you to a party",
						cancel: true,
						cancelText: "Decline"
					});
				break;
				case "gameinvite":
					dewAlert({
						title: "Party Invitation",
						content: result.player + " has invited you join " + result.server,
						cancel: true,
						cancelText: "Decline"
					});
				break;
				default:
					console.log("Unhandled packet: " + result.type);
				break;
			}
		} catch (e) {
			console.log(e);
			console.log(message.data);
		}
		
		if (typeof friendServer.callback == 'function')
			friendServer.callback(message.data);
        friendServer.lastMessage = message.data;
				//console.log(friendServer.lastMessage);
    };
}
friendServerHelper = function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    this.friendsServerSocket = new WebSocket('ws://192.99.124.166:55555', 'friendServer');
    this.lastMessage = "";
    this.lastCommand = "";
    this.open = false;
	this.callback = {};
    this.send = function(command, cb) {
		this.callback = cb;
        this.friendsServerSocket.send(command);
        this.lastCommand = command;
    }
}

function after(ms, fn){ setTimeout(fn, ms); }
