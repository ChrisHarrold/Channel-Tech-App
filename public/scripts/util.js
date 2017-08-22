//utilities
function createXHR(){
	if(typeof XMLHttpRequest != 'undefined'){
		return new XMLHttpRequest();
	}else{
		try{
			return new ActiveXObject('Msxml2.XMLHTTP');
		}catch(e){
			try{
				return new ActiveXObject('Microsoft.XMLHTTP');
			}catch(e){}
		}
	}
	return null;
}

function xhrGet(url, callback, errback){
	var xhr = new createXHR();
	xhr.timeout = 1;
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback(parseJson(xhr.responseText));
			}else{
				errback('service not available' + xhr.status);
			}
		}
	};
	
	xhr.timeout = 1000*60*5;
	xhr.ontimeout = errback;
	xhr.send();
}

function xhrPut(url, data, callback, errback){
	
	var xhr = new createXHR();
	xhr.open("PUT", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback();
			}else{
				errback('service not available');
			}
		}
	};
	xhr.timeout = 100000;
	xhr.ontimeout = errback;
	xhr.send(objectToQuery(data));
}

function xhrAttach(url, data, callback, errback){
	var xhr = new createXHR();
	xhr.open("POST", url, true);
	//xhr.setRequestHeader("Content-type", "multipart/form-data");
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback(parseJson(xhr.responseText));
			}else{
				errback('service not available');
			}
		}
	};
	xhr.timeout = 1000000;
	xhr.ontimeout = errback;
	xhr.send(data);
}

function xhrPost(url, data, callback, errback){
	var xhr = new createXHR();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback(parseJson(xhr.responseText));
			}else{
				errback('service not available');
			}
		}
	};
	xhr.timeout = 100000;
	xhr.ontimeout = errback;
	xhr.send(objectToQuery(data));
}

function xhrDelete(url, callback, errback){	
	var xhr = new createXHR();
	xhr.open("DELETE", url, true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback();
			}else{
				errback('service not available');
			}
		}
	};
	xhr.timeout = 100000;
	xhr.ontimeout = errback;
	xhr.send();
}

function parseJson(str){
	return window.JSON ? JSON.parse(str) : eval('(' + str + ')');
}

function objectToQuery(map){
	var enc = encodeURIComponent, pairs = [];
	for(var name in map){
		var value = map[name];
		var assign = enc(name) + "=";
		if(value && (value instanceof Array || typeof value == 'array')){
			for(var i = 0, len = value.length; i < len; ++i){
				pairs.push(assign + enc(value[i]));
			}
		}else{
			pairs.push(assign + enc(value));
		}
	}
	return pairs.join("&");
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4()+s4()+s4()+s4()+s4()+s4()+s4()+s4();
}


jQuery.fn.serializeObject = function() {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function() {
        var value;

    if (this.value != null) {
        value = this.value;
    } else {
        value = '';
    }   

    if (objectData[this.name] != null) {
        if (!objectData[this.name].push) {
            objectData[this.name] = [objectData[this.name]];
        }

        objectData[this.name].push(value);
    } else {
        objectData[this.name] = value;
    }
});
return objectData;
};




function autosize(el){
	setTimeout(function(){
		el.style.height = 'auto';
        //el.style.height = el.scrollHeight+'px';
		// var elStyle = window.getComputedStyle(el, null);
		// var fontSize = elStyle.getPropertyValue('font-size');
		// var fontFace = elStyle.getPropertyValue('font-face');
		// var $span = $('<span>', {html:el.value}).appendTo($(document.body));
		// $span.css('font-face', fontFace);
		// $span.css('font-size', fontSize);
		// var h = $span.height();
		//    el.style.cssText = 'height:auto; padding:0';
		// for box-sizing other than "content-box" use:
		// el.style.cssText = '-moz-box-sizing:content-box';
		// console.log(el.clientHeight);
		// console.log(el.innerHTML.offsetHeight);
		el.style.cssText = 'height:' + el.scrollHeight + 'px';
	},0);
}