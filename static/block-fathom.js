window.addEventListener('load', () => {
  const test_script = document.createElement('script')
  test_script.src = 'https://cdn.usefathom.com/script.js'
  test_script.onload = () => {
    document.cookie = 'block_fathom=false; path=/'
  }
  test_script.onerror = () => {
    document.cookie = 'block_fathom=true; path=/'
  }
  document.head.appendChild(test_script)
})
