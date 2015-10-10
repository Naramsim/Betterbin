downloadBlob = function(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};

takeMeToPaste = function (pasteName) {
	window.location.href = siteName + "/pastes/" + pasteName;
};

siteName = "http://localhost:3000";

getCookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {return parts.pop().split(";").shift();}
};

setCookie = function (argument) {
	var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789£$&^";
	var userName = Array(9).join().split(',').map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join('');
	document.cookie ='auth=' + userName + '; expires=Fri, 3 Aug 2100 20:47:11 UTC; path=/';
};