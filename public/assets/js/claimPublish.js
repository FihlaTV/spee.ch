// define variables
var socket = io();
var uploader = new SocketIOFileUpload(socket);
var stagedFiles = null;

/* helper functions */
// create a progress animation
function createProgressBar(element, size){ 
	var x = 1;
	var adder = 1;
	function addOne(){
		var bars = '<p>|';
		for (var i = 0; i < x; i++){ bars += ' | '; }
		bars += '</p>';
		element.innerHTML = bars;
		if (x === size){
			adder = -1;
		} else if ( x === 0){
			adder = 1;
		}
		x += adder;
	};
	setInterval(addOne, 300);
}
// preview file and stage the image for upload
function previewAndStageFile(selectedFile){ 
	var preview = document.getElementById('image-preview');
	var dropzone = document.getElementById('drop-zone');
	var previewReader = new FileReader();

	preview.style.display = 'block';
	dropzone.style.display = 'none';
	
	previewReader.onloadend = function () {
		preview.src = previewReader.result;
	};

	if (selectedFile) {
		console.log(selectedFile);
		previewReader.readAsDataURL(selectedFile); // reads the data and sets the img src
		document.getElementById('publish-name').value = selectedFile.name.substring(0, selectedFile.name.indexOf('.')); // updates metadata inputs
		stagedFiles = [selectedFile]; // stores the selected file for upload
	} else {
		preview.src = '';
	}
}
// update the publish status
function updatePublishStatus(msg){
	document.getElementById('publish-status').innerHTML = msg;
}
// process the drop-zone drop
function drop_handler(ev) {
	console.log("drop");
	ev.preventDefault();
	// if dropped items aren't files, reject them
	var dt = ev.dataTransfer;
	if (dt.items) {
		if (dt.items[0].kind == 'file') {
			var droppedFile = dt.items[0].getAsFile();
			previewAndStageFile(droppedFile);
		} else {
			console.log("no files were found")
		}
	} else {
		console.log("no items were found")
	}
}
// prevent the browser's default drag behavior
function dragover_handler(ev) {
	ev.preventDefault();
}
// remove all of the drag data
function dragend_handler(ev) {
	var dt = ev.dataTransfer;
	if (dt.items) {
		for (var i = 0; i < dt.items.length; i++) {
			dt.items.remove(i);
		}
	} else {
		ev.dataTransfer.clearData();
	}
}

/* configure the submit button */
document.getElementById('publish-submit').addEventListener('click', function(event){
	event.preventDefault();
	// make sure a file was selected
	if (stagedFiles) {
		// make sure only 1 file was selected
		if (stagedFiles.length > 1) {
			alert("Only one file allowed at a time");
			return;
		}
		// make sure the content type is acceptable
		switch (stagedFiles[0].type) {
			case "image/png":
			case "image/jpeg":
			case "image/gif":
			case "video/mp4":
				uploader.submitFiles(stagedFiles);
				break;
			default:
				alert("Only .png, .jpeg, .gif, and .mp4 files are currently supported");
				break;
		}
	}
})

/* socketio-file-upload listeners */
uploader.addEventListener('start', function(event){
	var name = document.getElementById('publish-name').value;
	var license = document.getElementById('publish-license').value;
	var nsfw = document.getElementById('publish-nsfw').value;
	event.file.meta.name = name;
	event.file.meta.license = license;
	event.file.meta.nsfw = nsfw;
	event.file.meta.type = stagedFiles[0].type;
	// re-set the html in the publish area
	document.getElementById('publish-active-area').innerHTML = '<div id="publish-status"></div><div id="progress-bar"></div>';
	// start a progress animation
	createProgressBar(document.getElementById('progress-bar'), 12);
});
uploader.addEventListener('progress', function(event){
	var percent = event.bytesLoaded / event.file.size * 100;
	updatePublishStatus('File is ' + percent.toFixed(2) + '% loaded to the server');
});

/* socket.io message listeners */
socket.on('publish-status', function(msg){
	updatePublishStatus(msg);
});
socket.on('publish-failure', function(msg){
	document.getElementById('publish-active-area').innerHTML = '<p>' + JSON.stringify(msg) + '</p><p> --(✖╭╮✖)→ </p><strong>For help, post the above error text in the #speech channel on the <a href="https://lbry.slack.com/" target="_blank">lbry slack</a></strong>';
});

socket.on('publish-complete', function(msg){
	var publishResults;
	var directUrl = '/' + msg.name + '/' + msg.result.claim_id;
	// build new publish area
	publishResults = '<p><span id="tweet-meme-button"></span>Your publish is complete! Go ahead, share it with the world!</p>';
	publishResults += '<p>Check it out, here: <a target="_blank" href="' + directUrl + '">view it here!</a></p>';
	publishResults += '<p><a target="_blank" href="https://explorer.lbry.io/#!/transaction/' + msg.result.txid + '">View the transaction details</a></p>';
	publishResults += '<a href="/"><button>Reload</button></a></p>';
	// update publish area
	document.getElementById('publish-active-area').innerHTML = publishResults;
	// add a tweet button
	twttr.widgets
		.createShareButton(
			document.getElementById('tweet-meme-button'),
			{
				text: 'Check out my image, hosted for free on the distributed awesomeness that is the LBRY blockchain!',
				url: 'https://spee.ch/' + directUrl,
				hashtags: 'LBRY',
				via: 'lbryio'
			})
		.then( function( el ) {
			console.log('Tweet button added.');
		});
});