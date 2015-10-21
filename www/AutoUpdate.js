var AutoUpdate = {

	assets: function(settings) {

		// set resume listener
		if(settings.updateOnResume && settings.request) {
			document.addEventListener("resume", function(){
				AutoUpdate.fetch(settings)
					.then(function(updated){
						if(updated){
							// the assets where updated start fresh
							location.reload();
						}
					});
			}, false);
		}

		// if we want to do an update request
		if(settings.request) {
			AutoUpdate.fetch(settings)
				.then(function(){
					AutoUpdate.inject(settings.files);
				})
				.catch(function(ex) {
					// start the app on failure
					AutoUpdate.inject(settings.files);
				});
		} else {
			// otherwise just inject everything
			AutoUpdate.inject(settings.files);
		}

	},

	fetch: function(settings) {
		return new Promise(function(resolve,reject){

			// check for connection
			if(navigator.network.connection.type == 'none'){
				resolve(false);
			} else {
				fetch(settings.request.url + '?' + AutoUpdate.serialize(settings.files), {
						headers: settings.request.headers || {}
					}).then(function(response) {
						return response.json();
					}).then(function(updates) {
						AutoUpdate.update(settings.files,updates).then(function(){
							// resolve with state updated or not updated
							resolve(Object.keys(updates).length);
						});
					}).catch(function(){
						reject();
					});
			}

		});
	},

	serialize: function(files) {
		var v = {}
		Object.keys(files).forEach(function(path){
			v[path] = AutoUpdate.getVersion(path) || files[path].version;
		});
		return Object.keys(v).reduce(function(a,k){a.push('v['+k+']='+encodeURIComponent(v[k]));return a},[]).join('&');
	},

	inject: function(files) {

		var paths = [];

		// find out the real paths of the files
		// create an array of promises
		Object.keys(files).forEach(function(path){
			paths.push(AutoUpdate.getPath(path))
		});

		Promise.all(paths).then(function(resolved){

			var paths = resolved.reduce(function(all,path){
				Object.keys(path).forEach(function(k){
					all[k] = path[k];
				})
				return all;
			}, {});

			Object.keys(files).forEach(function(path){

				var version = AutoUpdate.getVersion(path);
				var file = files[path];
				var path = paths[path] || path;

				switch (file.type) {
					case 'js':
						var script = document.createElement('script');
						script.src = path + '?version=' + version;
						document.getElementsByTagName("head")[0].appendChild( script );
						break;
					case 'css':
						var link = document.createElement('link');
						link.href = path + '?version=' + version;
						link.rel = 'stylesheet';
						document.getElementsByTagName("head")[0].appendChild( link );
						break;
					default:
						console.warning('This filetype is not supported yet.');
						console.warning('If you need it create an issue at github.com/TapmeMedia/cordova-plugin-autoupdate');
						break;
				}
			})
		});

	},

	getPath: function(path) {
		return new Promise(function(resolve,reject){
			var res = {};
			if(localStorage['cordova-plugin-autoupdate:' + path]) {
				// check if files still available local
				window.resolveLocalFileSystemURL(cordova.file.cacheDirectory + path,
					function(){
						res[path] = cordova.file.cacheDirectory + path;
						resolve(res);
					},
					function(){
						res[path] = path;
						resolve(res);
					}
				);
			} else {
				res[path] = path;
				resolve(res);
			}
		});
	},

	getVersion: function(path) {
		return localStorage['cordova-plugin-autoupdate:' + path] || false;
	},

	update: function(files,updates){
		return new Promise(function(resolve,reject){
			if(Object.keys(updates).length) {
				var updating = [];
				Object.keys(updates).forEach(function(key){
					// Array of promises
					updating.push(AutoUpdate.updateFile(key,updates[key]));
				})
				Promise.all(updating).then(function(){
					resolve(files);
				})
			} else {
				resolve(files);
			}
		});
	},

	updateFile: function(key,file) {
		return new Promise(function(resolve, reject){
			var transfer = new FileTransfer();
			transfer.download(
				encodeURI(file.url),
				cordova.file.cacheDirectory + key,
				function(entry) {
					localStorage['cordova-plugin-autoupdate:' + key] = file.version;
					resolve();
				},
				function(error) {
					// could not request new file
					// continue normal app flow with older version
					resolve();
				}
			);
		})
	}

};

module.exports = AutoUpdate;
