# Migration Plan: Tailwind CSS v3 to v4 and DaisyUI v4 to v5

## 1. Tailwind CSS v4 Changes

### Configuration Changes

- Move from `tailwind.config.js` to CSS-based configuration
- Current configuration in app.css is already using the new syntax
  with `@plugin` directives
- No major changes needed for Tailwind configuration

### Breaking Changes to Address

- Default ring width changed from 3px to 1px
- Default ring color changed from blue-500 to currentColor
- Default border color updates
- Preflight CSS modifications

## 2. DaisyUI v5 Changes

### Theme System Updates

- Current theme variables in app.css need updating to new format:
  - Update color variable names (e.g., `--p` to `--color-primary`)
  - Add new effect variables if desired:
    - `--depth` for subtle depth effects
    - `--noise` for texture effects

### Component Class Updates

#### Form Controls

Found in:

- src/lib/components/newsletter-signup/signup-form.svelte
- src/lib/components/contact-form/contact-form-fields.svelte
- src/routes/tags/+page.svelte

Changes needed:

- Replace `form-control` with new `fieldset` component
- Update label syntax to use new format
- Consider using new `validator` component for form validation

#### Labels

Found across multiple components:

- Update label implementation to use new DaisyUI v5 syntax
- Consider using new floating label feature where appropriate
- Ensure proper accessibility with label associations

### New Features to Consider Implementing

1. New Components Available:

   - Status indicators
   - Filter components
   - Calendar integration
   - Validator for form validation
   - List component for vertical layouts

2. Style Improvements:
   - New `soft` and `dash` variants for buttons and badges
   - Improved size scale with new `xl` size modifier
   - Better responsive modifiers support

## 3. Action Items

### High Priority

1. Update app.css:

   - Revise theme configuration syntax
   - Update color variable names
   - Add new effect variables if desired

2. Component Updates:
   - Replace deprecated `form-control` with `fieldset`
   - Update label implementations
   - Review and update any custom components using DaisyUI classes

### Medium Priority

1. Form Enhancements:

   - Implement new validator component
   - Consider floating labels where appropriate
   - Add new form-related components where beneficial

2. Style Improvements:
   - Add `soft` and `dash` variants where appropriate
   - Implement `xl` size variants where needed
   - Review and update component sizes for consistency

### Low Priority

1. New Features:
   - Evaluate and implement new DaisyUI v5 components where beneficial
   - Consider adding status indicators
   - Explore calendar integration if needed

## 4. Testing Strategy

1. Visual Regression:

   - Test all components in light and dark modes
   - Verify responsive behavior
   - Check form interactions

2. Functionality:

   - Verify form submissions
   - Test all interactive components
   - Ensure accessibility is maintained

3. Performance:
   - Monitor bundle size
   - Check for any CSS specificity issues
   - Verify load times

## 5. Rollback Plan

1. Keep backup of current working configuration
2. Document all changes made
3. Test thoroughly in development before deploying
4. Consider gradual rollout of changes

## 6. Future Considerations

1. Monitor for any bug fixes in DaisyUI v5 final release
2. Keep updated with Tailwind CSS v4 changes during beta
3. Plan for implementing additional features as needed
