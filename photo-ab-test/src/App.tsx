import { useState } from "react";
import BlindFullScreenGame from "./BlindFullScreenGame.tsx";  // 👈 corregido

const tests = [
  {
    id: "test-donas",
    images: [
      "/images/donas_original.webp",
      "/images/donas_gemini.png",
      "/images/donas_gpt.png"
    ]
  },
  {
    id: "test-shark",
    images: [
      "/images/shark_original.webp",
      "/images/shark_gemini.png",
      "/images/shark_gpt.png"
    ]
  },
  {
    id: "test-tun-tun-sahur",
    images: [
      "/images/tuntun_original.png",
      "/images/tuntun_gemini.png",
      "/images/tuntun_gpt.png"
    ]
  }
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  function handleFinishTest() {
    if (index + 1 < tests.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  }

  if (showIntro) {
  return (
    <div className="d-flex flex-column h-100 justify-content-center align-items-center bg-dark text-white p-4 text-center">

      <h1>Evaluación de Calidad de Imágenes</h1>
      <p className="mt-3 fs-5" style={{ maxWidth: "600px" }}>
        En este test verás conjuntos de 3 imágenes del mismo producto o diseño.  
        Tu tarea es <strong>seleccionar la imagen que consideres que tiene la mejor calidad visual</strong>.
        Solo necesitas dar clic en la imagen que creas que se ve mejor.
      </p>

      <button
        className="btn btn-primary btn-lg mt-4"
        onClick={() => setShowIntro(false)}
      >
        Comenzar
      </button>

    </div>
  );
}


  if (finished) {
    return (
      <div className="d-flex h-100 justify-content-center align-items-center bg-dark text-white">
        <h1>¡Gracias por participar!</h1>
      </div>
    );
  }

  const current = tests[index];

  return (
    <BlindFullScreenGame
      testId={current.id}
      images={current.images}
      onFinish={handleFinishTest}
    />
  );
}
