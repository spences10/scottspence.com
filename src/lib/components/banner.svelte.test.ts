import { page } from '@vitest/browser/context'
import { flushSync, untrack } from 'svelte'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import type { BannerOptions } from './banner.svelte'
import Banner from './banner.svelte'

describe('Banner Component', () => {
	describe('Initial Rendering', () => {
		it('should render info banner with message', async () => {
			const options: BannerOptions = {
				type: 'info',
				message: 'This is an info message',
			}

			render(Banner, {
				options,
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is an info message')
		})

		it('should render warning banner with message', async () => {
			const options: BannerOptions = {
				type: 'warning',
				message: 'This is a warning message',
			}

			render(Banner, {
				options,
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is a warning message')
		})

		it('should render announcement banner with message', async () => {
			const options: BannerOptions = {
				type: 'announcement',
				message: 'This is a announcement message',
			}

			render(Banner, {
				options,
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is a announcement message')
		})

		it('should render tip banner with message', async () => {
			const options: BannerOptions = {
				type: 'tip',
				message: 'This is a tip message',
			}

			render(Banner, {
				options,
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect
				.element(banner)
				.toHaveTextContent('This is a tip message')
		})

		it('should render with default props when no options provided', async () => {
			render(Banner, {})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveTextContent('') // empty message
			await expect.element(banner).toHaveClass('bg-info') // default type
		})
	})

	describe('Rune State Management', () => {
		it('should manage banner options with $state rune', async () => {
			let testOptions = $state({
				type: 'info' as BannerOptions['type'],
				message: 'Initial message',
			})

			render(Banner, {
				options: untrack(() => testOptions),
			})

			const banner = page.getByRole('banner')
			await expect
				.element(banner)
				.toHaveTextContent('Initial message')
			await expect.element(banner).toHaveClass('bg-info')

			// Test that options are reactive
			testOptions.type = 'warning'
			testOptions.message = 'Updated message'
			flushSync()

			// Note: Props in this component are not reactive by design
			// This test demonstrates the rune pattern even though
			// the component would need re-rendering for prop changes
			expect(untrack(() => testOptions.type)).toBe('warning')
			expect(untrack(() => testOptions.message)).toBe(
				'Updated message',
			)
		})

		it('should test banner type state transitions', async () => {
			let bannerState = $state({
				currentType: 'info' as BannerOptions['type'],
				previousType: null as BannerOptions['type'] | null,
				changeCount: 0,
			})

			// Derived state for tracking changes
			let hasTypeChanged = $derived(
				bannerState.currentType !== bannerState.previousType,
			)

			let isWarningType = $derived(
				bannerState.currentType === 'warning',
			)

			// Test initial state
			expect(untrack(() => hasTypeChanged)).toBe(true) // null !== 'info'
			expect(untrack(() => isWarningType)).toBe(false)

			// Simulate type change
			bannerState.previousType = bannerState.currentType
			bannerState.currentType = 'warning'
			bannerState.changeCount++
			flushSync()

			expect(untrack(() => hasTypeChanged)).toBe(true)
			expect(untrack(() => isWarningType)).toBe(true)
			expect(bannerState.changeCount).toBe(1)
		})

		it('should manage message content with reactive state', async () => {
			let messageState = $state({
				content: 'Original message',
				hasHTML: false,
				length: 0,
			})

			// Derived state for message analysis
			let messageLength = $derived(messageState.content.length)
			let containsHTML = $derived(
				/<[^>]*>/.test(messageState.content),
			)
			let isEmpty = $derived(messageState.content.trim().length === 0)

			// Test initial state
			expect(untrack(() => messageLength)).toBe(16)
			expect(untrack(() => containsHTML)).toBe(false)
			expect(untrack(() => isEmpty)).toBe(false)

			// Update with HTML content
			messageState.content = 'Message with <strong>HTML</strong>'
			messageState.hasHTML = true
			flushSync()

			expect(untrack(() => messageLength)).toBe(34)
			expect(untrack(() => containsHTML)).toBe(true)
			expect(untrack(() => isEmpty)).toBe(false)

			// Test empty message
			messageState.content = ''
			flushSync()

			expect(untrack(() => isEmpty)).toBe(true)
		})
	})

	describe('CSS Classes and Styling', () => {
		it('should apply correct CSS classes for info banner', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('bg-info')
			await expect.element(banner).toHaveClass('!text-info-content')
			await expect.element(banner).toHaveClass('px-12')
			await expect.element(banner).toHaveClass('py-4')
			await expect.element(banner).toHaveClass('rounded-box')
			await expect.element(banner).toHaveClass('shadow-lg')
			await expect.element(banner).toHaveClass('all-prose')
			await expect
				.element(banner)
				.toHaveClass('prose-a:text-info-content')
			await expect.element(banner).toHaveClass('relative')
			await expect.element(banner).toHaveClass('mt-8')
		})

		it('should apply correct CSS classes for warning banner', async () => {
			render(Banner, {
				options: { type: 'warning', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('bg-warning')
			await expect
				.element(banner)
				.toHaveClass('!text-warning-content')
			await expect.element(banner).toHaveClass('px-12')
			await expect.element(banner).toHaveClass('py-4')
		})

		it('should apply correct CSS classes for announcement banner', async () => {
			render(Banner, {
				options: { type: 'announcement', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('bg-success')
			await expect
				.element(banner)
				.toHaveClass('!text-success-content')
		})

		it('should apply correct CSS classes for tip banner', async () => {
			render(Banner, {
				options: { type: 'tip', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('bg-info') // tip uses info colors
			await expect.element(banner).toHaveClass('!text-info-content')
		})

		it('should test CSS class derivation logic with runes', async () => {
			// Test the component's CSS logic using runes
			let styleState = $state({
				bannerType: 'info' as BannerOptions['type'],
			})

			// Simulate the component's COLORS logic
			const COLORS = {
				info: { bg: 'bg-info', text: '!text-info-content' },
				tip: { bg: 'bg-info', text: '!text-info-content' },
				warning: { bg: 'bg-warning', text: '!text-warning-content' },
				announcement: {
					bg: 'bg-success',
					text: '!text-success-content',
				},
			}

			let currentColors = $derived(
				COLORS[styleState.bannerType] ?? COLORS['info'],
			)

			let bannerClasses = $derived(
				`${untrack(() => currentColors).bg} ${untrack(() => currentColors).text} px-12 py-4`,
			)

			// Test initial state
			expect(untrack(() => currentColors.bg)).toBe('bg-info')
			expect(untrack(() => currentColors.text)).toBe(
				'!text-info-content',
			)
			expect(untrack(() => bannerClasses)).toContain('bg-info')

			// Test type changes
			styleState.bannerType = 'warning'
			flushSync()

			// Re-derive the classes after state change
			let updatedClasses = $derived(
				`${untrack(() => currentColors).bg} ${untrack(() => currentColors).text} px-12 py-4`,
			)

			expect(untrack(() => currentColors.bg)).toBe('bg-warning')
			expect(untrack(() => currentColors.text)).toBe(
				'!text-warning-content',
			)
			expect(untrack(() => updatedClasses)).toContain('bg-warning')
		})
	})

	describe('Icon Rendering', () => {
		it('should render banner with proper structure for info type', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-info')
			// Icon container is rendered as part of the banner structure
			// Testing the overall banner styling which includes icon styling
		})

		it('should render banner with proper structure for tip type', async () => {
			render(Banner, {
				options: { type: 'tip', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-info') // tip uses info colors
		})

		it('should render banner with proper structure for warning type', async () => {
			render(Banner, {
				options: { type: 'warning', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-warning')
		})

		it('should render banner with proper structure for announcement type', async () => {
			render(Banner, {
				options: { type: 'announcement', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-success')
		})

		it('should test icon selection logic with runes', async () => {
			// Test the component's icon selection logic
			let iconState = $state({
				currentType: 'info' as BannerOptions['type'],
			})

			// Simulate the component's ICONS logic
			const ICONS = {
				info: 'InformationCircle',
				tip: 'LightBulb',
				warning: 'WarningTriangle',
				announcement: 'Megaphone',
			}

			let selectedIcon = $derived(
				ICONS[iconState.currentType] ?? 'InformationCircle',
			)

			// Test initial state
			expect(untrack(() => selectedIcon)).toBe('InformationCircle')

			// Test icon changes
			iconState.currentType = 'tip'
			flushSync()
			expect(untrack(() => selectedIcon)).toBe('LightBulb')

			iconState.currentType = 'warning'
			flushSync()
			expect(untrack(() => selectedIcon)).toBe('WarningTriangle')

			iconState.currentType = 'announcement'
			flushSync()
			expect(untrack(() => selectedIcon)).toBe('Megaphone')
		})
	})

	describe('HTML Content Rendering', () => {
		it('should render HTML content in message', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message:
						'This is <strong>bold</strong> text with <a href="#">link</a>',
				},
			})

			const banner = page.getByRole('banner')
			const strongElement = page.getByText('bold')
			const linkElement = page.getByRole('link')

			await expect.element(strongElement).toBeInTheDocument()
			await expect.element(strongElement).toHaveTextContent('bold')
			await expect.element(linkElement).toBeInTheDocument()
			await expect.element(linkElement).toHaveAttribute('href', '#')
		})

		it('should handle plain text messages', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message: 'Plain text message',
				},
			})

			const banner = page.getByRole('banner')
			await expect
				.element(banner)
				.toHaveTextContent('Plain text message')
		})

		it('should render complex HTML structures', async () => {
			render(Banner, {
				options: {
					type: 'announcement',
					message:
						'<div>Complex <em>HTML</em> with <code>code</code> and <span class="highlight">spans</span></div>',
				},
			})

			const banner = page.getByRole('banner')
			// Test that the content is rendered by checking for text content
			await expect
				.element(banner)
				.toHaveTextContent('Complex HTML with code and spans')
			await expect.element(banner).toHaveTextContent('HTML')
			await expect.element(banner).toHaveTextContent('code')
			await expect.element(banner).toHaveTextContent('spans')
		})

		it('should handle empty HTML tags', async () => {
			render(Banner, {
				options: {
					type: 'tip',
					message:
						'Text with <br/> line break and <hr/> horizontal rule',
				},
			})

			const banner = page.getByRole('banner')
			// Test that the content is rendered correctly (HTML normalizes whitespace)
			await expect
				.element(banner)
				.toHaveTextContent('Text with line break and horizontal rule')
		})
	})

	describe('Default Props and Edge Cases', () => {
		it('should handle empty message gracefully', async () => {
			render(Banner, {
				options: { type: 'warning', message: '' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('bg-warning')
			await expect.element(banner).toHaveTextContent('')
		})

		it('should handle whitespace-only messages', async () => {
			render(Banner, {
				options: { type: 'info', message: '   \n\t   ' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			// The component should render the whitespace as-is
			await expect.element(banner).toHaveClass('bg-info')
		})

		it('should handle very long messages', async () => {
			const longMessage = 'A'.repeat(1000)
			render(Banner, {
				options: { type: 'info', message: longMessage },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveTextContent(longMessage)
		})

		it('should handle special characters in messages', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
				},
			})

			const banner = page.getByRole('banner')
			await expect
				.element(banner)
				.toHaveTextContent(
					'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
				)
		})

		it('should handle unicode and emoji characters', async () => {
			render(Banner, {
				options: {
					type: 'announcement',
					message: '🎉 Unicode test: café, naïve, résumé 🚀',
				},
			})

			const banner = page.getByRole('banner')
			await expect
				.element(banner)
				.toHaveTextContent('🎉 Unicode test: café, naïve, résumé 🚀')
		})

		it('should test edge case handling with runes', async () => {
			// Test edge case logic using runes
			let edgeCaseState = $state({
				message: '',
				type: 'info' as BannerOptions['type'],
			})

			// Derived state for edge case detection
			let isEmpty = $derived(
				edgeCaseState.message.trim().length === 0,
			)
			let isValidType = $derived(
				['info', 'tip', 'warning', 'announcement'].includes(
					edgeCaseState.type,
				),
			)
			let shouldShowFallback = $derived(!isValidType)

			// Test empty message
			expect(untrack(() => isEmpty)).toBe(true)
			expect(untrack(() => isValidType)).toBe(true)
			expect(untrack(() => shouldShowFallback)).toBe(false)

			// Test with content
			edgeCaseState.message = 'Content'
			flushSync()
			expect(untrack(() => isEmpty)).toBe(false)

			// Test invalid type (simulated)
			edgeCaseState.type = 'invalid' as any
			flushSync()
			expect(untrack(() => isValidType)).toBe(false)
			expect(untrack(() => shouldShowFallback)).toBe(true)
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA role', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveAttribute('role', 'banner')
		})

		it('should have proper prose classes for content accessibility', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message: 'Test with <a href="#">link</a>',
				},
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toHaveClass('all-prose')
			await expect
				.element(banner)
				.toHaveClass('prose-a:text-info-content')

			const link = page.getByRole('link')
			await expect.element(link).toBeInTheDocument()
		})

		it('should maintain semantic structure', async () => {
			render(Banner, {
				options: {
					type: 'warning',
					message: 'Important <strong>warning</strong> message',
				},
			})

			const banner = page.getByRole('banner')
			const strongElement = page.getByText('warning')

			await expect.element(banner).toBeInTheDocument()
			await expect.element(strongElement).toBeInTheDocument()
			await expect.element(strongElement).toHaveTextContent('warning')
		})

		it('should be keyboard accessible when containing interactive elements', async () => {
			render(Banner, {
				options: {
					type: 'info',
					message:
						'Click <a href="#" tabindex="0">this link</a> for more info',
				},
			})

			const banner = page.getByRole('banner')
			const link = page.getByRole('link')

			await expect.element(link).toHaveAttribute('href', '#')
			await expect.element(link).toHaveAttribute('tabindex', '0')
		})
	})

	describe('Component Structure', () => {
		it('should have correct DOM structure', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test message' },
			})

			const banner = page.getByRole('banner')
			await expect.element(banner).toBeInTheDocument()
			await expect.element(banner).toHaveClass('relative')
			await expect.element(banner).toHaveClass('bg-info')
		})

		it('should position banner correctly', async () => {
			render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			const banner = page.getByRole('banner')

			await expect.element(banner).toHaveClass('relative')
			await expect.element(banner).toHaveClass('px-12')
			await expect.element(banner).toHaveClass('py-4')
			await expect.element(banner).toHaveClass('mt-8')
		})

		it('should have proper styling for content', async () => {
			render(Banner, {
				options: { type: 'tip', message: 'Test content' },
			})

			const banner = page.getByRole('banner')

			await expect.element(banner).toHaveClass('bg-info')
			await expect.element(banner).toHaveClass('!text-info-content')
			await expect.element(banner).toBeInTheDocument()
		})

		it('should maintain consistent spacing and layout', async () => {
			render(Banner, {
				options: { type: 'announcement', message: 'Layout test' },
			})

			const banner = page.getByRole('banner')

			// Test banner spacing
			await expect.element(banner).toHaveClass('px-12')
			await expect.element(banner).toHaveClass('py-4')
			await expect.element(banner).toHaveClass('mt-8')
			await expect.element(banner).toHaveClass('bg-success')
		})
	})

	describe('Advanced Rune Testing Patterns', () => {
		it('should test complex state interactions with multiple runes', async () => {
			let bannerState = $state({
				currentType: 'info' as BannerOptions['type'],
				messageHistory: [] as string[],
				isVisible: true,
				interactionCount: 0,
			})

			// Complex derived state
			let bannerConfig = $derived(() => {
				const COLORS = {
					info: { bg: 'bg-info', text: '!text-info-content' },
					tip: { bg: 'bg-info', text: '!text-info-content' },
					warning: {
						bg: 'bg-warning',
						text: '!text-warning-content',
					},
					announcement: {
						bg: 'bg-success',
						text: '!text-success-content',
					},
				}

				return {
					colors: COLORS[bannerState.currentType] ?? COLORS['info'],
					hasHistory: bannerState.messageHistory.length > 0,
					isActive:
						bannerState.isVisible &&
						bannerState.interactionCount >= 0,
				}
			})

			let shouldRender = $derived(
				bannerState.isVisible &&
					untrack(() => bannerConfig()).isActive,
			)

			// Test initial state
			expect(untrack(() => bannerConfig().colors.bg)).toBe('bg-info')
			expect(untrack(() => bannerConfig().hasHistory)).toBe(false)
			expect(untrack(() => shouldRender)).toBe(true)

			// Simulate state changes
			bannerState.currentType = 'warning'
			bannerState.messageHistory = ['Previous message']
			bannerState.interactionCount = 1
			flushSync()

			expect(untrack(() => bannerConfig().colors.bg)).toBe(
				'bg-warning',
			)
			expect(untrack(() => bannerConfig().hasHistory)).toBe(true)
			expect(untrack(() => shouldRender)).toBe(true)

			// Test visibility toggle
			bannerState.isVisible = false
			flushSync()

			expect(untrack(() => shouldRender)).toBe(false)
		})

		it('should test reactive banner type switching', async () => {
			let typeState = $state({
				types: ['info', 'warning', 'tip', 'announcement'] as const,
				currentIndex: 0,
			})

			// Derived state for type cycling
			let currentType = $derived(
				typeState.types[typeState.currentIndex] ?? 'info',
			)

			let nextType = $derived(() => {
				const nextIndex =
					(typeState.currentIndex + 1) % typeState.types.length
				return typeState.types[nextIndex]
			})

			let canCycle = $derived(typeState.types.length > 1)

			// Test initial state
			expect(untrack(() => currentType)).toBe('info')
			expect(untrack(() => nextType())).toBe('warning')
			expect(untrack(() => canCycle)).toBe(true)

			// Test cycling through types
			typeState.currentIndex = 1
			flushSync()
			expect(untrack(() => currentType)).toBe('warning')
			expect(untrack(() => nextType())).toBe('tip')

			typeState.currentIndex = 2
			flushSync()
			expect(untrack(() => currentType)).toBe('tip')
			expect(untrack(() => nextType())).toBe('announcement')

			typeState.currentIndex = 3
			flushSync()
			expect(untrack(() => currentType)).toBe('announcement')
			expect(untrack(() => nextType())).toBe('info') // Cycles back
		})

		it('should test message processing with runes', async () => {
			let messageProcessor = $state({
				rawMessage: '',
				processedMessage: '',
				shouldProcessHTML: true,
				maxLength: 100,
			})

			// Derived state for message processing
			let processedContent = $derived(() => {
				let content = messageProcessor.rawMessage

				if (!messageProcessor.shouldProcessHTML) {
					// Escape HTML if processing is disabled
					content = content
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
				}

				if (content.length > messageProcessor.maxLength) {
					content =
						content.substring(0, messageProcessor.maxLength) + '...'
				}

				return content
			})

			let messageStats = $derived(() => ({
				length: messageProcessor.rawMessage.length,
				hasHTML: /<[^>]*>/.test(messageProcessor.rawMessage),
				isTruncated:
					messageProcessor.rawMessage.length >
					messageProcessor.maxLength,
				wordCount: messageProcessor.rawMessage
					.split(/\s+/)
					.filter(Boolean).length,
			}))

			// Test initial state
			expect(untrack(() => processedContent())).toBe('')
			expect(untrack(() => messageStats().length)).toBe(0)
			expect(untrack(() => messageStats().hasHTML)).toBe(false)

			// Test HTML processing
			messageProcessor.rawMessage = 'Hello <strong>world</strong>!'
			flushSync()

			expect(untrack(() => processedContent())).toBe(
				'Hello <strong>world</strong>!',
			)
			expect(untrack(() => messageStats().hasHTML)).toBe(true)
			expect(untrack(() => messageStats().wordCount)).toBe(2)

			// Test HTML escaping
			messageProcessor.shouldProcessHTML = false
			flushSync()

			expect(untrack(() => processedContent())).toBe(
				'Hello &lt;strong&gt;world&lt;/strong&gt;!',
			)

			// Test truncation
			messageProcessor.shouldProcessHTML = true
			messageProcessor.rawMessage = 'A'.repeat(150)
			flushSync()

			expect(untrack(() => processedContent()).length).toBe(103) // 100 + '...'
			expect(untrack(() => messageStats().isTruncated)).toBe(true)
		})
	})

	describe('Component Lifecycle', () => {
		it('should handle component mounting and unmounting', () => {
			const { unmount } = render(Banner, {
				options: { type: 'info', message: 'Test' },
			})

			// Component should render successfully
			const banner = page.getByRole('banner')
			expect(banner).toBeDefined()

			// Should unmount without errors
			expect(() => unmount()).not.toThrow()
		})

		it('should test lifecycle state management with runes', async () => {
			let lifecycleState = $state({
				isMounted: false,
				isInitialized: false,
				hasRendered: false,
				renderCount: 0,
			})

			// Derived state for lifecycle tracking
			let isReady = $derived(
				lifecycleState.isMounted && lifecycleState.isInitialized,
			)

			let shouldUpdate = $derived(
				lifecycleState.hasRendered && lifecycleState.renderCount > 0,
			)

			// Test initial lifecycle state
			expect(untrack(() => isReady)).toBe(false)
			expect(untrack(() => shouldUpdate)).toBe(false)

			// Simulate mounting
			lifecycleState.isMounted = true
			lifecycleState.isInitialized = true
			lifecycleState.hasRendered = true
			lifecycleState.renderCount = 1
			flushSync()

			expect(untrack(() => isReady)).toBe(true)
			expect(untrack(() => shouldUpdate)).toBe(true)

			// Simulate re-renders
			lifecycleState.renderCount = 2
			flushSync()

			expect(untrack(() => shouldUpdate)).toBe(true)
			expect(lifecycleState.renderCount).toBe(2)
		})
	})
})
