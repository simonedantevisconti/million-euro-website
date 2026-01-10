import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const PixelArt = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  const packs = useMemo(
    () => ({
      10: { grid: 10, label: "10 x 10" },
      20: { grid: 20, label: "20 x 20" },
      40: { grid: 40, label: "40 x 40" },
    }),
    []
  );

  const [gridCount, setGridCount] = useState(10);
  const [color, setColor] = useState("#ff0000");
  const [canvasSize, setCanvasSize] = useState(600); // dimensione reale (px) del canvas

  // salvo per griglia
  const paintedRef = useRef(new Map());

  const cellSize = canvasSize / gridCount; // SEMPRE intero

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // sfondo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // celle colorate
    for (const [key, c] of paintedRef.current.entries()) {
      const [g, col, row] = key.split(",").map(Number);
      if (g !== gridCount) continue;

      ctx.fillStyle = c;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }

    // griglia
    ctx.strokeStyle = "#e6e6e6";
    // NOTA: con DPR attivo, lineWidth deve essere 1 / dpr (settato in setupCanvas)
    // qui non rimettere lineWidth = 1, altrimenti alcune linee possono sparire

    // allinea le linee al pixel
    // NOTA: con DPR attivo NON usare +0.5. Disegnare su coordinate intere.
    for (let i = 0; i <= gridCount; i++) {
      const p = i * cellSize;

      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(canvasSize, p);
      ctx.stroke();
    }
  }, [canvasSize, gridCount, cellSize]);

  const setupCanvas = useCallback(
    (nextSize) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;

      // Dimensione css
      canvas.style.width = `${nextSize}px`;
      canvas.style.height = `${nextSize}px`;

      // Dimensione reale interna con DPR
      canvas.width = Math.round(nextSize * dpr);
      canvas.height = Math.round(nextSize * dpr);

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      // IMPORTANTISSIMO: 1px "fisico" su qualsiasi DPR (evita linee mancanti)
      ctx.lineWidth = 1 / dpr;

      redraw();
    },
    [redraw]
  );

  // misura lo spazio disponibile e sceglie una size multipla di gridCount
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const max = Math.min(el.clientWidth, 800); // grandezza (800 max)
      // size multipla di gridCount
      const snapped = Math.max(
        gridCount,
        Math.floor(max / gridCount) * gridCount
      );

      setCanvasSize(snapped);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [gridCount]);

  // ogni volta che canvasSize cambia, reimposto canvas e ridisegna
  useEffect(() => {
    setupCanvas(canvasSize);
  }, [canvasSize, setupCanvas]);

  // ridisegno quando cambi griglia/colore (colore serve solo al click, ma ok)
  useEffect(() => {
    redraw();
  }, [gridCount, redraw]);

  const getCellFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // qui canvasSize == rect.width (quasi sempre uguale), ma teniamo robusto
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    return {
      col: Math.max(0, Math.min(gridCount - 1, col)),
      row: Math.max(0, Math.min(gridCount - 1, row)),
    };
  };

  const handleClick = (e) => {
    const { col, row } = getCellFromEvent(e);
    paintedRef.current.set(`${gridCount},${col},${row}`, color);
    redraw();
  };

  const handleReset = () => {
    for (const key of paintedRef.current.keys()) {
      const g = Number(key.split(",")[0]);
      if (g === gridCount) paintedRef.current.delete(key);
    }
    redraw();
  };

  return (
    <>
      <div className="container my-5 text-center">
        <h1 className="mb-4">Pixel Art</h1>

        {/* Toolbar */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <label className="m-0">Colore:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="m-0">Griglia:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 140 }}
              value={gridCount}
              onChange={(e) => setGridCount(Number(e.target.value))}
            >
              {Object.values(packs).map((v) => (
                <option key={v.grid} value={v.grid}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        {/* Canvas centrato */}
        <div className="d-flex justify-content-center">
          <div
            ref={wrapperRef}
            style={{
              width: "min(92vw, 900px)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleClick}
              style={{
                display: "block",
                border: "2px solid #000",
                cursor: "crosshair",
                imageRendering: "pixelated",
              }}
            />
          </div>
        </div>
      </div>

      <div className="container my-5 text-center">
        <div className="row">
          <h1 className="my-3">Pixel Gallery</h1>
          <div className="col-4"></div>
        </div>
      </div>
    </>
  );
};

export default PixelArt;
