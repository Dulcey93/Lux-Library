/*
*
* 	Horizontally.js v1.0 
*	https://github.com/MatthewBleUK/horizontally.js
*
*	@license released under GPL-3.0 for open source personal use. 
*	For commercial use please see the readme.
*
*   Copyright 2022 - Created by Matthew Bleathman
*
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.horizontally = factory());
})(this, (function () { 'use strict';

	var state = {
		sections: [],
		currentSection: '',
		currentIndex: '',
		nextSection: '',
		previousSection: '',
		isScrolling: false,
		currentLeftPos: 0,
		xTouchPos: 0,
		yTouchPos: 0
	};

	var defaultOptions = {
		wrapper: '#horizontally',
		speed: 200,
		arrowButtons: true,
		pageSelector: true
	};

	var options = {};

	// This function initializes the project
	function horizontally(userOptions) {

		// Sets the default options
		setOptions(defaultOptions);

		// Overrides default options with the user's options if available 
		setOptions(userOptions);

		// Creates an array of all the sections
		createSectionArray();

		// Sets the scrolling speed
		setScrollSpeed();

		// Adds event listeners for swiping on touch screen devices 
		document.addEventListener('touchstart', handleTouchStart, false);        
		document.addEventListener('touchmove', handleTouchMove, false);

		// Adds event listeners for scrolling
		document.addEventListener("mousewheel", userScrollInput, false);
		document.addEventListener("DOMMouseScroll", userScrollInput, false);

		// Adds resize event listener to window
		window.addEventListener('resize', handleWindowResize);

		// Creates the on page DOM elements depending on user's options
		if (options.arrowButtons) addArrowButtonsToDom();
		if (options.pageSelector) addPageSelectorsToDom();

		// Updates the state object
		updateState();

	}

	function setOptions(obj) {
		
		// Loops through key value pairs and adds or updates them to the options object
		for (let [key, value] of Object.entries(obj)) {

			// Wrapper needs to be stored as a DOM element
			key != "wrapper" ? options[key] = value : options[key] = document.querySelector(value);
		
		}

		// Error handling for incorrect wrapper option
		if (options.wrapper == null || options.wrapper == undefined || typeof options.wrapper != 'object') {

			throw new Error('Incorrect wrapper. Please check for spelling mistakes or take a look at the documentation example.');

		}
	}

	function addArrowButtonsToDom() {

		const leftArrowHTML = `
		<button class="arrow left">
			<svg width="40" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">
				<polyline points="30 10 10 30 30 50" stroke="#172529" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round" shape-rendering="geometricPrecision"></polyline>
			</svg>
		</button>
	`;

		const rightArrowHTML = `

		<button class="arrow right">
			<svg width="40" height="60" xmlns="http://www.w3.org/2000/svg" version="1.1">
				<polyline points="10 10 30 30 10 50" stroke="#172529" stroke-width="4" stroke-linecap="butt" fill="none" stroke-linejoin="round" shape-rendering="geometricPrecision"></polyline>
			</svg>
		</button>
	`;

		// Adds the left and right arrow button html after the wrapper
		options.wrapper.insertAdjacentHTML("afterend", `<div id="fixed-arrows">` + leftArrowHTML + rightArrowHTML + `</div>`);

		// Adds onclick listeners
		const leftArrow = document.querySelector('.arrow.left');
		const rightArrow = document.querySelector('.arrow.right');

		leftArrow.addEventListener('click', previousSection);
		rightArrow.addEventListener('click', nextSection);
		
	}

	function addPageSelectorsToDom() {

		let innerHTML = '';
		
		// Appends the innerHTML variable for each new section
		state.sections.forEach((element, index) => {

			// Adds active class to index[0] and custom data-index attribute to li tag
			innerHTML += `<li ${index == 0 ? 'class="active"' : ''} data-index="${index}"><span></span></li>`;

		});

		// Adds the circle page selector html after the wrapper
		options.wrapper.insertAdjacentHTML("afterend", `<div id="page-selector"><ul>` + innerHTML + `</ul></div>`);

		const selectorLi = document.querySelectorAll('#page-selector ul li');

		// Adds a click event listener to all page selector's li elements
		addClickListenerToNodes(selectorLi, handleSelectorsClick);

	}

	function addClickListenerToNodes(nodes, func) {
		
		// Iterates through each node and adds a click event listener.
		nodes.forEach(element => {
			
			element.addEventListener('click', func);

		});
		
	}

	function createSectionArray() {	

			const sections = document.querySelectorAll('.section');

			// If sections exist, push to state.sections array
			if (sections.length > 0) {

				// Add all DOM sections to state.sections array with the rest operator 
				state.sections.push(...sections);

			} else {

				// Error handling in case no sections were found
				throw new Error('Could not find correct section class. Please check for spelling mistakes or take a look at the documentation example.');

			}

	}

	function setScrollSpeed() {

		options.wrapper.style.transition = String(options.speed) + 'ms';

	}

	// Main function to update the state
	function updateState() {

		state.currentSection = getSectionInView();

		// Returns the index of state.currentSection
		state.currentIndex = state.sections.findIndex(index => index === state.currentSection); 

		/* Ternary operator: update next section in state object. 
		If user is on the last slide, assign to the first section else increment */
		state.nextSection = state.currentIndex === state.sections.length - 1 ? state.sections[0] : state.sections[state.currentIndex  + 1];

		/* Ternary operator: update previous section in state object. 
		If user is on the first slide, assign to the last section else decrement */
		state.previousSection = state.currentIndex === 0 ? state.sections[state.sections.length - 1] : state.sections[state.currentIndex  - 1];

		if(options.pageSelector == true) {

			const pageSelectors = document.querySelectorAll('#page-selector ul li');

			addActiveClassToList(pageSelectors);
			
		} 

	}

	function getSectionInView() {

		let currentSection,
			wrapperRect = options.wrapper.getBoundingClientRect(),
			wrapperXPos = Math.abs(wrapperRect.x);	// Math.abs on a negative number returns a positive number

		// Iterates through each section
		state.sections.forEach(section => {

			const left = section.offsetLeft, 
				  width = section.clientWidth, 
				  numOfSections = state.sections.length;

			/* Finds which section the wrapper's scroll positioning is on by subtracting the section's offset left pixel
		 	to the client width and dividing by the number of sections and comparing it to the wrapper x position (if larger). 
			Last section to fit this criteria is the current section in viewport */ 
			if (wrapperXPos > left - width / numOfSections + 1) {

				currentSection = section;

			}

		});

		return currentSection;

	}

	function addActiveClassToList(element) {

		element.forEach(item => {
			item.classList.remove('active');
		});

		element[state.currentIndex].classList.add('active'); 

	}

	function handleSelectorsClick(e) {

		e.preventDefault(); 

		// Gets the section index from the li circle page selector data-index attribute
		const index = this.getAttribute('data-index'); 

		scroll(state.sections[index]);
		
	}

	// Handles window resize
	function handleWindowResize() {

		// Waits 500ms and then scrolls to current section
		// Future improvements: Wait until user has stopped resizing by comparing the left x position and then scroll
		
		setTimeout(() => {

			scroll(state.currentSection);

		}, 500);

	}

	/* The following three functions handles the user touch swipe input and was modified from givanse's answer.
	   Credits: https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android */

	function getTouches(e) {

		return e.touches;

	}                                                     
	                                                                         
	function handleTouchStart(e) {

	    const firstTouch = getTouches(e)[0];  

		// Stores the first touch position on the x and y axis 
	    state.xTouchPos = firstTouch.clientX;                                      
	    state.yTouchPos = firstTouch.clientY;      

	}                                                                         
	function handleTouchMove(e) {

	    if (!state.xTouchPos || !state.yTouchPos) { return; }

	    const xUp = e.touches[0].clientX,
			  yUp = e.touches[0].clientY;

		// Stores the difference the user swiped in each direction 
	    const xDiff = state.xTouchPos - xUp,
	    	  yDiff = state.yTouchPos - yUp;
		
		// Compares the results to find out which axis direction was larger
	    if (Math.abs(xDiff) > Math.abs(yDiff)) { 
			
			xDiff > 0 ? nextSection() : previousSection(); 

	    } else {

			yDiff > 0 ? nextSection() : previousSection();     

	    }     
		
		// Resets values
		state.xTouchPos = 0;                                                        
		state.yTouchPos = 0;

	}
	// Handles user scroll input
	function userScrollInput(e) {
		
		if(!state.isScrolling) {

			// > 50 and < -50 is good amount of scroll input for new and older track pad devices
			if (e.deltaY > 50 || e.deltaY < -50) {	

				// Go to next section if the user scrolls up else go to previous section
				isScrollUp(e) ? nextSection() : previousSection();

			} 

		}

	}

	// Returns true if user is scrolling up
	function isScrollUp(e) {

		// DeltaY represents the event vertical (Y axis) scroll amount
		if(e.deltaY > 0) {

			return true;

		}

	}

	function previousSection() {
			
		scroll(state.previousSection);
		
	}

	function nextSection() {
			
		scroll(state.nextSection);

	}

	function scroll(destination) {

		if(!state.isScrolling) {

			state.isScrolling = true;

			const pixel = destination.offsetLeft;

			/* The scroll function works by updating the transform: translate3d tx value. 
			CSS transition in horizontally.css handles the speed */
			options.wrapper.style.transform = `translate3d(-${pixel}px, 0px, 0px)`;	

			setTimeout(() => {

				state.isScrolling = false;

				updateState();
				
			}, options.speed + 50);		// Waits until scroll is over + 50ms to call update state
		}
	}

	return horizontally;

}));
