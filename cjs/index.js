/*! (c) 2018 Andrea Giammarchi (ISC) */

Navikeytor.prefix = 'navikeytor:';
function Navikeytor(el) {"use strict";
  this.el = el;
  this.barTimer = 0;
  this.clickTimer = 0;
  this.document = el.ownerDocument || el;
  this.key = el.getElementsByClassName('key');
  this.dir = this.document
                  .querySelector('[dir]')
                  .getAttribute('dir') === 'rtl' ? -1 : 1;
  this.start();
}

Navikeytor.prototype = {
  constructor: Navikeytor,
  on: function (type, listener) {
    this.el.addEventListener(Navikeytor.prefix + type, listener);
    return this;
  },
  off: function (type, listener) {
    this.el.removeEventListener(Navikeytor.prefix + type, listener);
    return this;
  },
  dispatch: function (type, detail) {
    this.el.dispatchEvent(new CustomEvent(Navikeytor.prefix + type, {
      detail: detail,
      bubbles: true
    }));
    return this;
  },
  start: function () {
    this.el.addEventListener('keydown', this);
  },
  stop: function () {
    this.el.removeEventListener('keydown', this);
  },
  indexOf: [].indexOf,
  handleEvent: function (event) {
    document.title = event.key;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._vertical(event, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._vertical(event, -1);
        break;
      case 'ArrowRight':
        this._horizontal(event, 1 * this.dir);
        break;
      case 'ArrowLeft':
        this._horizontal(event, -1 * this.dir);
        break;
      case 'Backspace':
        this.dispatch('back', {event: event, target: this._active()});
        break;
      case 'Escape':
        var el = this._active();
        if (this.dispatch('esc', {event: event, target: el}))
          el.blur();
        break;
      case 'Tab':
        setTimeout(this._tab, 0, this, event);
        break;
      case 'Enter':
        if (this.clickTimer) {
          clearTimeout(this.clickTimer);
          this.clickTimer = 0;
          setTimeout(this._dblclick, 125, this, event);
        } else {
          this.clickTimer = setTimeout(this._click, 250, this, event);
        }
        break;
      case ' ':
        if (this.barTimer) {
          clearTimeout(this.barTimer);
          this.barTimer = 0;
          setTimeout(this._dblbar, 125, this, event);
        } else {
          this.barTimer = setTimeout(this._bar, 250, this, event);
        }
        break;
    }
  },
  _index: function (index, length) {
    if (index < 0) index = length - 1;
    else if (index === length) index = 0;
    return index;
  },
  _horizontal: function (event, pos) {
    var el = this._el(pos);
    el.focus();
    this.dispatch(pos < 0 ? 'prev' : 'next', {
      event: event,
      target: el
    });
  },
  _vertical: function (event, pos) {
    var el;
    var current = this._active();
    var container = this._closest(current, '.keys');
    if (container) {
      var length = this.key.length;
      var i = this.indexOf.call(this.key, current);
      do {
        i += pos;
        el = this.key[this._index(i, length)];
      } while (el !== current && container.contains(el));
      el.focus();
      this.dispatch(pos < 0 ? 'prev' : 'next', {
        event: event,
        target: el
      });
    } else {
      // TODO: double check this is cool
      // otherwise use: this._horizontal(event, pos);
      el = this._el(pos);
      var container = this._closest(el, '.keys');
      if (container) el = container.querySelector('.key');
      el.focus();
      this.dispatch(pos < 0 ? 'prev' : 'next', {
        event: event,
        target: el
      });
    }
  },
  _active: function () {
    return this.document.activeElement;
  },
  _el: function (pos) {
    return this.key[this._index(
      this.indexOf.call(this.key, this._active()) + pos,
      this.key.length
    )];
  },
  _closest: function (el, css) {
    return (el.closest || this._closestFix).call(el, css);
  },
  _closestFix: function (css) {
    var parentNode = this, matches;
    while (
      (matches = parentNode && parentNode.matches) &&
      !parentNode.matches(css)
    )
      parentNode = parentNode.parentNode;
    return matches ? parentNode : null;
  },
  _bar: function (self, event) {
    self.barTimer = 0;
    self.dispatch('bar', {
      event: event,
      target: self._active()
    });
  },
  _dblbar: function (self, event) {
    self.dispatch('dblbar', {
      event: event,
      target: self._active()
    });
  },
  _click: function (self, event) {
    self.clickTimer = 0;
    self.dispatch('click', {
      event: event,
      target: self._active()
    });
  },
  _dblclick: function (self, event) {
    self.dispatch('dblclick', {
      event: event,
      target: self._active()
    });
  },
  _tab: function (self, event) {
    self.dispatch(
      event.shiftKey ? 'prev' : 'next',
      {event: event, target: self._active()}
    );
  }
};
module.exports = Navikeytor;
