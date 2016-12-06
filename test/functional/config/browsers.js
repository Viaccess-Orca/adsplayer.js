
define(function () {

    var CHROME_CONFIG_WINDOWS7  = { browserName: 'chrome', /*version: '2.11', */platform: 'WINDOWS',os:'WINDOWS', os_version:'7'};
                         //     "chromeOptions":{
                         //            "args": ["user-data-dir"],
                         //            "excludeSwitches":["disable-component-update"]
                         //     }
                         // };
						 
	var CHROME_CONFIG_LINUX    = { browserName: 'chrome', platform: 'LINUX', os:'LINUX', os_version:'16.04', marionette: true };
						 
    var IE11_CONFIG_WINDOWS7    = { browserName: 'internet explorer', version:'11', platform: 'WINDOWS', os:'WINDOWS', os_version:'7'};
    var EDGE_CONFIG    = { browserName: 'MicrosoftEdge', platform: 'WINDOWS' };
	var FIREFOX_CONFIG_WINDOWS7    = { browserName: 'firefox', platform: 'WINDOWS', os:'WINDOWS', os_version:'7', marionette: true };
	var FIREFOX_CONFIG_LINUX    = { browserName: 'firefox', platform: 'LINUX', os:'LINUX', os_version:'16.04', marionette: true };
    var CHROME_ANDROID = {browser:'Android', device:'Google Nexus 5', os:'android'};

    return {
		all: [ CHROME_CONFIG_WINDOWS7, IE11_CONFIG_WINDOWS7, EDGE_CONFIG, FIREFOX_CONFIG_WINDOWS7 ],

		windows7: [ CHROME_CONFIG_WINDOWS7, FIREFOX_CONFIG_WINDOWS7, IE11_CONFIG_WINDOWS7],
		
		chromeLinux: [ CHROME_CONFIG_LINUX ],
		
		chrome_windows7: [ CHROME_CONFIG_WINDOWS7 ],

		ie11_windows7: [ IE11_CONFIG_WINDOWS7 ],

		edge_windows10: [ EDGE_CONFIG ],

		firefox_windows7: [ FIREFOX_CONFIG_WINDOWS7 ],
		
        firefox_linux: [ FIREFOX_CONFIG_LINUX ],

        mobile: [ CHROME_ANDROID ]
	};
});
