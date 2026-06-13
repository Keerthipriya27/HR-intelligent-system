import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// ─── 3D Shapes ───

function FloatingCube({
  size = 60,
  color = 'rgba(124,58,237,0.08)',
  borderColor = 'rgba(124,58,237,0.15)',
  speed = 0.3,
  initialX = 0,
  initialY = 0,
  delay = 0,
}: {
  size?: number;
  color?: string;
  borderColor?: string;
  speed?: number;
  initialX?: number;
  initialY?: number;
  delay?: number;
}) {
  const rotX = useRef(Math.random() * 360);
  const rotY = useRef(Math.random() * 360);
  const rotZ = useRef(Math.random() * 360);

  const half = size / 2;
  const faceTransforms = [
    { rotate: '', translateZ: half },
    { rotate: 'rotateY(180deg)', translateZ: half },
    { rotate: 'rotateY(90deg)', translateZ: half },
    { rotate: 'rotateY(-90deg)', translateZ: half },
    { rotate: 'rotateX(90deg)', translateZ: half },
    { rotate: 'rotateX(-90deg)', translateZ: half },
  ];

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        perspective: 800,
        width: size,
        height: size,
      }}
      animate={{
        x: [0, 20, -15, 10, 0],
        y: [0, -10, 15, -5, 0],
      }}
      transition={{
        duration: 12 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <motion.div
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: [rotX.current, rotX.current + 360],
          rotateY: [rotY.current, rotY.current + 360],
          rotateZ: [rotZ.current, rotZ.current + 360],
        }}
        transition={{ duration: 20 / speed, repeat: Infinity, ease: 'linear' }}
      >
        {faceTransforms.map((face, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              background: color,
              border: `1px solid ${borderColor}`,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              transform: `${face.rotate} translateZ(${face.translateZ}px)`,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function FloatingOctahedron({
  size = 50,
  color = 'rgba(14,165,233,0.06)',
  borderColor = 'rgba(14,165,233,0.12)',
  initialX = 0,
  initialY = 0,
  delay = 0,
}: {
  size?: number;
  color?: string;
  borderColor?: string;
  initialX?: number;
  initialY?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        perspective: 600,
        transformStyle: 'preserve-3d',
        width: size,
        height: size,
      }}
      animate={{
        rotateX: [0, 360],
        rotateY: [0, 360],
        rotateZ: [0, 360],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
          border: `1px solid ${borderColor}`,
          borderRadius: '30%',
          transform: 'rotateX(45deg) rotateY(45deg)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 70% 70%, ${color}, transparent)`,
          border: `1px solid ${borderColor}`,
          borderRadius: '30%',
          transform: 'rotateX(135deg) rotateY(45deg)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          opacity: 0.6,
        }}
      />
    </motion.div>
  );
}

// ─── Data Particles ───

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  shape: 'circle' | 'bar' | 'diamond' | 'data';
}

function DataParticles() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    for (let i = 0; i < 35; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 15 + 10,
        opacity: Math.random() * 0.3 + 0.05,
        shape: (['circle', 'bar', 'diamond', 'data'] as const)[Math.floor(Math.random() * 4)],
      });
    }
    return items;
  }, []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.shape === 'bar' ? p.size * 2 : p.size,
            height: p.size,
            opacity: p.opacity,
            background:
              p.shape === 'diamond'
                ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(14,165,233,0.2))'
                : p.shape === 'bar'
                ? 'linear-gradient(180deg, rgba(124,58,237,0.15), transparent)'
                : p.shape === 'data'
                ? 'rgba(16,185,129,0.15)'
                : 'rgba(124,58,237,0.12)',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '2px',
            transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.id * 0.3,
          }}
        />
      ))}
    </>
  );
}

// ─── Floating Data Elements (charts, bars, grids) ───

function FloatingChartBars() {
  const bars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 2 + i * 8,
      height: Math.random() * 40 + 10,
      delay: i * 0.5,
    }));
  }, []);

  return (
    <motion.div
      className="absolute pointer-events-none bottom-[15%] right-[5%]"
      style={{ opacity: 0.06 }}
      animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="100" height="60" viewBox="0 0 100 60">
        {bars.map((bar) => (
          <motion.rect
            key={bar.id}
            x={bar.x}
            y={60 - bar.height}
            width={5}
            height={bar.height}
            rx={2}
            fill={bar.id % 3 === 0 ? '#7c3aed' : bar.id % 3 === 1 ? '#0ea5e9' : '#10b981'}
            initial={{ height: 0, y: 60 }}
            animate={{ height: bar.height, y: 60 - bar.height }}
            transition={{ duration: 1.5, delay: bar.delay, ease: 'easeOut' }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

function FloatingNetworkGrid() {
  const nodes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 3 + 1.5,
    }));
  }, []);

  const edges = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) pairs.push([i, j]);
      }
    }
    return pairs;
  }, [nodes]);

  return (
    <motion.div
      className="absolute pointer-events-none top-[10%] left-[8%]"
      style={{ opacity: 0.05 }}
      animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        {edges.map(([i, j], idx) => (
          <motion.line
            key={`edge-${idx}`}
            x1={nodes[i].x * 2}
            y1={nodes[i].y * 2}
            x2={nodes[j].x * 2}
            y2={nodes[j].y * 2}
            stroke="rgba(124,58,237,0.2)"
            strokeWidth={0.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: idx * 0.4 }}
          />
        ))}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x * 2}
            cy={node.y * 2}
            r={node.r}
            fill="rgba(124,58,237,0.3)"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: node.id * 0.5 }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── Main Background Component ───

export interface BusinessBackgroundProps {
  variant?: 'auth' | 'dashboard' | 'full';
  density?: 'low' | 'medium' | 'high';
}

export function BusinessBackground({
  variant = 'full',
  density = 'medium',
}: BusinessBackgroundProps) {
  const shapes = useMemo(() => {
    const items: React.ReactNode[] = [];

    const dim = density === 'low' ? 3 : density === 'high' ? 8 : 5;

    // Floating cubes
    for (let i = 0; i < dim; i++) {
      const size = Math.random() * 40 + 30;
      items.push(
        <FloatingCube
          key={`cube-${i}`}
          size={size}
          color={`rgba(${[124, 58, 237][i % 3]},${[14, 165, 233][i % 3]},${[16, 185, 129][i % 3]},0.05)`}
          borderColor={`rgba(${[124, 58, 237][i % 3]},${[14, 165, 233][i % 3]},${[16, 185, 129][i % 3]},0.1)`}
          initialX={10 + (i * 22) % 80}
          initialY={15 + (i * 17) % 70}
          speed={0.2 + Math.random() * 0.4}
          delay={i * 1.5}
        />
      );
    }

    // Floating octahedra
    for (let i = 0; i < Math.max(1, dim - 1); i++) {
      items.push(
        <FloatingOctahedron
          key={`octa-${i}`}
          size={Math.random() * 30 + 20}
          color={`rgba(${[14, 165, 233][i % 3]}, ${[124, 58, 237][(i + 1) % 3]}, ${[16, 185, 129][(i + 2) % 3]}, 0.04)`}
          borderColor={`rgba(${[14, 165, 233][i % 3]}, ${[124, 58, 237][(i + 1) % 3]}, ${[16, 185, 129][(i + 2) % 3]}, 0.08)`}
          initialX={60 + (i * 15) % 35}
          initialY={50 + (i * 20) % 40}
          delay={i * 2}
        />
      );
    }

    return items;
  }, [density]);

  // shimmer lines effect
  const shimmerLines = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      width: Math.random() * 30 + 10,
      angle: Math.random() * 60 - 30,
      delay: i * 0.7,
      duration: 4 + Math.random() * 4,
    }));
  }, []);

  if (variant === 'auth') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-indigo-50/40 to-sky-50/30" />
        <DataParticles />
        {shapes.slice(0, 4)}
        <FloatingChartBars />
        <FloatingNetworkGrid />

        {/* Shimmer moving lines */}
        {shimmerLines.slice(0, 4).map((line) => (
          <motion.div
            key={line.id}
            className="absolute h-px"
            style={{
              top: `${line.top}%`,
              left: `${line.left}%`,
              width: `${line.width}%`,
              background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.06), transparent)',
              transform: `rotate(${line.angle}deg)`,
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: line.duration,
              repeat: Infinity,
              delay: line.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-indigo-50/20 to-transparent" />
        <DataParticles />
        {shapes.slice(0, 3)}
        <FloatingChartBars />
      </div>
    );
  }

  // Full variant
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Base gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/60 via-indigo-50/30 to-sky-50/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-violet-50/20" />

      {/* Data particles */}
      <DataParticles />

      {/* 3D shapes */}
      {shapes}

      {/* Business-themed floating elements */}
      <FloatingChartBars />
      <FloatingNetworkGrid />

      {/* Animated shimmer lines */}
      {shimmerLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute h-px"
          style={{
            top: `${line.top}%`,
            left: `${line.left}%`,
            width: `${line.width}%`,
            background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.05), rgba(14,165,233,0.05), transparent)',
            transform: `rotate(${line.angle}deg)`,
          }}
          animate={{ x: ['-200%', '300%'] }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            delay: line.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
