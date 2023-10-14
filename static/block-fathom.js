window.addEventListener('load', () => {
  let block_fathom = document.cookie
    .split('; ')
    .find(row => row.startsWith('block_fathom='))
  if (!block_fathom) {
    document.cookie = 'block_fathom=true; path=/; SameSite=Strict;'
  }

  const test_script = document.createElement('script')
  test_script.src = 'https://cdn.usefathom.com/script.js'
  test_script.onload = () => {
    document.cookie = 'block_fathom=false; path=/; SameSite=Strict;'
  }
  test_script.onerror = () => {
    document.cookie = 'block_fathom=true; path=/; SameSite=Strict;'
  }
  document.head.appendChild(test_script)
})
