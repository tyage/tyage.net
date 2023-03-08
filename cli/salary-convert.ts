import fs from 'fs'
const webcrypto = require('crypto').webcrypto

interface Salary {
  year: number,
  baseStart: number,
  baseEnd: number | null,
  bonus: number | null,
  total: number | null,
  image: string | null
}

const aesEncrypt = async (keyString: string, data: string) => {
  var key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyString),
    { name: 'AES-GCM' },
    true,
    ['encrypt']
  )
  const iv = webcrypto.getRandomValues(new Uint8Array(16))
  const algorithm = {
    name: 'AES-GCM',
    iv
  }
  const encrypted = await webcrypto.subtle.encrypt(algorithm, key,
    new TextEncoder().encode(data))
  return {
    encrypted: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  }
}
const aesDecrypt = async (keyString: string, iv: string, data: string) => {
  var key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyString),
    { name: 'AES-GCM' },
    true,
    ['decrypt']
  )
  const algorithm = {
    name: 'AES-GCM',
    iv: Buffer.from(iv, 'base64')
  }
  const decrypted = await webcrypto.subtle.decrypt(algorithm, key,
    Buffer.from(data, 'base64'))
  return new TextDecoder().decode(decrypted)
}

const dataFile = './data/salary.json'
const encryptedFile = './public/salary/data/encrypted.json'
const build = async (key: string) => {
  const salaryString = fs.readFileSync(dataFile)
  const salaries: [Salary] = JSON.parse(salaryString.toString())

  for (let salary of salaries) {
    const file = `./data/${salary.year}.png`
    if (fs.existsSync(file)) {
      salary.image = fs.readFileSync(`./data/${salary.year}.png`).toString('base64')
    } else {
      salary.image = null
    }
  }

  const data = JSON.stringify(salaries)
  const ivWithEncrypted = await aesEncrypt(key, data)

  fs.writeFileSync(encryptedFile, JSON.stringify(
    ivWithEncrypted
  ))
  console.log('done')
}
const restore = async (key: string) => {
  const ivWithEncrypted = JSON.parse(fs.readFileSync(encryptedFile).toString())

  const salaryString = await aesDecrypt(key, ivWithEncrypted.iv, ivWithEncrypted.encrypted)
  const salaries: [Salary] = JSON.parse(salaryString)

  // TODO: restore images
  for (let salary of salaries) {
    const file = `./data/${salary.year}.png`
    if (salary.image !== null && salary.image !== undefined) {
      fs.writeFileSync(file, Buffer.from(salary.image, 'base64'))
    }
  }

  fs.writeFileSync(dataFile, JSON.stringify(salaries, null, 2))
  console.log('done')
}

const main = async () => {
  const key = process.env.SALARY_ENC_KEY
  if (key === undefined) {
    console.log('set 32byte SALARY_ENC_KEY')
    process.exit()
  }
  const mode = process.argv[process.argv.length - 1]
  switch (mode) {
    case 'build':
      await build(key);
      break;
    case 'restore':
      await restore(key);
      break;
  }
}
main()