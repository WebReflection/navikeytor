# navikeytor
100% keyboard based spatial navigation.

**Work In Progress**

It targets any element with class `key` and it groups horizontally every `key` within a container with class `keys`.

It fully preserves tab navigation, and its major target are feature phones.

```js
// target the whole document
new Navikeytor(document)
  // each event is registered as `navikeytor:${type}`
  .on('back', event => {
    // details has {event, target}
    // as original event, and target node
    // which is the currently focused/active one
    console.log(event.type, event.detail);
  })
  .on('bar', event => {
    console.log(event.type, event.detail);
  })
  .on('click', event => {
    console.log(event.type, event.detail);
  })
  .on('dblbar', event => {
    console.log(event.type, event.detail);
  })
  .on('dblclick', event => {
    console.log(event.type, event.detail);
  })
  .on('esc', event => {
    console.log(event.type, event.detail);
  })
  .on('next', event => {
    console.log(event.type, event.detail);
  })
  .on('prev', event => {
    console.log(event.type, event.detail);
  })
;
```

### Live Demo

You can try both [ltr](https://webreflection.github.io/navikeytor/test/) use case or [rtl](https://webreflection.github.io/navikeytor/test/?rtl).

