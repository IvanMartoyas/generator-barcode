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
      currentCanvas = document.createElement('canvas');
      currentCanvas.width = dim;
      currentCanvas.height = dim;
      currentCanvas.style.display = 'block';
      currentCanvas.style.margin = '0 auto';
      canvasContainer.appendChild(currentCanvas);
      
      const ctx = currentCanvas.getContext('2d');

      if (typeof QRCode !== 'undefined') {
        let success = false;

        // Пытаемся метод 1: toCanvas
        if (typeof QRCode.toCanvas === 'function') {
          try {
            QRCode.toCanvas(currentCanvas, text, {
              width: dim,
              height: dim,
              margin: 2,
              errorCorrectionLevel: QRCode.CorrectLevel.M
            });
            success = true;
          } catch (e) { console.error("toCanvas failed", e); }
        }

        // Если не получилось, пробуем метод 2: toDataURL
        if (!success && typeof QRCode.toDataURL === 'function') {
          try {
            const dataUrl = QRCode.toDataURL(text, {
              errorCorrectionLevel: QRCode.CorrectLevel.M,
              margin: 2,
              width: dim,
              height: dim
            });
            const img = new Image();
            img.onload = function() {
              ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
            success = true;
          } catch (e) { console.error("toDataURL failed", e); }
        }

        // Если не получилось, пробуем метод 3: Конструктор
        if (!success) {
          try {
            new QRCode(currentCanvas, {
              text: text,
              width: dim,
              height: dim,
              margin: 2,
              errorCorrectionLevel: QRCode.CorrectLevel.M
            });
            success = true;
          } catch (e) { console.error("Constructor failed", e); }
        }

        if (!success) {
          throw new Error("Не удалось отобразить QR-код. Возможно, библиотека qrcode.min.js повреждена или не поддерживает эти методы.");
        }
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
