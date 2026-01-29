'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type RaysOrigin =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left';

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

const DEFAULT_COLOR = '#ffffff';

const getOriginPosition = (origin: RaysOrigin) => {
  switch (origin) {
    case 'top-left':
      return '0% 0%';
    case 'top-right':
      return '100% 0%';
    case 'left':
      return '0% 50%';
    case 'right':
      return '100% 50%';
    case 'bottom-left':
      return '0% 100%';
    case 'bottom-center':
      return '50% 100%';
    case 'bottom-right':
      return '100% 100%';
    default:
      return '50% 0%'; // top-center
  }
};

const LightRays: React.FC<LightRaysProps> = ({
  raysOrigin = 'top-center',
  raysColor = DEFAULT_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.1,
  className = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 0 });

  React.useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse]);

  const originPos = getOriginPosition(raysOrigin);
  const [originX, originY] = originPos.split(' ');

  // Calculate interactive origin based on mouse influence
  const displayX = followMouse
    ? `calc(${originX} + (${mousePos.x}% - ${originX}) * ${mouseInfluence})`
    : originX;
  const displayY = followMouse
    ? `calc(${originY} + (${mousePos.y}% - ${originY}) * ${mouseInfluence})`
    : originY;

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-none relative h-full w-full overflow-hidden opacity-30 mix-blend-screen',
        className
      )}
      style={
        {
          filter: `saturate(${saturation})`,
          '--rays-color': raysColor,
          '--rays-speed': `${10 / raysSpeed}s`,
          '--ray-length': `${rayLength * 50}%`,
          '--light-spread': `${lightSpread * 40}deg`,
          '--fade-distance': `${fadeDistance * 100}%`,
        } as React.CSSProperties
      }
    >
      <style jsx>{`
        .rays-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          mask-image: radial-gradient(
            circle at ${displayX} ${displayY},
            black 0%,
            transparent var(--fade-distance)
          );
        }

        .ray {
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          transform-origin: ${displayX} ${displayY};
          background: conic-gradient(
            from 180deg at ${displayX} ${displayY},
            transparent 0deg,
            var(--rays-color) calc(180deg - var(--light-spread)),
            var(--rays-color) 180deg,
            var(--rays-color) calc(180deg + var(--light-spread)),
            transparent 360deg
          );
          opacity: 0.15;
          animation: rotate var(--rays-speed) linear infinite;
        }

        .ray:nth-child(2) {
          animation-delay: calc(var(--rays-speed) * -0.3);
          opacity: 0.1;
          filter: blur(20px);
        }

        .ray:nth-child(3) {
          animation-delay: calc(var(--rays-speed) * -0.7);
          opacity: 0.05;
          filter: blur(40px);
        }

        ${pulsating
          ? `
          .rays-container {
            animation: pulse 4s ease-in-out infinite;
          }
        `
          : ''}

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
      <div className="rays-container">
        <div className="ray" />
        <div className="ray" />
        <div className="ray" />
      </div>

      {/* Aesthetic overlay for smoother blending */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${displayX} ${displayY}, var(--rays-color) 0%, transparent 60%)`,
          opacity: 0.1,
        }}
      />
    </div>
  );
};

export default LightRays;
