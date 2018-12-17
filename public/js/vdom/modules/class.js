
function updateClass(oldVnode, vnode) {
  let cur, name;
  let elm = vnode.elm,
      oldClass = oldVnode.data.class,
      newClass = vnode.data.class;

  if (!oldClass && !newClass) return;
  if (oldClass === newClass) return;

  oldClass = oldClass || {};
  newClass = newClass || {};

  for (name in oldClass) {
    if (!newClass[name]) {
      elm.classList.remove(name);
    }
  }

  for (name in newClass) {
    cur = newClass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

export default {create: updateClass, update: updateClass};