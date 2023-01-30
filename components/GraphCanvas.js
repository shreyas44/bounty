import { useState, useRef, useEffect, Fragment, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import { CanvasImage } from "./CanvasImage";
import { CanvasArrow } from "./CanvasArrow";
import { GroupRect } from "./CanvasRect";
import { CanvasLightbox } from "./CanvasLightbox";

import "react-image-lightbox/style.css";

const getBoundaries = (nodes) => ({
  minX: nodes.reduce((min, node) => Math.min(min, node.x), Infinity),
  maxX: nodes.reduce(
    (max, node) => Math.max(max, node.x + node.width),
    -Infinity
  ),
  minY: nodes.reduce((min, node) => Math.min(min, node.y), Infinity),
  maxY: nodes.reduce(
    (max, node) => Math.max(max, node.y + node.height),
    -Infinity
  ),
});

const getInitialOffset = (nodes) => {
  const { minX, maxX, minY, maxY } = getBoundaries(nodes);
  const scale = getInitialScale(nodes);

  return {
    x: getMidpoint(minX, maxX) - (1 / scale) * (window.innerWidth / 2),
    y: getMidpoint(minY, maxY) - (1 / scale) * (window.innerHeight / 2),
  };
};

const getInitialScale = (nodes) => {
  const { minX, maxX, minY, maxY } = getBoundaries(nodes);

  const windowAspectRatio = Math.abs(window.innerWidth / window.innerHeight);
  const graphAspectRatio = Math.abs((maxX - minX) / (maxY - minY));
  const scale =
    windowAspectRatio > graphAspectRatio
      ? window.innerHeight / (maxY - minY)
      : window.innerWidth / (maxX - minX);

  return scale * 0.9;
};

const getDistance = (p1, p2) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const getMidpoint = (x1, x2) => (x1 + x2) / 2;
const getCenter = (p1, p2) => ({
  x: getMidpoint(p1.x, p2.x),
  y: getMidpoint(p2.x, p2.y),
});

const createNodesMap = (nodes) => {
  const map = {};
  nodes.forEach((node) => (map[node.id] = node));
  return map;
};

const getImages = (nodes) =>
  nodes.filter((node) => node.type === "file").map((node) => node.file);

export default function GraphCanvas(props) {
  const layerRef = useRef();

  const edges = useMemo(() => props.edges || [], [props.edges]);
  const nodes = useMemo(() => props.nodes || [], [props.nodes]);
  const nodesMap = useMemo(() => createNodesMap(nodes), [nodes]);
  const imageSrcs = useMemo(() => getImages(nodes), [nodes]);

  const initialPosn = useMemo(
    () => getInitialOffset(nodes, getInitialScale(nodes)),
    [nodes]
  );
  const center = useRef(null);
  const distance = useRef(null);
  const isDragging = useRef(false);

  const [isDraggable, setIsDraggable] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currImage, setCurrImage] = useState(0);
  const [scale, setScale] = useState(getInitialScale(nodes));
  const [posn, setPosn] = useState({ x: 0, y: 0 });

  const rectChildren = nodes
    .filter((node) => node.type === "group")
    .map((node) => <GroupRect key={node.id} scale={scale} {...node} />);

  const imageChildren = nodes
    .filter((node) => node.type === "file")
    .map((node, idx) => (
      <CanvasImage
        key={node.id}
        scale={scale}
        onClick={() => {
          setCurrImage(idx);
          setShowLightbox(true);
        }}
        {...node}
      />
    ));

  const arrowChildren = edges.map((edge) => (
    <CanvasArrow
      key={edge.id}
      from={nodesMap[edge.fromNode]}
      to={nodesMap[edge.toNode]}
      edge={edge}
    />
  ));

  const handleWheel = (e) => {
    // stop default scrolling
    e.evt.preventDefault();

    const scaleBy = 1.025;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const newScale = direction > 0 ? scale * scaleBy : scale / scaleBy;
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setPosn(newPos);
  };

  const onKeydown = (e) => {
    if (e.code === "Space") {
      const container = layerRef.current.getStage().container();
      container.style.cursor = "grab";
      setIsDraggable(true);
    }
  };

  const onKeyup = (e) => {
    if (e.code === "Space") {
      const container = layerRef.current.getStage().container();
      container.style.cursor = "default";
      setIsDraggable(false);
    }
  };

  const onTouchEnd = () => {
    distance.current = 0;
    center.current = null;
  };

  const getNewPosn = (stage, scale, oldCenter, newCenter) => {
    // calculate new position of the stage
    const dx = newCenter.x - oldCenter.x;
    const dy = newCenter.y - oldCenter.y;

    // local coordinates of center point
    const pointTo = {
      x: (newCenter.x - stage.x()) / stage.scaleX(),
      y: (newCenter.y - stage.y()) / stage.scaleX(),
    };

    return {
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
    };
  };

  const onTouchMove = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (!touch1 || !touch2) {
      const newCenter = { x: touch1.clientX, y: touch1.clientY };
      if (!center.current) {
        center.current = newCenter;
      }

      setPosn(getNewPosn(stage, stage.scaleX(), center.current, newCenter));
      center.current = newCenter;
      distance.current = 0;
      isDragging.current = true;
      return;
    }

    // if the stage was under Konva's drag&drop
    // we need to stop it, and implement our own pan logic with two pointers
    if (stage.isDragging()) stage.stopDrag();

    const p1 = { x: touch1.clientX, y: touch1.clientY };
    const p2 = { x: touch2.clientX, y: touch2.clientY };
    const newCenter = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!center.current || isDragging.current) {
      center.current = getCenter(p1, p2);
    }

    if (!distance.current) {
      distance.current = dist;
    }

    const scale = stage.scaleX() * (dist / distance.current);

    distance.current = dist;
    center.current = newCenter;
    isDragging.current = false;

    setScale(scale);
    setPosn(getNewPosn(stage, scale, center.current, newCenter));
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);

    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("keyup", onkeyup);
    };
  }, []);

  return (
    <Fragment>
      {showLightbox && (
        <CanvasLightbox
          currImage={currImage}
          setCurrImage={setCurrImage}
          setShowLightbox={setShowLightbox}
          images={imageSrcs}
        />
      )}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        draggable={isDraggable}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        scaleX={scale}
        scaleY={scale}
        x={posn.x}
        y={posn.y}
        offsetX={initialPosn.x}
        offsetY={initialPosn.y}
      >
        <Layer
          width={window.innerWidth}
          height={window.innerHeight}
          ref={layerRef}
        >
          {arrowChildren}
          {rectChildren}
          {imageChildren}
        </Layer>
      </Stage>
    </Fragment>
  );
}
