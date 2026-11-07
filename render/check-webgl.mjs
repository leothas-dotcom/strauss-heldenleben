// Tarkistaa, että Puppeteerin headless-Chrome saa WebGL2-kontekstin, ja tulostaa näytönohjaimen nimen.
// SwiftShader = ohjelmistorenderöinti (toimii, mutta hidas).
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--ignore-gpu-blocklist', '--enable-gpu'],
});
try {
  const page = await browser.newPage();
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  if (!renderer) {
    console.error('WebGL2 ei käytettävissä');
    process.exitCode = 1;
  } else {
    console.log(renderer);
  }
} finally {
  await browser.close();
}
