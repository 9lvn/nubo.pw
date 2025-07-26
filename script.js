const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");
const resultArea = document.getElementById("result-area");
const outputImage = document.getElementById("outputImage");
const downloadBtn = document.getElementById("downloadBtn");
dropArea.addEventListener("click", () => fileElem.click());
dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.classList.add("hover");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("hover");
});
dropArea.addEventListener("drop", e => {
  e.preventDefault();
  dropArea.classList.remove("hover");
  const file = e.dataTransfer.files[0];
  handleImage(file);
});
fileElem.addEventListener("change", e => {
  const file = e.target.files[0];
  handleImage(file);
});
document.addEventListener("paste", e => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf("image") !== -1) {
      const blob = item.getAsFile();
      handleImage(blob);
    }
  }
});
function handleImage(file) {
  if (!file || !file.type.startsWith("image")) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgBase64 = e.target.result;
    removeBackgroundReal(imgBase64);
  };
  reader.readAsDataURL(file);
}
async function removeBackgroundReal(base64) {
  try {
    const response = await fetch("/api/remove-bg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64: base64 }),
    });
    if (!response.ok) {
      const errorJson = await response.json();
      alert("Background removal failed:\n" + (errorJson.error || "Unknown error"));
      return;
    }
    const data = await response.json();
    showResult(data.image);
  } catch (error) {
    alert("An error occurred: " + error.message);
  }
}
function showResult(src) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const watermarkText = "https://nubo.pw/";
    ctx.font = `${Math.floor(canvas.width / 20)}px Segoe UI`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.atan(canvas.height / canvas.width));
    ctx.fillText(watermarkText, 0, 0);
    outputImage.src = canvas.toDataURL("image/png");
    resultArea.classList.remove("hidden");
  };
  img.src = src;
}
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = outputImage.src;
  link.download = "output.png";
  link.click();
});
