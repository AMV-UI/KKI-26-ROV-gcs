import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';



export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const destinationUrl = request.nextUrl.clone();
    destinationUrl.hostname = '127.0.0.1';

    const targetPath = path.replace(/^\/media-api/, '');
    destinationUrl.pathname = targetPath;

    if (targetPath.includes('/whep')) {
        destinationUrl.port = '8889';
    }
    else if (targetPath.endsWith('.m3u8') || targetPath.endsWith('.ts') || targetPath.endsWith('.fmp4') || targetPath.endsWith('.m4s')) {
        destinationUrl.port = '8888';
    }
    else if (targetPath.startsWith('/v3/recordings')) {
        destinationUrl.port = '9997';
    }
    else {
        return new NextResponse('Bad Gateway - Unknown Media Route', { status: 502 });
    }

    return NextResponse.rewrite(destinationUrl, {
        headers: request.headers,
    });
}

export const config = {
    // Ensure the matcher catches the request exactly
    matcher: ['/media-api/:path*'],
};

