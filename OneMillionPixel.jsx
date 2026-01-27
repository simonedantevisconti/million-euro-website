import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CANVAS_SIZE = 1000; // 1000x1000 = 1.000.000 pixel
const BLOCK = 1; // 1 = disegno 1 pixel per click (metti 10 se vuoi snap a 10x10)

function isLittleEndian() {
  const buf = new ArrayBuffer(4);
  const u32 = new Uint32Array(buf);
  const u8 = new Uint8Array(buf);
  u32[0] = 0x0a0b0c0d;
  return u8[0] === 0x0d;
}

function hexToRGBA32(hex, littleEndian) {
  // accetta "#RRGGBB"
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = 255;

  // Se scriviamo tramite Uint32Array view sul buffer di ImageData:
  // in little-endian i byte in memoria sono [R,G,B,A], ma il valore u32 va costruito come A<<24 | B<<16 | G<<8 | R
  if (littleEndian) return (a << 24) | (b << 16) | (g << 8) | r;
  // big-endian (rarissimo in browser moderni)
  return (r << 24) | (g << 16) | (b << 8) | a;
}

export default function PixelCanvas() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const [color, setColor] = useState("#ff0000");

  // Rendering backend
  const littleEndianRef = useRef(true);
  const imageDataRef = useRef(null); // ImageData 1000x1000
  const img32Ref = useRef(null); // Uint32Array view su imageData.data.buffer
  const offscreenRef = useRef(null); // canvas offscreen 1000x1000
  const offCtxRef = useRef(null);

  const WHITE32 = useMemo(() => {
    // inizializzato dopo la detection endianness, ma qui mettiamo placeholder
    return 0xffffffff;
  }, []);

  const drawGrid = useCallback((ctx) => {
    if (BLOCK < 5) return; // evita griglia fittissima quando BLOCK=1
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 1;

    for (let x = 0; x <= CANVAS_SIZE; x += BLOCK) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, CANVAS_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_SIZE; y += BLOCK) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(CANVAS_SIZE, y + 0.5);
      ctx.stroke();
    }
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const off = offscreenRef.current;
    const offCtx = offCtxRef.current;
    const imageData = imageDataRef.current;

    if (!canvas || !ctx || !off || !offCtx || !imageData) return;

    // Aggiorna l'offscreen con l'ImageData (1000x1000)
    offCtx.putImageData(imageData, 0, 0);

    // Disegna offscreen sul canvas principale (coordinate logiche 0..1000)
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0);

    // Griglia sopra
    drawGrid(ctx);
  }, [drawGrid]);

  const initBuffersOnce = useCallback(() => {
    // Endianness
    littleEndianRef.current = isLittleEndian();

    // ImageData 1000x1000
    const img = new ImageData(CANVAS_SIZE, CANVAS_SIZE);
    imageDataRef.current = img;

    // view u32 sul buffer RGBA
    const img32 = new Uint32Array(img.data.buffer);
    img32Ref.current = img32;

    // offscreen canvas
    const off = document.createElement("canvas");
    off.width = CANVAS_SIZE;
    off.height = CANVAS_SIZE;
    offscreenRef.current = off;

    const offCtx = off.getContext("2d", { willReadFrequently: false });
    offCtxRef.current = offCtx;
    offCtx.imageSmoothingEnabled = false;

    // fill bianco
    const white32 = hexToRGBA32("#ffffff", littleEndianRef.current);
    img32.fill(white32);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const dpr = window.devicePixelRatio || 1;

    // dimensione CSS (responsive)
    const cssSize = Math.min(wrapper.clientWidth, CANVAS_SIZE);
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    // risoluzione interna (device px) mantenendo coordinate logiche 0..1000
    canvas.width = Math.round(CANVAS_SIZE * dpr);
    canvas.height = Math.round(CANVAS_SIZE * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    redraw();
  }, [redraw]);

  useEffect(() => {
    initBuffersOnce();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [initBuffersOnce, resizeCanvas]);

  const getCellFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    return {
      x: Math.max(0, Math.min(CANVAS_SIZE - 1, x)),
      y: Math.max(0, Math.min(CANVAS_SIZE - 1, y)),
    };
  };

  const paintBlock = useCallback(
    (startX, startY) => {
      const img32 = img32Ref.current;
      if (!img32) return;

      const little = littleEndianRef.current;
      const c32 = hexToRGBA32(color, little);

      const x0 = Math.floor(startX / BLOCK) * BLOCK;
      const y0 = Math.floor(startY / BLOCK) * BLOCK;

      const w = BLOCK; // pennello = BLOCK x BLOCK (se BLOCK=1, è 1 pixel) se il blocco invece 
      const h = BLOCK;

      for (let yy = 0; yy < h; yy++) {
        const y = y0 + yy;
        if (y < 0 || y >= CANVAS_SIZE) continue;
        let row = y * CANVAS_SIZE;

        for (let xx = 0; xx < w; xx++) {
          const x = x0 + xx;
          if (x < 0 || x >= CANVAS_SIZE) continue;
          img32[row + x] = c32;
        }
      }

      redraw();
    },
    [color, redraw]
  );

  const handleClick = (e) => {
    const { x, y } = getCellFromEvent(e);
    paintBlock(x, y);
  };

  const handleReset = () => {
    const img32 = img32Ref.current;
    if (!img32) return;
    const white32 = hexToRGBA32("#ffffff", littleEndianRef.current);
    img32.fill(white32);
    redraw();
  };

  return (
    <div className="d-flex flex-column gap-3 align-items-center w-100">
      <div className="d-flex flex-wrap gap-3 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <label className="m-0">Colore:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <button className="btn btn-sm btn-outline-danger" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          maxWidth: 1000,
          aspectRatio: "1 / 1",
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            border: "2px solid #000",
            cursor: "crosshair",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}
