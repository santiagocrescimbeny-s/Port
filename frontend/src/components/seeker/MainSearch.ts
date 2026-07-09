import './MainSearch.css';

document.addEventListener('DOMContentLoaded', () => {
    const interactiveZone = document.getElementById('interactive-zone');
    const searchWrapper = document.getElementById('search-wrapper');
    const eyeWrapper = document.getElementById('eye-wrapper');
    const eyeElement = document.getElementById('eye-element');
    const brandWrapper = document.getElementById('brand-wrapper');
    const flashEffect = document.getElementById('flash-effect');

    const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
    const searchButton = document.getElementById('search-button');
    const responseContainer = document.getElementById('response-container');

    let isAnimating = false;
    let isSearching = false;
    let mouseLeaveTimeout: number | null = null;

    if (interactiveZone && searchWrapper && eyeWrapper && eyeElement && brandWrapper && flashEffect) {
        interactiveZone.addEventListener('mouseenter', () => {
            if (mouseLeaveTimeout) {
                clearTimeout(mouseLeaveTimeout);
                mouseLeaveTimeout = null;
            }
            if (isAnimating || isSearching) return;
            interactiveZone.classList.remove('fade-out-fast');
            brandWrapper.classList.remove('active', 'glow');
            eyeWrapper.classList.remove('active');
            eyeElement.classList.remove('wink');
            searchWrapper.classList.add('active');
        });

        interactiveZone.addEventListener('mouseleave', () => {
            if (!searchWrapper.classList.contains('active') || isAnimating || isSearching) return;

            mouseLeaveTimeout = window.setTimeout(() => {
                isAnimating = true;
                searchWrapper.classList.remove('active');

                setTimeout(() => {
                    eyeWrapper.classList.add('active');
                    setTimeout(() => {
                        eyeElement.classList.add('wink');
                        setTimeout(() => {
                            flashEffect.classList.add('trigger');
                            eyeWrapper.classList.remove('active');
                            brandWrapper.classList.add('active', 'glow');
                            setTimeout(() => {
                                flashEffect.classList.remove('trigger');
                                setTimeout(() => {
                                    interactiveZone.classList.add('fade-out-fast');
                                    setTimeout(() => {
                                        brandWrapper.classList.remove('active', 'glow');
                                        eyeElement.classList.remove('wink');
                                        interactiveZone.classList.remove('fade-out-fast');
                                        isAnimating = false;
                                    }, 400);
                                }, 1200);
                            }, 150);
                        }, 100);
                    }, 150);
                }, 200);
            }, 2500);
        });
    }

    searchButton?.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (!searchInput || !searchInput.value.trim()) return;
        const query = searchInput.value;

        try {
            isSearching = true;
            if (responseContainer) {
                responseContainer.classList.add('visible');
                responseContainer.innerHTML = "<p style='color: #00f2fe; text-align: center;'>⏳ Buscando...</p>";
            }

            // ✅ NUEVA LÓGICA: Llamada JSON, no streaming
            const response = await fetch("http://localhost:3000/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: query })
            });

            const jsonData = await response.json();

            if (!response.ok) {
                if (responseContainer) {
                    responseContainer.innerHTML = `<p style='color: #ff6b6b;'>❌ Error: ${jsonData.error}</p>`;
                }
                return;
            }

            // ✅ Mostrar resultados
            if (jsonData.success && jsonData.results.length > 0) {
                let html = '<div style="padding: 20px;">';
                html += `<h3 style="color: #00f2fe; margin-top: 0;">📚 Resultados para: "${query}"</h3>`;
                
                jsonData.results.forEach((result: any, index: number) => {
                    html += `
                        <div style="
                            background: rgba(0, 242, 254, 0.05);
                            border-left: 3px solid #00f2fe;
                            padding: 15px;
                            margin: 10px 0;
                            border-radius: 5px;
                        ">
                            <p style="color: #ffffff; margin: 0 0 8px 0;">
                                <strong>Resultado ${index + 1}</strong>
                            </p>
                            <p style="color: #cccccc; margin: 0; line-height: 1.6; font-size: 14px;">
                                ${result.content}
                            </p>
                            ${result.similarity ? `<p style="color: #888; font-size: 12px; margin: 8px 0 0 0;">
                                Relevancia: ${(result.similarity * 100).toFixed(1)}%
                            </p>` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
                if (responseContainer) {
                    responseContainer.innerHTML = html;
                }
            } else {
                if (responseContainer) {
                    responseContainer.innerHTML = `<p style='color: #ffaa00; padding: 20px;'>⚠️ No se encontraron resultados</p>`;
                }
            }

        } catch (error) {
            console.error('Error:', error);
            if (responseContainer) {
                responseContainer.innerHTML = `<p style='color: #ff6b6b; padding: 20px;'>❌ Error de conexión</p>`;
            }
        } finally {
            isSearching = false;
        }
    });
});