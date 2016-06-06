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
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('spellcheck', 'false');
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
    this.box.className = 'autocomplete-options-list';

    css(this.box, {
        display: 'none',
        position: 'absolute',
        top: istyle.height,
        width: istyle.width,
        overflowY: 'auto',
        paddingLeft: istyle.paddingLeft,
        paddingRight: istyle.paddingRight,
    });

    var prev;
    this.box.addEventListener('mousemove', function (ev) {
        unhover();
        if (ev.target === this) return;
        hover(ev.target);
    });
    this.box.addEventListener('mousedown', function (ev) {
        if (ev.target === this) return;
        self.input.value = ev.target.textContent;
        self.suggest();
    });
    this.box.addEventListener('mouseout', unhover);

    function hover (elem) {
      elem.classList.add('autocomplete-focus-option');
    }
    function unhover (ev) {
        if (prev) {
          prev.classList.remove('autocomplete-focus-option');
        }
    }
    div.appendChild(this.box);

    this.input.addEventListener('keydown', function (ev) {
        if (ev.which === 9 || ev.keyCode === 9) {
            self.set(self.options[0]);
            self.options.splice(1);
            css(self.box, { display: 'none' });
            self.box.innerHTML = '';
            ev.preventDefault();
        }
        else if (ev.which === 38 || ev.keyCode === 38) { // up
            if (self.box.children.length === 0) return;
            unhover();
            var ix = -1;
            if (prev) ix = self.options.indexOf(prev.textContent);
            var len = self.box.children.length;
            prev = self.box.children[(ix - 1 + len) % len];
            self.set(prev.textContent);
            hover(prev);
        }
        else if (ev.which === 40 || ev.keyCode === 40) { // down
            if (self.box.children.length === 0) return;
            unhover();
            var ix = -1;
            if (prev) ix = self.options.indexOf(prev.textContent);
            prev = self.box.children[(ix + 1) % self.box.children.length];
            self.set(prev.textContent);
            hover(prev);
        }
        else if ((ev.which === 10 || ev.which === 13
        || ev.keyCode === 10 || ev.keyCode === 13)
        && window.getComputedStyle(self.box).display === 'block') {
            self.options.splice(1);
            self.box.innerHTML = '';
            css(self.box, { display: 'none' });
            ev.preventDefault();
        }
        realign();
    });

    realign();
    this.input.addEventListener('focus', function () {
        if (self.options.length) {
            self.ahead.value = self.input.value
                + (self.options[0] || '').slice(self.input.value.length)
            ;
            if (self.options.length > 1) {
                css(self.box, { display: 'block' });
            }
        }
        realign();
        setTimeout(realign, 0);
    });
    this.input.addEventListener('blur', function () {
        self.ahead.value = '';
        css(self.box, { display: 'none' });
        realign();
        setTimeout(realign, 0);
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

    function realign () {
        var istyle = window.getComputedStyle(self.input);
        self.ahead.style.textAlign = istyle.textAlign;
    }
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
