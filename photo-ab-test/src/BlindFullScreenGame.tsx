interface BlindFullScreenGameProps {
  testId: string;
  images: string[];
  onFinish: () => void;
}

export default function BlindFullScreenGame({
  testId,
  images,
  onFinish
}: BlindFullScreenGameProps) {

  async function vote(selectedIndex: number) {
    const payload = {
      testId,
      chosenIndex: selectedIndex,
      timestamp: new Date().toISOString(),
    };

      console.log("Nuevo voto:", JSON.stringify(payload));

    // Después del voto, pasamos al siguiente test
    setTimeout(() => {
      onFinish();   // 👈 solo avisamos al padre
    }, 500);
  }

return (
  <div className="container-fluid h-100">
    <div className="row images-wrapper">
      {images.map((img, i) => (
        <div
          key={i}
          className="col-12 col-md-4 p-0 position-relative image-cell"
          onClick={() => vote(i)}
        >
          <img src={img} className="full-image" />
          <div className="select-label">Elegir</div>
        </div>
      ))}
    </div>
  </div>
);

}