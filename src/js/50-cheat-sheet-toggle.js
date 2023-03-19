import { createElement } from './modules/dom'

document.addEventListener('DOMContentLoaded', function () {
  // get all the selector types

  // const selectorTypes = document.querySelectorAll('[data-selector-type]')
  // console.log(selectorTypes)

  const selectorOptions = document.querySelectorAll('[id^=cheat-sheet-selector-] option')
  // console.log(selectorOptions)

  // let allSelectors = {}

  // selectorTypes.forEach((st) => {
  //   const type = st.dataset.selectorType
  //   const csSelectors = `#cheat-sheet-selector-${type} option`
  //   allSelectors[`${type}`] = document.querySelector(csSelectors)
  // })

  // console.log(allSelectors.categories.querySelectorAll('option'))
  // console.log(allSelectors)

  // const me = {...allSelectors}
  // console.log(me)
  // return

  const optionMap = [...selectorOptions].map((o) => ({
    value: o.value,
    text: o.dataset.label,
    class: o.dataset.class,
    labelType: o.dataset.labelType,
    labelOnly: o.hidden,
    selected: o.selected,
  }))

  // console.log(optionMap)

  const selectorTypes = [...new Set(optionMap.map((obj) => obj.labelType))]
  console.log(selectorTypes)

  // return

  // const csSelectors = '#cheat-sheet-selector-categories'
  // const css = document.querySelector(csSelectors)

  // console.log(`selected category: ${css[css.selectedIndex].value}`)
  // console.log(`selected category: ${css.selectedOptions[0].value}`)

  // if (!css) return

  // console.log(css)

  // const queryString = window.location.search
  // console.log(queryString)

  // const urlParams = new URLSearchParams(queryString)

  // if (urlParams.has('product')) {
  //   const product = urlParams.get('product')
  //   // set the default for the product
  //   const options = css.options

  //   // change selected value in options list
  //   let match = false
  //   for (const option of options) {
  //     console.log(`option:${option.label}`)
  //     if (option.label === decodeURIComponent(product) || option.value === decodeURIComponent(product)) {
  //       css.selectedIndex = option.index
  //       match = true
  //     }
  //   }
  //   if (!match) {
  //     // display some html to say that the url params are not right?
  //   }
  // }

  // const cs = []

  // css.forEach((c) => {
  //   console.log(c)
  //   for (const child of c.children) {
  //     console.log(child);
  //     cs.push(child)
  //   }
  // })

  // for (const child of css.children) {
  //   // console.log(child);
  //   cs.push(child)
  // }

  // return

  // get all the cheat-sheet selector values from the select
  // const optionMap = [...cs].map((o) => ({
  //   value: o.value,
  //   text: o.dataset.label,
  //   class: o.dataset.class,
  //   labelType: o.dataset.labelType,
  //   hidden: o.hidden,
  // }))

  // console.log(optionMap)

  const optionNames = [...selectorOptions].reduce(function (f, o) {
    f.push(o.value)
    return f
  }, []).sort()

  const visibleOptionNames = [...selectorOptions].reduce(function (f, o) {
    if (!o.hidden) f.push(o.value)
    return f
  }, []).sort()

  const hiddenOptionNames = [...selectorOptions].reduce(function (f, o) {
    if (o.hidden) f.push(o.value)
    return f
  }, []).sort()

  const defaultClasses = ['exampleblock', 'sect2', 'sect1']

  // get list of classes for each example codeblock and section
  document.querySelectorAll(defaultClasses.map((c) => '.' + c)).forEach((el) => {
    if (el.classList.contains('hidden')) return

    // get an array of classes on the element
    const classes = [...el.classList]

    // remove defaultClasses to get an array of classes that could be labels
    const labels = classes.filter(function (obj) {
      return defaultClasses.indexOf(obj) === -1
    }).sort()

    // console.log(classes)

    // get an array of classes that match the select options
    const matches = optionNames.filter(function (obj) {
      return labels.indexOf(obj) !== -1
    }).sort()

    // console.log(matches)

    const outofscope = labels.filter(function (obj) {
      return optionNames.indexOf(obj) === -1
    }).sort()

    const selectable = visibleOptionNames.filter(function (obj) {
      return labels.indexOf(obj) !== -1
    }).sort()

    const notSelectable = hiddenOptionNames.filter(function (obj) {
      return labels.indexOf(obj) !== -1
    }).sort()

    // always visible: has no labels from the 'visible' options list or all the labels in the 'visible' options list
    // never visible: has no labels from the 'visible' list, and one or more labels not in the all options list

    // remove out of scope classes
    outofscope.forEach((label) => { el.classList.remove(label) })

    // remove the sections that don't apply to this cheat sheet
    if (selectable.length === 0 && outofscope.length > 0) {
      el.remove()
    } else {
      // make entries always visible if they have nothing selectable and nothing out of scope
      if (selectable.length === 0 || selectable.toString() === visibleOptionNames.toString()) el.classList.add('cs-all')
    }

    // add labels where appropriate
    let labelsToAdd = notSelectable
    // if (selectable.toString() !== visibleOptionNames.toString()) labelsToAdd = labelsToAdd.concat(selectable)

    // try working from matches

    matches.forEach((match) => {
      console.log(match)
      const optionIsSelected = optionMap.find((label) => label.value === match).selected
      console.log(`${match} is selected: ${optionIsSelected}`)
    })

    labelsToAdd = matches

    console.log(`labelsToAdd: ${labelsToAdd}`)

    if (labelsToAdd && matches.length > 0) {
      labelsToAdd.forEach((label) => {
        addLabel(el, label)
      })
    }
  })

  // if we've removed elements we need to clean the toc by removing entries for those elements
  cleanToc()

  function addLabel (el, match) {
    const div = createElement('div', 'paragraph')
    let labelType = 'labels'
    if (el.classList.contains('exampleblock')) div.classList.add('labels')
    else {
      div.classList.add('page-labels')
      labelType = 'page-labels'
    }
    const p = createElement('p')
    const span = createElement('span', `label label--${match}`)

    const text = optionMap.find((label) => label.value === match).text

    span.textContent = text
    p.appendChild(span)

    // if there is a label div, add the new label
    // if no label div yet, add this label to the new div and insert the new div
    // note: where it is inserted depends on whether it is a labels div or page-labels div
    const labelsDiv = (labelType === 'labels') ? el.firstElementChild.querySelector(`div.${labelType}`) : el.querySelector(`div.${labelType}`)
    // console.log(labelsDiv)
    if (labelsDiv) {
      labelsDiv.append(p)
    } else {
      div.appendChild(p)
      if (labelType === 'labels') {
        el.firstElementChild.prepend(div)
      } else {
        el.firstElementChild.after(div) // for a page label we assume that the first child is h2 or h3
      }
    }
  }

  // hide labels for versions that are not available in the select box
  document.querySelectorAll('span.label').forEach((el) => {
    const labelClass = [...el.classList].filter((c) => c.startsWith('label--')).toString().replace('label--', '').trim()
    if (!optionNames.includes(labelClass)) {
      el.remove()
    }
  })

  // toggle for default cheat sheet selection
  // const selected = css.selectedIndex
  // toggleExamples(css[selected].value)

  selectorTypes.forEach((st) => {
    document.querySelector(`#cheat-sheet-selector-${st}`).addEventListener('change', function (e) {
      e.stopPropagation()
      console.log(e.target.value)

      // reset everything
      clearHidden()

      // what is currently selected?
      const nowSelected = document.querySelectorAll('.cs-selector option:checked')
      nowSelected.forEach((ns) => {
        console.log(ns)
        console.log(ns.value)
      })
      toggleExamples(nowSelected)
    })
  })

  // hide and unhide sections when the selection is changed
  // css.addEventListener('change', function (e) {
  //   e.stopPropagation()
  //   // reset everything
  //   clearHidden()
  //   // fake a scroll event to trigger feedback scroll event
  //   window.scrollTo(window.scrollX, window.scrollY + 1)
  //   // hide content according to the new selection
  //   toggleExamples(e.target.value)
  //   // fake a scroll event to trigger feedback scroll event
  //   window.scrollTo(window.scrollX, window.scrollY - 1)
  // })

  const matchTo = parseFloat(document.querySelector('.nav-container .selectors').getBoundingClientRect().height)
  const firstSection = document.querySelector('article h2')
  firstSection.style.height = `${matchTo}px`
  firstSection.style.margin = 0
  firstSection.style.lineHeight = `${matchTo}px`
})

function clearHidden () {
  console.log('is there an el')
  document.querySelectorAll('.toc-menu .hidden, .content .sect1.hidden, .content .sect2.hidden, .content .exampleblock.hidden').forEach((el) => {
    el.classList.remove('hidden')
  })
}

// rename this to something to do with visibility
function toggleExamples (selections) {
  const values = [...selections].filter(function (s) {
    console.log(s.value)
    return s.value !== 'all'
  }).map((s) => s.value)

  console.log(`values: ${values}`)

  // hide headers and example sections that don't have labels for all the current selections
  document.querySelectorAll('div.sect1:not(.cs-all), div.sect2:not(.cs-all), div.exampleblock:not(.cs-all)').forEach((el) => {
    const classes = [...el.classList]
    console.log(classes)
    if (values.every((v) => classes.includes(v))) {
      console.log('it is true')
      console.log(el)
      el.classList.remove('hidden')
    } else {
      el.classList.add('hidden')
    }
  })

  // // hide sections
  // document.querySelectorAll(`div.sect2:not(.cs-all`).forEach((el) => {
  //   const classes = [...el.classList]
  //   console.log(classes)
  //   if (console.log(values.every(v => classes.includes(v)))) console.log(el)
  //   el.classList.toggle('hidden')
  // })

  // document.querySelectorAll(`div.exampleblock:not(.cs-all)`).forEach((el) => {
  //   const classes = [...el.classList]
  //   console.log(classes)
  //   if (console.log(values.every(v => classes.includes(v)))) console.log(el)
  //   el.classList.toggle('hidden')
  // })

  // hide sections or headers where all the children are hidden
  const hideableSections = ['div.sect1', 'div.sect2', 'div.exampleblock']
  while (hideableSections.length >= 2) {
    const child = hideableSections.pop()
    const parent = hideableSections[hideableSections.length - 1]
    hideContent(child, parent)
  }

  // hide toc entries
  hideTocEntries()
}

// hide any empty parent sections
function hideContent (child, parent) {
  console.log('in hideContent')
  document.querySelectorAll(`${parent}:not(.hidden)`).forEach((el) => {
    // count the children and hidden children
    const sects = el.querySelectorAll(child).length
    const hidden = el.querySelectorAll(`${child}.hidden`).length

    // if all children are hidden, hide the parent and its toc entry
    // if not, unhide the parent and its toc entry
    if (hidden === sects) {
      el.classList.add('hidden')
    } else {
      el.classList.remove('hidden')
    }
  })
}

// hide entries from the TOC
function hideTocEntries () {
  document.querySelectorAll('div.sect1.hidden, div.sect1.hidden div.sect2, div.sect2.hidden').forEach((el) => {
    const id = el.firstElementChild.id
    const tocEntry = document.querySelector(`.toc-menu a[href="#${id}"]`)
    if (tocEntry) {
      tocEntry.closest('li').classList.toggle('hidden')
    }
  })
}

// remove toc entries for removed sections
function cleanToc () {
  document.querySelectorAll('.toc-menu a').forEach((li) => {
    if (document.querySelector(li.hash) === null) li.remove()
  })
}
