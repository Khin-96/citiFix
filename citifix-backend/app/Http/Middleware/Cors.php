<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * List of allowed origins.
     * You can add more origins if needed.
     */
    protected $allowedOrigins = [
        'http://localhost:3000',
        // 'http://your-other-domain.com',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');

        // Check if the request's origin is allowed
        if ($origin && in_array($origin, $this->allowedOrigins)) {
            $headers = [
                'Access-Control-Allow-Origin'      => $origin,
                'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers'     => 'Content-Type, X-Requested-With, X-XSRF-TOKEN, Authorization, Accept',
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Max-Age'           => '86400',
            ];

            // Handle preflight OPTIONS request
            if ($request->getMethod() === 'OPTIONS') {
                return response()->json('OK', 200, $headers);
            }

            // For all other requests, add headers after response
            $response = $next($request);
            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }

            return $response;
        }

        // If origin is not allowed, just proceed without CORS headers
        return $next($request);
    }
}
