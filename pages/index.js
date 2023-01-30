import dynamic from "next/dynamic";

const GraphCanvas = dynamic(() => import("../components/GraphCanvas"), {
  ssr: false,
});

const data = {
  nodes: [
    {
      id: "86a20c23e3354d5d",
      x: -118,
      y: -607,
      width: 995,
      height: 495,
      type: "group",
      label: "Group 1",
    },
    {
      id: "073b3029c47e8961",
      x: -118,
      y: 13,
      width: 995,
      height: 529,
      type: "group",
      label: "Group 2",
    },
    {
      id: "3cd5a8fdf65057fb",
      x: -58,
      y: -555,
      width: 400,
      height: 267,
      type: "file",
      file: "image1.png",
    },
    {
      id: "d2b648bd165688da",
      x: 559,
      y: -555,
      width: 267,
      height: 400,
      type: "file",
      file: "image2.png",
    },
    {
      id: "cb5f69b2e0f40896",
      x: -58,
      y: 80,
      width: 267,
      height: 400,
      type: "file",
      file: "image3.png",
    },
    {
      id: "6b57df8d41cdbeed",
      x: 506,
      y: 80,
      width: 320,
      height: 400,
      type: "file",
      file: "image4.png",
    },
  ],
  edges: [
    {
      id: "f3c8a0927cec4d66",
      fromNode: "3cd5a8fdf65057fb",
      fromSide: "right",
      toNode: "d2b648bd165688da",
      toSide: "left",
    },
    {
      id: "2cbee2b7fd13b217",
      fromNode: "cb5f69b2e0f40896",
      fromSide: "right",
      toNode: "6b57df8d41cdbeed",
      toSide: "left",
    },
    {
      id: "de0591ada37c3271",
      fromNode: "d2b648bd165688da",
      fromSide: "bottom",
      toNode: "073b3029c47e8961",
      toSide: "left",
    },
  ],
};

export default function Home() {
  return <GraphCanvas nodes={data.nodes} edges={data.edges} />;
}
