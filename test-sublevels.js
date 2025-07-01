// Script de prueba para verificar subniveles
console.log("Testing sublevel functionality for all JLPT levels...");

async function testSublevels() {
  const levels = ["jlpt-5", "jlpt-4", "jlpt-3", "jlpt-2", "jlpt-1"];

  for (const level of levels) {
    try {
      console.log(`\n=== Testing ${level.toUpperCase()} ===`);

      const response = await fetch(`https://kanjiapi.dev/v1/kanji/${level}`);
      if (!response.ok) {
        console.error(`Error fetching ${level}: ${response.status}`);
        continue;
      }

      const kanjiList = await response.json();
      const totalKanjis = kanjiList.length;
      const kanjisPerSublevel = 100;
      const totalSublevels = Math.ceil(totalKanjis / kanjisPerSublevel);

      console.log(`Total kanjis: ${totalKanjis}`);
      console.log(`Sublevels needed: ${totalSublevels}`);
      console.log(`Should use sublevels: ${totalSublevels > 1 ? "YES" : "NO"}`);

      if (totalSublevels > 1) {
        console.log("Sublevel breakdown:");
        for (let i = 1; i <= totalSublevels; i++) {
          const startIndex = (i - 1) * kanjisPerSublevel;
          const endIndex = Math.min(
            startIndex + kanjisPerSublevel,
            totalKanjis
          );
          const kanjiCount = endIndex - startIndex;
          console.log(
            `  Sublevel ${i}: Kanjis ${
              startIndex + 1
            }-${endIndex} (${kanjiCount} kanjis)`
          );
        }
      }
    } catch (error) {
      console.error(`Error testing ${level}:`, error);
    }
  }
}

// Ejecutar test cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", testSublevels);
} else {
  testSublevels();
}
