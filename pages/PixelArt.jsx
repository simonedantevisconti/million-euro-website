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
        <h1 className="mb-2">Pixel Art</h1>
        <p className="text-muted mb-4">Try to make your pixel art!</p>

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

      {/* Pixel Gallery */}
      <div className="container my-5 text-center">
        <h1 className="my-4">Pixel Gallery</h1>

        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100">
              <img src="1.png" className="card-img-top" alt="Pixel Art 1" />
              <div className="card-body">
                <h5 className="card-title">Penguin</h5>
                <p className="card-text">This penguin is made with 63 pixels</p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="2.png" className="card-img-top" alt="Pixel Art 2" />
              <div className="card-body">
                <h5 className="card-title">Fox</h5>
                <p className="card-text">This fox is made with 81 pixels</p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="3.png" className="card-img-top" alt="Pixel Art 3" />
              <div className="card-body">
                <h5 className="card-title">Dog</h5>
                <p className="card-text">This doggo is made with 72 pixels</p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="4.png" className="card-img-top" alt="Pixel Art 4" />
              <div className="card-body">
                <h5 className="card-title">Rocket</h5>
                <p className="card-text">This rocket is made with 25 pixels</p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="5.png" className="card-img-top" alt="Pixel Art 5" />
              <div className="card-body">
                <h5 className="card-title">Flag</h5>
                <p className="card-text">
                  This italian flag is made with 93 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="6.png" className="card-img-top" alt="Pixel Art 6" />
              <div className="card-body">
                <h5 className="card-title">Orca</h5>
                <p className="card-text">This orca is made with 228 pixels</p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="7.png" className="card-img-top" alt="Pixel Art 7" />
              <div className="card-body">
                <h5 className="card-title">Heart</h5>
                <p className="card-text">
                  This heart is made with 72 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="8.png" className="card-img-top" alt="Pixel Art 8" />
              <div className="card-body">
                <h5 className="card-title">Ice Cream</h5>
                <p className="card-text">
                  This ice cream is made with 280 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="9.png" className="card-img-top" alt="Pixel Art 9" />
              <div className="card-body">
                <h5 className="card-title">Emoji</h5>
                <p className="card-text">
                  This Emoji is made with 306 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="10.png" className="card-img-top" alt="Pixel Art 10" />
              <div className="card-body">
                <h5 className="card-title">Present</h5>
                <p className="card-text">
                  This present is made with 240 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="11.png" className="card-img-top" alt="Pixel Art 11" />
              <div className="card-body">
                <h5 className="card-title">Pokeball</h5>
                <p className="card-text">
                  This pokeball is made with 196 pixels
                </p>
              </div>
            </div>
          </div>

          <div className="col">
            <div className="card h-100">
              <img src="12.png" className="card-img-top" alt="Pixel Art 12" />
              <div className="card-body">
                <h5 className="card-title">Controller</h5>
                <p className="card-text">
                  This retro controller is made with 126 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PixelArt;
