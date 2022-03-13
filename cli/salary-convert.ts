import fs from 'fs'
import crypto from 'crypto'

interface Salary {
  year: number,
  baseStart: number,
  baseEnd: number | null,
  bonus: number | null,
  image: Blob | null
}

const salaryString = fs.readFileSync('./data/salary.json')
const salary: [Salary] = JSON.parse(salaryString.toString())

// TODO: set images

const keyString = process.env.SALARY_ENC_KEY
if (keyString === undefined) {
  console.log('set 32byte SALARY_ENC_KEY')
  process.exit()
}
const key = Buffer.from(keyString)
const algorithm = 'aes-256-gcm'
const delimiter = '$'
const iv = crypto.randomBytes(16)
const cipher = crypto.createCipheriv(algorithm, key, iv)
const encrypted = cipher.update(JSON.stringify(salary), 'utf8', 'base64') + cipher.final('base64')
const ivWithEncrypted = iv.toString('base64') + delimiter + encrypted

fs.writeFileSync('./public/salary/data/encrypted.json', JSON.stringify({
  data: ivWithEncrypted
}))
console.log('done')