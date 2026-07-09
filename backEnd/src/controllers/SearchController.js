import { AiService } from '../services/IAService.js';
export const handleSearch = async (req, res) => {
    const { prompt } = req.body;
    // Configuramos las cabeceras para que el navegador sepa que va a recibir un Stream continuo
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
        console.log("Intentando conectar con Gemini...");
        const geminiStream = await AiService.askGeminiStream(prompt);
        // Iteramos el stream de Gemini y enviamos cada trozo de texto al frontend
        for await (const chunk of geminiStream) {
            if (chunk.text) {
                res.write(chunk.text);
            }
        }
        return res.end();
    }
    catch (geminiError) {
        console.warn("Gemini falló (posible límite de cuota). Activando OpenAI de respaldo...");
        try {
            const openAiStream = await AiService.askOpenAIStream(prompt);
            // Iteramos el stream de OpenAI (la estructura de sus chunks cambia un poco)
            for await (const chunk of openAiStream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    res.write(content);
                }
            }
            return res.end();
        }
        catch (openAiError) {
            console.error("Ambas IA fallaron:", openAiError);
            res.status(503).write("Lo siento, todos mis servicios de IA están saturados en este momento. Inténtalo de nuevo más tarde.");
            return res.end();
        }
    }
};
//# sourceMappingURL=SearchController.js.map