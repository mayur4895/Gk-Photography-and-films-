'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { MovingBorderDemo } from './movingborderButton'
import { ShootingStars } from './ui/shootingstars'
import { StarsBackground } from './ui/shootingstarsBackground'

const BIG_CIRCLE_RADIUS = 50
const NUM_GROUPS = 6
const INITIAL_DROP_DURATION = 3
const FINAL_DROP_DURATION = 2
const INITIAL_SCALE = 10  // Increased scale for better visibility
const FINAL_SCALE = 1
const FADE_DURATION = 1
const INITIAL_ADD_DROP_INTERVAL = 1000 // ms
const CENTER_OFFSET = 5
const DROP_INTERVAL_DECREASE = 50
const MIN_DROP_INTERVAL = 200

export default function Banner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [dropInterval, setDropInterval] = useState(INITIAL_ADD_DROP_INTERVAL)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 50
    camera.position.y = 10
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const handleResize = () => {
      if (cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
      }
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        gsap.globalTimeline.pause()
      } else {
        gsap.globalTimeline.resume()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Add lighting
    const light = new THREE.PointLight(0xffffff, 2, 100)
    light.position.set(20, 20, 20)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0x404040)
    scene.add(ambientLight)

    const images = [
      'https://picsum.photos/200/300?random=1',
      'https://picsum.photos/200/300?random=2',
      'https://picsum.photos/200/300?random=3'
    ]

    function createPlane(imagePath: string): Promise<THREE.Mesh> {
      const textureLoader = new THREE.TextureLoader()
      
      return new Promise<THREE.Mesh>((resolve, reject) => {
        textureLoader.load(
          imagePath,
          (texture) => {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter 
            // Calculate aspect ratio and adjust size
            const aspectRatio = texture.image.width / texture.image.height
            const width = 3  // Set the width to a fixed size
            const height = width / aspectRatio  // Calculate height based on aspect ratio
            
            const geometry = new THREE.PlaneGeometry(width, height)
            const material = new THREE.MeshStandardMaterial({
              map: texture,
              transparent: true,
              opacity: 0,
              side: THREE.DoubleSide
            })
    
            const plane = new THREE.Mesh(geometry, material)
           
            resolve(plane)
          },
          undefined,
          (error) => {
            console.error('Error loading texture:', imagePath, error)
            reject(error)
          }
        )
      })
    }
    
    const dropImage = async (startPosition: THREE.Vector3) => {
      if (!sceneRef.current) return;
    
      const randomImage = images[Math.floor(Math.random() * images.length)];
      const plane = await createPlane(randomImage);
    
      plane.position.set(startPosition.x, startPosition.y, startPosition.z);
      sceneRef.current.add(plane);
    
      const targetPosition = new THREE.Vector3(CENTER_OFFSET, CENTER_OFFSET, 0);
      const duration = gsap.utils.interpolate(INITIAL_DROP_DURATION, FINAL_DROP_DURATION, imageCounter / 100);
    
      // Apply initial skew effect and inward rotation
      gsap.fromTo(
        plane.rotation,
        { x: 0, y: Math.PI * 0.3, z: 0 }, // Start with rotation around y-axis (90 degrees)
        {
          x: 0, // Keep x rotation as 0
          y: 0, // Rotate inward to face forward
          z: 0, // Keep z rotation as 0
          duration: duration,
          ease: 'power2.inOut',
        }
      );
    
      gsap.fromTo(
        plane.position,
        { x: startPosition.x, y: startPosition.y, z: startPosition.z },
        {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: duration,
          ease: 'power1.inOut',
          onUpdate: () => {
            plane.rotation.y += 0.02; // Smooth rotation along the y-axis
          },
        }
      );
    
      gsap.fromTo(
        plane.scale,
        { x: INITIAL_SCALE, y: INITIAL_SCALE },
        {
          x: FINAL_SCALE,
          y: FINAL_SCALE,
          duration: duration,
          ease: 'power1.inOut',
        }
      );
    
      gsap.fromTo(
        plane.material as THREE.MeshStandardMaterial,
        { opacity: 0 },
        {
          opacity: 1,
          duration: FADE_DURATION + 0.5,
          ease: 'power1.inOut',
        }
      );
    
      gsap.to(plane.material as THREE.MeshStandardMaterial, {
        opacity: 0,
        duration: duration - FADE_DURATION,
        ease: 'power1.inOut',
        delay: FADE_DURATION,
        onComplete: () => {
          if (sceneRef.current) {
            sceneRef.current.remove(plane);
            plane.geometry.dispose();
    
            if (Array.isArray(plane.material)) {
              plane.material.forEach((mat) => {
                if (mat.dispose) mat.dispose();
              });
            } else {
              if (plane.material.dispose) plane.material.dispose();
            }
          }
        },
      });
    };
    
    
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < NUM_GROUPS; i++) {
      const angle = (i / NUM_GROUPS) * Math.PI * 2
      const position = new THREE.Vector3(
        Math.cos(angle) * BIG_CIRCLE_RADIUS,
        Math.sin(angle) * BIG_CIRCLE_RADIUS,
        0
      )
      positions.push(position)
    }

    let imageCounter = 0
    const addAndDropImage = () => {
      if (imageCounter >= 100) return
      const position = positions[imageCounter % NUM_GROUPS]
      const startPosition = new THREE.Vector3(
        position.x + (Math.random() * 2 - 1),
        position.y + (Math.random() * 2 - 1),
        0
      )
      dropImage(startPosition)
      imageCounter++
    }

    const intervalId = setInterval(() => {
      addAndDropImage()
      setDropInterval(prev => Math.max(prev - DROP_INTERVAL_DECREASE, MIN_DROP_INTERVAL))
    }, dropInterval)

    const animate = () => {
      requestAnimationFrame(animate)
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (rendererRef.current) {
        containerRef.current?.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh' }} className='overflow-hidden bg-[#0b0b0b] relative'>
      <div className='text-nowrap text-slate-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-4xl font-medium text-center'>
        GK PHOTOGRAPHY <br /> & Films
        <div>
          <MovingBorderDemo>
            Contact Now
          </MovingBorderDemo>
        </div>
      </div>
      <ShootingStars />
      <StarsBackground />
    </div>
  )
}
