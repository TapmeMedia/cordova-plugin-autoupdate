# Cordova Plugin AutoUpdate

> Cordova plugin for automatically updating app assets (JS, CSS, etc.).

## How it works

### Plugin

The plugin is configured with apps that should be automically updated. When the app starts or is re-activated, it will:

1. Check local storage
1. Check static assets (from `www/` folder)
1. Determine latest versions
1. Send them to the server
1. Download newer assets (if necesarry) and store them in local storage
1. Load/inject the latest versions of JS/CSS

### Server

This auto update plugin requires a back-end for retrieving the latest assets. It will send the local versions to the back-end (GET request) and check if new assets should be downloaded:

```
http://127.0.0.1:9001/?v[css/main.css]=0.1.0&v[js/main.js]=0.1.0
```

The server can then respond with newer versions:

```json
{
	"js/main.js": {
		"url": "http://127.0.0.1:9001/release/js/main.0.1.1.js",
		"version": "0.1.1"
	}
}
```

## Usage

1. Install plugin: `cordova plugin add https://github.com/TapmeMedia/cordova-plugin-autoupdate.git`
1. [Set up server](https://github.com/TapmeMedia/cordova-plugin-autoupdate/wiki/Server)
1. [Configure plugin](https://github.com/TapmeMedia/cordova-plugin-autoupdate/wiki/Plugin-configuration)
1. Build and run app
