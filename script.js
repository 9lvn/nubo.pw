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
    removeBackgroundReal(imgBase64, file.name);
  };
  reader.readAsDataURL(file);
}

async function removeBackgroundReal(base64, fileName = "image.png") {
  const base64Data = base64.split(',')[1];
  const formData = new FormData();
  formData.append("image_file_b64", base64Data);
  formData.append("size", "auto");

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": "EjACnuyhfgFhXjpnstv8EjT8",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert("Background removal failed:\n" + errorText);
      return;
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    showResult(objectURL);

  } catch (error) {
    alert("An error occurred: " + error.message);
  }
}

function showResult(src) {
  outputImage.src = src;
  resultArea.classList.remove("hidden");
}

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = outputImage.src;
  link.download = "output.png";
  link.click();
});
