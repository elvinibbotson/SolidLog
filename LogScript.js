function id(el) {
	// console.log("return element whose id is "+el);
	return document.getElementById(el);
}
'use strict';
// GLOBAL VARIABLES	
var dragStart={};
var drag={};
var logData=null;
var logs=[]; // all logs
var list=[]; // listed logs
var log=null;
var logIndex=null;
var tags=[];
var findTag=null;
// var searchText=null;
var currentDialog=null;
var months="JanFebMarAprMayJunJulAugSepOctNovDec";
// var backupDay;
var latest; // time/date of latest change
// var changed=false; // changed this session?
// solid session & authentication...
const auth=solidClientAuthentication;
const session=auth.getDefaultSession();
/* TAP ON HEADER
id('headerTitle').addEventListener('click',function() {
	toggleDialog('dataDialog',true);
});
*/
id('buttonFind').addEventListener('click', function() { // show the search dialog
	toggleDialog('findDialog',true);
	id('findTagChooser').selectedIndex=-1;
	console.log('find - tags: '+id('findTagChooser').options.length);
});
id('findTagChooser').addEventListener('change',function() {
	findTag=tags[id('findTagChooser').selectedIndex];
	console.log('find items with tag '+findTag);
	populateList();
	toggleDialog('findDialog',false);
})
// NEW BUTTON
id('buttonNew').addEventListener('click', function() { // show the log dialog
	console.log("show add jotting dialog with today's date, 1 day duration, blank text field and delete button disabled");
    toggleDialog('logDialog',true);
	var d=new Date().toISOString();
	id('logDateField').value=d.substr(0,10);
	id('logDaysField').value=1;
	id('logTextField').value="";
	log={};
	log.tags=[];
	listLogTags();
	logIndex=null;
	id("buttonDeleteLog").style.display='none';
	id('buttonSaveLog').style.display='none';
	id('buttonAddLog').style.display='block';
});
// CHOOSE A TAG
id('tagChooser').addEventListener('change', function() {
	var n=id('tagChooser').selectedIndex;
	var tag=id('tagChooser').options.item(n).text;
	console.log("select tag "+tag);
	if(tag.startsWith('+')) { // define a new tag
		toggleDialog('newTagDialog',true);
		return;
	}
	else if(log.tags.indexOf(tag)<0) {
		log.tags.push(tag);
		listLogTags();
	}
    // toggleDialog('tagDialog',false);
    toggleDialog('logDialog',true);
});
// INPUT NEW TAG
id('newTagField').addEventListener('change', function() {
  	var tag=id('newTagField').value;
	console.log("new tag: "+tag);
	if(tags.indexOf(tag)<0) {
		console.log('define new tag: '+tag);
		tags.push(tag);
		var opt=document.createElement('option');
		opt.text=tag;
		id('tagChooser').options.add(opt);
		opt=document.createElement('option');
		opt.text=tag;
		id('findTagChooser').options.add(opt);
		log.tags.push(tag);
		console.log(tag+' added to tag list, tag search and log tags');
		listLogTags();
	}
	toggleDialog('logDialog',true);
});
// ADD NEW LOG
id('buttonAddLog').addEventListener('click',function() {
	saveLog(true);
})
// UPDATE LOG
id('buttonSaveLog').addEventListener('click', function() {
	saveLog(false);
})
// SAVE LOG
function saveLog(adding) {
	log.date=id('logDateField').value;
	log.days=id('logDaysField').value;
	log.text=id('logTextField').value;
    toggleDialog('logDialog',false);
	console.log("save log - date: "+log.date+" "+log.days+" days text: "+log.text);
	if(adding) logs.push(log);
	else logs[logIndex]=log;
	save();
	populateList();
};
// DELETE LOG
id('buttonDeleteLog').addEventListener('click', function() {
	logs.splice(logIndex,1);
	toggleDialog('logDialog',false);
	save();
	populateList();
});
// CLOSE DIALOG
id('curtain').addEventListener('click',function() {
	toggleDialog(currentDialog,false);
})
// SHOW/HIDE DIALOGS
function toggleDialog(d, visible) {
    console.log('toggle '+d+' - '+visible);
    if(currentDialog) id(currentDialog).style.display='none';
    if(visible) {
    	currentDialog=d;
    	id(d).style.display='block';
    	id('buttonNew').style.display='none';
    	id('buttonFind').style.display='none';
    }
    else {
    	id('buttonNew').style.display=(findTag)?'none':'block';
    	id('buttonFind').style.display=(findTag)?'none':'block';
    }
    id('curtain').style.height=(visible)?'100%':'0';
}
// OPEN SELECTED LOG FOR EDITING
function openLog() {
	console.log("open log: "+logIndex);
	log=logs[logIndex];
	toggleDialog('logDialog',true);
	id('logDateField').value=log.date;
	id('logDaysField').value=log.days;
	id('logTextField').value=log.text;
	if(!log.tags) log.tags=[];
	listLogTags();
	id('buttonAddLog').style.display='none';
	id('buttonSaveLog').style.display='block';
	id('buttonDeleteLog').style.display='block';
}
// POPULATE LIST OF TAGS FOR CURRENT LOG
function listLogTags() {
	var item=null;
  	id('logTagList').innerHTML="";
	item=document.createElement('li');
	item.textContent="+ NEW TAG"; // add new tag
	item.addEventListener('click', function() {
		toggleDialog('tagDialog',true);
		id('tagChooser').selectedIndex=-1;
		id('newTagField').value="";
	});
	id('logTagList').appendChild(item);
	for(var i in log.tags) {
		item=document.createElement('li');
		item.addEventListener('click', function() {
			var tag=this.textContent;
			console.log("delete tag "+tag);
			var n=log.tags.indexOf(tag)
			log.tags.splice(n,1); // remove from log.tags
			listLogTags();
		});
		item.textContent=log.tags[i];
		id('logTagList').appendChild(item);
	}
}
// POPULATE LOGS LIST
function populateList() {
	console.log("populate log list for search "+findTag);
	if(findTag) id('headerTitle').textContent=findTag;
	else id('headerTitle').textContent='SolidLog';
	logs.sort(function(a,b) { return Date.parse(a.date)-Date.parse(b.date)}); // date order
	list=[];
	for(var i=0;i<logs.length;i++) { // build list of logs to show
		if(findTag) { // list logs matching search
			if(logs[i].tags.indexOf(findTag)>=0)
			{
				console.log("find tag match in "+logs[i].text);
				list.push(i);
			}
		}
		else { // no search - list all logs
			console.log("no search");
			list.push(i);
		}
	}
	console.log('list '+list.length+' logs');
	id('list').innerHTML=""; // clear list
	var html="";
	var d="";
	var mon=0;
	for(var i=list.length-1; i>=0; i--) { // build list - latest first
  		var listItem = document.createElement('li');
		listItem.index=list[i]; // index of listed log
		log=logs[list[i]]; // listed log
	 	listItem.classList.add('log-item');
		listItem.addEventListener('click', function(){logIndex=this.index; openLog();});
		html="<span class='log-text'>"+log.text+"</span><br>";
		d=log.date;
		mon=parseInt(d.substr(5,2))-1;
		mon*=3;
		d=d.substr(8,2)+" "+months.substr(mon,3)+" "+d.substr(2,2);
		html+="<span class='log-date'>"+d;
		if(log.days>1) html+="...<i>"+log.days+" days</i>";
		html+="</span><span class='log-tags'>";
		for(var j in log.tags) {
			html+=log.tags[j]+" "
		}
		html+="</span><p>";
		listItem.innerHTML=html;
		id('list').appendChild(listItem);
  	}
  	id('buttonNew').style.display=(findTag)?'none':'block';;
  	id('buttonFind').style.display=(findTag)?'none':'block';
}
// DATA
function load() {
	var data=localStorage.getItem('LogData');
	if(!data) {
		id('dataMessage').innerText='NO DATA';
		// id('saveButton').disabled=true;
		// toggleDialog('dataDialog',true);
		return;
	}
	logs=JSON.parse(data);
	console.log(logs.length+' logs read');
	// for(var i in logs) console.log('log '+i+': '+logs[i].text);
	// build tag list
	tags=[];
	for(var i=0;i<logs.length;i++) {
		for(var j in logs[i].tags) { // for each tag in each log...
			if(tags.indexOf(logs[i].tags[j])<0) { // ...if not already in tags...
				tags.push(logs[i].tags[j]); // ...add it
				console.log('tag added');
			}
		}
	}
	tags.sort(); // sort tags alphabetically and populate tag choosers
	for(i in tags) {
		var tag=document.createElement('option');
		tag.text=tags[i];
		tag=document.createElement('option');
		tag.text=tags[i];
		id('tagChooser').options.add(tag);
		var stag=document.createElement('option');
		stag.text=tags[i];
		stag=document.createElement('option');
		stag.text=tags[i];
		id('findTagChooser').options.add(stag);
	}
	tag=document.createElement('option');
	tag.text='+NEW';
	id('tagChooser').options.add(tag);
	console.log('search tags: '+id('findTagChooser').options.length);
	populateList();
	// var today=Math.floor(new Date().getTime()/86400000);
	// var days=today-backupDay;
	/*
	if(days>4) { // backup reminder every 5 days
		id('dataMessage').innerText=days+' days since last backup';
		id('loadButton').disabled=true;
		toggleDialog('dataDialog',true);
	}
	*/
}
function save() {
	var json=JSON.stringify(logs);
	// console.log('data to save: '+json);
	window.localStorage.setItem('LogData',json);
	console.log('data saved to LogData');
	latest=new Date().toString();
	console.log('latest change: '+latest);
}
// SOLID CODE
function connect() {
	message('CONNECT - logging in');
	try {
		auth.login({
    		oidcIssuer:"https://privatedatapod.com",
    		redirectUrl:window.location.href,
    		clientName:"SolidLocker"
    	});
	}
	catch(error) {console.error(error.message);}
}
auth.handleIncomingRedirect({restorePreviousSession:true}).then(function(){
	if(session.info.isLoggedIn) {
		console.log('logged in as '+session.info.webId);
		message('LOGGED IN',false);
		// id('saveButton').removeAttribute("disabled");
    	// id('loadButton').removeAttribute("disabled");
    	sync();
	}
});
async function sync() { // USE If-Modifeid-Since INSTEAD
	if(!session.info.isLoggedIn) {connect(); return;} // ensure connected
	latest=window.localStorage.getItem('latest');
	console.log('latest is '+latest);
	message('SYNC - DOWNLOAD?',true);
	var response=await session.fetch('https://elvinibbotson.privatedatapod.com/drive/SolidLogData.json',
	{ // ONLY RESTORE DATA FROM POD IF NEWER THAN CURRENT LOCAL DATA
		method: 'GET',
		headers: {'If-Modified-Since':latest}
	});
	console.log('response: '+response.json);
	if(response.ok) {
		var body=await response.json();
		logs=body.logs;
		save();
		message(logs.length+' logs downloaded',false);
	}
	/*
	var body=await response.json();
	if(body) { // newer data downloaded
		logs=body.logs;
		save();
		message(logs.length+' logs downloaded');
	}
	*/
	else { // local data is newer - upload to pod
		message('|no download - UPLOAD',false);
		var fileName="drive/SolidLogData.json";
		console.log(logs.length+" logs to upload");
		var data={'logs': logs};
		var json=JSON.stringify(data);
		try {
			response=await session.fetch('https://elvinibbotson.privatedatapod.com/'+fileName,{
				method:'PUT',
				headers:{'Content-Type':'application/json'},
				body:json
			});
			if(!response.ok) {
    			throw new Error(`Response status: ${response.status}`);
    		}
    		console.log('data uploaded, status: '+response.status);
    		/* toggleDialog('dataDialog',false);
    		var today=Math.floor(new Date().getTime()/86400000);
			window.localStorage.setItem('backupDay',today);
			*/
    		message(logs.length+' logs uploaded',false);
		}
		catch(error) {console.error(error.message);alert(error.message);}
	}
	/*
	latest=new Date().toString();
	window.localStorage.setItem('latest',latest);
	console.log('latest set to '+latest);
	*/
	load(); // ensure working with latest dataset
}
// id('saveButton').addEventListener('click',backup);
// id('loadButton').addEventListener('click',restore);
/*
async function backup() {
  	if(!session.info.isLoggedIn) {connect(); return;} // ensure connected
  	console.log("BACKUP");
	var fileName="drive/SolidLogData.json";
	console.log(logs.length+" logs - save");
	var data={'logs': logs};
	var json=JSON.stringify(data);
	try {
		response=await session.fetch('https://elvinibbotson.privatedatapod.com/'+fileName,{
			method:'PUT',
			headers:{'Content-Type':'application/json'},
			body:json
		});
		if(!response.ok) {
    		throw new Error(`Response status: ${response.status}`);
    	}
    	console.log('backup saved, status: '+response.status);
    	toggleDialog('dataDialog',false);
    	// var today=Math.floor(new Date().getTime()/86400000);
		// window.localStorage.setItem('backupDay',today);
    	message('data saved');
	}
	catch(error) {console.error(error.message);alert(error.message);}
}
async function restore() {
	if(!session.info.isLoggedIn) {connect(); return;} // ensure connected
	console.log('RESTORE');
	var response=await session.fetch('https://elvinibbotson.privatedatapod.com/drive/SolidLogData.json',
	{ // ONLY RESTORE DATA FROM POD IF NEWER THAN CURRENT LOCAL DATA
		method: 'GET',
		headers: {'If-Modified-Since':latest}
	});
	console.log('response: '+response.json);
	var body=await response.json();
	console.log('data: '+body);
    var logs=body.logs;
	console.log(logs.length+" logs loaded");
    save();
    console.log('data imported and saved');
    load();
    toggleDialog('dataDialog',false);
    message('data loaded');
}
*/
// DISPLAY MESSAGE
function message(text,clear) {
	if(clear) id('message').innerText=text;
	else id('message').innerText+='\n'+text;
	toggleDialog('messageDialog',true);
}
// START-UP CODE
// backupDay=window.localStorage.getItem('backupDay');
// if(backupDay) console.log('last backup on day '+backupDay);
// else backupDay=0;
latest=window.localStorage.getItem('latest');
if(!latest) latest=new Date(0).toString(); // default to 1970
console.log('latest change: '+latest);
// sync();
load();
// implement service worker if browser is PWA friendly 
if (navigator.serviceWorker.controller) {
	console.log('Active service worker found, no need to register')
} else { //Register the ServiceWorker
	navigator.serviceWorker.register('sw.js', {
		scope: '/SolidLog/'
	}).then(function(reg) {
		console.log('Service worker has been registered for scope:'+ reg.scope);
	});
}
