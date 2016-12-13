window.onload = function() {
	displayVersion();
    displayTerminalId();
}

var displayVersion = function() {
    var title = document.getElementById('app-title');
    title.innerHTML += ' ' + cswplayer.getVersionFull();
};

var displayTerminalId = function() {
    var terminalId = document.getElementById('terminal-id');
    terminalId.innerHTML += ' ' + cswplayer.getTerminalId();
};