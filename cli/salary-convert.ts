import fs from 'fs'
const webcrypto = require('crypto').webcrypto

interface Salary {
  year: number,
  baseStart: number,
  baseEnd: number | null,
  bonus: number | null,
  image: Blob | null
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

const main = async () => {
  const salaryString = fs.readFileSync('./data/salary.json')
  const salary: [Salary] = JSON.parse(salaryString.toString())

  // TODO: set images

  const key = process.env.SALARY_ENC_KEY
  if (key === undefined) {
    console.log('set 32byte SALARY_ENC_KEY')
    process.exit()
  }
  const data = JSON.stringify(salary)
  const ivWithEncrypted = await aesEncrypt(key, data)

  fs.writeFileSync('./public/salary/data/encrypted.json', JSON.stringify(
    ivWithEncrypted
  ))
  console.log('done')
}
main()