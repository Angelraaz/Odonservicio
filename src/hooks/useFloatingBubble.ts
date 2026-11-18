import { useCallback, useEffect, useRef, useState } from 'react';

interface BubbleData {
  speedKmh: number;
  totalKm: number;
  partialKm: number;
  fuelPct: number;
  isNightMode: boolean;
}

export function useFloatingBubble(data: BubbleData) {
  const [isBubbleActive, setIsBubbleActive] = useState(false);
  const [bubbleError, setBubbleError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const dataRef = useRef<BubbleData>(data);
  dataRef.current = data;

  const drawBubbleCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { speedKmh, totalKm, partialKm, fuelPct, isNightMode } = dataRef.current;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = isNightMode ? '#050505' : '#000000';
    ctx.fillRect(0, 0, w, h);

    // Subtle circular / rounded badge border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(6, 6, w - 12, h - 12, 28);
    ctx.stroke();

    // Speed readout
    ctx.fillStyle = isNightMode ? '#E5E7EB' : '#FFFFFF';
    ctx.font = 'bold 74px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(speedKmh)}`, w / 2, 92);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('km/h', w / 2, 118);

    // Recessed Odometer Strip
    ctx.fillStyle = '#111318';
    ctx.beginPath();
    ctx.roundRect(24, 134, w - 48, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`${totalKm.toFixed(1)} km`, w / 2, 163);

    // Bottom line: Partial + Fuel
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 16px monospace';
    ctx.fillText(`Parcial ${partialKm.toFixed(2)} km  ·  Comb ${Math.round(fuelPct)}%`, w / 2, 206);
  }, []);

  const closeBubble = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsBubbleActive(false);
  }, []);

  const openBubble = useCallback(async () => {
    setBubbleError(null);

    try {
      // Option 1: Modern Document Picture-in-Picture API (Chrome Android / Desktop)
      const docPip = (window as unknown as {
        documentPictureInPicture?: {
          requestWindow: (opts: { width: number; height: number }) => Promise<Window>;
        };
      }).documentPictureInPicture;

      if (docPip) {
        const pipWin = await docPip.requestWindow({ width: 240, height: 220 });
        pipWindowRef.current = pipWin;
        pipWin.document.body.style.margin = '0';
        pipWin.document.body.style.background = dataRef.current.isNightMode ? '#050505' : '#000000';
        pipWin.document.body.style.color = '#ffffff';
        pipWin.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        pipWin.document.body.innerHTML = `
          <div id="bubble-root" style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;border:2px solid #3B82F6;border-radius:20px;text-align:center;">
            <div id="b-speed" style="font-size:48px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;">0</div>
            <div style="font-size:12px;color:#9CA3AF;margin-top:2px;">km/h</div>
            <div id="b-total" style="margin-top:10px;padding:6px 12px;background:#111318;border-radius:8px;font-family:monospace;font-size:16px;font-weight:700;">0,0 km</div>
            <div id="b-sub" style="margin-top:8px;font-size:11px;color:#9CA3AF;font-family:monospace;">Parcial 0,00 km · 100%</div>
          </div>
        `;
        pipWin.addEventListener('pagehide', () => {
          pipWindowRef.current = null;
          setIsBubbleActive(false);
        });
        setIsBubbleActive(true);
        return;
      }

      // Option 2: Universal Canvas-to-Video Picture-in-Picture fallback
      if (!canvasRef.current) {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 230;
        canvasRef.current = c;
      }
      drawBubbleCanvas();

      if (!videoRef.current) {
        const v = document.createElement('video');
        v.muted = true;
        v.playsInline = true;
        v.style.position = 'fixed';
        v.style.width = '1px';
        v.style.height = '1px';
        v.style.opacity = '0';
        v.style.pointerEvents = 'none';
        document.body.appendChild(v);
        v.addEventListener('leavepictureinpicture', () => {
          setIsBubbleActive(false);
        });
        videoRef.current = v;
      }

      const stream = (canvasRef.current as HTMLCanvasElement & {
        captureStream: (fps?: number) => MediaStream;
      }).captureStream(4);
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      if (typeof videoRef.current.requestPictureInPicture === 'function') {
        await videoRef.current.requestPictureInPicture();
        setIsBubbleActive(true);
        return;
      }

      setBubbleError(
        'Tu navegador actual bloqueó la ventana flotante; el contador seguirá activo en la burbuja dentro de la app.'
      );
    } catch {
      setBubbleError(
        'Para ver la burbuja sobre otras apps, abre esta app desde Chrome en Android o Safari en iOS e instálala.'
      );
    }
  }, [drawBubbleCanvas]);

  // Keep Picture-in-Picture bubble live-updated while active
  useEffect(() => {
    if (!isBubbleActive) return;

    const update = () => {
      const pipWin = pipWindowRef.current;
      if (pipWin && !pipWin.closed) {
        const s = pipWin.document.getElementById('b-speed');
        const t = pipWin.document.getElementById('b-total');
        const sub = pipWin.document.getElementById('b-sub');
        if (s) s.textContent = String(Math.round(dataRef.current.speedKmh));
        if (t) t.textContent = `${dataRef.current.totalKm.toFixed(1).replace('.', ',')} km`;
        if (sub)
          sub.textContent = `Parcial ${dataRef.current.partialKm.toFixed(2).replace('.', ',')} km · ${Math.round(
            dataRef.current.fuelPct
          )}%`;
      } else {
        drawBubbleCanvas();
      }
    };

    update();
    const id = window.setInterval(update, 400);
    return () => window.clearInterval(id);
  }, [isBubbleActive, drawBubbleCanvas]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.close();
      }
      if (videoRef.current) {
        videoRef.current.remove();
      }
    };
  }, []);

  return {
    isBubbleActive,
    bubbleError,
    openBubble,
    closeBubble,
  };
}
