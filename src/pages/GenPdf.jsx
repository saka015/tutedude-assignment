import  { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

const MyComponent = () => {
  const [name, setName] = useState('');

  const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
      match.toUpperCase()
    );

  const generatePDF = async () => {
    const existingPdfBytes = await fetch('./cert.pdf').then((res) =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const fontBytes = await fetch('./Sanchez-Regular.ttf').then((res) =>
      res.arrayBuffer()
    );

    const SanChezFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText(capitalize(name), {
      x: 300,
      y: 270,
      size: 58,
      font: SanChezFont,
      color: rgb(0.2, 0.84, 0.67),
    });

    const pdfBytes = await pdfDoc.save();

    var file = new File(
      [pdfBytes],
      'Padhega India Subscription Certificate.pdf',
      {
        type: 'application/pdf;charset=utf-8',
      }
    );
    saveAs(file);
  };

  const handleSubmit = () => {
    const val = capitalize(name);

    if (val.trim() !== '') {
      generatePDF(val);
    }
  };

  return (
    <div>
      <label htmlFor="name">Type Your Name</label>
      <input
        required
        type="text"
        name="Name"
        autoComplete="name"
        placeholder="Accha Baccha"
        id="name"
        minLength="3"
        maxLength="16"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSubmit}>Get Certificate</button>
    </div>
  );
};

export default MyComponent;