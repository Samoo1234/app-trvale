const sharp = require('sharp');

// Criar ícone 1024x1024 com fundo vermelho
const width = 1024;
const height = 1024;

// Criar imagem vermelha sólida
const redSvg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#B71C1C"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
        font-size="200" font-weight="bold" fill="white" font-family="Arial">
    TRVALE
  </text>
  <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
        font-size="120" fill="white" font-family="Arial">
    DO BOI
  </text>
</svg>
`;

async function createImages() {
    try {
        // Criar icon.png
        await sharp(Buffer.from(redSvg))
            .png()
            .toFile('assets/icon.png');
        console.log('icon.png criado!');

        // Criar adaptive-icon.png
        await sharp(Buffer.from(redSvg))
            .png()
            .toFile('assets/adaptive-icon.png');
        console.log('adaptive-icon.png criado!');

        // Criar splash.png (maior)
        const splashSvg = `
    <svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#B71C1C"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
            font-size="120" font-weight="bold" fill="white" font-family="Arial">
        TRVALE DO BOI
      </text>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" 
            font-size="60" fill="white" font-family="Arial">
        TRANSPORTADORA
      </text>
    </svg>
    `;

        await sharp(Buffer.from(splashSvg))
            .png()
            .toFile('assets/splash.png');
        console.log('splash.png criado!');

        console.log('Todas as imagens foram criadas com sucesso!');
    } catch (error) {
        console.error('Erro:', error);
    }
}

createImages();
