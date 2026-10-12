import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { BookOpen, CheckCircle2, Code, Copy, Layers, Monitor, Play } from 'lucide-react'
import { SHADER_TEMPLATES } from './shaderTemplates'
import './App.css'

const FULLSCREEN_VERTEX_SHADER = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

function normalizeFragmentShader(source) {
	let compiled = source
		.replace(/\bout\s+vec4\s+fragColor\s*;/g, '')
		.replace(/\bfragColor\b/g, 'gl_FragColor')

	if (!/gl_FragColor\s*=/.test(compiled)) {
		throw new Error('Shader must assign a final color (gl_FragColor or fragColor).')
	}

	if (!/void\s+main\s*\(/.test(compiled)) {
		throw new Error('Shader must include a main() function.')
	}

	return compiled
}

function App() {
	const [activeShaderId, setActiveShaderId] = useState(SHADER_TEMPLATES[0].id)
	const [shaderCode, setShaderCode] = useState(SHADER_TEMPLATES[0].code)
	const [copyError, setCopyError] = useState('')
	const [copied, setCopied] = useState(false)
	const [timeValue, setTimeValue] = useState(0)

	const containerRef = useRef(null)
	const rendererRef = useRef(null)
	const sceneRef = useRef(null)
	const meshRef = useRef(null)
	const frameRef = useRef(null)
	const lastUiUpdateRef = useRef(0)

	const uniformsRef = useRef({
		uTime: { value: 0 },
		uRes: { value: new THREE.Vector2(1, 1) },
	})

	const shaderError = useMemo(() => {
		try {
			normalizeFragmentShader(shaderCode)
			return ''
		} catch (error) {
			return error instanceof Error ? error.message : String(error)
		}
	}, [shaderCode])

	useEffect(() => {
		if (!containerRef.current) return
		const containerNode = containerRef.current

		const renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
		rendererRef.current = renderer
		containerNode.appendChild(renderer.domElement)

		const scene = new THREE.Scene()
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
		const geometry = new THREE.PlaneGeometry(2, 2)

		const material = new THREE.ShaderMaterial({
			uniforms: uniformsRef.current,
			vertexShader: FULLSCREEN_VERTEX_SHADER,
			fragmentShader: normalizeFragmentShader(shaderCode),
		})

		const mesh = new THREE.Mesh(geometry, material)
		scene.add(mesh)

		sceneRef.current = scene
		meshRef.current = mesh

		const updateSize = () => {
			const width = containerNode.clientWidth
			const height = containerNode.clientHeight
			renderer.setSize(width, height)
			uniformsRef.current.uRes.value.set(width, height)
		}

		const animate = (timestamp) => {
			const seconds = timestamp * 0.001
			uniformsRef.current.uTime.value = seconds

			if (timestamp - lastUiUpdateRef.current > 100) {
				setTimeValue(seconds)
				lastUiUpdateRef.current = timestamp
			}

			renderer.render(scene, camera)
			frameRef.current = requestAnimationFrame(animate)
		}

		updateSize()
		frameRef.current = requestAnimationFrame(animate)
		window.addEventListener('resize', updateSize)

		return () => {
			window.removeEventListener('resize', updateSize)
			if (frameRef.current) cancelAnimationFrame(frameRef.current)

			mesh.material.dispose()
			geometry.dispose()
			renderer.dispose()

			if (containerNode.contains(renderer.domElement)) {
				containerNode.removeChild(renderer.domElement)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!meshRef.current) return
		if (shaderError) return

		const updatedMaterial = new THREE.ShaderMaterial({
			uniforms: uniformsRef.current,
			vertexShader: FULLSCREEN_VERTEX_SHADER,
			fragmentShader: normalizeFragmentShader(shaderCode),
		})

		const previousMaterial = meshRef.current.material
		meshRef.current.material = updatedMaterial
		previousMaterial.dispose()
	}, [shaderCode, shaderError])

	const handleTemplateSelect = (template) => {
		setActiveShaderId(template.id)
		setShaderCode(template.code)
		setCopyError('')
	}

	const handleCopy = async () => {
		try {
			setCopyError('')

			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shaderCode)
			} else {
				const textarea = document.createElement('textarea')
				textarea.value = shaderCode
				document.body.appendChild(textarea)
				textarea.select()
				document.execCommand('copy')
				document.body.removeChild(textarea)
			}

			setCopied(true)
			window.setTimeout(() => setCopied(false), 1500)
		} catch (copyError) {
			setCopyError(copyError instanceof Error ? copyError.message : 'Failed to copy shader code.')
		}
	}

	const activeShader =
		SHADER_TEMPLATES.find((template) => template.id === activeShaderId) ?? SHADER_TEMPLATES[0]
	const displayError = shaderError || copyError

	return (
		<div className="app-shell">
			<header className="topbar">
				<div className="brand">
					<div className="brand-icon">
						<Layers size={18} />
					</div>
					<div>
						<h1>GLSL Visualizer</h1>
						<p>TouchDesigner-friendly fragment shader playground</p>
					</div>
				</div>

				<button type="button" className="copy-button" onClick={handleCopy}>
					{copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
					{copied ? 'Copied!' : 'Copy Shader'}
				</button>
			</header>

			<main className="workspace">
				<aside className="sidebar">
					<div className="sidebar-title">
						<BookOpen size={14} />
						Templates ({SHADER_TEMPLATES.length})
					</div>

					<div className="template-list">
						{SHADER_TEMPLATES.map((template) => (
							<button
								key={template.id}
								type="button"
								className={`template-item ${activeShader.id === template.id ? 'active' : ''}`}
								onClick={() => handleTemplateSelect(template)}
							>
								<strong>{template.name}</strong>
								<span>{template.description}</span>
							</button>
						))}
					</div>

					<p className="tip">
						Tip: In TouchDesigner, map <code>uTime</code> to <code>absTime.seconds</code>.
					</p>
				</aside>

				<section className="editor-panel">
					<div className="panel-title">
						<Code size={14} />
						<span>glsl_shader.frag</span>
					</div>
					<textarea
						value={shaderCode}
						onChange={(event) => setShaderCode(event.target.value)}
						className="editor"
						spellCheck="false"
					/>
				</section>

				<section className="preview-panel">
					<div className="panel-title panel-title-preview">
						<div>
							<Play size={14} />
							<span>Live Preview</span>
						</div>
						<div className="preview-env">
							<Monitor size={14} />
							Simulated environment
						</div>
					</div>

					<div ref={containerRef} className="canvas-wrap">
						{displayError ? <pre className="shader-error">{displayError}</pre> : null}
					</div>

					<div className="control-bar">
						<div className="time-row">
							<span>Uniform: uTime</span>
							<span>{timeValue.toFixed(2)}s</span>
						</div>
						<div className="time-track">
							<div className="time-fill" style={{ width: `${(timeValue % 10) * 10}%` }} />
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}

export default App
