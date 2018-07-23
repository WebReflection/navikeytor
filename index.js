/*! (c) 2018 Andrea Giammarchi (ISC) */

Navikeytor.prefix = 'navikeytor:';
Navikeytor.delay = 250;
function Navikeytor(el) {"use strict";
  this._lastTarget = null;
  this.el = el;
  this.barTimer = this.clickTimer = 0;
  this.document = el.ownerDocument || el;
  this.key = el.getElementsByClassName('key');
  this.start();
}

try {
  new CustomEvent(Navikeytor.prefix);
  Navikeytor.CE = CustomEvent;
} catch(IE) {
  Navikeytor.CE = function (type, options) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(
      type,
      !!options.bubbles,
      !!options.cancelable,
      options.detail
    );
    return event;
  };
}

Navikeytor.prototype = {
  constructor: Navikeytor,
  dispatch: function (type, detail) {
    return this.el.dispatchEvent(new Navikeytor.CE(
      Navikeytor.prefix + type,
      {
        detail: detail,
        bubbles: true
      }
    ));
  },
  handleEvent: function (event) {
    this['_on' + event.type](event);
  },
  off: function (type, listener) {
    this.el.removeEventListener(Navikeytor.prefix + type, listener, false);
    return this;
  },
  on: function (type, listener) {
    this.el.addEventListener(Navikeytor.prefix + type, listener, false);
    return this;
  },
  start: function () {
    this.el.addEventListener('keydown', this, false);
    if ('ontouchend' in this.el)
      this._touch(1);
  },
  stop: function () {
    this.el.removeEventListener('keydown', this, false);
    clearTimeout(this.barTimer);
    clearTimeout(this.clickTimer);
    this.barTimer = this.clickTimer = 0;
    if ('ontouchend' in this.el)
      this._touch(0);
  },
  _indexOf: [].indexOf,
  _active: function () {
    var body = this.document.body;
    var activeElement = this.document.activeElement || body;
    if (activeElement === body && this._lastTarget !== null)
      return this._lastTarget;
    return activeElement;
  },
  _bar: function (self, event) {
    self.barTimer = 0;
    self.dispatch('bar', {
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
  _dblbar: function (self, event) {
    self.dispatch('dblbar', {
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
  _dir: function () {
    return this.document.documentElement
            .getAttribute('dir') === 'rtl' ? -1 : 1;
  },
  _dispatch: function (pos, event, target) {
    target.focus();
    this._lastTarget = target;
    this.dispatch(pos < 0 ? 'prev' : 'next', {
      event: event,
      target: target
    });
  },
  _horizontal: function (event, pos) {
    var el = this._active();
    var boundaries = this._closest(el, '.keys-bound');
    if (boundaries) {
      var children = boundaries.querySelectorAll('.key');
      if (
        (el === children[0] && pos < 0) ||
        (el === children[children.length - 1] && pos > 0)
      ) return;
    }
    this._dispatch(pos, event, this._target(pos));
  },
  _index: function (index, length) {
    if (index < 0) index = length - 1;
    else if (index === length) index = 0;
    return index;
  },
  _onkeydown: function (event) {
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
        this._horizontal(event, 1 * this._dir());
        break;
      case 'ArrowLeft':
        this._horizontal(event, -1 * this._dir());
        break;
      case 'Backspace':
        this.dispatch('back', {event: event, target: this._active()});
        break;
      case 'Escape':
        var target = this._active();
        if (this.dispatch('esc', {event: event, target: target})) {
          this._lastTarget = null;
          target.blur();
        }
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
          this.clickTimer = setTimeout(this._click, Navikeytor.delay, this, event);
        }
        break;
      case ' ':
        if (this.barTimer) {
          clearTimeout(this.barTimer);
          this.barTimer = 0;
          setTimeout(this._dblbar, 125, this, event);
        } else {
          this.barTimer = setTimeout(this._bar, Navikeytor.delay, this, event);
        }
        break;
    }
  },
  _tab: function (self, event) {
    self.dispatch(
      event.shiftKey ? 'prev' : 'next',
      {event: event, target: self._active()}
    );
  },
  _target: function (pos) {
    return this.key[this._index(
      this._indexOf.call(this.key, this._active()) + pos,
      this.key.length
    )];
  },
  _touch: function (add) {
    var method = 'addEventListener';
    var type = ['touchstart', 'touchmove', 'touchend'];
    if (add) {
      var self = this, timer = 0, sx = -1, sy = -1, x = 0, y = 0;
      this._touches = {
        auto: function (self) {
          var x = sx, y = sy;
          self.end(event);
          sx = x;
          sy = y;
          timer = setTimeout(auto, Navikeytor.delay / 2, self);
        },
        handleEvent: function (event) {
          this[event.type === 'touchend' ? 'end' : 'move'](event);
        },
        move: function (event) {
          var touch = event.touches[0];
          if (sx < 0) {
            sx = x = touch.clientX;
            sy = y = touch.clientY;
            timer = setTimeout(auto, Navikeytor.delay / 2, this);
          } else {
            x = touch.clientX;
            y = touch.clientY;
          }
        },
        end: function (event) {
          clearTimeout(timer);
          x = sx - x;
          y = sy - y;
          if (x) self._horizontal(event, x < 0 ? -1 : 1);
          else if (y) self._vertical(event, y < 0 ? -1 : 1);
          sx = sy = -1;
        }
      };
    } else
      method = 'removeEventListener';
    for (var i = 0; i < type.length; i++)
      this.el[method](type[i], this._touches, false);
  },
  _vertical: function (event, pos) {
    var target;
    var current = this._active();
    var container = this._closest(current, '.keys');
    if (container) {
      var length = this.key.length;
      var i = this._indexOf.call(this.key, current);
      do {
        i += pos;
        target = this.key[this._index(i, length)];
      } while (target !== current && container.contains(target));
      this._dispatch(pos, event, target);
    } else {
      // TODO: double check this is cool
      // otherwise use: this._horizontal(event, pos);
      target = this._target(pos);
      var container = this._closest(target, '.keys');
      if (container) target = container.querySelector('.key');
      this._dispatch(pos, event, target);
    }
  }
};
