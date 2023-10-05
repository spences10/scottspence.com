window.addEventListener('load', () => {
  const testScript = document.createElement('script')
  testScript.src = 'https://cdn.usefathom.com/script.js'
  testScript.onload = () => {
    document.cookie = 'block_fathom=false; path=/'
  }
  testScript.onerror = () => {
    document.cookie = 'block_fathom=true; path=/'
  }
  document.head.appendChild(testScript)
})
