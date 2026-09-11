const http = require('http');

http.get('http://localhost:3000/product/PRD-TPLINK-DECO-X20-3PK', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    const hasLightboxModal = body.includes('id="productImageLightbox"');
    const hasMainImgClick = body.includes('onclick="openLightboxCurrent()"');
    const hasZoomBar = body.includes('class="product-lightbox-zoom-bar"');
    const hasCloseBtn = body.includes('class="product-lightbox-close"');
    const hasPrevNext = body.includes('product-lightbox-prev') && body.includes('product-lightbox-next');

    console.log("✓ Lightbox Modal Present:", hasLightboxModal);
    console.log("✓ Main Image Clickable:", hasMainImgClick);
    console.log("✓ Zoom Bar Present:", hasZoomBar);
    console.log("✓ Close Button Present:", hasCloseBtn);
    console.log("✓ Prev/Next Buttons Present:", hasPrevNext);

    if (hasLightboxModal && hasMainImgClick && hasZoomBar && hasCloseBtn && hasPrevNext) {
      console.log("\n✅ ALL LIGHTBOX CHECKS PASSED FOR PRD-TPLINK-DECO-X20-3PK!");
    } else {
      console.error("\n❌ LIGHTBOX CHECK FAILED");
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error("HTTP Request Error:", err.message);
  process.exit(1);
});
