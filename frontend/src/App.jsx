import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import cert from "./assets/cert.pdf";

const GenPdf = ({ name, course, date }) => {
  return null;
};

const App = () => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [date, setDate] = useState("");

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleSubmit = () => {
    const val = capitalize(name);
    const courseVal = capitalize(course);

    if (val.trim() !== "" && courseVal.trim() !== "" && date.trim() !== "") {
      const formattedDate = new Date(date)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace("-", /\//g);

      const generatePDF = async (name, course, date) => {
        const existingPdfBytes = await fetch(cert).then((res) =>
          res.arrayBuffer()
        );

        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        firstPage.drawText(val, {
          x: 230,
          y: 380,
          size: 54,
          color: rgb(0.8, 0.6, 0),
          font: await pdfDoc.embedFont("Helvetica-Bold"),
        });

        firstPage.drawText(
          `For successfully completing the Tutedude ${course}\nCourse on ${formattedDate}`,
          {
            x: 210,
            y: 330,
            size: 17,
            font: await pdfDoc.embedFont("Helvetica-Bold"),
            color: rgb(0, 0, 0),
          }
        );

        const pdfBytes = await pdfDoc.save();

        var file = new File([pdfBytes], `${name} ${course}'s Certificate.pdf`, {
          type: "application/pdf;charset=utf-8",
        });
        saveAs(file);
      };

      generatePDF(val, courseVal, formattedDate);
    }
  };

  return (
    <div>
      <nav className="text-2xl px-4 p-3 bg-teal-100 border font- text-left">
        TuteDude{" "}
      </nav>

      <div className="flex mx-12">
        <div className="flex-[7]   mx-3 mt-12 rounded-md flex flex-col justify-center">
          <h1 className="m-2 text-2xl ">Create Certificate</h1>
          <hr />
          <div className=" mt-10 ml-60 flex flex-col  justify-center w-[400px]">
            <input
              className="focus:outline-teal-100 border rounded-xl my-1 p-2 w-full"
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="focus:outline-teal-100 border rounded-xl my-1 p-2 w-full"
              type="text"
              name="course"
              placeholder="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
            <input
              className="focus:outline-teal-100 border rounded-xl my-1 p-2 w-full"
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="ml-56 flex justify-around  mt-4">
              <button
                className="px-3 p-1 rounded-md mx-3 bg-red-100 font-semibold hover:bg-red-200"
                onClick={() => {
                  setName("");
                  setCourse("");
                  setDate("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 p-1 rounded-md mx-3  bg-green-100 font-semibold hover:bg-green-200"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="flex-[3] border mx-3 mt-12 rounded-md flex justify-center">
          <h1 className="text-2xl ">Approve Requests</h1>
        </div>
      </div>
      <GenPdf name={name} course={course} date={date} />
    </div>
  );
};

export default App;
