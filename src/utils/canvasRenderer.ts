/**
 * Generates realistic high-contrast workshop photo assets for seed data and previews.
 * All images are created via Canvas with industrial detail (rulers, stamps, contrast, lighting).
 */

export function generateIndustrialPhotoDataUrl(
  title: string,
  projectTag: string,
  stageCode: string,
  theme: 'rotor' | 'nameplate' | 'journal' | 'ndt' | 'balance' | 'casing' | 'dispatch'
): string {
  const width = 800;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - Workshop concrete / steel bench gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  if (theme === 'ndt') {
    bg.addColorStop(0, '#05070a');
    bg.addColorStop(1, '#0b1320');
  } else {
    bg.addColorStop(0, '#1e2430');
    bg.addColorStop(1, '#11151c');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Workshop grid / shadow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw Subject based on theme
  if (theme === 'nameplate') {
    // Industrial metal brass/aluminum stamped nameplate
    ctx.fillStyle = '#b0b7c3';
    ctx.beginPath();
    ctx.roundRect(140, 120, 520, 340, 10);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Rivets
    ctx.fillStyle = '#334155';
    [[160, 140], [640, 140], [160, 440], [640, 440]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stamped plate header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('TURBOMACHINERY CORP - SERIAL TAG', 170, 175);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`JOB REF:    ${projectTag}`, 170, 225);
    ctx.fillText(`MODEL:      TRB-680-HP5`, 170, 265);
    ctx.fillText(`RPM:        3,600 / 5,400 MAX`, 170, 305);
    ctx.fillText(`STAGE:      ${stageCode}`, 170, 345);
    ctx.fillText(`INSPECTED:  WORKSHOP BAY 4`, 170, 385);
    ctx.fillText(`ASSET ID:   ISO-9001 VERIFIED`, 170, 425);
  } else if (theme === 'journal') {
    // Precision Ground Steel Journal Shaft with lighting reflection
    const shaftGrad = ctx.createLinearGradient(100, 180, 700, 420);
    shaftGrad.addColorStop(0, '#334155');
    shaftGrad.addColorStop(0.3, '#94a3b8');
    shaftGrad.addColorStop(0.5, '#f8fafc');
    shaftGrad.addColorStop(0.7, '#64748b');
    shaftGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = shaftGrad;
    ctx.beginPath();
    ctx.roundRect(120, 190, 560, 220, 8);
    ctx.fill();

    // Oil journal lubrication hole
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(400, 300, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Steel inspection ruler
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(150, 430, 500, 28);
    ctx.fillStyle = '#0f172a';
    ctx.font = '10px monospace';
    for (let i = 0; i < 500; i += 20) {
      ctx.fillRect(150 + i, 430, 1.5, 12);
      if (i % 40 === 0) {
        ctx.fillText(`${i / 10}`, 150 + i - 4, 452);
      }
    }
  } else if (theme === 'ndt') {
    // Fluorescent Magnetic Particle / Dye Penetrant under UV
    ctx.fillStyle = '#020617';
    ctx.fillRect(80, 100, 640, 380);

    // Shaft curvature
    const uvGrad = ctx.createRadialGradient(400, 280, 50, 400, 280, 300);
    uvGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    uvGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
    ctx.fillStyle = uvGrad;
    ctx.fillRect(80, 100, 640, 380);

    // Glowing fluorescent indications (UV dye)
    ctx.strokeStyle = '#22c55e';
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 18;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(310, 270);
    ctx.bezierCurveTo(340, 250, 370, 280, 410, 260);
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(480, 290, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  } else if (theme === 'balance') {
    // Dynamic balancing machine screen
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(100, 100, 600, 380, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Polar vector diagram
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.beginPath();
    ctx.arc(280, 280, 110, 0, Math.PI * 2);
    ctx.arc(280, 280, 70, 0, Math.PI * 2);
    ctx.arc(280, 280, 30, 0, Math.PI * 2);
    ctx.moveTo(170, 280);
    ctx.lineTo(390, 280);
    ctx.moveTo(280, 170);
    ctx.lineTo(280, 390);
    ctx.stroke();

    // Balancing vector needle
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 280);
    ctx.lineTo(340, 230);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(340, 230, 5, 0, Math.PI * 2);
    ctx.fill();

    // Balancing readings
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('DYNAMIC BALANCING - ISO 1940', 420, 160);
    ctx.fillStyle = '#22c55e';
    ctx.font = '16px monospace';
    ctx.fillText('PLANE 1: 0.42 g @ 42° (PASS)', 420, 210);
    ctx.fillText('PLANE 2: 0.38 g @ 184° (PASS)', 420, 245);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText('LIMIT:   G1.0 (0.85 g max)', 420, 290);
    ctx.fillText('SPEED:   3,000 RPM', 420, 325);
    ctx.fillText('STATUS:  BALANCED OK', 420, 360);
  } else if (theme === 'dispatch') {
    // Preservation coating and shipping skid
    ctx.fillStyle = '#b45309'; // wood crate
    ctx.fillRect(100, 380, 600, 80);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 380, 600, 80);

    // Wrapped rotor
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(140, 200, 520, 170, 16);
    ctx.fill();

    // Tie down straps
    ctx.fillStyle = '#eab308';
    ctx.fillRect(240, 190, 24, 200);
    ctx.fillRect(440, 190, 24, 200);
    ctx.fillRect(580, 190, 24, 200);

    // QA Approved Green Tag
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(470, 220, 160, 90, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('FINAL QA PASSED', 485, 250);
    ctx.font = '11px monospace';
    ctx.fillText('READY FOR DISPATCH', 485, 275);
    ctx.fillText(projectTag, 485, 295);
  } else {
    // Default Rotor / Compressor Impeller Blading
    const rotorGrad = ctx.createLinearGradient(80, 300, 720, 300);
    rotorGrad.addColorStop(0, '#475569');
    rotorGrad.addColorStop(0.5, '#cbd5e1');
    rotorGrad.addColorStop(1, '#334155');
    ctx.fillStyle = rotorGrad;
    ctx.fillRect(80, 270, 640, 60);

    // Blade disks
    for (let d = 0; d < 5; d++) {
      const dx = 200 + d * 85;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(dx, 300, 20, 90 + d * 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Industrial Overlay Banner (Watermark stamp)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, height - 70, width, 70);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`SNAPs // ${projectTag} // ${stageCode}`, 20, height - 42);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '12px sans-serif';
  ctx.fillText(title, 20, height - 18);

  // Time & Verification Stamp
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('TIMESTAMP: 2026-10-17 WORKSHOP BAY-2', width - 20, height - 42);
  ctx.fillText('AUTHENTICATED REPAIR PHOTO', width - 20, height - 18);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/jpeg', 0.88);
}
