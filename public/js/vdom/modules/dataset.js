/**
 * Dataset Module
 */
const CAPS_REGEX = /[A-Z]/g;

function updateDataset(oldVnode, vnode){
  let elm = vnode.elm,
    oldDataset = oldVnode.data.dataset,
    newDataset = vnode.data.dataset,
    key;

  if (!oldDataset && !newDataset) return;
  if (oldDataset === newDataset) return;
  oldDataset = oldDataset || {};
  newDataset = newDataset || {};
  
  const dataset = elm.dataset;

  for (key in oldDataset) {
    if (!newDataset[key]) {
      if (dataset) {
        if (key in dataset) {
          delete dataset[key];
        }
      } else {
        elm.removeAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase());
      }
    }
  }
  for (key in newDataset) {
    if (oldDataset[key] !== newDataset[key]) {
      if (dataset) {
        dataset[key] = newDataset[key];
      } else {
        elm.setAttribute('data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase(), newDataset[key]);
      }
    }
  }
}

export default {
  create: updateDataset, 
  update: updateDataset
};