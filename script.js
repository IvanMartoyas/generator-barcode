const sharedTextInput = document.getElementById('shared-text');
const barcodeType = document.getElementById('barcode-type');
const barcodeSize = document.getElementById('barcode-size');
const btnPrint = document.getElementById('btn-print');

const previewArea = document.getElementById('preview-area');
const canvasContainer = document.getElementById('barcode-canvas-container');

let currentCanvas = null;

function generate() {
  const text = sharedTextInput.value.trim();
  
  // Очищаем контейнер
  canvasContainer.innerHTML = '';
  
  if (!text) {
    canvasContainer.innerHTML = '<p class="preview__placeholder">Введите текст для генерации</p>';
    currentCanvas = null;
    return;
  }

  const size = barcodeSize.value;
  const type = barcodeType.value;

  try {
    if (type === "CODE128") {
      const height = size === 's' ? 120 : size === 'm' ? 200 : 300;
      currentCanvas = document.createElement('canvas');
      
      currentCanvas.draggable = true;
      currentCanvas.addEventListener('dragstart', (e) => {
        const dataUrl = currentCanvas.toDataURL();
        e.dataTransfer.setData('text/uri', dataUrl);
        e.dataTransfer.effectAllowed = 'copy';
      });

      currentCanvas.style.display = 'block';
      currentCanvas.style.margin = '0 auto';
      canvasContainer.appendChild(currentCanvas);

      JsBarcode(currentCanvas, text, {
        height: height,
        displayValue: true,
        margin: 10,
        fontSize: 16
      });
    } else if (type === "QR") {
      const dim = size === 's' ? 160 : size === 'm' ? 220 : 300;
      
      if (typeof QRCode !== 'undefined') {
        new QRCode(canvasContainer, {
          text: text,
          width: dim,
          height: dim,
          margin: 2,
          errorCorrectionLevel: QRCode.CorrectLevel.M
        });
        
        // Ждем отрисовки QR-кода
        setTimeout(() => {
          const generated = canvasContainer.querySelector('canvas') || canvasContainer.querySelector('img');
          if (generated) {
            currentCanvas = generated;
            currentCanvas.draggable = true;
            currentCanvas.addEventListener('dragstart', (e) => {
              const dataUrl = currentCanvas.tagName === 'IMG' ? currentCanvas.src : currentCanvas.toDataURL();
              e.dataTransfer.setData('text/uri', dataUrl);
              e.dataTransfer.effectAllowed = 'copy';
            });
          }
        }, 100);
      } else {
        throw new Error("Библиотека QR Code не загружена.");
      }
    }
  } catch (e) {
    console.error("Ошибка генерации:", e);
    canvasContainer.innerHTML = `<p class="preview__placeholder" style="color: red;">Ошибка: ${e.message}</p>`;
  }
}

sharedTextInput.addEventListener('input', generate);
barcodeType.addEventListener('change', generate);
barcodeSize.addEventListener('change', generate);

btnPrint.addEventListener('click', () => {
  if (currentCanvas) {
    window.print();
  } else {
    alert('Сначала введите данные для генерации');
  }
});

window.onload = generate;
