import React, { useEffect, useRef, useState } from "react";

/*
Vercel — Blind A/B/C Benchmark (single-file React component)

Objetivo: probar de forma ciega (A/B/C) cuál imagen prefieren los evaluadores.
Características:
- Subir 3 variantes por 'test' (p.ej. Original, AI-enhanced 1, AI-enhanced 2)
- Cada sesión aleatoriza la asignación interna de variantes a las etiquetas A / B / C (ciegas para el usuario)
- El evaluador ve sólo A / B / C (sin saber cuál es cuál) y elige su favorita
- Guardado de votos y asignaciones en localStorage
- Exportar resultados en CSV (incluye mapeo para poder desbloquear cuál etiqueta era cuál)
- Simple: sin backend (pero siguiente paso sugerido: enviar a API para recopilación centralizada)

Instrucciones de uso:
- Inserta este componente en una página de Next.js (app/page.jsx o pages/index.jsx)
- Tailwind opcional; el estilo usa clases básicas para mantenerse legible.
*/

export default function BlindABC() {
  const [tests, setTests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blindABC:tests:v1")) || [];
    } catch (e) {
      return [];
    }
  });

  const [votes, setVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blindABC:votes:v1")) || [];
    } catch (e) {
      return [];
    }
  });

  const fileRefs = [useRef(null), useRef(null), useRef(null)];
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem("blindABC:tests:v1", JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem("blindABC:votes:v1", JSON.stringify(votes));
  }, [votes]);

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function handleCreateTest(e) {
    e.preventDefault();
    const files = fileRefs.map((r) => r.current && r.current.files && r.current.files[0]);
    if (files.some((f) => !f)) return alert("Selecciona las 3 imágenes (A, B, C). Si no quieres usar nombres, súbelas en cualquier orden.");

    const data = await Promise.all(files.map((f) => readFileAsDataURL(f)));

    // Generar asignación aleatoria: map labels A,B,C -> variants 0,1,2
    const labels = ["A", "B", "C"];
    const variants = [0, 1, 2];
    const shuffled = variants.sort(() => Math.random() - 0.5);

    const mapping = {
      A: shuffled[0],
      B: shuffled[1],
      C: shuffled[2],
    };

    const newTest = {
      id: Date.now().toString(),
      name: `Test ${tests.length + 1}`,
      createdAt: new Date().toISOString(),
      images: data, // images[0], images[1], images[2] correspond to variant indexes (0..2)
      mapping, // which variant index is shown under A/B/C for this test
      completed: 0,
    };

    setTests((t) => [newTest, ...t]);
    fileRefs.forEach((r) => (r.current.value = ""));
    setActiveTestIndex(0);
  }

  function handleVote(testId, chosenLabel) {
    const test = tests.find((t) => t.id === testId);
    if (!test) return;

    // store vote record: keep label chosen, timestamp, and mapping (so later we know which variant it was)
    const record = {
      id: Date.now().toString(),
      testId,
      chosenLabel,
      chosenVariantIndex: test.mapping[chosenLabel],
      mapping: test.mapping,
      timestamp: new Date().toISOString(),
    };

    setVotes((v) => [record, ...v]);
    setTests((ts) => ts.map((x) => (x.id === testId ? { ...x, completed: (x.completed || 0) + 1 } : x)));
  }

  function deleteTest(id) {
    if (!confirm("Eliminar este test y sus votos locales?")) return;
    setTests((t) => t.filter((x) => x.id !== id));
    setVotes((v) => v.filter((s) => s.testId !== id));
    setActiveTestIndex(0);
  }

  function exportCSV() {
    // CSV with votes plus test mapping info so you can decode which label was which variant
    const header = [
      "voteId",
      "testId",
      "testName",
      "timestamp",
      "chosenLabel",
      "chosenVariantIndex",
      "mapping_A",
      "mapping_B",
      "mapping_C",
    ];

    const rows = votes.map((v) => {
      const test = tests.find((t) => t.id === v.testId);
      return [
        v.id,
        v.testId,
        test ? test.name : "(missing)",
        v.timestamp,
        v.chosenLabel,
        String(v.chosenVariantIndex),
        String(v.mapping.A),
        String(v.mapping.B),
        String(v.mapping.C),
      ];
    });

    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("
");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blind-abc-votes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Benchmark ciego A/B/C — prueba rápida</h1>

        <section className="bg-white p-4 rounded shadow-sm mb-6">
          <form onSubmit={handleCreateTest} className="space-y-3">
            <div className="text-sm text-gray-600">Crea un nuevo test subiendo 3 variantes (en el orden que prefieras). Se mostrarán como A, B, C de forma ciega.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <label className="text-xs">Variante 1 <input ref={fileRefs[0]} type="file" accept="image/*" className="block mt-1" /></label>
              <label className="text-xs">Variante 2 <input ref={fileRefs[1]} type="file" accept="image/*" className="block mt-1" /></label>
              <label className="text-xs">Variante 3 <input ref={fileRefs[2]} type="file" accept="image/*" className="block mt-1" /></label>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Crear test ciego A/B/C</button>
              <button
                type="button"
                onClick={() => { setTests([]); setVotes([]); localStorage.removeItem("blindABC:tests:v1"); localStorage.removeItem("blindABC:votes:v1"); }}
                className="px-3 py-2 bg-red-50 text-red-600 rounded"
              >
                Limpiar todo
              </button>
              <button type="button" onClick={exportCSV} className="ml-auto px-3 py-2 bg-white border rounded">Exportar votos CSV</button>
            </div>
          </form>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-white p-3 rounded shadow-sm">
            <div className="text-sm font-medium mb-2">Tests disponibles</div>
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {tests.map((t, i) => (
                <div key={t.id} className={`p-2 rounded ${i === activeTestIndex ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-gray-500">Creado: {new Date(t.createdAt).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Votos: {t.completed || 0}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setActiveTestIndex(i)} className="px-2 py-1 text-xs border rounded">Abrir</button>
                      <button onClick={() => deleteTest(t.id)} className="px-2 py-1 text-xs text-red-600">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
              {tests.length === 0 && <div className="text-xs text-gray-500">No hay tests — crea uno arriba.</div>}
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-4 rounded shadow-sm">
            <div className="text-sm font-medium mb-3">Encuestador (modo ciego)</div>
            {tests.length === 0 ? (
              <div className="text-xs text-gray-500">Añade un test para empezar.</div>
            ) : (
              (() => {
                const test = tests[activeTestIndex] || tests[0];
                if (!test) return null;

                // Build label -> image url using mapping
                const labelToImage = {
                  A: test.images[test.mapping.A],
                  B: test.images[test.mapping.B],
                  C: test.images[test.mapping.C],
                };

                return (
                  <div>
                    <div className="mb-2 text-xs text-gray-500">Selecciona la imagen que prefieras — las etiquetas A/B/C están aleatorizadas por test.</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(["A", "B", "C"]).map((label) => (
                        <button key={label} onClick={() => handleVote(test.id, label)} className="flex flex-col items-center p-2 border rounded hover:shadow-sm">
                          <div className="text-sm font-semibold mb-2">{label}</div>
                          <img src={labelToImage[label]} alt={`label-${label}`} className="max-h-48 object-contain" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-gray-600">Votos recogidos en este navegador: {votes.filter((v) => v.testId === test.id).length}</div>
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Resultados (decodificados)</div>
                      <div className="text-xs text-gray-600">Usa esto para comprobar cuántos votos recibió cada variante real (0/1/2).</div>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[0, 1, 2].map((variantIdx) => {
                          const count = votes.filter((v) => v.testId === test.id && v.chosenVariantIndex === variantIdx).length;
                          return (
                            <div key={variantIdx} className="p-2 border rounded text-center">
                              <div className="text-xs text-gray-500">Variante {variantIdx}</div>
                              <div className="text-lg font-semibold">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </section>

        <footer className="mt-6 text-xs text-gray-500">Notas: este test es local (sin backend). Para recopilar respuestas de varias personas en diferentes dispositivos, conecta la función de voto a una API o a Google Forms / Airtable. Puedo ayudarte a integrarlo si quieres.</footer>
      </div>
    </div>
  );
}
