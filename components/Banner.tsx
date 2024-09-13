'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

const BIG_CIRCLE_RADIUS = 28
const NUM_GROUPS = 6
const DROP_DURATION = 5
const INITIAL_SCALE = 5
const FINAL_SCALE = 0
const FADE_DURATION = 1
const ADD_DROP_INTERVAL = 500 // ms
const CENTER_OFFSET = 0 // Offset from the center

export default function Banner() {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!containerRef.current) return
  
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
  
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 20
  
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)
  
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
  
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optionally pause or slow down animation
      } else {
        // Optionally resume animation
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
  
    const colors = [0x9b5de5, 0xf15bb5, 0xfee440, 0x00bbf9, 0x00f5d4]
  
    function createPlane(colors: number[]) {
      const geometry = new THREE.PlaneGeometry(1, 1.5)
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        map: new THREE.TextureLoader().load('/bg.jpg', (texture) => {
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
        }),
      })
      return new THREE.Mesh(geometry, material)
    }
  
    const dropImage = (startPosition: THREE.Vector3) => {
      const plane = createPlane(colors)
      plane.position.copy(startPosition)
      plane.scale.set(INITIAL_SCALE, INITIAL_SCALE, 1)
      // Set initial rotation to random values
      plane.rotation.set(
        Math.random() * Math.PI * 0.1 - Math.PI * 0.05, // Random x rotation between -0.05 and 0.05 radians
        Math.random() * Math.PI * 0.1 - Math.PI * 0.05, // Random y rotation between -0.05 and 0.05 radians
        0 // z rotation remains constant
      )
      scene.add(plane)
    
      const targetPosition = new THREE.Vector3(CENTER_OFFSET, CENTER_OFFSET, 0)
    
      gsap.fromTo(plane.position, 
        { x: startPosition.x, y: startPosition.y, z: startPosition.z },
        { 
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: DROP_DURATION,
          ease: 'power1.inOut',
          modifiers: {
            x: (x) => x * 1.5,
            y: (y) => y * 1.5,
          }
        }
      )
    
      gsap.fromTo(plane.scale, 
        { x: INITIAL_SCALE, y: INITIAL_SCALE },
        { 
          x: FINAL_SCALE,
          y: FINAL_SCALE,
          duration: DROP_DURATION,
          ease: 'power1.inOut'
        }
      )
    
      // Animate rotation to a more natural look
      gsap.fromTo(plane.rotation, 
        { x: plane.rotation.x, y: plane.rotation.y }, // Start from current random rotation
        { 
          x: plane.rotation.x + (Math.random() * Math.PI * 0.1 - Math.PI * 0.05), // Slightly change x rotation
          y: plane.rotation.y + (Math.random() * Math.PI * 0.1 - Math.PI * 0.05), // Slightly change y rotation
          duration: DROP_DURATION,
          ease: 'power1.inOut'
        }
      )
    
      gsap.fromTo(plane.material, 
        { opacity: 0 },
        { 
          opacity: 1,
          duration: FADE_DURATION,
          ease: 'power1.inOut'
        }
      )
    
      gsap.to(plane.material, {
        opacity: 0,
        duration: DROP_DURATION - FADE_DURATION,
        ease: 'power1.inOut',
        delay: FADE_DURATION,
        onComplete: () => {
          scene.remove(plane)
          plane.geometry.dispose()
          plane.material.dispose()
        },
      })
    }
    
  
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
  
    const addAndDropImages = () => {
      positions.forEach((position, index) => {
        setTimeout(() => {
          const startPosition = new THREE.Vector3(
            position.x,
            position.y,
            0
          )
          dropImage(startPosition)
        }, ADD_DROP_INTERVAL * index)
      })
    }
  
    addAndDropImages()
    setInterval(addAndDropImages, ADD_DROP_INTERVAL * NUM_GROUPS)
  
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
  
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])
  

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh' }} className='overflow-hidden bg-[#0b0b0b] relative'>
      <div className=' text-nowrap text-slate-300 absolute prompt-medium top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2   text-3xl md:text-4xl font-semibold text-center'>
       GK PHOTOGRPAHY <br />
        & FILMS
      </div>
    </div>
  )
}
