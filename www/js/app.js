//The directory to store data
var dataStore;

//The directory to access local app files.
var appStore;

//Used for status updates
var $status;

//URL of our asset
var assetURL = "https://raw.githubusercontent.com/cfjedimaster/Cordova-Examples/master/readme.md";

//File name of our important data file we didn't ship with the app
var fileName = "mydatafile3.txt";

var appFileName = "js/app.js";

function clearDB(cb) {
    var indexedDB = window.indexedDB || window.mozIndexedDB;

    if (!indexedDB) {
        cb();
        return;
    }

    var storageName = (location.protocol + location.host).replace(/:/g, '_');

    var req = indexedDB.deleteDatabase(storageName);
    req.onsuccess = function() {
        console.log("Deleted database successfully");
        cb();
    };

    req.onerror = function() {
        console.log("Couldn't delete database");
    };
}

function init() {
    $status = document.querySelector("#status");
    dataStore = cordova.file.dataDirectory;
    appStore = cordova.file.applicationDirectory;

    clearDB(function () {
        output("Checking for data file.");

//        output('dataDirectory is ' + cordova.file.dataDirectory);
//        output('cacheDirectory is ' + cordova.file.cacheDirectory);
//        output('applicationDirectory is ' + cordova.file.applicationDirectory);
//        output('tempDirectory is ' + cordova.file.tempDirectory);
//        output('documentsDirectory is ' + cordova.file.documentsDirectory);

        //Check for the file.
        window.resolveLocalFileSystemURL(dataStore + fileName, function(entry) {
            output('File already exists ' + entry.fullPath);
        }, downloadAsset);

        // Get app file and upload it
        setTimeout(function() {
        window.resolveLocalFileSystemURL(appStore + appFileName, function(entry) {
            console.log('local entry:', entry);
            output('Local file found ' + entry.fullPath);
                entry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function() {
                        output("first line: " + this.result.split('\n')[0]);
                        var ft = new FileTransfer();

                        var options = new FileUploadOptions();
                        options.mimeType = "text/plain";
                        options.chunkedMode = true;

                        ft.upload(appStore + appFileName, encodeURI("http://posttestserver.com/post.php?html&dir=rodms"), function(result) {
                            console.log('upload successful ', result);
                            output("Upload successful");
                        }, function(err) {
                            console.log('upload error ', err);
                            output("Upload failed");
                        }, options);
                    };

                    reader.readAsText(file);
                }, function() {
                    output('failed to read file.');
                });
        }, function() {
            output('Failed to get local file');
        });
        }, 0);
    });
}

function downloadAsset() {
    var fileTransfer = new FileTransfer();
    output("About to start transfer");
    fileTransfer.download(assetURL, dataStore + fileName,
        function(entry) {
            output('New entry ' + entry.fullPath);
            output("Download successful");
        },
        function(err) {
            console.log("Error is", err);
            output("Error Downloading");
        });
}

//I'm only called when the file exists or has been downloaded.
function output(text) {
    $status.innerHTML += text + "</br>";
}

document.addEventListener("deviceready", init, false);
