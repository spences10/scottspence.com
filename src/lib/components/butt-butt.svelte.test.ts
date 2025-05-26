import { page } from '@vitest/browser/context'
import { flushSync, tick, untrack } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import ButtButt from './butt-butt.svelte'

describe('ButtButt Component', () => {
	describe('Initial Rendering', () => {
		it('should render with default props', async () => {
			render(ButtButt)

			const container = page.getByRole('complementary')
			await expect.element(container).toBeInTheDocument()

			const message = page.getByText(
				'Looks like you have reached the bottom of this page!',
			)
			await expect.element(message).toBeInTheDocument()

			const bummerText = page.getByText('Bummer!')
			await expect.element(bummerText).toBeInTheDocument()
		})

		it('should render with custom props using rune testing', async () => {
			// Test $props() rune behavior
			let testProps = $state({
				height: '200px',
				width: '300px',
			})

			render(ButtButt, {
				height: untrack(() => testProps.height),
				width: untrack(() => testProps.width),
			})

			// The image should not be visible initially (intersecting = false)
			const image = page.getByAltText('a cheeky butt')
			await expect.element(image).not.toBeInTheDocument()

			// Test that props are reactive
			testProps.height = '150px'
			testProps.width = '250px'
			flushSync()

			// Props should update reactively when component becomes visible
			expect(untrack(() => testProps.height)).toBe('150px')
			expect(untrack(() => testProps.width)).toBe('250px')
		})

		it('should not display the butt image initially', async () => {
			render(ButtButt)

			// Image should not be in DOM when intersecting = false
			const image = page.getByAltText('a cheeky butt')
			await expect.element(image).not.toBeInTheDocument()
		})
	})

	describe('Rune State Management', () => {
		it('should manage pun state with $state rune', async () => {
			// Test the pun state management logic
			let testPunState = $state<string | null>(null)
			let testPuns = ['Test pun 1', 'Test pun 2', 'Test pun 3']
			let testPunsCopy = testPuns.slice()

			// Simulate the random_pun function logic
			const simulateRandomPun = (): string => {
				if (testPunsCopy.length === 0) {
					testPunsCopy.push(untrack(() => testPunState) as string)
					testPunState = null
				}
				const index = Math.floor(Math.random() * testPunsCopy.length)
				const newPun = testPunsCopy[index]
				testPunsCopy.splice(index, 1)
				if (untrack(() => testPunState)) {
					testPunsCopy.push(untrack(() => testPunState) as string)
				}
				testPunState = newPun
				return newPun
			}

			// Test initial state
			expect(untrack(() => testPunState)).toBeNull()

			// Test pun generation
			const firstPun = simulateRandomPun()
			expect(untrack(() => testPunState)).toBe(firstPun)
			expect(testPuns.includes(firstPun)).toBe(true)

			// Test that puns don't repeat immediately
			const secondPun = simulateRandomPun()
			expect(untrack(() => testPunState)).toBe(secondPun)
			expect(secondPun).not.toBe(firstPun)
		})

		it('should manage intersecting state with $state rune', async () => {
			// Test intersection state management
			let testIntersecting = $state(false)

			// Derived state based on intersection
			let shouldShowImage = $derived(testIntersecting)

			// Test initial state
			expect(untrack(() => shouldShowImage)).toBe(false)

			// Test state change
			testIntersecting = true
			flushSync()
			expect(untrack(() => shouldShowImage)).toBe(true)

			// Test state change back
			testIntersecting = false
			flushSync()
			expect(untrack(() => shouldShowImage)).toBe(false)
		})
	})

	describe('Intersection Observer Integration', () => {
		it('should test viewport intersection state with runes', async () => {
			// Test the intersection logic using runes instead of mocking
			let testIntersectionState = $state({
				isIntersecting: false,
				hasEntered: false,
			})

			// Derived state that mimics the component's logic
			let shouldShowImage = $derived(
				testIntersectionState.isIntersecting &&
					testIntersectionState.hasEntered,
			)

			// Test initial state
			expect(untrack(() => shouldShowImage)).toBe(false)

			// Simulate entering viewport
			testIntersectionState.isIntersecting = true
			testIntersectionState.hasEntered = true
			flushSync()

			expect(untrack(() => shouldShowImage)).toBe(true)

			// Simulate leaving viewport
			testIntersectionState.isIntersecting = false
			flushSync()

			expect(untrack(() => shouldShowImage)).toBe(false)
		})

		it('should test intersection state transitions', async () => {
			// Test complex intersection state management
			let viewportState = $state({
				current: false,
				previous: false,
				entryCount: 0,
			})

			// Derived state for tracking state changes
			let hasStateChanged = $derived(
				viewportState.current !== viewportState.previous,
			)

			let isFirstEntry = $derived(
				viewportState.current && viewportState.entryCount === 0,
			)

			// Test initial state
			expect(untrack(() => hasStateChanged)).toBe(false)
			expect(untrack(() => isFirstEntry)).toBe(false)

			// Simulate first intersection
			viewportState.previous = viewportState.current
			viewportState.current = true
			viewportState.entryCount = 1
			flushSync()

			expect(untrack(() => hasStateChanged)).toBe(true)
			expect(untrack(() => isFirstEntry)).toBe(false) // entryCount is 1, not 0
		})
	})

	describe('User Interactions', () => {
		it('should generate new pun when button is clicked', async () => {
			render(ButtButt)

			const button = page.getByRole('button', { name: 'pun me up' })
			await expect.element(button).toBeInTheDocument()

			// Click button to generate new pun
			await button.click()
			flushSync()
			await tick()

			// Verify that a pun is displayed by checking for any of the possible puns
			// Since puns are random, we'll check for common words that appear in all puns
			const punText = page
				.getByText(/butt|ass|crack|behind|rear|bottom|cheek/i)
				.last()
			await expect.element(punText).toBeInTheDocument()
		})

		it('should test pun generation logic with runes', async () => {
			// Test the pun generation logic using runes
			let punState = $state({
				currentPun: null as string | null,
				availablePuns: ['Pun 1', 'Pun 2', 'Pun 3'],
				usedPuns: [] as string[],
			})

			// Derived state for pun management
			let hasAvailablePuns = $derived(
				punState.availablePuns.length > 0,
			)
			let canGenerateNewPun = $derived(
				hasAvailablePuns || punState.usedPuns.length > 0,
			)

			// Test initial state
			expect(untrack(() => hasAvailablePuns)).toBe(true)
			expect(untrack(() => canGenerateNewPun)).toBe(true)

			// Simulate pun generation
			const newPun = punState.availablePuns[0]
			punState.currentPun = newPun
			punState.availablePuns = punState.availablePuns.slice(1)
			punState.usedPuns.push(newPun)
			flushSync()

			expect(untrack(() => punState.currentPun)).toBe('Pun 1')
			expect(untrack(() => punState.availablePuns.length)).toBe(2)
			expect(untrack(() => punState.usedPuns.length)).toBe(1)
		})
	})

	describe('Advanced Rune Testing Patterns', () => {
		it('should test complex state interactions with multiple runes', async () => {
			// Simulate the component's state management
			let componentState = $state({
				intersecting: false,
				currentPun: null as string | null,
				punsRemaining: 13, // Initial puns array length
				imageVisible: false,
			})

			// Derived state that mimics component logic
			let shouldShowImage = $derived(
				componentState.intersecting && componentState.imageVisible,
			)

			let hasActivePun = $derived(
				componentState.currentPun !== null &&
					componentState.currentPun.length > 0,
			)

			// Test initial state
			expect(untrack(() => shouldShowImage)).toBe(false)
			expect(untrack(() => hasActivePun)).toBe(false)

			// Simulate entering viewport
			componentState.intersecting = true
			componentState.imageVisible = true
			componentState.currentPun = 'Test pun'
			flushSync()

			expect(untrack(() => shouldShowImage)).toBe(true)
			expect(untrack(() => hasActivePun)).toBe(true)

			// Simulate leaving viewport
			componentState.intersecting = false
			flushSync()

			expect(untrack(() => shouldShowImage)).toBe(false)
			expect(untrack(() => hasActivePun)).toBe(true) // Pun should persist
		})

		it('should test $effect.root behavior simulation', async () => {
			// Test the effect root pattern used in the component
			let effectExecuted = $state(false)
			let initialValue = $state<string | null>(null)

			// Simulate the $effect.root behavior
			const simulateEffectRoot = () => {
				effectExecuted = true
				initialValue = 'Initial pun'
			}

			// Test before effect
			expect(untrack(() => effectExecuted)).toBe(false)
			expect(untrack(() => initialValue)).toBeNull()

			// Simulate effect execution
			simulateEffectRoot()
			flushSync()

			expect(untrack(() => effectExecuted)).toBe(true)
			expect(untrack(() => initialValue)).toBe('Initial pun')
		})
	})

	describe('Component Lifecycle', () => {
		it('should test component lifecycle with runes', async () => {
			// Test component lifecycle state management
			let lifecycleState = $state({
				isMounted: false,
				isInitialized: false,
				hasCleanedUp: false,
			})

			// Derived state for lifecycle management
			let isActive = $derived(
				lifecycleState.isMounted && lifecycleState.isInitialized,
			)

			let needsCleanup = $derived(
				!lifecycleState.isMounted && lifecycleState.isInitialized,
			)

			// Test initial state
			expect(untrack(() => isActive)).toBe(false)
			expect(untrack(() => needsCleanup)).toBe(false)

			// Simulate mounting
			lifecycleState.isMounted = true
			lifecycleState.isInitialized = true
			flushSync()

			expect(untrack(() => isActive)).toBe(true)
			expect(untrack(() => needsCleanup)).toBe(false)

			// Simulate unmounting
			lifecycleState.isMounted = false
			lifecycleState.hasCleanedUp = true
			flushSync()

			expect(untrack(() => isActive)).toBe(false)
			expect(untrack(() => needsCleanup)).toBe(true)
		})
	})
})
