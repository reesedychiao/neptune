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
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(id); }}>
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
  const lineGeometryRef = useRef();
  const particleCount = Math.floor(50 * Math.max(0.2, strength));
  
  // Create points for the line
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(start[0], start[1], start[2]);
    const endVec = new THREE.Vector3(end[0], end[1], end[2]);
    
    // Create a slightly curved line
    const midPoint = new THREE.Vector3().lerpVectors(startVec, endVec, 0.5);
    midPoint.y += 5 * (1 - strength); // Add some curve based on strength
    
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
        ((start[1] + end[1]) / 2) + 5 * (1 - strength),
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
  
  // Particle sizes based on strength
  const particleSizes = useMemo(() => {
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = Math.random() * 1.5 * strength + 0.5;
    }
    return sizes;
  }, [particleCount, strength]);
  
  // Animate particles flowing along the connection
  useFrame(({ clock }) => {
    if (particlesRef.current && lineGeometryRef.current) {
      const time = clock.getElapsedTime() * strength;
      const positions = particlesRef.current.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        // Calculate position along curve with offset
        const t = ((i / particleCount) + (time * 0.2)) % 1;
        
        const point = new THREE.Vector3();
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(start[0], start[1], start[2]),
          new THREE.Vector3(
            (start[0] + end[0]) / 2,
            ((start[1] + end[1]) / 2) + 5 * (1 - strength),
            (start[2] + end[2]) / 2
          ),
          new THREE.Vector3(end[0], end[1], end[2])
        );
        
        point.copy(curve.getPoint(t));
        
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      }
      
      particlesRef.current.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <group>
      {/* Base connection line */}
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
          color={strength > 0.7 ? "#ffffff" : "#4b92ff"}
          transparent
          opacity={Math.max(0.2, strength * 0.8)}
          linewidth={1}
        />
      </line>
      
      {/* Flowing particles along connection */}
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
        </bufferGeometry>
        <pointsMaterial
          size={2}
          color={strength > 0.7 ? "#ffffff" : "#4b92ff"}
          transparent
          opacity={strength * 0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Main scene component that sets up and renders the graph
const GraphScene = ({ data, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const boundsApi = useBounds();
  
  // Set up the scene with black background and subtle ambient light
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color('#050A1C');
  }, [scene]);
  
  // Handle node selection with focus animation
  const handleNodeClick = (nodeId) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    
    if (nodeId !== selectedNode) {
      // Find the node position to focus on it
      const node = data.nodes.find(n => n.id === nodeId);
      
      // Add null check here to prevent the error
      if (boundsApi && node && node.position) {
        boundsApi.refresh().fit().to({
          position: new THREE.Vector3(...node.position),
          normal: new THREE.Vector3(0, 0, 1)
        });
      }
      
      // Call external handler if provided
      if (onSelectNode) {
        onSelectNode(nodeId);
      }
    }
  };
  
  return (
    <Bounds fit clip observe margin={1.4}>
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
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={1.5} 
          mipmapBlur
        />
        <Vignette
          offset={0.3}
          darkness={0.8}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Bounds>
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

// Main Knowledge Graph component that fetches data and renders the 3D graph
function KnowledgeGraph() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load data on component mount
  useEffect(() => {
    fetchKnowledgeGraph();
  }, []);

  // Handle node selection
  const handleSelectNode = (nodeId) => {
    console.log(`Selected node: ${nodeId}`);
    // You can add more functionality here, like showing notes related to this topic
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#050a1c]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-blue-400">Loading knowledge graph...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050a1c] text-red-400">
        <p>Error loading knowledge graph: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition"
          onClick={fetchKnowledgeGraph}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#050a1c] relative">
      {/* Refresh button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleRefreshGraph}
          disabled={refreshing}
          className="px-3 py-1 bg-blue-700 rounded text-sm text-white hover:bg-blue-600 transition"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Graph'}
        </button>
      </div>
      
      {/* Three.js canvas */}
      <Canvas 
        camera={{ 
          position: [0, 0, 100], 
          fov: 60, 
          near: 1,
          far: 1000
        }}
        style={{ background: '#050a1c' }}
      >
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={20}
          maxDistance={200}
        />
        <GraphScene 
          data={data} 
          onSelectNode={handleSelectNode} 
        />
      </Canvas>
    </div>
  );
}

export default KnowledgeGraph;