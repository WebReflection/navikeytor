new Navikeytor(document)
  .on('back', event => {
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