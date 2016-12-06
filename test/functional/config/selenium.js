define({

	local: {
		proxyOnly: false,
		//proxyUrl: 'http://cswebplayer.viaccess.fr/samples/CSWebPlayer-1.1.2-BETA1/',
        proxyPort: 1024,
		tunnel: 'NullTunnel',
        tunnelOptions: {
            hostname: '127.0.0.1',
            port: '5561',
            verbose: true
        },
        /*reporters: ['Runner'],*/
		reporters: [
			"Runner",
			//{id: 'Cobertura', filename: 'test/functional/test-reports/' + (new Date().getFullYear())+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate())+'_'+(new Date().getHours())+'-'+(new Date().getMinutes())+'-'+(new Date().getSeconds()) + '_cobertura.xml'},
			//id: 'Lcov', filename: 'test/functional/test-reports/' + (new Date().getFullYear())+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate())+'_'+(new Date().getHours())+'-'+(new Date().getMinutes())+'-'+(new Date().getSeconds()) + '_lcov.xml'}
			{id: 'JUnit', filename: 'test/functional/test-reports/' + (new Date().getFullYear())+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate())+'_'+(new Date().getHours())+'-'+(new Date().getMinutes())+'-'+(new Date().getSeconds()) + '_report.xml'}
			//{id: 'Combined', directory: 'test/functional/test-reports-coverage/'}
			//,{id: 'LcovHtml', directory: 'test/functional/test-reports-coverage-lcovhtml/'}
		],
        capabilities: {
			'selenium-version': '3.0.1',
			'marionette': true,
			'max-duration': 70,
			'command-timeout': 70,
		    'idle-timeout': 70,
			'ensureCleanSession' : true,
			'ie.ensureCleanSession' : true,
			'InternetExplorerDriver.IE_ENSURE_CLEAN_SESSION' : true
        },
        leaveRemoteOpen:'fail'
    },

    dev: {
		//proxyUrl: 'http://localhost/tests/samples/DemoPlayer/',
		//proxyUrl: 'http://orange-opensource.github.io/hasplayer.js/development/samples/DemoPlayer/index.html',
        proxyPort: 1024,
        tunnel: 'NullTunnel',
        tunnelOptions: {
            hostname: '127.0.0.1',
            port: '5561',
            verbose: true
        },
		/*tunnel: 'SeleniumTunnel',
		tunnelOptions: {
			port: '5561',
		    drivers: ['chrome', 'firefox']
		},*/
        reporters: ['Runner'],
        capabilities: {
            /*'selenium-version': '2.48.2'*/
			'selenium-version': '3.0.0',
			'marionette': true,
			'max-duration': 70,
			'command-timeout': 70,
		    'idle-timeout': 70
        },
        leaveRemoteOpen:'fail'
    }/*,

    remote: {
        tunnel: 'NullTunnel',
        tunnelOptions: {
            hostname: "hub-cloud.browserstack.com",
            protocol: "https",
            port: 443
        },
        capabilities: {
            username: process.env.BROWSERSTACK_USER || 'BROWSERSTACK_USER',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY'
        },
        reporters: [{id: 'JUnit', filename: 'test/functional/test-reports/' + (new Date().getFullYear())+'-'+(new Date().getMonth()+1)+'-'+(new Date().getDate())+'_'+(new Date().getHours())+'-'+(new Date().getMinutes())+'-'+(new Date().getSeconds()) + '_report.xml'}]
    }*/
});
