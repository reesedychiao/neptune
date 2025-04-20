"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Bounds, useBounds } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Loader2 } from "lucide-react";

// Node component representing a topic in 3D space
const Node = ({ position, label, nodeSize = 2, color = '#4b92ff', selected = false, onClick, id }) => {
  const materialRef = useRef();
  const glowRef = useRef();
  const dragRef = useRef(false);
  const startPosRef = useRef([0, 0]);
  
  // Add this function to track drag operations
  const handlePointerDown = (e) => {
    dragRef.current = false;
    startPosRef.current = [e.clientX, e.clientY];
    e.stopPropagation();
  };
  
  const handlePointerUp = (e) => {
    // Check if it was a drag or just a click
    const dx = Math.abs(e.clientX - startPosRef.current[0]);
    const dy = Math.abs(e.clientY - startPosRef.current[1]);
    const isDrag = dx > 3 || dy > 3; // If moved more than 3px, consider it a drag
    
    if (!isDrag && !dragRef.current) {
      onClick(id);
    }
    
    e.stopPropagation();
  };
  
  const handlePointerMove = (e) => {
    if (Math.abs(e.clientX - startPosRef.current[0]) > 3 || 
        Math.abs(e.clientY - startPosRef.current[1]) > 3) {
      dragRef.current = true;
    }
  };

  // Animation for pulsing effect
  useFrame(({ clock }) => {
    if (materialRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.8) * 0.05 + 1;
      materialRef.current.emissiveIntensity = selected ? 2.5 : (pulse * 1.5);
    }
    if (glowRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.8 + Math.PI) * 0.1 + 1;
      glowRef.current.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);
    }
  });

  return (
    <group position={position} 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[nodeSize * 1.3, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={0.2} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
      
      {/* Main node sphere */}
      <mesh>
        <sphereGeometry args={[nodeSize, 32, 32]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 2.5 : 1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Text label */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, -nodeSize * 1.8, 0]}
          fontSize={nodeSize * 1.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
          outlineOpacity={0.8}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
};

// Edge component creating cosmic ray connections between nodes
const Edge = ({ start, end, strength = 0.5 }) => {
  const lineRef = useRef();
  const particlesRef = useRef();
  const pulseRef = useRef();
  const lineGeometryRef = useRef();
  
  // Increase particle count for denser flow effect
  const particleCount = Math.floor(100 * Math.max(0.3, strength));
  
  // Create points for the line with a slight arc
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(start[0], start[1], start[2]);
    const endVec = new THREE.Vector3(end[0], end[1], end[2]);
    
    // Create a slightly curved line - more pronounced curve for visual effect
    const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
    const distance = startVec.distanceTo(endVec);
    midPoint.y += 2 * (1 - strength) * Math.min(10, distance/10); 
    
    const curve = new THREE.QuadraticBezierCurve3(
      startVec,
      midPoint,
      endVec
    );
    
    return curve.getPoints(20);
  }, [start, end, strength]);
  
  // Create particle positions along the curve
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(start[0], start[1], start[2]),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        ((start[1] + end[1]) / 2) + 2 * (1 - strength) * Math.min(10, 
        Math.sqrt(Math.pow(end[0]-start[0], 2) + Math.pow(end[1]-start[1], 2) + Math.pow(end[2]-start[2], 2))/10),
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(end[0], end[1], end[2])
    );
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const point = curve.getPoint(t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    return positions;
  }, [start, end, particleCount, strength]);
  
  // Varied particle sizes for more interesting visual
  const particleSizes = useMemo(() => {
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // More variation in particle sizes
      sizes[i] = Math.random() * 2.5 * strength + 0.8;
    }
    return sizes;
  }, [particleCount, strength]);
  
  // Varied particle colors for more interesting visual
  const particleColors = useMemo(() => {
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Create color variation from white to blue
      const t = Math.random();
      colors[i * 3] = 0.7 + 0.3 * t;     // R: 0.7-1.0
      colors[i * 3 + 1] = 0.7 + 0.3 * t; // G: 0.7-1.0
      colors[i * 3 + 2] = 1.0;           // B: always 1.0 (full blue)
    }
    return colors;
  }, [particleCount]);
  
  // Animate particles flowing along the connection with wave effect
  useFrame(({ clock }) => {
    if (particlesRef.current && lineGeometryRef.current) {
      // Base time with strength modifier for speed
      const time = clock.getElapsedTime() * Math.max(0.4, strength);
      const positions = particlesRef.current.attributes.position.array;
      const sizes = particlesRef.current.attributes.size.array;
      
      // Pulse animation for the main beam - core animation
      if (lineRef.current) {
        // Pulse the opacity of the main beam
        const pulse = Math.sin(time * 2) * 0.2 + 0.8;
        lineRef.current.material.opacity = Math.max(0.2, pulse * strength);
      }
      
      // Create a travel wave effect for particles
      const waveSpeed = time * 1.5;
      const waveWidth = 0.1;
      
      for (let i = 0; i < particleCount; i++) {
        // Base particle position along curve
        const baseT = ((i / particleCount) + (time * 0.2)) % 1;
        
        // Create wave-like speed variation
        const t = baseT;
        
        // Get the point along the curve
        const point = new THREE.Vector3();
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(start[0], start[1], start[2]),
          new THREE.Vector3(
            (start[0] + end[0]) / 2,
            ((start[1] + end[1]) / 2) + 2 * (1 - strength) * 
              Math.min(10, Math.sqrt(Math.pow(end[0]-start[0], 2) + 
              Math.pow(end[1]-start[1], 2) + Math.pow(end[2]-start[2], 2))/10),
            (start[2] + end[2]) / 2
          ),
          new THREE.Vector3(end[0], end[1], end[2])
        );
        
        point.copy(curve.getPoint(t));
        
        // Add small random offset for more organic feel
        const jitter = 0.2;
        point.x += (Math.random() - 0.5) * jitter * strength;
        point.y += (Math.random() - 0.5) * jitter * strength;
        point.z += (Math.random() - 0.5) * jitter * strength;
        
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
        
        // Create traveling wave of larger particles
        const wave = Math.sin((baseT * 10 + waveSpeed) * Math.PI * 2);
        const waveInfluence = Math.max(0, 1 - Math.abs(wave) / waveWidth);
        
        // Make particles grow and shrink with the wave
        sizes[i] = Math.random() * 1.5 * strength + 0.5 + waveInfluence * 2.5;
      }
      
      particlesRef.current.attributes.position.needsUpdate = true;
      particlesRef.current.attributes.size.needsUpdate = true;
    }
  });
  
  return (
    <group>
      {/* Base glow ray */}
      <line ref={lineRef}>
        <bufferGeometry ref={lineGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={strength > 0.7 ? "#ffffff" : "#73a7ff"}
          transparent
          opacity={Math.max(0.3, strength * 0.9)}
          linewidth={1}
          blending={THREE.AdditiveBlending}
        />
      </line>
      
      {/* Core bright beam */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#ffffff"
          transparent
          opacity={0.6}
          linewidth={1}
          blending={THREE.AdditiveBlending}
        />
      </line>
      
      {/* Flowing particles along connection - the main effect */}
      <points>
        <bufferGeometry ref={particlesRef}>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={particleSizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={Math.min(1.0, strength * 2)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Main scene component that sets up and renders the graph
const GraphScene = ({ data, onSelectNode, onNodeHover, canvasRef }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const boundsRef = useRef();
  const { scene, camera } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color('#050A1C');
  }, [scene]);
  
  // Instead of using useBounds which can conflict with OrbitControls, 
  // create a custom focus function
  const focusOnNode = (position) => {
    if (!position) return;
    
    // Create a smooth animation to focus on a node
    const target = new THREE.Vector3(position[0], position[1], position[2]);
    const start = new THREE.Vector3().copy(camera.position);
    const startTarget = new THREE.Vector3();
    camera.getWorldDirection(startTarget);
    startTarget.multiplyScalar(50).add(camera.position);
    
    // Animate camera position over 1 second
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      
      // Calculate distance for nice framing
      const distance = 30;
      const direction = new THREE.Vector3().copy(target).sub(camera.position).normalize();
      const targetPosition = new THREE.Vector3().copy(target).sub(direction.multiplyScalar(distance));
      
      // Interpolate current position
      camera.position.lerpVectors(start, targetPosition, easeProgress);
      camera.lookAt(target);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  };
  
  // Handle node selection with focus animation
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    
    if (nodeId !== selectedNode) {
      // Find the node position to focus on it
      const node = data.nodes.find(n => n.id === nodeId);
      
      if (node && node.position) {
        focusOnNode(node.position);
      }
      
      // Call external handler if provided
      if (onSelectNode) {
        onSelectNode(nodeId);
      }
    }
  };

  // Handle node hover
  const handlePointerOver = (event, nodeId) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    onNodeHover(nodeId, screenPosition);
  };

  // Rest of your GraphScene component remains the same
  return (
    <group ref={boundsRef}>
      {/* Create subtle ambient light and directional light */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      
      {/* Add some background stars */}
      <Stars />
      
      {/* Render all nodes */}
      {data.nodes.map((node) => (
        <Node
          key={node.id}
          id={node.id}
          position={node.position}
          label={node.label}
          nodeSize={(node.size / 50) + 1} // Scale size appropriately
          selected={selectedNode === node.id}
          onClick={handleNodeClick}
          onPointerOver={(event) => handlePointerOver(event, node.id)}
        />
      ))}
      
      {/* Render all connections/edges */}
      {data.links.map((link, index) => {
        const sourceNode = data.nodes.find(n => n.id === link.source);
        const targetNode = data.nodes.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return null;
        
        return (
          <Edge
            key={`edge-${index}`}
            start={sourceNode.position}
            end={targetNode.position}
            strength={link.strength}
          />
        );
      })}
      
      {/* Post-processing effects for glow */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.1} // Lower threshold to make more elements glow
          luminanceSmoothing={0.9} 
          intensity={1.8} // Increase bloom intensity
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.8}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </group>
  );
};

// Background stars component
const Stars = () => {
  const particlesRef = useRef();
  const count = 5000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const distance = Math.random() * 400 + 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = distance * Math.cos(phi);
    }
    return positions;
  }, [count]);
  
  // Animate subtle star twinkling
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      particlesRef.current.rotation.z = clock.getElapsedTime() * 0.01;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        color="#ffffff"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={false}
      />
    </points>
  );
};

// Add this new component for note previews:

// Note preview component that shows first lines of notes
const NotePreview = ({ notes, position }) => {
  if (!notes || notes.length === 0) return null;
  
  // Position the preview near the node
  const style = {
    position: 'absolute',
    left: `${position.x + 20}px`,
    top: `${position.y - 20}px`,
    backgroundColor: 'rgba(10, 20, 40, 0.85)',
    border: '1px solid rgba(100, 150, 255, 0.4)',
    borderRadius: '4px',
    padding: '8px 12px',
    maxWidth: '300px',
    maxHeight: '200px',
    overflow: 'auto',
    color: 'white',
    fontSize: '0.85rem',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)'
  };

  return (
    <div style={style}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#88aaff' }}>
        {notes.length} Note{notes.length > 1 ? 's' : ''} in Topic
      </div>
      {notes.map((note, index) => (
        <div 
          key={index} 
          style={{ 
            borderTop: index > 0 ? '1px solid rgba(100, 150, 255, 0.2)' : 'none',
            padding: '4px 0'
          }}
        >
          <div style={{ color: '#ccddff', fontSize: '0.75rem' }}>
            Note {index + 1}
          </div>
          {note.content.split('\n')[0].substring(0, 100)}...
        </div>
      ))}
    </div>
  );
};

// Main Knowledge Graph component that fetches data and renders the 3D graph
function KnowledgeGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Add these new state variables
  const [hoveredNode, setHoveredNode] = useState(null);
  const [notePreviewPosition, setNotePreviewPosition] = useState({ x: 0, y: 0 });
  const [notePreviewData, setNotePreviewData] = useState([]);
  const canvasRef = useRef(null);

  // Process fetched data to add positions to nodes
  const processGraphData = (data) => {
    // Calculate 3D positions for nodes in a spherical layout
    const nodes = data.nodes.map((node, index) => {
      const phi = Math.acos(-1 + (2 * index) / data.nodes.length);
      const theta = Math.sqrt(data.nodes.length * Math.PI) * phi;
      
      const radius = 50;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      
      return {
        ...node,
        position: [x, y, z],
        // Ensure size is a number (default to node size or note count)
        size: node.size || node.noteCount * 20 || 30
      };
    });
    
    return { nodes, links: data.links };
  };

  // Fetch knowledge graph data from backend
  const fetchKnowledgeGraph = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/knowledge-graph');
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge graph: ${response.status}`);
      }
      
      const rawData = await response.json();
      
      // Process data to add 3D positions
      const processedData = processGraphData(rawData);
      setData(processedData);
    } catch (err) {
      console.error("Error fetching knowledge graph:", err);
      setError(err instanceof Error ? err.message : "Failed to load knowledge graph");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh the graph data
  const handleRefreshGraph = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:8000/api/knowledge-graph/refresh', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh graph: ${response.status}`);
      }
      
      const rawData = await response.json();
      const processedData = processGraphData(rawData);
      setData(processedData);
    } catch (err) {
      console.error("Error refreshing knowledge graph:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh graph");
    } finally {
      setRefreshing(false);
    }
  };

  // Add this function to fetch note content
  const fetchNoteContent = async (noteIds) => {
    if (!noteIds || noteIds.length === 0) return [];
    
    try {
      const notes = [];
      
      // Fetch each note content - we'll fetch just the first 5 to keep it responsive
      const notesToFetch = noteIds.slice(0, 5);
      
      for (const noteId of notesToFetch) {
        const response = await fetch(`http://localhost:8000/api/filesystem/${noteId}`);
        if (response.ok) {
          const data = await response.json();
          notes.push({ id: noteId, content: data.content || "No content" });
        }
      }
      
      if (noteIds.length > 5) {