var isarray = require('isarray');

module.exports = Auto;

function Auto (elem, fn) {
    if (!(this instanceof Auto)) return new Auto(elem, fn);
    var self = this;
    
    var div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.position = 'relative';
    div.style.width = elem.clientWidth;
    div.style.verticalAlign = 'top';
    
    var istyle = window.getComputedStyle(elem);
    if (elem.parentNode) {
        elem.parentNode.insertBefore(div, elem);
        elem.parentNode.removeChild(elem);
        div.appendChild(elem);
    }
    
    this.element = div;
    this.input = elem;
    this.ahead = elem.cloneNode(true);
    this.ahead.setAttribute('placeholder', '');
    this.ahead.setAttribute('disabled', true);
    this.ahead.style.backgroundColor = istyle.backgroundColor;
    this.options = [];
    
    css(this.ahead, {
        color: '#808080',
        position: 'absolute',
        zIndex: 5
    });
    css(this.input, {
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 10
    });
    div.appendChild(this.ahead);
    
    this.box = document.createElement('div');
    css(this.box, {
        display: 'none',
        position: 'absolute',
        top: istyle.height,
        width: parseInt(istyle.width) - parseInt(istyle.paddingRight) * 2,
        maxHeight: '5em',
        overflowY: 'auto',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '3px',
        paddingLeft: istyle.paddingLeft,
        paddingRight: istyle.paddingRight,
        paddingTop: '3px',
        paddingBottom: '3px'
        
    });
    var prev;
    this.box.addEventListener('mousemove', function (ev) {
        unhover();
        if (ev.target === this) return;
        hover(ev.target);
    });
    this.box.addEventListener('click', function (ev) {
        if (ev.target === this) return;
        self.input.value = ev.target.textContent;
        self.suggest();
    });
    this.box.addEventListener('mouseout', unhover);
    
    function hover (elem) {
        elem.style.backgroundColor = 'blue';
        elem.style.color = 'white';
        prev = elem;
    }
    function unhover (ev) {
        if (prev) {
            prev.style.backgroundColor = 'inherit';
            prev.style.color = 'inherit';
        }
    }
    div.appendChild(this.box);
    
    this.input.addEventListener('keydown', function (ev) {
        if (ev.which === 9 || ev.keyCode === 9) {
            self.input.value = self.ahead.value;
            ev.preventDefault();
        }
        else if (ev.which === 38 || ev.keyCode === 38) { // up
            unhover();
            var ix = -1;
            if (prev) ix = self.options.indexOf(prev.textContent);
            var len = self.box.children.length;
            prev = self.box.children[(ix - 1 + len) % len];
            self.set(prev.textContent);
            hover(prev);
        }
        else if (ev.which === 40 || ev.keyCode === 40) { // down
            unhover();
            var ix = -1;
            if (prev) ix = self.options.indexOf(prev.textContent);
            prev = self.box.children[(ix + 1) % self.box.children.length];
            self.set(prev.textContent);
            hover(prev);
        }
    });
    var previnput;
    this.input.addEventListener('keyup', function (ev) {
        if (ev.which === 9 || ev.keyCode === 9
        || ev.which === 38 || ev.keyCode === 38
        || ev.which === 40 || ev.keyCode === 40) {
            return;
        }
        if (previnput !== self.input.value) {
            previnput = self.input.value;
            if (fn) fn.call(self, self, ev);
        }
    });
}

Auto.prototype.set = function (txt) {
    this.input.value = txt;
    this.ahead.value = txt;
};

Auto.prototype.suggest = function (sgs) {
    if (!sgs) sgs = [ '' ];
    else if (!isarray(sgs)) sgs = [ sgs ].filter(Boolean);
    this.options = sgs;
    
    if (!sgs[0]) this.ahead.value = '';
    else this.ahead.value = this.input.value
        + (sgs[0] || '').slice(this.input.value.length)
    ;
    if (sgs.length <= 1) return css(this.box, { display: 'none' });;
    this.box.innerHTML = '';
    
    css(this.box, { display: 'block' });
    for (var i = 0; i < sgs.length; i++) {
        var div = document.createElement('div');
        div.textContent = sgs[i];
        this.box.appendChild(div);
    }
};

function css (elem, params) {
    for (var key in params) elem.style[key] = params[key];
}
