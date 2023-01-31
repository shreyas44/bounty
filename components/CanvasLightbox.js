import Lightbox from "react-image-lightbox";

export function CanvasLightbox(props) {
  let { currImage, setCurrImage, setShowLightbox, images } = props;

  return (
    <Lightbox
      mainSrc={images[currImage]}
      nextSrc={images[(currImage + 1) % images.length]}
      prevSrc={images[(currImage + images.length - 1) % images.length]}
      onCloseRequest={() => setShowLightbox(false)}
      onImageLoad={() => {
        // hack to load initial image in react strict mode
        // https://github.com/frontend-collective/react-image-lightbox/issues/589#issuecomment-1159723673jnku
        window.dispatchEvent(new Event("resize"));
      }}
      onMovePrevRequest={() =>
        setCurrImage((currImage + images.length - 1) % images.length)
      }
      onMoveNextRequest={() => setCurrImage((currImage + 1) % images.length)}
    />
  );
}
