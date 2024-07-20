import { Component, AfterViewInit, HostListener } from '@angular/core';
import {
  PARTICLE_COUNT,
  PARTICLE_SIZE_MIN,
  PARTICLE_SIZE_VARIATION,
  PARTICLE_VELOCITY_MIN,
  PARTICLE_VELOCITY_MAX,
  MOUSE_EFFECT_RADIUS,
  MOUSE_EFFECT_FORCE,
  PARTICLE_COLOR,
} from './particles.constants';

interface Particle {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

@Component({
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  standalone: true,
  styleUrls: ['./particles.component.css'],
})
export class ParticlesComponent implements AfterViewInit {
  particles: Particle[] = [];
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  offscreenCanvas!: HTMLCanvasElement;
  offscreenCtx!: CanvasRenderingContext2D | null;
  mouseX = -1000;
  mouseY = -1000;

  ngAfterViewInit() {
    this.setupCanvas();
    this.initializeParticles(PARTICLE_COUNT);
    this.startAnimation();
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  setupCanvas() {
    this.canvas = document.getElementById(
      'particles-canvas',
    ) as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d') ?? null;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d') ?? null;

    if (!this.canvas || !this.ctx || !this.offscreenCtx) {
      console.error('Canvas or context not available');
      return;
    }

    this.resizeCanvas();
  }

  initializeParticles(count: number) {
    this.particles = Array.from({ length: count }, () => this.createParticle());
  }

  createParticle(): Particle {
    const { width, height } = this.canvas;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * PARTICLE_SIZE_VARIATION + PARTICLE_SIZE_MIN,
      velocityX:
        Math.random() * (PARTICLE_VELOCITY_MAX - PARTICLE_VELOCITY_MIN) +
        PARTICLE_VELOCITY_MIN,
      velocityY:
        Math.random() * (PARTICLE_VELOCITY_MAX - PARTICLE_VELOCITY_MIN) +
        PARTICLE_VELOCITY_MIN,
    };
  }

  startAnimation() {
    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateParticles() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const mouseEffectRadiusSquared = MOUSE_EFFECT_RADIUS * MOUSE_EFFECT_RADIUS;

    for (const p of this.particles) {
      p.x = (p.x + p.velocityX + width) % width;
      p.y = (p.y + p.velocityY + height) % height;

      const dx = p.x - this.mouseX;
      const dy = p.y - this.mouseY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < mouseEffectRadiusSquared) {
        const distance = Math.sqrt(distanceSquared);
        const angle = Math.atan2(dy, dx);
        const force = (MOUSE_EFFECT_RADIUS - distance) / MOUSE_EFFECT_RADIUS;
        p.velocityX += force * Math.cos(angle) * MOUSE_EFFECT_FORCE;
        p.velocityY += force * Math.sin(angle) * MOUSE_EFFECT_FORCE;
      }
    }
  }

  renderParticles() {
    const { ctx, offscreenCtx, canvas, offscreenCanvas } = this;
    if (!ctx || !offscreenCtx) return;

    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    for (const p of this.particles) {
      offscreenCtx.beginPath();
      offscreenCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      offscreenCtx.fillStyle = PARTICLE_COLOR;
      offscreenCtx.fill();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
  }

  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (this.canvas && this.offscreenCanvas) {
      this.canvas.width = this.offscreenCanvas.width = window.innerWidth;
      this.canvas.height = this.offscreenCanvas.height = window.innerHeight;
    }
  }
}
