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

    await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    // Después del voto, pasamos al siguiente test
    setTimeout(() => {
      onFinish();   // 👈 solo avisamos al padre
    }, 500);
  }

  return (
    <div className="container-fluid h-100">
      <div className="row images-wrapper">
        {/* Desktop y tablets → columnas normales */}
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

      {/* Móvil → fila horizontal con scroll */}
      <div className="mobile-row d-flex d-md-none mt-3">
        {images.map((img, i) => (
          <div
            key={i}
            className="image-cell"
            onClick={() => vote(i)}
          >
            <img src={img} className="img-fluid" />
            <div className="select-label text-center">Elegir</div>
          </div>
        ))}
      </div>
    </div>
  );

}
