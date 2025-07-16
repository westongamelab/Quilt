/* global CodeMirror, QuiltGraph */
let currentPassageId

function closeClearEditor () {
  document.querySelector('#editor').style.display = 'none'
  cm.setValue('')
  currentPassageId = null
}

function updateEditor (obj) {
  document.querySelector('.name').textContent = obj.name
  if (obj.text) cm.setValue(obj.text)
  else cm.setValue('')
}

document.querySelector('.name').addEventListener('input', (e) => {
  if (currentPassageId) {
    graph.updatePassage(currentPassageId, { name: e.target.textContent })
  }
})

document.querySelector('.close').addEventListener('click', closeClearEditor)
document.querySelector('#open').addEventListener('click', closeClearEditor)
document.querySelector('#new').addEventListener('click', closeClearEditor)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeClearEditor()
})

document.querySelector('#nn-theme').addEventListener('click', (e) => {
  if (e.target.textContent === 'netnet theme') {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'css/netnet-theme.css'
    const head = document.head || document.getElementsByTagName('head')[0]
    const existing = head.querySelectorAll('link[rel="stylesheet"]')
    const last = existing[existing.length - 1]
    last.parentNode.insertBefore(link, last.nextSibling)
    graph.updateGridColor(240, 31, 46, 0.20, 1, 4)
    document.querySelectorAll('.menu-bar > button').forEach(button => {
      button.classList.add('pill-btn')
      button.classList.add('pill-btn--secondary')
    })
    e.target.textContent = 'twine theme'
    window.nnlink = link
  } else {
    window.nnlink.remove()
    graph.updateGridColor(212, 90, 90, 1, 1, 2)
    document.querySelectorAll('.menu-bar > button').forEach(button => {
      button.classList.remove('pill-btn')
      button.classList.remove('pill-btn--secondary')
    })
    e.target.textContent = 'netnet theme'
  }
})

// --------------------------------------------- graph setup -------------------

const graph = new QuiltGraph({
  container: '#graph-container',
  menu: {
    zoom: '#zoom',
    open: '#open',
    save: '#save',
    new: '#new',
    delete: '#delete'
  }
})

graph.setZoom(1)

graph.on('delete', (obj) => {
  if (obj.id === currentPassageId) {
    document.querySelector('#editor').style.display = 'none'
    currentPassageId = null
  }
})

graph.on('selected', (obj) => {
  document.querySelector('#delete').style.opacity = 1
  if (document.querySelector('#editor').style.display === 'block') {
    currentPassageId = obj.id
    updateEditor(obj)
  }
})

graph.on('unselected', (obj) => {
  if (!graph.getSelectedPassages()) {
    document.querySelector('#delete').style.opacity = 0.5
  }
})

graph.on('dblclick', (obj) => {
  currentPassageId = obj.id
  document.querySelector('#editor').style.display = 'block'
  updateEditor(obj)
})

// --------------------------------------- CodeMirror Setup --------------------

const ta = document.querySelector('#editor textarea')
const cm = CodeMirror.fromTextArea(ta, {
  mode: 'harloweMod',
  lineNumbers: false,
  theme: 'default',
  lineWrapping: true
})

cm.on('change', (instance, changeObj) => {
  if (changeObj.origin !== 'setValue' && currentPassageId) {
    graph.updatePassage(currentPassageId, { text: instance.getValue() })
  }
})
