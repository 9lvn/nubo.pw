const uploadInput = document.getElementById('upload');
const originalImg = document.getElementById('originalImg');
const processedImg = document.getElementById('processedImg');
const revealer = document.getElementById('revealer');
const slider = document.getElementById('slider');
const imageWrapper = document.getElementById('imageWrapper');

let isDraggingSlider = false;
let isDraggingImage = false;
let offset = { x: 0, y: 0 };
let dragStart = { x: 0, y: 0 };

// Slider drag to reveal effect
slider.addEventListener('mousedown', e => {
  isDraggingSlider = true;
  e.stopPropagation();
});

window.addEventListener('mouseup', () => {
  isDraggingSlider = false;
  isDraggingImage = false;
});

window.addEventListener('mousemove', e => {
  if (isDraggingSlider) {
    const bounds = imageWrapper.getBoundingClientRect();
    const relX = e.clientX - bounds.left;
    slider.style.left = `${relX}px`;
    revealer.style.width = `${relX}px`;
  }

  if (isDraggingImage) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    imageWrapper.style.left = `${offset.x + dx}px`;
    imageWrapper.style.top = `${offset.y + dy}px`;
  }
});

// Enable dragging from anywhere on the imageWrapper
imageWrapper.addEventListener('mousedown', e => {
  isDraggingImage = true;
  offset = {
    x: imageWrapper.offsetLeft,
    y: imageWrapper.offsetTop
  };
  dragStart = { x: e.clientX, y: e.clientY };
  e.preventDefault();
});

// Ensure absolute positioning to drag freely
imageWrapper.style.position = 'absolute';
imageWrapper.style.left = '50%';
imageWrapper.style.top = '50%';
imageWrapper.style.transform = 'translate(-50%, -50%)';

uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    const base64 = evt.target.result;
    originalImg.src = base64;
    processedImg.src = '';
    removeBackground(base64);
  };
  reader.readAsDataURL(file);
});

async function removeBackground(base64) {
  const formData = new FormData();
  formData.append("image_file_b64", base64.split(",")[1]);
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": "EjACnuyhfgFhXjpnstv8EjT8",
    },
    body: formData
  });

  if (!response.ok) {
    alert("Remove.bg error: " + await response.text());
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  processedImg.src = url;
}
