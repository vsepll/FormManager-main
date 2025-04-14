import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const form = new IncomingForm()
  form.uploadDir = path.join(process.cwd(), 'public', 'uploads')
  form.keepExtensions = true

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true })
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    if (!files.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file = files.file[0]
    const newFilename = `${Date.now()}_${file.originalFilename}`
    const newPath = path.join(form.uploadDir, newFilename)

    await fs.promises.rename(file.filepath, newPath)

    const fileUrl = `/uploads/${newFilename}`

    res.status(200).json({ 
      message: 'File uploaded successfully', 
      fileUrl: fileUrl 
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({ message: 'Error uploading file' })
  }
}