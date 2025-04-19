"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom straight edge with no markers
const CustomStraightEdge = ({
  id,
  source,
  target,
  style = {},
  markerEnd = "",
  markerStart = "",
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  ...props
}) => {
  // Draw a simple line with no markers
  return (
    <g>
      <path
        style={style}
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
        markerEnd={markerEnd}
        markerStart={markerStart}
        fill="none"
      />
    </g>
  );
};

const CustomNode = ({ data }) => {
  return (
    <div style={{ color: "white", textAlign: "center", fontSize: "12px" }}>
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCenter, setZoomCenter] = useState(null);
  const reactFlowInstance = useReactFlow();
  const zoomTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const reactFlowWrapperRef = useRef(null); // Reference to the inner ReactFlow wrapper

  // Reset zoom and position when component unmounts
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  // Apply the zoom effect to the ReactFlow wrapper only
  useEffect(() => {
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

  // Find connected nodes and edges for a given node
  const findConnections = useCallback(
    (nodeId) => {
      const connectedEdgeIds = [];
      const connectedNodeIds = [nodeId];

      edges.forEach((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          connectedEdgeIds.push(edge.id);

          // Add the node on the other end of this edge
          const connectedNodeId =
            edge.source === nodeId ? edge.target : edge.source;
          if (!connectedNodeIds.includes(connectedNodeId)) {
            connectedNodeIds.push(connectedNodeId);
          }
        }
      });

      return { connectedNodeIds, connectedEdgeIds };
    },
    [edges]
  );

  // Handle node mouse enter
  const onNodeMouseEnter = useCallback(
    (event, node) => {
      const { connectedNodeIds, connectedEdgeIds } = findConnections(node.id);

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

  // Handle node mouse leave
  const onNodeMouseLeave = useCallback(() => {
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
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: "rgba(77, 124, 254, 0.6)",
          strokeWidth: 1.5,
          opacity: 1,
        },
        animated: false,
        type: "custom", // Ensure custom edge type is maintained
      }))
    );

    // Reset zoom
    setZoomLevel(1);
    setZoomCenter(null);
  }, [setEdges, setNodes]);

  return (
    <div
      ref={containerRef}
      className="w-5xl h-screen bg-[#050a1c] rounded-lg shadow-lg overflow-hidden border border-[#1a2552]"
    >
      {/* Inner wrapper for ReactFlow that will be zoomed */}
      <div
        ref={reactFlowWrapperRef}
        className="w-full h-full"
        style={{ overflow: "hidden" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
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
        ></ReactFlow>
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
