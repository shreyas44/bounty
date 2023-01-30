import Lightbox from "react-image-lightbox";

export function CanvasLightbox(props) {
  const {currImage, setCurrImage, setShowLightbox, images} = props

  return (
    <Lightbox
      mainSrc={images[currImage]}
      nextSrc={images[(currImage + 1) % images.length]}
      prevSrc={images[(currImage + images.length - 1) % images.length]}
      onCloseRequest={() => setShowLightbox(false)}
      onMovePrevRequest={() =>
        setCurrImage((currImage + images.length - 1) % images.length)
      }
      onMoveNextRequest={() =>
        setCurrImage((currImage + 1) % images.length)
      }
    />
  )
}
