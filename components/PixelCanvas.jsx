import { useEffect, useMemo, useRef, useState, useCallback } from "react";

const CANVAS_SIZE = 1000; // coordinate logiche 0..999
const BLOCK = 10;

function makeKey(x, y) {
  return `${x},${y}`;
}

export default function PixelCanvas() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const packs = useMemo(
    () => ({
      10: { w: 10, h: 10, label: "10px" },
    }),
    []
  );

  const [packSize] = useState(10);
  const [color, setColor] = useState("#ff0000");

  const paintedRef = useRef(new Map()); // key "x,y" -> color

  const drawGrid = useCallback((ctx) => {
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
    const ctx = canvas.getContext("2d");

    // sfondo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // pixel colorati (sempre in coordinate logiche)
    for (const [key, c] of paintedRef.current.entries()) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = c;
      ctx.fillRect(x, y, 1, 1);
    }

    drawGrid(ctx);
  }, [drawGrid]);

  // Imposta risoluzione interna (con DPR) + dimensione CSS responsive
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const dpr = window.devicePixelRatio || 1;

    // quanto grande mostrarlo a schermo (CSS px)
    const cssSize = Math.min(wrapper.clientWidth, CANVAS_SIZE); // max 1000
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    // risoluzione reale (device px) per evitare blur
    canvas.width = Math.round(CANVAS_SIZE * dpr);
    canvas.height = Math.round(CANVAS_SIZE * dpr);

    const ctx = canvas.getContext("2d");
    // mappa coordinate logiche (0..1000) nello spazio fisico (x dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // importantissimo per pixel-art
    ctx.imageSmoothingEnabled = false;

    redraw();
  }, [redraw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // coordinate click corrette quando il canvas è scalato via CSS
  const getCellFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    // clamp per sicurezza
    return {
      x: Math.max(0, Math.min(CANVAS_SIZE - 1, x)),
      y: Math.max(0, Math.min(CANVAS_SIZE - 1, y)),
    };
  };

  const paintBlock = (startX, startY) => {
    const { w, h } = packs[packSize];

    const x0 = Math.floor(startX / BLOCK) * BLOCK;
    const y0 = Math.floor(startY / BLOCK) * BLOCK;

    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const x = x0 + xx;
        const y = y0 + yy;
        paintedRef.current.set(makeKey(x, y), color);
      }
    }

    redraw();
  };

  const handleClick = (e) => {
    const { x, y } = getCellFromEvent(e);
    paintBlock(x, y);
  };

  return (
    <div className="d-flex flex-column gap-3 align-items-center w-100">
      {/* Toolbar */}
      <div className="d-flex flex-wrap gap-3 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <label className="m-0">Colore:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => {
            paintedRef.current.clear();
            redraw();
          }}
        >
          Reset
        </button>
      </div>

      {/* Wrapper responsive */}
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
