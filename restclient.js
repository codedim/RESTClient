/*
**  powered by codedim, 2019
**  
**  TODOs: 
**  * visualization of response waiting process;
**  * response body button "View as HTML";
**  * response body button "View as JSON";
*/

;var window = window || {};
(function (window) {
	"use strict";
	
	var document = window.document,
		$ = document.querySelector.bind(document),
		$$ = document.querySelectorAll.bind(document),
	
		ClientMethods = [ 
			{ method: 'GET', 	 hasBody: false }, 
			{ method: 'OPTIONS', hasBody: false },  
			{ method: 'HEAD', 	 hasBody: false },  
			{ method: 'POST', 	 hasBody: true  },  
			{ method: 'PUT', 	 hasBody: true  },  
			{ method: 'DELETE',  hasBody: false } 
		],
		
		ClientHeaders = [
			{ 	// dummy value
				header: '',
				hint: '',
				note: '',
				isSafe: true
			},
			{ 
				header: 'Accept',
				hint: '*/* | text/plain | application/json | application/xml',
				note: 'Content-Types that are acceptable by the user-agent (RqH)',
				isSafe: true
			},
			{ 
				header: 'Accept-Charset',
				hint: 'utf-8',
				note: 'Acceptable character sets by the user-agent (RqH, unsafe)',
				isSafe: false
			}, 
			{ 
				header: 'Accept-Encoding',
				hint: 'compress | gzip | deflate',
				note: 'Acceptable encodings by the user-agent (RqH, unsafe)',
				isSafe: false
			}, 
			{ 
				header: 'Accept-Language',
				hint: 'en-US | ru | zh-CN',
				note: 'Acceptable languages by the user-agent (RqH)',
				isSafe: true
			}, 
			{ 
				header: 'Authorization',
				hint: 'Basic QWxhZGRpbjpvcGVulHNlc2FtZQ==',
				note: 'Authentification credentails for HTTP authentication (RqH)',
				isSafe: true
			}, 
			{ 
				header: 'Cache-Control',
				hint: 'no-cashe | no-store | max-age=360',
				note: 'Cashing directives that must be obeyed by all cashing parties (GH)',
				isSafe: true
			}, 
			{ 
				header: 'Connection',
				hint: 'close | keep-alive',
				note: 'Type of connection that the user-agent would prefer (GH, unsafe)',
				isSafe: false
			},
			{ 
				header: 'Content-Length',
				hint: '483',
				note: 'The lenght of the request body in octets (8-bit bytes) (EH, unsafe)',
				isSafe: false
			}, 
			{ 
				header: 'Content-Type',
				hint: 'text/plain | application/json | application/xml',
				note: 'The mime type of the request body (used with POST and PUT requests) (EH)',
				isSafe: true
			}, 
			{ 
				header: 'Cookie',
				hint: 'name1=value1; name2=value2; name3=value3',
				note: 'HTTP coockie previously sent by the server with Set-Cookie (RqH, unsafe)',
				isSafe: false
			}, 
			{ 
				header: 'If-Match',
				hint: '"73d8af7ad307060cd8c28482f209582d"',
				note: 'Perfom the action if the client supplied ETag matches the same ETag on the server (RqH)',
				isSafe: true
			}, 
			{ 
				header: 'If-Modified-Since',
				hint: 'Sat, 27 Apr 2019 19:43:31 GMT',
				note: 'Allows 304 Not Modified to be returned if content is unchanged (RqH)',
				isSafe: true
			},
			{ 
				header: 'If-None-Match',
				hint: '"73d8af7ad307060cd8c28482f209582d"',
				note: 'Allows 304 Not Modified to be returned if content is unchanged (RqH)',
				isSafe: true
			},
			{ 
				header: 'If-Unmodified-Since',
				hint: 'Sat, 27 Apr 2019 19:43:31 GMT',
				note: 'Only send the response if content has NOT been modified since a specified time (RqH)',
				isSafe: true
			}, 
			{ 
				header: 'User-Agent',
				hint: 'Mozilla/5.0 (Linux; X11)',
				note: 'The user agent string (RqH, unsafe)',
				isSafe: false
			},
		];
	
	
	/*******************************  setting the UI up  *******************************/
	
	document.addEventListener('DOMContentLoaded', function() {
		// request methods
		$('#reqMethod').addEventListener('change', getRequestMethod);
		setRequestMethods(); // compleat the select tag of HTTP methods
		getRequestMethod(); // set the request Body's availability up
		
		// request/response tabs
		$('#tabReqHeaders').addEventListener('click', showReqHeaders);
		$('#tabReqBody').addEventListener('click', showReqBody);
		$('#tabResHeaders').addEventListener('click', showResHeaders);
		$('#tabResBody').addEventListener('click', showResBody);
		
		// request headers
		$('#newReqHeaderName').addEventListener('change', setNewReqHeaderName);
		setRequestHeaders(); // compleat the select tag of HTTP headers
		$('#addNewHeader').addEventListener('click', addNewRequestHeader);
		
		// sending request
		$('#reqUri').addEventListener('keydown', sendHttpRequest);
		$('#sendRequest').addEventListener('click', sendHttpRequest);
	});
	
	// helping function returns a selected option in an option list
	function findSelectedOption(options) {
		for (var i = 0; i < options.length; ++i) {
			if (options[i].selected)
				return options[i].value;
		}
		return '';
	}
	
	// returns an HTTP request Method and sets the request Body's availability up
	function getRequestMethod() {
		var method, isBodyAvailable = false;
		
		method = findSelectedOption($$('#reqMethod option'));
		for (var i = 0; i < ClientMethods.length; ++i) {
			if (method == ClientMethods[i].method) {
				isBodyAvailable = ClientMethods[i].hasBody;
				break;
			}
		}
		
		if (!isBodyAvailable) {
			$('#tabReqBody').classList.add('disabled');
			showReqHeaders();
		} else {
			$('#tabReqBody').classList.remove('disabled');
		}
		
		return method;
	}
	
	function setRequestMethods() {
		var select = $('#reqMethod'), option;
		select.innerHTML = '';
		for (var i = 0; i < ClientMethods.length; ++i) {
			option = document.createElement('option');
			option.value = ClientMethods[i].method;
			option.innerText = ClientMethods[i].method;
			if (!i) option.selected = true;
			select.appendChild(option);
		}
	}
	
	function showReqHeaders() {
		$('#tabReqHeaders').classList.add('active');
		$('#tabReqBody').classList.remove('active');
		$('#wrapReqHeaders').classList.remove('hidden');
		$('#wrapReqBody').classList.add('hidden');
	}
	
	function showReqBody() {
		if ($('#tabReqBody').classList.contains('disabled'))
			return;
		$('#tabReqBody').classList.add('active');
		$('#tabReqHeaders').classList.remove('active');
		$('#wrapReqBody').classList.remove('hidden');
		$('#wrapReqHeaders').classList.add('hidden');
	}
	
	function showResHeaders() {
		$('#tabResHeaders').classList.add('active');
		$('#tabResBody').classList.remove('active');
		$('#wrapResHeaders').classList.remove('hidden');
		$('#wrapResBody').classList.add('hidden');
	}
	
	function showResBody() {
		$('#tabResBody').classList.add('active');
		$('#tabResHeaders').classList.remove('active');
		$('#wrapResBody').classList.remove('hidden');
		$('#wrapResHeaders').classList.add('hidden');
	}

	function setRequestHeaders() {
		var select = $('#newReqHeaderName'), option;
		select.innerHTML = '';
		for (var i = 0; i < ClientHeaders.length; ++i) {
			option = document.createElement('option');
			option.value = ClientHeaders[i].header;
			option.innerText = ClientHeaders[i].header;
			if (!i) option.selected = true;
			select.appendChild(option);
		}
	}

	function setNewReqHeaderName() {
		var headerName = findSelectedOption($$('#newReqHeaderName option'));
		if (!headerName) return;
		
		$('#newHeaderValue').value = '';
		for (var i = 0; i < ClientHeaders.length; ++i) {
			if (headerName == ClientHeaders[i].header) {
				$('#newHeaderValue').placeholder = ClientHeaders[i].hint;
				break;
			}
		}
	}
	
	function addNewRequestHeader() {
		var headerName = findSelectedOption($$('#newReqHeaderName option')), 
			headerValue = $('#newHeaderValue').value,
			headerNote, isSafeHeader, headerClass = '', 
			row, col, button;
		
		if (!headerName) {
			alert('Please, select a Header Name.')
			return;
		}
		if (!headerValue) {
			alert('Please, provide a Header Value.')
			return;
		}
		
		for (var i = 0; i < ClientHeaders.length; ++i) {
			if (headerName == ClientHeaders[i].header) {
				headerNote = ClientHeaders[i].note;
				isSafeHeader = ClientHeaders[i].isSafe;
				break;
			}
		}
		if (!isSafeHeader) headerClass = ' class="unsafe"';
		
		// create header element
		row = document.createElement('div');
		row.className = 'row';
		// create header
		col = document.createElement('div');
		col.className = 'col-wide req-headers';
		col.innerHTML = '<h4' + headerClass + ' title="' + headerNote + 
			'">' + headerName + ': ' + headerValue + '</h4>';
		row.appendChild(col);
		// create delete button
		col = document.createElement('div');
		col.className = 'col-fixed req-headers';
		button = document.createElement('button');
		button.className = 'btn btn-danger';
		button.innerText = '-';
		button.addEventListener('click', delRequestHeader);
		col.appendChild(button);
		row.appendChild(col);
		// add the header element
		$('#reqHeaders').appendChild(row);
	}
	
	// helping function returns true if two args is the same object
	function isTheSameObject(obj1, obj2) {
		return JSON.stringify(obj1) == JSON.stringify(obj2);
	}
	
	function delRequestHeader(event) {
		var button = event.currentTarget,
			headerElem = button.parentNode.parentNode,
			parentElem = headerElem.parentNode;
		if (isTheSameObject(parentElem, $('#reqHeaders')))
			parentElem.removeChild(headerElem);
	}
	
	
	/*******************************  sending a request  *******************************/
	
	// helping function returns true if valid URI address was provided
	function isValidUrl(url) {
		var uriRE = /(^https?:\/\/)?[a-z0-9~_\-\.]+(\.[a-z]{2,9})?(\/|:|\?[!-~]*)?$/i;
		return uriRE.test(url);
	}
	
	// helping function to set the performence time up
	function setPerformanceTime(startTime) {
		var time = performance.now() - startTime;
		time = Math.round(time * 100) / 100;
		$('#resTime').innerText = time + ' ms';
	}
	
	function sendHttpRequest(event) {
		if (event.type == 'keydown' && event.keyCode != 13)
			return;
		
		var uri = $('#reqUri').value,
			headers = $$('#reqHeaders h4'),
			xhr = new XMLHttpRequest(),
			header, startTime;
		
		// addjust and validate URI address
		if (uri.search(/https?:\/\//i) != 0) 
			uri = 'http://' + uri;
		if (!isValidUrl(uri)) {
			alert('Please provide a valid URI Address.');
			return;
		}
		
		xhr.open(getRequestMethod(), uri, true);
		// process the headers
		for (var i = 0; i < headers.length; ++i) {
			header = headers[i].innerText.split(': ');
			if (header.length == 2) 
				xhr.setRequestHeader(header[0], header[1]);
		}
		// send the request
		startTime = performance.now();
		if ($('#tabReqBody').classList.contains('disabled'))
			xhr.send();
		else
			xhr.send($('#reqBody').value);
		
		xhr.onload = function() { 
			setPerformanceTime(startTime);
			processServerResponse(xhr);
		}
		xhr.onerror = function() { 
			setPerformanceTime(startTime);
			processServerResponse(xhr);
		}
	}
	
	function processServerResponse(xhr) {
		var resStatus = $('#resStatus'), textArr;
		
		// response status
		resStatus.innerText = xhr.status + ': ' + xhr.statusText;
		if (xhr.status == 0) 
			resStatus.className = 'label label-danger';
		else if (xhr.status < 300)
			resStatus.className = 'label label-success';
		else if (xhr.status < 400)
			resStatus.className = 'label label-warning';
		else
			resStatus.className = 'label label-danger';
				
		// response headers
		textArr = xhr.getAllResponseHeaders().split('\n');
		processResponseHeaders(textArr);
		
		// response body
		$('#resBody').value = xhr.responseText;
		textArr = xhr.responseText.split('\n');
		$('#resBody').rows = textArr.length;
		$('#tabResBody span').innerText = xhr.responseText.length;
	}
	
	function processResponseHeaders(headers) {
		var resHeaders = $('#resHeaders'), counter = 0;
		resHeaders.innerHTML = '';
		for (var i = 0; i < headers.length; ++i) {
			if (headers[i] == '') continue;
			resHeaders.innerHTML += '<h4>' + headers[i] + '</h4>\n';
			++counter;
		}
		$('#tabResHeaders span').innerText = counter;
	}
    
}(window));
