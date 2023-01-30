import { useRef } from "react";
import { Arrow } from "react-konva";

const getMidpoint = (x1, x2) => (x1 + x2) / 2;
const getDistance = (p1, p2) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

function getOpposite(side) {
  switch (side) {
    case "top":
      return "bottom";
    case "right":
      return "left";
    case "bottom":
      return "top";
    case "left":
      return "right";
  }
}

function getSideMiddle(side, node) {
  let x;
  let y;

  switch (side) {
    case "top":
      x = node.x + node.width / 2;
      y = node.y;
      break;
    case "right":
      x = node.x + node.width;
      y = node.y + node.height / 2;
      break;
    case "bottom":
      x = node.x + node.width / 2;
      y = node.y + node.height;
      break;
    case "left":
      x = node.x;
      y = node.y + node.height / 2;
      break;
  }

  return { x, y };
}

export function CanvasArrow(props) {
  const { edge, from, to } = props;
  const { x: fromX, y: fromY } = getSideMiddle(edge.fromSide, from);
  const { x: toX, y: toY } = getSideMiddle(edge.toSide, to);
  const midX = getMidpoint(fromX, toX);
  const midY = getMidpoint(fromY, toY);
  const ref = useRef();
  const length = getDistance({ x: fromX, y: fromY }, { x: toX, y: toY });
  const points = [fromX, fromY, midX, midY];

  if (length > 300 && edge.toSide !== getOpposite(edge.fromSide)) {
    points.push(toX - 20);
    points.push(toY - 20);
  }

  return (
    <Arrow
      points={[...points, toX, toY]}
      strokeWdith={10}
      stroke="#686869"
      fill="#686869"
      tension={1}
      lineJoin="miter"
      ref={ref}
      bezier={true}
    />
  );
}
