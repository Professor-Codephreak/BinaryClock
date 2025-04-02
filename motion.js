// motion.js
// Handles drag-to-rotate functionality for the 3D clock.
// License: BANKON
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    const cube = document.getElementById('interactive-cube'); // Rotatable element
    const container = document.querySelector('.showcase-container'); // Drag area

    // --- Basic Check ---
    if (!cube || !container) {
        console.error("Required elements for 3D rotation not found! Rotation disabled.");
        if(container) container.style.cursor = 'default'; // Remove grab cursor
        return; // Stop execution
    }

    // --- State Variables ---
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;
    const initialRotation = { x: -15, y: 30 }; // Initial view angle
    let currentRotation = { ...initialRotation };
    const sensitivity = 0.4; // Rotation speed
    const initialTransformStyle = `rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`;

    // Apply initial rotation
    cube.style.transform = initialTransformStyle;

    // --- Drag Logic (Applies rotation to #interactive-cube) ---
    const onMouseDown = (e) => {
        // Start drag if clicking on the background or the cube itself
        if (e.target === container || cube.contains(e.target)) {
            isDragging = true;
            previousX = e.clientX;
            previousY = e.clientY;
            container.style.cursor = 'grabbing';
            cube.style.transition = 'none'; // Disable transition during drag
            e.preventDefault();
        }
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousX;
        const deltaY = e.clientY - previousY;

        currentRotation.y += deltaX * sensitivity;
        currentRotation.x -= deltaY * sensitivity;
        currentRotation.x = Math.max(-90, Math.min(90, currentRotation.x)); // Clamp X

        cube.style.transform = `rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`;

        previousX = e.clientX;
        previousY = e.clientY;
    };

    const onMouseUpOrLeave = () => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = 'grab';
        cube.style.transition = ''; // Restore CSS transitions
    };

    // --- Event Listeners ---
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUpOrLeave);
    container.addEventListener('mouseleave', onMouseUpOrLeave);
    container.addEventListener('dragstart', (e) => e.preventDefault());

    console.log("3D Motion (rotation only) initialized.");

}); // End DOMContentLoaded
