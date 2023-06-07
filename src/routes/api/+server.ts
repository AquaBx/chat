import { randomUUID }  from 'crypto';

let controllers = {}

function send_to_all(message) {
    Object.keys(controllers).forEach((id) => {
        try {
            controllers[id].enqueue(`data: ${message}\n\n`);
        } catch (error) {
            delete controllers[id]
        }
    })
}

export async function GET({ url }) {

    if (url.pathname !== "/api") return

    let id = randomUUID()

    const stream = new ReadableStream({
        start(controller) {

            controllers[id] = controller

            controller.enqueue(`data: ${"Welcome"}\n\n`)

        },
        cancel() {

        }
    });

    return new Response(stream, {
        headers: {
            // Denotes the response as SSE
            'Content-Type': 'text/event-stream', 
            // Optional. Request the GET request not to be cached.
            'Cache-Control': 'no-cache', 
        }
    })
}

export async function POST({ request }) {
    const text = await request.text();

    send_to_all(text)

    return new Response("", {
        headers: {
            // Denotes the response as SSE
            'Content-Type': 'text/text', 
            // Optional. Request the GET request not to be cached.
            'Cache-Control': 'no-cache', 
        }
    })
}