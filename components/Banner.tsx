'use client'
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

const CIRCLE_RADIUS = 8
const NUM_GROUPS = 6
const IMAGES_PER_GROUP = 6
const DROP_DURATION = 3
const INITIAL_SCALE = 1.5
const FINAL_SCALE = 0.5
const STACK_SPACING = 0.2
const STACK_ROTATION = Math.PI / 18
const FADE_DURATION = 1

export default function Banner() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 10

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Create image groups
    const groups: THREE.Group[] = []
    const colors = [0x9b5de5, 0xf15bb5, 0xfee440, 0x00bbf9, 0x00f5d4]
    const groupQueues: THREE.Mesh[][] = [] // Store queues for each group

    for (let i = 0; i < NUM_GROUPS; i++) {
      const group = new THREE.Group()
      const angle = (i / NUM_GROUPS) * Math.PI * 2
      group.position.set(
        Math.cos(angle) * CIRCLE_RADIUS,
        Math.sin(angle) * CIRCLE_RADIUS,
        0
      )
      group.rotation.z = angle + Math.PI / 36

      scene.add(group)
      groups.push(group)
      groupQueues.push([]) // Initialize the queue for this group

      // Add stacked planes to each group
      for (let j = 0; j < IMAGES_PER_GROUP; j++) {
        const geometry = new THREE.PlaneGeometry(1, 1.5)
        const material = new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.7, // Initial opacity
          side: THREE.DoubleSide,
          map: new THREE.TextureLoader().load('/bg.jpg', (texture) => {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
          }),
        })
        const plane = new THREE.Mesh(geometry, material)

        // Stack the images with slight Y-axis offset and rotation
        plane.position.set(0, j * STACK_SPACING, 0)
        plane.rotation.z = STACK_ROTATION * j
        plane.scale.set(INITIAL_SCALE, INITIAL_SCALE, 1)
        group.add(plane)

        // Add the plane to the group queue
        groupQueues[i].push(plane as THREE.Mesh)
      }
    }

    // Function to drop images from groups
    const dropImages = () => {
      groups.forEach((group, groupIndex) => {
        const queue = groupQueues[groupIndex]
        if (queue.length > 0) {
          const plane = queue.shift() // Remove the first plane from the queue

          // Animate the plane dropping to the center
          if (plane) {
            // Fade in the new plane
            gsap.fromTo(plane.material, 
              { opacity: 0 },
              { opacity: 0.7, duration: FADE_DURATION }
            )
            
            // Drop the image and scale it down
            gsap.to(plane.position, {
              y: 0,
              duration: DROP_DURATION,
              ease: 'power1.inOut',
              onUpdate: () => {
                // Rotate image slightly during the drop
                plane.rotation.z += 0.01
              },
              onComplete: () => {
                // Fade out and remove the plane after dropping
                gsap.to(plane.material, {
                  opacity: 0,
                  duration: FADE_DURATION,
                  onComplete: () => {
                    group.remove(plane)
                  },
                })
              },
            })

            // Scale down the plane during the drop
            gsap.to(plane.scale, {
              x: FINAL_SCALE,
              y: FINAL_SCALE,
              duration: DROP_DURATION,
              ease: 'power1.inOut',
            })
          }
        }
      })
    }

    // Continuously add new images to groups and drop them
    const addAndDropImages = () => {
      groups.forEach((group, groupIndex) => {
        const queue = groupQueues[groupIndex]

        // Create a new plane
        const geometry = new THREE.PlaneGeometry(1, 1.5)
        const material = new THREE.MeshBasicMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0, // Start with 0 opacity for fade-in effect
          side: THREE.DoubleSide,
          map: new THREE.TextureLoader().load('/bg.jpg', (texture) => {
            texture.minFilter = THREE.LinearFilter
            texture.magFilter = THREE.LinearFilter
          }),
        })
        const plane = new THREE.Mesh(geometry, material)

        // Position the new plane at the opposite end of the group
        plane.position.set(0, queue.length * STACK_SPACING, 0)
        plane.rotation.z = STACK_ROTATION * queue.length
        plane.scale.set(INITIAL_SCALE, INITIAL_SCALE, 1)
        group.add(plane)

        // Add the plane to the group queue
        queue.push(plane as THREE.Mesh)

        // Fade in the new plane
        gsap.to(plane.material, {
          opacity: 0.7,
          duration: FADE_DURATION,
        })
      })

      // Drop images after adding new ones
      dropImages()
    }

    // Set interval to continuously add and drop images
    setInterval(addAndDropImages, DROP_DURATION * 1000)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
}
