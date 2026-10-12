export const SHADER_TEMPLATES = [
  {
    id: 'plasma',
    name: 'Organic Plasma',
    description: 'A classic noise-based plasma effect often used for background textures.',
    code: `// TouchDesigner compatible GLSL
// Use a GLSL TOP to run this.
uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    float t = uTime * 0.5;

    vec3 col = 0.5 + 0.5 * cos(t + uv.xyx + vec3(0, 2, 4));

    float noise = sin(uv.x * 10.0 + t) * sin(uv.y * 10.0 - t);
    col *= 0.8 + 0.2 * noise;

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'grid',
    name: 'Cyber Grid',
    description: 'A perspective grid useful for VJ loops and UI backgrounds.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    // Simple 3D projection
    float z = 1.0 / (uv.y + 0.5);
    vec2 p = vec2(uv.x * z, z + uTime);

    float grid = smoothstep(0.02, 0.0, abs(sin(p.x * 10.0)) * 0.1);
    grid += smoothstep(0.02, 0.0, abs(sin(p.y * 10.0)) * 0.1);

    vec3 color = vec3(0.0, 0.8, 1.0) * grid * (1.0 / z);
    fragColor = vec4(color, 1.0);
}`,
  },
  {
    id: 'gradient',
    name: 'Soft Gradient Mesh',
    description: 'Smooth animated color transitions.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;

    vec3 colorA = vec3(0.1, 0.2, 0.5);
    vec3 colorB = vec3(0.9, 0.4, 0.3);

    float mask = sin(uv.x * 3.0 + uTime) * 0.5 + 0.5;
    mask *= cos(uv.y * 2.0 - uTime * 0.8) * 0.5 + 0.5;

    vec3 finalColor = mix(colorA, colorB, mask + uv.x * 0.5);

    fragColor = vec4(finalColor, 1.0);
}`,
  },
  {
    id: 'kaleidoscope',
    name: 'Trippy Kaleidoscope',
    description: 'Polar coordinates and symmetry to create infinite mirrors.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    // Convert to polar coordinates
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // Kaleido effect parameters
    float segments = 6.0;

    // Mirror the angles
    angle = mod(angle, 6.28318 / segments);
    angle = abs(angle - 3.14159 / segments);

    // Convert back to cartesian
    vec2 kUv = radius * vec2(cos(angle), sin(angle));

    // Add movement to the texture coordinates
    kUv += vec2(sin(uTime * 0.5), cos(uTime * 0.5)) * 0.5;

    // Generate color pattern
    vec3 col = 0.5 + 0.5 * cos(uTime + kUv.xyx * 5.0 + vec3(0, 2, 4));

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'particles',
    name: 'Starfield Particles',
    description: 'Hash-based noise to create a multi-layered parallax starfield.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

// Pseudo-random number generator
float Hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
    uv *= 5.0; // Scale space

    vec3 col = vec3(0);

    // Layer starfields for depth
    for(int j = 0; j < 4; j++) {
        float fj = float(j) * 0.25;
        vec2 fuv = fract(uv) - 0.5;
        vec2 id = floor(uv);

        float n = Hash21(id); // random 0-1 per grid cell

        float size = fract(n * 345.32);
        float star = smoothstep(size * 0.1, 0.0, length(fuv - vec2(n - 0.5, fract(n * 34.) - 0.5)));

        vec3 starCol = sin(vec3(0.2, 0.8, 0.9) * fract(n * 2345.2) * 124.4) * 0.5 + 0.5;
        starCol = starCol * vec3(1.0, 0.5, 1.0); // Tint purple/blue

        col += star * size * starCol;

        // Prepare next layer
        uv *= 1.5;
        uv.x += uTime * (0.2 + fj); // Parallax motion
    }

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'waves',
    name: 'Interference Waves',
    description: 'Overlapping sine waves creating abstract topography.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    vec3 col = vec3(0.0);

    // Draw multiple overlapping lines
    for(int i = 1; i < 6; i++) {
        float fi = float(i);
        vec2 uv2 = gl_FragCoord.xy / uRes.xy;

        // Complex wave math
        uv2.y += sin(uv2.x * (10.0 - fi) + uTime * fi * 0.5) * 0.1;
        uv2.y += cos(uv2.x * 4.0 - uTime) * 0.05;

        float line = smoothstep(0.015, 0.0, abs(uv2.y - 0.15 * fi));

        // Additive color blending
        col += vec3(0.1 * fi, 0.2 + 0.1 * fi, 1.0) * line;
    }

    // Add a slight glow
    col += uv.y * 0.2 * vec3(0.0, 0.5, 0.8);

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'voronoi',
    name: 'Cellular Voronoi',
    description: 'Distance fields to points, creating biological cell-like structures.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

// Random 2D to 2D
vec2 random2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xx;
    uv *= 6.0; // Zoom out

    vec2 i_uv = floor(uv);
    vec2 f_uv = fract(uv);

    float m_dist = 1.0; // minimum distance
    vec2 m_point;       // minimum point

    // Check neighboring grid cells
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(i_uv + neighbor);

            // Animate point
            point = 0.5 + 0.5 * sin(uTime + 6.2831 * point);

            vec2 diff = neighbor + point - f_uv;
            float dist = length(diff);

            if(dist < m_dist) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    // Color based on distance and point data
    vec3 col = vec3(m_dist);
    col *= 0.8 + 0.2 * sin(m_point.x * 50.0 + uTime * 2.0); // Add ridges
    col *= vec3(0.2, 0.8, 0.6); // Tint cyan/green

    // Draw cell centers
    col += 1.0 - step(0.02, m_dist);

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'raymarching',
    name: 'Raymarched Sphere',
    description: 'Basic 3D engine inside a fragment shader using Signed Distance Fields (SDF).',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

// Signed Distance Field for a sphere
float sdSphere(vec3 p, float s) {
    return length(p) - s;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    vec3 ro = vec3(0.0, 0.0, -3.0); // Ray origin (camera)
    vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction

    float d0 = 0.0; // Total distance marched

    // Raymarching loop
    for(int i = 0; i < 80; i++) {
        vec3 p = ro + rd * d0;

        // Distort space for organic movement
        p.y += sin(uTime * 2.0 + p.x) * 0.3;
        p.x += cos(uTime + p.y) * 0.2;

        float ds = sdSphere(p, 1.0); // Distance to scene
        d0 += ds;
        if(d0 > 100.0 || ds < 0.001) break; // Missed or hit
    }

    vec3 col = vec3(0.0); // Background

    if(d0 < 100.0) { // Hit
        vec3 p = ro + rd * d0;
        vec3 n = normalize(p); // Rough normal
        vec3 light = normalize(vec3(sin(uTime), 1.0, cos(uTime)));

        float dif = clamp(dot(n, light), 0.0, 1.0); // Diffuse lighting
        float ambient = 0.2;

        col = vec3(0.8, 0.2, 0.4) * dif + ambient;
    }

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'fractal',
    name: 'Pulsing Julia Set',
    description: 'A mathematical fractal loop that animates infinitely.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
    uv *= 2.5; // Zoom out

    // Animate the 'c' constant over time
    vec2 c = vec2(sin(uTime * 0.4) * 0.8, cos(uTime * 0.25) * 0.8);
    vec2 z = uv;

    int iter = 0;
    int max_iter = 100;

    // Fractal formula: z = z^2 + c
    for(int i = 0; i < 100; i++) {
        if(length(z) > 4.0) break;

        float xtemp = z.x * z.x - z.y * z.y;
        z.y = 2.0 * z.x * z.y + c.y;
        z.x = xtemp + c.x;

        iter++;
    }

    // Smooth coloring
    float f = float(iter) / float(max_iter);

    // Map iterations to a color gradient
    vec3 col = vec3(f * 2.0, f * 0.5, f * 3.0);

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'crt',
    name: 'CRT Glitch & Aberration',
    description: 'Screen distortion, scanlines, and RGB splitting.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

// Noise function
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;

    // Curve the screen edges (CRT effect)
    vec2 crtUv = uv * 2.0 - 1.0;
    crtUv *= 1.05 - 0.05 * cos(crtUv.yx * 1.57);
    crtUv = (crtUv + 1.0) * 0.5;

    // Animated Scanlines
    float scanline = sin(uv.y * 800.0 + uTime * 10.0) * 0.04;

    // Chromatic aberration (RGB split)
    float splitAmount = 0.01 * sin(uTime * 2.0);
    vec2 uvR = crtUv + vec2(splitAmount, 0.0);
    vec2 uvG = crtUv;
    vec2 uvB = crtUv - vec2(splitAmount, 0.0);

    // Generate static/noise pattern for each channel
    float r = hash(uvR + uTime * 0.1);
    float g = hash(uvG + uTime * 0.15);
    float b = hash(uvB + uTime * 0.2);

    // Vignette
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vig = pow(16.0 * vig, 0.25);

    // Combine everything
    vec3 col = vec3(r, g, b) * vig - scanline;

    // Black out out-of-bounds UVs
    if(crtUv.x < 0.0 || crtUv.x > 1.0 || crtUv.y < 0.0 || crtUv.y > 1.0) {
        col = vec3(0.0);
    }

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'spiral',
    name: 'Hypnotic Spiral',
    description: 'Math-driven spiral using trigonometric functions.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // Spiral formula
    float spiral = sin(radius * 30.0 - uTime * 8.0 + angle * 5.0);

    // Sharpen the edges
    spiral = smoothstep(0.0, 0.1, spiral) - smoothstep(0.4, 0.5, spiral);

    // Background and foreground colors
    vec3 bg = vec3(0.05, 0.0, 0.1);
    vec3 fg = vec3(0.9, 0.2, 0.5) * (1.0 - radius); // Fade out from center

    vec3 col = mix(bg, fg, spiral);

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'domain_warp',
    name: 'Liquid Domain Warping',
    description: 'Fractional Brownian Motion (FBM) used to distort itself iteratively.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.,0.)), hash(i + vec2(1.,0.)), u.x),
               mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), u.x), u.y);
}

// Fractional Brownian Motion
float fbm(vec2 x) {
    float v = 0.0, a = 0.5; vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(x); x = rot * x * 2.0 + shift; a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy * 3.0;

    // Pattern 1
    vec2 q = vec2(0.0);
    q.x = fbm(uv + 0.0 * uTime);
    q.y = fbm(uv + vec2(1.0));

    // Pattern 2 (warped by Pattern 1)
    vec2 r = vec2(0.0);
    r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
    r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    // Final noise
    float f = fbm(uv + r);

    vec3 col = mix(vec3(0.1, 0.1, 0.2), vec3(0.2, 0.5, 0.6), clamp((f*f)*4.0, 0.0, 1.0));
    col = mix(col, vec3(0.9, 0.9, 1.0), clamp(length(q), 0.0, 1.0));
    col = mix(col, vec3(0.6, 0.1, 0.2), clamp(length(r.x), 0.0, 1.0));

    fragColor = vec4((f * f * f + 0.6 * f * f + 0.5 * f) * col, 1.0);
}`,
  },
  {
    id: 'hexagons',
    name: 'Neon Hexagons',
    description: 'Mathematical hexagonal tiling with individual IDs for random colorization.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

// Distance inside a hexagon
float hexDist(vec2 p) {
    p = abs(p);
    float c = dot(p, normalize(vec2(1.0, 1.73205)));
    return max(c, p.x);
}

// Calculate Hexagon coordinates and IDs
vec4 hexCoords(vec2 uv) {
    vec2 r = vec2(1.0, 1.73205);
    vec2 h = r * 0.5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b; // Grid UV
    vec2 id = uv - gv;                      // Hex ID
    return vec4(gv.x, gv.y, id.x, id.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
    uv *= 10.0; // Zoom out

    // Animate the grid
    vec4 hc = hexCoords(uv + vec2(uTime * 2.0, uTime));

    // Draw hex boundaries
    float c = smoothstep(0.05, 0.1, hexDist(hc.xy));

    // Random color per hexagon using its ID
    float rand = fract(sin(dot(hc.zw, vec2(12.34, 56.78))) * 4321.0);

    // Flash based on time
    rand *= sin(uTime * 5.0 + rand * 10.0) * 0.5 + 0.5;

    vec3 col = vec3(0.1, 0.8, 0.9) * rand * (1.0 - c);

    fragColor = vec4(col, 1.0);
}`,
  },
  {
    id: 'octagon_perspective',
    name: 'Perspective Octagon Portal',
    description: 'Vanishing-point perspective mapped onto an octagonal tunnel with animated bands and edge glow.',
    code: `uniform float uTime;
uniform vec2 uRes;

out vec4 fragColor;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;

    // --- PERSPECTIVE MATH & POLYGON ---
    // Ponto de fuga (vanishing point)
    vec2 V = vec2(-0.45, 0.0);
    vec2 offset = uv - V;
    float d_uv = length(offset);
    vec2 D = d_uv > 0.0001 ? offset / d_uv : vec2(1.0, 0.0);

    float maxRadius = 0.85; // Tamanho do octógono
    float d_edge = 10000.0;
    float hit_index = 0.0;
    vec2 hit_T = vec2(0.0);

    // Intersecção do raio com as 8 bordas do octógono
    for(int i = 0; i < 8; i++) {
        float angle = float(i) * 0.78539816339; // i * PI/4
        vec2 N = vec2(cos(angle), sin(angle));
        float denom = dot(D, N);

        if (denom > 0.00001) {
            float x = (maxRadius - dot(V, N)) / denom;
            if (x > 0.0 && x < d_edge) {
                d_edge = x;
                hit_index = float(i);
                hit_T = vec2(-N.y, N.x);
            }
        }
    }
    float t = d_uv / d_edge;

    vec3 col = vec3(0.0);

    if (t < 1.0) {
        float edge = 1.0 - smoothstep(0.0, 0.02, abs(d_edge - d_uv));
        float depth = 1.0 / max(1.0 - t, 0.04);
        float bands = 0.5 + 0.5 * cos(depth * 7.0 - uTime * 3.5);
        float scan = 0.5 + 0.5 * cos(dot(offset, hit_T) * 18.0 + hit_index * 0.9 - uTime * 2.0);
        float pulse = 0.5 + 0.5 * sin(uTime * 2.5 + hit_index * 0.7);

        vec3 faceColor = 0.5 + 0.5 * cos(vec3(0.3, 1.2, 2.4) + hit_index * 0.7 + uTime * 0.6);
        vec3 tunnel = faceColor * (0.25 + 0.75 * bands) * (0.35 + 0.65 * scan);
        vec3 glow = vec3(0.2, 0.9, 1.0) * edge * (1.2 + pulse);

        col = tunnel + glow;
        col *= smoothstep(1.02, 0.15, t);
    }

    float star = smoothstep(0.995, 1.0, sin((uv.x + uv.y) * 120.0 + uTime * 4.0));
    col += vec3(0.03, 0.04, 0.08) + star * 0.03;

    fragColor = vec4(col, 1.0);
}`,
  },
]


