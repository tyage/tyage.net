const base64ToUint8Array = (base64Str) => {
  const raw = atob(base64Str)
  return Uint8Array.from(Array.prototype.map.call(raw, (x) => {
    return x.charCodeAt(0)
  }))
}
const aesDecrypt = async (keyString, iv, data) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyString),
    { name: 'AES-GCM' },
    true,
    ['decrypt']
  )
  const algorithm = {
    name: 'AES-GCM',
    iv: base64ToUint8Array(iv)
  }
  const decrypted = await crypto.subtle.decrypt(algorithm, key,
    base64ToUint8Array(data))
  return new TextDecoder().decode(decrypted)
}
const buildSalaryTable = (salaries) => {
  const tbody = document.querySelector('#salary-table tbody')
  for (salary of salaries) {
    const tr = document.createElement('tr')
    const year = document.createElement('td')
    year.innerText = salary.year
    const baseStart = document.createElement('td')
    baseStart.innerText = salary.baseStart
    const baseEnd = document.createElement('td')
    baseEnd.innerText = salary.baseEnd
    const bonus = document.createElement('td')
    bonus.innerText = salary.bonus
    tr.appendChild(year)
    tr.appendChild(baseStart)
    tr.appendChild(baseEnd)
    tr.appendChild(bonus)
    tbody.appendChild(tr)
  }
}

const main = async () => {
  const key = location.hash.slice(1)
  const json = await ((await fetch('./data/encrypted.json')).text())
  const { iv, encrypted } = JSON.parse(json)
  let data
  try {
    const decrypted = await aesDecrypt(key, iv, encrypted)
    data = JSON.parse(decrypted)
  } catch {
    alert('wrong key')
  }
  buildSalaryTable(data)
}
main()