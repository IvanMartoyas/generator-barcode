const sharedTextInput = document.getElementById('shared-text');
const barcodeType = document.getElementById('barcode-type');
const barcodeSize = document.getElementById('barcode-size');
const btnPrint = document.getElementById('btn-print');

const previewArea = document.getElementById('preview-area');
const canvasContainer = document.getElementById('barcode-canvas-container');
const placeholder = document.getElementById('placeholder-text');

let currentCanvas = null;

function generate() {
  const text = sharedTextInput.value.trim();
  
  if (!text) {
    placeholder.style.display = 'block';
    canvasContainer.innerHTML = '<p class="preview__placeholder">Введите текст для генерации</p>';
    return;
  }

  placeholder.style.display = 'none';
  
  // Очищаем контейнер
  canvasContainer.innerHTML = '';
  
  const size = barcodeSize.value;
  previewArea.className = `preview size-${size}`;

  const type = barcodeType.value;

  try {
    if (type === "CODE128") {
      const height = size === 's' ? 120 : size === 'm' ? 200 : 300;
      currentCanvas = document.createElement('canvas');
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
        // Используем конструктор QRCode. Он сам создаст canvas внутри контейнера.
        new QRCode(canvasContainer, {
          text: text,
          width: dim,
          height: dim,
          margin: 2,
          errorCorrectionLevel: QRCode.CorrectLevel.M
        });
        
        // Находим созданный канвас для функции печати
        currentCanvas = canvasContainer.querySelector('canvas') || canvasContainer.querySelector('img');
      } else {
        throw new Error("Библиотека QR Code не загружена. Проверьте путь в index.html");
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
