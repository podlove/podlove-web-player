var tests = document.getElementById('unit-test-results'),
    progress0 = document.getElementById('progress0'),
    progress4 = document.getElementById('progress4'),
    progress5 = document.getElementById('progress5');

function assert(label, expr, val, group) {
	group = group || 'misc';
	
	var ul = document.getElementById(group),
		li = document.createElement('li');
	
	if(!ul) {
		ul = document.createElement('ul');
		ul.className = 'unit-tests';
		ul.id = group;
		var h = document.createElement('h3');
		h.innerHTML = 'Category: ' + group;
		tests.appendChild(h);
		tests.appendChild(ul);
	}
	
	if(typeof expr === 'function') {
		expr = expr();
	}
	
	li.innerHTML = '<strong>' + label + '</strong> (should be: ' + val + ', was: ' + expr + ')';
	li.className = expr === val? 'pass' : 'fail';
	
	ul.appendChild(li);
}

assert('get max property', progress4.max, .8, 'static');
assert('get value property', progress4.value, .6, 'static');
assert('get value property for indeterminate', progress0.value, 0, 'static');
assert('get value attribute for indeterminate', progress0.getAttribute('value'), null, 'static');
assert('get position property', progress4.position, .6/.8, 'static');
assert('get position property for indeterminate', progress0.position, -1, 'static');
assert('get labels property length', progress4.labels.length, 2, 'static');

assert('set max attribute, get max property', function(){
	progress4.setAttribute('max', 1.2);
	return progress4.max;
}, 1.2, 'mutation+etters');
assert('set max attribute, get position property', progress4.position, .5, 'mutation+etters');
window.ProgressPolyfill && assert('set max attribute, get aria-valuemax attribute', progress4.getAttribute('aria-valuemax'), '1.2', 'mutation');

assert('set value attribute, get value property', function(){
	progress4.setAttribute('value', .8);
	return progress4.value;
}, .8, 'mutation+etters');
assert('set value attribute, get position property', progress4.position, .8/1.2, 'mutation+etters');

assert('set value attribute when it didn’t exist, get position property', function(){
	progress0.setAttribute('value', 40);
	return progress0.position;
}, .4, 'mutation+etters');

assert('remove value attribute, get position property', function(){
	progress0.removeAttribute('value');
	return progress0.position;
}, -1, 'mutation+etters');

window.ProgressPolyfill && assert('set value attribute, get aria-valuenow attribute', progress4.getAttribute('aria-valuenow'), '0.8', 'mutation');

assert('get max property, when attribute is 0', progress5.max, 1, 'static');
assert('get max attribute, when attribute is 0', progress5.getAttribute('max'), '0', 'static');

assert('set max and value properties, get max attribute', function(){
	progress4.max = 1.2;
	progress4.value = .4
	return progress4.getAttribute('max');
}, '1.2', 'etters');
assert('set max and value properties, get position property', progress4.position, .4/1.2, 'etters');

assert('add new progress, get position property', function(){
	var p = document.createElement('progress');
	p.setAttribute('max', 100);
	p.setAttribute('value', 30);
	p = document.body.appendChild(p);
	var ret = p.position;
	document.body.removeChild(p);
	return ret;
}, 30/100, 'mutation+etters');