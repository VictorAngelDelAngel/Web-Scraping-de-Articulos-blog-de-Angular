import puppeteer from "puppeteer";
import { writeFile } from 'fs/promises';
import { parse } from 'json2csv';

async function guardarDatos(cards) {
    try {
        // Guardar como JSON
        await writeFile('articulos.json', JSON.stringify({ articulos: cards }, null, 2));
        console.log('Datos guardados en articulos.json');
        
        // Guardar como CSV
        const campos = [
            { label: 'Título', value: 'titulo' },
            { label: 'Texto', value: 'texto' },
            { label: 'Autor Nombre', value: 'autor.nombre' },
            { label: 'Autor Avatar', value: 'autor.link' },
            { label: 'Fecha', value: 'fecha' },
            { label: 'Likes', value: 'reacciones.likes' },
            { label: 'Comentarios', value: 'reacciones.comentarios' }
        ];
        
        const opciones = { campos };
        const csv = parse(cards, opciones);
        await writeFile('articulos.csv', "\ufeff" + csv, { encoding: 'utf8' }); // BOM para Excel
        console.log('Datos guardados en articulos.csv');
    } catch (error) {
        console.error('Error guardando los archivos:', error);
    }
}

async function obtenerDatosCards() {
    let navegador;
    try {
        navegador = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const pagina = await navegador.newPage();
        await pagina.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        await pagina.goto('https://blog.angular.dev/', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        
        await pagina.waitForSelector('article[data-testid="post-preview"]', {
            timeout: 30000
        });

        // Scroll para cargar todo el contenido
        await pagina.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        const cards = await pagina.evaluate(() => {
            const articulos = [];
            const cardElements = document.querySelectorAll('article[data-testid="post-preview"]');
            
            cardElements.forEach(card => {
                try {
                    // Extraer título
                    const titulo = card.querySelector('h2')?.textContent?.trim() || '';
                    
                    // Extraer texto/descripción
                    const texto = card.querySelector('h3')?.textContent?.trim() || '';
                    
                    // Extraer autor (nombre y avatar)
                    const autorElement = card.querySelector('a[href*="/@"]');
                    const autorNombre = autorElement?.textContent?.trim() || '';
                    const autorAvatar = card.querySelector('div[class*="y do"] img')?.src || '';
                    
                    // Extraer fecha (mejorado)
                    const fechaElement = card.querySelector('span[class*="as b ar an ap"]');
                    const fecha = fechaElement?.textContent?.trim().split('·')[0].trim() || '';
                    
                    // Extraer claps (likes)
                    const clapsElement = card.querySelector('svg[aria-label*="clap"]')?.closest('div')?.nextElementSibling;
                    const likes = clapsElement?.textContent?.trim() || '0';
                    
                    // Extraer comentarios (responses)
                    const commentsElement = card.querySelector('svg[aria-label*="response"]')?.closest('div')?.nextElementSibling;
                    const comentarios = commentsElement?.textContent?.trim() || '0';
                    
                    articulos.push({
                        titulo,
                        texto,
                        autor: {
                            link: autorAvatar,
                            nombre: autorNombre
                        },
                        fecha,
                        reacciones: {
                            likes: parseInt(likes.replace(/[^\d]/g, '')) || 0,
                            comentarios: parseInt(comentarios.replace(/[^\d]/g, '')) || 0
                        }
                    });
                } catch (error) {
                    console.error('Error procesando card:', error);
                }
            });
            
            return articulos;
        });

        console.log('Artículos extraídos correctamente:', cards);
        return cards;
    } catch (error) {
        console.error('Error durante el scraping:', error);
        await pagina?.screenshot({ path: 'error.png' });
        throw error;
    } finally {
        if (navegador) {
            await navegador.close();
        }
    }
}

// Ejecución principal
obtenerDatosCards()
    .then(cards => {
        console.log(`Se extrajeron ${cards.length} artículos`);
        if (cards.length > 0) {
            console.log('Ejemplo del primer artículo:', {
                titulo: cards[0].titulo,
                texto: cards[0].texto,
                autor: cards[0].autor,
                fecha: cards[0].fecha,
                reacciones: cards[0].reacciones
            });
        }
        return guardarDatos(cards);
    })
    .then(() => {
        console.log('Proceso completado exitosamente');
    })
    .catch(err => {
        console.error('Error en el proceso principal:', err);
    });