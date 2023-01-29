import {useState, useRef, useEffect, createContext, useContext, Fragment} from "react"
import {Stage, Layer, Text, Rect, Image, Arrow} from "react-konva"
import useImage from "use-image"
import 'react-image-lightbox/style.css';
import Lightbox from "react-image-lightbox";

const LightBoxContext = createContext()

function getMiddle(nodes) {
  let lowX, highX, lowY, highY;

  for (const node of nodes) {
    const {x, y, width, height} = node

    if (lowX === undefined || x < lowX) lowX = x
    if (highX === undefined || x + width > highX) highX = x + width
    if (highY === undefined || y + height > highY) highY = y - height
    if (lowY === undefined || y < lowY) lowY = y
  }

  console.log({lowX, highX, lowY, highY})

  return {
    x: (lowX + highX) / 2,
    y: (lowY + highY) / 2,
  }
}

function getScaleVal(scale) {
  if (scale < 1) return 0.9
  return 1.1
}

function getCenter(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function createNodesMap(nodes) {
  const nodesMap = {}
  for (const node of nodes) {
    nodesMap[node.id] = node
  }

  return nodesMap
}

function GroupRect(props) {
  const scale =
    props.scale < 1 ?
      Math.min(2, 1 / props.scale) :
      Math.max(1, 1 / props.scale)

  return (
    <>
      <Text
        text={props.label}
        fontSize={26}
        fill="#A8A8A8"
        x={props.x}
        y={props.y - (35 * scale * getScaleVal(props.scale))}
        scaleX={scale}
        scaleY={scale}
      />
      <Rect
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        fill="white"
        cornerRadius={5}
        stroke="white"
        strokeWidth={10}
        opacity={0.05}
      />
    </>
  )
}

function CanvasImage(props) {
  const [image] = useImage("https://source.unsplash.com/random")
  const {setShowLightbox} = useContext(LightBoxContext)
  const scale =
    props.scale < 1 ?
      Math.min(2, 1 / props.scale) :
      Math.max(1, 1 / props.scale)

  return (
    <>
      <Text
        text={props.file}
        x={props.x}
        y={props.y - (27 * scale * getScaleVal(props.scale))}
        fontSize={18}
        fill="#7E7F7E"
        scaleX={scale}
        scaleY={scale}
      />
      <Image
        alt=""
        image={image}
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        stroke="#444444"
        strokeWidth={3}
        cornerRadius={5}
        onClick={() => setShowLightbox(true)}
      />
    </>
  )
}

function getSideMiddle(side, node) {
  let x;
  let y;

  switch (side) {
    case "top":
      x = node.x + (node.width / 2)
      y = node.y;
      break;
    case "right":
      x = node.x + node.width
      y = node.y + (node.height / 2)
      break;
    case "bottom":
      x = node.x + (node.width / 2)
      y = node.y + node.height
      break;
    case "left":
      x = node.x
      y = node.y + (node.height / 2)
      break;
  }

  return {x, y}
}

function CanvasArrow(props) {
  const {edge, from, to} = props
  const {x: fromX, y: fromY} = getSideMiddle(edge.fromSide, from)
  const {x: toX, y: toY} = getSideMiddle(edge.toSide, to)
  const ref = useRef()

  useEffect(() => {
    //console.log(ref.current)
    //ref.current.bezier(true)
    //ref.current.tension(3)
  })

  return (
    <Arrow
      //x={fromX}
      //y={fromY}
      points={[fromX, fromY, toX, toY]}
      strokeWdith={10}
      stroke="#686869"
      fill="#686869"
      tension={50}
      lineJoin="bevel"
      ref={ref}
    //fill="white"
    />
  )
}

export default function GraphCanvas(props) {
  const nodes = props.nodes || []
  const edges = props.edges || []
  const nodesMap = createNodesMap(nodes)
  const layerRef = useRef()
  const [isDraggable, setIsDraggable] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [scale, setScale] = useState(1)
  const [posn, setPosn] = useState(getMiddle(nodes))
  //const [posn, setPosn] = useState({x: 0, y: 0})

  const center = useRef(null)
  const distance = useRef(null)
  const isDragging = useRef(false)

  const nodeChildren = nodes.map(node =>
    node.type === "group"
      ? <GroupRect key={node.id} scale={scale} {...node} />
      : <CanvasImage key={node.id} scale={scale} {...node} />
    //: null
  )

  const arrowChildren = edges.map(edge => {
    return (
      <CanvasArrow
        key={edge.id}
        from={nodesMap[edge.fromNode]}
        to={nodesMap[edge.toNode]}
        edge={edge}
      />
    )
  })

  const handleWheel = (e) => {
    // stop default scrolling
    e.evt.preventDefault();

    const scaleBy = 1.025
    const stage = e.target.getStage()
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

    //stage.scale({x: newScale, y: newScale});
    //stage.position(newPos);
    setScale(newScale)
    setPosn(newPos)
  }

  const onKeydown = (e) => {
    if (e.code === "Space") {
      const container = layerRef.current.getStage().container()
      container.style.cursor = "grab"
      setIsDraggable(true)
    }
  }

  const onKeyup = (e) => {
    if (e.code === "Space") {
      const container = layerRef.current.getStage().container()
      container.style.cursor = "default"
      setIsDraggable(false)
    }
  }

  const onTouchEnd = () => {
    distance.current = 0
    center.current = null
  }

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
  }

  const onTouchMove = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (!touch1 || !touch2) {
      const newCenter = {x: touch1.clientX, y: touch1.clientY};
      if (!center.current) {
        center.current = newCenter;
      }

      setPosn(getNewPosn(stage, stage.scaleX(), center.current, newCenter))
      center.current = newCenter;
      distance.current = 0;
      isDragging.current = true;
      return
    }

    // if the stage was under Konva's drag&drop
    // we need to stop it, and implement our own pan logic with two pointers
    if (stage.isDragging()) stage.stopDrag();

    const p1 = {x: touch1.clientX, y: touch1.clientY};
    const p2 = {x: touch2.clientX, y: touch2.clientY};
    const newCenter = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!center.current || isDragging.current) {
      center.current = getCenter(p1, p2);
    }

    if (!distance.current) {
      distance.current = dist;
    }

    const scale = stage.scaleX() * (dist / distance.current);

    setScale(scale);
    setPosn(getNewPosn(stage, scale, center.current, newCenter))
    distance.current = dist;
    center.current = newCenter;
    isDragging.current = false;
  }

  useEffect(() => {
    window.addEventListener("keydown", onKeydown)
    window.addEventListener("keyup", onKeyup)

    return () => {
      window.removeEventListener("keydown", onKeydown)
      window.removeEventListener("keyup", onkeyup)
    }
  }, [])

  console.log(posn)
  return (
    <Fragment>
      {showLightbox && (
        <Lightbox
          mainSrc="https://source.unsplash.com/random"
          nextSrc="https://source.unsplash.com/random"
          prevSrc="https://source.unsplash.com/random"
          onCloseRequest={() => setShowLightbox(false)}
        />
      )}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={handleWheel}
        draggable={isDraggable}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        x={posn.x}
        y={posn.y}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer
          width={window.innerWidth}
          height={window.innerHeight}
          ref={layerRef}
        >
          <Rect
            width={10}
            height={10}
            fill="red"
            stroke="red"
            x={-118}
            y={13 + 529}
          />
          <LightBoxContext.Provider value={{showLightbox, setShowLightbox}}>
            {arrowChildren}
            {nodeChildren}
          </LightBoxContext.Provider>

        </Layer>
      </Stage>
    </Fragment>
  )
}

// TODO
// 1. Pinch to zoom on phone - Done
// 2. Curvy arrows
// 3. Same size text - Done
// 4. Zoomed out when page is initially visited
// 5. Use real images
// 6. Cleanup code
