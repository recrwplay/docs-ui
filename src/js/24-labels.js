// Code functions
import { createElement } from './modules/dom'

document.addEventListener('DOMContentLoaded', function () {
  // each cLabels is a cascading label
  // defined as -
  // page attribute specified by role=
  // query selectors of blocks that can contain a label, which contain...
  // ...blocks that will have a label prepended
  // the text to display in the label

  const cLabels = [
    ['deprecated', '.sect1, #preamble', '.sectionbody', 'Deprecated'],
    ['deprecated', '.sect2', 'div', 'Deprecated'],
  ]

  var addLabel = function (hDiv, label, insertPoints, labelText) {
    // return if label already exists
    if (hDiv.querySelector('.label--' + label)) return

    var span = document.createElement('span')
    span.classList.add('label', 'label--' + label)
    span.innerHTML = labelText
    var para = createElement('p', '', span)
    var newLabel = createElement('div', 'paragraph', para)

    var point = hDiv.querySelector(insertPoints)
    hDiv.insertBefore(newLabel, point)
  }

  for (let i = 0; i < cLabels.length; i++) {
    const [label, queries, inserts, displayText] = cLabels[i]
    // add deprecated label to all h2 if page has deprecated role
    if (document.body.classList.contains(label)) {
      document.querySelectorAll(queries, 'cascade').forEach((hDiv) => { addLabel(hDiv, label, inserts, displayText) })
    }
  }
})
