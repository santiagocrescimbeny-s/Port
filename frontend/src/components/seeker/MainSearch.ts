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

    // Persistencia de sesión única para mantener el contexto conversacional por pestaña/usuario
    let sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
        sessionId = `session_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
        sessionStorage.setItem('portfolio_session_id', sessionId);
    }

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
        searchInput.value = '';

        // Lee dinámicamente la URL de tu API (elimina la barra inclinada final en caso de que exista)
        const baseUrl = (import.meta.env.PUBLIC_API_URL || 'https://api.santiagocrescimbeni.com').replace(/\/$/, '');
        try {
            isSearching = true;
            if (responseContainer) {
                responseContainer.classList.add('visible');
                responseContainer.innerHTML = "<p style='color: #00f2fe; text-align: center; font-family: sans-serif; margin: 20px 0;'>⚡ Consultando a mi asistente virtual...</p>";
            }

            // Llamada POST directa al backend de la IA (No stream)
            const response = await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    message: query,
                    sessionId: sessionId
                })
            });

            const jsonData = await response.json();

            if (!response.ok) {
                if (responseContainer) {
                    responseContainer.innerHTML = `<p style='color: #ff6b6b; padding: 20px; text-align: center;'>❌ Error: ${jsonData.error || 'No se pudo conectar con el asistente'}</p>`;
                }
                return;
            }

            // Mostrar la respuesta conversacional estructurada de Gemini
            if (jsonData.success && jsonData.data) {
                let html = '<div style="padding: 20px; font-family: sans-serif; line-height: 1.6;">';
                html += `<h3 style="color: #00f2fe; margin-top: 0; font-size: 16px; border-bottom: 1px solid rgba(0, 242, 254, 0.2); padding-bottom: 8px; font-weight: 600; letter-spacing: 0.5px;">🤖 ASISTENTE VIRTUAL</h3>`;

                html += `
                    <div style="
                        background: rgba(0, 242, 254, 0.03);
                        border-left: 3px solid #00f2fe;
                        padding: 15px;
                        margin: 15px 0 5px 0;
                        border-radius: 4px;
                        color: #e0e0e0;
                        font-size: 14px;
                        white-space: pre-wrap;
                    ">${jsonData.data}</div>
                `;

                html += '</div>';
                if (responseContainer) {
                    responseContainer.innerHTML = html;
                }
            } else {
                if (responseContainer) {
                    responseContainer.innerHTML = `<p style='color: #ffaa00; padding: 20px; text-align: center;'>⚠️ El asistente no devolvió una respuesta válida.</p>`;
                }
            }

        } catch (error) {
            console.error('Error al consultar el asistente virtual:', error);
            if (responseContainer) {
                responseContainer.innerHTML = `<p style='color: #ff6b6b; padding: 20px; text-align: center;'>❌ Error de conexión con el cerebro de la IA: ${(error as Error).message}</p>`;
            }
        } finally {
            isSearching = false;
        }
    });
});