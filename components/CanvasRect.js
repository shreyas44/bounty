import { Text, Rect } from "react-konva";

const getScaleVal = (scale) => (scale < 1 ? 0.9 : 1.1);

export function GroupRect(props) {
  const scale =
    props.scale < 1
      ? Math.min(2, 1 / props.scale)
      : Math.max(1, 1 / props.scale);

  return (
    <>
      <Text
        text={props.label}
        fontSize={26}
        fill="#A8A8A8"
        x={props.x}
        y={props.y - 35 * scale * getScaleVal(props.scale)}
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
  );
}
