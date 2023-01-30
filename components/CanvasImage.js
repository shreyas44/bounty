import {Text, Image} from "react-konva"
import useImage from "use-image"

const getScaleVal = (scale) => scale < 1 ? 0.9 : 1.1

export function CanvasImage(props) {
  const [image] = useImage(props.file)
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
        onClick={props.onClick}
      />
    </>
  )
}
