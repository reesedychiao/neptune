"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Loader2 } from "lucide-react";

// Replace your CustomStraightEdge component with this simpler version:

const CustomStraightEdge = ({
  id,
  source,
  target,
  style = {},
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  ...props
}) => {
  // Create unique IDs for this edge's effects
  const gradientId = `edge-gradient-${id}`;
  
  // Simple check to avoid rendering errors
  if (!sourceX || !sourceY || !targetX || !targetY) {
    return null;
  }
  
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" 
          x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#4b92ff" />
        </linearGradient>
      </defs>
      
      {/* Add a highly visible glow underneath */}
      <path
        style={{
          stroke: "#4b92ff",
          strokeWidth: style.strokeWidth ? style.strokeWidth * 2 : 10,
          opacity: 0.4,
          filter: `blur(8px)`
        }}
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        fill="none"
      />
      
      {/* Main edge with gradient */}
      <path
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
        }}
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        fill="none"
      />
      
      {/* Extra-bright core for visibility */}
      <path
        style={{
          stroke: "#ffffff",
          strokeWidth: 1.5,
          opacity: 0.9,
        }}
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        fill="none"
      />
    </g>
  );
};

// Update your CustomNode component to be more responsive to zoom levels

const CustomNode = ({ data }) => {
  const { zoom } = useReactFlow().getViewport();
  
  // Adjust text size based on zoom level
  const fontSize = Math.max(8, Math.min(14, 12 / zoom));
  
  return (
    <div style={{ 
      color: "white", 
      textAlign: "center", 
      fontSize: `${fontSize}px`,
      width: "max-content",
      maxWidth: `${120 / zoom}px`,
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "5px",
      fontWeight: zoom > 1 ? "medium" : "light",
      textShadow: "0px 0px 8px rgba(0, 0, 0, 0.7)"
    }}>
      {data.label}
    </div>
  );
};

// Define custom edge types
const edgeTypes = {
  custom: CustomStraightEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

// Initial nodes with 3D styling and no borders
const initialNodes = [
  {
    id: "1",
    type: "custom",
    data: { label: "Alpha Centauri" },
    position: { x: 250, y: 5 },
    style: {
      width: 14,
      height: 14,
      background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
      borderRadius: "50%",
      boxShadow:
        "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    // Label styling
    draggable: false,
    connectable: false,
    selectable: false,
  },
  {
    id: "2",
    type: "custom",
    data: { label: "Sirius" },
    position: { x: 100, y: 150 },
    style: {
      width: 14,
      height: 14,
      background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
      borderRadius: "50%",
      boxShadow:
        "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    draggable: false,
    connectable: false,
    selectable: false,
  },
  {
    id: "3",
    type: "custom",
    data: { label: "Betelgeuse" },
    position: { x: 400, y: 150 },
    style: {
      width: 14,
      height: 14,
      background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
      borderRadius: "50%",
      boxShadow:
        "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    draggable: false,
    connectable: false,
    selectable: false,
  },
  {
    id: "4",
    type: "custom",
    data: { label: "Vega" },
    position: { x: 150, y: 300 },
    style: {
      width: 14,
      height: 14,
      background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
      borderRadius: "50%",
      boxShadow:
        "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    draggable: false,
    connectable: false,
    selectable: false,
  },
  {
    id: "5",
    type: "custom",
    data: { label: "Polaris" },
    position: { x: 350, y: 300 },
    style: {
      width: 14,
      height: 14,
      background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
      borderRadius: "50%",
      boxShadow:
        "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
      border: "none",
    },
    draggable: false,
    connectable: false,
    selectable: false,
  },
];

// Initial edges with custom edge type
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: false,
    type: "custom", // Use custom edge type
    style: {
      stroke: "rgba(77, 124, 254, 0.6)",
      strokeWidth: 1.5,
    },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: false,
    type: "custom",
    style: {
      stroke: "rgba(77, 124, 254, 0.6)",
      strokeWidth: 1.5,
    },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    animated: false,
    type: "custom",
    style: {
      stroke: "rgba(77, 124, 254, 0.6)",
      strokeWidth: 1.5,
    },
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    animated: false,
    type: "custom",
    style: {
      stroke: "rgba(77, 124, 254, 0.6)",
      strokeWidth: 1.5,
    },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: false,
    type: "custom",
    style: {
      stroke: "rgba(77, 124, 254, 0.6)",
      strokeWidth: 1.5,
    },
  },
];

function NetworkGraph() {
  // Group 1: All useState hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCenter, setZoomCenter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Group 2: All useRef hooks
  const zoomTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const reactFlowWrapperRef = useRef(null);
  const svgOverlayRef = useRef(null);
  
  // Group 3: All useContext and other hooks
  const reactFlowInstance = useReactFlow();
  
  // Group 4: All useCallback hooks
  const findConnections = useCallback(
    (nodeId) => {
      if (!nodeId || !edges) return { connectedNodeIds: [nodeId], connectedEdgeIds: [] };
    
      const connectedEdgeIds = [];
      const connectedNodeIds = [nodeId];
  
      edges.forEach((edge) => {
        if (!edge || typeof edge !== 'object') return; // Skip invalid edges
        
        if (edge.source === nodeId || edge.target === nodeId) {
          if (edge.id) connectedEdgeIds.push(edge.id);
          
          const connectedNodeId =
            edge.source === nodeId ? edge.target : edge.source;
          if (connectedNodeId && !connectedNodeIds.includes(connectedNodeId)) {
            connectedNodeIds.push(connectedNodeId);
          }
        }
      });
  
      return { connectedNodeIds, connectedEdgeIds };
    },
    [edges]
  );
  
  const onNodeMouseEnter = useCallback(
    (event, node) => {
      // Add this defensive check
      if (!node || !node.id) {
        console.warn('Node or node ID is undefined:', node);
        return;
      }
      
      const { connectedNodeIds, connectedEdgeIds } = findConnections(node.id);
      
      // Rest of your existing function...
      // Highlight connected nodes and edges
      setHighlightedNodeIds(connectedNodeIds);
      setHighlightedEdgeIds(connectedEdgeIds);
  
      // Update nodes with highlighted styles
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            label: n.data.label,
          },
          style: {
            ...n.style,
            background: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? "radial-gradient(circle at 30% 30%, #a3c2ff, #3a76ff)"
                : "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)"
              : "radial-gradient(circle at 30% 30%, #4d7cfe, #0a46d8)",
            boxShadow: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? "0 0 20px 6px rgba(109, 159, 255, 0.9), inset 0 -3px 5px rgba(0, 0, 0, 0.3), inset 3px 3px 5px rgba(255, 255, 255, 0.5)"
                : "0 0 15px 4px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)"
              : "0 0 8px 2px rgba(77, 124, 254, 0.3), inset 0 -1px 3px rgba(0, 0, 0, 0.2), inset 1px 1px 3px rgba(255, 255, 255, 0.3)",
            width: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? 18
                : 16
              : 12,
            height: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? 18
                : 16
              : 12,
            opacity: connectedNodeIds.includes(n.id) ? 1 : 0.3,
            zIndex: connectedNodeIds.includes(n.id) ? 10 : 0,
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          },
          labelStyle: {
            color: connectedNodeIds.includes(n.id)
              ? "#e2f0ff"
              : "rgba(226, 240, 255, 0.3)",
            fontWeight: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? "bold"
                : "normal"
              : "normal",
            fontSize: connectedNodeIds.includes(n.id)
              ? n.id === node.id
                ? 14
                : 12
              : 12,
            transition: "all 0.4s ease",
          },
        }))
      );
  
      // Update edges with highlighted styles
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: {
            ...e.style,
            stroke: connectedEdgeIds.includes(e.id)
              ? "rgba(109, 159, 255, 0.9)"
              : "rgba(77, 124, 254, 0.2)",
            strokeWidth: connectedEdgeIds.includes(e.id) ? 2.5 : 1,
            opacity: connectedEdgeIds.includes(e.id) ? 1 : 0.2,
          },
          animated: connectedEdgeIds.includes(e.id),
          type: "custom", // Ensure custom edge type is maintained
        }))
      );
  
      // Set zoom level and center for the ReactFlow wrapper
      if (reactFlowWrapperRef.current) {
        const wrapperRect = reactFlowWrapperRef.current.getBoundingClientRect();
        const nodeRect = event.target.getBoundingClientRect();
  
        // Calculate the center position relative to the wrapper
        const centerX = nodeRect.left + nodeRect.width / 2 - wrapperRect.left;
        const centerY = nodeRect.top + nodeRect.height / 2 - wrapperRect.top;
  
        setZoomCenter({ x: centerX, y: centerY });
        setZoomLevel(1.5);
      }
    },
    [findConnections, setEdges, setNodes]
  );
  
  const onNodeMouseLeave = useCallback(
    () => {
      // Reset highlighted nodes and edges
      setHighlightedNodeIds([]);
      setHighlightedEdgeIds([]);
  
      // Reset node styles
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
            boxShadow:
              "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
            width: 14,
            height: 14,
            opacity: 1,
            zIndex: 0,
            border: "none",
          },
          labelStyle: {
            color: "#ffffff",
            fontWeight: "light",
            fontSize: 8,
          },
        }))
      );
  
      // Reset edge styles
      setEdges((eds) =>
        eds.map((e) => {
          // Get the original strength data
          const strength = e.data?.strength || 0.5;
          
          // Higher minimum opacity
          const opacity = Math.max(0.6, strength * 0.8);
          
          return {
            ...e,
            style: {
              ...e.style,
              stroke: `rgba(255, 255, 255, ${opacity})`,
              strokeWidth: Math.max(2, strength * 5),
              opacity: 1,
            },
            animated: strength > 0.7,
            type: "custom", 
          };
        })
      );
  
      // Reset zoom
      setZoomLevel(1);
      setZoomCenter(null);
    },
    [setEdges, setNodes]
  );
  
  const onMove = useCallback((event, viewport) => {
    if (svgOverlayRef.current && viewport) {
      const { x, y, zoom } = viewport;
      svgOverlayRef.current.style.transform = `translate(${x}px,${y}px) scale(${zoom})`;
    }
  }, []);
  
  // Group 5: All useEffect hooks
  useEffect(() => {
    // Fetch knowledge graph data from the backend
    const fetchKnowledgeGraph = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:8000/api/knowledge-graph');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch knowledge graph: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Start with the geometric layout we already have
        const geometricNodes = [...initialNodes];
        
        // Assign topic names to existing geometric nodes
        // If we have more topics than nodes, we'll need to create additional ones
        const reactFlowNodes = geometricNodes.map((node, index) => {
          // Get topic data if available
          const topicData = index < data.nodes.length ? data.nodes[index] : null;
          
          // Enhance node with topic data
          return {
            ...node,
            id: topicData ? topicData.id.toString() : node.id,
            type: "custom",
            data: { 
              label: topicData ? topicData.label : node.data.label,
              noteCount: topicData ? topicData.noteCount || 0 : 0,
              noteIds: topicData ? topicData.noteIds || [] : []
            },
            // Keep the existing position
            style: {
              ...node.style,
              // Make nodes bigger to better display topic names
              width: 20,
              height: 20,
            }
          };
        });
        
        // If we have more topics than initial nodes, add them
        if (data.nodes.length > geometricNodes.length) {
          const additionalNodes = data.nodes.slice(geometricNodes.length);
          
          additionalNodes.forEach((topic, i) => {
            // Calculate new positions in a circle around the existing graph
            const angle = (i * 2 * Math.PI) / additionalNodes.length;
            const radius = 400; // Larger radius for outer circle
            
            reactFlowNodes.push({
              id: topic.id.toString(),
              type: "custom",
              data: { 
                label: topic.label,
                noteCount: topic.noteCount || 0,
                noteIds: topic.noteIds || []
              },
              position: {
                x: 250 + radius * Math.cos(angle),
                y: 150 + radius * Math.sin(angle)
              },
              style: {
                width: 20,
                height: 20,
                background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
                borderRadius: "50%",
                boxShadow:
                  "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
                border: "none",
              },
              draggable: false,
              connectable: false,
              selectable: false,
            });
          });
        }
        
        // Create edges based on actual topic relationships
        const reactFlowEdges = data.links.map((link) => {
          const opacity = Math.max(0.6, link.strength * 0.8);
          
          return {
            id: `e${link.source}-${link.target}`,
            source: link.source.toString(),
            target: link.target.toString(),
            animated: link.strength > 0.7,
            type: "custom",
            style: {
              stroke: `rgba(255, 255, 255, ${opacity})`, 
              strokeWidth: Math.max(2, link.strength * 5),
            },
            data: {
              strength: link.strength
            }
          };
        });
  
        // Validate nodes and edges
        const validNodes = reactFlowNodes.filter(node => node && node.id);
        const validEdges = reactFlowEdges.filter(edge => 
          edge && edge.id && edge.source && edge.target && 
          validNodes.some(n => n.id === edge.source) && 
          validNodes.some(n => n.id === edge.target)
        );
  
        setNodes(validNodes);
        setEdges(validEdges);
      } catch (err) {
        console.error("Error fetching knowledge graph:", err);
        setError(err instanceof Error ? err.message : "Failed to load knowledge graph");
        
        // Fallback to initial data
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchKnowledgeGraph();
  }, [setNodes, setEdges]);
  
  useEffect(() => {
    // Reset zoom and position when component unmounts
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    // Apply the zoom effect to the ReactFlow wrapper only
    const reactFlowWrapper = reactFlowWrapperRef.current;
    if (!reactFlowWrapper) return;
  
    if (zoomLevel !== 1 && zoomCenter) {
      // Calculate the transform origin based on the node position
      const wrapperRect = reactFlowWrapper.getBoundingClientRect();
      const originX = (zoomCenter.x / wrapperRect.width) * 100;
      const originY = (zoomCenter.y / wrapperRect.height) * 100;
  
      reactFlowWrapper.style.transition =
        "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      reactFlowWrapper.style.transformOrigin = `${originX}% ${originY}%`;
      reactFlowWrapper.style.transform = `scale(${zoomLevel})`;
    } else {
      reactFlowWrapper.style.transition =
        "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      reactFlowWrapper.style.transform = "scale(1)";
    }
  }, [zoomLevel, zoomCenter]);
  
  useEffect(() => {
    // Replace your current SVG overlay effect with this updated version that uses ReactFlow's API
    if (!nodes?.length || !edges?.length || !reactFlowWrapperRef.current || isLoading || !reactFlowInstance) {
      return;
    }
    
    // Create SVG overlay if it doesn't exist
    if (!svgOverlayRef.current) {
      const wrapper = reactFlowWrapperRef.current;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("class", "absolute top-0 left-0 pointer-events-none z-10");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      
      // Position SVG in the same coordinate system as nodes
      svg.style.transform = "translate(0,0) scale(1)"; // Initial transform
      
      wrapper.appendChild(svg);
      svgOverlayRef.current = svg;
    }
    
    // Get the current viewport transform from ReactFlow
    const { x, y, zoom } = reactFlowInstance.getViewport();
    
    // Update SVG transform to match ReactFlow's viewport
    const svg = svgOverlayRef.current;
    svg.style.transform = `translate(${x}px,${y}px) scale(${zoom})`;
  
    // Clear existing lines
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Draw the edges with raw coordinates (no need to project)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
    
    // Draw each edge - add defensive checks
    edges.forEach(edge => {
      // Rest of your edge drawing code...
      if (!edge || !edge.source || !edge.target) return; // Skip invalid edges
      
      const sourceNode = nodes.find(n => n && n.id === edge.source);
      const targetNode = nodes.find(n => n && n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Use raw coordinates since we're transforming the entire SVG
      const sourceX = sourceNode.position.x + (sourceNode.style?.width || 14) / 2;
      const sourceY = sourceNode.position.y + (sourceNode.style?.height || 14) / 2;
      const targetX = targetNode.position.x + (targetNode.style?.width || 14) / 2;
      const targetY = targetNode.position.y + (targetNode.style?.height || 14) / 2;
      
      // Create gradient for this edge
      const gradientId = `edge-gradient-${edge.id}`;
      const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("x1", sourceX);
      gradient.setAttribute("y1", sourceY);
      gradient.setAttribute("x2", targetX);
      gradient.setAttribute("y2", targetY);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  
      // Adjust color based on relationship strength
      const strength = edge.data?.strength || 0.5;
      let startColor, endColor;
  
      if (strength > 0.7) {
        startColor = "#ffffff"; // Bright white for strong connections
        endColor = "#4b92ff"; // Blue end
      } else if (strength > 0.4) {
        startColor = "#d4e4ff"; // Slightly dimmer for medium connections
        endColor = "#2a6ed9";
      } else {
        startColor = "#a3c2ff"; // Dimmer for weak connections
        endColor = "#1a56e8";
      }
  
      const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", startColor);
  
      const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", endColor);
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
      
      // Create blur filter
      const filterId = `glow-${edge.id}`;
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", filterId);
      filter.setAttribute("x", "-50%");
      filter.setAttribute("y", "-50%");
      filter.setAttribute("width", "200%");
      filter.setAttribute("height", "200%");
      
      const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      feGaussianBlur.setAttribute("stdDeviation", "4");
      filter.appendChild(feGaussianBlur);
      defs.appendChild(filter);
      
      // Draw glow effect
      const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      glowPath.setAttribute("d", `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`);
      glowPath.setAttribute("stroke", "#4b92ff");
      glowPath.setAttribute("stroke-width", Math.max(3, strength * 8));
      glowPath.setAttribute("opacity", "0.5");
      glowPath.setAttribute("filter", `url(#${filterId})`);
      glowPath.setAttribute("fill", "none");
      svg.appendChild(glowPath);
      
      // Draw main line with gradient
      const mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      mainPath.setAttribute("d", `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`);
      mainPath.setAttribute("stroke", `url(#${gradientId})`);
      mainPath.setAttribute("stroke-width", Math.max(1.5, strength * 3));
      mainPath.setAttribute("opacity", "0.8");
      mainPath.setAttribute("fill", "none");
      svg.appendChild(mainPath);
      
      // Draw bright core
      const corePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      corePath.setAttribute("d", `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`);
      corePath.setAttribute("stroke", "#ffffff");
      corePath.setAttribute("stroke-width", "1");
      corePath.setAttribute("opacity", "1");
      corePath.setAttribute("fill", "none");
      svg.appendChild(corePath);
    });
  }, [nodes, edges, isLoading, reactFlowInstance]);

  useEffect(() => {
    // Always declare variables inside
    let svg;
    
    // Early returns don't prevent hook declaration
    if (!nodes?.length || !edges?.length || !reactFlowWrapperRef.current || isLoading || !reactFlowInstance) {
      return;
    }
    
    // Rest of your effect...
  }, [nodes, edges, isLoading, reactFlowInstance]);
  
  const handleRefreshGraph = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:8000/api/knowledge-graph/refresh', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh graph: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Use the same approach as in fetchKnowledgeGraph
      const geometricNodes = [...initialNodes];
      
      // Assign topic names to existing nodes
      const reactFlowNodes = geometricNodes.map((node, index) => {
        const topicData = index < data.nodes.length ? data.nodes[index] : null;
        
        return {
          ...node,
          id: topicData ? topicData.id.toString() : node.id,
          type: "custom",
          data: { 
            label: topicData ? topicData.label : node.data.label,
            noteCount: topicData ? topicData.noteCount || 0 : 0,
            noteIds: topicData ? topicData.noteIds || [] : []
          },
          style: {
            ...node.style,
            width: 20,
            height: 20,
          }
        };
      });
      
      // Add any additional topics
      if (data.nodes.length > geometricNodes.length) {
        const additionalNodes = data.nodes.slice(geometricNodes.length);
        
        additionalNodes.forEach((topic, i) => {
          const angle = (i * 2 * Math.PI) / additionalNodes.length;
          const radius = 400;
          
          reactFlowNodes.push({
            id: topic.id.toString(),
            type: "custom",
            data: { 
              label: topic.label,
              noteCount: topic.noteCount || 0,
              noteIds: topic.noteIds || []
            },
            position: {
              x: 250 + radius * Math.cos(angle),
              y: 150 + radius * Math.sin(angle)
            },
            style: {
              width: 20,
              height: 20,
              background: "radial-gradient(circle at 30% 30%, #6d9fff, #1a56e8)",
              borderRadius: "50%",
              boxShadow:
                "0 0 15px 3px rgba(77, 124, 254, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)",
              border: "none",
            },
            draggable: false,
            connectable: false,
            selectable: false,
          });
        });
      }
      
      // Create edges based on actual relationships
      const reactFlowEdges = data.links.map((link) => {
        const opacity = Math.max(0.6, link.strength * 0.8);
        
        return {
          id: `e${link.source}-${link.target}`,
          source: link.source.toString(),
          target: link.target.toString(),
          animated: link.strength > 0.7,
          type: "custom",
          style: {
            stroke: `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: Math.max(2, link.strength * 5),
          },
          data: {
            strength: link.strength
          }
        };
      });
  
      // Validation
      const validNodes = reactFlowNodes.filter(node => node && node.id);
      const validEdges = reactFlowEdges.filter(edge => 
        edge && edge.id && edge.source && edge.target && 
        validNodes.some(n => n.id === edge.source) && 
        validNodes.some(n => n.id === edge.target)
      );
  
      setNodes(validNodes);
      setEdges(validEdges);
    } catch (err) {
      console.error("Error refreshing knowledge graph:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh graph");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Debug: Log current edges to verify they exist
  console.log("Current edges:", edges);
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#050a1c]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-2 text-blue-400">Loading knowledge graph...</span>
      </div>
    );
  }
  
  // Show error state if fetch failed
  if (error && nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050a1c] text-red-400">
        <p>Error loading knowledge graph: {error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className="w-5xl h-screen bg-[#050a1c] rounded-lg shadow-lg overflow-hidden border border-[#1a2552]"
    >
      {/* Add this refresh button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleRefreshGraph}
          disabled={refreshing}
          className="px-3 py-1 bg-blue-700 rounded text-sm text-white hover:bg-blue-600 transition"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Graph'}
        </button>
      </div>
      
      {/* Inner wrapper for ReactFlow that will be zoomed */}
      <div
        ref={reactFlowWrapperRef}
        className="w-full h-full"
        style={{ 
          overflow: "hidden",
          position: "relative" // Add this line
        }}
      >
        <ReactFlow
          nodes={nodes || []}  // Ensure nodes is never undefined
          edges={edges || []}  // Ensure edges is never undefined
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onMove={onMove} // Use this callback
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          defaultEdgeOptions={{
            style: { stroke: "rgba(77, 124, 254, 0.6)" },
            animated: false,
            type: "custom",
          }}
          nodesFocusable={false}
          edgesFocusable={false}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
        >
          {/* You can add a fallback here if needed */}
          {(!nodes?.length || !edges?.length) && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              No data to display
            </div>
          )}
        </ReactFlow>
        {/* Add zoom controls to the UI for better interactivity */}
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => {
              const { x, y } = reactFlowInstance.getViewport();
              reactFlowInstance.setViewport({ x, y, zoom: reactFlowInstance.getZoom() * 1.2 });
            }}
            className="w-8 h-8 bg-blue-700 rounded text-white hover:bg-blue-600 transition flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => {
              const { x, y } = reactFlowInstance.getViewport();
              reactFlowInstance.setViewport({ x, y, zoom: reactFlowInstance.getZoom() * 0.8 });
            }}
            className="w-8 h-8 bg-blue-700 rounded text-white hover:bg-blue-600 transition flex items-center justify-center"
          >
            -
          </button>
          <button
            onClick={() => {
              reactFlowInstance.fitView({ padding: 0.3 });
            }}
            className="w-8 h-8 bg-blue-700 rounded text-white hover:bg-blue-600 transition flex items-center justify-center"
          >
            ⟲
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NetworkGraphWrapper() {
  return (
    <ReactFlowProvider>
      <div className="bg-black">
        <NetworkGraph />
      </div>
    </ReactFlowProvider>
  );
}
