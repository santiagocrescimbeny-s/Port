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
                responseContainer.innerHTML = "";
            }

            const response = await fetch("http://localhost:3000/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: query })
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            let acumuladorTexto = "";
            let oracionesRenderizadasCount = 0;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                const chunkValue = decoder.decode(value || new Uint8Array());
                acumuladorTexto += chunkValue;

                const oraciones = acumuladorTexto.split(/(?<=[.!?])\s+/);

                if (responseContainer) {
                    const isAtBottom = responseContainer.scrollHeight - responseContainer.scrollTop <= responseContainer.clientHeight + 60;

                    if (oraciones.length > 1) {
                        for (let i = oracionesRenderizadasCount; i < oraciones.length - 1; i++) {
                            if (oraciones[i].trim() !== "") {
                                const span = document.createElement('span');
                                span.className = "oracion-fade-item";
                                span.innerText = oraciones[i] + " ";
                                responseContainer.appendChild(span);
                                oracionesRenderizadasCount++;
                            }
                        }
                        acumuladorTexto = oraciones[oraciones.length - 1];
                    }

                    if (done && acumuladorTexto.trim() !== "") {
                        const span = document.createElement('span');
                        span.className = "oracion-fade-item";
                        span.innerText = acumuladorTexto;
                        responseContainer.appendChild(span);
                    }

                    if (isAtBottom) {
                        responseContainer.scrollTop = responseContainer.scrollHeight;
                    }
                }
            }

        } catch (error) {
            console.error("Error en la conexión del stream:", error);
            if (responseContainer) responseContainer.innerText = "Error al conectar con el servidor.";
        } finally {
            isSearching = false;
        }
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchButton?.click();
        }
    });
});