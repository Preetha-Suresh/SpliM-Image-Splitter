import React, {useState} from 'react';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import './App.css';

function App(){

  const[file,setFile]=useState(null);
  const[splitImages,setSplitImages]=useState([]);
  const[numParts,setNumParts]=useState(2);
  const[splitDir,setSplitDir]=useState("vertical");

  const splitImg=(image,numParts,direction)=>{
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');

    const partWidth=direction==='vertical'?image.width/numParts:image.width;
    const partHeight=direction==='horizontal'?image.height/numParts:image.height;

    canvas.width=partWidth;
    canvas.height=partHeight;

    const blobs=[];

    for(let i=0;i<numParts;i++){
      if(direction==='vertical'){
        ctx.drawImage(image,-i*partWidth,0);
      }
      else{
        ctx.drawImage(image,0,-i*partHeight);
      }
      const dataUrl=canvas.toDataURL('image/png');
      blobs.push(dataUrl);

    }
    setSplitImages(blobs);
  };

  const handleSplit=()=>{
    if(!file) return alert("Please attach a file to proceed");

    const reader=new FileReader();
    reader.onload=(e)=>{
      const image=new Image();
      image.onload=()=>{
        splitImg(image,numParts,splitDir);
      };
      image.src=e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    splitImages.forEach((dataUrl, idx) => {
      const base64 = dataUrl.split(',')[1];
      zip.file(`part-${idx + 1}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'split-images.zip');
  };

  return(
   <div className="app-container">
      <h2 class="fw-bolder">SpliM</h2>

      <div class="file-upload-wrapper">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
      <br /><br />

      <label class="fw-bolder">Number of parts: </label>
      <input
        type="number"
        min="1"
        value={numParts}
        onChange={(e) => setNumParts(parseInt(e.target.value))}
      />
      <br /><br />

      <label class="fw-bolder">Split Direction:</label>
      <div className="button-group">
        <button
          className={splitDir === "vertical" ? "selected" : ""}
          onClick={() => setSplitDir("vertical")}
        >
          Vertical
        </button>
        <button
          className={splitDir === "horizontal" ? "selected" : ""}
          onClick={() => setSplitDir("horizontal")}
        >
          Horizontal
        </button>
      </div>

      <br />
      <button className="split-btn" onClick={handleSplit}>Split Image</button>

      {splitImages.length > 0 && (
        <>
          <h3>Split Parts:</h3>
          <div className="image-preview">
            {splitImages.map((src, i) => (
              <div key={i} className="image-box">
                <img src={src} alt={`part-${i}`} />
                <a href={src} download={`part-${i + 1}.png`}>Download</a>
              </div>
            ))}
          </div>

          <button className="download-all-btn" onClick={downloadAll}>Download All as ZIP</button>
        </>
      )}
    </div>
  );
}
export default App;