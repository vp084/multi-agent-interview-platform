import { PDFParse } from "pdf-parse"
import fs from "fs"

const extractText = async (filepath) => {
    const buffer = fs.readFileSync(filepath)

    const pdf = new PDFParse({
        data: buffer
    })

    const result = await pdf.getText()
    return result.text
}

export default extractText;