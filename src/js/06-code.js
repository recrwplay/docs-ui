// Code functions
;(function () {
  var commandContinuationRx = /\\\s*$/
  var copyableCommand = function (input) {
    var result = input
    if (input.startsWith('$ ')) {
      var lines = result.split('\n')
      var currentCommand = ''
      var commands = []
      var commandContinuationFound = false
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        if (!commandContinuationFound && !line.startsWith('$ ')) {
          // ignore, command output
        } else {
          if (commandContinuationFound) {
            currentCommand += '\n' + line
          } else if (line.startsWith('$ ')) {
            currentCommand = line.substr(2, line.length)
          }
          commandContinuationFound = line.match(commandContinuationRx)
          if (!commandContinuationFound) {
            commands.push(currentCommand)
          }
        }
      }
      result = commands.join('; ')
    }
    return result
  }
  window.neo4jDocs = {
    copyableCommand: copyableCommand,
  }
})()

document.addEventListener('DOMContentLoaded', function () {
  var ignore = ['gram']
  var copiedText = 'Copied!'

  var cleanCode = function (code, language) {
    var div = document.createElement('div')
    div.innerHTML = code

    Array.from(div.querySelectorAll('i.conum, b')).map(function (el) {
      div.removeChild(el)
    })

    var cleaner = document.createElement('textarea')
    var input = div.innerHTML

    if (language === 'bash' || language === 'sh' || language === 'shell' || language === 'console') {
      input = window.neo4jDocs.copyableCommand(input)
    }

    cleaner.innerHTML = input
    return cleaner.value
  }

  var copyToClipboard = function (code, language) {
    var textarea = document.createElement('textarea')
    textarea.value = cleanCode(code, language)
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'

    document.body.appendChild(textarea)
    textarea.select()

    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  var casedLang = function (lang) {
    var cased = lang
    switch (lang) {
      case 'csharp':
      case 'dotnet':
        cased = 'C#'
        break
      case 'go':
        cased = 'Go'
        break
      case 'java':
        cased = 'Java'
        break
      case 'javascript':
        cased = 'JavaScript'
        break
      case 'python':
        cased = 'Python'
        break
    }
    return cased
  }

  var addCodeHeader = function (pre) {
    var dotContent = pre.parentElement
    var listingBlock = dotContent.parentElement

    if (listingBlock.classList.contains('noheader')) return

    var addCopyButton = !listingBlock.classList.contains('nocopy')
    var addPlayButton = !listingBlock.classList.contains('noplay')

    var block = pre.querySelector('code')
    var div = pre.parentNode

    var code = block.innerHTML
    var language = block.hasAttribute('class') &&
      block.getAttribute('class').match(/language-([a-z0-9-])+/i)[0].replace('language-', '')

    language = casedLang(language)

    if (language && ignore.indexOf(language.toLowerCase()) > -1) return

    var languageDiv = document.createElement('div')
    languageDiv.className = 'code-language'

    if (language) {
      languageDiv.innerHTML = language
    }
    var children = [languageDiv]

    if (addCopyButton) {
      var copyButton = createElement('button', 'btn btn-copy', [document.createTextNode('Copy to Clipboard')])
      copyButton.addEventListener('click', function (e) {
        e.preventDefault()
        copyToClipboard(code, language)

        var button = e.target
        var text = button.innerHTML
        var width = button.clientWidth

        button.style.width = width + 'px'
        button.classList.add('btn-success')
        button.innerHTML = copiedText

        setTimeout(function () {
          button.innerHTML = text
          button.classList.remove('btn-success')
        }, 1000)
      })

      children.push(copyButton)
    }

    if (language === 'cypher' && addPlayButton) {
      var runButton = createElement(
        'button',
        'btn btn-run btn-primary',
        [document.createTextNode('Run in Neo4j Browser')]
      )

      runButton.addEventListener('click', function (e) {
        e.preventDefault()

        window.location.href = 'neo4j-desktop://graphapps/neo4j-browser?cmd=edit&arg=' + encodeURIComponent(cleanCode(code))
      })

      children.push(runButton)
    }

    var originalTitle = div.parentNode.querySelector('.title')
    if (originalTitle) {
      var titleDiv = document.createElement('div')
      titleDiv.className = 'code-title'
      titleDiv.innerHTML = originalTitle.innerHTML

      originalTitle.style.display = 'none'

      children.unshift(titleDiv)
    }

    var header = createElement('div', 'code-header', children)

    pre.className += ' has-header'
    div.insertBefore(header, pre)
  }

  var createElement = function (el, className, children) {
    var output = document.createElement(el)
    output.setAttribute('class', className)

    Array.isArray(children) && children.forEach(function (child) {
      if (child) output.appendChild(child)
    })

    return output
  }

  // Apply Code Headers
  document.querySelectorAll('.highlight')
    .forEach(addCodeHeader)

  var targetActive = 'tabbed-target--active'
  var tabActive = 'tabbed-tab--active'

  var switchTab = function (e) {
    var tab = e.target
    var title = tab.innerHTML
    // Switch Tabs
    var targetTabs = document.querySelectorAll('.tabbed-target[data-title="' + title + '"]')
    targetTabs.forEach(function (target) {
      target.parentElement.querySelectorAll('.' + targetActive)
        .forEach(function (el) {
          el.classList.remove(targetActive)
        })

      target.classList.add(targetActive)

      target.parentElement.parentElement.querySelectorAll('.' + tabActive)
        .forEach(function (el) {
          el.classList.remove(tabActive)
        })

      target.parentElement.parentElement.querySelectorAll('.tabbed-tab[data-title="' + title + '"]')
        .forEach(function (el) {
          el.classList.add(tabActive)
        })
    })

    var toolbarOffset = 0
    var toolbar = document.querySelector('.toolbar')
    if (toolbar.offsetHeight) {
      toolbarOffset = toolbar.offsetHeight
    }
    var offset = document.querySelector('.navbar').offsetHeight + toolbarOffset + 20

    var bodyRect = document.body.getBoundingClientRect().top
    var elementRect = tab.getBoundingClientRect().top
    var elementPosition = elementRect - bodyRect
    var offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
  }

  // Tabbed code
  Array.from(document.querySelectorAll('.tabs'))
    .forEach(function (tab) {
      var originalTab = tab
      var parent = tab.parentElement

      // Build an array of elements
      var elements = [tab]

      // Loop through the next sibling until it doesn't contain a <code> tag
      while (tab) {
        var nextTab = tab.nextElementSibling

        if (nextTab && !nextTab.classList.contains('sect2') && nextTab.querySelector('code')) {
          elements.push(nextTab)

          tab = nextTab
        } else {
          tab = false
        }
      }

      // Don't do anything if there's only one tab
      if (elements.length <= 1) {
        return
      }

      var tabbedContainer = createElement('div', 'tabbed-container', [])
      var tabbedParent = createElement('div', 'tabbed', [tabbedContainer])

      parent.insertBefore(tabbedParent, originalTab)

      // Build up tabs
      var tabs = elements.map(function (element) {
        var title = element.querySelector('.title')
        var codeLanguage = element.querySelector('.code-language')
        var text
        if (title) {
          text = title.innerHTML
        } else if (codeLanguage) {
          text = codeLanguage.innerHTML
        }

        var tabElement = createElement('li', 'tabbed-tab', [document.createTextNode(text)])
        element.dataset.title = text
        tabElement.dataset.title = text

        tabElement.addEventListener('click', switchTab)

        return tabElement
      })

      tabs[0].classList.add('tabbed-tab--active')

      tabbedParent.insertBefore(createElement('ul', 'tabbed-tabs', tabs), tabbedContainer)

      // Remove elements from parent and add to tab container
      elements.forEach(function (element) {
        parent.removeChild(element)
        tabbedContainer.appendChild(element)

        element.classList.add('tabbed-target')
      })

      elements[0].classList.add('tabbed-target--active')
    })

  //
  // Tabbed sections in the drivers manual
  //

  if (storageAvailable('sessionStorage')) {
    var sessionStorage = window.sessionStorage
  }
  var storedLanguage = getCodeExampleLanguage()

  Array.from(document.querySelectorAll('.tabbed-example'))
    .forEach(function (tab) {
      var tabsTitle = tab.querySelector('.title')
      var originalTab = tab
      var parent = tab.parentElement

      // Build an array of elements
      var elements = []
      // look for driver languages
      var langList = ['dotnet', 'go', 'java', 'javascript', 'python']

      // add sections for each language from driver manual html output format
      langList.forEach(function (lang) {
        tab.querySelectorAll('.include-with-' + lang).forEach(function (block) {
          block.setAttribute('data-title', lang)
          block.setAttribute('data-lang', lang)
          elements.push(block)
        })
      })

      // Don't do anything if there's only one tab
      if (elements.length <= 1) {
        return
      }

      var tabbedContainer = createElement('div', 'tabbed-container', [])
      var tabbedParent = createElement('div', 'tabbed', [tabbedContainer])

      if (tabsTitle) {
        parent.insertBefore(tabsTitle, originalTab)
      }
      parent.insertBefore(tabbedParent, originalTab)

      // Build up tabs
      var tabs = elements.map(function (element) {
        var tabText = casedLang(element.getAttribute('data-lang'))
        var tabElement = createElement('li', 'tabbed-tab', [document.createTextNode(tabText)])

        element.dataset.title = tabText
        element.dataset.lang = tabText
        tabElement.dataset.title = tabText
        tabElement.dataset.lang = tabText

        if (tabText === storedLanguage) tabElement.classList.add(tabActive)
        tabElement.addEventListener('click', switchTab)

        // don't want more than one tab for the same lang
        if (!langList.includes(tabText)) {
          langList.push(tabText)
        } else {
          tabElement.classList.add('tabbed-tab--dupe')
          tabElement.classList.remove(tabActive)
        }
        return tabElement
      })

      // Remove elements from parent and add to tab container
      var activeAdded = false
      elements.forEach(function (element) {
        tabbedContainer.appendChild(element)
        element.classList.add('tabbed-target')
        if (element.getAttribute('data-lang') === storedLanguage) {
          element.classList.add('tabbed-target--active')
          activeAdded = true
        }
      })

      if (!activeAdded) {
        // get the data-lang of the first tab
        var setLang = elements[0].getAttribute('data-lang')
        // add active to matching tabs and targets
        var elIndex = 0
        elements.forEach(function (element) {
          if (element.getAttribute('data-lang') === setLang) {
            element.classList.add('tabbed-target--active')
            tabs[elIndex].classList.add('tabbed-tab--active')
          }
          elIndex++
        })
      }

      tabbedParent.insertBefore(createElement('ul', 'tabbed-tabs', tabs), tabbedContainer)

      parent.removeChild(originalTab)
    })

  function storageAvailable (type) {
    try {
      var storage = window[type]
      var x = '__storage_test__'
      storage.setItem(x, x)
      storage.removeItem(x)
      return true
    } catch (e) {
      return false
    }
  }

  function getCodeExampleLanguage () {
    return storageAvailable('sessionStorage') ? sessionStorage.getItem('code_example_language') || false : false
  }
})
