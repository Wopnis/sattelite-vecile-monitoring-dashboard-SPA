export function FileUploader({ onFiles }) {
  const wrap = document.createElement('div')

  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true

  input.onchange = e => {
    const files = Array.from(e.target.files)
    onFiles(files)
  }

  wrap.appendChild(input)
  return wrap
}
